---
id: 002
title: create-implementation-plan
stage: plan
date: 2025-12-18
surface: phase-2
model: claude-sonnet-4-5
feature: 002-frontend-web-app
branch: 002-frontend-web-app
user: user
command: /sp.plan
labels: [planning, frontend, architecture, api-contracts, data-model]
links:
  spec: specs/002-frontend-web-app/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - path: specs/002-frontend-web-app/research.md
    status: created
    lines_changed: 350
  - path: specs/002-frontend-web-app/data-model.md
    status: created
    lines_changed: 280
  - path: specs/002-frontend-web-app/contracts/tasks-api.md
    status: created
    lines_changed: 520
  - path: specs/002-frontend-web-app/contracts/auth-api.md
    status: created
    lines_changed: 380
  - path: specs/002-frontend-web-app/quickstart.md
    status: created
    lines_changed: 450
  - path: specs/002-frontend-web-app/plan.md
    status: created
    lines_changed: 680
tests:
  - name: Constitution Check
    status: passed
    framework: checklist
---

## Prompt

```text
/sp.plan "@specs/ui/components.md @specs/ui/pages.md @specs/features/authentication-flow.md" "Generate a Detailed Implementation Plan for /frontend following Constitution v2.0.0.

1. AUTH INFRASTRUCTURE: Plan Better Auth (lib/auth.ts) with JWT Plugin. Detail a centralized fetch-wrapper/interceptor in 'lib/api-client.ts' to inject 'Authorization: Bearer <token>' for all FastAPI calls. Plan 'middleware.ts' for server-side route protection and /dashboard redirects.

2. STATE & API SYNC: Design the state management (Context or Zustand) for the Todo list. Detail the 'useTasks' hook logic for GET/POST/PATCH/DELETE using the '/api/${user_id}/tasks' pattern. Include 'useOptimistic' logic for instant UI updates.

3. UI & COMPONENTS: Map the folder structure in 'frontend/src/' (app, components, lib, hooks). Design 'AuthGuard' to wrap protected routes. Plan Tailwind CSS integration, Lucide React icons, and loading skeletons for the TaskList.

4. ERROR & COMPLIANCE: Plan global toast notifications for 401/403/500 errors. Ensure WCAG 2.1 AA compliance with keyboard navigation and ARIA labels."
```

## Response snapshot

Created comprehensive implementation plan for frontend web application at `specs/002-frontend-web-app/plan.md` following Spec-Kit Plus workflow. Executed Phase 0 (Research) and Phase 1 (Design & Contracts) successfully.

**Phase 0: Research & Technology Decisions** (`research.md`):

Resolved all technical unknowns through systematic research:

1. **Authentication**: Better Auth with JWT plugin (stateless, production-ready, backend integration)
2. **API Client**: Custom fetch wrapper with automatic JWT injection (no heavy dependencies)
3. **State Management**: React Context + useReducer (lightweight, sufficient for MVP)
4. **Component Library**: None - custom Tailwind components (full WCAG control, smaller bundle)
5. **Icons**: Lucide React (tree-shakeable, Constitution requirement)
6. **Form Validation**: Zod (type-safe, lightweight, reusable schemas)
7. **Testing**: Vitest + React Testing Library + Playwright (fast, modern, 3-layer pyramid)
8. **Route Protection**: Next.js middleware (server-side, no flash of unauthenticated content)
9. **Performance**: React Server Components + selective Client Components (smaller bundle, faster LCP)
10. **Accessibility**: Semantic HTML + ARIA labels + keyboard navigation (WCAG 2.1 AA)
11. **Error Handling**: Toast notifications + inline form errors (consistent UX)
12. **Dev Environment**: Docker Compose for full stack (deferred to backend team)

**Phase 1: Design & Contracts**:

1. **Data Model** (`data-model.md`):
   - User entity (id, email, createdAt)
   - Task entity (id, user_id, title, description, completed, created_at, updated_at)
   - API response types (ApiResponse<T>, ApiError)
   - Form input types (CreateTaskInput, UpdateTaskInput)
   - Context state types (TaskState, TaskAction)
   - Validation schemas (Zod) for client-side validation
   - Type guards and utilities for runtime checks

2. **API Contracts** (`contracts/`):
   - **tasks-api.md**: 6 REST endpoints (List, Create, Get, Update/PATCH, Delete) with full request/response examples, error codes, security tests, and frontend implementation code
   - **auth-api.md**: 4 auth endpoints (Sign Up, Sign In, Sign Out, Get Session) with JWT structure, security considerations, and Better Auth integration

3. **Quickstart Guide** (`quickstart.md`):
   - Complete developer onboarding (15 minutes setup)
   - Environment setup, project structure explanation
   - Common tasks (new component, new endpoint, optimistic updates)
   - Debugging tips, code style guide, troubleshooting
   - Useful commands and resources

4. **Implementation Plan** (`plan.md`):
   - Technical context (all unknowns resolved)
   - Constitution check (10/10 principles satisfied, zero violations)
   - Detailed architecture for 5 key areas:
     1. Auth infrastructure (Better Auth config, middleware, AuthContext)
     2. API client (fetch wrapper with JWT injection, error handling)
     3. State management (TaskContext with useReducer, useTasks hook)
     4. UI components (hierarchy, TaskList, TaskItem, TaskForm with code examples)
     5. Testing strategy (unit, component, E2E with example tests)
   - Risk analysis (7 risks identified with mitigation strategies)
   - Project structure (complete file tree for frontend/ directory)

**Constitution Check Results**: ✅ **ALL PRINCIPLES SATISFIED**
- Spec-Driven Development: ✅ (plan created after spec)
- Monorepo Architecture: ✅ (frontend-only, respects boundaries)
- Type Safety: ✅ (TypeScript strict mode, types from backend)
- Security-First: ✅ (JWT in all requests, user_id URL pattern)
- Test-First: ✅ (Vitest + RTL + Playwright, 3-layer pyramid)
- Production Persistence: ✅ (N/A for stateless frontend)
- API Standards: ✅ (RESTful CRUD + PATCH consumption)
- Responsive/Accessible: ✅ (mobile-first, WCAG 2.1 AA, keyboard nav)
- Dockerized Environment: ✅ (coordinated with backend docker-compose)
- AI Sub-Agents: ✅ (no sub-agents, single planning agent)

**Key Architectural Decisions**:
1. Next.js App Router with Server Components for initial load (faster FCP, smaller bundle)
2. Context API + useReducer (not Zustand/Redux) for task state management
3. Optimistic updates with rollback on failure (snapshot-based state recovery)
4. Centralized ApiClient class with automatic JWT extraction from Better Auth
5. Server-side middleware for route protection (no flash of unauthenticated content)
6. Three-layer testing: unit (hooks) → component (RTL) → E2E (Playwright)
7. Custom Tailwind components (no Shadcn/MUI) for full accessibility control

## Outcome

- ✅ Impact: Comprehensive implementation plan ready for `/sp.tasks` phase with all design artifacts (research, data model, API contracts, quickstart)
- 🧪 Tests: Constitution check passed (10/10 principles), no violations requiring justification
- 📁 Files: Created 6 documents (research.md, data-model.md, tasks-api.md, auth-api.md, quickstart.md, plan.md) totaling ~2660 lines
- 🔁 Next prompts: `/sp.tasks` to generate atomic task breakdown, then `/sp.implement` for execution
- 🧠 Reflection: Successfully resolved all technical unknowns (12 decisions with alternatives evaluated). Architecture balances simplicity (Context over Zustand, no component library) with production-readiness (Better Auth, WCAG AA, optimistic UI). Risk analysis identified 7 potential issues with concrete mitigation strategies. Ready for task generation and implementation.

## Evaluation notes (flywheel)

- Failure modes observed: Agent context update script failed (template path issue); worked around by skipping (non-blocking for plan completion)
- Graders run and results (PASS/FAIL): Constitution Check - PASS (10/10 items), Technical Context - PASS (all unknowns resolved)
- Prompt variant (if applicable): N/A (initial planning)
- Next experiment (smallest change to try): In `/sp.tasks`, validate that task ordering respects dependencies (auth → state → UI → testing) and each task is independently testable per Constitution Section V
