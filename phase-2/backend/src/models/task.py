"""
Task model for SQLModel ORM.

This module defines the Task entity with user isolation enforced through
indexed user_id field.
"""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Task(SQLModel, table=True):
    """
    Task model representing a user's work item.

    This model enforces user isolation at the database level through the
    user_id foreign key field. All queries MUST filter by user_id.

    Attributes:
        id: Auto-increment primary key
        user_id: Foreign key to user (from Better Auth JWT) - INDEXED
        title: Task title (1-200 characters, required)
        description: Optional task description (max 1000 characters)
        completed: Task completion status (default: False) - INDEXED
        due_date: Optional due date for the task (UTC datetime)
        priority: Optional priority level (low, medium, high)
        category: Optional category/tag for the task (max 100 characters)
        created_at: Timestamp when task was created (UTC)
        updated_at: Timestamp when task was last modified (UTC)
    """

    __tablename__ = "tasks"

    # Primary Key
    id: Optional[int] = Field(
        default=None, primary_key=True, description="Auto-increment primary key"
    )

    # User Isolation (CRITICAL: All queries MUST filter by this field)
    user_id: str = Field(
        index=True, max_length=255, description="User ID from Better Auth JWT token"
    )

    # Task Content
    title: str = Field(
        max_length=200, min_length=1, description="Task title (required, 1-200 characters)"
    )

    description: Optional[str] = Field(
        default=None, max_length=1000, description="Optional task description (max 1000 characters)"
    )

    # Task Status
    completed: bool = Field(
        default=False, index=True, description="Task completion status (indexed for filtering)"
    )

    # Task Metadata
    due_date: Optional[datetime] = Field(
        default=None, description="Optional due date start for the task (UTC datetime)"
    )

    due_date_end: Optional[datetime] = Field(
        default=None, description="Optional due date end for the task (UTC datetime)"
    )

    priority: Optional[str] = Field(
        default=None, max_length=10, description="Optional priority level (low, medium, high)"
    )

    category: Optional[str] = Field(
        default=None, max_length=100, description="Optional category/tag for the task (max 100 characters)"
    )

    # Timestamps (UTC)
    created_at: datetime = Field(
        default_factory=datetime.utcnow, description="Timestamp when task was created (UTC)"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        description="Timestamp when task was last updated (UTC)",
    )
