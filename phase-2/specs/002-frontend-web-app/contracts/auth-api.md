# API Contract: Authentication Endpoints

**Feature**: 002-frontend-web-app
**Date**: 2025-12-18
**Phase**: 1 (Design)
**Backend Base URL**: `http://localhost:8000` (development)

## Overview

This document defines authentication API contracts. Better Auth library handles most auth logic on both frontend and backend, but the backend must expose endpoints for Better Auth to call.

**Note**: Better Auth provides its own API routes. This contract documents the expected behavior for integration purposes.

---

## Authentication Architecture

```
┌─────────────┐          ┌──────────────┐          ┌─────────────┐
│   Browser   │          │   Frontend   │          │   Backend   │
│             │          │ (Better Auth)│          │  (FastAPI)  │
└──────┬──────┘          └──────┬───────┘          └──────┬──────┘
       │                        │                         │
       │ 1. User submits form   │                         │
       ├───────────────────────>│                         │
       │                        │                         │
       │                        │ 2. POST /auth/signup    │
       │                        ├────────────────────────>│
       │                        │                         │
       │                        │ 3. Validate + Create User
       │                        │                         │
       │                        │ 4. Generate JWT         │
       │                        │<────────────────────────┤
       │                        │                         │
       │ 5. Set httpOnly cookie │                         │
       │<───────────────────────┤                         │
       │                        │                         │
       │ 6. Redirect /dashboard │                         │
       │<───────────────────────┤                         │
```

---

## Endpoints

### 1. Sign Up (User Registration)

**Description**: Create a new user account with email and password.

**Endpoint**: `POST /auth/signup` (Better Auth convention)

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules**:
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters (Better Auth default)

**Success Response** (201 Created):
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "created_at": "2025-12-18T14:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2025-12-19T14:30:00Z"
}
```

**Response Headers**:
```
Set-Cookie: auth-token=<jwt>; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

**Error Responses**:

- **400 Bad Request** (email already exists):
```json
{
  "error": "EMAIL_ALREADY_EXISTS",
  "message": "An account with this email already exists"
}
```

- **422 Unprocessable Entity** (validation error):
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input",
  "details": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

**Frontend Implementation**:
```typescript
// components/auth/SignUpForm.tsx
import { createAuthClient } from 'better-auth/react';

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

const handleSignUp = async (email: string, password: string) => {
  try {
    const result = await authClient.signUp.email({
      email,
      password,
    });

    // Better Auth automatically stores token in cookie
    router.push('/dashboard');
  } catch (error) {
    if (error.code === 'EMAIL_ALREADY_EXISTS') {
      setError('This email is already registered');
    } else {
      setError('Sign up failed. Please try again.');
    }
  }
};
```

---

### 2. Sign In (User Login)

**Description**: Authenticate existing user with email and password credentials.

**Endpoint**: `POST /auth/signin` (Better Auth convention)

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response** (200 OK):
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "created_at": "2025-12-18T14:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2025-12-19T14:30:00Z"
}
```

**Response Headers**:
```
Set-Cookie: auth-token=<jwt>; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

**Error Responses**:

- **401 Unauthorized** (invalid credentials):
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

**Note**: Error message does NOT reveal whether email or password is incorrect (security best practice to prevent user enumeration).

**Frontend Implementation**:
```typescript
// components/auth/SignInForm.tsx
const handleSignIn = async (email: string, password: string) => {
  try {
    const result = await authClient.signIn.email({
      email,
      password,
    });

    router.push('/dashboard');
  } catch (error) {
    setError('Invalid email or password');
  }
};
```

---

### 3. Sign Out (User Logout)

**Description**: Invalidate user session and clear authentication token.

**Endpoint**: `POST /auth/signout` (Better Auth convention)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Cookie: auth-token=<jwt>
```

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "message": "Signed out successfully"
}
```

**Response Headers**:
```
Set-Cookie: auth-token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

**Error Responses**: None (sign out is idempotent; always succeeds)

**Frontend Implementation**:
```typescript
// components/auth/SignOutButton.tsx
const handleSignOut = async () => {
  await authClient.signOut();
  router.push('/signin');
};
```

---

### 4. Get Current Session

**Description**: Retrieve current authenticated user session information.

**Endpoint**: `GET /auth/session` (Better Auth convention)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Cookie: auth-token=<jwt>
```

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "created_at": "2025-12-18T14:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2025-12-19T14:30:00Z"
}
```

**Error Responses**:

- **401 Unauthorized** (no valid session):
```json
{
  "error": "UNAUTHORIZED",
  "message": "No valid session found"
}
```

**Frontend Implementation**:
```typescript
// hooks/useAuth.ts
import { useSession } from 'better-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ?? null,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };
}
```

---

## JWT Token Structure

### Token Claims

```json
{
  "sub": "123e4567-e89b-12d3-a456-426614174000",  // User ID (subject)
  "email": "user@example.com",                    // User email
  "iat": 1703000000,                              // Issued at (Unix timestamp)
  "exp": 1703086400                               // Expires at (Unix timestamp)
}
```

### Token Lifetime

- **Duration**: 24 hours (86400 seconds)
- **Renewal**: Not implemented in MVP (user must sign in again after expiration)
- **Storage**: httpOnly cookie (prevents XSS attacks)

### Token Verification (Backend)

```python
# backend/src/auth/jwt.py
from jose import JWTError, jwt
from fastapi import HTTPException, status

SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## Security Considerations

### Password Storage

- **Hashing**: bcrypt with salt (Better Auth default)
- **Rounds**: 10 (configurable in Better Auth)
- **Never** store plaintext passwords in database

### Cookie Security

- **HttpOnly**: Prevents JavaScript access (XSS protection)
- **Secure**: Only sent over HTTPS in production
- **SameSite=Strict**: Prevents CSRF attacks
- **Max-Age**: 24 hours (automatic expiration)

### Rate Limiting (Future)

- Sign-up: 5 requests per hour per IP
- Sign-in: 10 requests per 15 minutes per IP (brute-force protection)
- Sign-out: No limit (always allowed)

---

## Frontend Integration Checklist

### Better Auth Configuration

```typescript
// lib/auth.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  jwt: {
    enabled: true,
    secret: process.env.BETTER_AUTH_SECRET, // Shared with backend
  },
});
```

### Environment Variables

```env
# .env.local (frontend)
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=<shared-secret-with-backend>
BETTER_AUTH_URL=http://localhost:3000
```

### Middleware Setup

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/signin')) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/signin'],
};
```

---

## Error Handling Best Practices

### Frontend Error Messages

| Error Code | User-Facing Message | Developer Action |
|------------|---------------------|------------------|
| EMAIL_ALREADY_EXISTS | "This email is already registered. Try signing in instead." | Show sign-in link |
| INVALID_CREDENTIALS | "Invalid email or password" | Clear password field |
| VALIDATION_ERROR | Show inline field errors | Display validation details |
| UNAUTHORIZED | Redirect to `/signin` | Clear local state |
| NETWORK_ERROR | "Unable to connect. Check your internet connection." | Show retry button |

### Security Error Messages

**DO NOT** reveal:
- Whether an email exists in the system (prevents user enumeration)
- Specific validation failures that could aid attackers
- Server implementation details in error messages

**DO** provide:
- Generic error messages for authentication failures
- Helpful guidance for legitimate users (e.g., "Check your email and password")
- Actionable next steps (e.g., "Try signing in instead")

---

## Testing Checklist

### Happy Path Tests
- [ ] Sign up with valid email and password
- [ ] Sign in with valid credentials
- [ ] Get current session (authenticated user)
- [ ] Sign out successfully
- [ ] JWT token stored in httpOnly cookie
- [ ] JWT token includes correct user_id in `sub` claim
- [ ] Token expires after 24 hours

### Error Path Tests
- [ ] Sign up with existing email → 400
- [ ] Sign up with invalid email format → 422
- [ ] Sign up with short password (< 8 chars) → 422
- [ ] Sign in with invalid email → 401
- [ ] Sign in with invalid password → 401
- [ ] Get session without token → 401
- [ ] Get session with expired token → 401
- [ ] Get session with tampered token → 401

### Security Tests
- [ ] Password is hashed in database (not plaintext)
- [ ] JWT cookie is httpOnly (not accessible via JavaScript)
- [ ] JWT cookie is Secure in production (HTTPS only)
- [ ] Error messages don't reveal user existence
- [ ] Expired tokens are rejected by backend
- [ ] Tampered tokens are rejected (signature verification)

---

## Backend Implementation Checklist

- [ ] Install Better Auth Python library: `pip install better-auth-python`
- [ ] Configure Better Auth with JWT plugin
- [ ] Share `BETTER_AUTH_SECRET` between frontend and backend
- [ ] Implement `/auth/signup` endpoint (create user + generate JWT)
- [ ] Implement `/auth/signin` endpoint (verify credentials + generate JWT)
- [ ] Implement `/auth/signout` endpoint (invalidate session)
- [ ] Implement `/auth/session` endpoint (get current user)
- [ ] Create User model with SQLModel (id, email, hashed_password, created_at)
- [ ] Add bcrypt password hashing
- [ ] Add JWT verification middleware for protected routes
- [ ] Test user isolation (User A cannot access User B's data)

---

## Next Steps

This authentication API contract is complete. Proceed to:
1. Create `quickstart.md` for developer onboarding
2. Update agent context with auth integration details
3. Implement Better Auth on frontend and backend simultaneously
4. Test authentication flow end-to-end before proceeding to task CRUD
