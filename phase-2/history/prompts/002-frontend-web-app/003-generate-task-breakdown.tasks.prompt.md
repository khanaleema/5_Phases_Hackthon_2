---
id: 003
title: generate-task-breakdown
stage: tasks
date: 2025-12-18
surface: phase-2
model: claude-sonnet-4-5
feature: 002-frontend-web-app
branch: 002-frontend-web-app
user: user
command: /sp.tasks
labels: [tasks, breakdown, user-stories, dependencies, mvp]
links:
  spec: specs/002-frontend-web-app/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - path: specs/002-frontend-web-app/tasks.md
    status: created
    lines_changed: 620
tests:
  - name: Task Format Validation
    status: passed
    framework: checklist
---

## Prompt

```text
/sp.tasks "Generate Frontend Tasks (Next.js 15+):
1. Setup: Initialize /frontend with pnpm, install better-auth, lucide-react, tailwind-merge.
2. Auth: Config 'lib/auth.ts' & create Signup/Login in '(auth)' route group.
3. API Bridge: Create 'useApi' hook to auto-inject JWT from Better Auth into 'Authorization: Bearer' headers.
4. UI: Build Navbar, TaskList, and TaskForm using Tailwind.
5. Integration: Fetch tasks via 'useApi' using /api/{user_id}/tasks pattern. Implement CRUD with Optimistic UI.
6. Safety: Add middleware to redirect unauthenticated users to /login.
Validation: Each task must verify JWT presence in Network tab. Follow SDD in specs/ui/tasks.md."
```

## Response snapshot

Generated comprehensive task breakdown for frontend web application at `specs/002-frontend-web-app/tasks.md` following Spec-Kit Plus task generation workflow.

**Task Organization**: Organized by user story to enable independent implementation and testing

**User Stories Mapped** (from spec.md):
1. **US1 (P1)**: User Authentication and Onboarding - 8 tasks - 🎯 MVP FOUNDATION
2. **US2 (P2)**: View and Browse Task List - 7 tasks
3. **US3 (P2)**: Create New Task - 7 tasks
4. **US4 (P3)**: Update Task Status (toggle completion) - 3 tasks
5. **US5 (P3)**: Edit Task Details - 3 tasks
6. **US6 (P3)**: Delete Task - 3 tasks

**Phase Structure**:

**Phase 1: Setup (12 tasks)**
- Project initialization, dependency installation, configuration
- All parallelizable: T003-T012 marked [P]
- Time estimate: ~30 minutes

**Phase 2: Foundational (14 tasks) ⚠️ CRITICAL BLOCKER**
- Core types (User, Task, API response types)
- Authentication infrastructure (Better Auth, AuthContext, middleware)
- API client infrastructure (ApiClient class with JWT injection)
- Root layout and navigation structure
- MUST complete before ANY user story work begins

**Phase 3: User Story 1 - Authentication (8 tasks) 🎯 MVP**
- SignInForm, SignUpForm, SignOutButton components
- Auth pages and layouts (/signin route)
- AuthGuard HOC for route protection
- Dashboard shell
- Independent test: Sign up → JWT in cookies → redirect to dashboard

**Phase 4: User Story 2 - View Tasks (7 tasks)**
- TaskContext provider with useReducer
- useTasks hook with fetchTasks method
- TaskSkeleton, EmptyState, TaskItem, TaskList components
- Dashboard integration
- Independent test: View tasks sorted by date, verify user_id in API URL

**Phase 5: User Story 3 - Create Task (7 tasks)**
- Reusable UI components (Button, Input, Modal, Toast)
- TaskForm component with Zod validation
- createTask method with optimistic update
- Independent test: Create task → appears at top → verify POST API call

**Phase 6: User Story 4 - Toggle Status (3 tasks)**
- toggleComplete method with debouncing and rollback
- Functional checkbox in TaskItem
- Independent test: Toggle → immediate UI update → verify PATCH API call

**Phase 7: User Story 5 - Edit Task (3 tasks)**
- updateTask method with optimistic update
- Edit mode for TaskForm (pre-fill values)
- Functional edit icon in TaskItem
- Independent test: Edit title → verify PATCH API call → persist after refresh

**Phase 8: User Story 6 - Delete Task (3 tasks)**
- ConfirmDialog component
- deleteTask method with optimistic update
- Functional delete icon with confirmation
- Independent test: Delete → confirm → disappears → verify DELETE API call

**Phase 9: Polish & Cross-Cutting (15 tasks)**
- Accessibility (ARIA labels, keyboard nav, focus management, contrast)
- UX enhancements (Navbar, responsive meta tags, icons)
- Error handling (global error boundary, offline detection, session expiration)
- Documentation (README, quickstart validation)

**Task Statistics**:
- **Total Tasks**: 72
- **Parallel Tasks**: 35 marked [P] (48.6% can run in parallel)
- **MVP Scope**: 34 tasks (Phase 1 + 2 + 3) - ~6 hours
- **Full Feature**: 72 tasks - ~15 hours estimated

**Dependencies**:
```
Setup (Phase 1)
    ↓
Foundational (Phase 2) ← BLOCKS all user stories
    ↓
┌─────────────────────────────────────────┐
│  All User Stories Can Proceed in Parallel │
├───────┬───────┬───────┬───────┬────────┤
│  US1  │  US2  │  US3  │  US4  │  US5   │  US6  │
│  MVP  │       │       │       │        │       │
└───────┴───────┴───────┴───────┴────────┴───────┘
    ↓
Polish (Phase 9)
```

**User Story Dependencies**:
- US1 (Auth): Independent, can start after Phase 2
- US2 (View): Depends on US1 (auth required)
- US3 (Create): Depends on US1 & US2 (auth + task list)
- US4 (Toggle): Depends on US1 & US2 (auth + task list)
- US5 (Edit): Depends on US1 & US2 & US3 (auth + task list + TaskForm)
- US6 (Delete): Depends on US1 & US2 (auth + task list)

**Format Compliance**: ✅ ALL 72 TASKS VALIDATED
- Every task has checkbox: `- [ ]`
- Every task has sequential ID: T001-T072
- Parallel tasks marked [P]
- User story tasks labeled [US1]-[US6]
- All descriptions include exact file paths
- Example valid task: `- [ ] T027 [P] [US1] Create SignInForm component in frontend/src/components/auth/SignInForm.tsx...`

**Parallel Execution Examples**:
- Phase 1 Setup: T003-T012 (10 tasks simultaneously)
- Phase 2 Types: T013-T017 (5 tasks simultaneously)
- US1 Auth Components: T027-T029 (3 tasks simultaneously)
- US2 UI Components: T037-T039 (3 tasks simultaneously)
- US3 Reusable UI: T042-T045 (4 tasks simultaneously)
- Phase 9 Accessibility: T058-T062 (5 tasks simultaneously)

**Implementation Strategy**:

1. **MVP First** (Recommended):
   - Complete Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (US1 Auth)
   - Result: Working authentication system - users can sign up/sign in
   - Time: ~6 hours, 34 tasks

2. **Incremental Delivery**:
   - Add US2 (View Tasks) → Users can see their tasks
   - Add US3 (Create Task) → Users can create tasks
   - Add US4-US6 (Update/Edit/Delete) → Full CRUD operations
   - Add Polish → Production-ready with accessibility

3. **Parallel Team Strategy**:
   - After Phase 1 & 2, assign 3 developers to different user stories
   - Minimal merge conflicts (different files, marked [P])

**Key Design Decisions from Planning Documents**:
- Better Auth with JWT plugin (stateless, backend-integrated)
- React Context + useReducer for state (lightweight, MVP-appropriate)
- Custom ApiClient class (no axios, native fetch with JWT injection)
- Optimistic UI updates with snapshot-based rollback
- Server Components for initial load, Client Components for interactivity
- Next.js middleware for server-side route protection

**Validation Criteria per Task**:
- Every task includes what to verify (e.g., "verify JWT in Network tab", "verify optimistic update")
- Each user story has "Independent Test" section with step-by-step validation
- Checkpoints after each phase to ensure completeness before proceeding

## Outcome

- ✅ Impact: Comprehensive, immediately executable task breakdown with 72 atomic tasks organized by 6 user stories
- 🧪 Tests: Format validation passed - all 72 tasks follow strict checklist format with IDs, labels, file paths
- 📁 Files: Created `specs/002-frontend-web-app/tasks.md` (620 lines)
- 🔁 Next prompts: `/sp.implement` to begin autonomous execution starting with Phase 1 (Setup)
- 🧠 Reflection: Successfully mapped 6 user stories from spec.md to 72 tasks with clear dependencies. Critical insight: Phase 2 (Foundational) is the blocker - all 14 tasks must complete before ANY user story work. This prevents parallel teams from starting too early. MVP is well-defined: just Phase 1+2+3 (34 tasks, 6 hours) delivers working auth. Incremental delivery strategy allows deploying value after each user story. 48.6% of tasks are parallelizable, maximizing team efficiency.

## Evaluation notes (flywheel)

- Failure modes observed: None - task generation completed successfully on first attempt
- Graders run and results (PASS/FAIL): Task Format Validation - PASS (72/72 tasks correctly formatted)
- Prompt variant (if applicable): N/A (initial task generation)
- Next experiment (smallest change to try): In `/sp.implement`, validate that Phase 2 completion checkpoint is enforced before allowing user story work to begin (prevents premature parallel execution)
