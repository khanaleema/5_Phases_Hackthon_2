"""
Integration tests for user_id isolation during task creation.

CRITICAL SECURITY TESTS: Verify that task.user_id is set from JWT token,
not from request body or path parameter.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from src.models.task import Task
from tests.helpers import generate_test_jwt


def test_user_id_from_jwt_not_path(client: TestClient, session: Session) -> None:
    """
    Verify task.user_id is set from JWT token, not from path parameter.

    CRITICAL: This prevents privilege escalation attacks where a user
    could try to create tasks for another user by manipulating the path.

    Expected: Task created with user_id from JWT, even if path differs
    (but should return 403 before reaching database).
    """
    # Generate JWT for user-123
    token = generate_test_jwt("user-123", "user123@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Try to create task with user-123 JWT but user-456 in path
    response = client.post(
        "/api/user-456/tasks", headers=headers, json={"title": "Malicious task"}
    )

    # Should be rejected at path validation layer (403)
    assert response.status_code == 403

    # Verify NO task was created in database
    tasks = session.exec(select(Task)).all()
    assert len(tasks) == 0


def test_user_id_cannot_be_overridden_in_body(client: TestClient, session: Session) -> None:
    """
    Verify user_id cannot be overridden via request body.

    CRITICAL: Even if client sends user_id in request body, it MUST
    be ignored and set from JWT token.

    Expected: Task created with user_id from JWT, not from body.
    """
    # Generate JWT for user-123
    token = generate_test_jwt("user-123", "user123@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Try to override user_id in request body
    response = client.post(
        "/api/user-123/tasks",
        headers=headers,
        json={"title": "Test task", "user_id": "user-456"},  # Malicious override attempt
    )

    # Should succeed (ignoring user_id in body)
    assert response.status_code == 201
    data = response.json()

    # Verify user_id is from JWT, not body
    assert data["user_id"] == "user-123"

    # Verify in database
    task = session.exec(select(Task).where(Task.id == data["id"])).first()
    assert task is not None
    assert task.user_id == "user-123"


def test_multiple_users_create_isolated_tasks(client: TestClient, session: Session) -> None:
    """
    Verify that tasks created by different users are properly isolated.

    Expected: Each user can only see/access their own tasks.
    """
    # User 123 creates a task
    token_123 = generate_test_jwt("user-123", "user123@example.com")
    headers_123 = {"Authorization": f"Bearer {token_123}"}

    response_123 = client.post(
        "/api/user-123/tasks", headers=headers_123, json={"title": "User 123 task"}
    )
    assert response_123.status_code == 201
    task_123_id = response_123.json()["id"]

    # User 456 creates a task
    token_456 = generate_test_jwt("user-456", "user456@example.com")
    headers_456 = {"Authorization": f"Bearer {token_456}"}

    response_456 = client.post(
        "/api/user-456/tasks", headers=headers_456, json={"title": "User 456 task"}
    )
    assert response_456.status_code == 201
    task_456_id = response_456.json()["id"]

    # Verify both tasks exist in database with correct user_ids
    task_123 = session.exec(select(Task).where(Task.id == task_123_id)).first()
    task_456 = session.exec(select(Task).where(Task.id == task_456_id)).first()

    assert task_123 is not None
    assert task_123.user_id == "user-123"
    assert task_123.title == "User 123 task"

    assert task_456 is not None
    assert task_456.user_id == "user-456"
    assert task_456.title == "User 456 task"
