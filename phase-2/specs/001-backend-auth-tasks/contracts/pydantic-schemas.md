# Pydantic Schema Contracts

**Feature**: 001-backend-auth-tasks
**Date**: 2025-12-18

## Overview

This document defines all Pydantic models used for request/response validation in the FastAPI backend.

---

## Request Schemas

### TaskCreate

**Purpose**: Create a new task (POST /api/{user_id}/tasks)

**Location**: `backend/src/schemas/requests.py`

```python
from pydantic import BaseModel, Field, validator
from typing import Optional

class TaskCreate(BaseModel):
    """Request schema for creating a new task"""

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Task title (required, 1-200 characters)",
        example="Buy groceries"
    )

    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Optional task description (max 1000 characters)",
        example="Milk, eggs, and bread"
    )

    @validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()

    class Config:
        schema_extra = {
            "example": {
                "title": "Buy groceries",
                "description": "Milk, eggs, and bread"
            }
        }
```

### TaskUpdate

**Purpose**: Update a task (PUT /api/{user_id}/tasks/{id})

**Location**: `backend/src/schemas/requests.py`

```python
class TaskUpdate(BaseModel):
    """Request schema for updating a task (full replacement)"""

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Task title (required, 1-200 characters)",
        example="Buy groceries (updated)"
    )

    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Optional task description (max 1000 characters)",
        example="Milk, eggs, bread, and butter"
    )

    @validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()

    class Config:
        schema_extra = {
            "example": {
                "title": "Buy groceries (updated)",
                "description": "Milk, eggs, bread, and butter"
            }
        }
```

### TaskPatch

**Purpose**: Partially update a task (PATCH /api/{user_id}/tasks/{id})

**Location**: `backend/src/schemas/requests.py`

```python
class TaskPatch(BaseModel):
    """Request schema for patching a task (partial update)"""

    completed: bool = Field(
        ...,
        description="Task completion status (required)",
        example=True
    )

    class Config:
        schema_extra = {
            "example": {
                "completed": True
            }
        }
```

---

## Response Schemas

### TaskResponse

**Purpose**: Task response object (all endpoints returning task data)

**Location**: `backend/src/schemas/responses.py`

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TaskResponse(BaseModel):
    """Response schema for task data"""

    id: int = Field(
        ...,
        description="Task ID",
        example=1
    )

    user_id: str = Field(
        ...,
        description="User ID from JWT token",
        example="user-123"
    )

    title: str = Field(
        ...,
        description="Task title",
        example="Buy groceries"
    )

    description: Optional[str] = Field(
        None,
        description="Optional task description",
        example="Milk, eggs, and bread"
    )

    completed: bool = Field(
        ...,
        description="Task completion status",
        example=False
    )

    created_at: datetime = Field(
        ...,
        description="Timestamp when task was created",
        example="2025-12-18T10:30:00Z"
    )

    updated_at: datetime = Field(
        ...,
        description="Timestamp when task was last updated",
        example="2025-12-18T10:35:00Z"
    )

    class Config:
        orm_mode = True  # Allows SQLModel -> Pydantic conversion
        schema_extra = {
            "example": {
                "id": 1,
                "user_id": "user-123",
                "title": "Buy groceries",
                "description": "Milk, eggs, and bread",
                "completed": False,
                "created_at": "2025-12-18T10:30:00Z",
                "updated_at": "2025-12-18T10:35:00Z"
            }
        }
```

### SuccessResponse

**Purpose**: Generic success response wrapper

**Location**: `backend/src/schemas/responses.py`

```python
from typing import Generic, TypeVar
from pydantic import BaseModel, Field

T = TypeVar('T')

class SuccessResponse(BaseModel, Generic[T]):
    """Generic success response wrapper"""

    success: bool = Field(
        True,
        description="Success flag (always true for successful responses)",
        example=True
    )

    data: T = Field(
        ...,
        description="Response data"
    )

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "id": 1,
                    "user_id": "user-123",
                    "title": "Buy groceries",
                    "description": "Milk, eggs, and bread",
                    "completed": False,
                    "created_at": "2025-12-18T10:30:00Z",
                    "updated_at": "2025-12-18T10:35:00Z"
                }
            }
        }
```

### TaskListResponse

**Purpose**: Response for listing tasks (GET /api/{user_id}/tasks)

**Location**: `backend/src/schemas/responses.py`

```python
from typing import List

class TaskListResponse(BaseModel):
    """Response schema for listing tasks"""

    success: bool = Field(
        True,
        description="Success flag",
        example=True
    )

    data: List[TaskResponse] = Field(
        ...,
        description="List of tasks"
    )

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "data": [
                    {
                        "id": 1,
                        "user_id": "user-123",
                        "title": "Buy groceries",
                        "description": "Milk, eggs, and bread",
                        "completed": False,
                        "created_at": "2025-12-18T10:30:00Z",
                        "updated_at": "2025-12-18T10:35:00Z"
                    },
                    {
                        "id": 2,
                        "user_id": "user-123",
                        "title": "Call dentist",
                        "description": None,
                        "completed": True,
                        "created_at": "2025-12-18T09:00:00Z",
                        "updated_at": "2025-12-18T09:15:00Z"
                    }
                ]
            }
        }
```

### ErrorResponse

**Purpose**: Standard error response (all error responses)

**Location**: `backend/src/schemas/responses.py`

```python
class ErrorResponse(BaseModel):
    """Standard error response schema"""

    detail: str = Field(
        ...,
        description="Error message",
        example="Invalid or expired token"
    )

    class Config:
        schema_extra = {
            "example": {
                "detail": "Invalid or expired token"
            }
        }
```

---

## Authentication Schemas

### JWTPayload

**Purpose**: JWT token payload structure (internal use)

**Location**: `backend/src/schemas/auth.py`

```python
class JWTPayload(BaseModel):
    """JWT token payload structure"""

    sub: str = Field(
        ...,
        description="User ID (standard JWT subject claim)",
        example="user-123"
    )

    user_id: str = Field(
        ...,
        description="User ID (compatibility)",
        example="user-123"
    )

    email: Optional[str] = Field(
        None,
        description="User email",
        example="user@example.com"
    )

    exp: datetime = Field(
        ...,
        description="Expiration timestamp",
        example="2025-12-25T10:30:00Z"
    )

    iat: datetime = Field(
        ...,
        description="Issued at timestamp",
        example="2025-12-18T10:30:00Z"
    )
```

### CurrentUser

**Purpose**: Authenticated user information (from JWT)

**Location**: `backend/src/schemas/auth.py`

```python
class CurrentUser(BaseModel):
    """Authenticated user information extracted from JWT"""

    user_id: str = Field(
        ...,
        description="User ID from JWT token",
        example="user-123"
    )

    email: str = Field(
        "",
        description="User email from JWT token",
        example="user@example.com"
    )
```

---

## Validation Rules Summary

### Title Validation
- **Required**: Yes
- **Min Length**: 1 character
- **Max Length**: 200 characters
- **Trim**: Leading/trailing whitespace removed
- **Empty Check**: Whitespace-only strings rejected

### Description Validation
- **Required**: No (nullable)
- **Min Length**: None
- **Max Length**: 1000 characters
- **Null Handling**: NULL and empty string both accepted

### Completed Validation
- **Required**: Yes (for PATCH)
- **Type**: Boolean only
- **Values**: True or False (no truthy/falsy values)

### User ID Validation
- **Required**: Yes (path parameter)
- **Format**: String (UUID or alphanumeric)
- **Verification**: Must match JWT token user_id

---

## Usage Examples

### Creating a Task

**Request**:
```python
task_data = TaskCreate(
    title="Buy groceries",
    description="Milk, eggs, and bread"
)
```

**Response**:
```python
response = SuccessResponse[TaskResponse](
    success=True,
    data=TaskResponse(
        id=1,
        user_id="user-123",
        title="Buy groceries",
        description="Milk, eggs, and bread",
        completed=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
)
```

### Updating a Task

**Request**:
```python
task_update = TaskUpdate(
    title="Buy groceries (updated)",
    description="Milk, eggs, bread, and butter"
)
```

### Patching a Task

**Request**:
```python
task_patch = TaskPatch(completed=True)
```

### Error Response

**Response**:
```python
error = ErrorResponse(detail="Invalid or expired token")
# FastAPI will automatically return: {"detail": "Invalid or expired token"}
```

---

## Testing Schemas

### Valid Examples

```python
# Valid TaskCreate
valid_create = TaskCreate(title="Buy groceries", description="Milk, eggs, bread")
valid_create = TaskCreate(title="Call dentist")  # No description

# Valid TaskUpdate
valid_update = TaskUpdate(title="Updated title", description="Updated description")

# Valid TaskPatch
valid_patch = TaskPatch(completed=True)
valid_patch = TaskPatch(completed=False)
```

### Invalid Examples

```python
# Invalid: Empty title
invalid_create = TaskCreate(title="")  # Raises ValidationError

# Invalid: Title too long
invalid_create = TaskCreate(title="A" * 201)  # Raises ValidationError

# Invalid: Description too long
invalid_create = TaskCreate(title="Valid", description="A" * 1001)  # Raises ValidationError

# Invalid: Whitespace-only title
invalid_create = TaskCreate(title="   ")  # Raises ValidationError

# Invalid: Missing title
invalid_create = TaskCreate()  # Raises ValidationError

# Invalid: completed not boolean
invalid_patch = TaskPatch(completed="true")  # Raises ValidationError
```

---

## FastAPI Integration

### Route Handler Example

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from backend.db import get_db
from backend.middleware.jwt import verify_jwt_token
from backend.services.task_service import TaskService
from backend.schemas.requests import TaskCreate
from backend.schemas.responses import TaskResponse, SuccessResponse

router = APIRouter(prefix="/api", tags=["tasks"])
task_service = TaskService()

@router.post(
    "/{user_id}/tasks",
    response_model=SuccessResponse[TaskResponse],
    status_code=status.HTTP_201_CREATED
)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_jwt_token)
):
    """Create a new task"""
    # Verify user_id matches JWT
    if current_user["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch"
        )

    # Create task
    task = task_service.create_task(db, current_user["user_id"], task_data)

    # Return response
    return SuccessResponse[TaskResponse](
        success=True,
        data=TaskResponse.from_orm(task)
    )
```

---

## Summary

- **Request Schemas**: TaskCreate, TaskUpdate, TaskPatch
- **Response Schemas**: TaskResponse, TaskListResponse, SuccessResponse, ErrorResponse
- **Auth Schemas**: JWTPayload, CurrentUser
- **Validation**: Pydantic validators ensure data integrity
- **ORM Integration**: `orm_mode = True` enables SQLModel -> Pydantic conversion
- **Examples**: All schemas include example data for OpenAPI docs

**Contracts Complete**: Ready for implementation.
