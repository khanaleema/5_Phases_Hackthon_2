"""
Integration tests for the CLI list command in the CLI Todo Application.
"""
import sys
from io import StringIO
from src.cli.main import TodoCLI


class TestCLIListCommand:
    """Test cases for the CLI list command integration."""

    def test_list_tasks_empty(self):
        """Test listing tasks when none exist."""
        cli = TodoCLI()

        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.list_tasks()
            output = captured_output.getvalue().strip()

            # Check that the "No tasks found" message is printed
            assert "No tasks found" in output
        finally:
            # Restore stdout
            sys.stdout = sys.__stdout__

    def test_list_tasks_with_single_task(self):
        """Test listing tasks when one exists."""
        cli = TodoCLI()

        # Add a task first
        cli.service.add_task("Test Task", "Test Description")

        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.list_tasks()
            output = captured_output.getvalue().strip()

            # Check that the task is displayed
            assert "Test Task" in output
            assert "Test Description" in output
            assert "Incomplete" in output  # Default status
        finally:
            # Restore stdout
            sys.stdout = sys.__stdout__

    def test_list_tasks_with_multiple_tasks(self):
        """Test listing tasks when multiple exist."""
        cli = TodoCLI()

        # Add multiple tasks
        cli.service.add_task("Task 1", "Description 1")
        cli.service.add_task("Task 2", "Description 2")
        cli.service.add_task("Task 3", "Description 3")

        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.list_tasks()
            output = captured_output.getvalue()

            # Check that all tasks are displayed
            assert "Task 1" in output
            assert "Task 2" in output
            assert "Task 3" in output
            assert "Description 1" in output
            assert "Description 2" in output
            assert "Description 3" in output

            # Check that the table headers are present
            assert "ID" in output
            assert "Status" in output
            assert "Title" in output
            assert "Description" in output
        finally:
            # Restore stdout
            sys.stdout = sys.__stdout__

    def test_list_tasks_with_completed_task(self):
        """Test listing tasks when one is completed."""
        cli = TodoCLI()

        # Add a task and mark it complete
        task = cli.service.add_task("Test Task", "Test Description")
        cli.service.mark_complete(task.id)

        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.list_tasks()
            output = captured_output.getvalue()

            # Check that the completed task shows as "Complete"
            assert "Complete" in output
            assert "Test Task" in output
        finally:
            # Restore stdout
            sys.stdout = sys.__stdout__

    def test_list_tasks_formatting(self):
        """Test that the list output has proper formatting."""
        cli = TodoCLI()

        # Add a task
        cli.service.add_task("Test Task", "Test Description")

        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output

        try:
            cli.list_tasks()
            output = captured_output.getvalue()

            # Check that the table format is present
            lines = output.split('\n')
            # There should be a header line with separators
            header_found = any('ID' in line and 'Status' in line and 'Title' in line for line in lines)
            assert header_found

            # Check for separator line
            separator_found = any('-' * 70 in line for line in lines)
            assert separator_found
        finally:
            # Restore stdout
            sys.stdout = sys.__stdout__