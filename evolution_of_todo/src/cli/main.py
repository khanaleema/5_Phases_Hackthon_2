"""
CLI entry point for the Todo Application.

This module provides command-line interface for all todo operations.
"""
import argparse
import sys
from typing import List
from src.models.task import Task
from src.lib.file_store import FileTaskStore
from src.services.task_service import TaskService
from src.exceptions import TaskNotFoundError, InvalidTaskError, InvalidTaskIdError


class TodoCLI:
    """
    Command-line interface for the Todo Application.
    """

    def __init__(self):
        """
        Initialize the CLI with task store and service.
        """
        self.store = FileTaskStore()
        self.service = TaskService(self.store)

    def add_task(self, title: str, description: str = ""):
        """
        Add a new task with the given title and description.

        Args:
            title (str): Task title
            description (str): Task description (optional)
        """
        try:
            task = self.service.add_task(title, description)
            print(f"Task added successfully with ID {task.id}")
        except InvalidTaskError as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)

    def list_tasks(self):
        """
        List all tasks with ID, title, description, and completion status.
        """
        tasks = self.service.get_all_tasks()
        if not tasks:
            print("No tasks found")
            return

        print(f"{'ID':<4} {'Status':<12} {'Title':<30} {'Description'}")
        print("-" * 70)
        for task in tasks:
            status = "Complete" if task.is_completed else "Incomplete"
            print(f"{task.id:<4} {status:<12} {task.title:<30} {task.description}")

    def update_task(self, task_id: int, title: str, description: str):
        """
        Update an existing task.

        Args:
            task_id (int): ID of the task to update
            title (str): New title for the task
            description (str): New description for the task
        """
        # Validate task ID
        if task_id <= 0:
            print(f"Error: Task ID must be a positive integer", file=sys.stderr)
            sys.exit(1)

        try:
            result = self.service.update_task(task_id, title, description)
            if result:
                print(f"Task {task_id} updated successfully")
            else:
                print(f"Error: Task with ID {task_id} not found", file=sys.stderr)
                sys.exit(1)
        except InvalidTaskError as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)

    def delete_task(self, task_id: int):
        """
        Delete a task by its ID.

        Args:
            task_id (int): ID of the task to delete
        """
        # Validate task ID
        if task_id <= 0:
            print(f"Error: Task ID must be a positive integer", file=sys.stderr)
            sys.exit(1)

        result = self.service.delete_task(task_id)
        if result:
            print(f"Task {task_id} deleted successfully")
        else:
            print(f"Error: Task with ID {task_id} not found", file=sys.stderr)
            sys.exit(1)

    def mark_complete(self, task_id: int):
        """
        Mark a task as complete.

        Args:
            task_id (int): ID of the task to mark complete
        """
        # Validate task ID
        if task_id <= 0:
            print(f"Error: Task ID must be a positive integer", file=sys.stderr)
            sys.exit(1)

        result = self.service.mark_complete(task_id)
        if result:
            print(f"Task {task_id} marked as complete")
        else:
            print(f"Error: Task with ID {task_id} not found", file=sys.stderr)
            sys.exit(1)

    def mark_incomplete(self, task_id: int):
        """
        Mark a task as incomplete.

        Args:
            task_id (int): ID of the task to mark incomplete
        """
        # Validate task ID
        if task_id <= 0:
            print(f"Error: Task ID must be a positive integer", file=sys.stderr)
            sys.exit(1)

        result = self.service.mark_incomplete(task_id)
        if result:
            print(f"Task {task_id} marked as incomplete")
        else:
            print(f"Error: Task with ID {task_id} not found", file=sys.stderr)
            sys.exit(1)

    def run(self, args: List[str] = None):
        """
        Run the CLI application with the given arguments.

        Args:
            args (List[str], optional): Command line arguments. Defaults to None.
        """
        parser = argparse.ArgumentParser(
            description="CLI Todo Application - A simple command-line todo list manager",
            formatter_class=argparse.RawDescriptionHelpFormatter,
            epilog="""
Examples:
  todo add "Buy groceries" "Milk, bread, eggs"
  todo list
  todo update 1 "Updated title" "Updated description"
  todo complete 1
  todo incomplete 1
  todo delete 1

For more information on a specific command, run: todo <command> --help
            """
        )
        subparsers = parser.add_subparsers(dest="command", help="Available commands")

        # Add command
        add_parser = subparsers.add_parser("add", help="Add a new task")
        add_parser.add_argument("title", help="Task title (1-255 characters)")
        add_parser.add_argument("description", nargs="?", default="", help="Task description (optional, max 1000 characters)")

        # List command
        list_parser = subparsers.add_parser("list", help="List all tasks with ID, status, title, and description")

        # Update command
        update_parser = subparsers.add_parser("update", help="Update an existing task")
        update_parser.add_argument("id", type=int, help="Task ID (positive integer)")
        update_parser.add_argument("title", help="New task title (1-255 characters)")
        update_parser.add_argument("description", help="New task description (max 1000 characters)")

        # Delete command
        delete_parser = subparsers.add_parser("delete", help="Delete a task by ID")
        delete_parser.add_argument("id", type=int, help="Task ID to delete (positive integer)")

        # Complete command
        complete_parser = subparsers.add_parser("complete", help="Mark a task as complete")
        complete_parser.add_argument("id", type=int, help="Task ID to mark complete (positive integer)")

        # Incomplete command
        incomplete_parser = subparsers.add_parser("incomplete", help="Mark a task as incomplete")
        incomplete_parser.add_argument("id", type=int, help="Task ID to mark incomplete (positive integer)")

        # Parse arguments
        parsed_args = parser.parse_args(args)

        # Execute command
        if parsed_args.command == "add":
            self.add_task(parsed_args.title, parsed_args.description)
        elif parsed_args.command == "list":
            self.list_tasks()
        elif parsed_args.command == "update":
            self.update_task(parsed_args.id, parsed_args.title, parsed_args.description)
        elif parsed_args.command == "delete":
            self.delete_task(parsed_args.id)
        elif parsed_args.command == "complete":
            self.mark_complete(parsed_args.id)
        elif parsed_args.command == "incomplete":
            self.mark_incomplete(parsed_args.id)
        else:
            parser.print_help()


def main():
    """
    Main entry point for the CLI application.
    """
    cli = TodoCLI()
    cli.run()


if __name__ == "__main__":
    main()