import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Custom hook for accessing authentication state
 *
 * Provides:
 * - user: Current authenticated user (null if not authenticated)
 * - isAuthenticated: Boolean indicating auth status
 * - isLoading: Boolean indicating if auth state is being loaded
 *
 * Usage:
 * ```tsx
 * const { user, isAuthenticated, isLoading } = useAuth();
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (!isAuthenticated) return <div>Please sign in</div>;
 * return <div>Welcome, {user.email}</div>;
 * ```
 */
export function useAuth() {
  return useAuthContext();
}
