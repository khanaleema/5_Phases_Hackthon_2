---
id: 1
title: create-constitution
stage: constitution
date: 2025-12-13
surface: agent
model: Claude Sonnet 4.5
feature: none
branch: master
user: user
command: /sp.constitution
labels: [constitution, setup, governance]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

 You are helping me define the constitution for a basic-level command-line todo application that will be built using Spec-Kit Plus and Claude Code with Python 3.13+ and UV as the package and environment manager. This constitution should define the non‑negotiable principles, technical standards, and workflow rules for the project.

Project purpose

Build a simple, reliable CLI todo app that stores tasks in memory only (no database or files).

Support the 5 basic features: Add, Delete, Update, View/List, and Mark Complete/Incomplete.

Optimize for clarity, maintainability, and learning Spec‑Driven Development, not for advanced features.

Technology stack

Language: Python 3.13+.

Tooling: UV for dependency and environment management, Git for version control.

AI assistant: Claude Code, orchestrated by GitHub Spec‑Kit / Spec‑Kit Plus.

Target interface: Command-line only. No GUI or web UI for this basic level.

Architecture and code standards

Follow clean code principles: small functions, clear names, single responsibility, and minimal side effects.

Use a simple, modular Python project structure under /src, separating the CLI entry point from core task management logic.

Represent tasks with a small, well‑defined data structure (e.g., dataclass or class) including at least: id, title, description, is_completed.

Keep state in memory for the entire app lifetime; no persistence beyond process exit.

Require type hints and basic docstrings for public functions.

Enforce consistent formatting (e.g., Black‑style or PEP 8‑compatible) and use clear, helpful error messages for invalid user input.

Spec‑driven workflow rules

All new work must start from Spec‑Kit commands (/specify, /plan, /tasks, /implement) and must align with this constitution.

Specifications must clearly describe user stories for: adding tasks, listing tasks with status indicators, updating details, deleting by ID, and toggling completion.

The plan must include: main modules, functions, data models, and how the CLI commands map to operations.

Implementation must follow the generated spec and plan; changes to requirements should trigger an explicit spec/plan update, not ad‑hoc coding.

Testing and quality

Include basic automated tests for the core task management logic (add, update, delete, mark complete/incomplete, list).

Tests should be runnable via a simple command (for example uv run pytest or similar) and must pass before merging changes.

Avoid over‑engineering; prioritize simplicity and readability over cleverness.

Repository and documentation expectations

The repository must contain: constitution.md, a specs history folder, /src with Python source, README.md with setup and run instructions, and CLAUDE.md explaining how to use Claude Code + Spec‑Kit for this project.

The README must describe how to install dependencies with UV, run the CLI, and run tests.

Using the standard Spec‑Kit constitution template, fill in and refine all relevant sections so that this file can act as a stable, opinionated foundation for the en

## Response snapshot

Created a comprehensive constitution for the CLI Todo Application that defines core principles, technology standards, development workflow, and governance rules. The constitution includes six core principles: I. Simplicity and Clarity, II. Type Safety and Documentation, III. Test-First Development (NON-NEGOTIABLE), IV. In-Memory State Management, V. Clean CLI Interface, and VI. Modular Architecture. It also establishes technology standards using Python 3.13+, UV, and Git, defines the development workflow using Spec-Kit commands, and sets governance rules that supersede all other development practices.

## Outcome

- ✅ Impact: Created foundational governance document for the CLI Todo project
- 🧪 Tests: none
- 📁 Files: Created .specify/memory/constitution.md with 6 principles and governance rules
- 🔁 Next prompts: Proceed with project specification using /sp.specify
- 🧠 Reflection: Constitution provides clear guidelines for project development and decision-making

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin project specification phase