# Implementation Plan: Frontend Web Application

**Branch**: `002-frontend-web-app` | **Date**: 2025-12-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-frontend-web-app/spec.md`

## Summary

Implement a production-ready Next.js 15+ frontend application for task management with secure authentication, optimistic UI updates, and WCAG 2.1 Level AA accessibility. The application integrates with a FastAPI backend via RESTful APIs, uses Better Auth for JWT-based authentication, and enforces strict user data isolation. Key technical decisions include React Server Components for initial data loading, Context API + useReducer for state management, Zod for form validation, and a three-layer testing approach (unit, component, E2E).

---

## Technical Context

**Language/Version**: TypeScript 5.0+ with strict mode enabled
**Framework**: Next.js 16+ (App Router), React 19+ (Server Components + Client Components)
**Primary Dependencies**:
- **Auth**: Better Auth with JWT plugin
- **Styling**: Tailwind CSS 3.4+, Lucide React icons
- **Validation**: Zod (runtime schema validation)
- **Testing**: Vitest (unit/component), React Testing Library, Playwright (E2E)
- **HTTP Client**: Native fetch API (wrapped in custom ApiClient)

**Storage**: None (frontend is stateless; all data persisted to backend via API calls)
**Testing**: Three-layer pyramid: Unit (hooks, utilities) → Component (React Testing Library) → E2E (Playwright)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge) with ES2020+ support; mobile-first responsive design (320px-2560px)
**Project Type**: Web application (monorepo `/frontend` directory)
**Performance Goals**:
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1
- 95% of interactions provide feedback within 100ms

**Constraints**:
- WCAG 2.1 Level AA accessibility compliance (keyboard navigation, screen readers, 4.5:1 contrast)
- All API requests MUST include `Authorization: Bearer <token>` header
- User isolation enforced via `/api/{user_id}/tasks` URL pattern
- httpOnly cookies for JWT storage (XSS protection)

**Scale/Scope**:
- MVP supports single-user task management (10-100 tasks typical)
- No pagination initially (deferred until user testing reveals need with >100 tasks)
- No real-time sync across tabs (manual refresh required)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This feature must comply with all principles in `.specify/memory/constitution.md`:

- [x] **I. Spec-Driven Development**: This plan was created via `/sp.plan` after `/sp.specify` ✅
- [x] **II. Monorepo Architecture**: Changes respect `/frontend` and `/backend` boundaries ✅ (Frontend-only, no backend changes)
- [x] **III. Type Safety**: All data contracts use TypeScript types derived from backend Pydantic schemas ✅
- [x] **IV. Security-First**: User isolation via JWT `user_id` filtering; `/api/{user_id}/` routes enforced by ApiClient ✅
- [x] **V. Test-First Development**: Testing strategy includes unit (Vitest), component (RTL), and E2E (Playwright) tests ✅
- [x] **VI. Production-Grade Persistence**: N/A (frontend is stateless; backend handles persistence) ✅
- [x] **VII. API Design Standards**: Consumes RESTful CRUD + PATCH endpoints from backend per Constitution ✅
- [x] **VIII. Responsive and Accessible UI**: Mobile-first Tailwind CSS, WCAG 2.1 AA compliance, keyboard navigation ✅
- [x] **IX. Dockerized Environment**: Frontend will be orchestrated via root `docker-compose.yml` (backend team owns) ✅
- [x] **X. AI Sub-Agents**: No sub-agents used for this feature; single planning agent follows spec-driven workflow ✅

**Violations Requiring Justification**: None. All constitutional principles are satisfied.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-frontend-web-app/
├── spec.md              # Feature specification (user stories, requirements, success criteria)
├── plan.md              # This file (implementation plan)
├── research.md          # Technology decisions and alternatives considered
├── data-model.md        # TypeScript types and entity relationships
├── quickstart.md        # Developer onboarding guide
├── contracts/           # API contract documentation
│   ├── auth-api.md      # Authentication endpoints (sign-up, sign-in, sign-out)
│   └── tasks-api.md     # Task CRUD endpoints (GET, POST, PATCH, DELETE)
├── checklists/
│   └── requirements.md  # Specification quality validation (all items passed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (Phase II Full-Stack Monorepo)

```text
frontend/
├── src/
│   ├── app/                          # Next.js App Router (routing + layouts)
│   │   ├── layout.tsx                # Root layout (metadata, fonts, AuthProvider)
│   │   ├── page.tsx                  # Home page (redirects to /dashboard or /signin)
│   │   ├── signin/
│   │   │   ├── layout.tsx            # Auth layout (centered card)
│   │   │   └── page.tsx              # Sign-in/sign-up page (tab switcher)
│   │   └── dashboard/
│   │       ├── layout.tsx            # Dashboard layout (navbar, AuthGuard)
│   │       └── page.tsx              # Main task list page (Server Component initial load)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignInForm.tsx        # Email/password sign-in form (Better Auth)
│   │   │   ├── SignUpForm.tsx        # Account creation form (Better Auth)
│   │   │   ├── AuthGuard.tsx         # Route protection HOC (checks session)
│   │   │   └── SignOutButton.tsx     # Sign-out button (Better Auth)
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx          # Container for all tasks (maps TaskItem)
│   │   │   ├── TaskItem.tsx          # Single task row (checkbox, edit, delete icons)
│   │   │   ├── TaskForm.tsx          # Create/edit task modal (Zod validation)
│   │   │   ├── TaskSkeleton.tsx      # Loading placeholder (5 rows)
│   │   │   └── EmptyState.tsx        # "No tasks yet" message with create button
│   │   └── ui/
│   │       ├── Button.tsx            # Reusable button (variants: primary, secondary, ghost)
│   │       ├── Input.tsx             # Reusable input (with error states)
│   │       ├── Toast.tsx             # Global notification system (success, error, info)
│   │       ├── Modal.tsx             # Reusable modal dialog (focus trap, Escape key)
│   │       └── Checkbox.tsx          # Accessible checkbox (ARIA labels)
│   ├── contexts/
│   │   ├── TaskContext.tsx           # Task state provider (useReducer + TaskAction)
│   │   └── AuthContext.tsx           # Auth session wrapper (Better Auth useSession)
│   ├── hooks/
│   │   ├── useTasks.ts               # Task CRUD hooks (fetchTasks, createTask, etc.)
│   │   ├── useOptimistic.ts          # Generic optimistic update logic with rollback
│   │   └── useAuth.ts                # Auth session access (user, isAuthenticated, isLoading)
│   ├── lib/
│   │   ├── api-client.ts             # Centralized ApiClient class (fetch wrapper + JWT injection)
│   │   ├── auth.ts                   # Better Auth configuration (createAuthClient)
│   │   ├── utils.ts                  # Helper functions (cn for className merging, date formatting)
│   │   └── validation.ts             # Zod schemas (createTaskSchema, updateTaskSchema)
│   └── types/
│       ├── task.ts                   # Task, CreateTaskInput, UpdateTaskInput interfaces
│       ├── api.ts                    # ApiResponse<T>, ApiError interfaces
│       └── user.ts                   # User interface (id, email, createdAt)
├── tests/
│   ├── unit/
│   │   ├── hooks/
│   │   │   ├── useTasks.test.ts      # Test task CRUD operations with mocked ApiClient
│   │   │   └── useOptimistic.test.ts # Test optimistic update rollback logic
│   │   └── lib/
│   │       ├── api-client.test.ts    # Test JWT injection, error handling, URL construction
│   │       └── validation.test.ts    # Test Zod schema validation (edge cases)
│   ├── components/
│   │   ├── TaskList.test.tsx         # Test rendering, empty state, skeleton loading
│   │   ├── TaskItem.test.tsx         # Test checkbox toggle, edit/delete clicks
│   │   ├── TaskForm.test.tsx         # Test validation errors, submit disabled during request
│   │   └── SignInForm.test.tsx       # Test form submission, error handling
│   └── e2e/
│       ├── auth.spec.ts              # Sign-up, sign-in, sign-out flows
│       ├── task-crud.spec.ts         # Create, read, update, delete tasks end-to-end
│       └── optimistic-ui.spec.ts     # Test rollback on API failure (network disconnect)
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── .env.example                      # Environment variable template
├── .env.local                        # Local overrides (not committed to Git)
├── next.config.js                    # Next.js configuration (API proxy in dev)
├── tailwind.config.ts                # Tailwind CSS configuration (colors, spacing)
├── tsconfig.json                     # TypeScript strict mode configuration
├── package.json                      # Dependencies (pnpm)
├── middleware.ts                     # Server-side route protection (JWT verification)
├── vitest.config.ts                  # Vitest configuration
├── playwright.config.ts              # Playwright E2E configuration
└── CLAUDE.md                         # Frontend-specific AI instructions
```

**Structure Decision**: Next.js 15+ App Router with feature-based component organization. Server Components for initial data loading (faster FCP), Client Components for interactivity (checkboxes, forms). Colocated tests for maintainability.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. This section is intentionally empty.

---

## Implementation Architecture

### 1. Authentication Infrastructure

#### Better Auth Configuration

**File**: `src/lib/auth.ts`

```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  jwt: {
    enabled: true,
    // Secret shared with backend (configured via env var)
  },
});

export type { Session } from 'better-auth/types';
```

**Environment Variables**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=<shared-with-backend>
BETTER_AUTH_URL=http://localhost:3000
```

#### Middleware for Server-Side Route Protection

**File**: `middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  // Protect dashboard routes - redirect unauthenticated users to /signin
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

**Key Features**:
- Runs on edge before page rendering (no flash of unauthenticated content)
- Checks for `auth-token` cookie (set by Better Auth)
- Redirects unauthenticated users to `/signin`
- Redirects authenticated users away from `/signin` (prevents double sign-in)

#### AuthContext Provider

**File**: `src/contexts/AuthContext.tsx`

```typescript
'use client';

import React, { createContext, useContext } from 'react';
import { useSession } from 'better-auth/react';

interface AuthContextValue {
  user: { id: string; email: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const value: AuthContextValue = {
    user: session?.user ?? null,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Usage in Root Layout**:
```typescript
// src/app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### 2. API Client Architecture

#### Centralized Fetch Wrapper

**File**: `src/lib/api-client.ts`

```typescript
import { jwtDecode } from 'jwt-decode';

interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp?: string;
    message?: string;
  };
}

interface ApiError {
  status: number;
  message: string;
  details?: { field: string; message: string }[];
}

class ApiClient {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor(baseUrl: string, getToken: () => string | null) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  private get userId(): string {
    const token = this.getToken();
    if (!token) throw new Error('No authentication token');
    const decoded = jwtDecode<{ sub: string }>(token);
    return decoded.sub;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    if (!token && !endpoint.startsWith('/auth')) {
      throw new Error('No authentication token');
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Send cookies (for httpOnly auth-token)
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Expired token - redirect to sign-in
          window.location.href = '/signin';
          throw new Error('Session expired');
        }

        const error: ApiError = {
          status: response.status,
          message: response.statusText,
        };

        try {
          const errorData = await response.json();
          error.message = errorData.message || errorData.detail || error.message;
          error.details = errorData.details;
        } catch {
          // Response body not JSON
        }

        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return { data: null as any };
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw {
          status: 0,
          message: 'Unable to connect. Check your internet connection.',
        } as ApiError;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, { method: 'GET' });
    return response.data;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<void> {
    await this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Task-specific methods (URL construction with user_id)
  async fetchTasks() {
    return this.get<Task[]>(`/api/${this.userId}/tasks`);
  }

  async createTask(input: CreateTaskInput) {
    return this.post<Task>(`/api/${this.userId}/tasks`, input);
  }

  async updateTask(taskId: string, updates: UpdateTaskInput) {
    return this.patch<Task>(`/api/${this.userId}/tasks/${taskId}`, updates);
  }

  async deleteTask(taskId: string) {
    return this.delete(`/api/${this.userId}/tasks/${taskId}`);
  }
}

// Export singleton instance
let apiClientInstance: ApiClient | null = null;

export function getApiClient(getToken: () => string | null): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient(
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      getToken
    );
  }
  return apiClientInstance;
}
```

**Key Features**:
- Automatic JWT extraction from Better Auth session
- URL construction: `/api/${user_id}/tasks` pattern enforced
- Error handling: 401 → redirect, 403/404/500 → throw ApiError
- Network error detection: "Failed to fetch" → user-friendly message
- Credentials included for httpOnly cookies

---

### 3. State Management Strategy

#### TaskContext with useReducer

**File**: `src/contexts/TaskContext.tsx`

```typescript
'use client';

import React, { createContext, useContext, useReducer, type Dispatch } from 'react';
import type { Task } from '@/types/task';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  optimisticSnapshot?: {
    tasks: Task[];
    timestamp: number;
  };
}

type TaskAction =
  | { type: 'FETCH_REQUEST' }
  | { type: 'FETCH_SUCCESS'; payload: Task[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_TASK_OPTIMISTIC'; payload: Task }
  | { type: 'ADD_TASK_CONFIRMED'; payload: Task }
  | { type: 'UPDATE_TASK_OPTIMISTIC'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK_OPTIMISTIC'; payload: string }
  | { type: 'REVERT_OPTIMISTIC'; payload: TaskState['optimisticSnapshot'] };

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: null };

    case 'FETCH_SUCCESS':
      return { ...state, loading: false, tasks: action.payload };

    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };

    case 'ADD_TASK_OPTIMISTIC':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks], // Prepend to show at top
        optimisticSnapshot: { tasks: state.tasks, timestamp: Date.now() },
      };

    case 'ADD_TASK_CONFIRMED':
      // Replace temporary ID with confirmed ID from backend
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
        optimisticSnapshot: undefined,
      };

    case 'UPDATE_TASK_OPTIMISTIC':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? { ...t, ...action.payload.updates }
            : t
        ),
        optimisticSnapshot: { tasks: state.tasks, timestamp: Date.now() },
      };

    case 'DELETE_TASK_OPTIMISTIC':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
        optimisticSnapshot: { tasks: state.tasks, timestamp: Date.now() },
      };

    case 'REVERT_OPTIMISTIC':
      return {
        ...state,
        tasks: action.payload?.tasks ?? state.tasks,
        optimisticSnapshot: undefined,
      };

    default:
      return state;
  }
}

interface TaskContextValue {
  state: TaskState;
  dispatch: Dispatch<TaskAction>;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children, initialTasks = [] }: {
  children: React.ReactNode;
  initialTasks?: Task[];
}) {
  const [state, dispatch] = useReducer(taskReducer, {
    ...initialState,
    tasks: initialTasks,
  });

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within TaskProvider');
  }
  return context;
}
```

#### useTasks Hook

**File**: `src/hooks/useTasks.ts`

```typescript
import { useCallback } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { getApiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/components/ui/Toast';
import type { CreateTaskInput, UpdateTaskInput } from '@/types/task';

export function useTasks() {
  const { state, dispatch } = useTaskContext();
  const { user } = useAuth();
  const apiClient = getApiClient(() => user?.token ?? null);

  const fetchTasks = useCallback(async () => {
    dispatch({ type: 'FETCH_REQUEST' });
    try {
      const tasks = await apiClient.fetchTasks();
      dispatch({ type: 'FETCH_SUCCESS', payload: tasks });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: (error as any).message });
      showToast({ type: 'error', message: 'Failed to load tasks' });
    }
  }, [dispatch, apiClient]);

  const createTask = useCallback(async (input: CreateTaskInput) => {
    // Optimistic: Add temporary task with fake ID
    const tempTask = {
      id: `temp-${Date.now()}`,
      user_id: user!.id,
      title: input.title,
      description: input.description ?? null,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_TASK_OPTIMISTIC', payload: tempTask });

    try {
      const confirmedTask = await apiClient.createTask(input);
      dispatch({ type: 'ADD_TASK_CONFIRMED', payload: confirmedTask });
      showToast({ type: 'success', message: 'Task created successfully' });
    } catch (error) {
      dispatch({ type: 'REVERT_OPTIMISTIC', payload: state.optimisticSnapshot });
      showToast({ type: 'error', message: 'Failed to create task' });
      throw error;
    }
  }, [dispatch, apiClient, user, state.optimisticSnapshot]);

  const toggleComplete = useCallback(async (taskId: string, completed: boolean) => {
    dispatch({
      type: 'UPDATE_TASK_OPTIMISTIC',
      payload: { id: taskId, updates: { completed: !completed } },
    });

    try {
      await apiClient.updateTask(taskId, { completed: !completed });
    } catch (error) {
      dispatch({ type: 'REVERT_OPTIMISTIC', payload: state.optimisticSnapshot });
      showToast({ type: 'error', message: 'Failed to update task' });
    }
  }, [dispatch, apiClient, state.optimisticSnapshot]);

  const updateTask = useCallback(async (taskId: string, updates: UpdateTaskInput) => {
    dispatch({ type: 'UPDATE_TASK_OPTIMISTIC', payload: { id: taskId, updates } });

    try {
      await apiClient.updateTask(taskId, updates);
      showToast({ type: 'success', message: 'Task updated successfully' });
    } catch (error) {
      dispatch({ type: 'REVERT_OPTIMISTIC', payload: state.optimisticSnapshot });
      showToast({ type: 'error', message: 'Failed to update task' });
      throw error;
    }
  }, [dispatch, apiClient, state.optimisticSnapshot]);

  const deleteTask = useCallback(async (taskId: string) => {
    dispatch({ type: 'DELETE_TASK_OPTIMISTIC', payload: taskId });

    try {
      await apiClient.deleteTask(taskId);
      showToast({ type: 'success', message: 'Task deleted successfully' });
    } catch (error) {
      dispatch({ type: 'REVERT_OPTIMISTIC', payload: state.optimisticSnapshot });
      showToast({ type: 'error', message: 'Failed to delete task' });
      throw error;
    }
  }, [dispatch, apiClient, state.optimisticSnapshot]);

  return {
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    fetchTasks,
    createTask,
    toggleComplete,
    updateTask,
    deleteTask,
  };
}
```

---

### 4. UI Components Architecture

#### Component Hierarchy

```
App Layout (Server Component)
├─ AuthProvider (Client Component)
├─ Dashboard Layout (Server Component)
│  ├─ Navbar (Client Component - sign out button)
│  ├─ TaskProvider (Client Component - initialTasks from server)
│  └─ TaskList (Client Component)
│     ├─ TaskSkeleton (loading state)
│     ├─ EmptyState (no tasks)
│     └─ TaskItem[] (Client Component)
│        ├─ Checkbox (toggle completion)
│        ├─ Edit button → TaskForm modal
│        └─ Delete button → confirmation dialog
└─ TaskForm Modal (Client Component)
   ├─ Input (title, description)
   ├─ Validation errors (Zod)
   └─ Submit button (loading spinner)
```

#### Key Components

**TaskList.tsx** (Client Component):
```typescript
'use client';

import React, { useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { TaskItem } from './TaskItem';
import { TaskSkeleton } from './TaskSkeleton';
import { EmptyState } from './EmptyState';

export function TaskList() {
  const { tasks, loading, error, fetchTasks } = useTasks();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  if (loading && tasks.length === 0) {
    return <TaskSkeleton count={5} />;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
```

**TaskItem.tsx** (Client Component):
```typescript
'use client';

import React, { useState } from 'react';
import { Check, Edit2, Trash2 } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import type { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleComplete, deleteTask } = useTasks();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggle = () => {
    toggleComplete(task.id, task.completed);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setShowDeleteConfirm(false);
  };

  return (
    <li className="flex items-center gap-3 p-4 bg-white border rounded-lg hover:shadow-md transition">
      <button
        onClick={handleToggle}
        className="flex-shrink-0 w-5 h-5 border-2 rounded flex items-center justify-center"
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {task.completed && <Check className="w-4 h-4 text-green-600" />}
      </button>

      <div className="flex-1">
        <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        )}
      </div>

      <button
        onClick={() => {/* Open edit modal */}}
        className="p-2 hover:bg-gray-100 rounded"
        aria-label="Edit task"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="p-2 hover:bg-red-50 rounded"
        aria-label="Delete task"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>

      {showDeleteConfirm && (
        <Modal onClose={() => setShowDeleteConfirm(false)}>
          <h2>Delete Task?</h2>
          <p>This action cannot be undone.</p>
          <Button onClick={handleDelete} variant="danger">Delete</Button>
          <Button onClick={() => setShowDeleteConfirm(false)} variant="secondary">
            Cancel
          </Button>
        </Modal>
      )}
    </li>
  );
}
```

**TaskForm.tsx** (Client Component - modal):
```typescript
'use client';

import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { createTaskSchema } from '@/lib/validation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { CreateTaskInput } from '@/types/task';

export function TaskForm({ onClose }: { onClose: () => void }) {
  const { createTask } = useTasks();
  const [input, setInput] = useState<CreateTaskInput>({ title: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = createTaskSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        title: fieldErrors.title?.[0] ?? '',
        description: fieldErrors.description?.[0] ?? '',
      });
      return;
    }

    setLoading(true);
    try {
      await createTask(input);
      onClose();
    } catch (error) {
      // Error toast already shown by useTasks
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={input.title}
        onChange={(e) => setInput({ ...input, title: e.target.value })}
        error={errors.title}
        required
      />

      <Input
        label="Description"
        value={input.description}
        onChange={(e) => setInput({ ...input, description: e.target.value })}
        error={errors.description}
        multiline
      />

      <div className="flex gap-2 justify-end">
        <Button type="button" onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
```

---

### 5. Testing Strategy

#### Unit Tests (Vitest)

**hooks/useTasks.test.ts**:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks } from '@/hooks/useTasks';
import { TaskProvider } from '@/contexts/TaskContext';
import { getApiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client');

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches tasks on mount', async () => {
    const mockTasks = [{ id: '1', title: 'Test', completed: false }];
    vi.mocked(getApiClient).mockReturnValue({
      fetchTasks: vi.fn().mockResolvedValue(mockTasks),
    } as any);

    const wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>;
    const { result } = renderHook(() => useTasks(), { wrapper });

    act(() => {
      result.current.fetchTasks();
    });

    await waitFor(() => {
      expect(result.current.tasks).toEqual(mockTasks);
    });
  });

  it('handles optimistic update on toggle', async () => {
    const mockTask = { id: '1', title: 'Test', completed: false };
    const apiClient = {
      updateTask: vi.fn().mockResolvedValue({ ...mockTask, completed: true }),
    };
    vi.mocked(getApiClient).mockReturnValue(apiClient as any);

    const wrapper = ({ children }) => (
      <TaskProvider initialTasks={[mockTask]}>{children}</TaskProvider>
    );
    const { result } = renderHook(() => useTasks(), { wrapper });

    act(() => {
      result.current.toggleComplete('1', false);
    });

    // Immediate optimistic update
    expect(result.current.tasks[0].completed).toBe(true);

    await waitFor(() => {
      expect(apiClient.updateTask).toHaveBeenCalledWith('1', { completed: true });
    });
  });

  it('reverts optimistic update on API failure', async () => {
    const mockTask = { id: '1', title: 'Test', completed: false };
    const apiClient = {
      updateTask: vi.fn().mockRejectedValue(new Error('Network error')),
    };
    vi.mocked(getApiClient).mockReturnValue(apiClient as any);

    const wrapper = ({ children }) => (
      <TaskProvider initialTasks={[mockTask]}>{children}</TaskProvider>
    );
    const { result } = renderHook(() => useTasks(), { wrapper });

    act(() => {
      result.current.toggleComplete('1', false);
    });

    await waitFor(() => {
      // Reverted to original state
      expect(result.current.tasks[0].completed).toBe(false);
    });
  });
});
```

#### Component Tests (React Testing Library)

**components/TaskItem.test.tsx**:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from '@/components/tasks/TaskItem';
import { TaskProvider } from '@/contexts/TaskContext';

const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  completed: false,
  user_id: 'user-1',
  created_at: '2025-12-18T10:00:00Z',
  updated_at: '2025-12-18T10:00:00Z',
};

describe('TaskItem', () => {
  it('renders task title and description', () => {
    render(
      <TaskProvider initialTasks={[mockTask]}>
        <TaskItem task={mockTask} />
      </TaskProvider>
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('toggles completion on checkbox click', () => {
    const { rerender } = render(
      <TaskProvider initialTasks={[mockTask]}>
        <TaskItem task={mockTask} />
      </TaskProvider>
    );

    const checkbox = screen.getByLabelText('Mark as complete');
    fireEvent.click(checkbox);

    // Optimistic update should show strikethrough
    expect(screen.getByText('Test Task')).toHaveClass('line-through');
  });

  it('shows delete confirmation modal', () => {
    render(
      <TaskProvider initialTasks={[mockTask]}>
        <TaskItem task={mockTask} />
      </TaskProvider>
    );

    const deleteButton = screen.getByLabelText('Delete task');
    fireEvent.click(deleteButton);

    expect(screen.getByText('Delete Task?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });
});
```

#### E2E Tests (Playwright)

**e2e/task-crud.spec.ts**:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Task CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in first
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('creates a new task', async ({ page }) => {
    await page.click('button:has-text("Create Task")');
    await page.fill('input[label="Title"]', 'New E2E Task');
    await page.fill('textarea[label="Description"]', 'Test description');
    await page.click('button:has-text("Create")');

    await expect(page.locator('text=New E2E Task')).toBeVisible();
    await expect(page.locator('text=Task created successfully')).toBeVisible();
  });

  test('toggles task completion', async ({ page }) => {
    const checkbox = page.locator('button[aria-label="Mark as complete"]').first();
    await checkbox.click();

    await expect(page.locator('h3.line-through').first()).toBeVisible();
  });

  test('deletes a task', async ({ page }) => {
    const deleteButton = page.locator('button[aria-label="Delete task"]').first();
    await deleteButton.click();

    await page.click('button:has-text("Delete")');

    await expect(page.locator('text=Task deleted successfully')).toBeVisible();
  });
});
```

---

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| **JWT Expiration During Active Session** | Medium | High (user loses unsaved work) | Show toast warning 5 minutes before expiration; implement silent token refresh (future enhancement) |
| **Optimistic Update Rollback Complexity** | Medium | Medium (state inconsistency) | Comprehensive unit tests for rollback logic; snapshot previous state before optimistic update |
| **Network Failures During Task Creation** | High | Medium (user confusion) | Clear error messages; preserve form data on failure; allow retry without re-entering data |
| **WCAG Compliance Gaps** | Low | High (legal/accessibility issues) | Automated axe-core tests; manual screen reader testing; keyboard navigation testing |
| **Cross-User Data Leakage** | Low | Critical (security breach) | Security tests verify user isolation; backend JWT verification; integration tests with multiple users |
| **Bundle Size Bloat** | Medium | Low (slower load times) | Use Next.js dynamic imports for modals; tree-shake Lucide icons; monitor bundle size in CI |
| **Race Conditions on Rapid Clicks** | Medium | Low (duplicate requests) | Debounce rapid toggles; disable buttons during API requests; use request deduplication |
| **Server Component / Client Component Confusion** | High | Low (hydration errors) | Clear 'use client' directives; ESLint rules; team training on RSC patterns |

---

## Next Steps

This implementation plan is complete. Proceed to **Phase 2: Task Breakdown** with `/sp.tasks` command to:

1. Generate atomic, testable tasks in `tasks.md`
2. Order tasks by dependency (auth infrastructure → state management → UI components → testing)
3. Include acceptance tests for each task
4. Reference specific files and functions from this plan

**Ready for Implementation**: This plan provides sufficient detail for the `/sp.implement` phase. All unknowns from Technical Context have been resolved through research, and all design artifacts (data model, API contracts, quickstart guide) are complete.
