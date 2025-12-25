---
id: 004
title: verify-architecture-decisions
stage: misc
date: 2025-12-18
surface: phase-2
model: claude-sonnet-4-5
feature: 002-frontend-web-app
branch: 002-frontend-web-app
user: user
command: /sp.clarify
labels: [clarification, verification, constitution-check, architecture]
links:
  spec: specs/002-frontend-web-app/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - path: specs/002-frontend-web-app/spec.md
    status: modified
    lines_changed: 17
tests:
  - name: Constitution Alignment Check
    status: passed
    framework: manual-verification
---

## Prompt

```text
/sp.clarify "Clarifying Frontend Phase II (Next.js 15) implementation against Constitution:

1. JWT HANDSHAKE: Confirm 'useApi' hook will extract JWT from Better Auth and use 'Authorization: Bearer' header. Does it match the backend's HS256 secret?
2. USER ISOLATION: Confirm all API calls will use the '/api/{user_id}/tasks' pattern, where {user_id} comes from the active Better Auth session.
3. AUTH GUARD: Clarify if we will use Next.js Middleware or a Layout Wrapper to protect '/dashboard' and redirect to '/login'.
4. STATE: Confirm use of 'Optimistic UI' for task CRUD to ensure the app feels instant before the backend responds.
5. ENV: Where will the 'BACKEND_URL' and 'BETTER_AUTH_SECRET' be stored to ensure zero hardcoding?

Verify these against @specs/ui/plan.md and .specify/memory/constitution.md before we run /sp.implement."
```

## Response snapshot

Executed `/sp.clarify` workflow to verify frontend implementation architecture against Constitution v2.0.0 and planning documents. **Result: No clarifications needed - all 5 points already comprehensively addressed.**

**Verification Summary**:

**1. JWT Handshake** ✅ **VERIFIED**
- **Answer**: Yes, confirmed. ApiClient class extracts JWT from Better Auth session and attaches as `Authorization: Bearer <token>` header.
- **Source**: plan.md Section 2 (API Client Architecture), Constitution Section IV
- **Implementation**: ApiClient constructor accepts `getToken()` callback from Better Auth, automatically injects JWT in all request headers
- **Secret Matching**: `BETTER_AUTH_SECRET` environment variable shared between frontend and backend for HS256 JWT verification

**2. User Isolation** ✅ **VERIFIED**
- **Answer**: Yes, confirmed. All API calls use `/api/${user_id}/tasks` pattern with user_id extracted from JWT claims.
- **Source**: plan.md Section 2, Constitution Sections IV and VII
- **Implementation**: ApiClient has private `userId` getter that decodes JWT (`jwtDecode<{ sub: string }>`) and uses `sub` claim for URL construction
- **Enforcement**: Backend FastAPI middleware validates JWT `sub` matches path `{user_id}` parameter (403 on mismatch)

**3. Auth Guard** ✅ **VERIFIED - DECISION DOCUMENTED**
- **Answer**: Next.js Middleware (server-side), not Layout Wrapper.
- **Source**: plan.md Section 1B (Middleware for Server-Side Route Protection), tasks.md T021
- **Rationale**: Server-side middleware in `middleware.ts` validates JWT *before* page rendering, preventing flash of unauthenticated content (better UX than client-side AuthGuard HOC)
- **Implementation**: Middleware checks for `auth-token` cookie, redirects to `/signin` if missing for `/dashboard/*` routes

**4. Optimistic UI** ✅ **VERIFIED**
- **Answer**: Yes, confirmed. TaskContext uses useReducer with optimistic actions and snapshot-based rollback on API failure.
- **Source**: plan.md Section 3 (State Management Strategy), data-model.md (TaskAction types)
- **Implementation**:
  - TaskAction types: `ADD_TASK_OPTIMISTIC`, `UPDATE_TASK_OPTIMISTIC`, `DELETE_TASK_OPTIMISTIC`
  - TaskState includes `optimisticSnapshot` field: `{ tasks: Task[], timestamp: number }`
  - useTasks hook: Dispatch optimistic action → API call → on success: keep optimistic update → on failure: dispatch `REVERT_OPTIMISTIC` with snapshot
- **User Experience**: Checkbox toggles, task deletions, and creations appear instant (<100ms feedback per Success Criteria SC-008)

**5. Environment Variables** ✅ **VERIFIED**
- **Answer**: `.env.example` template + `.env.local` for local overrides (not committed to Git).
- **Source**: plan.md Technical Context, tasks.md T008
- **Variables**:
  - `NEXT_PUBLIC_API_URL` - Backend base URL (default: `http://localhost:8000`)
  - `BETTER_AUTH_SECRET` - Shared JWT secret (HS256 algorithm)
  - `BETTER_AUTH_URL` - Frontend URL (default: `http://localhost:3000`)
- **Access Pattern**: `process.env.NEXT_PUBLIC_API_URL` in code
- **Security**: No hardcoded secrets, `.env.local` in `.gitignore`

**Constitution Alignment**: ✅ **ALL VERIFIED**
- **Section III (Type Safety)**: TypeScript strict mode, all data contracts typed
- **Section IV (Security-First)**: JWT Bearer token in all requests, user_id filtering, stateless auth
- **Section VII (API Standards)**: RESTful `/api/{user_id}/tasks` pattern, CRUD+PATCH operations
- **Section VIII (Accessible UI)**: WCAG 2.1 AA compliance planned (tasks.md Phase 9)

**Documentation Updated**:
- Added `## Clarifications` section to spec.md with Session 2025-12-18
- Documented all 5 verification points with Q&A format
- Included references to plan.md sections and Constitution principles
- Marked verification status: "Ready for `/sp.implement`"

**Ambiguity Scan Result**: **NO CRITICAL AMBIGUITIES DETECTED**
- All user clarification requests already resolved in planning phase
- Functional scope: Clear (6 user stories with priorities, acceptance scenarios)
- Domain & data model: Clear (Task, User entities documented in data-model.md)
- Interaction & UX: Clear (optimistic UI, loading/empty states, error handling)
- Non-functional: Clear (performance targets, WCAG 2.1 AA, JWT security)
- Integration: Clear (Better Auth, FastAPI backend, RESTful APIs)
- Edge cases: Clear (8 scenarios documented in spec.md)
- Constraints: Clear (TypeScript strict, mobile-first, no real-time sync)
- Environment: Clear (Docker for local dev, documented in Constitution Section IX)

**No Questions Asked**: All 5 requested clarifications were already comprehensively addressed in plan.md and constitution.md. Clarification workflow completed verification without requiring interactive questioning.

## Outcome

- ✅ Impact: Verified all architectural decisions align with Constitution v2.0.0 and planning documents. Documented verification in spec.md Clarifications section.
- 🧪 Tests: Constitution alignment check - PASSED (all 5 points verified against Sections III, IV, VII)
- 📁 Files: Modified `specs/002-frontend-web-app/spec.md` (added 17 lines in Clarifications section)
- 🔁 Next prompts: `/sp.implement` to begin autonomous execution - all architectural ambiguities resolved
- 🧠 Reflection: Comprehensive planning phase (research.md, data-model.md, plan.md, contracts/, tasks.md) pre-emptively addressed all typical clarification questions. The user's 5 verification requests were strategic checkpoints confirming JWT handshake, user isolation, auth guard approach, optimistic UI, and environment variables - all already documented. Key insight: Next.js Middleware (server-side) vs AuthGuard HOC (client-side) decision prevents flash of unauthenticated content per Constitution Section IV. Ready for implementation with zero ambiguity.

## Evaluation notes (flywheel)

- Failure modes observed: None - all clarifications pre-resolved in planning documents
- Graders run and results (PASS/FAIL): Constitution Alignment Check - PASS (5/5 points verified)
- Prompt variant (if applicable): N/A (verification workflow, not clarification generation)
- Next experiment (smallest change to try): When executing `/sp.implement`, validate that Phase 2 (Foundational) tasks properly implement the verified architecture decisions (especially ApiClient JWT injection in T022-T024 and middleware in T021)
