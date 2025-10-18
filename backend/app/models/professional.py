import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.db.base import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class ProfessionalProfile(Base):
    __tablename__ = "professional_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # Domain fields
    nombre_completo: Mapped[str] = mapped_column(String(255), nullable=False)
    profesion_principal: Mapped[str] = mapped_column(String(255), nullable=False)

    ciudad: Mapped[str] = mapped_column(String(128), nullable=True)
    barrio: Mapped[str] = mapped_column(String(128), nullable=True)
    telefono: Mapped[str] = mapped_column(String(64), nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=True)
    descripcion_breve: Mapped[str] = mapped_column(Text, nullable=True)

    # Normalized fields for search
    profesion_normalizada: Mapped[str] = mapped_column(String(255), nullable=True, index=True)
    ciudad_normalizada: Mapped[str] = mapped_column(String(128), nullable=True, index=True)

    # Optional: OpenAI File id stored in the Vector Store
    vector_store_file_id: Mapped[str] = mapped_column(String(128), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user: Mapped["User"] = relationship(
        "User",
        back_populates="professional_profile",
        lazy="joined",
    )