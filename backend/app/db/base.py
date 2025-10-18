from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Declarative base para todos los modelos SQLAlchemy del proyecto.
    """
    pass


def import_models() -> None:
    """
    Fuerza la importación de todos los modelos para que queden
    registrados en Base.metadata antes de crear tablas/migrar.
    """
    # Importación perezosa para evitar dependencias cíclicas
    from backend.app.models import user as _user  # noqa: F401
    from backend.app.models import professional as _professional  # noqa: F401