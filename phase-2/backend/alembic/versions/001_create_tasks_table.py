"""create tasks table

Revision ID: 001
Revises:
Create Date: 2025-12-18

"""
from typing import Sequence, Union

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create tasks table with user isolation indexes"""
    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.String(length=1000), nullable=True),
        sa.Column("completed", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=sa.text("(now() at time zone 'utc')")
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False, server_default=sa.text("(now() at time zone 'utc')")
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # User isolation index (CRITICAL for query performance)
    op.create_index("ix_tasks_user_id", "tasks", ["user_id"])
    # Status filter index (for pending/completed filtering)
    op.create_index("ix_tasks_completed", "tasks", ["completed"])


def downgrade() -> None:
    """Drop tasks table and indexes"""
    op.drop_index("ix_tasks_completed", "tasks")
    op.drop_index("ix_tasks_user_id", "tasks")
    op.drop_table("tasks")
