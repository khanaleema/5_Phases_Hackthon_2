# Tasks: Backend Core - Auth-Protected Task Management

**Input**: Design documents from `/specs/001-backend-auth-tasks/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), data-model.md (complete), contracts/ (complete)

**Tests**: Test tasks are included per constitution principle V (Test-First Development). Tests MUST be written FIRST and FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions (Phase II Full-Stack Monorepo)

- **Backend**: `backend/src/` (models, services, api, auth), `backend/tests/` (unit, integration, api)
- All task file paths use these exact conventions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend directory structure per plan.md (backend/src/{models,schemas,middleware,api/routes,services}, backend/tests/{unit,integration,api}, backend/alembic)
- [ ] T002 Initialize Python 3.13+ project with UV in backend/ directory (create pyproject.toml with dependencies: fastapi, uvicorn, sqlmodel, psycopg2-binary, python-jose, python-dotenv, alembic, pydantic)
- [ ] T003 [P] Configure Ruff and mypy in backend/pyproject.toml for code quality
- [ ] T004 [P] Create .env.example in backend/ with required variables (DATABASE_URL, BETTER_AUTH_SECRET, CORS_ORIGINS, ENVIRONMENT, LOG_LEVEL)
- [ ] T005 [P] Create docker-compose.yml in project root for PostgreSQL (postgres:16-alpine, port 5432)

**Validation**: Run `uv sync` in backend/ to verify dependencies install successfully

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Foundation

- [ ] T006 Create database connection module in backend/src/db.py (SQLModel create_engine with connection pooling: pool_pre_ping=True, pool_size=10, max_overflow=20, get_db dependency)
- [ ] T007 Create SQLModel Task model in backend/src/models/task.py (id, user_id indexed, title, description, completed indexed, created_at, updated_at per data-model.md)
- [ ] T008 Initialize Alembic in backend/alembic/ (alembic init, configure env.py with SQLModel.metadata, import Task model)
- [ ] T009 Generate initial Alembic migration in backend/alembic/versions/001_create_tasks_table.py (indexes on user_id and completed)
- [ ] T010 Apply Alembic migration to create tasks table (alembic upgrade head)

**Validation**: Run `alembic current` to verify migration applied successfully

### Security & Auth Foundation

- [ ] T011 Create JWT verification middleware in backend/src/middleware/jwt.py (verify_jwt_token dependency using python-jose, HTTPBearer, decode with BETTER_AUTH_SECRET, extract user_id from sub or userId claim, return dict with user_id and email, raise 401 for invalid/expired tokens)
- [ ] T012 [P] Create auth schemas in backend/src/schemas/auth.py (JWTPayload, CurrentUser per contracts/pydantic-schemas.md)

**Validation**: Create test JWT token manually and verify decode logic works

### API Foundation

- [ ] T013 [P] Create request schemas in backend/src/schemas/requests.py (TaskCreate, TaskUpdate, TaskPatch per contracts/pydantic-schemas.md with title validator)
- [ ] T014 [P] Create response schemas in backend/src/schemas/responses.py (TaskResponse with orm_mode=True, ErrorResponse per contracts/pydantic-schemas.md)
- [ ] T015 Create FastAPI app in backend/src/main.py (FastAPI instance, CORS middleware with CORS_ORIGINS from env, health endpoint at /health)

**Validation**: Run `uvicorn src.main:app --reload` and verify http://localhost:8000/health returns {"status": "healthy"}

### Testing Foundation

- [ ] T016 Create pytest configuration in backend/tests/conftest.py (database fixtures with in-memory SQLite, create_test_client fixture, auth_headers fixtures for test users user-123 and user-456)
- [ ] T017 [P] Create test helper utilities in backend/tests/helpers.py (generate_test_jwt function, create_test_task function)

**Validation**: Run `pytest backend/tests/` to verify test infrastructure loads (no tests yet, just fixtures)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Authenticated Task Creation (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can create personal tasks with JWT token, automatically associated with their user_id

**Independent Test**: POST /api/user-123/tasks with valid JWT returns 201 with task object; without JWT returns 401; with mismatched user_id returns 403

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T018 [P] [US1] Create API test for successful task creation in backend/tests/api/test_create_task.py (test_create_task_success: POST with valid JWT and matching user_id returns 201, test_create_task_no_auth: POST without JWT returns 401, test_create_task_invalid_token: POST with malformed JWT returns 401, test_create_task_expired_token: POST with expired JWT returns 401, test_create_task_user_mismatch: POST to /api/user-456/tasks with user-123 JWT returns 403)
- [ ] T019 [P] [US1] Create integration test for user_id isolation in backend/tests/integration/test_task_creation_isolation.py (verify task.user_id matches JWT user_id, not request body or path parameter)

### Implementation for User Story 1

- [ ] T020 [US1] Create TaskService.create_task method in backend/src/services/task_service.py (accept db session, user_id from JWT, TaskCreate schema; create Task with user_id from JWT; return created task)
- [ ] T021 [US1] Create POST /api/{user_id}/tasks endpoint in backend/src/api/routes/tasks.py (FastAPI router with /api prefix, Depends(get_db), Depends(verify_jwt_token), verify user_id matches JWT, delegate to TaskService.create_task, return 201 with TaskResponse)
- [ ] T022 [US1] Register tasks router in backend/src/main.py (app.include_router(tasks.router))

**Validation**: Run `pytest backend/tests/api/test_create_task.py -v` - all tests should PASS

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - User-Isolated Task Listing (Priority: P1)

**Goal**: Authenticated users can retrieve only their own tasks, ensuring privacy and data isolation

**Independent Test**: GET /api/user-123/tasks returns only tasks where user_id="user-123"; user-456 sees completely separate list

### Tests for User Story 2

- [ ] T023 [P] [US2] Create API test for task listing in backend/tests/api/test_list_tasks.py (test_list_tasks_success: GET with valid JWT returns 200 with array of user's tasks, test_list_tasks_empty: GET for new user returns 200 with empty array, test_list_tasks_no_auth: GET without JWT returns 401, test_list_tasks_user_mismatch: GET /api/user-456/tasks with user-123 JWT returns 403)
- [ ] T024 [P] [US2] Create integration test for user isolation in backend/tests/integration/test_user_isolation.py (create tasks for user-123 and user-456, verify GET for user-123 returns only user-123 tasks, no cross-user visibility)

### Implementation for User Story 2

- [ ] T025 [US2] Create TaskService.get_tasks method in backend/src/services/task_service.py (accept db session, user_id from JWT; query Task.where(Task.user_id == user_id); return list of tasks)
- [ ] T026 [US2] Create GET /api/{user_id}/tasks endpoint in backend/src/api/routes/tasks.py (Depends(get_db), Depends(verify_jwt_token), verify user_id matches JWT, delegate to TaskService.get_tasks, return 200 with List[TaskResponse])

**Validation**: Run `pytest backend/tests/api/test_list_tasks.py backend/tests/integration/test_user_isolation.py -v` - all tests should PASS

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 5 - Task Completion Toggle (Priority: P1)

**Goal**: Authenticated users can mark tasks as complete or incomplete to track progress

**Independent Test**: PATCH /api/user-123/tasks/1 with {"completed": true} toggles status; user cannot patch another user's task (returns 404)

### Tests for User Story 5

- [ ] T027 [P] [US5] Create API test for task completion toggle in backend/tests/api/test_patch_task.py (test_patch_task_complete: PATCH with completed=true returns 200 with updated task, test_patch_task_incomplete: PATCH with completed=false returns 200, test_patch_task_not_found: PATCH non-existent task returns 404, test_patch_task_other_user: PATCH another user's task returns 404, test_patch_task_no_auth: PATCH without JWT returns 401)
- [ ] T028 [P] [US5] Create unit test for TaskService.patch_task in backend/tests/unit/test_task_service_patch.py (verify only completed field updated, updated_at changes, other fields unchanged)

### Implementation for User Story 5

- [ ] T029 [US5] Create TaskService.patch_task method in backend/src/services/task_service.py (accept db session, user_id, task_id, TaskPatch schema; query task with user_id filtering; update completed field; update updated_at; return task or None)
- [ ] T030 [US5] Create PATCH /api/{user_id}/tasks/{task_id} endpoint in backend/src/api/routes/tasks.py (Depends(get_db), Depends(verify_jwt_token), verify user_id matches JWT, delegate to TaskService.patch_task, return 200 with TaskResponse or 404)

**Validation**: Run `pytest backend/tests/api/test_patch_task.py backend/tests/unit/test_task_service_patch.py -v` - all tests should PASS

**Checkpoint**: Core P1 user stories (Create, List, Toggle) are complete - this is a viable MVP

---

## Phase 6: User Story 3 - Single Task Retrieval (Priority: P2)

**Goal**: Authenticated users can retrieve a specific task by ID with user isolation (anti-enumeration via 404)

**Independent Test**: GET /api/user-123/tasks/1 returns task if owned by user-123; returns 404 if owned by user-456 or doesn't exist (prevents enumeration)

### Tests for User Story 3

- [ ] T031 [P] [US3] Create API test for single task retrieval in backend/tests/api/test_get_task.py (test_get_task_success: GET owned task returns 200, test_get_task_not_found: GET non-existent task returns 404, test_get_task_other_user: GET another user's task returns 404 not 403, test_get_task_no_auth: GET without JWT returns 401)
- [ ] T032 [P] [US3] Create integration test for anti-enumeration in backend/tests/integration/test_anti_enumeration.py (verify attempting to access another user's task ID returns 404, not 403)

### Implementation for User Story 3

- [ ] T033 [US3] Create TaskService.get_task_by_id method in backend/src/services/task_service.py (accept db session, user_id, task_id; query Task.where(Task.id == task_id, Task.user_id == user_id); return task or None)
- [ ] T034 [US3] Create GET /api/{user_id}/tasks/{task_id} endpoint in backend/src/api/routes/tasks.py (Depends(get_db), Depends(verify_jwt_token), verify user_id matches JWT, delegate to TaskService.get_task_by_id, return 200 with TaskResponse or 404)

**Validation**: Run `pytest backend/tests/api/test_get_task.py backend/tests/integration/test_anti_enumeration.py -v` - all tests should PASS

**Checkpoint**: All P1 + P2 retrieval features complete

---

## Phase 7: User Story 4 - Task Update (Priority: P2)

**Goal**: Authenticated users can update their task's title and description

**Independent Test**: PUT /api/user-123/tasks/1 with new title/description updates task; user cannot update another user's task (returns 404)

### Tests for User Story 4

- [ ] T035 [P] [US4] Create API test for task update in backend/tests/api/test_update_task.py (test_update_task_success: PUT with valid data returns 200 with updated task, test_update_task_not_found: PUT non-existent task returns 404, test_update_task_other_user: PUT another user's task returns 404, test_update_task_validation: PUT with title > 200 chars returns 422, test_update_task_no_auth: PUT without JWT returns 401)
- [ ] T036 [P] [US4] Create unit test for TaskService.update_task in backend/tests/unit/test_task_service_update.py (verify title and description updated, updated_at changes, completed field unchanged)

### Implementation for User Story 4

- [ ] T037 [US4] Create TaskService.update_task method in backend/src/services/task_service.py (accept db session, user_id, task_id, TaskUpdate schema; query task with user_id filtering; update title and description; update updated_at; return task or None)
- [ ] T038 [US4] Create PUT /api/{user_id}/tasks/{task_id} endpoint in backend/src/api/routes/tasks.py (Depends(get_db), Depends(verify_jwt_token), verify user_id matches JWT, delegate to TaskService.update_task, return 200 with TaskResponse or 404)

**Validation**: Run `pytest backend/tests/api/test_update_task.py backend/tests/unit/test_task_service_update.py -v` - all tests should PASS

**Checkpoint**: All CRUD operations except DELETE are complete

---

## Phase 8: User Story 6 - Task Deletion (Priority: P3)

**Goal**: Authenticated users can delete tasks they no longer need

**Independent Test**: DELETE /api/user-123/tasks/1 removes task and returns 204; user cannot delete another user's task (returns 404)

### Tests for User Story 6

- [ ] T039 [P] [US6] Create API test for task deletion in backend/tests/api/test_delete_task.py (test_delete_task_success: DELETE owned task returns 204 and task removed from database, test_delete_task_not_found: DELETE non-existent task returns 404, test_delete_task_other_user: DELETE another user's task returns 404, test_delete_task_no_auth: DELETE without JWT returns 401)
- [ ] T040 [P] [US6] Create integration test for permanent deletion in backend/tests/integration/test_task_deletion.py (verify task no longer appears in GET /tasks after deletion)

### Implementation for User Story 6

- [ ] T041 [US6] Create TaskService.delete_task method in backend/src/services/task_service.py (accept db session, user_id, task_id; query task with user_id filtering; delete task; return True if deleted, False if not found)
- [ ] T042 [US6] Create DELETE /api/{user_id}/tasks/{task_id} endpoint in backend/src/api/routes/tasks.py (Depends(get_db), Depends(verify_jwt_token), verify user_id matches JWT, delegate to TaskService.delete_task, return 204 if success or 404 if not found)

**Validation**: Run `pytest backend/tests/api/test_delete_task.py backend/tests/integration/test_task_deletion.py -v` - all tests should PASS

**Checkpoint**: All user stories complete - full CRUD+PATCH functionality with user isolation

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T043 [P] Add comprehensive docstrings to all services in backend/src/services/task_service.py (Google style docstrings with Args, Returns, Raises)
- [ ] T044 [P] Add structured logging for security events in backend/src/middleware/jwt.py (log 401/403 responses with IP address, user_id, path)
- [ ] T045 [P] Create comprehensive README.md in backend/ with setup instructions, environment variables, testing commands per quickstart.md
- [ ] T046 Run full test suite with coverage in backend/ (pytest --cov=src --cov-report=html, target 80%+ coverage)
- [ ] T047 Run Ruff linter and mypy type checker in backend/ (ruff check src/, mypy src/)
- [ ] T048 Validate all 6 endpoints via OpenAPI docs at http://localhost:8000/docs (verify request/response schemas match contracts/task-endpoints.yaml)
- [ ] T049 Run quickstart.md validation (follow all steps to verify developer onboarding works)
- [ ] T050 Security audit: Verify all database queries include user_id filtering (grep for "select(Task)" and verify ".where(Task.user_id" present)

**Validation**: All tests pass, coverage >80%, linters pass, OpenAPI docs match contracts, quickstart works, security audit clean

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational phase completion
  - **P1 Stories** (US1, US2, US5): Highest priority, can proceed in any order after Phase 2
  - **P2 Stories** (US3, US4): Medium priority, can proceed in any order after Phase 2
  - **P3 Stories** (US6): Lowest priority, can proceed after Phase 2
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Create)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1 - List)**: Can start after Foundational (Phase 2) - Independent of US1 but benefits from having test data from US1
- **User Story 5 (P1 - Toggle)**: Can start after Foundational (Phase 2) - Independent (requires existing tasks to patch, can use test fixtures)
- **User Story 3 (P2 - Get)**: Can start after Foundational (Phase 2) - Independent (can use test fixtures)
- **User Story 4 (P2 - Update)**: Can start after Foundational (Phase 2) - Independent (can use test fixtures)
- **User Story 6 (P3 - Delete)**: Can start after Foundational (Phase 2) - Independent (can use test fixtures)

### Within Each User Story

1. **Tests FIRST**: Write tests, ensure they FAIL
2. **Service Layer**: Implement business logic with user isolation
3. **API Endpoint**: Implement FastAPI route with JWT verification
4. **Validation**: Run tests, ensure they PASS

### Parallel Opportunities

- **Phase 1 (Setup)**: Tasks T003, T004, T005 can run in parallel
- **Phase 2 (Foundational)**: Tasks T012 (auth schemas), T013 (request schemas), T014 (response schemas), T017 (test helpers) can run in parallel once DB and JWT foundations are in place
- **User Story Phases**: Once Foundational phase completes, ALL user stories can start in parallel (if team capacity allows)
  - Different developers can work on US1, US2, US5 simultaneously
  - Tests within each story marked [P] can run in parallel
- **Phase 9 (Polish)**: Tasks T043, T044, T045 can run in parallel

---

## Parallel Example: Foundational Phase (Phase 2)

```bash
# After T006-T011 complete, launch these in parallel:
Task T012: Create auth schemas in backend/src/schemas/auth.py
Task T013: Create request schemas in backend/src/schemas/requests.py
Task T014: Create response schemas in backend/src/schemas/responses.py
Task T017: Create test helpers in backend/tests/helpers.py
```

## Parallel Example: User Story 1 (Phase 3)

```bash
# Launch both tests in parallel (they test different aspects):
Task T018: Create API test for task creation
Task T019: Create integration test for user_id isolation

# After tests fail, implement sequentially:
Task T020: TaskService.create_task
Task T021: POST endpoint
Task T022: Register router
```

## Parallel Example: All P1 User Stories After Foundational

```bash
# With 3 developers, after Phase 2 completes:
Developer A: Phase 3 (User Story 1 - Create)
Developer B: Phase 4 (User Story 2 - List)
Developer C: Phase 5 (User Story 5 - Toggle)

# All stories complete and integrate independently
```

---

## Implementation Strategy

### MVP First (P1 User Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Create)
4. Complete Phase 4: User Story 2 (List)
5. Complete Phase 5: User Story 5 (Toggle)
6. **STOP and VALIDATE**: Test all P1 stories independently
7. Deploy/demo if ready - this is a viable MVP

**MVP Scope**: Tasks T001-T030 (30 tasks)
**MVP Endpoints**: POST /tasks, GET /tasks, PATCH /tasks/{id}

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Create) → Test independently → Deploy (Minimal viable product)
3. Add User Story 2 (List) → Test independently → Deploy (Users can see their tasks)
4. Add User Story 5 (Toggle) → Test independently → Deploy (Users can mark tasks complete)
5. Add User Story 3 (Get) → Test independently → Deploy (Detail view enabled)
6. Add User Story 4 (Update) → Test independently → Deploy (Full editing capability)
7. Add User Story 6 (Delete) → Test independently → Deploy (Cleanup capability)
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T017)
2. **Once Foundational is done, split by user story:**
   - Developer A: Phase 3 (US1 - Create) - Tasks T018-T022
   - Developer B: Phase 4 (US2 - List) - Tasks T023-T026
   - Developer C: Phase 5 (US5 - Toggle) - Tasks T027-T030
3. **Stories complete and integrate independently**
4. **Continue with P2/P3 stories:**
   - Developer A: Phase 6 (US3 - Get) - Tasks T031-T034
   - Developer B: Phase 7 (US4 - Update) - Tasks T035-T038
   - Developer C: Phase 8 (US6 - Delete) - Tasks T039-T042
5. **Team completes Polish together** (T043-T050)

---

## Task Summary

- **Total Tasks**: 50 tasks
- **Setup (Phase 1)**: 5 tasks
- **Foundational (Phase 2)**: 12 tasks (BLOCKING)
- **User Story 1 (P1 - Create)**: 5 tasks (2 tests + 3 implementation)
- **User Story 2 (P1 - List)**: 4 tasks (2 tests + 2 implementation)
- **User Story 5 (P1 - Toggle)**: 4 tasks (2 tests + 2 implementation)
- **User Story 3 (P2 - Get)**: 4 tasks (2 tests + 2 implementation)
- **User Story 4 (P2 - Update)**: 4 tasks (2 tests + 2 implementation)
- **User Story 6 (P3 - Delete)**: 4 tasks (2 tests + 2 implementation)
- **Polish (Phase 9)**: 8 tasks

**MVP Scope**: 30 tasks (Setup + Foundational + US1 + US2 + US5)

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel within their phases

**Independent User Stories**: All 6 user stories can be implemented and tested independently after Foundational phase

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Verify tests fail before implementing** (Red-Green-Refactor cycle)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **User Isolation Check**: Every query in TaskService MUST include `.where(Task.user_id == user_id)` - this is validated in T050
- All endpoints MUST verify `current_user["user_id"] == user_id` from path parameter
- Return 404 (not 403) when accessing another user's resource to prevent enumeration attacks

---

**Generated**: 2025-12-18 by `/sp.tasks` command
**Feature**: 001-backend-auth-tasks
**Total Task Count**: 50 tasks
**MVP Task Count**: 30 tasks (Tasks T001-T030)
