---
id: 3
title: update-constitution-ai-agents
stage: constitution
date: 2025-12-13
surface: agent
model: Claude Sonnet 4.5
feature: none
branch: master
user: user
command: User request to update constitution for AI sub-agents
labels: [constitution, ai-agents, skills, governance]
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

Please read the existing constitution for my Basic Command‑Line Todo Application and update it to support AI sub‑agents and skills.

Keep all current principles, but:

Add a new core principle that allows multiple AI sub‑agents and reusable skills, as long as they follow this constitution and the spec‑driven workflow.

State that each sub‑agent must have a clear, narrow role (for example: writing specs, planning, implementation, testing, or refactoring) and must not bypass the specification or plan.

In the Technical Standards section, add that sub‑agents and skills should read the constitution and specs first, then work only on focused tasks such as generating tests, improving error messages, or refactoring.

In the Governance section, add that every sub‑agent or skill must be documented in the repository (for example in CLAUDE.md or agents-and-skills.md) and they must not introduce features that conflict with the constitution (like persistence or a GUI) unless the constitution is officially updated through the proper amendment process.

## Response snapshot

Updated the CLI Todo Application constitution to version 1.0.2. Added a new Core Principle VII: AI Sub-Agents and Skills that allows multiple AI sub-agents and reusable skills as long as they follow the constitution and spec-driven workflow. Each sub-agent must have a clear, narrow role and must not bypass the specification or plan. Updated the Technology Standards section to specify that sub-agents and skills should read the constitution and specs first, then work only on focused tasks. Updated the Governance section to require that every sub-agent or skill must be documented in the repository and must not introduce features that conflict with the constitution unless properly amended. The Sync Impact Report indicates the version change from 1.0.1 to 1.0.2.

## Outcome

- ✅ Impact: Updated constitution to properly support AI sub-agents and skills
- 🧪 Tests: none
- 📁 Files: Updated .specify/memory/constitution.md with AI agent guidelines
- 🔁 Next prompts: Continue with project using AI sub-agents as defined
- 🧠 Reflection: Constitution now clearly defines how AI agents can participate in the development workflow

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Implement AI agent workflow