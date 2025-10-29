import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# Ensure project root is on sys.path to import backend.app.*
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Import app settings and SQLAlchemy Base
from backend.app.core.settings import get_settings  # noqa: E402
from backend.app.db.base import Base, import_models  # noqa: E402

# Alembic Config object, which provides access to the values within the .ini file
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Load models so they are registered on Base.metadata
import_models()

# Set target metadata for 'autogenerate' support
target_metadata = Base.metadata

# Inject SQLAlchemy URL from our app settings
settings = get_settings()
db_url = settings.DATABASE_URL
config.set_main_option("sqlalchemy.url", db_url)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    if not url:
        raise RuntimeError("sqlalchemy.url is not configured")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # 1) Toma la URL desde env o desde el INI (que ya fue seteado por get_settings())
    db_url = os.getenv("DATABASE_URL") or config.get_main_option("sqlalchemy.url")
    if not db_url:
        raise RuntimeError("sqlalchemy.url / DATABASE_URL is not set")

    # 2) Toma la sección principal del INI y fuerza la URL correcta
    cfg_section = config.get_section(config.config_ini_section) or {}
    cfg_section["sqlalchemy.url"] = db_url

    # 3) ¡Clave!: filtra solo claves que empiecen por "sqlalchemy."
    connectable = engine_from_config(
        cfg_section,
        prefix="sqlalchemy.",   # <-- evita pasar 'script_location', 'here', etc.
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()