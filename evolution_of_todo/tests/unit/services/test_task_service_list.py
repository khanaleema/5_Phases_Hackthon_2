"""
Unit tests for the TaskService get_all_tasks functionality in the CLI Todo Application.
"""
import pytest
from src.models.task import Task
from src.lib.store import InMemoryTaskStore
from src.services.task_service import TaskService


class TestTaskServiceList:
    """Test cases for TaskService get_all_tasks functionality."""

    def setup_method(self):
        """Set up a fresh TaskService for each test."""
        self.store = InMemoryTaskStore()
        self.service = TaskService(self.store)

    def test_get_all_tasks_empty(self):
        """Test getting all tasks when none exist."""
        tasks = self.service.get_all_tasks()

        assert tasks == []

    def test_get_all_tasks_with_single_task(self):
        """Test getting all tasks when one exists."""
        task = self.service.add_task("Test Title", "Test Description")

        tasks = self.service.get_all_tasks()

        assert len(tasks) == 1
        assert task in tasks

    def test_get_all_tasks_with_multiple_tasks(self):
        """Test getting all tasks when multiple exist."""
        task1 = self.service.add_task("Title 1", "Description 1")
        task2 = self.service.add_task("Title 2", "Description 2")
        task3 = self.service.add_task("Title 3", "Description 3")

        tasks = self.service.get_all_tasks()

        assert len(tasks) == 3
        assert task1 in tasks
        assert task2 in tasks
        assert task3 in tasks

    def test_get_all_tasks_independent_of_other_operations(self):
        """Test that get_all_tasks returns correct tasks after various operations."""
        # Add some tasks
        task1 = self.service.add_task("Title 1", "Description 1")
        task2 = self.service.add_task("Title 2", "Description 2")

        # Mark one as complete
        self.service.mark_complete(task1.id)

        # Update one task
        self.service.update_task(task2.id, "Updated Title", "Updated Description")

        tasks = self.service.get_all_tasks()

        assert len(tasks) == 2
        # Verify the updated task is in the list
        updated_task_exists = any(t.id == task2.id and t.title == "Updated Title" for t in tasks)
        assert updated_task_exists

        # Verify the completed task is in the list
        completed_task_exists = any(t.id == task1.id and t.is_completed for t in tasks)
        assert completed_task_exists