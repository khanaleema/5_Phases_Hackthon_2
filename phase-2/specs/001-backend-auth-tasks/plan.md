# Implementation Plan: Backend Core - Auth-Protected Task Management

**Branch**: `001-backend-auth-tasks` | **Date**: 2025-12-18 | **Spec**: [spec.md](./spec.md)
**Input**: Phase II Backend - Full-Stack Evolution

## Summary

Implement a production-grade FastAPI backend with JWT-based authentication, SQLModel ORM, and Neon Serverless PostgreSQL. The backend enforces strict user isolation through three-layer security (JWT verification, path validation, query filtering) and provides RESTful CRUD+PATCH endpoints for task management. All database operations use parameterized queries via SQLModel, and user_id filtering is mandatory in every query to prevent data leakage.

**Key Technical Approach**:
- **JWT Verification**: `python-jose` with HS256 algorithm, shared `BETTER_AUTH_SECRET`
- **Database**: SQLModel ORM with Neon Serverless PostgreSQL, connection pooling enabled
- **User Isolation**: Three-layer security model (JWT → Path → Query)
- **API Design**: RESTful `/api/{user_id}/tasks` with standardized JSON responses
- **Migrations**: Alembic auto-generation from SQLModel models

---

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: FastAPI 0.104+, SQLModel 0.0.14+, python-jose 3.3+, psycopg2-binary 2.9+
**Storage**: Neon Serverless PostgreSQL (production), Docker PostgreSQL 16+ (local)
**Testing**: pytest, pytest-asyncio, httpx
**Target Platform**: Linux server (Docker deployment), macOS/Windows (local dev)
**Project Type**: Web API (monorepo backend component)
**Performance Goals**: <500ms p95 response time, 1000 concurrent requests
**Constraints**: Stateless backend (no server-side sessions), user isolation mandatory
**Scale/Scope**: MVP with 6 endpoints (CRUD+PATCH), ~10 source files, ~20 test files

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This feature must comply with all principles in `.specify/memory/constitution.md`:

- [x] **I. Spec-Driven Development**: This plan was created via `/sp.plan` after `/sp.specify`
- [x] **II. Monorepo Architecture**: Changes respect `/backend` boundaries, no frontend changes
- [x] **III. Type Safety**: All data contracts use Pydantic (request/response) and SQLModel (database)
- [x] **IV. Security-First**: User isolation via JWT `user_id` filtering in all queries; `/api/{user_id}/` routes; three-layer security model
- [x] **V. Test-First Development**: Testing strategy includes unit (services/models), integration (database), and API (endpoints) tests
- [x] **VI. Production-Grade Persistence**: Uses SQLModel with Neon PostgreSQL (production) and Docker PostgreSQL (local)
- [x] **VII. API Design Standards**: RESTful CRUD + PATCH endpoints with standardized responses (200/201/204/400/401/403/404/422)
- [x] **VIII. Responsive and Accessible UI**: N/A - Backend only
- [x] **IX. Dockerized Environment**: Local development uses Docker PostgreSQL via `docker-compose.yml`
- [x] **X. AI Sub-Agents**: All agents follow spec-driven workflow (spec → plan → tasks → implement)

**Violations Requiring Justification**: None

---

## Project Structure

### Documentation (this feature)

```text
specs/001-backend-auth-tasks/
├── spec.md              # Feature specification (input)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (technical decisions)
├── data-model.md        # Phase 1 output (SQLModel schemas)
├── quickstart.md        # Phase 1 output (developer onboarding)
├── contracts/           # Phase 1 output (API contracts)
│   ├── task-endpoints.yaml       # OpenAPI specification
│   └── pydantic-schemas.md       # Pydantic model documentation
├── checklists/
│   └── requirements.md  # Requirements checklist (from /sp.checklist)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (Phase II Full-Stack Monorepo)

```text
backend/
├── src/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app entry point (CORS, routers)
│   ├── db.py                      # Database session management (connection pooling)
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py                # SQLModel Task model (user_id indexed)
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── requests.py            # Request Pydantic models (TaskCreate, TaskUpdate, TaskPatch)
│   │   ├── responses.py           # Response Pydantic models (TaskResponse, ErrorResponse)
│   │   └── auth.py                # Auth-related schemas (JWTPayload, CurrentUser)
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── jwt.py                 # JWT verification dependency (verify_jwt_token)
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       └── tasks.py           # Task endpoints (GET/POST/PUT/PATCH/DELETE)
│   └── services/
│       ├── __init__.py
│       └── task_service.py        # Business logic layer (TaskService)
├── tests/
│   ├── __init__.py
│   ├── conftest.py                # Pytest fixtures (db session, auth headers, test client)
│   ├── unit/
│   │   ├── test_task_model.py     # Model validation tests
│   │   └── test_task_service.py   # Service logic tests
│   ├── integration/
│   │   ├── test_database.py       # Database query tests
│   │   └── test_user_isolation.py # User isolation tests
│   └── api/
│       ├── test_task_endpoints.py # API endpoint contract tests
│       └── test_auth.py           # Authentication tests (401/403 scenarios)
├── alembic/
│   ├── env.py                     # Alembic configuration (imports SQLModel.metadata)
│   ├── script.py.mako             # Migration template
│   └── versions/
│       └── 001_create_tasks_table.py  # Initial migration
├── alembic.ini                    # Alembic settings
├── pyproject.toml                 # Dependencies (UV format)
├── .env.example                   # Environment variable template
├── CLAUDE.md                      # Backend-specific AI instructions
└── README.md                      # Backend documentation
```

**Structure Decision**: Phase II uses a monorepo with clear backend/frontend separation. Backend is FastAPI + SQLModel + Neon PostgreSQL; Frontend is Next.js 16+ App Router + TypeScript + Tailwind CSS. This plan only affects `/backend`.

---

## Complexity Tracking

**No complexity violations**. This implementation follows all constitution principles without exceptions.

---

## Phase 0: Research & Decisions (COMPLETE)

**Output**: [research.md](./research.md)

### Research Topics Resolved

1. **JWT Verification Strategy**
   - **Decision**: Use `python-jose` with HS256 algorithm and shared `BETTER_AUTH_SECRET`
   - **Rationale**: Compatible with Better Auth, industry standard, symmetric key simplicity
   - **Implementation**: FastAPI `HTTPBearer` dependency with `jwt.decode()`

2. **Database Session Management**
   - **Decision**: SQLModel `create_engine()` with connection pooling and FastAPI dependency injection
   - **Rationale**: Neon compatibility, automatic cleanup, transaction management
   - **Configuration**: `pool_pre_ping=True`, `pool_size=10`, `max_overflow=20`

3. **Route Organization**
   - **Decision**: Resource-based routers with `/api/{user_id}/` prefix pattern
   - **Rationale**: User isolation at routing layer, clear resource boundaries, OpenAPI grouping
   - **Structure**: `backend/src/api/routes/{resource}.py` using `APIRouter`

4. **User Isolation Enforcement**
   - **Decision**: Three-layer security model: JWT dependency → Path validation → Query filtering
   - **Rationale**: Defense in depth, prevents enumeration attacks (404 instead of 403)
   - **Pattern**: `Depends(verify_jwt_token)` + user_id check + `.where(Task.user_id == user_id)`

5. **Error Handling**
   - **Decision**: FastAPI `HTTPException` with standardized status codes
   - **Rationale**: HTTP semantics, client-side error handling, security (no info leakage)
   - **Status Codes**: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 422 (Pydantic), 500 (server)

6. **Database Schema Design**
   - **Decision**: SQLModel (Pydantic + SQLAlchemy) with explicit indexes on `user_id` and `completed`
   - **Rationale**: Type safety, single source of truth, auto-migration support, query performance
   - **Indexes**: `user_id` (required), `completed` (required), `created_at` (sorting)

7. **Migration Strategy**
   - **Decision**: Alembic auto-generation from SQLModel models
   - **Rationale**: Version control, rollback capability, team collaboration, production safety
   - **Workflow**: Modify model → Generate migration → Review → Apply → (Rollback if needed)

8. **Testing Strategy**
   - **Decision**: Multi-layer testing: Unit (services), Integration (database), API (endpoints)
   - **Rationale**: Fast feedback, database validation, contract validation
   - **Tools**: pytest, pytest-asyncio, httpx, SQLModel fixtures

9. **Environment Configuration**
   - **Decision**: `.env` files with `python-dotenv`
   - **Rationale**: Security (no committed secrets), flexibility (dev/staging/prod), 12-factor app
   - **Required Variables**: `BETTER_AUTH_SECRET`, `DATABASE_URL`, `CORS_ORIGINS`

10. **Logging Strategy**
    - **Decision**: Python `logging` module with structured logs for security events
    - **Rationale**: Auditability, debugging, security monitoring
    - **Levels**: INFO (operations), WARNING (401/403), ERROR (failures)

**All research complete**: No remaining "NEEDS CLARIFICATION" items.

---

## Phase 1: Design & Contracts (COMPLETE)

### 1.1 Data Model Design

**Output**: [data-model.md](./data-model.md)

#### Entities

**Task** (Primary Entity):
- **id**: `int` (auto-increment, primary key)
- **user_id**: `str` (indexed, foreign key concept, NOT NULL)
- **title**: `str` (1-200 characters, NOT NULL)
- **description**: `Optional[str]` (max 1000 characters, nullable)
- **completed**: `bool` (default False, indexed)
- **created_at**: `datetime` (auto-set on insert)
- **updated_at**: `datetime` (auto-set on insert, auto-update on modify)

**User** (Implicit):
- Managed by Better Auth (frontend)
- Backend only stores `user_id` strings
- No user table in backend database

#### Relationships
- **Task → User**: Many-to-One (implicit, enforced at application level)
- **User Isolation**: Every query filters by `Task.user_id == current_user_id`

#### Indexes
- **PRIMARY KEY**: `tasks.id`
- **INDEX**: `tasks.user_id` (required for user isolation queries)
- **INDEX**: `tasks.completed` (required for status filtering)
- **Composite INDEX** (future): `tasks(user_id, completed)` if query performance degrades

#### State Transitions
```
Created (completed=False) ⇄ Completed (completed=True) → Deleted (permanent)
```

---

### 1.2 API Contracts

**Output**: [contracts/task-endpoints.yaml](./contracts/task-endpoints.yaml), [contracts/pydantic-schemas.md](./contracts/pydantic-schemas.md)

#### Endpoints

| Method | Path | Description | Request | Response | Status |
|--------|------|-------------|---------|----------|--------|
| GET | `/api/{user_id}/tasks` | List all user's tasks | None | `List[Task Response]` | 200 |
| POST | `/api/{user_id}/tasks` | Create new task | `TaskCreate` | `TaskResponse` | 201 |
| GET | `/api/{user_id}/tasks/{id}` | Get single task | None | `TaskResponse` | 200 |
| PUT | `/api/{user_id}/tasks/{id}` | Update task | `TaskUpdate` | `TaskResponse` | 200 |
| PATCH | `/api/{user_id}/tasks/{id}` | Patch task (completion) | `TaskPatch` | `TaskResponse` | 200 |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task | None | None | 204 |

#### Request Schemas (Pydantic)

**TaskCreate**:
```python
{
  "title": str (1-200 chars, required),
  "description": Optional[str] (max 1000 chars)
}
```

**TaskUpdate**:
```python
{
  "title": str (1-200 chars, required),
  "description": Optional[str] (max 1000 chars)
}
```

**TaskPatch**:
```python
{
  "completed": bool (required)
}
```

#### Response Schemas

**TaskResponse**:
```python
{
  "id": int,
  "user_id": str,
  "title": str,
  "description": Optional[str],
  "completed": bool,
  "created_at": datetime,
  "updated_at": datetime
}
```

**ErrorResponse**:
```python
{
  "detail": str
}
```

#### Status Codes
- **200 OK**: Successful GET/PUT/PATCH
- **201 Created**: Successful POST (task creation)
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Validation error, malformed JSON
- **401 Unauthorized**: Missing/invalid/expired JWT token
- **403 Forbidden**: Valid JWT but user_id mismatch
- **404 Not Found**: Task not found OR belongs to another user (anti-enumeration)
- **422 Unprocessable Entity**: Pydantic validation error
- **500 Internal Server Error**: Unexpected server error

---

### 1.3 Quickstart Guide

**Output**: [quickstart.md](./quickstart.md)

Provides step-by-step developer onboarding:
1. Environment setup (Python 3.13+, UV, Docker)
2. Database setup (PostgreSQL, Alembic migrations)
3. JWT authentication (middleware, token verification)
4. Business logic (TaskService implementation)
5. API routes (FastAPI routers)
6. Running the application (uvicorn, testing)
7. Troubleshooting (common issues and solutions)

---

### 1.4 Agent Context Update

**Action**: Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`

**Status**: Deferred (script requires plan.md to exist first)

---

## Phase 2: Task Breakdown (NOT COMPLETED - requires /sp.tasks)

**Next Command**: `/sp.tasks`

This phase will generate `tasks.md` with atomic, dependency-ordered implementation tasks. Each task will include:
- Task ID and description
- Dependencies on other tasks
- Acceptance tests
- File paths and functions to modify
- Estimated complexity

**Not generated by `/sp.plan`** - requires explicit `/sp.tasks` command.

---

## Implementation Strategy

### Layer-by-Layer Approach

**Layer 1: Foundation**
- Database connection (`db.py`)
- SQLModel models (`models/task.py`)
- Alembic migrations (`alembic/versions/001_*.py`)

**Layer 2: Authentication**
- JWT middleware (`middleware/jwt.py`)
- Request/response schemas (`schemas/`)

**Layer 3: Business Logic**
- Task service (`services/task_service.py`)
- CRUD operations with user isolation

**Layer 4: API Endpoints**
- Task routes (`api/routes/tasks.py`)
- FastAPI app (`main.py`)

**Layer 5: Testing**
- Unit tests (services, models)
- Integration tests (database)
- API tests (endpoints)

---

## Security Implementation

### Three-Layer Security Model

**Layer 1: JWT Verification**
```python
current_user: dict = Depends(verify_jwt_token)
# Extracts user_id from JWT token
# Raises 401 if token invalid/expired/missing
```

**Layer 2: Path Validation**
```python
if current_user["user_id"] != user_id:
    raise HTTPException(403, "User ID mismatch")
# Prevents accessing /api/{other-user-id}/tasks with your JWT
```

**Layer 3: Query Filtering**
```python
statement = select(Task).where(
    Task.id == task_id,
    Task.user_id == current_user["user_id"]  # Use JWT user_id, not path
)
# Returns 404 if task doesn't exist OR belongs to another user
```

**Anti-Enumeration**: Return 404 (not 403) when accessing another user's task ID to prevent task ID enumeration attacks.

---

## Testing Strategy

### Unit Tests (Fast, Isolated)
- **Models**: Field validation, constraints, defaults
- **Services**: Business logic, error handling
- **Coverage Target**: 80%+ line coverage

### Integration Tests (Database)
- **Queries**: User isolation, filtering, sorting
- **Transactions**: Commit/rollback behavior
- **Indexes**: Query performance with indexes
- **Coverage Target**: 100% of database operations

### API Tests (End-to-End)
- **Endpoints**: Request/response contracts
- **Authentication**: 401/403 scenarios
- **User Isolation**: Cross-user access attempts
- **Error Handling**: All status codes tested
- **Coverage Target**: 100% of API endpoints

### Test Data
- Use in-memory SQLite for fast tests
- Create fixtures for common scenarios (authenticated users, sample tasks)
- Test both happy paths and error conditions

---

## Performance Considerations

### Database Optimization
- **Indexes**: `user_id` (required), `completed` (required)
- **Connection Pooling**: 10 base connections, 20 overflow
- **Query Patterns**: Always filter by `user_id` first (most selective)

### API Optimization
- **Response Models**: Use Pydantic `orm_mode` for efficient SQLModel → Pydantic conversion
- **Database Sessions**: Automatic cleanup via FastAPI dependencies
- **Error Handling**: Fast-fail for authentication errors (401/403)

### Monitoring
- **Logging**: All 401/403 responses logged with IP address
- **Query Logging**: Enable in development (`echo=True` in engine)
- **Performance Metrics**: Track p95 response times

---

## Risk Analysis & Mitigation

### High Priority Risks

**Risk 1: JWT Secret Compromise**
- **Impact**: Attackers can forge tokens, access all user data
- **Mitigation**: Use strong random secret (256-bit), store in environment variables, rotate periodically
- **Detection**: Monitor for unusual token generation patterns

**Risk 2: User ID Spoofing**
- **Impact**: User attempts to access `/api/{other-user-id}/tasks` with their JWT
- **Mitigation**: Three-layer security model enforces user_id validation
- **Detection**: Log all 403 Forbidden responses with user_id mismatch

**Risk 3: SQL Injection**
- **Impact**: Malicious input in title/description fields
- **Mitigation**: SQLModel ORM uses parameterized queries (safe by default)
- **Detection**: Monitor for SQL error logs

### Medium Priority Risks

**Risk 4: Token Expiration Edge Cases**
- **Impact**: User starts task creation, token expires mid-request
- **Mitigation**: Return 401 Unauthorized, frontend handles refresh and retry
- **Detection**: Monitor 401 response rates

**Risk 5: Database Query Performance**
- **Impact**: Large number of tasks per user slows queries
- **Mitigation**: Indexes on `user_id` and `completed`, consider pagination in future
- **Detection**: Monitor query execution times

**Risk 6: Concurrent Update Conflicts**
- **Impact**: Two requests update same task simultaneously
- **Mitigation**: Last write wins (acceptable for MVP), consider optimistic locking in future
- **Detection**: Monitor `updated_at` timestamp conflicts

---

## Deployment Considerations

### Environment Variables (Production)
```bash
DATABASE_URL=postgresql://user:pass@host.neon.tech:5432/prod_db?sslmode=require
BETTER_AUTH_SECRET=<strong-256-bit-secret>
CORS_ORIGINS=https://app.example.com
ENVIRONMENT=production
LOG_LEVEL=WARNING
```

### Database Migration (Production)
```bash
# Review migrations
alembic history

# Apply migrations
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

### Health Checks
- **Endpoint**: GET `/health`
- **Response**: `{"status": "healthy"}`
- **Checks**: Database connection, JWT secret loaded

---

## Architectural Decision Records (ADRs)

### Suggested ADRs for `/sp.adr`

1. **ADR-001: JWT-Based Stateless Authentication**
   - **Context**: Need scalable authentication for monorepo backend
   - **Decision**: Use JWT tokens with shared Better Auth secret
   - **Consequences**: Stateless backend, horizontal scaling enabled

2. **ADR-002: SQLModel for Database Layer**
   - **Context**: Need type-safe ORM with Pydantic integration
   - **Decision**: Use SQLModel (Pydantic + SQLAlchemy)
   - **Consequences**: Single source of truth for schemas

3. **ADR-003: Three-Layer Security Model**
   - **Context**: Need to enforce strict user isolation
   - **Decision**: JWT verification → Path validation → Query filtering
   - **Consequences**: Defense in depth, prevents data leakage

---

## Success Criteria Validation

| Success Criterion | Target | Validation Method |
|-------------------|--------|-------------------|
| SC-001: Response time | < 2 seconds | Load testing with 1000 concurrent requests |
| SC-002: User isolation | 100% queries filtered | Code review + integration tests |
| SC-003: Concurrent requests | 1000 without degradation | Load testing (p95 < 500ms) |
| SC-004: JWT rejection | 100% invalid tokens | API tests for all 401 scenarios |
| SC-005: CRUD operations | 99.9% success rate | Production monitoring |
| SC-006: Unauthorized access | 100% blocked | Integration tests for cross-user access |
| SC-007: Error messages | 100% actionable | API tests + user feedback |

---

## Next Steps

1. **Generate Tasks**: Run `/sp.tasks` to create atomic implementation tasks
2. **Implement**: Execute tasks following TDD (red-green-refactor)
3. **Test**: Ensure 80%+ unit test coverage, 100% integration/API coverage
4. **Review**: Constitution Check (verify all principles followed)
5. **Deploy**: Apply migrations, configure production environment
6. **Monitor**: Set up logging, track performance metrics

---

## Files Modified/Created (Summary)

### New Files (Phase 2 - Implementation)
- `backend/src/main.py` - FastAPI app entry point
- `backend/src/db.py` - Database session management
- `backend/src/models/task.py` - SQLModel Task model
- `backend/src/schemas/requests.py` - Request Pydantic models
- `backend/src/schemas/responses.py` - Response Pydantic models
- `backend/src/schemas/auth.py` - Auth schemas
- `backend/src/middleware/jwt.py` - JWT verification
- `backend/src/api/routes/tasks.py` - Task endpoints
- `backend/src/services/task_service.py` - Business logic
- `backend/tests/unit/test_task_model.py` - Model tests
- `backend/tests/unit/test_task_service.py` - Service tests
- `backend/tests/integration/test_database.py` - Database tests
- `backend/tests/integration/test_user_isolation.py` - Isolation tests
- `backend/tests/api/test_task_endpoints.py` - API tests
- `backend/tests/api/test_auth.py` - Auth tests
- `backend/tests/conftest.py` - Pytest fixtures
- `backend/alembic/env.py` - Alembic configuration
- `backend/alembic/versions/001_create_tasks_table.py` - Initial migration
- `backend/pyproject.toml` - Dependencies
- `backend/.env.example` - Environment template
- `backend/README.md` - Backend documentation

### Modified Files
- None (new feature, no existing code modified)

---

**Plan Status**: Phase 1 Complete (Research + Design + Contracts)

**Next Command**: `/sp.tasks` to generate atomic implementation tasks

**Branch**: `001-backend-auth-tasks`

**Estimated Effort**: 2-3 days for full implementation + testing (assuming 1 developer)

**Constitution Compliance**: ✅ All principles followed, no violations

---

**Generated**: 2025-12-18 by `/sp.plan` command
