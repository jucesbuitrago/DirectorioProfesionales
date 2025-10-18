from typing import Optional, Any
from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    is_professional: bool


def user_to_out(u: Any) -> UserOut:
    return UserOut(
        id=u.id,
        email=u.email,
        full_name=getattr(u, "full_name", None),
        phone=getattr(u, "phone", None),
        city=getattr(u, "city", None),
        is_professional=bool(getattr(u, "is_professional", False)),
    )