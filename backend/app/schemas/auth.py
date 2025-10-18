from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from backend.app.schemas.user import UserOut
from backend.app.schemas.professional import ProfessionalProfileIn, ProfessionalProfileOut


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None

    # Toggle de UI: "Ofrecer mi servicio"
    is_professional: bool = False

    # Si es profesional, se requiere este bloque
    professional: Optional[ProfessionalProfileIn] = None


class RegisterResponse(BaseModel):
    user: UserOut
    professional: Optional[ProfessionalProfileOut] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut