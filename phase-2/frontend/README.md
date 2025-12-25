# Frontend - Task Management Application

Next.js 15+ frontend application with TypeScript, Better Auth, and Tailwind CSS.

## Prerequisites

- Node.js 20+
- pnpm 8+

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your configuration:
   - `NEXT_PUBLIC_API_URL`: Backend API URL
   - `BETTER_AUTH_SECRET`: Shared secret with backend (must match)
   - `BETTER_AUTH_URL`: Frontend URL

## Development

```bash
# Start development server
pnpm dev

# Type checking
pnpm type-check

# Run linter
pnpm lint

# Run unit/component tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

## Architecture

- **Framework**: Next.js 15+ with App Router
- **Authentication**: Better Auth with JWT
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **Form Validation**: Zod
- **Testing**: Vitest (unit/component) + Playwright (E2E)

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── auth/        # Authentication components
│   ├── tasks/       # Task management components
│   └── ui/          # Reusable UI components
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── lib/             # Utilities and API clients
└── types/           # TypeScript type definitions
```

## Features

- ✅ User authentication (Better Auth + JWT)
- ✅ Task CRUD operations
- ✅ Optimistic UI updates
- ✅ Server-side route protection
- ✅ WCAG 2.1 AA accessibility
- ✅ Mobile-first responsive design

## Documentation

See `/specs/002-frontend-web-app/` for:
- `spec.md` - Feature specification
- `plan.md` - Implementation plan
- `tasks.md` - Task breakdown
- `contracts/` - API contracts
