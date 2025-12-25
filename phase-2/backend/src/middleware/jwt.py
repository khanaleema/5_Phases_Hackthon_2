"""
JWT token verification middleware for FastAPI.

This module implements the three-layer security architecture:
1. JWT Verification: Validate token signature and expiration
2. Path Validation: Verify user_id in path matches JWT claim
3. Query Filtering: All database queries MUST filter by authenticated user_id

CRITICAL: This is the foundation of user isolation security.
"""

import os
from typing import Dict

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

# Load environment variables
load_dotenv()

# JWT Configuration
BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")
if not BETTER_AUTH_SECRET:
    raise ValueError("BETTER_AUTH_SECRET environment variable is required")

ALGORITHM = "HS256"

# HTTPBearer scheme for Authorization: Bearer <token>
security = HTTPBearer()


def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, str]:
    """
    Verify JWT token and extract user information.

    This dependency MUST be used on ALL protected endpoints to enforce authentication.
    It extracts the user_id from the JWT token which MUST be used for database queries.

    Args:
        credentials: Authorization credentials from request header

    Returns:
        Dict containing:
            - user_id: Authenticated user ID (from 'sub' or 'userId' claim)
            - email: User email (optional)

    Raises:
        HTTPException: 401 if token is missing, invalid, expired, or malformed

    Example:
        @router.get("/api/{user_id}/tasks")
        async def get_tasks(
            user_id: str,
            current_user: Dict = Depends(verify_jwt_token),
            db: Session = Depends(get_db)
        ):
            # CRITICAL: Verify path user_id matches JWT user_id
            if current_user["user_id"] != user_id:
                raise HTTPException(status_code=403, detail="User ID mismatch")

            # CRITICAL: Query MUST use current_user["user_id"], not path user_id
            tasks = db.exec(select(Task).where(Task.user_id == current_user["user_id"])).all()
            return tasks
    """
    token = credentials.credentials

    try:
        # Decode and verify JWT token
        payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=[ALGORITHM])

        # Extract user_id from JWT claims
        # Better Auth uses 'sub' (standard JWT subject claim)
        # Also support 'userId' for compatibility
        user_id = payload.get("sub") or payload.get("userId")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id claim",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Extract email (optional)
        email = payload.get("email", "")

        return {"user_id": user_id, "email": email}

    except JWTError as e:
        # Token validation failed (expired, invalid signature, malformed)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
