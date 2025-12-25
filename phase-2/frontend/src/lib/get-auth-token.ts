import { authClient } from './auth';

/**
 * Get JWT token from Better Auth session
 * Better Auth with JWT plugin stores token in the session
 * This function should be called from a React component context
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Better Auth stores token in cookies or session
    // Try to get it from the session hook data
    // For now, we'll get it from the auth client's internal state
    const session = (authClient as any).$Infer?.Session;
    
    // Better Auth JWT plugin typically stores token in session.token
    // Or we can get it from the session data
    if (session?.token) {
      return session.token;
    }
    
    // Fallback: try to get from localStorage/cookies
    // Better Auth might store it in a cookie named 'better-auth.session_token'
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'better-auth.session_token' || name.includes('token')) {
          return decodeURIComponent(value);
        }
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

