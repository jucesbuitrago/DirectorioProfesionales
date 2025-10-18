import io
import json
import time
from typing import Dict

from openai import OpenAI  # type: ignore[import-not-found]

from backend.app.core.settings import get_settings


def _get_client() -> OpenAI:
    settings = get_settings()
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY no configurado")
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def _get_vs_id() -> str:
    settings = get_settings()
    if not settings.VECTOR_STORE_ID:
        raise RuntimeError("VECTOR_STORE_ID no configurado")
    return settings.VECTOR_STORE_ID


def _poll_file_index(client: OpenAI, vector_store_id: str, file_id: str, timeout_s: int = 120) -> str:
    """
    Espera hasta que el archivo esté indexado (status completed/error/timeout).
    """
    start = time.time()
    while True:
        item = client.vector_stores.files.retrieve(
            vector_store_id=vector_store_id,
            file_id=file_id,
        )
        status = getattr(item, "status", None) or (item.get("status") if isinstance(item, dict) else None)
        if status in ("completed", "error"):
            return status
        if time.time() - start > timeout_s:
            return "timeout"
        time.sleep(1.0)


def add_or_update_professional(prof: Dict, prof_id: str) -> str:
    """
    Crea/actualiza un profesional en el Vector Store como archivo independiente.
    prof: dict con campos (nombre_completo, profesion_principal, ciudad, etc.)
    prof_id: identificador propio de tu BD (ej. UUID)
    Returns: OpenAI File ID (subyacente) cuando la indexación complete.
    """
    client = _get_client()
    vs_id = _get_vs_id()

    # 1) Elimina versión previa si existiera
    try:
        files = client.vector_stores.files.list(vector_store_id=vs_id)
        for f in files.data:
            # Preferir coincidencia por nombre de archivo; fallback a metadata si existe
            try:
                finfo = client.files.retrieve(f.id)
                fname = getattr(finfo, "filename", None) or (finfo.get("filename") if isinstance(finfo, dict) else None)
            except Exception:
                fname = None
            md = getattr(f, "metadata", {}) or {}
            if (fname == f"prof_{prof_id}.json") or (md.get("prof_id") == prof_id):
                client.vector_stores.files.delete(vector_store_id=vs_id, file_id=f.id)
                # borrar File subyacente (opcional)
                try:
                    client.files.delete(f.id)
                except Exception:
                    pass
    except Exception:
        # Ignorar errores de limpieza
        pass

    # 2) Crea el contenido JSON (puede ser JSONL si quieres múltiples registros)
    blob = json.dumps(prof, ensure_ascii=False).encode("utf-8")
    bio = io.BytesIO(blob)
    bio.name = f"prof_{prof_id}.json"  # nombre para el upload

    # 3) Sube el File al proyecto (sin metadata; el SDK no lo acepta en files.create)
    up = client.files.create(
        file=bio,
        purpose="assistants",
    )

    # 4) Adjunta el File al Vector Store
    vsf = client.vector_stores.files.create(
        vector_store_id=vs_id,
        file_id=up.id,
    )

    # 5) Espera indexación
    status = _poll_file_index(client, vs_id, vsf.id)
    if status != "completed":
        raise RuntimeError(f"Indexación falló/expiró: {status}")

    return up.id


def remove_professional(prof_id: str) -> bool:
    """
    Borra el archivo de ese profesional del Vector Store (y opcionalmente el File).
    Returns True si eliminó al menos un archivo asociado al prof_id.
    """
    client = _get_client()
    vs_id = _get_vs_id()

    files = client.vector_stores.files.list(vector_store_id=vs_id)
    ok = False
    for f in files.data:
        # Preferir coincidencia por nombre; fallback a metadata si estuviera disponible
        try:
            finfo = client.files.retrieve(f.id)
            fname = getattr(finfo, "filename", None) or (finfo.get("filename") if isinstance(finfo, dict) else None)
        except Exception:
            fname = None
        md = getattr(f, "metadata", {}) or {}
        if (fname == f"prof_{prof_id}.json") or (md.get("prof_id") == prof_id):
            client.vector_stores.files.delete(vector_store_id=vs_id, file_id=f.id)
            try:
                client.files.delete(f.id)
            except Exception:
                pass
            ok = True
    return ok