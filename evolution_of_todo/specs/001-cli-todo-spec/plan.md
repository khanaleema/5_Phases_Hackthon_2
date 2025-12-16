# Implementation Plan: CLI Todo Application

**Branch**: `001-cli-todo-spec` | **Date**: 2025-12-16 | **Spec**: specs/001-cli-todo-spec/spec.md
**Input**: Feature specification from `/specs/001-cli-todo-spec/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementation of a command-line todo application that allows users to add, list, update, delete, and mark tasks complete/incomplete. The application follows the constitution constraints with Python 3.13+, in-memory storage, clean CLI interface, and modular architecture. The implementation separates concerns between data models, business logic, and CLI interface to support maintainability and testability.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: argparse (built-in), dataclasses (built-in), typing (built-in)
**Storage**: In-memory only (no persistence beyond process exit - as required by constitution)
**Testing**: pytest for unit and integration tests
**Target Platform**: Cross-platform (Windows, macOS, Linux)
**Project Type**: Single CLI application
**Performance Goals**: <100ms response time for all operations, support up to 1000 tasks in memory
**Constraints**: No file I/O or database connections, CLI-only interface, follows PEP 8 with Black formatting
**Scale/Scope**: Single-user, in-memory application supporting up to 1000 tasks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ **Simplicity and Clarity**: Functions will have single responsibility with clear names and minimal side effects
- ✅ **Type Safety and Documentation**: All public functions will include type hints and basic docstrings
- ✅ **Test-First Development**: All functionality will be covered by automated tests before implementation
- ✅ **In-Memory State Management**: Application will store tasks in memory only, no persistence beyond process exit
- ✅ **Clean CLI Interface**: Command-line interface will provide clear, intuitive commands for all 5 todo operations
- ✅ **Modular Architecture**: Codebase will separate CLI entry point from core task management logic
- ✅ **Technology Standards**: Using Python 3.13+, UV for dependency management, PEP 8 style with Black formatting
- ✅ **Development Workflow**: Following spec-driven workflow with /sp.specify, /sp.plan, /sp.tasks commands

## Project Structure

### Documentation (this feature)

```text
specs/001-cli-todo-spec/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
src/
├── models/
│   └── task.py          # Task data model with id, title, description, is_completed
├── services/
│   └── task_service.py  # Business logic for task operations (add, update, delete, etc.)
├── cli/
│   └── main.py          # CLI entry point and argument parsing
└── lib/
    └── store.py         # In-memory task storage implementation

tests/
├── unit/
│   ├── models/
│   ├── services/
│   └── cli/
├── integration/
│   └── cli/
└── contract/
    └── task_api.py      # Contract tests for task operations
```

**Structure Decision**: Selected single project structure with clear separation of concerns between models (data), services (business logic), cli (user interface), and lib (utility/storage). This follows the modular architecture requirement from the constitution and supports testability by separating concerns.

## Mapping User Stories to Implementation

### User Story 1 - Add New Tasks (Priority: P1)
- **Function**: `TaskService.add_task(title: str, description: str) -> Task`
- **CLI Command**: `todo add "title" "description"`
- **Implementation**: Creates new Task with unique ID, sets is_completed=False, adds to in-memory store

### User Story 2 - List All Tasks (Priority: P1)
- **Function**: `TaskService.get_all_tasks() -> List[Task]`
- **CLI Command**: `todo list`
- **Implementation**: Returns all tasks from in-memory store with formatting for display

### User Story 3 - Mark Tasks Complete/Incomplete (Priority: P2)
- **Functions**:
  - `TaskService.mark_complete(task_id: int) -> Task`
  - `TaskService.mark_incomplete(task_id: int) -> Task`
- **CLI Commands**: `todo complete <id>` and `todo incomplete <id>`
- **Implementation**: Updates is_completed status of task in in-memory store

### User Story 4 - Update Task Details (Priority: P2)
- **Function**: `TaskService.update_task(task_id: int, title: str, description: str) -> Task`
- **CLI Command**: `todo update <id> "title" "description"`
- **Implementation**: Updates title and description of existing task in in-memory store

### User Story 5 - Delete Tasks (Priority: P2)
- **Function**: `TaskService.delete_task(task_id: int) -> bool`
- **CLI Command**: `todo delete <id>`
- **Implementation**: Removes task from in-memory store by ID

## Sub-Agent and Skill Allocation

- **Spec Agent**: Created initial functional specification
- **Planning Agent** (Current): Creating implementation plan and architecture
- **Implementation Agent**: Will implement the modules (models, services, CLI)
- **Testing Agent**: Will create unit, integration, and contract tests
- **CLI-UX Skill**: For designing intuitive command-line interface
- **Test-Writer Skill**: For generating comprehensive test coverage

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None identified | All requirements align with constitution | Constitution requirements fully satisfied |
