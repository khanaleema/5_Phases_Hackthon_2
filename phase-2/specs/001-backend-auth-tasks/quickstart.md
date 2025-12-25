# Quickstart Guide: Backend Core - Auth-Protected Task Management

**Feature**: 001-backend-auth-tasks
**Date**: 2025-12-18
**Audience**: Backend developers implementing this feature

## Overview

This guide provides step-by-step instructions for implementing the FastAPI backend with JWT authentication, SQLModel ORM, and Neon PostgreSQL.

---

## Prerequisites

### Required Software
- Python 3.13+
- PostgreSQL 16+ (local Docker) or Neon Serverless account
- UV (Python package manager)
- Git
- Docker Desktop (for local database)

### Required Knowledge
- FastAPI framework basics
- SQLModel/SQLAlchemy ORM
- JWT authentication concepts
- PostgreSQL fundamentals
- RESTful API design

---

## Project Structure

```
backend/
├── src/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app entry point
│   ├── db.py                      # Database session management
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py                # SQLModel Task model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── requests.py            # Request Pydantic models
│   │   ├── responses.py           # Response Pydantic models
│   │   └── auth.py                # Auth-related schemas
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── jwt.py                 # JWT verification dependency
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       └── tasks.py           # Task endpoints
│   └── services/
│       ├── __init__.py
│       └── task_service.py        # Business logic layer
├── tests/
│   ├── __init__.py
│   ├── unit/
│   ├── integration/
│   └── api/
├── alembic/
│   ├── env.py
│   └── versions/
├── alembic.ini
├── pyproject.toml                  # Dependencies (UV format)
├── .env.example                    # Environment variable template
└── README.md
```

---

## Step 1: Environment Setup

### 1.1 Initialize Backend Directory

```bash
cd phase-2
mkdir -p backend/src/{models,schemas,middleware,api/routes,services}
mkdir -p backend/tests/{unit,integration,api}
cd backend
```

### 1.2 Create pyproject.toml

```toml
[project]
name = "todo-backend"
version = "1.0.0"
description = "FastAPI backend with JWT auth and SQLModel"
requires-python = ">=3.13"
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "sqlmodel>=0.0.14",
    "psycopg2-binary>=2.9.9",
    "python-jose[cryptography]>=3.3.0",
    "python-dotenv>=1.0.0",
    "alembic>=1.12.0",
    "pydantic>=2.5.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0",
    "httpx>=0.25.0",
    "ruff>=0.1.0",
    "mypy>=1.7.0",
]

[tool.ruff]
line-length = 120
target-version = "py313"

[tool.mypy]
python_version = "3.13"
strict = true
```

### 1.3 Install Dependencies

```bash
# Install UV package manager (if not already installed)
pip install uv

# Install dependencies
uv sync
```

### 1.4 Create .env File

```bash
# Copy example
cp .env.example .env

# Edit .env with your values
```

**.env.example**:
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/todo_db

# Authentication
BETTER_AUTH_SECRET=your-256-bit-secret-here-change-this-in-production

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Environment
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### 1.5 Start Local PostgreSQL (Docker)

```bash
# Create docker-compose.yml in project root
cd ../../  # Go to phase-2 root
```

**docker-compose.yml** (root):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: todo_db
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: todo_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Start database
docker-compose up -d postgres
```

---

## Step 2: Database Setup

### 2.1 Create Database Connection (db.py)

**File**: `backend/src/db.py`

```python
from sqlmodel import SQLModel, create_engine, Session
from contextlib import contextmanager
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=True if os.getenv("ENVIRONMENT") == "development" else False
)

def get_db():
    """FastAPI dependency for database session"""
    with Session(engine) as session:
        yield session

@contextmanager
def get_db_session():
    """Context manager for database session"""
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
```

### 2.2 Create Task Model (models/task.py)

**File**: `backend/src/models/task.py`

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    """Task model with user isolation"""
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, max_length=255)
    title: str = Field(max_length=200, min_length=1)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### 2.3 Initialize Alembic

```bash
cd backend
alembic init alembic
```

**Edit** `alembic/env.py`:

```python
from sqlmodel import SQLModel
from src.models.task import Task  # Import all models
from src.db import engine

# Set target metadata
target_metadata = SQLModel.metadata

def run_migrations_online():
    connectable = engine
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()
```

### 2.4 Create Initial Migration

```bash
# Generate migration
alembic revision --autogenerate -m "Create tasks table"

# Review generated migration in alembic/versions/

# Apply migration
alembic upgrade head
```

---

## Step 3: JWT Authentication

### 3.1 Create JWT Middleware (middleware/jwt.py)

**File**: `backend/src/middleware/jwt.py`

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt, ExpiredSignatureError
import os
from typing import Dict

BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")
if not BETTER_AUTH_SECRET:
    raise ValueError("BETTER_AUTH_SECRET environment variable is required")

security = HTTPBearer()

def verify_jwt_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, str]:
    """
    Verify JWT token and extract user information.

    Returns:
        dict: {"user_id": str, "email": str}

    Raises:
        HTTPException: 401 if token is invalid or missing
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )

        user_id: str = payload.get("sub") or payload.get("userId")
        email: str = payload.get("email", "")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id"
            )

        return {"user_id": user_id, "email": email}

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
```

### 3.2 Create Request Schemas (schemas/requests.py)

**File**: `backend/src/schemas/requests.py`

```python
from pydantic import BaseModel, Field, validator
from typing import Optional

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)

    @validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()

class TaskUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)

    @validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()

class TaskPatch(BaseModel):
    completed: bool
```

### 3.3 Create Response Schemas (schemas/responses.py)

**File**: `backend/src/schemas/responses.py`

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TaskResponse(BaseModel):
    id: int
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
```

---

## Step 4: Business Logic

### 4.1 Create Task Service (services/task_service.py)

**File**: `backend/src/services/task_service.py`

```python
from sqlmodel import Session, select
from src.models.task import Task
from src.schemas.requests import TaskCreate, TaskUpdate, TaskPatch
from typing import List, Optional
from datetime import datetime

class TaskService:
    """Business logic for task management"""

    def create_task(self, db: Session, user_id: str, task_data: TaskCreate) -> Task:
        """Create a new task"""
        task = Task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            completed=False
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    def get_tasks(self, db: Session, user_id: str) -> List[Task]:
        """Get all tasks for a user"""
        statement = select(Task).where(Task.user_id == user_id)
        tasks = db.exec(statement).all()
        return tasks

    def get_task_by_id(self, db: Session, user_id: str, task_id: int) -> Optional[Task]:
        """Get a single task with user isolation"""
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id
        )
        return db.exec(statement).first()

    def update_task(self, db: Session, user_id: str, task_id: int, task_data: TaskUpdate) -> Optional[Task]:
        """Update a task"""
        task = self.get_task_by_id(db, user_id, task_id)
        if not task:
            return None

        task.title = task_data.title
        task.description = task_data.description
        task.updated_at = datetime.utcnow()

        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    def patch_task(self, db: Session, user_id: str, task_id: int, task_data: TaskPatch) -> Optional[Task]:
        """Patch a task (partial update)"""
        task = self.get_task_by_id(db, user_id, task_id)
        if not task:
            return None

        task.completed = task_data.completed
        task.updated_at = datetime.utcnow()

        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    def delete_task(self, db: Session, user_id: str, task_id: int) -> bool:
        """Delete a task"""
        task = self.get_task_by_id(db, user_id, task_id)
        if not task:
            return False

        db.delete(task)
        db.commit()
        return True
```

---

## Step 5: API Routes

### 5.1 Create Task Routes (api/routes/tasks.py)

**File**: `backend/src/api/routes/tasks.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from src.db import get_db
from src.middleware.jwt import verify_jwt_token
from src.services.task_service import TaskService
from src.schemas.requests import TaskCreate, TaskUpdate, TaskPatch
from src.schemas.responses import TaskResponse
from typing import List

router = APIRouter(prefix="/api", tags=["tasks"])
task_service = TaskService()

@router.get("/{user_id}/tasks", response_model=List[TaskResponse])
async def get_tasks(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_jwt_token)
):
    """Get all tasks for authenticated user"""
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")

    tasks = task_service.get_tasks(db, current_user["user_id"])
    return tasks

@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_jwt_token)
):
    """Create a new task"""
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")

    task = task_service.create_task(db, current_user["user_id"], task_data)
    return task

@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_jwt_token)
):
    """Get a single task by ID"""
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")

    task = task_service.get_task_by_id(db, current_user["user_id"], task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task

@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_jwt_token)
):
    """Update a task"""
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")

    task = task_service.update_task(db, current_user["user_id"], task_id, task_data)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task

@router.patch("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def patch_task(
    user_id: str,
    task_id: int,
    task_data: TaskPatch,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_jwt_token)
):
    """Patch a task (partial update)"""
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")

    task = task_service.patch_task(db, current_user["user_id"], task_id, task_data)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task

@router.delete("/{user_id}/tasks/{task_id}", status_code=204)
async def delete_task(
    user_id: str,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_jwt_token)
):
    """Delete a task"""
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")

    success = task_service.delete_task(db, current_user["user_id"], task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")

    return None
```

---

## Step 6: FastAPI Application

### 6.1 Create Main Application (main.py)

**File**: `backend/src/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import tasks
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Todo API",
    description="Auth-protected task management API",
    version="1.0.0"
)

# CORS Configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(tasks.router)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## Step 7: Run the Application

### 7.1 Start Development Server

```bash
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### 7.2 Test Endpoints

**Health Check**:
```bash
curl http://localhost:8000/health
```

**OpenAPI Docs**:
- Visit http://localhost:8000/docs (Swagger UI)
- Visit http://localhost:8000/redoc (ReDoc)

---

## Step 8: Testing

### 8.1 Run Tests

```bash
cd backend
pytest tests/ -v
```

### 8.2 Manual Testing with cURL

**Create Task** (requires JWT token):
```bash
curl -X POST http://localhost:8000/api/user-123/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Buy groceries","description":"Milk, eggs, bread"}'
```

**Get Tasks**:
```bash
curl http://localhost:8000/api/user-123/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Common Issues & Troubleshooting

### Issue: "DATABASE_URL environment variable is required"
**Solution**: Create `.env` file with `DATABASE_URL=postgresql://...`

### Issue: "BETTER_AUTH_SECRET environment variable is required"
**Solution**: Add `BETTER_AUTH_SECRET=your-secret-here` to `.env`

### Issue: Alembic migration fails
**Solution**: Check database connection, ensure PostgreSQL is running

### Issue: 401 Unauthorized on all requests
**Solution**: Verify JWT token is valid and BETTER_AUTH_SECRET matches frontend

### Issue: Connection pool exhausted
**Solution**: Increase `pool_size` and `max_overflow` in `db.py`

---

## Next Steps

1. **Run Tests**: Ensure all unit/integration/API tests pass
2. **Deploy**: Configure production environment (Neon database, secrets)
3. **Monitor**: Set up logging and monitoring
4. **Optimize**: Add caching, optimize queries

**Quickstart Complete**: Backend is ready for development!
