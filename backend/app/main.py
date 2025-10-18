import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.settings import get_settings
from backend.app.db.session import init_db


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(title=settings.APP_NAME)

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )

    # Events
    @app.on_event("startup")
    def _startup() -> None:
        # Inicialización mínima de tablas (MVP).
        # En producción, usar migraciones (Alembic).
        init_db()

    # Health
    @app.get("/health")
    def health():
        return {"ok": True, "env": "dev", "app": settings.APP_NAME}

    # Routers
    from backend.app.api.routers import auth as auth_router
    from backend.app.api.routers import chatkit as chatkit_router
    from backend.app.api.routers import profiles as profiles_router
 
    app.include_router(auth_router.router, prefix="/api/auth", tags=["auth"])
    app.include_router(chatkit_router.router, prefix="/api/chatkit", tags=["chatkit"])
    app.include_router(profiles_router.router, prefix="/api/profiles", tags=["profiles"])
 
    return app


# FastAPI instance
app = create_app()