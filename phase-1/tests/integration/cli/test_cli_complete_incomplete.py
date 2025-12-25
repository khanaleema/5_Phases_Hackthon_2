"""
Integration tests for the CLI complete and incomplete commands in the CLI Todo Application.
"""
import sys
from io import StringIO
from src.cli.main import TodoCLI


class TestCLICompleteIncompleteCommands:
    """Test cases for the CLI complete and incomplete command integration."""

    def test_complete_task_success(self):
        """Test marking a task as complete via CLI successfully."""
        cli = TodoCLI()

        # Add a task first
        task = cli.service.add_task("Test Task", "Test Description")
        assert task.is_completed is False

        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.mark_complete(task.id)
            output = captured_output.getvalue().strip()

            # Check that the success message is printed
            assert f"Task {task.id} marked as complete" in output

            # Verify the task is now complete
            updated_task = cli.service.get_task(task.id)
            assert updated_task.is_completed is True
        finally:
            # Restore stdout
            sys.stdout = sys.__stdout__

    def test_incomplete_task_success(self):
        """Test marking a task as incomplete via CLI successfully."""
        cli = TodoCLI()

        # Add a task and mark it complete first
        task = cli.service.add_task("Test Task", "Test Description")
        cli.service.mark_complete(task.id)
        assert task.is_completed is True

        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.mark_incomplete(task.id)
            output = captured_output.getvalue().strip()

            # Check that the success message is printed
            assert f"Task {task.id} marked as incomplete" in output

            # Verify the task is now incomplete
            updated_task = cli.service.get_task(task.id)
            assert updated_task.is_completed is False
        finally:
            # Restore stdout
            sys.stdout = sys.__stdout__

    def test_complete_nonexistent_task_error(self):
        """Test marking a non-existent task as complete via CLI shows error."""
        cli = TodoCLI()

        # Capture stderr
        captured_output = StringIO()
        sys.stderr = captured_output

        try:
            # This should raise SystemExit due to error
            try:
                cli.mark_complete(999)
            except SystemExit:
                pass  # Expected behavior

            output = captured_output.getvalue().strip()

            # Check that the error message is printed
            assert "Error:" in output
            assert "not found" in output.lower()
        finally:
            # Restore stderr
            sys.stderr = sys.__stderr__

    def test_incomplete_nonexistent_task_error(self):
        """Test marking a non-existent task as incomplete via CLI shows error."""
        cli = TodoCLI()

        # Capture stderr
        captured_output = StringIO()
        sys.stderr = captured_output

        try:
            # This should raise SystemExit due to error
            try:
                cli.mark_incomplete(999)
            except SystemExit:
                pass  # Expected behavior

            output = captured_output.getvalue().strip()

            # Check that the error message is printed
            assert "Error:" in output
            assert "not found" in output.lower()
        finally:
            # Restore stderr
            sys.stderr = sys.__stderr__

    def test_complete_then_incomplete_via_cli(self):
        """Test marking a task complete then incomplete via CLI."""
        cli = TodoCLI()

        # Add a task
        task = cli.service.add_task("Test Task", "Test Description")
        assert task.is_completed is False

        # Capture stdout for complete command
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.mark_complete(task.id)
            complete_output = captured_output.getvalue().strip()
            assert f"Task {task.id} marked as complete" in complete_output

            # Verify it's complete
            updated_task = cli.service.get_task(task.id)
            assert updated_task.is_completed is True

            # Now mark it incomplete
            captured_output.truncate(0)
            captured_output.seek(0)
            cli.mark_incomplete(task.id)
            incomplete_output = captured_output.getvalue().strip()
            assert f"Task {task.id} marked as incomplete" in incomplete_output

            # Verify it's now incomplete
            final_task = cli.service.get_task(task.id)
            assert final_task.is_completed is False
        finally:
            # Restore stdout
            sys.stdout = sys.__stdout__

    def test_complete_task_reflected_in_list(self):
        """Test that a completed task shows as complete when listed."""
        cli = TodoCLI()

        # Add a task
        task = cli.service.add_task("Test Task", "Test Description")
        assert task.is_completed is False

        # Mark it complete
        cli.mark_complete(task.id)

        # Capture list output
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.list_tasks()
            output = captured_output.getvalue()

            # Check that it shows as complete in the list
            assert "Complete" in output
            assert "Test Task" in output
        finally:
            # Restore stdout
            sys.stdout = sys.__stdout__

    def test_incomplete_task_reflected_in_list(self):
        """Test that an incomplete task shows as incomplete when listed."""
        cli = TodoCLI()

        # Add a task and mark it complete
        task = cli.service.add_task("Test Task", "Test Description")
        cli.service.mark_complete(task.id)

        # Mark it back to incomplete
        cli.mark_incomplete(task.id)

        # Capture list output
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.list_tasks()
            output = captured_output.getvalue()

            # Check that it shows as incomplete in the list
            assert "Incomplete" in output
            assert "Test Task" in output
        finally:
            # Restore stdout
            sys.stdout = sys.__stdout__