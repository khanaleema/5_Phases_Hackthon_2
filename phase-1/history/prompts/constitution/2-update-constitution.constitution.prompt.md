---
id: 2
title: update-constitution
stage: constitution
date: 2025-12-13
surface: agent
model: Claude Sonnet 4.5
feature: none
branch: master
user: user
command: User request to update constitution
labels: [constitution, update, governance]
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

Update my project constitution for the Basic Command‑Line Todo Application so it fully matches the assignment. Keep all existing principles, but:

Explicitly mention that the working console app must demonstrate: adding tasks, listing tasks with status indicators, updating task details, deleting tasks by ID, and marking tasks complete/incomplete.

Ensure the workflow uses the correct Spec‑Kit Plus commands (/sp.specify, /sp.plan, /sp.tasks, /sp.implement, /sp.clarify) where appropriate.

Verify the repository expectations include: constitution file, specs history folder, /src directory, README.md with UV setup + run instructions, and CLAUDE.md with Claude Code usage.

Make any small wording improvements needed while keeping the scope as a basic, memory‑only CLI todo app.

## Response snapshot

Updated the CLI Todo Application constitution to version 1.0.1. Modified the Clean CLI Interface principle (V) to explicitly mention the 5 required operations: adding tasks, listing tasks with status indicators, updating task details, deleting tasks by ID, and marking tasks complete/incomplete. Updated the Development Workflow section to reference the correct Spec-Kit Plus commands (/sp.specify, /sp.plan, /sp.tasks, /sp.implement, /sp.clarify). Added a new "Repository and Documentation Expectations" section that specifies all required repository components. The Sync Impact Report indicates the version change from 1.0.0 to 1.0.1 and notes that templates may need updates.

## Outcome

- ✅ Impact: Updated constitution to be more specific about required functionality and workflow
- 🧪 Tests: none
- 📁 Files: Updated .specify/memory/constitution.md with more specific requirements
- 🔁 Next prompts: Proceed with project specification using /sp.specify
- 🧠 Reflection: Constitution now clearly defines the 5 core operations and proper workflow

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin project specification phase with updated constitution