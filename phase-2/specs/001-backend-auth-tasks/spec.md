# Feature Specification: Backend Core - Auth-Protected Task Management

**Feature Branch**: `001-backend-auth-tasks`
**Created**: 2025-12-18
**Status**: Draft
**Input**: Backend Core - Auth-Protected Task Management with JWT verification, SQLModel schema, and RESTful CRUD+PATCH endpoints

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authenticated Task Creation (Priority: P1)

As an authenticated user, I want to create personal tasks so that I can track my work items in a secure, isolated environment where only I can see and manage my own tasks.

**Why this priority**: This is the foundational capability - without secure task creation, no other features are possible. It establishes the security model for all subsequent operations.

**Independent Test**: An authenticated user can create a task via POST request with JWT token, and the task is automatically associated with their user_id from the token (not from request body). Attempting to create a task without a valid JWT returns 401 Unauthorized.

**Acceptance Scenarios**:

1. **Given** a valid JWT token with user_id "user-123", **When** POST request to `/api/user-123/tasks` with `{"title": "Buy groceries", "description": "Milk, eggs, bread"}`, **Then** task is created with auto-assigned user_id "user-123" and returns 201 with task object including id, user_id, title, description, completed (false), created_at, updated_at
2. **Given** no Authorization header, **When** POST request to `/api/user-123/tasks`, **Then** returns 401 Unauthorized with error message "Missing authentication token"
3. **Given** expired JWT token, **When** POST request to `/api/user-123/tasks`, **Then** returns 401 Unauthorized with error message "Token expired"
4. **Given** malformed/invalid JWT token, **When** POST request to `/api/user-123/tasks`, **Then** returns 401 Unauthorized with error message "Invalid token"
5. **Given** valid JWT with user_id "user-123", **When** POST to `/api/user-456/tasks` (mismatched user_id in path), **Then** returns 403 Forbidden with error message "User ID mismatch"

---

### User Story 2 - User-Isolated Task Listing (Priority: P1)

As an authenticated user, I want to retrieve only my own tasks so that I can view my work items without seeing other users' data, ensuring privacy and data isolation.

**Why this priority**: Critical for user isolation - must ensure users can only access their own data. This is a non-negotiable security requirement per constitution principle IV.

**Independent Test**: User "user-123" can GET their tasks and sees only tasks where user_id = "user-123". User "user-456" gets a completely separate list. No user can see another user's tasks.

**Acceptance Scenarios**:

1. **Given** valid JWT for user_id "user-123" with 3 tasks in database, **When** GET `/api/user-123/tasks`, **Then** returns 200 with array of 3 tasks, all having user_id "user-123"
2. **Given** valid JWT for user_id "user-456", **When** GET `/api/user-456/tasks`, **Then** returns 200 with array containing only tasks with user_id "user-456" (no tasks from user-123 visible)
3. **Given** valid JWT for user_id "user-123", **When** GET `/api/user-456/tasks` (mismatched user_id), **Then** returns 403 Forbidden
4. **Given** no Authorization header, **When** GET `/api/user-123/tasks`, **Then** returns 401 Unauthorized
5. **Given** valid JWT for new user with no tasks, **When** GET `/api/new-user/tasks`, **Then** returns 200 with empty array []

---

### User Story 3 - Single Task Retrieval (Priority: P2)

As an authenticated user, I want to retrieve a specific task by ID so that I can view detailed information about a single work item, with assurance that I can only access my own tasks.

**Why this priority**: Enables detailed task viewing and forms the basis for update/delete operations. Secondary priority because listing (US2) provides basic visibility.

**Independent Test**: User can GET a specific task by ID that belongs to them. Attempting to GET another user's task ID returns 404 (not 403, to prevent task ID enumeration).

**Acceptance Scenarios**:

1. **Given** valid JWT for user_id "user-123" and task with id=1 owned by user-123, **When** GET `/api/user-123/tasks/1`, **Then** returns 200 with task object
2. **Given** valid JWT for user_id "user-123", **When** GET `/api/user-123/tasks/999` (non-existent task), **Then** returns 404 Not Found
3. **Given** valid JWT for user_id "user-123", **When** GET `/api/user-123/tasks/5` (task owned by user-456), **Then** returns 404 Not Found (prevents enumeration attack)
4. **Given** no Authorization header, **When** GET `/api/user-123/tasks/1`, **Then** returns 401 Unauthorized

---

### User Story 4 - Task Update (Priority: P2)

As an authenticated user, I want to update my task's title and description so that I can keep my work items current and accurate.

**Why this priority**: Common operation but non-blocking for MVP. Users can create and view tasks without update capability.

**Independent Test**: User can PUT update to their own task with new title/description. Updates are isolated - user cannot update another user's task.

**Acceptance Scenarios**:

1. **Given** valid JWT for user_id "user-123" and task id=1 owned by user-123, **When** PUT `/api/user-123/tasks/1` with `{"title": "Updated title", "description": "Updated desc"}`, **Then** returns 200 with updated task object and updated_at timestamp changed
2. **Given** valid JWT for user_id "user-123", **When** PUT `/api/user-123/tasks/5` (task owned by user-456), **Then** returns 404 Not Found
3. **Given** valid JWT and task id=1, **When** PUT with title exceeding 200 characters, **Then** returns 422 Unprocessable Entity with validation error

---

### User Story 5 - Task Completion Toggle (Priority: P1)

As an authenticated user, I want to mark tasks as complete or incomplete so that I can track my progress on work items.

**Why this priority**: Core task management functionality - marking tasks complete is fundamental to task tracking. High priority because it's a primary user action.

**Independent Test**: User can PATCH task to toggle completed status without affecting other fields. Status changes are isolated to user's own tasks.

**Acceptance Scenarios**:

1. **Given** valid JWT for user_id "user-123" and task id=1 with completed=false, **When** PATCH `/api/user-123/tasks/1` with `{"completed": true}`, **Then** returns 200 with task showing completed=true and updated_at changed
2. **Given** valid JWT and task id=1 with completed=true, **When** PATCH with `{"completed": false}`, **Then** returns 200 with completed=false
3. **Given** valid JWT for user_id "user-123", **When** PATCH `/api/user-123/tasks/5` (task owned by user-456), **Then** returns 404 Not Found

---

### User Story 6 - Task Deletion (Priority: P3)

As an authenticated user, I want to delete tasks I no longer need so that I can keep my task list clean and relevant.

**Why this priority**: Nice-to-have cleanup feature. Users can still use the system effectively without deletion capability.

**Independent Test**: User can DELETE their own task. Deleted task no longer appears in listings. User cannot delete another user's task.

**Acceptance Scenarios**:

1. **Given** valid JWT for user_id "user-123" and task id=1 owned by user-123, **When** DELETE `/api/user-123/tasks/1`, **Then** returns 204 No Content and task is removed from database
2. **Given** valid JWT for user_id "user-123", **When** DELETE `/api/user-123/tasks/5` (task owned by user-456), **Then** returns 404 Not Found
3. **Given** valid JWT, **When** DELETE `/api/user-123/tasks/999` (non-existent task), **Then** returns 404 Not Found

---

### Edge Cases

- **Token Expiration During Request**: If JWT expires between request start and database query, returns 401 Unauthorized
- **Malformed JSON**: POST/PUT/PATCH with invalid JSON body returns 400 Bad Request with error details
- **Missing Required Fields**: POST without title returns 422 Unprocessable Entity
- **Empty Title**: POST/PUT with empty string for title returns 422 Unprocessable Entity with "Title cannot be empty"
- **SQL Injection Attempts**: All inputs are parameterized via SQLModel - injection attempts are treated as literal strings
- **User ID Path vs JWT Mismatch**: When path `/api/user-A/tasks` but JWT contains user_id "user-B", returns 403 Forbidden
- **Concurrent Updates**: Last write wins; updated_at timestamp reflects most recent change
- **Very Long Descriptions**: Descriptions exceeding database field limit (if set) return 422 with validation error

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Authorization:**

- **FR-001**: System MUST verify JWT tokens using BETTER_AUTH_SECRET environment variable
- **FR-002**: System MUST extract user_id from JWT claims (not from request body or path for write operations)
- **FR-003**: System MUST return 401 Unauthorized for missing, expired, or invalid JWT tokens
- **FR-004**: System MUST return 403 Forbidden when path user_id does not match JWT user_id
- **FR-005**: System MUST implement a reusable `get_current_user` FastAPI dependency for JWT verification

**Data Model:**

- **FR-006**: System MUST store tasks with fields: id (integer, primary key, auto-increment), user_id (string, indexed, non-null), title (string, 1-200 characters, non-null), description (string, optional, nullable), completed (boolean, default false, non-null), created_at (timestamp, auto-set on creation), updated_at (timestamp, auto-updated on modification)
- **FR-007**: System MUST enforce user_id as a foreign key concept (indexed for query performance)
- **FR-008**: System MUST auto-populate user_id from JWT during task creation, ignoring any user_id in request body

**API Endpoints:**

- **FR-009**: System MUST expose GET `/api/{user_id}/tasks` to list all tasks for authenticated user
- **FR-010**: System MUST expose POST `/api/{user_id}/tasks` to create new task with auto-assigned user_id from JWT
- **FR-011**: System MUST expose GET `/api/{user_id}/tasks/{id}` to retrieve single task by ID
- **FR-012**: System MUST expose PUT `/api/{user_id}/tasks/{id}` to update task title and description
- **FR-013**: System MUST expose PATCH `/api/{user_id}/tasks/{id}` to update task completed status
- **FR-014**: System MUST expose DELETE `/api/{user_id}/tasks/{id}` to remove task

**User Isolation:**

- **FR-015**: All database queries MUST filter by `user_id = current_user_id` from JWT
- **FR-016**: System MUST return 404 Not Found (not 403) when user attempts to access another user's task ID to prevent task enumeration attacks
- **FR-017**: System MUST ensure no API endpoint can leak information about other users' tasks

**Data Validation:**

- **FR-018**: System MUST validate title is non-empty and 1-200 characters
- **FR-019**: System MUST validate completed field is boolean type
- **FR-020**: System MUST return 422 Unprocessable Entity with detailed validation errors for invalid input

**Response Formats:**

- **FR-021**: Successful task retrieval/creation/update MUST return task object with all fields: id, user_id, title, description, completed, created_at, updated_at
- **FR-022**: Successful task deletion MUST return 204 No Content with empty body
- **FR-023**: All error responses MUST return JSON with `{"detail": "error message"}` format
- **FR-024**: List endpoint MUST return JSON array of task objects (empty array if no tasks)

### Key Entities

- **Task**: Represents a user's work item with title, optional description, completion status, ownership (user_id), and timestamps. Tasks are isolated by user - each task belongs to exactly one user and is never shared.

- **User (Implicit)**: Represented only by user_id string from JWT claims. Backend does not store or manage user records - authentication is handled by Better Auth on frontend. Backend only verifies JWT signature and extracts user_id.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authenticated users can create tasks and retrieve them within 2 seconds (including network latency)
- **SC-002**: 100% of database queries include user_id filtering - zero data leakage between users
- **SC-003**: System handles 1000 concurrent authenticated requests without degradation (response time < 500ms at p95)
- **SC-004**: Invalid JWT tokens are rejected with appropriate error codes (401/403) in 100% of cases
- **SC-005**: All CRUD+PATCH operations complete successfully for authorized requests with 99.9% success rate
- **SC-006**: Zero successful unauthorized access attempts - all cross-user access attempts return 404 or 403
- **SC-007**: API validation errors provide clear, actionable error messages in 100% of cases

## Assumptions *(optional)*

1. **Better Auth Setup**: Frontend has already implemented Better Auth with JWT plugin enabled and BETTER_AUTH_SECRET configured
2. **Shared Secret**: Same BETTER_AUTH_SECRET value is securely shared between frontend and backend via environment variables
3. **JWT Claims Structure**: JWT payload contains user_id as a string claim (key: "userId" or "sub" - backend will support both)
4. **Database**: Neon Serverless PostgreSQL is provisioned and connection string available via DATABASE_URL environment variable
5. **No User Management**: Backend does NOT manage user signup/signin/profile - all user authentication is delegated to Better Auth
6. **User ID Format**: user_id is a string (UUID or alphanumeric identifier provided by Better Auth)
7. **Token Lifetime**: JWT tokens have reasonable expiration (e.g., 1 hour) - backend does not manage refresh tokens
8. **HTTPS**: Production deployment uses HTTPS (TLS) to protect JWT tokens in transit
9. **CORS**: Frontend and backend run on same domain or CORS is properly configured for cross-origin requests

## Dependencies *(optional)*

### External Systems

- **Better Auth (Frontend)**: Provides JWT tokens for authentication; backend depends on valid JWT generation
- **Neon PostgreSQL**: Serverless database for persistent task storage
- **Environment Configuration**: Requires BETTER_AUTH_SECRET and DATABASE_URL environment variables

### Internal Dependencies

- **SQLModel**: ORM for database schema and queries (backend dependency)
- **FastAPI**: Web framework with built-in Pydantic validation
- **python-jose**: JWT decoding and verification library
- **cryptography**: Cryptographic functions for JWT signature verification
- **Alembic**: Database migration tool for schema versioning

## Out of Scope *(optional)*

- User signup, signin, logout, password reset (handled by Better Auth on frontend)
- User profile management (name, email, avatar) - backend only knows user_id
- Task sharing or collaboration between users
- Task categories, tags, or labels
- Task due dates or reminders
- Task priority levels
- Task attachments or file uploads
- Task search or filtering (beyond listing all user tasks)
- Task sorting (backend returns tasks in creation order; frontend can sort)
- Pagination for task lists (will be added in future iteration if needed)
- Rate limiting or API throttling (handled by infrastructure/gateway)
- Task history or audit logs
- Soft delete (tasks are permanently deleted)
- Task archiving
- Multi-tenancy or workspace support

## Security & Privacy *(optional)*

### Security Requirements

- **SEC-001**: JWT tokens MUST be verified using BETTER_AUTH_SECRET before processing any request
- **SEC-002**: Database queries MUST use parameterized queries (SQLModel ORM) to prevent SQL injection
- **SEC-003**: Error messages MUST NOT leak sensitive information (e.g., don't reveal if user_id exists)
- **SEC-004**: User_id in URL path MUST match user_id from JWT to prevent privilege escalation
- **SEC-005**: BETTER_AUTH_SECRET MUST be stored securely in environment variables, never hardcoded

### Privacy Requirements

- **PRIV-001**: Users MUST only see their own tasks - no cross-user data visibility
- **PRIV-002**: Task IDs owned by other users MUST return 404 (not 403) to prevent user enumeration
- **PRIV-003**: API responses MUST NOT include other users' user_id values or task counts

## Technical Constraints *(optional)*

- **Backend Stack**: Python 3.13+, FastAPI, SQLModel, Pydantic v2
- **Database**: Neon Serverless PostgreSQL (PostgreSQL 16+ compatible)
- **Authentication**: JWT-based stateless authentication (no server-side sessions)
- **API Style**: RESTful HTTP with JSON request/response bodies
- **Environment**: Docker-based local development, serverless deployment for production
- **Migrations**: Alembic for database schema versioning
- **ORM**: SQLModel required (per constitution principle VI) - no raw SQL queries

## Non-Functional Requirements *(optional)*

### Performance

- **NFR-001**: API response time < 500ms at p95 for all endpoints under normal load
- **NFR-002**: Database queries optimized with indexes on user_id and id columns
- **NFR-003**: Support 1000 concurrent authenticated users without degradation

### Reliability

- **NFR-004**: 99.9% uptime for API endpoints
- **NFR-005**: Graceful error handling for database connection failures
- **NFR-006**: Automatic retry logic for transient database errors (connection pooling)

### Scalability

- **NFR-007**: Stateless backend enables horizontal scaling (multiple instances)
- **NFR-008**: Database connection pooling via Neon's serverless driver

### Observability

- **NFR-009**: Structured logging for all authentication failures (401/403 responses)
- **NFR-010**: Log all database query errors with context (user_id, endpoint, timestamp)
- **NFR-011**: Monitor JWT verification failures and expired token rates

## Risk Analysis *(optional)*

### High Priority Risks

1. **JWT Secret Compromise**: If BETTER_AUTH_SECRET leaks, attackers can forge tokens
   - **Mitigation**: Store in secure environment variables, rotate periodically, use strong random value (256-bit minimum)

2. **User ID Spoofing**: User attempts to access `/api/{other-user-id}/tasks` with their JWT
   - **Mitigation**: FR-004 enforces path user_id matches JWT user_id (403 Forbidden check)

3. **SQL Injection**: Malicious input in title/description fields
   - **Mitigation**: SQLModel ORM with parameterized queries (automatically handled)

### Medium Priority Risks

4. **Token Expiration Edge Cases**: User starts task creation, token expires mid-request
   - **Mitigation**: Return 401 Unauthorized, frontend handles refresh and retry

5. **Database Query Performance**: Large number of tasks per user slows queries
   - **Mitigation**: Index on user_id column, consider pagination in future iteration

6. **Concurrent Update Conflicts**: Two requests update same task simultaneously
   - **Mitigation**: Last write wins (acceptable for MVP), consider optimistic locking in future

### Low Priority Risks

7. **Rate Limiting Absence**: User could spam task creation
   - **Mitigation**: Out of scope for backend; handle at API gateway or future middleware

## Open Questions *(optional)*

None - all critical decisions have been made based on Phase II constitution and Better Auth + FastAPI JWT integration patterns.
