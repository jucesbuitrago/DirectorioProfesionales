from typing import Dict

from backend.app.integrations.openai_vector_store import add_or_update_professional as _vs_add_or_update
from backend.app.integrations.openai_vector_store import remove_professional as _vs_remove


class VectorStoreService:
    """
    Fachada de servicios sobre el Vector Store.
    Permite reemplazar o mockear en tests sin tocar routers/services de dominio.
    """

    @staticmethod
    def add_or_update_professional(doc: Dict, prof_id: str) -> str:
        """
        Sube/actualiza un documento de profesional y espera indexación.
        Retorna el OpenAI File ID subyacente.
        """
        return _vs_add_or_update(doc, prof_id)

    @staticmethod
    def remove_professional(prof_id: str) -> bool:
        """
        Elimina el documento de un profesional (por metadata prof_id).
        """
        return _vs_remove(prof_id)