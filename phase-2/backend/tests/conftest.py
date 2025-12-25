"""
Pytest configuration and fixtures for testing.

This module provides shared fixtures for database sessions, test clients,
and authentication headers.
"""

from datetime import datetime, timedelta
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from jose import jwt
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from src.main import app

# Test database configuration (in-memory SQLite)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# JWT test configuration
TEST_SECRET = "test-secret-key-min-32-chars-for-testing"
ALGORITHM = "HS256"


@pytest.fixture(name="session")
def session_fixture() -> Generator[Session, None, None]:
    """
    Provide a clean database session for each test.

    Creates all tables before test, drops them after.
    """
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="client")
def client_fixture(session: Session, monkeypatch: pytest.MonkeyPatch) -> Generator[TestClient, None, None]:
    """
    Provide a FastAPI test client with database override.
    """

    def get_session_override() -> Generator[Session, None, None]:
        yield session

    from src.db import get_db

    # Override JWT secret for testing
    monkeypatch.setenv("BETTER_AUTH_SECRET", TEST_SECRET)

    app.dependency_overrides[get_db] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def generate_test_jwt(user_id: str, email: str = "test@example.com", expired: bool = False) -> str:
    """
    Generate a test JWT token for authentication.

    Args:
        user_id: User ID to encode in token
        email: User email to encode in token
        expired: If True, generate an expired token

    Returns:
        str: JWT token string
    """
    if expired:
        exp = datetime.utcnow() - timedelta(hours=1)
    else:
        exp = datetime.utcnow() + timedelta(hours=24)

    payload = {
        "sub": user_id,
        "userId": user_id,  # Compatibility
        "email": email,
        "exp": exp,
        "iat": datetime.utcnow(),
    }

    return jwt.encode(payload, TEST_SECRET, algorithm=ALGORITHM)


@pytest.fixture(name="auth_headers_user123")
def auth_headers_user123_fixture() -> dict[str, str]:
    """
    Provide authentication headers for test user-123.
    """
    token = generate_test_jwt("user-123", "user123@example.com")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(name="auth_headers_user456")
def auth_headers_user456_fixture() -> dict[str, str]:
    """
    Provide authentication headers for test user-456.
    """
    token = generate_test_jwt("user-456", "user456@example.com")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(name="expired_auth_headers")
def expired_auth_headers_fixture() -> dict[str, str]:
    """
    Provide expired authentication headers for testing 401 responses.
    """
    token = generate_test_jwt("user-123", "user123@example.com", expired=True)
    return {"Authorization": f"Bearer {token}"}
