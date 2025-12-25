"""
Task service layer implementing business logic.

This module encapsulates all task-related operations with strict user isolation.
CRITICAL: All methods MUST enforce user_id filtering from JWT token.
"""

from datetime import datetime
from typing import Optional

from sqlmodel import Session, select

from src.models.task import Task
from src.schemas.requests import TaskCreate, TaskPatch, TaskUpdate


class TaskService:
    """
    Service layer for task management operations.

    All methods enforce three-layer security:
    1. JWT verification (handled by middleware)
    2. Path validation (handled by route)
    3. Query filtering (enforced here with user_id)
    """

    def create_task(self, db: Session, user_id: str, task_data: TaskCreate) -> Task:
        """
        Create a new task for the authenticated user.

        CRITICAL SECURITY: user_id MUST come from JWT token (via middleware),
        not from request body or path parameter.

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT token
            task_data: Task creation data (title, description)

        Returns:
            Task: Created task with auto-generated id and timestamps

        Example:
            task = task_service.create_task(
                db=db,
                user_id=current_user["user_id"],  # From JWT
                task_data=TaskCreate(title="Buy groceries")
            )
        """
        # Create task with user_id from JWT token
        task = Task(
            user_id=user_id,  # CRITICAL: From JWT, not request
            title=task_data.title,
            description=task_data.description,
            completed=False,  # Always starts as incomplete
            due_date=task_data.due_date,
            due_date_end=task_data.due_date_end,
            priority=task_data.priority,
            category=task_data.category,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        # Persist to database
        db.add(task)
        db.commit()
        db.refresh(task)

        return task

    def get_tasks(self, db: Session, user_id: str) -> list[Task]:
        """
        Retrieve all tasks for the authenticated user.

        CRITICAL SECURITY: Query MUST filter by user_id from JWT token.

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT token

        Returns:
            list[Task]: List of user's tasks (empty if no tasks)
        """
        statement = select(Task).where(Task.user_id == user_id)
        tasks = db.exec(statement).all()
        return list(tasks)

    def get_task_by_id(self, db: Session, user_id: str, task_id: int) -> Optional[Task]:
        """
        Retrieve a specific task by ID with user isolation.

        CRITICAL SECURITY: Query MUST filter by BOTH task_id AND user_id.
        Returns None if task doesn't exist OR belongs to another user (anti-enumeration).

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT token
            task_id: Task ID to retrieve

        Returns:
            Optional[Task]: Task if found and owned by user, None otherwise
        """
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        task = db.exec(statement).first()
        return task

    def update_task(
        self, db: Session, user_id: str, task_id: int, task_data: TaskUpdate
    ) -> Optional[Task]:
        """
        Update a task's title and description (full replacement).

        CRITICAL SECURITY: Query MUST filter by user_id to prevent cross-user updates.

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT token
            task_id: Task ID to update
            task_data: Updated task data (title, description)

        Returns:
            Optional[Task]: Updated task if found and owned by user, None otherwise
        """
        # Retrieve task with user isolation
        task = self.get_task_by_id(db, user_id, task_id)
        if not task:
            return None

        # Update fields
        task.title = task_data.title
        task.description = task_data.description
        task.due_date = task_data.due_date
        task.due_date_end = task_data.due_date_end
        task.priority = task_data.priority
        task.category = task_data.category
        task.updated_at = datetime.utcnow()

        # Persist changes
        db.add(task)
        db.commit()
        db.refresh(task)

        return task

    def patch_task(
        self, db: Session, user_id: str, task_id: int, task_data: TaskPatch
    ) -> Optional[Task]:
        """
        Patch a task's completion status (partial update).

        CRITICAL SECURITY: Query MUST filter by user_id to prevent cross-user updates.

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT token
            task_id: Task ID to patch
            task_data: Patch data (completed status)

        Returns:
            Optional[Task]: Patched task if found and owned by user, None otherwise
        """
        # Retrieve task with user isolation
        task = self.get_task_by_id(db, user_id, task_id)
        if not task:
            return None

        # Update completed field only
        task.completed = task_data.completed
        task.updated_at = datetime.utcnow()

        # Persist changes
        db.add(task)
        db.commit()
        db.refresh(task)

        return task

    def delete_task(self, db: Session, user_id: str, task_id: int) -> bool:
        """
        Delete a task (hard delete).

        CRITICAL SECURITY: Query MUST filter by user_id to prevent cross-user deletions.

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT token
            task_id: Task ID to delete

        Returns:
            bool: True if deleted, False if not found or not owned by user
        """
        # Retrieve task with user isolation
        task = self.get_task_by_id(db, user_id, task_id)
        if not task:
            return False

        # Delete task
        db.delete(task)
        db.commit()

        return True
