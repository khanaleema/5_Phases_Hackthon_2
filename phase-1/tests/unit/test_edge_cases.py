"""
Unit tests for edge cases and error conditions in the CLI Todo Application.
"""
import pytest
from src.models.task import Task
from src.lib.store import InMemoryTaskStore
from src.services.task_service import TaskService
from src.exceptions import InvalidTaskError, TaskNotFoundError


class TestEdgeCases:
    """Test cases for edge cases and error conditions."""

    def setup_method(self):
        """Set up a fresh TaskService for each test."""
        self.store = InMemoryTaskStore()
        self.service = TaskService(self.store)

    def test_add_task_empty_title_error(self):
        """Test adding a task with empty title raises InvalidTaskError."""
        with pytest.raises(InvalidTaskError, match="Task title cannot be empty"):
            self.service.add_task("")

        with pytest.raises(InvalidTaskError, match="Task title cannot be empty"):
            self.service.add_task("   ")

        with pytest.raises(InvalidTaskError, match="Task title cannot be empty"):
            self.service.add_task("\t\n")

    def test_add_task_title_too_long_error(self):
        """Test adding a task with title exceeding 255 characters raises InvalidTaskError."""
        long_title = "A" * 256  # 256 characters, exceeding the 255 limit
        with pytest.raises(InvalidTaskError, match="Task title must be 255 characters or less"):
            self.service.add_task(long_title)

    def test_add_task_description_too_long_error(self):
        """Test adding a task with description exceeding 1000 characters raises InvalidTaskError."""
        long_description = "A" * 1001  # 1001 characters, exceeding the 1000 limit
        with pytest.raises(InvalidTaskError, match="Task description must be 1000 characters or less"):
            self.service.add_task("Valid Title", long_description)

    def test_update_task_empty_title_error(self):
        """Test updating a task with empty title raises InvalidTaskError."""
        task = self.service.add_task("Original Title", "Original Description")

        with pytest.raises(InvalidTaskError, match="Task title cannot be empty"):
            self.service.update_task(task.id, "", "New Description")

        with pytest.raises(InvalidTaskError, match="Task title cannot be empty"):
            self.service.update_task(task.id, "   ", "New Description")

    def test_update_task_title_too_long_error(self):
        """Test updating a task with title exceeding 255 characters raises InvalidTaskError."""
        task = self.service.add_task("Original Title", "Original Description")

        long_title = "A" * 256  # 256 characters, exceeding the 255 limit
        with pytest.raises(InvalidTaskError, match="Task title must be 255 characters or less"):
            self.service.update_task(task.id, long_title, "New Description")

    def test_update_task_description_too_long_error(self):
        """Test updating a task with description exceeding 1000 characters raises InvalidTaskError."""
        task = self.service.add_task("Original Title", "Original Description")

        long_description = "A" * 1001  # 1001 characters, exceeding the 1000 limit
        with pytest.raises(InvalidTaskError, match="Task description must be 1000 characters or less"):
            self.service.update_task(task.id, "New Title", long_description)

    def test_get_nonexistent_task_returns_none(self):
        """Test getting a non-existent task returns None."""
        result = self.service.get_task(999)
        assert result is None

    def test_update_nonexistent_task_returns_none(self):
        """Test updating a non-existent task returns None."""
        result = self.service.update_task(999, "New Title", "New Description")
        assert result is None

    def test_delete_nonexistent_task_returns_false(self):
        """Test deleting a non-existent task returns False."""
        result = self.service.delete_task(999)
        assert result is False

    def test_mark_complete_nonexistent_task_returns_none(self):
        """Test marking complete on a non-existent task returns None."""
        result = self.service.mark_complete(999)
        assert result is None

    def test_mark_incomplete_nonexistent_task_returns_none(self):
        """Test marking incomplete on a non-existent task returns None."""
        result = self.service.mark_incomplete(999)
        assert result is None

    def test_store_generates_sequential_ids(self):
        """Test that the store generates sequential IDs starting from 1."""
        task1 = self.service.add_task("Task 1", "Description 1")
        task2 = self.service.add_task("Task 2", "Description 2")
        task3 = self.service.add_task("Task 3", "Description 3")

        assert task1.id == 1
        assert task2.id == 2
        assert task3.id == 3

    def test_store_id_generation_after_deletion(self):
        """Test that ID generation continues after deletion (doesn't reuse IDs)."""
        task1 = self.service.add_task("Task 1", "Description 1")
        task2 = self.service.add_task("Task 2", "Description 2")

        # Delete task1
        self.service.delete_task(task1.id)

        # Add a new task - it should get the next available ID, not reuse the deleted one
        task3 = self.service.add_task("Task 3", "Description 3")

        # In our implementation, IDs are sequential, so task3 should have ID 3
        assert task3.id == 3

    def test_task_with_special_characters(self):
        """Test creating and updating tasks with special characters."""
        special_title = "Task with @#$%^&*() special chars"
        special_description = "Description with [brackets], {braces}, and \"quotes\""

        # Add task with special characters
        task = self.service.add_task(special_title, special_description)

        assert task.title == special_title
        assert task.description == special_description

        # Update task with different special characters
        new_special_title = "Updated title with <>?/\\|`~!@#$%^&*()"
        new_special_description = "Updated description with €£¥©®™±÷×¶§"

        updated_task = self.service.update_task(task.id, new_special_title, new_special_description)

        assert updated_task.title == new_special_title
        assert updated_task.description == new_special_description

    def test_long_valid_title_and_description(self):
        """Test creating tasks with titles and descriptions at the length limits."""
        max_title = "A" * 255  # Exactly 255 characters
        max_description = "B" * 1000  # Exactly 1000 characters

        task = self.service.add_task(max_title, max_description)

        assert len(task.title) == 255
        assert len(task.description) == 1000

        # Update with max length values
        updated_task = self.service.update_task(task.id, max_title, max_description)

        assert len(updated_task.title) == 255
        assert len(updated_task.description) == 1000

    def test_empty_description_is_valid(self):
        """Test that empty descriptions are valid."""
        task = self.service.add_task("Valid Title", "")
        assert task.description == ""

        # Also test updating to empty description
        updated_task = self.service.update_task(task.id, "Valid Title", "")
        assert updated_task.description == ""