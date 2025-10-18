from typing import Optional
from sqlalchemy.orm import Session

from backend.app.models.user import User


class UserRepository:
    """
    Acceso a datos para la entidad User.
    """

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_id(db: Session, user_id: str) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def create(
        db: Session,
        *,
        email: str,
        password_hash: str,
        full_name: Optional[str] = None,
        phone: Optional[str] = None,
        city: Optional[str] = None,
        is_professional: bool = False,
    ) -> User:
        user = User(
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            phone=phone,
            city=city,
            is_professional=bool(is_professional),
        )
        db.add(user)
        # flush para materializar user.id sin commit
        db.flush()
        return user