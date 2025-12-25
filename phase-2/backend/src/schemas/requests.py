"""
Request schemas for task management API.

All request payloads MUST use these Pydantic models for validation.
"""

from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, Field, field_validator


class TaskCreate(BaseModel):
    """
    Request schema for creating a new task.

    POST /api/{user_id}/tasks
    """

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Task title (required, 1-200 characters)",
        examples=["Buy groceries"],
    )

    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Optional task description (max 1000 characters)",
        examples=["Milk, eggs, and bread"],
    )

    due_date: Optional[datetime] = Field(
        None,
        description="Optional due date start for the task (ISO 8601 datetime)",
        examples=["2024-12-31T23:59:59Z"],
    )

    due_date_end: Optional[datetime] = Field(
        None,
        description="Optional due date end for the task (ISO 8601 datetime)",
        examples=["2025-01-05T23:59:59Z"],
    )

    priority: Optional[Literal["low", "medium", "high"]] = Field(
        None,
        description="Optional priority level",
        examples=["high"],
    )

    category: Optional[str] = Field(
        None,
        max_length=100,
        description="Optional category/tag for the task (max 100 characters)",
        examples=["Work", "Personal", "Shopping"],
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate title is not empty or whitespace only"""
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Buy groceries",
                "description": "Milk, eggs, and bread",
                "due_date": "2024-12-31T23:59:59Z",
                "due_date_end": "2025-01-05T23:59:59Z",
                "priority": "high",
                "category": "Shopping"
            }
        }


class TaskUpdate(BaseModel):
    """
    Request schema for updating a task (full replacement).

    PUT /api/{user_id}/tasks/{id}
    """

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Task title (required, 1-200 characters)",
        examples=["Buy groceries (updated)"],
    )

    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Optional task description (max 1000 characters)",
        examples=["Milk, eggs, bread, and butter"],
    )

    due_date: Optional[datetime] = Field(
        None,
        description="Optional due date start for the task (ISO 8601 datetime)",
        examples=["2024-12-31T23:59:59Z"],
    )

    due_date_end: Optional[datetime] = Field(
        None,
        description="Optional due date end for the task (ISO 8601 datetime)",
        examples=["2025-01-05T23:59:59Z"],
    )

    priority: Optional[Literal["low", "medium", "high"]] = Field(
        None,
        description="Optional priority level",
        examples=["high"],
    )

    category: Optional[str] = Field(
        None,
        max_length=100,
        description="Optional category/tag for the task (max 100 characters)",
        examples=["Work", "Personal", "Shopping"],
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate title is not empty or whitespace only"""
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Buy groceries (updated)",
                "description": "Milk, eggs, bread, and butter",
                "due_date": "2024-12-31T23:59:59Z",
                "priority": "medium",
                "category": "Shopping"
            }
        }


class TaskPatch(BaseModel):
    """
    Request schema for patching a task (partial update).

    PATCH /api/{user_id}/tasks/{id}

    Currently only supports toggling completion status.
    """

    completed: bool = Field(
        ..., description="Task completion status (required)", examples=[True]
    )

    class Config:
        json_schema_extra = {"example": {"completed": True}}
