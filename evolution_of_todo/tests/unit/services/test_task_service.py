"""
Unit tests for the TaskService in the CLI Todo Application.
"""
import pytest
from src.models.task import Task
from src.lib.store import InMemoryTaskStore
from src.services.task_service import TaskService


class TestTaskService:
    """Test cases for TaskService functionality."""

    def setup_method(self):
        """Set up a fresh TaskService for each test."""
        self.store = InMemoryTaskStore()
        self.service = TaskService(self.store)

    def test_add_task_success(self):
        """Test adding a task successfully."""
        task = self.service.add_task("Test Title", "Test Description")

        assert task.id == 1
        assert task.title == "Test Title"
        assert task.description == "Test Description"
        assert task.is_completed is False

        # Verify the task is stored
        retrieved_task = self.service.get_task(task.id)
        assert retrieved_task is not None
        assert retrieved_task.id == task.id
        assert retrieved_task.title == task.title

    def test_add_task_without_description(self):
        """Test adding a task with only a title."""
        task = self.service.add_task("Test Title")

        assert task.id == 1
        assert task.title == "Test Title"
        assert task.description == ""
        assert task.is_completed is False

    def test_add_task_empty_title_error(self):
        """Test that adding a task with empty title raises ValueError."""
        with pytest.raises(ValueError, match="Task title cannot be empty"):
            self.service.add_task("")

        with pytest.raises(ValueError, match="Task title cannot be empty"):
            self.service.add_task("   ")

        with pytest.raises(ValueError, match="Task title cannot be empty"):
            self.service.add_task("\t\n")

    def test_add_task_title_too_long_error(self):
        """Test that adding a task with title exceeding 255 characters raises ValueError."""
        long_title = "A" * 256  # 256 characters, exceeding the 255 limit
        with pytest.raises(ValueError, match="Task title must be 255 characters or less"):
            self.service.add_task(long_title)

    def test_add_task_description_too_long_error(self):
        """Test that adding a task with description exceeding 1000 characters raises ValueError."""
        long_description = "A" * 1001  # 1001 characters, exceeding the 1000 limit
        with pytest.raises(ValueError, match="Task description must be 1000 characters or less"):
            self.service.add_task("Test Title", long_description)

    def test_get_task_success(self):
        """Test retrieving an existing task."""
        task = self.service.add_task("Test Title", "Test Description")

        retrieved_task = self.service.get_task(task.id)

        assert retrieved_task is not None
        assert retrieved_task.id == task.id
        assert retrieved_task.title == task.title
        assert retrieved_task.description == task.description
        assert retrieved_task.is_completed == task.is_completed

    def test_get_task_not_found(self):
        """Test retrieving a non-existing task returns None."""
        retrieved_task = self.service.get_task(999)

        assert retrieved_task is None

    def test_get_all_tasks_empty(self):
        """Test getting all tasks when none exist."""
        tasks = self.service.get_all_tasks()

        assert tasks == []

    def test_get_all_tasks_with_items(self):
        """Test getting all tasks when some exist."""
        task1 = self.service.add_task("Task 1", "Description 1")
        task2 = self.service.add_task("Task 2", "Description 2")

        tasks = self.service.get_all_tasks()

        assert len(tasks) == 2
        assert task1 in tasks
        assert task2 in tasks

    def test_update_task_success(self):
        """Test updating an existing task."""
        original_task = self.service.add_task("Original Title", "Original Description")

        updated_task = self.service.update_task(original_task.id, "New Title", "New Description")

        assert updated_task is not None
        assert updated_task.id == original_task.id
        assert updated_task.title == "New Title"
        assert updated_task.description == "New Description"
        assert updated_task.is_completed == original_task.is_completed  # Should remain unchanged

        # Verify the update is reflected in storage
        retrieved_task = self.service.get_task(original_task.id)
        assert retrieved_task is not None
        assert retrieved_task.title == "New Title"
        assert retrieved_task.description == "New Description"

    def test_update_task_not_found(self):
        """Test updating a non-existing task returns None."""
        result = self.service.update_task(999, "New Title", "New Description")

        assert result is None

    def test_update_task_empty_title_error(self):
        """Test that updating a task with empty title raises ValueError."""
        task = self.service.add_task("Original Title", "Original Description")

        with pytest.raises(ValueError, match="Task title cannot be empty"):
            self.service.update_task(task.id, "", "New Description")

    def test_update_task_title_too_long_error(self):
        """Test that updating a task with title exceeding 255 characters raises ValueError."""
        task = self.service.add_task("Original Title", "Original Description")

        long_title = "A" * 256  # 256 characters, exceeding the 255 limit
        with pytest.raises(ValueError, match="Task title must be 255 characters or less"):
            self.service.update_task(task.id, long_title, "New Description")

    def test_update_task_description_too_long_error(self):
        """Test that updating a task with description exceeding 1000 characters raises ValueError."""
        task = self.service.add_task("Original Title", "Original Description")

        long_description = "A" * 1001  # 1001 characters, exceeding the 1000 limit
        with pytest.raises(ValueError, match="Task description must be 1000 characters or less"):
            self.service.update_task(task.id, "New Title", long_description)

    def test_delete_task_success(self):
        """Test deleting an existing task."""
        task = self.service.add_task("Test Title", "Test Description")

        result = self.service.delete_task(task.id)

        assert result is True

        # Verify the task is no longer in storage
        retrieved_task = self.service.get_task(task.id)
        assert retrieved_task is None

    def test_delete_task_not_found(self):
        """Test deleting a non-existing task returns False."""
        result = self.service.delete_task(999)

        assert result is False

    def test_mark_complete_success(self):
        """Test marking a task as complete."""
        task = self.service.add_task("Test Title", "Test Description")
        assert task.is_completed is False  # Should start as incomplete

        updated_task = self.service.mark_complete(task.id)

        assert updated_task is not None
        assert updated_task.is_completed is True

        # Verify the update is reflected in storage
        retrieved_task = self.service.get_task(task.id)
        assert retrieved_task is not None
        assert retrieved_task.is_completed is True

    def test_mark_complete_not_found(self):
        """Test marking a non-existing task as complete returns None."""
        result = self.service.mark_complete(999)

        assert result is None

    def test_mark_incomplete_success(self):
        """Test marking a task as incomplete."""
        task = self.service.add_task("Test Title", "Test Description")
        # First mark it complete
        self.service.mark_complete(task.id)

        updated_task = self.service.mark_incomplete(task.id)

        assert updated_task is not None
        assert updated_task.is_completed is False

        # Verify the update is reflected in storage
        retrieved_task = self.service.get_task(task.id)
        assert retrieved_task is not None
        assert retrieved_task.is_completed is False

    def test_mark_incomplete_not_found(self):
        """Test marking a non-existing task as incomplete returns None."""
        result = self.service.mark_incomplete(999)

        assert result is None