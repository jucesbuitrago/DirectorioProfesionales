from typing import Generator, Optional
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.db.session import get_db as _get_db
from backend.app.core.security import decode_access_token
from backend.app.repositories.users import UserRepository
from backend.app.models.user import User


def get_db() -> Generator[Session, None, None]:
    """
    Dependencia estándar para inyectar la sesión de BD en routers/services.
    """
    yield from _get_db()


def get_current_user(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> User:
    """
    Extrae y valida el usuario actual a partir del header Authorization: Bearer <token>.
    Lanza 401 si el token es inválido o el usuario no existe.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Falta token Bearer")

    token = authorization.split(" ", 1)[1].strip()
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    user_id = str(payload["sub"])
    user = UserRepository.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")

    return user