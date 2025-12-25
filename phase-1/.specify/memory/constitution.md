<!--
Sync Impact Report:
Version change: N/A → 1.0.0
Modified principles: N/A (new constitution)
Added sections: All sections (new constitution)
Removed sections: N/A
Templates requiring updates: N/A (first version)
Follow-up TODOs: None
-->
<!--
Sync Impact Report:
Version change: 1.0.1 → 1.0.2
Modified principles: VII. AI Sub-Agents and Skills (new principle added), Technology Standards (updated to include sub-agent guidelines), Governance (updated to include sub-agent documentation requirements)
Added sections: VII. AI Sub-Agents and Skills principle
Removed sections: None
Templates requiring updates: ⚠ pending (.specify/templates/plan-template.md, .specify/templates/spec-template.md, .specify/templates/tasks-template.md)
Follow-up TODOs: None
-->
<!--
Sync Impact Report:
Version change: 1.0.2 → 1.0.3
Modified principles: IV. In-Memory State Management (clarified behavior - tasks don't persist between separate CLI invocations)
Added sections: None
Removed sections: None
Templates requiring updates: N/A
Follow-up TODOs: None
-->
<!--
Sync Impact Report:
Version change: 1.0.3 → 1.0.4
Modified principles: IV. State Management (changed from in-memory only to file-based JSON persistence)
Added sections: None
Removed sections: None
Templates requiring updates: N/A
Follow-up TODOs: None
-->
# CLI Todo Application Constitution

## Core Principles

### I. Simplicity and Clarity
All code must prioritize readability and maintainability over cleverness. Functions should have a single responsibility, use clear names, and minimal side effects. The application should remain simple and focused on the 5 core todo operations without feature creep.

### II. Type Safety and Documentation
All public functions must include type hints and basic docstrings. This ensures code clarity and helps with maintainability. All data structures must be well-defined with appropriate type annotations.

### III. Test-First Development (NON-NEGOTIABLE)
All functionality must be covered by automated tests before implementation. The red-green-refactor cycle must be strictly followed. Tests must verify the 5 core operations: Add, Delete, Update, View/List, and Mark Complete/Incomplete.

### IV. State Management with File Persistence
The application stores tasks in memory during execution and persists them to a JSON file (tasks.json) for persistence between command invocations. This allows tasks to persist across separate CLI command executions. The implementation uses simple JSON file I/O for persistence - no database connections are required. State management should be clean and efficient, with automatic loading on startup and saving on changes.

### V. Clean CLI Interface
The command-line interface must provide clear, intuitive commands for all 5 todo operations: adding tasks, listing tasks with status indicators, updating task details, deleting tasks by ID, and marking tasks complete/incomplete. Error messages must be helpful and formatted consistently. Input validation must be comprehensive with clear feedback to users.

### VI. Modular Architecture
The codebase must separate the CLI entry point from core task management logic. The project structure should be organized under /src with clear module boundaries between data models, business logic, and CLI interface.

### VII. AI Sub-Agents and Skills
The project allows multiple AI sub-agents and reusable skills as long as they follow this constitution and the spec-driven workflow. Each sub-agent must have a clear, narrow role (for example: writing specs, planning, implementation, testing, or refactoring) and must not bypass the specification or plan. Sub-agents and skills should work on focused tasks and integrate seamlessly with the established development workflow.

## Technology Standards

The project must use Python 3.13+ as the implementation language with UV for dependency and environment management. Git must be used for version control. The codebase must follow PEP 8 style guidelines with Black-compatible formatting enforced.

Data representation must use well-defined data structures (dataclasses or classes) that include at least: id, title, description, and is_completed status. All external dependencies must be minimal and justified.

Sub-agents and skills should read the constitution and specs first, then work only on focused tasks such as generating tests, improving error messages, or refactoring. They must not modify the core architecture or introduce features that conflict with the established requirements.

## Development Workflow

All new work must start from Spec-Kit Plus commands (/sp.specify, /sp.plan, /sp.tasks, /sp.implement, /sp.clarify) and must align with this constitution. Specifications must clearly describe user stories for all 5 core operations: adding tasks, listing tasks with status indicators, updating task details, deleting tasks by ID, and marking tasks complete/incomplete. The plan must include main modules, functions, data models, and how CLI commands map to operations.

Implementation must follow the generated spec and plan; changes to requirements should trigger an explicit spec/plan update, not ad-hoc coding. All changes must pass automated tests before merging.

## Repository and Documentation Expectations

The repository must contain: constitution.md, a specs history folder, /src directory with Python source, README.md with UV setup and run instructions, and CLAUDE.md explaining Claude Code usage with Spec-Kit. The README must describe how to install dependencies with UV, run the CLI, and run tests.

## Governance

This constitution supersedes all other development practices for this project. All pull requests and code reviews must verify compliance with these principles. Any amendments to this constitution require explicit documentation, team approval, and a migration plan if needed.

All code changes must reference the specific task from the generated tasks.md file. No implementation work should proceed without proper specification and planning alignment.

Every sub-agent or skill must be documented in the repository (for example in CLAUDE.md or agents-and-skills.md) and they must not introduce features that conflict with the constitution (like persistence or a GUI) unless the constitution is officially updated through the proper amendment process.

**Version**: 1.0.4 | **Ratified**: 2025-12-13 | **Last Amended**: 2025-12-16