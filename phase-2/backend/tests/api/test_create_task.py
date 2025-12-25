"""
API tests for task creation endpoint.

Tests User Story 1: Authenticated Task Creation

These tests MUST run FIRST and FAIL before implementation.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from tests.helpers import generate_test_jwt


def test_create_task_success(client: TestClient, auth_headers_user123: dict[str, str]) -> None:
    """
    Test successful task creation with valid JWT and matching user_id.

    Expected: 201 Created with task object containing auto-generated id,
    user_id from JWT, title, description, completed=False, timestamps.
    """
    response = client.post(
        "/api/user-123/tasks",
        headers=auth_headers_user123,
        json={"title": "Buy groceries", "description": "Milk, eggs, and bread"},
    )

    assert response.status_code == 201
    data = response.json()

    # Verify response structure
    assert "id" in data
    assert data["user_id"] == "user-123"
    assert data["title"] == "Buy groceries"
    assert data["description"] == "Milk, eggs, and bread"
    assert data["completed"] is False
    assert "created_at" in data
    assert "updated_at" in data


def test_create_task_no_auth(client: TestClient) -> None:
    """
    Test task creation without JWT token.

    Expected: 401 Unauthorized
    """
    response = client.post(
        "/api/user-123/tasks", json={"title": "Buy groceries", "description": "Test"}
    )

    assert response.status_code == 401


def test_create_task_invalid_token(client: TestClient) -> None:
    """
    Test task creation with malformed JWT token.

    Expected: 401 Unauthorized
    """
    headers = {"Authorization": "Bearer invalid-token-12345"}
    response = client.post(
        "/api/user-123/tasks", headers=headers, json={"title": "Buy groceries"}
    )

    assert response.status_code == 401


def test_create_task_expired_token(client: TestClient, expired_auth_headers: dict[str, str]) -> None:
    """
    Test task creation with expired JWT token.

    Expected: 401 Unauthorized
    """
    response = client.post(
        "/api/user-123/tasks", headers=expired_auth_headers, json={"title": "Buy groceries"}
    )

    assert response.status_code == 401


def test_create_task_user_mismatch(client: TestClient, auth_headers_user123: dict[str, str]) -> None:
    """
    Test task creation with mismatched user_id (path vs JWT).

    CRITICAL SECURITY TEST: User-123 JWT trying to create task for user-456.

    Expected: 403 Forbidden (user_id in path doesn't match JWT)
    """
    response = client.post(
        "/api/user-456/tasks",  # Different user_id in path
        headers=auth_headers_user123,  # user-123 JWT
        json={"title": "Buy groceries"},
    )

    assert response.status_code == 403
    assert "mismatch" in response.json()["detail"].lower()


def test_create_task_validation_empty_title(
    client: TestClient, auth_headers_user123: dict[str, str]
) -> None:
    """
    Test task creation with empty title.

    Expected: 422 Unprocessable Entity (validation error)
    """
    response = client.post("/api/user-123/tasks", headers=auth_headers_user123, json={"title": ""})

    assert response.status_code == 422


def test_create_task_validation_title_too_long(
    client: TestClient, auth_headers_user123: dict[str, str]
) -> None:
    """
    Test task creation with title exceeding 200 characters.

    Expected: 422 Unprocessable Entity (validation error)
    """
    long_title = "A" * 201
    response = client.post(
        "/api/user-123/tasks", headers=auth_headers_user123, json={"title": long_title}
    )

    assert response.status_code == 422


def test_create_task_validation_description_too_long(
    client: TestClient, auth_headers_user123: dict[str, str]
) -> None:
    """
    Test task creation with description exceeding 1000 characters.

    Expected: 422 Unprocessable Entity (validation error)
    """
    long_description = "A" * 1001
    response = client.post(
        "/api/user-123/tasks",
        headers=auth_headers_user123,
        json={"title": "Valid title", "description": long_description},
    )

    assert response.status_code == 422


def test_create_task_without_description(
    client: TestClient, auth_headers_user123: dict[str, str]
) -> None:
    """
    Test task creation without optional description field.

    Expected: 201 Created with description=None
    """
    response = client.post(
        "/api/user-123/tasks", headers=auth_headers_user123, json={"title": "Call dentist"}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Call dentist"
    assert data["description"] is None
