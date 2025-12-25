# Research & Technology Decisions: Frontend Web Application

**Feature**: 002-frontend-web-app
**Date**: 2025-12-18
**Phase**: 0 (Research)

## Overview

This document captures all technology decisions, research findings, and architectural choices for the frontend web application. All "NEEDS CLARIFICATION" items from the Technical Context have been resolved through research and alignment with Constitution v2.0.0.

---

## 1. Authentication Infrastructure

### Decision: Better Auth with JWT Plugin

**What was chosen**: Better Auth library with JWT plugin enabled for stateless authentication

**Rationale**:
- Constitution Section III mandates JWT-based stateless authentication
- Better Auth provides production-ready email/password authentication out of the box
- JWT plugin enables token-based auth that integrates seamlessly with FastAPI backend
- Shares `BETTER_AUTH_SECRET` with backend for token verification
- Supports httpOnly cookies for secure token storage (XSS protection)
- Provides client-side session management hooks (`useSession()`)

**Alternatives considered**:
- **NextAuth.js**: More mature but heavier; designed for OAuth primarily; JWT support is secondary
- **Clerk**: Commercial SaaS; violates self-hosted requirement and adds external dependency
- **Custom JWT implementation**: Reinventing the wheel; error-prone for security-critical auth logic
- **Supabase Auth**: Requires external database; conflicts with Neon PostgreSQL backend

**Implementation approach**:
- Install: `npm install better-auth`
- Configure in `frontend/src/lib/auth.ts` with JWT plugin
- Environment variables: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- Create auth client with `createAuthClient()` from Better Auth
- Use `useSession()` hook for client-side session access

**References**:
- Better Auth Docs: https://better-auth.com/docs
- JWT Plugin: https://better-auth.com/docs/plugins/jwt

---

## 2. API Client Architecture

### Decision: Centralized Fetch Wrapper with Automatic JWT Injection

**What was chosen**: Custom `ApiClient` class in `lib/api-client.ts` that wraps native `fetch()` and automatically attaches JWT to all requests

**Rationale**:
- Constitution Section IV requires all API requests to include `Authorization: Bearer <token>` header
- Centralized client ensures consistent error handling across application
- Native `fetch()` is sufficient; no need for axios or other heavy libraries
- TypeScript generics provide type-safe request/response handling
- Easy to mock for testing (dependency injection pattern)
- Single place to handle 401 (expired token) → redirect to `/signin`

**Architecture**:
```typescript
// lib/api-client.ts
class ApiClient {
  private baseUrl: string;
  private getToken: () => string | null;

  async get<T>(endpoint: string): Promise<ApiResponse<T>>
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>>
  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>>
  async delete<T>(endpoint: string): Promise<ApiResponse<T>>
}
```

**Key features**:
- Automatic JWT extraction from Better Auth session
- URL construction: `/api/${user_id}/tasks` pattern (user_id from JWT claims)
- Standardized error handling: 401 → redirect, 403/404/500 → toast notification
- Response parsing: expects `{ data: T, meta?: any }` format
- Request timeout handling (10 seconds default)

**Alternatives considered**:
- **Axios**: Heavier bundle size; interceptor pattern is overkill for simple JWT injection
- **React Query**: Adds caching/refetching logic; premature optimization for MVP
- **SWR**: Similar to React Query; caching not required per spec assumptions
- **GraphQL Client**: Wrong protocol; backend is RESTful per Constitution Section VII

---

## 3. State Management Strategy

### Decision: React Context + useReducer for Task State

**What was chosen**: Lightweight React Context API with `useReducer` for task list state management

**Rationale**:
- Task list is the only global state in the application
- Context API is built into React; zero additional dependencies
- `useReducer` provides predictable state updates for optimistic UI pattern
- Sufficient for MVP scope (single user, single task list, no cross-component state sharing)
- Easy to migrate to Zustand or Redux later if complexity increases
- Aligns with Next.js App Router patterns (Server Components for initial data, Client Components for interactivity)

**Architecture**:
```typescript
// contexts/TaskContext.tsx
type TaskState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
};

type TaskAction =
  | { type: 'FETCH_SUCCESS'; payload: Task[] }
  | { type: 'ADD_TASK_OPTIMISTIC'; payload: Task }
  | { type: 'UPDATE_TASK_OPTIMISTIC'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK_OPTIMISTIC'; payload: string }
  | { type: 'REVERT_OPTIMISTIC'; payload: TaskState };

const TaskContext = createContext<{
  state: TaskState;
  dispatch: Dispatch<TaskAction>;
}>(null);
```

**Optimistic update pattern**:
1. User action → dispatch optimistic action (immediate UI update)
2. Save previous state for potential rollback
3. Make API call via ApiClient
4. On success: no-op (optimistic update was correct)
5. On failure: dispatch REVERT_OPTIMISTIC with saved state + show error toast

**Alternatives considered**:
- **Zustand**: Lightweight global store; overkill for single task list; adds dependency
- **Redux Toolkit**: Too heavy for MVP; unnecessary boilerplate for simple CRUD
- **Jotai/Recoil**: Atomic state management; unnecessary granularity for task list
- **TanStack Query**: Caching/refetching logic not required per spec assumptions (no real-time sync)

---

## 4. Component Architecture & Folder Structure

### Decision: Feature-Based Organization with Colocation

**What was chosen**: Organize components by feature with tests and styles colocated

**Structure**:
```
frontend/src/
├── app/                      # Next.js App Router (routing)
│   ├── layout.tsx            # Root layout with AuthProvider
│   ├── page.tsx              # Root (/) → redirects to /dashboard or /signin
│   ├── signin/
│   │   └── page.tsx          # Sign-in/sign-up page
│   └── dashboard/
│       ├── layout.tsx        # Dashboard layout with AuthGuard
│       └── page.tsx          # Main task list page
├── components/
│   ├── auth/
│   │   ├── SignInForm.tsx    # Email/password form for authentication
│   │   ├── SignUpForm.tsx    # Account creation form
│   │   └── AuthGuard.tsx     # HOC for route protection
│   ├── tasks/
│   │   ├── TaskList.tsx      # Container for all tasks
│   │   ├── TaskItem.tsx      # Single task row with checkbox/edit/delete
│   │   ├── TaskForm.tsx      # Create/edit task form (modal or inline)
│   │   ├── TaskSkeleton.tsx  # Loading placeholder
│   │   └── EmptyState.tsx    # No tasks message
│   └── ui/
│       ├── Button.tsx        # Reusable button component
│       ├── Input.tsx         # Reusable input component
│       ├── Toast.tsx         # Global notification system
│       └── Modal.tsx         # Reusable modal dialog
├── contexts/
│   ├── TaskContext.tsx       # Task state management
│   └── AuthContext.tsx       # Auth session wrapper (Better Auth)
├── hooks/
│   ├── useTasks.ts           # Task CRUD operations (GET/POST/PATCH/DELETE)
│   ├── useOptimistic.ts      # Generic optimistic update hook
│   └── useAuth.ts            # Auth session access (wraps Better Auth)
├── lib/
│   ├── api-client.ts         # Centralized API client with JWT injection
│   ├── auth.ts               # Better Auth configuration
│   └── utils.ts              # Helper functions (date formatting, validation)
└── types/
    ├── task.ts               # Task entity TypeScript types
    └── api.ts                # API response types (ApiResponse<T>)
```

**Rationale**:
- Next.js App Router dictates `app/` directory for routing
- Colocate related components (tasks/, auth/) for maintainability
- Separate generic UI components (`ui/`) for reusability
- Hooks encapsulate complex logic (API calls, optimistic updates)
- Types centralized for easier import and consistency

**Alternatives considered**:
- **Pages directory**: Deprecated in Next.js 13+; use App Router per Constitution
- **Flat structure**: All components in single directory; unmaintainable at scale
- **Atomic design**: Over-engineering for MVP; atoms/molecules/organisms unnecessary

---

## 5. Middleware for Route Protection

### Decision: Next.js Middleware with JWT Verification

**What was chosen**: Server-side middleware in `middleware.ts` that validates JWT and redirects unauthenticated users

**Rationale**:
- Next.js middleware runs on edge before page rendering (fast, secure)
- Prevents flash of unauthenticated content (better UX than client-side redirect)
- Can verify JWT signature using `BETTER_AUTH_SECRET` shared with backend
- Protects all routes under `/dashboard/*` with single configuration
- Aligns with Constitution Section III server-side route protection requirement

**Implementation**:
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Optionally verify JWT signature here for extra security
  // (or rely on API to reject invalid tokens)

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
```

**Alternatives considered**:
- **Client-side AuthGuard only**: Allows flash of unauthenticated content; poor UX
- **Server Component auth check**: Requires checking in every page; not DRY
- **Edge Functions**: Same as middleware but different terminology; middleware is Next.js standard

---

## 6. UI Component Library

### Decision: Lucide React Icons + Custom Tailwind Components

**What was chosen**: Lucide React for icons, custom components styled with Tailwind CSS (no pre-built component library)

**Rationale**:
- Constitution Section VI specifies Lucide React icons explicitly
- Tailwind CSS provides utility classes for rapid styling without CSS files
- Custom components ensure full control over accessibility (WCAG 2.1 AA)
- No bloated component library dependencies (smaller bundle size)
- Tailwind's design tokens (spacing, colors) ensure visual consistency
- Easy to create reusable components (Button, Input, Modal) with composition

**Implementation approach**:
- Install: `npm install lucide-react`
- Create base UI components in `components/ui/` using Tailwind utilities
- Use Lucide icons: `<Check />`, `<Trash2 />`, `<Edit2 />`, `<Plus />`
- Configure Tailwind for consistent spacing scale and color palette
- Use `clsx` or `cn()` utility for conditional className merging

**Alternatives considered**:
- **Shadcn/ui**: Pre-built components; adds complexity and customization friction
- **Material UI (MUI)**: Too heavy; opinionated design that conflicts with custom branding
- **Chakra UI**: Easier than MUI but still adds bundle size; Tailwind is lighter
- **Radix UI**: Headless components; good for accessibility but overkill for MVP

---

## 7. Form Validation Strategy

### Decision: Client-Side Validation with Zod Schemas

**What was chosen**: Zod for runtime schema validation on forms before submission

**Rationale**:
- Type-safe validation that integrates with TypeScript
- Reusable schemas can be shared between forms (create task, edit task)
- Clear error messages for user feedback (FR-023, FR-024)
- Lightweight library (~8KB gzipped)
- Catches validation errors before API call (reduces network round-trips)
- Backend still validates (defense in depth per spec assumptions)

**Implementation**:
```typescript
// lib/validation.ts
import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
});

// Usage in TaskForm.tsx
const onSubmit = (formData) => {
  const result = taskSchema.safeParse(formData);
  if (!result.success) {
    setErrors(result.error.flatten().fieldErrors);
    return;
  }
  // Proceed with API call
};
```

**Alternatives considered**:
- **React Hook Form + Yup**: Adds two dependencies; Zod is lighter and TypeScript-native
- **Manual validation**: Error-prone; no type safety; hard to maintain
- **Backend-only validation**: Poor UX (network round-trip for every validation error)

---

## 8. Testing Strategy

### Decision: Vitest + React Testing Library + Playwright

**What was chosen**: Three-layer testing pyramid matching Constitution Section V

**Stack**:
- **Unit/Component**: Vitest (fast Jest alternative) + React Testing Library
- **Integration**: Vitest with mocked ApiClient
- **E2E**: Playwright for full user flow testing

**Rationale**:
- Vitest is faster than Jest and ESM-native (better Next.js compatibility)
- React Testing Library focuses on user behavior (not implementation details)
- Playwright provides cross-browser E2E testing with auto-wait (less flaky than Selenium)
- Aligns with Constitution Section V multi-layer coverage requirement
- Matches backend testing philosophy (unit → integration → API)

**Test structure**:
```
frontend/tests/
├── unit/
│   ├── hooks/
│   │   ├── useTasks.test.ts
│   │   └── useOptimistic.test.ts
│   └── lib/
│       └── api-client.test.ts
├── components/
│   ├── TaskList.test.tsx
│   ├── TaskItem.test.tsx
│   └── TaskForm.test.tsx
└── e2e/
    ├── auth.spec.ts          # Sign-up, sign-in, sign-out flows
    ├── task-crud.spec.ts     # Create, read, update, delete tasks
    └── optimistic-ui.spec.ts # Test rollback on API failure
```

**Alternatives considered**:
- **Jest**: Slower than Vitest; CJS-based; more configuration for Next.js
- **Cypress**: E2E tool; Playwright is newer and more reliable for modern frameworks
- **Testing Library only**: No E2E; misses user flow testing (Constitution violation)

---

## 9. Performance Optimization

### Decision: Server Components + Selective Client Components

**What was chosen**: Use React Server Components (RSC) for static content, Client Components only where interactivity is required

**Rationale**:
- Next.js App Router defaults to Server Components (zero JS to client)
- Task list initial load can be Server Component (pre-rendered HTML)
- Only interactive elements (checkboxes, forms, buttons) need Client Components
- Reduces bundle size (FR-040: responsive performance requirement)
- Improves LCP (SC-001: < 2.5s target) by sending less JavaScript
- Aligns with Next.js 15+ best practices

**Component classification**:
- **Server Components**: `DashboardLayout`, `TaskListContainer` (initial fetch)
- **Client Components**: `TaskItem`, `TaskForm`, `Toast` (interactivity required)

**Code example**:
```tsx
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  // Fetch tasks server-side (no client JS needed)
  const tasks = await fetchTasksSSR();
  return <TaskList initialTasks={tasks} />; // Pass to Client Component
}

// components/tasks/TaskList.tsx (Client Component)
'use client';
export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  // Client-side interactivity with optimistic updates
  const { tasks, toggleComplete, deleteTask } = useTasks(initialTasks);
  // ...
}
```

**Alternatives considered**:
- **All Client Components**: Easier but larger bundle; slower LCP
- **Static Generation (SSG)**: Not suitable for user-specific data (tasks are per-user)
- **ISR (Incremental Static Regeneration)**: Overkill for MVP; adds complexity

---

## 10. Accessibility Implementation

### Decision: Semantic HTML + ARIA Labels + Keyboard Navigation

**What was chosen**: WCAG 2.1 Level AA compliance through semantic HTML, ARIA attributes, and keyboard event handlers

**Rationale**:
- Constitution Section VIII mandates WCAG 2.1 AA compliance
- Semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`) provides screen reader context
- ARIA labels for dynamic content (loading states, error messages)
- Keyboard navigation for all interactive elements (Tab, Enter, Escape)
- Focus management for modals (trap focus, restore on close)

**Implementation checklist**:
- [ ] All buttons use `<button>` (not `<div onClick>`)
- [ ] All forms have `<label>` elements with `htmlFor` attributes
- [ ] Color contrast ≥ 4.5:1 for text (verify with Tailwind palette)
- [ ] Focus indicators visible for all interactive elements
- [ ] Modals trap focus and close on Escape key
- [ ] Error messages announced to screen readers (`role="alert"`)
- [ ] Loading states announced (`aria-live="polite"`)

**Testing approach**:
- Automated: Lighthouse accessibility audit (target score > 90)
- Automated: axe-core integration tests
- Manual: Keyboard-only navigation through all workflows
- Manual: Screen reader testing (NVDA on Windows, VoiceOver on macOS)

**Alternatives considered**:
- **Relying on component library accessibility**: Not using pre-built library (custom components)
- **WCAG AAA**: Higher standard but not required by Constitution (AA is sufficient)

---

## 11. Error Handling & User Feedback

### Decision: Toast Notifications + Inline Form Errors

**What was chosen**: Global toast system for API errors, inline error messages for form validation

**Rationale**:
- Constitution Section VI requires standardized feedback for errors
- Toasts are non-blocking and auto-dismiss (good for transient API errors)
- Inline errors provide immediate context for validation failures
- Consistent error messaging across application (FR-024)

**Implementation**:
```typescript
// components/ui/Toast.tsx
type Toast = {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number; // Auto-dismiss after N ms
};

// Usage in API error handler
apiClient.post('/tasks', data).catch((error) => {
  if (error.status === 401) {
    router.push('/signin');
  } else if (error.status === 500) {
    showToast({ type: 'error', message: 'Server error. Please try again.' });
  }
});
```

**Error message templates**:
- 401 Unauthorized: Redirect to `/signin` (silent, no toast)
- 403 Forbidden: "Access denied. You don't have permission."
- 404 Not Found: "Task not found. It may have been deleted."
- 500 Server Error: "Server error. Please try again."
- Network Error: "Unable to connect. Check your internet connection."

**Alternatives considered**:
- **Modal dialogs for errors**: Too intrusive; blocks user workflow
- **Console.error only**: Poor UX; users don't see console
- **Snackbar (Material UI term)**: Same concept as toast; naming preference

---

## 12. Development Environment Setup

### Decision: Docker Compose for Local Development (Deferred to Backend)

**What was chosen**: Frontend runs standalone (`npm run dev`) and connects to backend via environment variable

**Rationale**:
- Constitution Section IX requires Docker for local development
- Backend docker-compose.yml will orchestrate frontend, backend, and database
- Frontend development can proceed independently before full integration
- Environment variable `NEXT_PUBLIC_API_URL` points to backend (localhost:8000 or Docker service)

**Standalone setup** (for frontend-only development):
```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev  # Runs on localhost:3000
```

**Docker integration** (handled by backend team):
```yaml
# docker-compose.yml (in repo root)
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
```

**Alternatives considered**:
- **Frontend-only Docker**: Unnecessary complexity for Next.js dev server
- **Monorepo Docker**: Handled at root level (Constitution Section IX)

---

## Summary of Resolved Unknowns

| Original Unknown | Decision | Rationale |
|------------------|----------|-----------|
| Auth library | Better Auth + JWT plugin | Stateless JWT, backend integration, production-ready |
| State management | React Context + useReducer | Lightweight, sufficient for MVP, easy migration path |
| API client | Custom fetch wrapper | Native fetch, no dependencies, type-safe |
| Component library | None (custom Tailwind) | Full control, smaller bundle, WCAG compliance |
| Icons | Lucide React | Constitution requirement, tree-shakeable |
| Form validation | Zod | Type-safe, lightweight, reusable schemas |
| Testing | Vitest + RTL + Playwright | Fast, modern, matches backend testing philosophy |
| Route protection | Next.js middleware | Server-side, no flash of unauthenticated content |
| Performance | Server Components | Next.js 15+ best practice, smaller bundle |

---

## Next Steps

This research phase is complete. Proceed to **Phase 1: Design & Contracts** to:
1. Create `data-model.md` with Task entity details
2. Generate API contracts in `/contracts/` directory
3. Create `quickstart.md` for developer onboarding
4. Update agent context with new technologies
