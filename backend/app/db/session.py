from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from backend.app.core.settings import get_settings
from backend.app.db.base import Base, import_models

# Load settings
settings = get_settings()

# Engine and session factory
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a SQLAlchemy session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database schema for a first-time run (MVP convenience).
    Ensures models are imported so they are registered with Base.metadata.
    """
    import_models()
    Base.metadata.create_all(bind=engine)