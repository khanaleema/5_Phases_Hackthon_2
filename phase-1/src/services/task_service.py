"""
Business logic for task operations in the CLI Todo Application.

This module contains the TaskService class with methods for add, update, delete,
and other task operations.
"""
from typing import List, Optional
from src.models.task import Task
from typing import Protocol


class TaskStoreProtocol(Protocol):
    """Protocol for task storage implementations."""
    def add_task(self, task) -> object: ...
    def get_task(self, task_id: int) -> object: ...
    def get_all_tasks(self) -> list: ...
    def update_task(self, task) -> object: ...
    def delete_task(self, task_id: int) -> bool: ...
    def generate_id(self) -> int: ...
from src.exceptions import TaskNotFoundError, InvalidTaskError


class TaskService:
    """
    Service class for business logic of task operations (add, update, delete, etc.).
    """

    def __init__(self, store: TaskStoreProtocol):
        """
        Initialize the TaskService with a task store.

        Args:
            store: The task storage to use (must implement TaskStoreProtocol)
        """
        self._store = store

    def add_task(self, title: str, description: str = "") -> Task:
        """
        Add a new task with the given title and description.

        Args:
            title (str): Task title (required)
            description (str): Task description (optional)

        Returns:
            Task: The newly created task with assigned ID

        Raises:
            InvalidTaskError: If title is empty or exceeds length limits
        """
        if not title or not title.strip():
            raise InvalidTaskError("Task title cannot be empty")

        # Validate title length
        if len(title) > 255:
            raise InvalidTaskError("Task title must be 255 characters or less")

        # Validate description length
        if len(description) > 1000:
            raise InvalidTaskError("Task description must be 1000 characters or less")

        task_id = self._store.generate_id()
        task = Task(id=task_id, title=title.strip(), description=description.strip())
        return self._store.add_task(task)

    def get_task(self, task_id: int) -> Optional[Task]:
        """
        Get a task by its ID.

        Args:
            task_id (int): ID of the task to retrieve

        Returns:
            Optional[Task]: The task if found, None otherwise
        """
        return self._store.get_task(task_id)

    def get_all_tasks(self) -> List[Task]:
        """
        Get all tasks in the system.

        Returns:
            List[Task]: All tasks in the system
        """
        return self._store.get_all_tasks()

    def update_task(self, task_id: int, title: str, description: str) -> Optional[Task]:
        """
        Update an existing task.

        Args:
            task_id (int): ID of the task to update
            title (str): New title for the task
            description (str): New description for the task

        Returns:
            Optional[Task]: Updated task if successful, None if task doesn't exist

        Raises:
            InvalidTaskError: If title is empty or exceeds length limits
        """
        if not title or not title.strip():
            raise InvalidTaskError("Task title cannot be empty")

        # Validate title length
        if len(title) > 255:
            raise InvalidTaskError("Task title must be 255 characters or less")

        # Validate description length
        if len(description) > 1000:
            raise InvalidTaskError("Task description must be 1000 characters or less")

        existing_task = self._store.get_task(task_id)
        if existing_task is None:
            return None

        updated_task = Task(
            id=task_id,
            title=title.strip(),
            description=description.strip(),
            is_completed=existing_task.is_completed
        )
        return self._store.update_task(updated_task)

    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task by its ID.

        Args:
            task_id (int): ID of the task to delete

        Returns:
            bool: True if task was deleted, False if task didn't exist
        """
        return self._store.delete_task(task_id)

    def mark_complete(self, task_id: int) -> Optional[Task]:
        """
        Mark a task as complete.

        Args:
            task_id (int): ID of the task to mark complete

        Returns:
            Optional[Task]: Updated task if successful, None if task doesn't exist
        """
        existing_task = self._store.get_task(task_id)
        if existing_task is None:
            return None

        updated_task = Task(
            id=task_id,
            title=existing_task.title,
            description=existing_task.description,
            is_completed=True
        )
        return self._store.update_task(updated_task)

    def mark_incomplete(self, task_id: int) -> Optional[Task]:
        """
        Mark a task as incomplete.

        Args:
            task_id (int): ID of the task to mark incomplete

        Returns:
            Optional[Task]: Updated task if successful, None if task doesn't exist
        """
        existing_task = self._store.get_task(task_id)
        if existing_task is None:
            return None

        updated_task = Task(
            id=task_id,
            title=existing_task.title,
            description=existing_task.description,
            is_completed=False
        )
        return self._store.update_task(updated_task)