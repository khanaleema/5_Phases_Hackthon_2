# Data Model: CLI Todo Application

## Task Entity

### Fields
- **id**: `int` - Unique identifier for the task (auto-generated, positive integer)
- **title**: `str` - Title of the task (required, non-empty)
- **description**: `str` - Detailed description of the task (optional, can be empty string)
- **is_completed**: `bool` - Completion status of the task (default: False)

### Validation Rules
- `id` must be a positive integer
- `title` must not be None or empty string
- `title` length must be between 1 and 255 characters
- `description` length must not exceed 1000 characters
- `is_completed` must be a boolean value

### State Transitions
- New task: `is_completed` starts as `False`
- Complete task: `is_completed` changes from `False` to `True`
- Incomplete task: `is_completed` changes from `True` to `False`

## TaskList (In-Memory Store)

### Structure
- **Internal storage**: `Dict[int, Task]` - Dictionary mapping task IDs to Task objects
- **Next ID tracker**: `int` - Counter for generating unique IDs

### Operations
- Add task: Insert Task object with unique ID
- Get task: Retrieve Task object by ID
- Update task: Modify existing Task object by ID
- Delete task: Remove Task object by ID
- List tasks: Return all Task objects in the store

## API Contracts

### TaskService Interface

```python
from typing import List, Optional
from dataclasses import dataclass

@dataclass
class Task:
    id: int
    title: str
    description: str = ""
    is_completed: bool = False

class TaskService:
    def add_task(self, title: str, description: str = "") -> Task:
        """Add a new task with the given title and description.

        Args:
            title: Task title (required)
            description: Task description (optional)

        Returns:
            Task: The newly created task with assigned ID

        Raises:
            ValueError: If title is empty
        """
        pass

    def get_task(self, task_id: int) -> Optional[Task]:
        """Get a task by its ID.

        Args:
            task_id: ID of the task to retrieve

        Returns:
            Task: The task if found, None otherwise
        """
        pass

    def get_all_tasks(self) -> List[Task]:
        """Get all tasks in the system.

        Returns:
            List[Task]: All tasks in the system
        """
        pass

    def update_task(self, task_id: int, title: str, description: str) -> Optional[Task]:
        """Update an existing task.

        Args:
            task_id: ID of the task to update
            title: New title for the task
            description: New description for the task

        Returns:
            Task: Updated task if successful, None if task doesn't exist

        Raises:
            ValueError: If title is empty
        """
        pass

    def delete_task(self, task_id: int) -> bool:
        """Delete a task by its ID.

        Args:
            task_id: ID of the task to delete

        Returns:
            bool: True if task was deleted, False if task didn't exist
        """
        pass

    def mark_complete(self, task_id: int) -> Optional[Task]:
        """Mark a task as complete.

        Args:
            task_id: ID of the task to mark complete

        Returns:
            Task: Updated task if successful, None if task doesn't exist
        """
        pass

    def mark_incomplete(self, task_id: int) -> Optional[Task]:
        """Mark a task as incomplete.

        Args:
            task_id: ID of the task to mark incomplete

        Returns:
            Task: Updated task if successful, None if task doesn't exist
        """
        pass
```

### CLI Command Contracts

- `todo add "title" ["description"]` - Add a new task
- `todo list` - List all tasks with ID, title, description, and completion status
- `todo update <id> "title" "description"` - Update an existing task
- `todo delete <id>` - Delete a task by ID
- `todo complete <id>` - Mark a task as complete
- `todo incomplete <id>` - Mark a task as incomplete
- `todo help` - Display help information