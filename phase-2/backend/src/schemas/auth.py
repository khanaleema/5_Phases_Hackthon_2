"""
Authentication-related Pydantic schemas.

This module defines the structure of JWT tokens and authenticated user data.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class JWTPayload(BaseModel):
    """
    JWT token payload structure.

    This represents the decoded JWT token from Better Auth.
    """

    sub: str = Field(..., description="User ID (standard JWT subject claim)", example="user-123")

    user_id: str = Field(..., description="User ID (compatibility)", example="user-123")

    email: Optional[str] = Field(None, description="User email", example="user@example.com")

    exp: datetime = Field(..., description="Expiration timestamp", example="2025-12-25T10:30:00Z")

    iat: datetime = Field(..., description="Issued at timestamp", example="2025-12-18T10:30:00Z")


class CurrentUser(BaseModel):
    """
    Authenticated user information extracted from JWT.

    This is the return type of the verify_jwt_token dependency.
    """

    user_id: str = Field(..., description="User ID from JWT token", example="user-123")

    email: str = Field("", description="User email from JWT token", example="user@example.com")
