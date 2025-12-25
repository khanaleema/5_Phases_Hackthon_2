# Research: Backend Core - Auth-Protected Task Management

**Feature**: 001-backend-auth-tasks
**Date**: 2025-12-18
**Status**: Complete

## Research Objectives

This document resolves all technical clarifications needed for implementing the FastAPI backend with JWT authentication, SQLModel ORM, and Neon PostgreSQL integration.

---

## 1. JWT Verification Strategy

### Decision
Use `python-jose` library with HS256 algorithm to decode and verify JWT tokens signed by Better Auth.

### Rationale
- **Better Auth Compatibility**: Better Auth uses HS256 (HMAC SHA-256) for JWT signing with shared secrets
- **Industry Standard**: `python-jose` is the de facto standard for JWT handling in FastAPI projects
- **Performance**: HS256 is fast for symmetric key verification (no public key infrastructure needed)
- **Simplicity**: Shared secret model simplifies deployment (no certificate management)

### Implementation Pattern
```python
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")
security = HTTPBearer()

def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials,
            BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )
        user_id = payload.get("sub") or payload.get("userId")
        return {"user_id": user_id, "email": payload.get("email", "")}
    except ExpiredSignatureError:
        raise HTTPException(401, "Token has expired")
    except JWTError:
        raise HTTPException(401, "Invalid token")
```

### Alternatives Considered
- **PyJWT**: Less feature-complete, missing some convenience functions
- **Authlib**: Over-engineered for this use case, adds unnecessary complexity
- **Custom Implementation**: Reinventing the wheel, security risk

---

## 2. Database Session Management

### Decision
Use SQLModel's built-in `create_engine()` with connection pooling and FastAPI dependency injection via `Depends(get_db)`.

### Rationale
- **Neon Compatibility**: Neon Serverless PostgreSQL works seamlessly with standard PostgreSQL drivers
- **Connection Pooling**: Built-in pooling handles concurrent requests efficiently
- **Automatic Cleanup**: FastAPI dependencies automatically close sessions after requests
- **Transaction Management**: SQLModel sessions provide automatic commit/rollback

### Implementation Pattern
```python
from sqlmodel import create_engine, Session
from contextlib import contextmanager

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Health check before using connection
    pool_size=10,         # Base connection pool size
    max_overflow=20       # Additional connections under load
)

def get_db():
    with Session(engine) as session:
        yield session
```

### Alternatives Considered
- **Async SQLAlchemy**: Adds complexity; synchronous is sufficient for current scale
- **Manual Session Management**: Error-prone, lacks automatic cleanup
- **Global Session**: Thread-safety issues, connection leaks

### Configuration Details
- **pool_pre_ping=True**: Prevents "connection has been closed" errors with serverless databases
- **pool_size=10**: Handles typical load (100-200 concurrent requests)
- **max_overflow=20**: Burst capacity for traffic spikes

---

## 3. Route Organization Strategy

### Decision
Organize routes by resource (tasks, auth) using FastAPI `APIRouter` with `/api/{user_id}/` prefix pattern.

### Rationale
- **User Isolation at Routing Layer**: URL structure enforces user_id in every request
- **Clear Resource Boundaries**: Each router handles one domain (tasks, auth, etc.)
- **OpenAPI Documentation**: FastAPI auto-generates docs grouped by router tags
- **Maintainability**: Separate files for separate concerns

### Directory Structure
```
backend/src/api/
├── routes/
│   ├── __init__.py
│   ├── auth.py        # /api/auth/signup, /api/auth/signin, /api/auth/signout
│   └── tasks.py       # /api/{user_id}/tasks/*
```

### Implementation Pattern
```python
# routes/tasks.py
from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["tasks"])

@router.get("/{user_id}/tasks")
async def get_tasks(user_id: str, db: Session = Depends(get_db), current_user: dict = Depends(verify_jwt_token)):
    if current_user["user_id"] != user_id:
        raise HTTPException(403, "User ID mismatch")
    # ... implementation
```

### Alternatives Considered
- **Flat Routes** (`/api/tasks`): Doesn't enforce user_id in URL, harder to audit
- **Nested Routers**: Over-engineered for current scope
- **Class-Based Views**: Not idiomatic FastAPI, adds complexity

---

## 4. User Isolation Enforcement

### Decision
Implement a two-layer security model:
1. **JWT Dependency**: Extracts authenticated `user_id` from token
2. **Path Validation**: Verifies URL `user_id` matches JWT `user_id`
3. **Query Filtering**: Every SQLModel query includes `.where(Task.user_id == current_user_id)`

### Rationale
- **Defense in Depth**: Multiple layers prevent unauthorized access
- **Prevents Enumeration**: Returns 404 (not 403) when accessing other users' task IDs
- **Enforces at ORM Level**: Impossible to forget filtering in individual queries

### Implementation Pattern
```python
# In every protected route
@router.get("/{user_id}/tasks/{task_id}")
async def get_task(
    user_id: str,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_jwt_token)
):
    # LAYER 1: Verify user_id matches JWT
    if current_user["user_id"] != user_id:
        raise HTTPException(403, "User ID mismatch")

    # LAYER 2: Query with user_id filter
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user["user_id"]  # Use JWT user_id, not path
    )
    task = db.exec(statement).first()

    # LAYER 3: Return 404 to prevent enumeration
    if not task:
        raise HTTPException(404, "Task not found")

    return {"success": True, "data": task}
```

### Security Audit Checklist
- [ ] All queries filter by user_id
- [ ] Path user_id verified against JWT user_id
- [ ] 404 returned for missing/unauthorized resources (not 403)
- [ ] user_id from JWT used in queries (not from URL path)

---

## 5. Error Handling Strategy

### Decision
Use FastAPI's `HTTPException` with standardized status codes and consistent error response format.

### Rationale
- **HTTP Semantics**: Proper status codes enable client-side error handling
- **Security**: Don't leak sensitive information in error messages
- **Consistency**: All errors follow same JSON structure

### Status Code Map
- **400 Bad Request**: Validation errors, malformed JSON
- **401 Unauthorized**: Missing/invalid/expired JWT token
- **403 Forbidden**: Valid JWT but user_id mismatch
- **404 Not Found**: Resource doesn't exist OR belongs to another user (anti-enumeration)
- **422 Unprocessable Entity**: Pydantic validation errors (FastAPI default)
- **500 Internal Server Error**: Unexpected errors, database failures

### Implementation Pattern
```python
# Example: Create task endpoint
@router.post("/{user_id}/tasks", status_code=201)
async def create_task(user_id: str, task_data: TaskCreate, db: Session = Depends(get_db), current_user: dict = Depends(verify_jwt_token)):
    try:
        if current_user["user_id"] != user_id:
            raise HTTPException(403, "User ID mismatch")

        task = Task(user_id=current_user["user_id"], **task_data.dict())
        db.add(task)
        db.commit()
        db.refresh(task)
        return {"success": True, "data": task}

    except IntegrityError:
        db.rollback()
        raise HTTPException(400, "Database constraint violation")
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(500, "Internal server error")
```

### Error Response Format
```json
{
  "detail": "Error message"
}
```

---

## 6. Database Schema Design

### Decision
Use SQLModel (Pydantic + SQLAlchemy) for schema definitions with explicit indexes on `user_id`, `completed`, and `created_at`.

### Rationale
- **Type Safety**: Pydantic validation at API layer, SQLAlchemy ORM at database layer
- **Single Source of Truth**: One model serves as both API schema and database table
- **Auto-Migration**: Alembic can auto-generate migrations from model changes
- **Query Performance**: Indexes optimize user isolation queries

### Task Model Schema
```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True, max_length=255)
    title: str = Field(max_length=200, min_length=1)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Indexes Required
- **PRIMARY KEY** on `id` (auto-created)
- **INDEX** on `user_id` (for user isolation queries)
- **INDEX** on `completed` (for status filtering)
- **INDEX** on `created_at` (for sorting)

### Alternatives Considered
- **Raw SQLAlchemy**: More verbose, loses Pydantic validation
- **Separate Pydantic/SQLAlchemy Models**: Code duplication, sync issues
- **No Indexes**: Query performance degradation at scale

---

## 7. Migration Strategy

### Decision
Use Alembic for database migrations with auto-generation from SQLModel models.

### Rationale
- **Version Control**: Track schema changes in git
- **Rollback Capability**: Downgrade migrations if issues arise
- **Team Collaboration**: Multiple developers can merge schema changes
- **Production Safety**: Review migrations before applying to production

### Workflow
```bash
# 1. Modify SQLModel model in code
# 2. Generate migration
alembic revision --autogenerate -m "Add completed index to tasks"

# 3. Review generated migration (manual check)
# 4. Apply migration
alembic upgrade head

# 5. Rollback if needed
alembic downgrade -1
```

### Alembic Configuration
```python
# alembic/env.py
from sqlmodel import SQLModel
from backend.models import Task  # Import all models
target_metadata = SQLModel.metadata
```

### Alternatives Considered
- **Manual Migrations**: Error-prone, time-consuming
- **SQLModel Metadata Only**: No version control, no rollback
- **Flyway/Liquibase**: Java-centric, overkill for Python project

---

## 8. Testing Strategy

### Decision
Multi-layer testing: Unit tests (services), Integration tests (database), API tests (endpoints).

### Rationale
- **Fast Feedback**: Unit tests run in milliseconds
- **Database Validation**: Integration tests verify ORM queries
- **Contract Validation**: API tests ensure HTTP contracts work end-to-end

### Test Structure
```
backend/tests/
├── unit/
│   ├── test_task_service.py       # Business logic tests
│   └── test_models.py              # Model validation tests
├── integration/
│   ├── test_task_repository.py    # Database query tests
│   └── test_database_isolation.py # User isolation tests
└── api/
    ├── test_task_endpoints.py     # API contract tests
    └── test_auth_endpoints.py     # Authentication tests
```

### Testing Tools
- **pytest**: Test framework
- **pytest-asyncio**: Async test support
- **httpx**: FastAPI test client
- **SQLModel fixtures**: In-memory SQLite for fast tests

### Example Test
```python
def test_user_isolation(client, auth_headers_user1, auth_headers_user2):
    # User 1 creates task
    response = client.post("/api/user1/tasks", headers=auth_headers_user1, json={"title": "Task 1"})
    task_id = response.json()["data"]["id"]

    # User 2 cannot access User 1's task
    response = client.get(f"/api/user2/tasks/{task_id}", headers=auth_headers_user2)
    assert response.status_code == 404  # Not 403, to prevent enumeration
```

---

## 9. Environment Configuration

### Decision
Use `.env` files for environment-specific configuration with `python-dotenv` library.

### Rationale
- **Security**: Secrets never committed to git
- **Flexibility**: Different values for dev/staging/prod
- **12-Factor App**: Environment-based configuration

### Required Environment Variables
```bash
# .env.example
BETTER_AUTH_SECRET=your-256-bit-secret-here
DATABASE_URL=postgresql://user:pass@host:5432/dbname
CORS_ORIGINS=http://localhost:3000,https://app.example.com
LOG_LEVEL=INFO
ENVIRONMENT=development
```

### Loading Pattern
```python
from dotenv import load_dotenv
import os

load_dotenv()  # Load .env file

BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")
if not BETTER_AUTH_SECRET:
    raise ValueError("BETTER_AUTH_SECRET environment variable is required")
```

---

## 10. Logging Strategy

### Decision
Use Python's built-in `logging` module with structured logs for security events.

### Rationale
- **Auditability**: Track authentication failures and access attempts
- **Debugging**: Identify performance bottlenecks
- **Security Monitoring**: Detect suspicious activity patterns

### Logging Levels
- **INFO**: Successful operations (task created, user authenticated)
- **WARNING**: Security events (401/403 responses, token expiration)
- **ERROR**: Failures (database errors, unexpected exceptions)

### Implementation Pattern
```python
import logging

logger = logging.getLogger(__name__)

# Log security events
if response.status_code == 401:
    logger.warning(f"Unauthorized access attempt - Path: {request.url.path} - IP: {request.client.host}")
elif response.status_code == 403:
    logger.warning(f"Forbidden access attempt - User: {current_user['user_id']} - Path: {request.url.path}")
```

---

## Summary of Decisions

| **Aspect** | **Decision** | **Key Library** |
|------------|--------------|-----------------|
| JWT Verification | HS256 with shared secret | `python-jose` |
| Database ORM | SQLModel with connection pooling | `sqlmodel` |
| Database | Neon Serverless PostgreSQL | `psycopg2` |
| API Framework | FastAPI with dependency injection | `fastapi` |
| Migrations | Alembic auto-generation | `alembic` |
| Testing | Multi-layer (unit/integration/API) | `pytest`, `httpx` |
| Error Handling | HTTPException with status codes | FastAPI built-in |
| Environment Config | .env files | `python-dotenv` |
| Logging | Structured logs with security focus | `logging` |
| User Isolation | Three-layer security model | Custom middleware |

---

## Risk Mitigation

### High Priority Risks
1. **JWT Secret Compromise**: Use strong random secret (256-bit), rotate periodically, never commit to git
2. **SQL Injection**: Use SQLModel ORM exclusively (parameterized queries)
3. **User Data Leakage**: Enforce user_id filtering in all queries, return 404 for unauthorized access

### Medium Priority Risks
4. **Token Expiration Edge Cases**: Return 401, frontend handles refresh
5. **Database Connection Pool Exhaustion**: Configure pool_size and max_overflow appropriately
6. **Concurrent Update Conflicts**: Acceptable for MVP (last write wins)

---

## Next Steps (Phase 1)

1. **Data Model Design** (`data-model.md`): Define complete SQLModel schemas
2. **API Contracts** (`contracts/`): Define all endpoint request/response schemas
3. **Quickstart Guide** (`quickstart.md`): Developer onboarding instructions
4. **Agent Context Update**: Run `.specify/scripts/powershell/update-agent-context.ps1`

---

**Research Complete**: All clarifications resolved. Ready for Phase 1 (Design & Contracts).
