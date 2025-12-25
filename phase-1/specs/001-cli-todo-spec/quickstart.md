# Quickstart Guide: CLI Todo Application

## Prerequisites
- Python 3.13+
- UV package manager

## Setup
1. Clone the repository
2. Install dependencies: `uv sync`
3. Activate virtual environment: `source .venv/bin/activate` (Linux/Mac) or `uv venv\Scripts\activate` (Windows)

## Running the Application
```bash
# Run the CLI application
python -m src.cli.main

# Or use the installed command if available
todo
```

## Available Commands
```bash
# Add a new task
todo add "Task title" "Task description (optional)"

# List all tasks
todo list

# Update an existing task
todo update 1 "New title" "New description"

# Mark task as complete
todo complete 1

# Mark task as incomplete
todo incomplete 1

# Delete a task
todo delete 1

# Show help
todo --help
```

## Example Usage
```bash
# Add a new task
$ todo add "Buy groceries" "Milk, bread, eggs"

# List all tasks
$ todo list
ID  Title              Description        Status
1   Buy groceries      Milk, bread, eggs  Incomplete

# Mark task as complete
$ todo complete 1

# List tasks to see the updated status
$ todo list
ID  Title              Description        Status
1   Buy groceries      Milk, bread, eggs  Complete
```

## Running Tests
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/unit/test_task_service.py

# Run with coverage
pytest --cov=src
```