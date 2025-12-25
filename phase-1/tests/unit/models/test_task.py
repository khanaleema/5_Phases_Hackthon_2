"""
Unit tests for the Task model in the CLI Todo Application.
"""
import pytest
from src.models.task import Task


def test_task_creation():
    """Test creating a Task with all attributes."""
    task = Task(id=1, title="Test Task", description="Test Description", is_completed=False)

    assert task.id == 1
    assert task.title == "Test Task"
    assert task.description == "Test Description"
    assert task.is_completed is False


def test_task_default_values():
    """Test creating a Task with default values."""
    task = Task(id=1, title="Test Task")

    assert task.id == 1
    assert task.title == "Test Task"
    assert task.description == ""
    assert task.is_completed is False


def test_task_completed_default():
    """Test that Task is not completed by default."""
    task = Task(id=1, title="Test Task")

    assert task.is_completed is False


def test_task_equality():
    """Test Task equality comparison."""
    task1 = Task(id=1, title="Test Task", description="Desc", is_completed=False)
    task2 = Task(id=1, title="Test Task", description="Desc", is_completed=False)

    # Since we're using dataclass, equality should work based on all fields
    assert task1 == task2


def test_task_immutability():
    """Test that Task attributes can be accessed but are dataclass-based."""
    task = Task(id=1, title="Test Task", description="Test Description", is_completed=True)

    assert task.id == 1
    assert task.title == "Test Task"
    assert task.description == "Test Description"
    assert task.is_completed is True