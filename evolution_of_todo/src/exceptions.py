"""
Custom exception classes for the CLI Todo Application.
"""


class TaskError(Exception):
    """Base exception class for task-related errors."""
    pass


class TaskNotFoundError(TaskError):
    """Raised when a task with a given ID is not found."""
    def __init__(self, task_id: int):
        self.task_id = task_id
        super().__init__(f"Task with ID {task_id} not found")


class InvalidTaskError(TaskError):
    """Raised when a task has invalid data."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class InvalidTaskIdError(TaskError):
    """Raised when a task ID is invalid."""
    def __init__(self, task_id: int, message: str = None):
        self.task_id = task_id
        if message is None:
            message = f"Invalid task ID: {task_id}. Task ID must be a positive integer."
        super().__init__(message)