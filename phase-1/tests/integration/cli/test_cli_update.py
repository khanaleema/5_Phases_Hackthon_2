"""
Integration tests for the CLI update command in the CLI Todo Application.
"""
import sys
from io import StringIO
from src.cli.main import TodoCLI


class TestCLIUpdateCommand:
    """Test cases for the CLI update command integration."""

    def test_update_task_success(self):
        """Test updating a task via CLI successfully."""
        cli = TodoCLI()

        # Add a task first
        task = cli.service.add_task("Original Title", "Original Description")

        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.update_task(task.id, "New Title", "New Description")
            output = captured_output.getvalue().strip()

            # Check that the success message is printed
            assert f"Task {task.id} updated successfully" in output

            # Verify the task is updated
            updated_task = cli.service.get_task(task.id)
            assert updated_task.title == "New Title"
            assert updated_task.description == "New Description"
        finally:
            # Restore stdout
            sys.stdout = sys.__stdout__

    def test_update_task_preserves_completion_status(self):
        """Test that updating a task preserves its completion status."""
        cli = TodoCLI()

        # Add a task and mark it complete
        task = cli.service.add_task("Original Title", "Original Description")
        cli.service.mark_complete(task.id)

        # Update the task
        cli.update_task(task.id, "New Title", "New Description")

        # Verify completion status is preserved
        updated_task = cli.service.get_task(task.id)
        assert updated_task.is_completed is True
        assert updated_task.title == "New Title"
        assert updated_task.description == "New Description"

    def test_update_nonexistent_task_error(self):
        """Test updating a non-existent task via CLI shows error."""
        cli = TodoCLI()

        # Capture stderr
        captured_output = StringIO()
        sys.stderr = captured_output

        try:
            # This should raise SystemExit due to error
            try:
                cli.update_task(999, "New Title", "New Description")
            except SystemExit:
                pass  # Expected behavior

            output = captured_output.getvalue().strip()

            # Check that the error message is printed
            assert "Error:" in output
            assert "not found" in output.lower()
        finally:
            # Restore stderr
            sys.stderr = sys.__stderr__

    def test_update_task_empty_title_error(self):
        """Test updating a task with empty title via CLI shows error."""
        cli = TodoCLI()

        # Add a task first
        task = cli.service.add_task("Original Title", "Original Description")

        # Capture stderr
        captured_output = StringIO()
        sys.stderr = captured_output

        try:
            # This should raise SystemExit due to error
            try:
                cli.update_task(task.id, "", "New Description")
            except SystemExit:
                pass  # Expected behavior

            output = captured_output.getvalue().strip()

            # Check that the error message is printed
            assert "Error:" in output
            assert "title cannot be empty" in output.lower()
        finally:
            # Restore stderr
            sys.stderr = sys.__stderr__

    def test_update_task_title_too_long_error(self):
        """Test updating a task with title too long via CLI shows error."""
        cli = TodoCLI()
        long_title = "A" * 256  # 256 characters, exceeding the 255 limit

        # Add a task first
        task = cli.service.add_task("Original Title", "Original Description")

        # Capture stderr
        captured_output = StringIO()
        sys.stderr = captured_output

        try:
            # This should raise SystemExit due to error
            try:
                cli.update_task(task.id, long_title, "New Description")
            except SystemExit:
                pass  # Expected behavior

            output = captured_output.getvalue().strip()

            # Check that the error message is printed
            assert "Error:" in output
            assert "title must be" in output.lower()
            assert "characters or less" in output.lower()
        finally:
            # Restore stderr
            sys.stderr = sys.__stderr__

    def test_update_task_reflected_in_list(self):
        """Test that an updated task shows new values when listed."""
        cli = TodoCLI()

        # Add a task
        task = cli.service.add_task("Original Title", "Original Description")

        # Update the task
        cli.update_task(task.id, "Updated Title", "Updated Description")

        # Capture list output
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.list_tasks()
            output = captured_output.getvalue()

            # Check that the updated values appear in the list
            assert "Updated Title" in output
            assert "Updated Description" in output
            assert "Original Title" not in output
        finally:
            # Restore stdout
            sys.stdout = sys.__stdout__

    def test_update_task_with_special_characters(self):
        """Test updating a task with special characters in title and description."""
        cli = TodoCLI()

        # Add a task
        task = cli.service.add_task("Original Title", "Original Description")

        # Update with special characters
        special_title = "Title with @#$%^&*()"
        special_description = "Description with [brackets] and {braces}"

        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.update_task(task.id, special_title, special_description)
            output = captured_output.getvalue().strip()

            # Check that the success message is printed
            assert f"Task {task.id} updated successfully" in output

            # Verify the task is updated with special characters
            updated_task = cli.service.get_task(task.id)
            assert updated_task.title == special_title
            assert updated_task.description == special_description
        finally:
            # Restore stdout
            sys.stdout = sys.__stdout__