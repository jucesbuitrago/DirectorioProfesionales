import datetime as dt
from typing import Optional, Dict, Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from backend.app.core.settings import get_settings

# Password hashing context
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return _pwd_context.hash(password)


def create_access_token(
    subject: str,
    extra_claims: Optional[Dict[str, Any]] = None,
    expires_minutes: Optional[int] = None,
) -> str:
    """
    Creates a signed JWT with provided subject and optional extra claims.
    """
    settings = get_settings()
    to_encode: Dict[str, Any] = {}
    if extra_claims:
        to_encode.update(extra_claims)

    exp_minutes = expires_minutes if expires_minutes is not None else settings.ACCESS_TOKEN_EXPIRE_MINUTES
    expire = dt.datetime.now(dt.timezone.utc) + dt.timedelta(minutes=exp_minutes)
    to_encode.update({"sub": subject, "exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALG)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies and decodes a JWT. Returns payload or None if invalid/expired.
    """
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        return payload
    except JWTError:
        return None