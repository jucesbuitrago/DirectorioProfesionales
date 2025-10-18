from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db
from backend.app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    TokenResponse,
)
from backend.app.schemas.user import user_to_out
from backend.app.schemas.professional import prof_to_out
from backend.app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=RegisterResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user, prof = AuthService.register(db, body)
        # Commit de la transacción al final del caso de uso
        db.commit()
        return RegisterResponse(user=user_to_out(user), professional=prof_to_out(prof))
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    try:
        token, user = AuthService.login(db, body)
        return TokenResponse(access_token=token, user=user_to_out(user))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(ve))