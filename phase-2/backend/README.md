# Todo Backend API

FastAPI backend with JWT authentication and SQLModel ORM for task management.

## Features

- **Three-Layer Security Architecture**
  1. JWT token verification (HS256 with Better Auth shared secret)
  2. Path parameter validation (user_id must match JWT claim)
  3. Database query filtering (all queries filter by authenticated user_id)

- **RESTful API** with full CRUD + PATCH operations
- **User Isolation** enforced at every layer
- **Type-Safe** with Pydantic validation and SQLModel ORM
- **Production-Ready** with connection pooling, migrations, and comprehensive testing

## Tech Stack

- **Python 3.13+**
- **FastAPI** - Modern async web framework
- **SQLModel** - SQL database ORM with Pydantic integration
- **PostgreSQL** - Production database (Neon Serverless)
- **Alembic** - Database migrations
- **python-jose** - JWT token verification
- **pytest** - Testing framework

## Prerequisites

- Python 3.13+
- PostgreSQL 16+ (via Docker or Neon)
- UV package manager (optional but recommended)

## Quick Start

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Install Dependencies

Using UV (recommended):
```bash
uv sync
```

Or using pip:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -e .
pip install -e ".[dev]"
```

### 3. Start Database

Using Docker:
```bash
cd ..
docker-compose up -d postgres
```

Or use your own PostgreSQL instance and update `DATABASE_URL` in `.env`

### 4. Configure Environment

Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

**CRITICAL**: Set `BETTER_AUTH_SECRET` to match your Better Auth frontend configuration.

### 5. Run Migrations

```bash
alembic upgrade head
```

### 6. Start Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at: http://localhost:8000

### 7. View API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

All endpoints require `Authorization: Bearer <jwt_token>` header.

### Tasks

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/api/{user_id}/tasks` | Create new task | 201 |
| GET | `/api/{user_id}/tasks` | List all user's tasks | 200 |
| GET | `/api/{user_id}/tasks/{id}` | Get single task | 200 |
| PUT | `/api/{user_id}/tasks/{id}` | Update task (full) | 200 |
| PATCH | `/api/{user_id}/tasks/{id}` | Patch task (partial) | 200 |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task | 204 |

### Health Check

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/health` | Health check (no auth) | 200 |

## Security Architecture

### Three-Layer Security

Every protected endpoint enforces:

1. **JWT Verification** (Middleware)
   - Validates token signature using `BETTER_AUTH_SECRET`
   - Checks token expiration
   - Extracts `user_id` from `sub` or `userId` claim

2. **Path Validation** (Route Handler)
   - Verifies `user_id` in path matches JWT claim
   - Returns 403 if mismatch detected

3. **Query Filtering** (Service Layer)
   - All database queries MUST filter by authenticated `user_id`
   - Prevents cross-user data access

### Anti-Enumeration

Returns 404 (not 403) when accessing another user's resources to prevent enumeration attacks.

## Testing

### Run All Tests

```bash
pytest
```

### Run with Coverage

```bash
pytest --cov=src --cov-report=html
```

### Run Specific Test Suites

```bash
# Unit tests
pytest tests/unit/

# Integration tests
pytest tests/integration/

# API tests
pytest tests/api/
```

### Test Structure

- `tests/unit/` - Service layer and model tests
- `tests/integration/` - Database integration tests
- `tests/api/` - Endpoint tests
- `tests/conftest.py` - Shared fixtures
- `tests/helpers.py` - Test utilities

## Development

### Code Quality

```bash
# Format code
ruff format src/ tests/

# Lint code
ruff check src/ tests/

# Type check
mypy src/
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View current migration
alembic current
```

## Project Structure

```
backend/
├── src/
│   ├── models/           # SQLModel database models
│   │   └── task.py
│   ├── schemas/          # Pydantic request/response schemas
│   │   ├── auth.py
│   │   ├── requests.py
│   │   └── responses.py
│   ├── services/         # Business logic layer
│   │   └── task_service.py
│   ├── api/
│   │   └── routes/       # FastAPI route handlers
│   │       └── tasks.py
│   ├── middleware/       # JWT authentication
│   │   └── jwt.py
│   ├── db.py            # Database connection
│   └── main.py          # FastAPI app entry point
├── tests/
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   ├── api/             # API endpoint tests
│   ├── conftest.py      # Pytest fixtures
│   └── helpers.py       # Test utilities
├── alembic/             # Database migrations
│   └── versions/
├── pyproject.toml       # Project configuration
├── alembic.ini          # Alembic configuration
└── .env                 # Environment variables
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `BETTER_AUTH_SECRET` | JWT signing secret (MUST match frontend) | Min 32 characters |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000` |
| `ENVIRONMENT` | Environment name | `development`, `production` |
| `LOG_LEVEL` | Logging level | `INFO`, `DEBUG`, `WARNING` |

## Production Deployment

### Neon PostgreSQL

1. Create Neon project at https://neon.tech
2. Copy connection string to `DATABASE_URL`
3. Run migrations: `alembic upgrade head`

### Environment Variables

Ensure all environment variables are set in production:
- Use secrets management (AWS Secrets Manager, Azure Key Vault, etc.)
- NEVER commit `.env` to version control
- Rotate `BETTER_AUTH_SECRET` regularly

### Security Checklist

- [ ] `BETTER_AUTH_SECRET` is at least 32 characters
- [ ] `DATABASE_URL` uses SSL (`sslmode=require`)
- [ ] CORS origins are restricted to frontend domain
- [ ] Environment is set to `production`
- [ ] Database connection pooling is enabled
- [ ] All migrations are applied

## Troubleshooting

### Database Connection Failed

- Verify PostgreSQL is running: `docker ps` or check Neon dashboard
- Check `DATABASE_URL` in `.env`
- Ensure database exists: `psql -U postgres -c "CREATE DATABASE todo_db;"`

### JWT Token Invalid

- Ensure `BETTER_AUTH_SECRET` matches frontend configuration
- Check token expiration (default 24 hours)
- Verify token format: `Authorization: Bearer <token>`

### Tests Failing

- Ensure test database is clean: `pytest --create-db`
- Check fixtures are loading: `pytest --fixtures`
- Run single test for debugging: `pytest tests/api/test_create_task.py::test_create_task_success -v`

## License

MIT

## Support

For issues, please check the main project documentation or create an issue in the repository.
