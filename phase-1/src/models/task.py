"""
Task data model for the CLI Todo Application.

This module defines the Task data class with id, title, description, and is_completed status.
"""
from dataclasses import dataclass


@dataclass
class Task:
    """
    Represents a single todo item with attributes: id, title, description, is_completed.

    Attributes:
        id (int): Unique identifier for the task (auto-generated, positive integer)
        title (str): Title of the task (required, non-empty)
        description (str): Detailed description of the task (optional, can be empty string)
        is_completed (bool): Completion status of the task (default: False)
    """
    id: int
    title: str
    description: str = ""
    is_completed: bool = False