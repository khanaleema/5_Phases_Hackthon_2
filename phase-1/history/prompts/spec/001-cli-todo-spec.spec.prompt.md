---
id: 1
title: cli-todo-spec
stage: spec
date: 2025-12-16
surface: agent
model: Claude Sonnet 4.5
feature: cli-todo-spec
branch: 001-cli-todo-spec
user: user
command: /sp.specify
labels: ["spec", "cli", "todo", "functional-requirements"]
links:
  spec: specs/001-cli-todo-spec/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-cli-todo-spec/spec.md
 - specs/001-cli-todo-spec/checklists/requirements.md
tests:
 - null
---

## Prompt

Read the current constitution for my Basic Command-Line Todo Application and create a concise functional spec. The spec must stay within the constitution (Python 3.13+, UV, CLI-only, in-memory tasks, clean code, tests). The app must let a user add tasks (title + description), list tasks with status, update tasks, delete by ID, and mark tasks complete/incomplete.

Design the spec so it can be implemented by multiple AI sub-agents and reusable Skills:

Assume different sub-agents handle specs, planning, coding, and testing.

Call out places where reusable Skills (for example 'CLI-UX pattern', 'test-writer pattern') would be helpful.

Focus on what the system must do: user stories, inputs/outputs, validation rules, edge cases, and clear acceptance criteria for each feature.

## Response snapshot

Created a comprehensive functional specification for the CLI Todo Application that includes:

- 5 prioritized user stories covering the core operations (add, list, update, delete, mark complete/incomplete)
- Detailed acceptance scenarios for each user story
- 12 functional requirements clearly defining system behavior
- Key entities (Task and TaskList) with their attributes
- 6 measurable success criteria that are technology-agnostic
- Edge cases identified and documented

The specification follows the constitution constraints (CLI-only, in-memory storage, Python 3.13+, etc.) and is structured to support implementation by multiple AI sub-agents and reusable Skills.

## Outcome

- ✅ Impact: Created complete functional spec with user stories, requirements, and success criteria
- 🧪 Tests: N/A (specification phase)
- 📁 Files: specs/001-cli-todo-spec/spec.md, specs/001-cli-todo-spec/checklists/requirements.md
- 🔁 Next prompts: /sp.plan to create implementation plan
- 🧠 Reflection: Specification is comprehensive and ready for planning phase

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS - All specification requirements met
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin planning phase with /sp.plan