---
id: 001
title: Phase II Full-Stack Constitution Creation
stage: constitution
date: 2025-12-18
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: user
command: /sp.constitution
labels: ["constitution", "phase-2", "full-stack", "monorepo", "better-auth", "jwt", "sqlmodel", "nextjs", "fastapi"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md (created)
  - .specify/templates/plan-template.md (updated Constitution Check section)
  - .specify/templates/tasks-template.md (updated path conventions and sample tasks)
tests:
  - N/A (constitution document, no tests)
---

## Prompt

"Act as a Lead System Architect to establish a strict Project Constitution for Phase II: Full-Stack Web Evolution.

1. NON-NEGOTIABLE DEVELOPMENT PARADIGM:
- STRICT Spec-Driven Development (SDD): Zero manual code edits. All logic must be updated via specs in /specs/ first.
- Methodology: /sp.specify (What/Why) → /sp.plan (How/Blueprint) → /sp.tasks (Atomic Units) → /sp.implement (Execution).

2. MONOREPO ARCHITECTURE:
- Folder Structure:
  - /frontend (Next.js 16+ App Router, TS, Tailwind)
  - /backend (FastAPI, Python 3.13+, SQLModel)
  - /specs (Organized: /features, /api, /database, /ui)
  - /.spec-kit/ (Config and templates)
- Instruction Context: Layered CLAUDE.md files in Root, Frontend, and Backend folders to maintain localized coding patterns.

3. TECH STACK & PERSISTENCE:
- Backend ORM: SQLModel for all schema definitions and queries.
- Database: Neon Serverless PostgreSQL (Production-grade).
- Deployment: Dockerized environment using root docker-compose.yml for local orchestration.

4. SECURITY & IDENTITY PROTOCOL (Better Auth + FastAPI JWT):
- Authentication: Implement Better Auth on the Frontend with the JWT Plugin enabled.
- JWT Bridge: Frontend must attach the JWT token in the 'Authorization: Bearer <token>' header for every API request.
- Backend Middleware: FastAPI must implement a custom security middleware to verify JWTs using the shared 'BETTER_AUTH_SECRET'.
- Data Isolation: Non-negotiable User Isolation. Every SQLModel query must filter by the authenticated 'user_id' from the JWT.
- Statelessness: Backend must remain stateless; session validation happens via token verification.

5. API DESIGN & DATA CONTRACTS:
- All endpoints must be prefixed with /api/{user_id}/.
- Required Operations: CRUD (GET, POST, GET {id}, PUT, DELETE) and PATCH for completion status.
- Return Types: Standardized JSON responses using Pydantic schemas.

6. OPTIONAL & ENHANCED REQUIREMENTS:
- User Interface: Must be responsive and accessible.
- Authentication UI: Complete Signup/Signin flows using Better Auth components."

## Response snapshot

Created comprehensive Phase II Full-Stack Web Evolution constitution with 10 core principles:

**I. Spec-Driven Development (NON-NEGOTIABLE)** - Zero manual code edits; mandatory /sp.specify → /sp.plan → /sp.tasks → /sp.implement workflow

**II. Monorepo Architecture with Clear Boundaries** - /frontend (Next.js 16+), /backend (FastAPI), /specs (organized by domain), with layered CLAUDE.md files

**III. Type Safety and Schema-First Design (NON-NEGOTIABLE)** - Pydantic/SQLModel for backend, TypeScript for frontend, OpenAPI auto-generated

**IV. Security-First with Stateless JWT Authentication (NON-NEGOTIABLE)** - Better Auth + JWT plugin on frontend, FastAPI JWT verification middleware, mandatory user_id filtering in all queries, /api/{user_id}/ routing

**V. Test-First Development with Multi-Layer Coverage** - Unit, integration, API tests (backend); component, integration, E2E tests (frontend); red-green-refactor cycle mandatory

**VI. Production-Grade Persistence with Neon PostgreSQL** - SQLModel ORM, Alembic migrations, Neon serverless driver, Docker-based local PostgreSQL

**VII. API Design Standards (RESTful with CRUD + PATCH)** - /api/{user_id}/[resource] routing, CRUD + PATCH operations, standardized JSON responses via Pydantic

**VIII. Responsive and Accessible User Interface** - Mobile-first design, WCAG 2.1 Level AA compliance, Core Web Vitals targets

**IX. Dockerized Local Development Environment** - Root docker-compose.yml orchestrating frontend, backend, database with standard ports

**X. AI Sub-Agents and Skills Integration** - Permitted with narrow roles, must follow spec-driven workflow, documented in repository

Updated dependent templates:
- .specify/templates/plan-template.md: Added Phase II Constitution Check with all 10 principles
- .specify/templates/tasks-template.md: Updated path conventions for monorepo structure and sample tasks for full-stack patterns

## Outcome

- ✅ Impact: Established comprehensive Phase II constitution (v1.0.0) governing full-stack web evolution with strict security, architecture, and workflow requirements
- 🧪 Tests: N/A (constitution document)
- 📁 Files: Created constitution.md, updated plan-template.md and tasks-template.md for consistency
- 🔁 Next prompts: /sp.specify for first full-stack feature, /sp.adr when architectural decisions made
- 🧠 Reflection: Constitution provides clear guardrails for monorepo full-stack development with emphasis on security (JWT user isolation), type safety, and spec-driven workflow. Templates updated to enforce Phase II patterns.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution creation successful
- Graders run and results (PASS/FAIL): Manual validation of template consistency (PASS)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test constitution enforcement during first feature specification (/sp.specify)
