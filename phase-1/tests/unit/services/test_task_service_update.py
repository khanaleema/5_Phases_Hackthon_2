"""
Unit tests for the TaskService update functionality in the CLI Todo Application.
"""
import pytest
from src.models.task import Task
from src.lib.store import InMemoryTaskStore
from src.services.task_service import TaskService


class TestTaskServiceUpdate:
    """Test cases for TaskService update functionality."""

    def setup_method(self):
        """Set up a fresh TaskService for each test."""
        self.store = InMemoryTaskStore()
        self.service = TaskService(self.store)

    def test_update_task_success(self):
        """Test updating a task successfully."""
        original_task = self.service.add_task("Original Title", "Original Description")

        result = self.service.update_task(original_task.id, "New Title", "New Description")

        assert result is not None
        assert result.id == original_task.id
        assert result.title == "New Title"
        assert result.description == "New Description"
        assert result.is_completed == original_task.is_completed  # Should remain unchanged

        # Verify the update is persisted
        retrieved_task = self.service.get_task(original_task.id)
        assert retrieved_task.title == "New Title"
        assert retrieved_task.description == "New Description"

    def test_update_task_with_same_completion_status(self):
        """Test that updating a task preserves its completion status."""
        original_task = self.service.add_task("Original Title", "Original Description")
        # Mark it complete first
        self.service.mark_complete(original_task.id)

        updated_task = self.service.update_task(original_task.id, "New Title", "New Description")

        assert updated_task is not None
        assert updated_task.is_completed is True  # Should remain complete

    def test_update_task_not_found(self):
        """Test updating a non-existent task returns None."""
        result = self.service.update_task(999, "New Title", "New Description")

        assert result is None

    def test_update_task_empty_title_error(self):
        """Test that updating a task with empty title raises ValueError."""
        task = self.service.add_task("Original Title", "Original Description")

        with pytest.raises(ValueError, match="Task title cannot be empty"):
            self.service.update_task(task.id, "", "New Description")

        with pytest.raises(ValueError, match="Task title cannot be empty"):
            self.service.update_task(task.id, "   ", "New Description")

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

    def test_update_task_preserves_id(self):
        """Test that updating a task doesn't change its ID."""
        original_task = self.service.add_task("Original Title", "Original Description")
        original_id = original_task.id

        updated_task = self.service.update_task(original_task.id, "New Title", "New Description")

        assert updated_task.id == original_id

    def test_update_task_with_only_title_change(self):
        """Test updating a task with only the title changed."""
        original_task = self.service.add_task("Original Title", "Original Description")

        updated_task = self.service.update_task(original_task.id, "New Title", original_task.description)

        assert updated_task is not None
        assert updated_task.title == "New Title"
        assert updated_task.description == original_task.description

    def test_update_task_with_only_description_change(self):
        """Test updating a task with only the description changed."""
        original_task = self.service.add_task("Original Title", "Original Description")

        updated_task = self.service.update_task(original_task.id, original_task.title, "New Description")

        assert updated_task is not None
        assert updated_task.title == original_task.title
        assert updated_task.description == "New Description"

    def test_update_task_multiple_times(self):
        """Test updating the same task multiple times."""
        task = self.service.add_task("Original Title", "Original Description")

        # First update
        updated1 = self.service.update_task(task.id, "First Update", "First Description Update")
        assert updated1.title == "First Update"

        # Second update
        updated2 = self.service.update_task(task.id, "Second Update", "Second Description Update")
        assert updated2.title == "Second Update"
        assert updated2.description == "Second Description Update"

        # Verify final state
        final_task = self.service.get_task(task.id)
        assert final_task.title == "Second Update"
        assert final_task.description == "Second Description Update"