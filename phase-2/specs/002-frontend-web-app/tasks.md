# Tasks: Frontend Web Application

**Input**: Design documents from `/specs/002-frontend-web-app/`
**Prerequisites**: plan.md (✓), spec.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓)

**Tests**: Tests are NOT explicitly requested in the specification. This task list focuses on implementation only. Testing will be addressed in a separate iteration if needed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5, US6)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/` (app, components, lib, types, contexts, hooks)
- **Frontend Tests**: `frontend/tests/` (components, e2e)
- All paths are relative to repository root

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Next.js project with all required dependencies and configuration

- [x] T001 Create frontend directory structure: `frontend/src/{app,components,contexts,hooks,lib,types}` and `frontend/tests/{components,e2e}`
- [x] T002 Initialize Next.js 15+ project with TypeScript in `frontend/` directory using `pnpm create next-app@latest`
- [x] T003 [P] Install core dependencies: `pnpm add better-auth lucide-react zod jwt-decode`
- [x] T004 [P] Install UI dependencies: `pnpm add tailwind-merge clsx class-variance-authority`
- [x] T005 [P] Install dev dependencies: `pnpm add -D @types/node typescript vitest @testing-library/react @testing-library/jest-dom @playwright/test`
- [x] T006 [P] Configure Tailwind CSS in `frontend/tailwind.config.ts` with mobile-first breakpoints and color palette
- [x] T007 [P] Configure TypeScript strict mode in `frontend/tsconfig.json` with path aliases (`@/*` → `./src/*`)
- [x] T008 [P] Create environment variables template in `frontend/.env.example` with `NEXT_PUBLIC_API_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- [x] T009 [P] Configure Vitest in `frontend/vitest.config.ts` for unit and component tests
- [x] T010 [P] Configure Playwright in `frontend/playwright.config.ts` for E2E tests
- [x] T011 Create `frontend/middleware.ts` file stub (route protection implementation in Phase 2)
- [x] T012 Setup global CSS with Tailwind directives in `frontend/src/app/globals.css`

**Checkpoint**: Project structure ready, all dependencies installed, configuration files in place

---

## Phase 2: Foundational (Blocking Prerequisites for ALL User Stories)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### 2A: Core Types & Utilities

- [ ] T013 [P] Create TypeScript types for User in `frontend/src/types/user.ts` (id, email, createdAt)
- [ ] T014 [P] Create TypeScript types for Task in `frontend/src/types/task.ts` (Task, CreateTaskInput, UpdateTaskInput per data-model.md)
- [ ] T015 [P] Create API response types in `frontend/src/types/api.ts` (ApiResponse<T>, ApiError per data-model.md)
- [ ] T016 [P] Create Zod validation schemas in `frontend/src/lib/validation.ts` (createTaskSchema, updateTaskSchema per data-model.md)
- [ ] T017 [P] Create utility functions in `frontend/src/lib/utils.ts` (cn for className merging, date formatting helpers)

### 2B: Authentication Infrastructure

- [ ] T018 Configure Better Auth client in `frontend/src/lib/auth.ts` with JWT plugin enabled and baseURL from env
- [ ] T019 Create AuthContext provider in `frontend/src/contexts/AuthContext.tsx` wrapping Better Auth useSession hook
- [ ] T020 Create useAuth custom hook in `frontend/src/hooks/useAuth.ts` exposing user, isAuthenticated, isLoading
- [ ] T021 Implement Next.js middleware in `frontend/middleware.ts` for server-side route protection (redirect unauthenticated users from /dashboard to /signin)

### 2C: API Client Infrastructure

- [ ] T022 Create ApiClient class in `frontend/src/lib/api-client.ts` with JWT injection, error handling (401→redirect, 403/404/500→throw), and URL construction helper
- [ ] T023 Add task-specific methods to ApiClient: fetchTasks(), createTask(), updateTask(), deleteTask() per contracts/tasks-api.md
- [ ] T024 Create getApiClient factory function in `frontend/src/lib/api-client.ts` for singleton instance

### 2D: Root Layout & Navigation Structure

- [ ] T025 Create root layout in `frontend/src/app/layout.tsx` with metadata, AuthProvider wrapper, and global styles
- [ ] T026 Create home page in `frontend/src/app/page.tsx` with redirect logic (authenticated→/dashboard, unauthenticated→/signin)

**Checkpoint**: Foundation ready - all infrastructure in place, user story implementation can now begin

---

## Phase 3: User Story 1 - User Authentication and Onboarding (Priority: P1) 🎯 MVP

**Goal**: Enable users to sign up, sign in, and sign out securely with JWT-based authentication

**Independent Test**:
1. Visit app root → redirected to `/signin`
2. Click "Create Account" tab → enter email/password → submit
3. Verify JWT stored in browser cookies (DevTools → Application → Cookies)
4. Verify redirection to `/dashboard`
5. Click "Sign Out" → JWT cleared, redirected to `/signin`
6. Verify JWT present in Authorization header (DevTools → Network → any API call)

### Implementation for User Story 1

**Auth Components:**

- [ ] T027 [P] [US1] Create SignInForm component in `frontend/src/components/auth/SignInForm.tsx` with email/password fields, Better Auth integration, error handling per contracts/auth-api.md
- [ ] T028 [P] [US1] Create SignUpForm component in `frontend/src/components/auth/SignUpForm.tsx` with email/password fields, client-side validation (Zod), Better Auth integration per contracts/auth-api.md
- [ ] T029 [P] [US1] Create SignOutButton component in `frontend/src/components/auth/SignOutButton.tsx` with Better Auth signOut call

**Auth Pages & Layouts:**

- [ ] T030 [US1] Create auth layout in `frontend/src/app/signin/layout.tsx` with centered card styling (responsive)
- [ ] T031 [US1] Create sign-in page in `frontend/src/app/signin/page.tsx` with tab switcher between SignInForm and SignUpForm
- [ ] T032 [US1] Create AuthGuard HOC in `frontend/src/components/auth/AuthGuard.tsx` to wrap protected routes (checks session, shows loading state)

**Dashboard Shell:**

- [ ] T033 [US1] Create dashboard layout in `frontend/src/app/dashboard/layout.tsx` with AuthGuard wrapper and navigation placeholder
- [ ] T034 [US1] Create placeholder dashboard page in `frontend/src/app/dashboard/page.tsx` displaying "Dashboard" heading and user email

**Checkpoint**: User Story 1 complete - users can sign up, sign in, sign out, JWT is properly managed, protected routes work

---

## Phase 4: User Story 2 - View and Browse Task List (Priority: P2)

**Goal**: Display all user's tasks in a scannable list with loading states, empty states, and user isolation

**Independent Test**:
1. Sign in as user with pre-existing tasks (seed data via backend or manual creation)
2. Navigate to `/dashboard`
3. Verify all tasks display sorted by creation date (newest first)
4. Verify user_id in API request URL matches JWT claim (DevTools → Network → GET /api/{user_id}/tasks)
5. Verify loading skeleton displays during fetch
6. Create new user account → verify empty state displays with "No tasks yet" message

### Implementation for User Story 2

**State Management:**

- [ ] T035 [P] [US2] Create TaskContext provider in `frontend/src/contexts/TaskContext.tsx` with useReducer (TaskState, TaskAction types per data-model.md)
- [ ] T036 [US2] Create useTasks custom hook in `frontend/src/hooks/useTasks.ts` with fetchTasks() method and optimistic update infrastructure (depends on T035)

**UI Components:**

- [ ] T037 [P] [US2] Create TaskSkeleton loading component in `frontend/src/components/tasks/TaskSkeleton.tsx` displaying 5 placeholder rows with shimmer effect
- [ ] T038 [P] [US2] Create EmptyState component in `frontend/src/components/tasks/EmptyState.tsx` with "No tasks yet" message and illustration
- [ ] T039 [P] [US2] Create TaskItem component in `frontend/src/components/tasks/TaskItem.tsx` displaying task title, description (if present), completion checkbox (non-functional), edit/delete icons (non-functional), timestamps
- [ ] T040 [US2] Create TaskList container component in `frontend/src/components/tasks/TaskList.tsx` mapping TaskItem components, handling loading/empty/error states (depends on T037, T038, T039)

**Page Integration:**

- [ ] T041 [US2] Update dashboard page in `frontend/src/app/dashboard/page.tsx` to render TaskProvider + TaskList and trigger fetchTasks on mount (depends on T035, T040)

**Checkpoint**: User Story 2 complete - users can view their tasks, see loading/empty states, user isolation enforced

---

## Phase 5: User Story 3 - Create New Task (Priority: P2)

**Goal**: Enable users to create new tasks with title and optional description via modal form

**Independent Test**:
1. Sign in and navigate to `/dashboard`
2. Click "Create Task" button
3. Modal opens with task form
4. Enter title "Test Task" and description "Test description"
5. Submit form
6. Verify optimistic update: task appears at top of list immediately
7. Verify API call in Network tab: POST /api/{user_id}/tasks with JWT header
8. Verify success toast: "Task created successfully"
9. Test validation: submit empty title → see "Title is required" error

### Implementation for User Story 3

**Reusable UI Components:**

- [ ] T042 [P] [US3] Create Button component in `frontend/src/components/ui/Button.tsx` with variants (primary, secondary, ghost, danger) and loading state
- [ ] T043 [P] [US3] Create Input component in `frontend/src/components/ui/Input.tsx` with label, error state, multiline support (textarea)
- [ ] T044 [P] [US3] Create Modal component in `frontend/src/components/ui/Modal.tsx` with focus trap, Escape key handler, overlay click-to-close
- [ ] T045 [P] [US3] Create Toast notification system in `frontend/src/components/ui/Toast.tsx` with success/error/info variants and auto-dismiss

**Task Creation:**

- [ ] T046 [US3] Add createTask method to useTasks hook in `frontend/src/hooks/useTasks.ts` with optimistic update and rollback logic (depends on T036)
- [ ] T047 [US3] Create TaskForm component in `frontend/src/components/tasks/TaskForm.tsx` with title/description inputs, Zod validation, submit with loading state, error display (depends on T042, T043, T045, T046)
- [ ] T048 [US3] Add "Create Task" button to dashboard page in `frontend/src/app/dashboard/page.tsx` opening TaskForm modal (depends on T044, T047)

**Checkpoint**: User Story 3 complete - users can create tasks with optimistic UI, validation, and success/error feedback

---

## Phase 6: User Story 4 - Update Task Status (Priority: P3)

**Goal**: Enable users to toggle task completion status with optimistic UI and rollback on failure

**Independent Test**:
1. Sign in and navigate to `/dashboard` with existing tasks
2. Click checkbox next to an incomplete task
3. Verify immediate UI update: checkbox checked, title has strikethrough
4. Verify API call in Network tab: PATCH /api/{user_id}/tasks/{id} with body `{"completed": true}`
5. Verify no additional UI change (optimistic update was correct)
6. Test rollback: Disconnect network → toggle checkbox → verify error toast and checkbox reverts to original state

### Implementation for User Story 4

- [ ] T049 [US4] Add toggleComplete method to useTasks hook in `frontend/src/hooks/useTasks.ts` with optimistic update, debouncing (300ms), and rollback logic
- [ ] T050 [US4] Update TaskItem component in `frontend/src/components/tasks/TaskItem.tsx` to make checkbox functional, calling toggleComplete on click, applying strikethrough style when completed
- [ ] T051 [US4] Add debounce utility function in `frontend/src/lib/utils.ts` for rapid toggle protection

**Checkpoint**: User Story 4 complete - users can toggle task completion with instant feedback and error recovery

---

## Phase 7: User Story 5 - Edit Task Details (Priority: P3)

**Goal**: Enable users to edit task title and description inline or via modal

**Independent Test**:
1. Sign in and navigate to `/dashboard`
2. Click "Edit" icon on a task
3. Modal opens with pre-filled title and description
4. Modify title to "Updated Task"
5. Click "Save"
6. Verify API call in Network tab: PATCH /api/{user_id}/tasks/{id} with body `{"title": "Updated Task"}`
7. Verify updated task displays in list
8. Test validation: clear title → see "Title is required" error
9. Click "Cancel" → modal closes, no changes saved

### Implementation for User Story 5

- [ ] T052 [US5] Add updateTask method to useTasks hook in `frontend/src/hooks/useTasks.ts` with optimistic update and rollback logic
- [ ] T053 [US5] Update TaskForm component in `frontend/src/components/tasks/TaskForm.tsx` to support edit mode (pre-fill values, PATCH instead of POST)
- [ ] T054 [US5] Update TaskItem component in `frontend/src/components/tasks/TaskItem.tsx` to make edit icon functional, opening TaskForm modal in edit mode on click

**Checkpoint**: User Story 5 complete - users can edit task details with validation and error handling

---

## Phase 8: User Story 6 - Delete Task (Priority: P3)

**Goal**: Enable users to delete tasks with confirmation dialog to prevent accidental deletion

**Independent Test**:
1. Sign in and navigate to `/dashboard`
2. Click "Delete" icon on a task
3. Confirmation dialog appears: "Are you sure you want to delete this task? This action cannot be undone."
4. Click "Delete" button
5. Verify task disappears from list immediately (optimistic update)
6. Verify API call in Network tab: DELETE /api/{user_id}/tasks/{id}
7. Verify success toast: "Task deleted successfully"
8. Test rollback: Disconnect network → delete task → verify error toast and task reappears in list
9. Test cancellation: Click delete icon → click "Cancel" → dialog closes, no changes

### Implementation for User Story 6

- [ ] T055 [P] [US6] Create ConfirmDialog component in `frontend/src/components/ui/ConfirmDialog.tsx` with title, message, confirm/cancel buttons (extends Modal)
- [ ] T056 [US6] Add deleteTask method to useTasks hook in `frontend/src/hooks/useTasks.ts` with optimistic update and rollback logic
- [ ] T057 [US6] Update TaskItem component in `frontend/src/components/tasks/TaskItem.tsx` to make delete icon functional, showing ConfirmDialog on click, calling deleteTask on confirm (depends on T055, T056)

**Checkpoint**: User Story 6 complete - users can delete tasks safely with confirmation and error recovery

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, accessibility, and user experience enhancements across all stories

### Accessibility (WCAG 2.1 AA Compliance)

- [ ] T058 [P] Add ARIA labels to all interactive elements in TaskItem component (checkbox, edit button, delete button)
- [ ] T059 [P] Add ARIA live region for toast notifications in `frontend/src/components/ui/Toast.tsx`
- [ ] T060 [P] Add focus management to Modal component (trap focus, restore focus on close, Escape key handler)
- [ ] T061 [P] Add keyboard navigation support: Enter to submit forms, Escape to close modals, Tab to navigate interactive elements
- [ ] T062 [P] Verify color contrast ratios in Tailwind config (text: 4.5:1, UI components: 3:1) using Lighthouse or axe DevTools

### User Experience Enhancements

- [ ] T063 [P] Add Navbar component in `frontend/src/components/layout/Navbar.tsx` with user email display and SignOutButton
- [ ] T064 [P] Update dashboard layout in `frontend/src/app/dashboard/layout.tsx` to include Navbar component
- [ ] T065 [P] Add responsive meta tags in root layout `frontend/src/app/layout.tsx` (viewport, mobile-web-app-capable)
- [ ] T066 [P] Add favicon and app icons in `frontend/public/` directory
- [ ] T067 [P] Add loading.tsx files in route groups for suspense boundaries

### Error Handling & Edge Cases

- [ ] T068 [P] Add global error boundary in `frontend/src/app/error.tsx` catching unhandled errors
- [ ] T069 [P] Add network status detection in ApiClient (show offline banner when navigator.onLine is false)
- [ ] T070 [P] Add session expiration warning (show toast 5 minutes before JWT expiration)

### Documentation

- [ ] T071 [P] Create frontend README.md with setup instructions, available scripts, and architecture overview
- [ ] T072 [P] Verify quickstart.md instructions work end-to-end (test with fresh clone)

**Checkpoint**: All polish tasks complete - application is production-ready with full accessibility and error handling

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← CRITICAL BLOCKER for all user stories
    ↓
┌───────────────────────────────────────────────────┐
│   All User Stories Can Now Proceed in Parallel   │
├─────────┬─────────┬─────────┬─────────┬──────────┤
│ Phase 3 │ Phase 4 │ Phase 5 │ Phase 6 │ Phase 7  │ Phase 8 │
│  (US1)  │  (US2)  │  (US3)  │  (US4)  │  (US5)   │  (US6)  │
│   MVP   │         │         │         │          │         │
└─────────┴─────────┴─────────┴─────────┴──────────┴─────────┘
    ↓
Phase 9 (Polish)
```

### User Story Dependencies

- **US1 (P1) - Auth**: Independent, can start after Phase 2 completion
- **US2 (P2) - View Tasks**: Depends on US1 (requires authentication)
- **US3 (P2) - Create Task**: Depends on US1 & US2 (requires auth + task list)
- **US4 (P3) - Toggle Status**: Depends on US1 & US2 (requires auth + task list with checkboxes)
- **US5 (P3) - Edit Task**: Depends on US1 & US2 & US3 (requires auth + task list + TaskForm component)
- **US6 (P3) - Delete Task**: Depends on US1 & US2 (requires auth + task list)

### Within Each User Story

- Parallel tasks marked [P] can run simultaneously (different files)
- Sequential tasks must complete in order:
  1. State management hooks (useTasks methods)
  2. UI components (TaskForm, TaskItem updates)
  3. Page integration (dashboard page updates)

### Parallel Opportunities

**Phase 1 (Setup)**: T003-T012 all marked [P] can run simultaneously

**Phase 2 (Foundational)**:
- Section 2A: T013-T017 all marked [P] (types and utilities)
- Section 2B: T018→T019→T020→T021 (sequential, auth stack)
- Section 2C: T022→T023→T024 (sequential, API client)
- Section 2D: T025→T026 (sequential, layouts)

**User Story 1 (US1)**:
- T027, T028, T029 all marked [P] (auth components)
- Then T030→T031→T032→T033→T034 (sequential, pages)

**User Story 2 (US2)**:
- T037, T038, T039 all marked [P] (UI components)
- T035→T036 (sequential, state management)
- T040→T041 (sequential, integration)

**User Story 3 (US3)**:
- T042, T043, T044, T045 all marked [P] (reusable UI)
- T046→T047→T048 (sequential, task creation)

**Phase 9 (Polish)**: T058-T072 most marked [P] can run simultaneously

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all parallel setup tasks together:
claude-code execute --parallel \
  "T003: Install core dependencies" \
  "T004: Install UI dependencies" \
  "T005: Install dev dependencies" \
  "T006: Configure Tailwind CSS" \
  "T007: Configure TypeScript" \
  "T008: Create .env.example" \
  "T009: Configure Vitest" \
  "T010: Configure Playwright"
```

## Parallel Example: User Story 2 UI Components

```bash
# Launch all parallel UI component tasks together:
claude-code execute --parallel \
  "T037: Create TaskSkeleton component" \
  "T038: Create EmptyState component" \
  "T039: Create TaskItem component"
```

---

## Implementation Strategy

### MVP First (Recommended)

Complete in this order for fastest time-to-value:

1. **Phase 1**: Setup (T001-T012) - ~30 minutes
2. **Phase 2**: Foundational (T013-T026) - ~2 hours
3. **Phase 3**: User Story 1 - Auth (T027-T034) - ~3 hours
4. **STOP and VALIDATE**: Test authentication flow end-to-end
5. **Demo/Deploy MVP**: Users can sign up and sign in

**Result**: Working authentication system, ready to add task management features

### Incremental Delivery

Continue adding value story-by-story:

1. **Add US2** (View Tasks): T035-T041 - ~2 hours → Users can see their tasks
2. **Add US3** (Create Task): T042-T048 - ~2 hours → Users can create tasks
3. **Add US4** (Toggle Status): T049-T051 - ~1 hour → Users can mark tasks complete
4. **Add US5** (Edit Task): T052-T054 - ~1 hour → Users can edit tasks
5. **Add US6** (Delete Task): T055-T057 - ~1 hour → Users can delete tasks
6. **Add Polish** (Phase 9): T058-T072 - ~3 hours → Production-ready

**Total Estimated Time**: ~15 hours for full feature set

### Parallel Team Strategy

With 3 developers after completing Phase 1 & 2:

- **Developer A**: US1 (Auth) → US4 (Toggle) → US6 (Delete)
- **Developer B**: US2 (View) → US3 (Create) → Polish (Accessibility)
- **Developer C**: US5 (Edit) → Polish (UX Enhancements) → Documentation

Stories integrate independently, reducing merge conflicts.

---

## Task Summary

**Total Tasks**: 72
- **Phase 1 (Setup)**: 12 tasks
- **Phase 2 (Foundational)**: 14 tasks
- **Phase 3 (US1 - Auth)**: 8 tasks
- **Phase 4 (US2 - View)**: 7 tasks
- **Phase 5 (US3 - Create)**: 7 tasks
- **Phase 6 (US4 - Toggle)**: 3 tasks
- **Phase 7 (US5 - Edit)**: 3 tasks
- **Phase 8 (US6 - Delete)**: 3 tasks
- **Phase 9 (Polish)**: 15 tasks

**Parallel Opportunities**: 35 tasks marked [P] can run in parallel (48.6%)

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 = 34 tasks (~6 hours)

**Full Feature Set**: All 72 tasks (~15 hours estimated)

---

## Notes

- **[P] marker**: Task can run in parallel with other [P] tasks in the same phase (different files, no shared dependencies)
- **[Story] label**: Maps task to specific user story for traceability and independent testing
- **File paths**: All paths are exact and match the project structure from plan.md
- **Validation**: Each task description includes what to verify (e.g., "verify JWT in Network tab", "verify optimistic update")
- **Checkpoints**: Each phase ends with a validation checkpoint to ensure story completeness
- **Format compliance**: All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`

---

## Ready for Implementation

This task list is immediately executable. Each task is specific enough for an LLM or developer to complete without additional context. All file paths, component names, and acceptance criteria are clearly defined.

**Next Step**: Begin with Phase 1 (Setup) tasks T001-T012, then proceed to Phase 2 (Foundational) before starting any user story work.
