import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth client configuration
 * Configured with JWT plugin for stateless authentication
 *
 * Environment variables required:
 * - NEXT_PUBLIC_API_URL: Backend API base URL
 * - BETTER_AUTH_SECRET: Shared secret with backend (for JWT verification)
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' 
    ? window.location.origin
    : (process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'),
  basePath: '/api/auth',
});

/**
 * Re-export types from Better Auth for convenience
 */
export type { Session } from 'better-auth/types';
