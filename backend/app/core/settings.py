import os
from functools import lru_cache
from typing import List, Optional

from dotenv import load_dotenv


def _load_env_files() -> None:
    """
    Carga variables desde .env en el raíz del proyecto y backend/.env
    sin sobreescribir valores ya presentes en el entorno.
    """
    # 1) .env en raíz (cuando ejecutas desde el root)
    load_dotenv()
    # 2) backend/.env (cuando el archivo está dentro del backend)
    here = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))  # backend/
    backend_env = os.path.join(here, ".env")
    if os.path.exists(backend_env):
        load_dotenv(backend_env, override=False)


_load_env_files()


class Settings:
    """
    Settings centralizados. Evita dependencias extra y usa dotenv + os.getenv.
    Si en el futuro deseas pydantic-settings, es sencillo migrar esta clase.
    """

    # App
    APP_NAME: str = "Directorio API"

    # CORS
    ALLOWED_ORIGINS: List[str]

    # Database
    DATABASE_URL: str

    # Auth/JWT
    JWT_SECRET: str
    JWT_ALG: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # OpenAI Vector Store
    OPENAI_API_KEY: Optional[str]
    VECTOR_STORE_ID: Optional[str]

    def __init__(self) -> None:
        # CORS
        allowed = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
        self.ALLOWED_ORIGINS = [o.strip() for o in allowed.split(",") if o.strip()]

        # DB
        self.DATABASE_URL = os.getenv(
            "DATABASE_URL",
            "postgresql+psycopg://postgres:postgres@localhost:5432/directorio",
        )

        # Auth
        self.JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")
        self.JWT_ALG = os.getenv("JWT_ALG", "HS256")
        try:
            self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
        except ValueError:
            self.ACCESS_TOKEN_EXPIRE_MINUTES = 60

        # OpenAI
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or None
        self.VECTOR_STORE_ID = os.getenv("VECTOR_STORE_ID") or None


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Singleton de Settings cacheado.
    """
    return Settings()