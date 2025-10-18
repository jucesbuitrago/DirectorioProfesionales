from typing import Optional, Tuple

from sqlalchemy.orm import Session

from backend.app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)
from backend.app.models.user import User
from backend.app.models.professional import ProfessionalProfile
from backend.app.repositories.users import UserRepository
from backend.app.repositories.professionals import ProfessionalRepository
from backend.app.schemas.auth import RegisterRequest, LoginRequest
from backend.app.schemas.professional import build_prof_json_for_vector_store
from backend.app.services.vector_store_service import VectorStoreService


class AuthService:
    """
    Lógica de autenticación y registro de usuarios/profesionales.
    """

    @staticmethod
    def register(db: Session, payload: RegisterRequest) -> Tuple[User, Optional[ProfessionalProfile]]:
        # 1) Email único
        existing = UserRepository.get_by_email(db, payload.email)
        if existing:
            raise ValueError("Email ya registrado")

        # 2) Crear usuario
        user = UserRepository.create(
            db,
            email=payload.email,
            password_hash=get_password_hash(payload.password),
            full_name=payload.full_name,
            phone=payload.phone,
            city=payload.city,
            is_professional=bool(payload.is_professional),
        )

        prof_obj: Optional[ProfessionalProfile] = None

        # 3) Si es profesional, crear perfil + indexar en Vector Store
        if payload.is_professional:
            if not payload.professional:
                raise ValueError("Faltan datos del profesional (campo 'professional')")

            p_in = payload.professional
            profesion_normalizada = (
                p_in.profesion_principal.strip().lower() if p_in.profesion_principal else None
            )
            ciudad_normalizada = p_in.ciudad.strip().lower() if p_in.ciudad else None

            prof_obj = ProfessionalRepository.create(
                db,
                user_id=user.id,
                nombre_completo=p_in.nombre_completo,
                profesion_principal=p_in.profesion_principal,
                ciudad=p_in.ciudad,
                barrio=p_in.barrio,
                telefono=p_in.telefono,
                email=p_in.email if p_in.email else payload.email,  # fallback
                descripcion_breve=p_in.descripcion_breve,
                profesion_normalizada=profesion_normalizada,
                ciudad_normalizada=ciudad_normalizada,
            )

            # Construir documento y subir a Vector Store (sincrónico para consistencia)
            doc = build_prof_json_for_vector_store(prof_obj, user_id=user.id)
            file_id = VectorStoreService.add_or_update_professional(doc, prof_id=prof_obj.id)
            prof_obj.vector_store_file_id = file_id

        return user, prof_obj

    @staticmethod
    def login(db: Session, payload: LoginRequest) -> Tuple[str, User]:
        user = UserRepository.get_by_email(db, payload.email)
        if not user or not verify_password(payload.password, user.password_hash):
            raise ValueError("Credenciales inválidas")

        token = create_access_token(
            subject=user.id,
            extra_claims={"email": user.email, "is_professional": user.is_professional},
        )
        return token, user