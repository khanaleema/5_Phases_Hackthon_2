"""
Test helper utilities.

This module provides helper functions for creating test data and JWT tokens.
"""

from datetime import datetime, timedelta

from jose import jwt

from src.models.task import Task

# JWT test configuration
TEST_SECRET = "test-secret-key-min-32-chars-for-testing"
ALGORITHM = "HS256"


def generate_test_jwt(user_id: str, email: str = "test@example.com", expired: bool = False) -> str:
    """
    Generate a test JWT token for authentication.

    Args:
        user_id: User ID to encode in token
        email: User email to encode in token
        expired: If True, generate an expired token

    Returns:
        str: JWT token string

    Example:
        token = generate_test_jwt("user-123")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/user-123/tasks", headers=headers)
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


def create_test_task(user_id: str, title: str, completed: bool = False) -> Task:
    """
    Create a test task object (not persisted to database).

    Args:
        user_id: User ID for task
        title: Task title
        completed: Task completion status

    Returns:
        Task: Task instance

    Example:
        task = create_test_task("user-123", "Buy groceries")
        db.add(task)
        db.commit()
    """
    return Task(user_id=user_id, title=title, completed=completed)
