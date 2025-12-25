"""
Response schemas for task management API.

All API responses MUST use these Pydantic models for consistency.
"""

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class TaskResponse(BaseModel):
    """
    Response schema for task data.

    Used by all endpoints returning task objects.
    """

    model_config = ConfigDict(from_attributes=True)  # Pydantic v2: replaces orm_mode

    id: int = Field(..., description="Task ID", examples=[1])

    user_id: str = Field(..., description="User ID from JWT token", examples=["user-123"])

    title: str = Field(..., description="Task title", examples=["Buy groceries"])

    description: Optional[str] = Field(
        None, description="Optional task description", examples=["Milk, eggs, and bread"]
    )

    completed: bool = Field(..., description="Task completion status", examples=[False])

    due_date: Optional[datetime] = Field(
        None, description="Optional due date start for the task", examples=["2024-12-31T23:59:59Z"]
    )

    due_date_end: Optional[datetime] = Field(
        None, description="Optional due date end for the task", examples=["2025-01-05T23:59:59Z"]
    )

    priority: Optional[Literal["low", "medium", "high"]] = Field(
        None, description="Optional priority level", examples=["high"]
    )

    category: Optional[str] = Field(
        None, description="Optional category/tag for the task", examples=["Work", "Personal", "Shopping"]
    )

    created_at: datetime = Field(
        ..., description="Timestamp when task was created", examples=["2025-12-18T10:30:00Z"]
    )

    updated_at: datetime = Field(
        ..., description="Timestamp when task was last updated", examples=["2025-12-18T10:35:00Z"]
    )


class TaskListResponse(BaseModel):
    """
    Response schema for listing tasks.

    GET /api/{user_id}/tasks
    """

    data: List[TaskResponse] = Field(..., description="List of tasks")

    class Config:
        json_schema_extra = {
            "example": {
                "data": [
                    {
                        "id": 1,
                        "user_id": "user-123",
                        "title": "Buy groceries",
                        "description": "Milk, eggs, and bread",
                        "completed": False,
                        "due_date": "2024-12-31T23:59:59Z",
                        "priority": "high",
                        "category": "Shopping",
                        "created_at": "2025-12-18T10:30:00Z",
                        "updated_at": "2025-12-18T10:35:00Z",
                    },
                    {
                        "id": 2,
                        "user_id": "user-123",
                        "title": "Call dentist",
                        "description": None,
                        "completed": True,
                        "due_date": None,
                        "priority": "medium",
                        "category": "Personal",
                        "created_at": "2025-12-18T09:00:00Z",
                        "updated_at": "2025-12-18T09:15:00Z",
                    },
                ]
            }
        }


class ErrorResponse(BaseModel):
    """
    Standard error response schema.

    All error responses use this consistent format.
    """

    detail: str = Field(..., description="Error message", examples=["Invalid or expired token"])

    class Config:
        json_schema_extra = {"example": {"detail": "Invalid or expired token"}}
