# CLI Todo Application - Phase I

A command-line todo application built using spec-driven development with Claude Code and Spec-Kit Plus.

## Project Overview

This is Phase I of "The Evolution of Todo" project - a simple command-line todo application that stores tasks in memory (with JSON file persistence) using Python 3.13+ and UV.

## Features

✅ **All 5 Basic Level Features Implemented:**
- ✅ Add tasks with title and description
- ✅ List all tasks with status indicators
- ✅ Update task details
- ✅ Delete tasks by ID
- ✅ Mark tasks as complete/incomplete

## Technology Stack

- **UV** - Package and environment management
- **Python 3.13+** - Programming language
- **Claude Code** - AI-assisted development
- **Spec-Kit Plus** - Spec-driven development workflow

## Prerequisites

- Python 3.13 or higher
- UV package manager
- Git (for version control)

### Installing UV

```bash
# On Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# On macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd evolution_of_todo
```

### 2. Install Dependencies

```bash
# Sync dependencies and create virtual environment
uv sync --dev

# Install the project in editable mode
uv pip install -e .
```

### 3. Install Testing Dependencies (Optional)

```bash
uv pip install pytest pytest-mock
```

## Running the Application

### Basic Usage

```bash
# Run the CLI application
python -m src.cli.main <command>
```

### Available Commands

#### Add a Task
```bash
python -m src.cli.main add "Task title" "Task description"
```

#### List All Tasks
```bash
python -m src.cli.main list
```

#### Update a Task
```bash
python -m src.cli.main update <id> "New title" "New description"
```

#### Mark Task as Complete
```bash
python -m src.cli.main complete <id>
```

#### Mark Task as Incomplete
```bash
python -m src.cli.main incomplete <id>
```

#### Delete a Task
```bash
python -m src.cli.main delete <id>
```

#### Show Help
```bash
python -m src.cli.main --help
```

### Using the Batch Script (Windows)

A `run.bat` script is provided for easier execution on Windows:

```bash
.\run.bat add "Task title" "Description"
.\run.bat list
.\run.bat update 1 "New title" "New description"
.\run.bat complete 1
.\run.bat delete 1
```

## Example Usage

```bash
# Add a new task
$ python -m src.cli.main add "Buy groceries" "Milk, bread, eggs"
Task added successfully with ID 1

# List all tasks
$ python -m src.cli.main list
ID   Status       Title                          Description
----------------------------------------------------------------------
1    Incomplete   Buy groceries                  Milk, bread, eggs

# Mark task as complete
$ python -m src.cli.main complete 1
Task 1 marked as complete

# List tasks again
$ python -m src.cli.main list
ID   Status       Title                          Description
----------------------------------------------------------------------
1    Complete     Buy groceries                  Milk, bread, eggs

# Update task
$ python -m src.cli.main update 1 "Buy groceries" "Milk, bread, eggs, cheese"
Task 1 updated successfully

# Delete task
$ python -m src.cli.main delete 1
Task 1 deleted successfully
```

## Data Persistence

Tasks are automatically saved to `tasks.json` file in the project root. This file is created automatically when you add your first task and persists across command invocations.

## Running Tests

```bash
# Run all tests
python -m pytest

# Run with verbose output
python -m pytest -v

# Run specific test file
python -m pytest tests/unit/models/test_task.py

# Run with coverage
python -m pytest --cov=src
```

## Project Structure

```
evolution_of_todo/
├── .specify/
│   └── memory/
│       └── constitution.md          # Project constitution and principles
├── history/
│   └── prompts/
│       ├── constitution/           # Constitution change history
│       └── spec/                    # Spec-driven development history
│           ├── 001-cli-todo-spec.spec.prompt.md
│           ├── 002-cli-todo-plan.plan.prompt.md
│           ├── 003-cli-todo-tasks.tasks.prompt.md
│           └── 004-cli-todo-implement.implement.prompt.md
├── specs/
│   └── 001-cli-todo-spec/
│       ├── spec.md                  # Functional specification
│       ├── plan.md                  # Implementation plan
│       ├── tasks.md                 # Task breakdown
│       ├── data-model.md            # Data model documentation
│       ├── quickstart.md            # Quick start guide
│       └── contracts/               # API contracts
├── src/
│   ├── cli/
│   │   └── main.py                  # CLI entry point
│   ├── models/
│   │   └── task.py                  # Task data model
│   ├── services/
│   │   └── task_service.py          # Business logic
│   ├── lib/
│   │   ├── store.py                 # In-memory store (legacy)
│   │   └── file_store.py            # File-based store with JSON persistence
│   └── exceptions.py                # Custom exceptions
├── tests/
│   ├── unit/                        # Unit tests
│   └── integration/                 # Integration tests
├── tasks.json                       # Persistent task storage (auto-generated)
├── pyproject.toml                  # Project configuration
├── uv.lock                         # UV dependency lock file
├── README.md                       # This file
└── CLAUDE.md                       # Claude Code instructions
```

## Development Workflow

This project follows **Spec-Driven Development (SDD)** using Spec-Kit Plus:

1. **Spec** (`/sp.specify`) - Create functional specification
2. **Plan** (`/sp.plan`) - Generate implementation plan
3. **Tasks** (`/sp.tasks`) - Break down into testable tasks
4. **Implement** (`/sp.implement`) - Implement following the spec and plan

All development history is tracked in `history/prompts/` directory.

## Constitution

This project follows a strict constitution defined in `.specify/memory/constitution.md`. Key principles:

- **Simplicity and Clarity** - Readable, maintainable code
- **Type Safety** - All public functions have type hints and docstrings
- **Test-First Development** - All functionality covered by tests
- **File Persistence** - Tasks persist to JSON file between commands
- **Clean CLI Interface** - Intuitive commands with helpful error messages
- **Modular Architecture** - Clear separation of concerns

## Windows Users: WSL 2 Setup

Windows users should use WSL 2 (Windows Subsystem for Linux) for development:

```powershell
# Install WSL 2
wsl --install

# Set WSL 2 as default
wsl --set-default-version 2

# Install Ubuntu
wsl --install -d Ubuntu-22.04
```

However, this project also works natively on Windows with PowerShell.

## Contributing

This project follows spec-driven development. All changes must:
1. Start with a spec (`/sp.specify`)
2. Generate a plan (`/sp.plan`)
3. Break into tasks (`/sp.tasks`)
4. Implement following the spec (`/sp.implement`)

## License

MIT License

## Status

✅ **Phase I Complete** - All 5 basic features implemented and tested

---

**Built with** Claude Code + Spec-Kit Plus | **Version** 0.1.0

