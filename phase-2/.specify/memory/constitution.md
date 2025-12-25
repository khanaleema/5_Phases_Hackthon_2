<!--
Sync Impact Report:
Version change: N/A → 1.0.0
Modified principles: N/A (new constitution)
Added sections: All sections (new Phase II Full-Stack Web constitution)
Removed sections: N/A
Templates requiring updates:
  ✅ .specify/templates/plan-template.md (will validate)
  ✅ .specify/templates/spec-template.md (will validate)
  ✅ .specify/templates/tasks-template.md (will validate)
Follow-up TODOs: None
-->
# Phase II: Full-Stack Web Evolution - Project Constitution

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)
Zero manual code edits. All logic changes MUST be updated via specs in `/specs/` first. The mandatory workflow is: `/sp.specify` (What/Why) → `/sp.plan` (How/Blueprint) → `/sp.tasks` (Atomic Units) → `/sp.implement` (Execution). This ensures all changes are documented, reviewed, and traceable. No ad-hoc coding is permitted.

**Rationale**: Spec-driven development ensures that all changes are intentional, documented, and reviewed before implementation. This prevents technical debt and maintains system integrity.

### II. Monorepo Architecture with Clear Boundaries
The project MUST maintain a monorepo structure with clear separation between frontend and backend:
- `/frontend` - Next.js 16+ App Router, TypeScript, Tailwind CSS
- `/backend` - FastAPI, Python 3.13+, SQLModel ORM
- `/specs` - Organized by domain: `/features`, `/api`, `/database`, `/ui`
- `/.specify/` - Configuration, templates, and scripts

Each layer MUST have localized CLAUDE.md files defining coding patterns and standards specific to that context (Root, Frontend, Backend).

**Rationale**: Clear architectural boundaries prevent coupling, enable independent scaling, and allow specialized tooling per layer.

### III. Type Safety and Schema-First Design (NON-NEGOTIABLE)
All data contracts MUST be defined using type-safe schemas:
- **Backend**: Pydantic models for request/response validation, SQLModel for database schemas
- **Frontend**: TypeScript interfaces derived from backend schemas
- **API**: OpenAPI documentation auto-generated from FastAPI routes

No untyped data structures are permitted. All API contracts MUST be validated at runtime.

**Rationale**: Type safety catches errors at compile time, serves as living documentation, and enables confident refactoring.

### IV. Security-First with Stateless JWT Authentication (NON-NEGOTIABLE)
Authentication MUST follow the Better Auth + FastAPI JWT protocol:
- **Frontend**: Better Auth with JWT plugin enabled; attach JWT in `Authorization: Bearer <token>` header for ALL API requests
- **Backend**: Custom FastAPI security middleware verifies JWTs using shared `BETTER_AUTH_SECRET`
- **User Isolation**: Every SQLModel query MUST filter by authenticated `user_id` from JWT claims
- **Statelessness**: Backend remains stateless; no server-side sessions

All endpoints MUST be prefixed with `/api/{user_id}/` to enforce user isolation at the routing layer.

**Rationale**: JWT-based stateless auth enables horizontal scaling, simplifies deployment, and provides clear audit trails. User isolation prevents unauthorized data access.

### V. Test-First Development with Multi-Layer Coverage
All functionality MUST be covered by automated tests before implementation:
- **Backend**: Unit tests (models, services), Integration tests (database operations), API tests (endpoint contracts)
- **Frontend**: Component tests (React Testing Library), Integration tests (user flows), E2E tests (Playwright)

Tests MUST verify both happy paths and error conditions. The red-green-refactor cycle is mandatory.

**Rationale**: Test-first development catches bugs early, serves as executable documentation, and enables confident refactoring.

### VI. Production-Grade Persistence with Neon PostgreSQL
All data MUST persist to Neon Serverless PostgreSQL in production:
- **ORM**: SQLModel for all schema definitions and queries
- **Migrations**: Alembic for schema versioning (auto-generated from SQLModel models)
- **Connection Pooling**: Neon's built-in serverless driver with automatic pooling
- **Local Development**: Docker-based PostgreSQL via `docker-compose.yml` in repository root

No in-memory or file-based storage is permitted in production.

**Rationale**: Serverless PostgreSQL provides production-grade durability, ACID guarantees, and scales automatically.

### VII. API Design Standards (RESTful with CRUD + PATCH)
All API endpoints MUST follow these conventions:
- **Routing**: `/api/{user_id}/[resource]` (e.g., `/api/{user_id}/todos`)
- **Operations**:
  - `GET /api/{user_id}/todos` - List all user's resources
  - `POST /api/{user_id}/todos` - Create new resource
  - `GET /api/{user_id}/todos/{id}` - Get single resource by ID
  - `PUT /api/{user_id}/todos/{id}` - Update entire resource
  - `PATCH /api/{user_id}/todos/{id}` - Partial update (e.g., completion status)
  - `DELETE /api/{user_id}/todos/{id}` - Delete resource
- **Response Format**: Standardized JSON using Pydantic schemas with consistent error handling

**Rationale**: RESTful conventions provide predictable, self-documenting APIs that frontend developers can easily consume.

### VIII. Responsive and Accessible User Interface
All frontend components MUST meet these standards:
- **Responsive**: Mobile-first design, tested on viewports from 320px to 2560px
- **Accessible**: WCAG 2.1 Level AA compliance (keyboard navigation, screen readers, ARIA labels)
- **Performance**: Core Web Vitals targets (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- **Design System**: Consistent spacing, typography, and color palette (Tailwind configuration)

**Rationale**: Accessible, performant UIs serve all users and improve business outcomes.

### IX. Dockerized Local Development Environment
Local development MUST use Docker for consistency:
- **Root `docker-compose.yml`**: Orchestrates frontend (Next.js dev server), backend (FastAPI with hot reload), database (PostgreSQL)
- **Environment Variables**: `.env.local` files for local overrides (not committed)
- **Port Mapping**: Standard ports (3000 frontend, 8000 backend, 5432 database)

**Rationale**: Docker ensures "works on my machine" problems are eliminated and simplifies onboarding.

### X. AI Sub-Agents and Skills Integration
Multiple AI sub-agents and reusable skills are permitted as long as they:
- Follow this constitution and the spec-driven workflow
- Have clear, narrow roles (e.g., spec writing, planning, implementation, testing, refactoring)
- Do NOT bypass specification or planning phases
- Are documented in repository (CLAUDE.md or agents-and-skills.md)

Sub-agents MUST read the constitution and specs first, then work only on focused tasks.

**Rationale**: Specialized agents enable efficient task execution while maintaining architectural discipline.

## Technology Standards

### Backend Stack
- **Language**: Python 3.13+
- **Framework**: FastAPI (latest stable)
- **ORM**: SQLModel (with Pydantic v2)
- **Database**: Neon Serverless PostgreSQL (production), PostgreSQL 16+ (local Docker)
- **Migrations**: Alembic
- **Testing**: pytest with pytest-asyncio, httpx for API tests
- **Authentication**: JWT verification with `python-jose` and `cryptography`
- **Environment Management**: UV (package and environment manager)

### Frontend Stack
- **Language**: TypeScript 5.0+
- **Framework**: Next.js 16+ with App Router (React Server Components)
- **Styling**: Tailwind CSS 3.4+
- **Authentication**: Better Auth with JWT plugin
- **API Client**: Native fetch with typed wrappers
- **Testing**: Vitest, React Testing Library, Playwright (E2E)
- **Package Manager**: pnpm

### DevOps & Tooling
- **Version Control**: Git with conventional commits
- **Containerization**: Docker + docker-compose
- **Code Formatting**: Black (backend), Prettier (frontend)
- **Linting**: Ruff (backend), ESLint (frontend)
- **Type Checking**: mypy (backend), TypeScript strict mode (frontend)

## Development Workflow

### Specification Phase (`/sp.specify`)
All new work MUST start with a feature specification:
- User stories with acceptance criteria
- Functional requirements (FR-001, FR-002, etc.)
- Key entities and relationships
- Success criteria (measurable outcomes)
- Edge cases and error scenarios

Specifications MUST be technology-agnostic and focus on "what" and "why", not "how".

### Planning Phase (`/sp.plan`)
After specification, create an implementation plan:
- Technical approach and architecture decisions
- API contracts (request/response schemas)
- Database schema (SQLModel models)
- Frontend component hierarchy
- Testing strategy
- Risk analysis and mitigation

Plans MUST include a Constitution Check section verifying compliance with all principles.

### Task Breakdown Phase (`/sp.tasks`)
Convert plan into atomic, testable tasks:
- Each task MUST be independently completable
- Tasks MUST include acceptance tests
- Tasks MUST reference specific files and functions
- Tasks MUST be ordered by dependency

### Implementation Phase (`/sp.implement`)
Execute tasks following red-green-refactor cycle:
- Write failing tests first
- Implement minimal code to pass tests
- Refactor for clarity while keeping tests green
- All changes MUST pass linters and type checkers

### Clarification Protocol (`/sp.clarify`)
When ambiguity arises during any phase:
- Document the specific ambiguity
- Propose 2-3 options with tradeoffs
- Get user decision
- Update spec/plan/tasks accordingly
- Proceed with implementation

## Repository Structure and Documentation

### Required Files
- `README.md` - Project overview, setup instructions, architecture diagram
- `CLAUDE.md` - AI agent instructions (Root, Frontend, Backend)
- `.specify/memory/constitution.md` - This file
- `docker-compose.yml` - Local development orchestration
- `.env.example` - Environment variable template

### Directory Layout
```
/phase-2/
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities and API clients
│   │   └── types/            # TypeScript type definitions
│   ├── tests/
│   ├── CLAUDE.md             # Frontend-specific instructions
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── models/           # SQLModel schemas
│   │   ├── services/         # Business logic
│   │   ├── api/              # FastAPI routes
│   │   └── auth/             # JWT verification middleware
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── api/
│   ├── CLAUDE.md             # Backend-specific instructions
│   ├── alembic/              # Database migrations
│   └── pyproject.toml
├── specs/
│   ├── features/             # Feature specifications
│   ├── api/                  # API contracts
│   ├── database/             # Schema designs
│   └── ui/                   # UI/UX specifications
├── .specify/
│   ├── memory/
│   │   └── constitution.md   # This file
│   ├── templates/            # Spec-Kit templates
│   └── scripts/              # Automation scripts
├── history/
│   ├── prompts/              # Prompt History Records
│   │   ├── constitution/
│   │   ├── general/
│   │   └── [feature-name]/
│   └── adr/                  # Architecture Decision Records
├── docker-compose.yml
├── CLAUDE.md                 # Root-level instructions
└── README.md
```

### Documentation Standards
- All public APIs MUST have docstrings (Python) or JSDoc comments (TypeScript)
- All complex algorithms MUST have inline comments explaining "why", not "what"
- All environment variables MUST be documented in `.env.example`
- All ADRs MUST follow the template in `.specify/templates/adr-template.md`

## Governance

### Amendment Process
This constitution supersedes all other development practices. Any amendments MUST:
1. Be proposed via pull request with rationale
2. Pass review by project maintainers
3. Include migration plan if breaking changes
4. Update version number following semantic versioning:
   - **MAJOR**: Backward-incompatible governance/principle changes
   - **MINOR**: New principle added or materially expanded guidance
   - **PATCH**: Clarifications, wording fixes, non-semantic refinements

### Compliance Requirements
All pull requests MUST:
- Reference specific task from `tasks.md`
- Pass all automated tests and linters
- Include Constitution Check verification
- Document any ADRs for significant decisions

No implementation work proceeds without proper specification and planning alignment.

### Sub-Agent Accountability
Every sub-agent or skill MUST:
- Be documented in repository (CLAUDE.md or dedicated agents documentation)
- NOT introduce features conflicting with constitution unless constitution is officially amended
- Follow the spec-driven workflow without bypassing phases
- Report any constitution violations discovered during execution

**Version**: 1.0.0
**Ratified**: 2025-12-18
**Last Amended**: 2025-12-18
