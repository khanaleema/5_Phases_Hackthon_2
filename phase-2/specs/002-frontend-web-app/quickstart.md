# Frontend Quick Start Guide

**Feature**: 002-frontend-web-app
**Date**: 2025-12-18
**Audience**: Frontend developers joining the project

## Overview

This guide gets you up and running with the frontend development environment in under 15 minutes. By the end, you'll have the Next.js app running locally, connected to the backend API, and ready for feature development.

---

## Prerequisites

Ensure you have these installed:

- **Node.js**: v20+ (check with `node --version`)
- **pnpm**: v8+ (check with `pnpm --version`, install with `npm install -g pnpm`)
- **Git**: Latest version
- **Code Editor**: VS Code recommended with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

---

## Initial Setup (First Time Only)

### 1. Clone Repository

```bash
git clone <repository-url>
cd phase-2
```

### 2. Checkout Frontend Branch

```bash
git fetch origin
git checkout 002-frontend-web-app
```

### 3. Install Dependencies

```bash
cd frontend
pnpm install
```

**Expected output**: Dependencies install cleanly with no peer dependency warnings.

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Backend API URL (adjust if backend runs on different port)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth Configuration
BETTER_AUTH_SECRET=<shared-secret-with-backend>
BETTER_AUTH_URL=http://localhost:3000

# Optional: Enable debug logs
NEXT_PUBLIC_DEBUG=false
```

**Important**: `BETTER_AUTH_SECRET` must match the backend's secret. Coordinate with backend team.

### 5. Start Development Server

```bash
pnpm dev
```

**Expected output**:
```
▲ Next.js 15.0.0
- Local:        http://localhost:3000
- Ready in 2.5s
```

### 6. Verify Setup

Open browser to `http://localhost:3000`. You should see:

- Redirect to `/signin` (unauthenticated users)
- Sign-in form with email and password fields
- "Create Account" link

**If you see errors**:
- Check `.env.local` is configured correctly
- Verify backend is running on `localhost:8000`
- Check console for error messages

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                  # Next.js App Router (routing)
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page (redirects to /dashboard or /signin)
│   │   ├── signin/
│   │   │   └── page.tsx      # Authentication page
│   │   └── dashboard/
│   │       ├── layout.tsx    # Authenticated layout with AuthGuard
│   │       └── page.tsx      # Main task list page
│   ├── components/           # React components
│   │   ├── auth/             # Authentication components
│   │   │   ├── SignInForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── tasks/            # Task management components
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskSkeleton.tsx
│   │   │   └── EmptyState.tsx
│   │   └── ui/               # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Toast.tsx
│   │       └── Modal.tsx
│   ├── contexts/             # React Context providers
│   │   ├── TaskContext.tsx   # Task state management
│   │   └── AuthContext.tsx   # Auth session wrapper
│   ├── hooks/                # Custom React hooks
│   │   ├── useTasks.ts       # Task CRUD operations
│   │   ├── useOptimistic.ts  # Generic optimistic update hook
│   │   └── useAuth.ts        # Auth session access
│   ├── lib/                  # Utilities and configuration
│   │   ├── api-client.ts     # Centralized API client
│   │   ├── auth.ts           # Better Auth setup
│   │   ├── utils.ts          # Helper functions
│   │   └── validation.ts     # Zod schemas
│   └── types/                # TypeScript type definitions
│       ├── task.ts           # Task entity types
│       ├── api.ts            # API response types
│       └── user.ts           # User entity types
├── tests/                    # Test files
│   ├── unit/
│   ├── components/
│   └── e2e/
├── public/                   # Static assets
├── .env.example              # Environment variable template
├── .env.local                # Local env vars (not committed)
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies
└── README.md                 # Frontend-specific documentation
```

---

## Development Workflow

### Running the App

```bash
# Development server with hot reload
pnpm dev

# Type checking (without building)
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format

# Run all checks (type-check + lint)
pnpm check
```

### Testing

```bash
# Unit and component tests (Vitest)
pnpm test

# Watch mode for TDD
pnpm test:watch

# Test coverage report
pnpm test:coverage

# E2E tests (Playwright)
pnpm test:e2e

# E2E tests with UI
pnpm test:e2e:ui
```

### Building

```bash
# Production build
pnpm build

# Run production build locally
pnpm start
```

---

## Common Tasks

### Creating a New Component

1. Create file in appropriate directory:
   ```bash
   touch src/components/tasks/NewComponent.tsx
   ```

2. Use this template:
   ```typescript
   // src/components/tasks/NewComponent.tsx
   import React from 'react';

   interface NewComponentProps {
     // Define props
   }

   export function NewComponent({ }: NewComponentProps) {
     return (
       <div>
         {/* Component JSX */}
       </div>
     );
   }
   ```

3. Create test file:
   ```bash
   touch tests/components/NewComponent.test.tsx
   ```

4. Import and use in parent component:
   ```typescript
   import { NewComponent } from '@/components/tasks/NewComponent';
   ```

### Adding a New API Endpoint

1. Define TypeScript types in `src/types/`:
   ```typescript
   // types/task.ts
   export interface NewEntity {
     id: string;
     // ... other fields
   }
   ```

2. Add method to `ApiClient`:
   ```typescript
   // lib/api-client.ts
   async getNewEntity(id: string): Promise<NewEntity> {
     return this.get<NewEntity>(`/api/${this.userId}/entity/${id}`);
   }
   ```

3. Create custom hook:
   ```typescript
   // hooks/useNewEntity.ts
   export function useNewEntity() {
     const apiClient = useApiClient();

     const fetchEntity = async (id: string) => {
       return apiClient.getNewEntity(id);
     };

     return { fetchEntity };
   }
   ```

4. Use in component:
   ```typescript
   const { fetchEntity } = useNewEntity();
   const entity = await fetchEntity('123');
   ```

### Implementing Optimistic Updates

Use the `useOptimistic` hook pattern:

```typescript
// hooks/useTasks.ts
export function useTasks() {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const apiClient = useApiClient();

  const toggleComplete = async (taskId: string, completed: boolean) => {
    // 1. Save current state for rollback
    const snapshot = { tasks: state.tasks, timestamp: Date.now() };

    // 2. Optimistic update (immediate UI change)
    dispatch({
      type: 'UPDATE_TASK_OPTIMISTIC',
      payload: { id: taskId, updates: { completed: !completed } }
    });

    try {
      // 3. Make API call
      await apiClient.patch(`/tasks/${taskId}`, { completed: !completed });
      // Success: no additional action needed (optimistic update was correct)
    } catch (error) {
      // 4. Rollback on failure
      dispatch({ type: 'REVERT_OPTIMISTIC', payload: snapshot });
      showToast({ type: 'error', message: 'Failed to update task' });
    }
  };

  return { ...state, toggleComplete };
}
```

### Styling with Tailwind CSS

Use utility classes directly in JSX:

```typescript
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  Click Me
</button>
```

**Responsive design**:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

**Dark mode** (future):
```typescript
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  {/* Content adapts to theme */}
</div>
```

---

## Debugging Tips

### React DevTools

Install browser extension:
- Chrome: [React Developer Tools](https://chrome.google.com/webstore)
- Firefox: [React Developer Tools](https://addons.mozilla.org/firefox)

**Usage**:
1. Open browser DevTools (F12)
2. Go to "Components" tab
3. Inspect component props and state
4. Go to "Profiler" tab to identify performance bottlenecks

### Network Inspector

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR" to see API calls
3. Check request headers (verify JWT is attached)
4. Inspect response bodies and status codes
5. Look for 401 errors (expired JWT) or 403 errors (permission issues)

### TypeScript Errors

If you see TypeScript errors in editor but code works:

```bash
# Restart TypeScript server (VS Code)
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Clear Next.js cache
rm -rf .next
pnpm dev
```

### Hot Reload Not Working

```bash
# Restart dev server
Ctrl + C
pnpm dev

# Check file watchers (macOS/Linux may hit limit)
ulimit -n 4096
```

---

## Code Style Guide

### Naming Conventions

- **Components**: PascalCase (`TaskList.tsx`)
- **Hooks**: camelCase with `use` prefix (`useTasks.ts`)
- **Types**: PascalCase (`Task`, `ApiResponse`)
- **Functions**: camelCase (`fetchTasks`, `toggleComplete`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Import Order

```typescript
// 1. External dependencies
import React from 'react';
import { useRouter } from 'next/navigation';

// 2. Internal libraries
import { apiClient } from '@/lib/api-client';

// 3. Components
import { TaskItem } from '@/components/tasks/TaskItem';

// 4. Types
import type { Task } from '@/types/task';

// 5. Styles (if any)
import styles from './TaskList.module.css';
```

### Component Structure

```typescript
// 1. Imports
import React from 'react';

// 2. Types
interface Props {
  // ...
}

// 3. Component
export function MyComponent({ }: Props) {
  // 3a. Hooks
  const [state, setState] = useState();
  const router = useRouter();

  // 3b. Derived state
  const filteredItems = useMemo(() => /* ... */, [deps]);

  // 3c. Event handlers
  const handleClick = () => {
    // ...
  };

  // 3d. Effects
  useEffect(() => {
    // ...
  }, [deps]);

  // 3e. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## Troubleshooting

### Issue: "Failed to connect to backend"

**Symptoms**: API calls fail with network errors, toast shows "Unable to connect"

**Solutions**:
1. Check backend is running: `curl http://localhost:8000/health`
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check browser console for CORS errors
4. Ensure backend allows `http://localhost:3000` origin

### Issue: "401 Unauthorized" on every request

**Symptoms**: Redirected to `/signin` immediately after signing in

**Solutions**:
1. Check `BETTER_AUTH_SECRET` matches between frontend and backend
2. Verify JWT is stored in cookie (DevTools → Application → Cookies)
3. Check JWT expiration (decode token at jwt.io)
4. Inspect request headers (should have `Authorization: Bearer ...`)

### Issue: "Module not found" errors

**Symptoms**: TypeScript can't resolve imports

**Solutions**:
1. Check `tsconfig.json` paths are correct
2. Restart TypeScript server (see Debugging Tips)
3. Reinstall dependencies: `rm -rf node_modules && pnpm install`
4. Check file exists at expected path (case-sensitive on Linux)

### Issue: Tailwind styles not applying

**Symptoms**: CSS classes have no effect

**Solutions**:
1. Check `tailwind.config.ts` includes correct content paths
2. Restart dev server
3. Verify class names are correct (no typos)
4. Check browser DevTools → Elements to see if classes are applied

---

## Useful Commands

```bash
# View all available scripts
pnpm run

# Install new dependency
pnpm add <package>
pnpm add -D <package>  # Dev dependency

# Remove dependency
pnpm remove <package>

# Update dependencies
pnpm update

# Check for outdated packages
pnpm outdated

# Clean build artifacts
rm -rf .next out node_modules

# Fresh install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Better Auth Docs](https://better-auth.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook)

### Internal Resources
- [API Contracts](./contracts/tasks-api.md)
- [Data Model](./data-model.md)
- [Research Decisions](./research.md)
- [Backend Repository](../backend/)

### Team Communication
- **Slack**: `#frontend-dev` channel
- **Standup**: Daily at 10:00 AM
- **Code Reviews**: All PRs require 1 approval
- **Questions**: Ask in Slack or open GitHub Discussion

---

## Next Steps

Now that you're set up:

1. **Read the spec**: Review [spec.md](./spec.md) to understand feature requirements
2. **Review research**: Read [research.md](./research.md) to understand technology decisions
3. **Check tasks**: See [tasks.md](./tasks.md) (when available) for current work items
4. **Pick a task**: Choose from backlog, assign to yourself, and create feature branch
5. **Write tests**: Start with test (TDD approach), then implement
6. **Submit PR**: Push branch, open PR, request review

**Welcome to the team!** 🚀
