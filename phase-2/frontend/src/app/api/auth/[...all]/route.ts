import { auth } from '@/lib/auth-server';
import { toNextJsHandler } from 'better-auth/next-js';

/**
 * Better Auth API route handler
 * This catches all /api/auth/* requests and handles them with Better Auth
 */
export const { GET, POST } = toNextJsHandler(auth);

