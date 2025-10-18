from typing import Optional
from sqlalchemy.orm import Session

from backend.app.models.professional import ProfessionalProfile


class ProfessionalRepository:
    """
    Acceso a datos para la entidad ProfessionalProfile.
    """

    @staticmethod
    def get_by_user_id(db: Session, user_id: str) -> Optional[ProfessionalProfile]:
        return db.query(ProfessionalProfile).filter(ProfessionalProfile.user_id == user_id).first()

    @staticmethod
    def create(
        db: Session,
        *,
        user_id: str,
        nombre_completo: str,
        profesion_principal: str,
        ciudad: Optional[str] = None,
        barrio: Optional[str] = None,
        telefono: Optional[str] = None,
        email: Optional[str] = None,
        descripcion_breve: Optional[str] = None,
        profesion_normalizada: Optional[str] = None,
        ciudad_normalizada: Optional[str] = None,
    ) -> ProfessionalProfile:
        prof = ProfessionalProfile(
            user_id=user_id,
            nombre_completo=nombre_completo,
            profesion_principal=profesion_principal,
            ciudad=ciudad,
            barrio=barrio,
            telefono=telefono,
            email=email,
            descripcion_breve=descripcion_breve,
            profesion_normalizada=profesion_normalizada,
            ciudad_normalizada=ciudad_normalizada,
        )
        db.add(prof)
        db.flush()
        return prof

    @staticmethod
    def update(
        db: Session,
        prof: ProfessionalProfile,
        **fields,
    ) -> ProfessionalProfile:
        """
        Actualiza los campos del perfil profesional y hace flush.
        """
        for k, v in fields.items():
            setattr(prof, k, v)
        db.flush()
        return prof