'use client';

import React, { createContext, useContext, type ReactNode } from 'react';
import { authClient } from '@/lib/auth';

/**
 * Auth context value shape
 */
interface AuthContextValue {
  user: { id: string; email: string; name?: string | null } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Auth context - provides authentication state to entire app
 */
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * AuthProvider component
 * Wraps the app to provide authentication state via Better Auth
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  const value: AuthContextValue = {
    user: session?.user
      ? {
          id: session.user.id,
          email: session.user.email,
          name: (session.user as any).name || null,
        }
      : null,
    isAuthenticated: !!session?.user,
    isLoading: isPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
