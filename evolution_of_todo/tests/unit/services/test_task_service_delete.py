"""
Unit tests for the TaskService delete functionality in the CLI Todo Application.
"""
import pytest
from src.models.task import Task
from src.lib.store import InMemoryTaskStore
from src.services.task_service import TaskService


class TestTaskServiceDelete:
    """Test cases for TaskService delete functionality."""

    def setup_method(self):
        """Set up a fresh TaskService for each test."""
        self.store = InMemoryTaskStore()
        self.service = TaskService(self.store)

    def test_delete_task_success(self):
        """Test deleting a task successfully."""
        task = self.service.add_task("Test Title", "Test Description")

        result = self.service.delete_task(task.id)

        assert result is True

        # Verify the task is no longer in storage
        retrieved_task = self.service.get_task(task.id)
        assert retrieved_task is None

    def test_delete_nonexistent_task(self):
        """Test deleting a non-existent task returns False."""
        result = self.service.delete_task(999)

        assert result is False

    def test_delete_task_then_verify_absence(self):
        """Test that a deleted task cannot be retrieved."""
        task = self.service.add_task("Test Title", "Test Description")

        # Delete the task
        self.service.delete_task(task.id)

        # Verify it's gone
        assert self.service.get_task(task.id) is None
        assert task.id not in [t.id for t in self.service.get_all_tasks()]

    def test_delete_task_does_not_affect_others(self):
        """Test that deleting one task doesn't affect other tasks."""
        task1 = self.service.add_task("Task 1", "Description 1")
        task2 = self.service.add_task("Task 2", "Description 2")
        task3 = self.service.add_task("Task 3", "Description 3")

        # Delete task2
        result = self.service.delete_task(task2.id)
        assert result is True

        # Verify task1 and task3 still exist
        assert self.service.get_task(task1.id) is not None
        assert self.service.get_task(task3.id) is not None

        # Verify task2 is gone
        assert self.service.get_task(task2.id) is None

        # Check that get_all_tasks returns only the remaining tasks
        all_tasks = self.service.get_all_tasks()
        task_ids = [t.id for t in all_tasks]
        assert task1.id in task_ids
        assert task3.id in task_ids
        assert task2.id not in task_ids
        assert len(all_tasks) == 2

    def test_delete_all_tasks(self):
        """Test deleting all tasks."""
        task1 = self.service.add_task("Task 1", "Description 1")
        task2 = self.service.add_task("Task 2", "Description 2")

        # Delete both tasks
        result1 = self.service.delete_task(task1.id)
        result2 = self.service.delete_task(task2.id)

        assert result1 is True
        assert result2 is True

        # Verify no tasks remain
        assert self.service.get_all_tasks() == []
        assert self.service.get_task(task1.id) is None
        assert self.service.get_task(task2.id) is None

    def test_delete_task_with_different_states(self):
        """Test deleting tasks in different completion states."""
        incomplete_task = self.service.add_task("Incomplete Task", "Description")
        complete_task = self.service.add_task("Complete Task", "Description")
        self.service.mark_complete(complete_task.id)  # Mark this one as complete

        # Delete both tasks
        result1 = self.service.delete_task(incomplete_task.id)
        result2 = self.service.delete_task(complete_task.id)

        assert result1 is True
        assert result2 is True

        # Verify both are gone
        assert self.service.get_task(incomplete_task.id) is None
        assert self.service.get_task(complete_task.id) is None

    def test_delete_task_idempotency(self):
        """Test that attempting to delete an already deleted task returns False."""
        task = self.service.add_task("Test Title", "Test Description")

        # Delete the task
        first_result = self.service.delete_task(task.id)
        assert first_result is True

        # Try to delete the same task again
        second_result = self.service.delete_task(task.id)
        assert second_result is False

    def test_delete_preserves_future_ids(self):
        """Test that deleting a task doesn't affect ID generation for new tasks."""
        task1 = self.service.add_task("Task 1", "Description 1")
        task2 = self.service.add_task("Task 2", "Description 2")  # This should have ID 2

        # Delete task1 (ID 1), then add a new task
        self.service.delete_task(task1.id)
        task3 = self.service.add_task("Task 3", "Description 3")  # This should have ID 3, not reuse ID 1

        # Verify the new task has the next available ID
        assert task3.id > task2.id  # Should be 3 if IDs are sequential