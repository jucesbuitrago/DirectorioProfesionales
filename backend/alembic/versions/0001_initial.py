"""initial schema

Revision ID: 0001
Revises:
Create Date: 2025-10-18 21:38:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # users table
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=64), nullable=True),
        sa.Column("city", sa.String(length=128), nullable=True),
        sa.Column("is_professional", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # professional_profiles table
    op.create_table(
        "professional_profiles",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("nombre_completo", sa.String(length=255), nullable=False),
        sa.Column("profesion_principal", sa.String(length=255), nullable=False),
        sa.Column("ciudad", sa.String(length=128), nullable=True),
        sa.Column("barrio", sa.String(length=128), nullable=True),
        sa.Column("telefono", sa.String(length=64), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("descripcion_breve", sa.Text(), nullable=True),
        sa.Column("profesion_normalizada", sa.String(length=255), nullable=True),
        sa.Column("ciudad_normalizada", sa.String(length=128), nullable=True),
        sa.Column("vector_store_file_id", sa.String(length=128), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index(
        "ix_prof_profiles_profesion_normalizada",
        "professional_profiles",
        ["profesion_normalizada"],
        unique=False,
    )
    op.create_index(
        "ix_prof_profiles_ciudad_normalizada",
        "professional_profiles",
        ["ciudad_normalizada"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_prof_profiles_ciudad_normalizada", table_name="professional_profiles")
    op.drop_index("ix_prof_profiles_profesion_normalizada", table_name="professional_profiles")
    op.drop_table("professional_profiles")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")