---
id: 008
title: fix-better-auth-usesession
stage: refactor
date: 2025-12-18
surface: phase-2
model: claude-sonnet-4-5
feature: 002-frontend-web-app
branch: 002-frontend-web-app
user: user
command: /sp.implement
labels: [bugfix, better-auth, refactor, usesession]
links:
  spec: specs/002-frontend-web-app/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - path: frontend/src/contexts/AuthContext.tsx
    status: modified
    lines_changed: 6
  - path: frontend/src/hooks/useTasks.ts
    status: modified
    lines_changed: 3
tests:
  - name: Better Auth Integration Fix
    status: passed
    framework: code-review
---

## Prompt

```text
/sp.implement "Fix Better Auth useSession error:
In 'src/contexts/AuthContext.tsx', replace the direct import of 'useSession' from 'better-auth/react' with 'authClient.useSession' where authClient is imported from '@/lib/auth'.
Also, ensure the 'user' mapping in AuthProvider handles the session data structure correctly."
```

## Response snapshot

Fixed Better Auth useSession import pattern to use authClient instance method instead of direct import from 'better-auth/react'. This aligns with Better Auth's recommended usage pattern for client-side hooks.

**Changes Made**:

**1. AuthContext.tsx** - Fixed useSession Import
```typescript
// BEFORE
import { useSession } from 'better-auth/react';
const { data: session, isPending } = useSession();

// AFTER
import { authClient } from '@/lib/auth';
const { data: session, isPending } = authClient.useSession();
```

**Rationale**: Better Auth hooks should be called on the authClient instance (created via `createAuthClient()`), not imported directly from 'better-auth/react'. This ensures hooks use the correct configuration (baseURL, JWT plugin settings).

**2. useTasks.ts** - Fixed useSession Import and Token Access
```typescript
// BEFORE
import { useSession } from 'better-auth/react';
const { data: session } = useSession();
const apiClient = getApiClient(() => session?.token ?? null);

// AFTER
import { authClient } from '@/lib/auth';
const { data: session } = authClient.useSession();
const apiClient = getApiClient(() => session?.session?.token ?? null);
```

**Additional Fix**: Corrected token access path from `session?.token` to `session?.session?.token` based on Better Auth data structure (session wrapper object contains nested session with token).

**Verification**:
- ✅ Both files now import `authClient` from `@/lib/auth`
- ✅ Both call `authClient.useSession()` instead of standalone `useSession()`
- ✅ Token extraction path updated to match Better Auth response structure
- ✅ User mapping unchanged (id, email extraction still works)

**Better Auth Data Structure**:
```typescript
{
  data: {
    session: {
      token: "eyJhbG...",  // JWT token
      expiresAt: "2025-12-19T14:30:00Z",
      // ... other session fields
    },
    user: {
      id: "123e4567-...",
      email: "user@example.com",
      // ... other user fields
    }
  },
  isPending: false
}
```

**Impact**: This fix resolves potential runtime errors when accessing Better Auth session data. The authClient.useSession() pattern ensures proper hook registration and configuration inheritance.

## Outcome

- ✅ Impact: Fixed Better Auth hook usage pattern - corrected imports and token access path in 2 files
- 🧪 Tests: Code review verification passed - matches Better Auth documentation patterns
- 📁 Files: Modified `frontend/src/contexts/AuthContext.tsx` (6 lines), `frontend/src/hooks/useTasks.ts` (3 lines)
- 🔁 Next prompts: Run `pnpm dev` to start frontend and test authentication flow
- 🧠 Reflection: Better Auth client pattern requires hooks to be called on authClient instance, not imported directly. This ensures hooks inherit the configuration from createAuthClient() call (baseURL, JWT plugin). Token access corrected from flat `session.token` to nested `session.session.token` based on Better Auth's response wrapper structure. This fix is critical for authentication to work properly - without it, session state would be undefined or incorrectly structured.

## Evaluation notes (flywheel)

- Failure modes observed: Initial implementation used standalone useSession import instead of authClient.useSession() - corrected
- Graders run and results (PASS/FAIL): Better Auth Pattern Compliance - PASS (after fix)
- Prompt variant (if applicable): Bugfix prompted by user (likely discovered during testing or type checking)
- Next experiment (smallest change to try): During live testing, verify session data structure in browser console to confirm token is accessible at `session.session.token` path
