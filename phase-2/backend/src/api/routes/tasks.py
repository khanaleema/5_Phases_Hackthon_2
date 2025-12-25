"""
Task management API routes.

This module implements RESTful endpoints for task CRUD operations with
constitution-compliant three-layer security.
"""

from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from src.db import get_db
from src.middleware.jwt import verify_jwt_token
from src.schemas.requests import TaskCreate, TaskPatch, TaskUpdate
from src.schemas.responses import TaskListResponse, TaskResponse
from src.services.task_service import TaskService

# Create router with /api prefix
router = APIRouter(prefix="/api", tags=["tasks"])

# Initialize service
task_service = TaskService()


@router.post(
    "/{user_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Task created successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - User ID mismatch"},
        422: {"description": "Unprocessable Entity - Validation error"},
    },
)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: Dict[str, str] = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
) -> TaskResponse:
    """
    Create a new task for the authenticated user.

    SECURITY LAYERS:
    1. JWT Verification: verify_jwt_token ensures valid token
    2. Path Validation: Verify user_id in path matches JWT
    3. Query Filtering: Service uses JWT user_id (not path parameter)

    Args:
        user_id: User ID from path parameter
        task_data: Task creation data (title, description)
        current_user: Authenticated user from JWT token
        db: Database session

    Returns:
        TaskResponse: Created task with id, user_id, timestamps

    Raises:
        HTTPException: 403 if path user_id doesn't match JWT user_id
    """
    # LAYER 2: Path validation (CRITICAL security check)
    if current_user["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch between path and JWT token",
        )

    # LAYER 3: Create task using JWT user_id (not path parameter)
    task = task_service.create_task(
        db=db, user_id=current_user["user_id"], task_data=task_data
    )

    return TaskResponse.model_validate(task)


@router.get(
    "/{user_id}/tasks",
    response_model=TaskListResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Tasks retrieved successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - User ID mismatch"},
    },
)
async def get_tasks(
    user_id: str,
    current_user: Dict[str, str] = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
) -> TaskListResponse:
    """
    Retrieve all tasks for the authenticated user.

    SECURITY LAYERS:
    1. JWT Verification: verify_jwt_token ensures valid token
    2. Path Validation: Verify user_id in path matches JWT
    3. Query Filtering: Service filters by JWT user_id

    Args:
        user_id: User ID from path parameter
        current_user: Authenticated user from JWT token
        db: Database session

    Returns:
        TaskListResponse: List of user's tasks

    Raises:
        HTTPException: 403 if path user_id doesn't match JWT user_id
    """
    # LAYER 2: Path validation
    if current_user["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch between path and JWT token",
        )

    # LAYER 3: Query with user isolation
    try:
        tasks = task_service.get_tasks(db=db, user_id=current_user["user_id"])
        
        # Convert tasks to response format (handle empty list gracefully)
        task_responses = [TaskResponse.model_validate(task) for task in tasks]
        
        return TaskListResponse(data=task_responses)
    except Exception as e:
        # Log the error for debugging
        import traceback
        print(f"Error fetching tasks: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch tasks: {str(e)}",
        )


@router.get(
    "/{user_id}/tasks/{task_id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Task retrieved successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - User ID mismatch"},
        404: {"description": "Not Found - Task doesn't exist or not owned by user"},
    },
)
async def get_task(
    user_id: str,
    task_id: int,
    current_user: Dict[str, str] = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
) -> TaskResponse:
    """
    Retrieve a specific task by ID.

    SECURITY: Returns 404 (not 403) if task belongs to another user (anti-enumeration).

    Args:
        user_id: User ID from path parameter
        task_id: Task ID to retrieve
        current_user: Authenticated user from JWT token
        db: Database session

    Returns:
        TaskResponse: Task data

    Raises:
        HTTPException: 403 if user_id mismatch, 404 if task not found
    """
    # LAYER 2: Path validation
    if current_user["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch between path and JWT token",
        )

    # LAYER 3: Query with user isolation
    task = task_service.get_task_by_id(db=db, user_id=current_user["user_id"], task_id=task_id)

    if not task:
        # Return 404 (not 403) to prevent enumeration attacks
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return TaskResponse.model_validate(task)


@router.put(
    "/{user_id}/tasks/{task_id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Task updated successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - User ID mismatch"},
        404: {"description": "Not Found - Task doesn't exist or not owned by user"},
        422: {"description": "Unprocessable Entity - Validation error"},
    },
)
async def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    current_user: Dict[str, str] = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
) -> TaskResponse:
    """
    Update a task's title and description (full replacement).

    Args:
        user_id: User ID from path parameter
        task_id: Task ID to update
        task_data: Updated task data
        current_user: Authenticated user from JWT token
        db: Database session

    Returns:
        TaskResponse: Updated task data

    Raises:
        HTTPException: 403 if user_id mismatch, 404 if task not found
    """
    # LAYER 2: Path validation
    if current_user["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch between path and JWT token",
        )

    # LAYER 3: Update with user isolation
    task = task_service.update_task(
        db=db, user_id=current_user["user_id"], task_id=task_id, task_data=task_data
    )

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return TaskResponse.model_validate(task)


@router.patch(
    "/{user_id}/tasks/{task_id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Task patched successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - User ID mismatch"},
        404: {"description": "Not Found - Task doesn't exist or not owned by user"},
        422: {"description": "Unprocessable Entity - Validation error"},
    },
)
async def patch_task(
    user_id: str,
    task_id: int,
    task_data: TaskPatch,
    current_user: Dict[str, str] = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
) -> TaskResponse:
    """
    Patch a task's completion status (partial update).

    Args:
        user_id: User ID from path parameter
        task_id: Task ID to patch
        task_data: Patch data (completed status)
        current_user: Authenticated user from JWT token
        db: Database session

    Returns:
        TaskResponse: Patched task data

    Raises:
        HTTPException: 403 if user_id mismatch, 404 if task not found
    """
    # LAYER 2: Path validation
    if current_user["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch between path and JWT token",
        )

    # LAYER 3: Patch with user isolation
    task = task_service.patch_task(
        db=db, user_id=current_user["user_id"], task_id=task_id, task_data=task_data
    )

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return TaskResponse.model_validate(task)


@router.delete(
    "/{user_id}/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        204: {"description": "Task deleted successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - User ID mismatch"},
        404: {"description": "Not Found - Task doesn't exist or not owned by user"},
    },
)
async def delete_task(
    user_id: str,
    task_id: int,
    current_user: Dict[str, str] = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
) -> None:
    """
    Delete a task (hard delete).

    Args:
        user_id: User ID from path parameter
        task_id: Task ID to delete
        current_user: Authenticated user from JWT token
        db: Database session

    Raises:
        HTTPException: 403 if user_id mismatch, 404 if task not found
    """
    # LAYER 2: Path validation
    if current_user["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch between path and JWT token",
        )

    # LAYER 3: Delete with user isolation
    deleted = task_service.delete_task(db=db, user_id=current_user["user_id"], task_id=task_id)

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
