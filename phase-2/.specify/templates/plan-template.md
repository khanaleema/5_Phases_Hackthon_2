# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This feature must comply with all principles in `.specify/memory/constitution.md`:

- [ ] **I. Spec-Driven Development**: This plan was created via `/sp.plan` after `/sp.specify`
- [ ] **II. Monorepo Architecture**: Changes respect `/frontend` and `/backend` boundaries
- [ ] **III. Type Safety**: All data contracts use Pydantic (backend) and TypeScript (frontend)
- [ ] **IV. Security-First**: User isolation via JWT `user_id` filtering in all queries; `/api/{user_id}/` routes
- [ ] **V. Test-First Development**: Testing strategy includes unit, integration, and API/E2E tests
- [ ] **VI. Production-Grade Persistence**: Uses SQLModel with Neon PostgreSQL (or local Docker)
- [ ] **VII. API Design Standards**: RESTful CRUD + PATCH endpoints with standardized responses
- [ ] **VIII. Responsive and Accessible UI**: Frontend meets mobile-first and WCAG 2.1 Level AA standards
- [ ] **IX. Dockerized Environment**: Local development uses `docker-compose.yml`
- [ ] **X. AI Sub-Agents**: Any agents used follow spec-driven workflow and narrow roles

**Violations Requiring Justification**: [List any principle violations and why they're necessary]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (Phase II Full-Stack Monorepo)

```text
backend/
├── src/
│   ├── models/          # SQLModel schemas (database + Pydantic)
│   ├── services/        # Business logic layer
│   ├── api/             # FastAPI routes (routers)
│   ├── auth/            # JWT verification middleware
│   └── main.py          # FastAPI app entry point
├── tests/
│   ├── unit/            # Service and model tests
│   ├── integration/     # Database operation tests
│   └── api/             # API endpoint contract tests
├── alembic/             # Database migrations
├── pyproject.toml       # Python dependencies (UV)
└── CLAUDE.md            # Backend-specific AI instructions

frontend/
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components
│   ├── lib/             # API clients, utilities
│   └── types/           # TypeScript type definitions
├── tests/
│   ├── components/      # Component tests (React Testing Library)
│   └── e2e/             # End-to-end tests (Playwright)
├── package.json         # Frontend dependencies (pnpm)
└── CLAUDE.md            # Frontend-specific AI instructions

specs/
├── features/            # Feature specifications
├── api/                 # API contract documentation
├── database/            # Schema design docs
└── ui/                  # UI/UX specifications
```

**Structure Decision**: Phase II uses a monorepo with clear backend/frontend separation. Backend is FastAPI + SQLModel + Neon PostgreSQL; Frontend is Next.js 16+ App Router + TypeScript + Tailwind CSS.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
