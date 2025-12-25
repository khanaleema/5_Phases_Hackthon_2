"""add task metadata fields (due_date, priority, category)

Revision ID: 002
Revises: 001
Create Date: 2025-01-20

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add due_date, due_date_end, priority, and category columns to tasks table"""
    # Add due_date column (nullable datetime)
    op.add_column(
        "tasks",
        sa.Column(
            "due_date",
            sa.DateTime(),
            nullable=True,
            comment="Optional due date start for the task (UTC datetime)",
        ),
    )

    # Add due_date_end column (nullable datetime)
    op.add_column(
        "tasks",
        sa.Column(
            "due_date_end",
            sa.DateTime(),
            nullable=True,
            comment="Optional due date end for the task (UTC datetime)",
        ),
    )

    # Add priority column (nullable string with check constraint)
    op.add_column(
        "tasks",
        sa.Column(
            "priority",
            sa.String(length=10),
            nullable=True,
            comment="Optional priority level (low, medium, high)",
        ),
    )

    # Add category column (nullable string, max 100 characters)
    op.add_column(
        "tasks",
        sa.Column(
            "category",
            sa.String(length=100),
            nullable=True,
            comment="Optional category/tag for the task (max 100 characters)",
        ),
    )

    # Add check constraint for priority values
    op.create_check_constraint(
        "check_priority_values",
        "tasks",
        sa.text("priority IS NULL OR priority IN ('low', 'medium', 'high')"),
    )


def downgrade() -> None:
    """Remove due_date, due_date_end, priority, and category columns from tasks table"""
    # Drop check constraint first
    op.drop_constraint("check_priority_values", "tasks", type_="check")

    # Drop columns
    op.drop_column("tasks", "category")
    op.drop_column("tasks", "priority")
    op.drop_column("tasks", "due_date_end")
    op.drop_column("tasks", "due_date")

