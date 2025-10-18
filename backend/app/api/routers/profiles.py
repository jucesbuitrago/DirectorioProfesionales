from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db, get_current_user
from backend.app.models.user import User
from backend.app.repositories.professionals import ProfessionalRepository
from backend.app.schemas.professional import (
    ProfessionalProfileOut,
    ProfessionalProfileIn,
    prof_to_out,
)
from backend.app.services.vector_store_service import VectorStoreService

router = APIRouter()


@router.get("/me", response_model=ProfessionalProfileOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Devuelve el perfil profesional del usuario autenticado.
    404 si no existe perfil (no profesional).
    """
    prof = ProfessionalRepository.get_by_user_id(db, current_user.id)
    if not prof:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil no encontrado")
    out = prof_to_out(prof)
    if not out:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error al serializar perfil")
    return out


@router.put("/me", response_model=ProfessionalProfileOut)
def upsert_my_profile(
    body: ProfessionalProfileIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Crea o actualiza el perfil profesional del usuario autenticado.
    - Normaliza campos (profesión/ciudad)
    - Reindexa sincrónicamente en el Vector Store (devuelve 500 si la indexación falla)
    """
    profesion_normalizada = body.profesion_principal.strip().lower() if body.profesion_principal else None
    ciudad_normalizada = body.ciudad.strip().lower() if body.ciudad else None

    prof = ProfessionalRepository.get_by_user_id(db, current_user.id)
    created = False
    if not prof:
        # Crear perfil si no existía
        prof = ProfessionalRepository.create(
            db,
            user_id=current_user.id,
            nombre_completo=body.nombre_completo,
            profesion_principal=body.profesion_principal,
            ciudad=body.ciudad,
            barrio=body.barrio,
            telefono=body.telefono,
            email=body.email if body.email else current_user.email,
            descripcion_breve=body.descripcion_breve,
            profesion_normalizada=profesion_normalizada,
            ciudad_normalizada=ciudad_normalizada,
        )
        created = True
    else:
        # Actualizar campos existentes
        from backend.app.repositories.professionals import ProfessionalRepository as _PR
        _PR.update(
            db,
            prof,
            nombre_completo=body.nombre_completo,
            profesion_principal=body.profesion_principal,
            ciudad=body.ciudad,
            barrio=body.barrio,
            telefono=body.telefono,
            email=body.email if body.email else current_user.email,
            descripcion_breve=body.descripcion_breve,
            profesion_normalizada=profesion_normalizada,
            ciudad_normalizada=ciudad_normalizada,
        )

    # Reindexar en Vector Store (sincrónico para consistencia)
    from backend.app.schemas.professional import build_prof_json_for_vector_store
    doc = build_prof_json_for_vector_store(prof, user_id=current_user.id)
    try:
        file_id = VectorStoreService.add_or_update_professional(doc, prof_id=prof.id)
        from backend.app.repositories.professionals import ProfessionalRepository as _PR2
        _PR2.update(db, prof, vector_store_file_id=file_id)
        db.commit()
    except Exception as e:
        db.rollback()
        # Si se creó el perfil nuevo y falla el indexing, el perfil quedará sin vector_store_file_id
        # pero mantenemos consistencia devolviendo error; el cliente puede reintentar.
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Indexación falló: {str(e)}")

    out = prof_to_out(prof)
    if not out:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error al serializar perfil")
    return out