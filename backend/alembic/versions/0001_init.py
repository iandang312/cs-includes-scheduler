"""init

Revision ID: 0001_init
Revises: 
Create Date: 2026-04-08

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make the migration re-runnable if a previous attempt created types
    op.execute(
        """
DO $$
BEGIN
  CREATE TYPE role AS ENUM ('admin', 'mentor', 'mentee');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
"""
    )
    op.execute(
        """
DO $$
BEGIN
  CREATE TYPE rsvp_status AS ENUM ('going', 'not_going');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
"""
    )

    # Use dialect enum with create_type=False to ensure SQLAlchemy does NOT emit CREATE TYPE
    role_enum = postgresql.ENUM("admin", "mentor", "mentee", name="role", create_type=False)
    rsvp_enum = postgresql.ENUM("going", "not_going", name="rsvp_status", create_type=False)

    op.create_table(
        "users",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=True),
        sa.Column("display_name", sa.String(length=200), nullable=True),
        sa.Column("role", role_enum, nullable=False, server_default="mentee"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "events",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "mentor_user_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("start_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("location", sa.String(length=200), nullable=True),
        sa.Column("capacity", sa.Integer(), nullable=True),
        sa.Column("graph_event_id", sa.String(length=200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_events_mentor_user_id", "events", ["mentor_user_id"])
    op.create_index("ix_events_start_at", "events", ["start_at"])
    op.create_index("ix_events_end_at", "events", ["end_at"])

    op.create_table(
        "rsvps",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "event_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("events.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("status", rsvp_enum, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("event_id", "user_id", name="uq_rsvps_event_user"),
    )
    op.create_index("ix_rsvps_event_id", "rsvps", ["event_id"])
    op.create_index("ix_rsvps_user_id", "rsvps", ["user_id"])

    op.create_table(
        "sessions",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "user_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_sessions_user_id", "sessions", ["user_id"])
    op.create_index("ix_sessions_expires_at", "sessions", ["expires_at"])

    op.create_table(
        "oauth_tokens",
        sa.Column(
            "user_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
        sa.Column("provider", sa.String(length=50), primary_key=True, nullable=False),
        sa.Column("access_token", sa.String(), nullable=False),
        sa.Column("refresh_token", sa.String(), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("oauth_tokens")
    op.drop_index("ix_sessions_expires_at", table_name="sessions")
    op.drop_index("ix_sessions_user_id", table_name="sessions")
    op.drop_table("sessions")
    op.drop_index("ix_rsvps_user_id", table_name="rsvps")
    op.drop_index("ix_rsvps_event_id", table_name="rsvps")
    op.drop_table("rsvps")
    op.drop_index("ix_events_end_at", table_name="events")
    op.drop_index("ix_events_start_at", table_name="events")
    op.drop_index("ix_events_mentor_user_id", table_name="events")
    op.drop_table("events")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    op.execute("DROP TYPE IF EXISTS rsvp_status")
    op.execute("DROP TYPE IF EXISTS role")

