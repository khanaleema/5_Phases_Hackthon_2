"""
Integration tests for the CLI delete command in the CLI Todo Application.
"""
import sys
from io import StringIO
from src.cli.main import TodoCLI


class TestCLIDeleteCommand:
    """Test cases for the CLI delete command integration."""

    def test_delete_task_success(self):
        """Test deleting a task via CLI successfully."""
        cli = TodoCLI()

        # Add a task first
        task = cli.service.add_task("Test Title", "Test Description")

        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.delete_task(task.id)
            output = captured_output.getvalue().strip()

            # Check that the success message is printed
            assert f"Task {task.id} deleted successfully" in output

            # Verify the task is no longer in storage
            assert cli.service.get_task(task.id) is None
        finally:
            # Restore stdout
            sys.stdout = sys.__stdout__

    def test_delete_nonexistent_task_error(self):
        """Test deleting a non-existent task via CLI shows error."""
        cli = TodoCLI()

        # Capture stderr
        captured_output = StringIO()
        sys.stderr = captured_output

        try:
            # This should raise SystemExit due to error
            try:
                cli.delete_task(999)
            except SystemExit:
                pass  # Expected behavior

            output = captured_output.getvalue().strip()

            # Check that the error message is printed
            assert "Error:" in output
            assert "not found" in output.lower()
        finally:
            # Restore stderr
            sys.stderr = sys.__stderr__

    def test_delete_task_then_verify_absence_in_list(self):
        """Test that a deleted task no longer appears when listing tasks."""
        cli = TodoCLI()

        # Add a task
        task = cli.service.add_task("Test Title", "Test Description")

        # Verify it appears in the list
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.list_tasks()
            list_output = captured_output.getvalue()
            assert "Test Title" in list_output
        finally:
            sys.stdout = sys.__stdout__

        # Delete the task
        captured_output.truncate(0)
        captured_output.seek(0)
        try:
            cli.delete_task(task.id)
            delete_output = captured_output.getvalue().strip()
            assert f"Task {task.id} deleted successfully" in delete_output
        finally:
            sys.stdout = sys.__stdout__

        # Verify it no longer appears in the list
        captured_output.truncate(0)
        captured_output.seek(0)
        try:
            cli.list_tasks()
            final_list_output = captured_output.getvalue()
            assert "Test Title" not in final_list_output
            # Should still show "No tasks found" if it was the only task
            if cli.service.get_all_tasks() == []:
                assert "No tasks found" in final_list_output
        finally:
            sys.stdout = sys.__stdout__

    def test_delete_task_does_not_affect_others(self):
        """Test that deleting one task doesn't affect other tasks via CLI."""
        cli = TodoCLI()

        # Add multiple tasks
        task1 = cli.service.add_task("Task 1", "Description 1")
        task2 = cli.service.add_task("Task 2", "Description 2")
        task3 = cli.service.add_task("Task 3", "Description 3")

        # Delete task2
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.delete_task(task2.id)
            output = captured_output.getvalue().strip()
            assert f"Task {task2.id} deleted successfully" in output
        finally:
            sys.stdout = sys.__stdout__

        # Verify task1 and task3 still exist
        all_tasks = cli.service.get_all_tasks()
        task_titles = [t.title for t in all_tasks]
        assert "Task 1" in task_titles
        assert "Task 3" in task_titles
        assert "Task 2" not in task_titles
        assert len(all_tasks) == 2

    def test_delete_task_then_add_new_task(self):
        """Test deleting a task then adding a new one."""
        cli = TodoCLI()

        # Add a task and delete it
        task = cli.service.add_task("To Be Deleted", "Description")
        cli.delete_task(task.id)

        # Add a new task
        new_task = cli.service.add_task("New Task", "New Description")

        # Verify the new task exists and has a different ID
        assert cli.service.get_task(new_task.id) is not None
        assert new_task.title == "New Task"

        # List tasks to verify only the new one is there (if the deleted one was the only one)
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.list_tasks()
            list_output = captured_output.getvalue()
            assert "New Task" in list_output
            assert "To Be Deleted" not in list_output
        finally:
            sys.stdout = sys.__stdout__

    def test_delete_completed_task(self):
        """Test deleting a task that is marked as complete."""
        cli = TodoCLI()

        # Add a task and mark it complete
        task = cli.service.add_task("Complete Task", "Description")
        cli.service.mark_complete(task.id)

        # Verify it's complete
        completed_task = cli.service.get_task(task.id)
        assert completed_task.is_completed is True

        # Delete the completed task
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.delete_task(task.id)
            output = captured_output.getvalue().strip()
            assert f"Task {task.id} deleted successfully" in output

            # Verify it's gone
            assert cli.service.get_task(task.id) is None
        finally:
            sys.stdout = sys.__stdout__

    def test_delete_task_with_special_characters(self):
        """Test deleting a task that had special characters."""
        cli = TodoCLI()

        # Add a task with special characters
        special_title = "Task with @#$%^&*()"
        special_description = "Description with [brackets] and {braces}"
        task = cli.service.add_task(special_title, special_description)

        # Delete the task
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.delete_task(task.id)
            output = captured_output.getvalue().strip()

            # Check that the success message is printed
            assert f"Task {task.id} deleted successfully" in output

            # Verify the task is gone
            assert cli.service.get_task(task.id) is None
        finally:
            sys.stdout = sys.__stdout__