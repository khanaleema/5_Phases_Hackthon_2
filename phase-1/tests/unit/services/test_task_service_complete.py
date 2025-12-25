"""
Unit tests for the TaskService mark complete/incomplete functionality in the CLI Todo Application.
"""
import pytest
from src.models.task import Task
from src.lib.store import InMemoryTaskStore
from src.services.task_service import TaskService


class TestTaskServiceCompleteIncomplete:
    """Test cases for TaskService mark complete/incomplete functionality."""

    def setup_method(self):
        """Set up a fresh TaskService for each test."""
        self.store = InMemoryTaskStore()
        self.service = TaskService(self.store)

    def test_mark_complete_success(self):
        """Test marking a task as complete successfully."""
        task = self.service.add_task("Test Title", "Test Description")
        assert task.is_completed is False  # Should start as incomplete

        result = self.service.mark_complete(task.id)

        assert result is not None
        assert result.id == task.id
        assert result.is_completed is True
        assert result.title == task.title
        assert result.description == task.description

        # Verify the change is persisted
        retrieved_task = self.service.get_task(task.id)
        assert retrieved_task.is_completed is True

    def test_mark_complete_nonexistent_task(self):
        """Test marking a non-existent task as complete returns None."""
        result = self.service.mark_complete(999)

        assert result is None

    def test_mark_incomplete_success(self):
        """Test marking a task as incomplete successfully."""
        task = self.service.add_task("Test Title", "Test Description")
        # First mark it complete
        completed_task = self.service.mark_complete(task.id)
        assert completed_task.is_completed is True

        result = self.service.mark_incomplete(task.id)

        assert result is not None
        assert result.id == task.id
        assert result.is_completed is False
        assert result.title == task.title
        assert result.description == task.description

        # Verify the change is persisted
        retrieved_task = self.service.get_task(task.id)
        assert retrieved_task.is_completed is False

    def test_mark_incomplete_nonexistent_task(self):
        """Test marking a non-existent task as incomplete returns None."""
        result = self.service.mark_incomplete(999)

        assert result is None

    def test_mark_complete_then_incomplete(self):
        """Test marking a task complete then incomplete."""
        task = self.service.add_task("Test Title", "Test Description")
        assert task.is_completed is False

        # Mark complete
        completed_task = self.service.mark_complete(task.id)
        assert completed_task.is_completed is True

        # Mark incomplete again
        incomplete_task = self.service.mark_incomplete(task.id)
        assert incomplete_task.is_completed is False

        # Verify the final state
        retrieved_task = self.service.get_task(task.id)
        assert retrieved_task.is_completed is False

    def test_mark_complete_preserves_other_attributes(self):
        """Test that marking complete doesn't change other task attributes."""
        task = self.service.add_task("Original Title", "Original Description")

        completed_task = self.service.mark_complete(task.id)

        assert completed_task.id == task.id
        assert completed_task.title == task.title
        assert completed_task.description == task.description
        assert completed_task.is_completed is True  # Only this should change

    def test_mark_incomplete_preserves_other_attributes(self):
        """Test that marking incomplete doesn't change other task attributes."""
        task = self.service.add_task("Original Title", "Original Description")
        # First mark it complete
        self.service.mark_complete(task.id)

        incomplete_task = self.service.mark_incomplete(task.id)

        assert incomplete_task.id == task.id
        assert incomplete_task.title == task.title
        assert incomplete_task.description == task.description
        assert incomplete_task.is_completed is False  # Only this should change

    def test_mark_complete_nonexistent_remains_unchanged(self):
        """Test that marking non-existent task doesn't affect existing tasks."""
        existing_task = self.service.add_task("Existing Task", "Description")

        result = self.service.mark_complete(999)
        assert result is None

        # Verify existing task is unchanged
        retrieved_task = self.service.get_task(existing_task.id)
        assert retrieved_task.id == existing_task.id
        assert retrieved_task.is_completed is False

    def test_mark_incomplete_nonexistent_remains_unchanged(self):
        """Test that marking non-existent task as incomplete doesn't affect existing tasks."""
        existing_task = self.service.add_task("Existing Task", "Description")
        # Mark it complete first
        self.service.mark_complete(existing_task.id)

        result = self.service.mark_incomplete(999)
        assert result is None

        # Verify existing task is unchanged
        retrieved_task = self.service.get_task(existing_task.id)
        assert retrieved_task.id == existing_task.id
        assert retrieved_task.is_completed is True  # Should still be complete