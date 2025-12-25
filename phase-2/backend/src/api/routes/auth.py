"""
Authentication API routes.

This module provides authentication endpoints for session management.
"""

from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr

from src.middleware.jwt import verify_jwt_token

security = HTTPBearer(auto_error=False)

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class SignUpResponse(BaseModel):
    message: str
    user_id: Optional[str] = None


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class SignInResponse(BaseModel):
    message: str
    user_id: Optional[str] = None


class SessionResponse(BaseModel):
    user: Optional[Dict[str, str]] = None
    session: Optional[Dict[str, str]] = None


@router.post("/sign-up/email", response_model=SignUpResponse, status_code=status.HTTP_201_CREATED)
async def sign_up_email(request: SignUpRequest) -> SignUpResponse:
    """
    Sign up with email and password.
    
    Note: This is a placeholder endpoint. In a real implementation,
    this would create a user account and return authentication tokens.
    For now, it returns a success message.
    """
    return SignUpResponse(
        message="Sign up successful. Please use Better Auth for authentication.",
        user_id=None
    )


@router.post("/sign-in/email", response_model=SignInResponse, status_code=status.HTTP_200_OK)
async def sign_in_email(request: SignInRequest) -> SignInResponse:
    """
    Sign in with email and password.
    
    Note: This is a placeholder endpoint. In a real implementation,
    this would verify credentials and return authentication tokens.
    For now, it returns a success message.
    """
    return SignInResponse(
        message="Sign in successful. Please use Better Auth for authentication.",
        user_id=None
    )


@router.post("/sign-out", status_code=status.HTTP_200_OK)
async def sign_out():
    """
    Sign out the current user.
    
    Note: With Better Auth, sign-out is typically handled on the frontend
    by clearing the session/token. This endpoint is provided for compatibility.
    """
    return {"message": "Sign out successful"}


@router.get("/get-session", response_model=SessionResponse)
async def get_session(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> SessionResponse:
    """
    Get current user session from JWT token.
    
    Returns the authenticated user's information from the JWT token if present.
    Returns null if no valid token is provided.
    """
    if not credentials:
        return SessionResponse(user=None, session=None)
    
    try:
        current_user = verify_jwt_token(credentials)
        return SessionResponse(
            user={
                "id": current_user["user_id"],
                "email": current_user.get("email", ""),
            },
            session={
                "user_id": current_user["user_id"],
            }
        )
    except (HTTPException, Exception):
        return SessionResponse(user=None, session=None)

