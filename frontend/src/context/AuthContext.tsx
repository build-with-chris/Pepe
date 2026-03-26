import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import type { ReactNode } from 'react';

interface UserPayload {
  sub: string;
  email?: string;
  role?: string;
  is_admin?: boolean;
  approval_status?: 'approved' | 'pending' | 'rejected' | 'unsubmitted';
  backend_id?: number | string;
  [key: string]: any;
}

interface AuthContextValue {
  user: UserPayload | null;
  token: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
  /** Always returns a fresh token (auto-refreshed by Clerk) */
  getFreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Token refresh interval: 50 seconds (Clerk tokens expire after ~60s)
const TOKEN_REFRESH_INTERVAL_MS = 50_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserPayload | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSyncingRef = useRef(false);

  // Fresh token getter – always calls Clerk's getToken() for a non-expired token
  const getFreshToken = useCallback(async (): Promise<string | null> => {
    if (!isSignedIn) return null;
    try {
      const freshToken = await getToken();
      if (freshToken && freshToken !== token) {
        setToken(freshToken);
      }
      return freshToken;
    } catch (e) {
      console.error('[Auth] getFreshToken error:', e);
      return token; // fallback to cached
    }
  }, [isSignedIn, getToken, token]);

  // Background token refresh
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      return;
    }

    // Refresh token periodically
    refreshTimerRef.current = setInterval(async () => {
      try {
        const freshToken = await getToken();
        if (freshToken) {
          setToken(freshToken);
        }
      } catch (e) {
        console.warn('[Auth] Token refresh failed:', e);
      }
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [isLoaded, isSignedIn, getToken]);

  // Also refresh token on window focus (user switches tabs/pages)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const handleFocus = async () => {
      try {
        const freshToken = await getToken();
        if (freshToken) {
          setToken(freshToken);
        }
      } catch (e) {
        console.warn('[Auth] Focus token refresh failed:', e);
      }
    };

    window.addEventListener('focus', handleFocus);
    // Also handle visibility change (for mobile)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isLoaded, isSignedIn, getToken]);

  // Initial sync and backend user resolution
  useEffect(() => {
    if (!isLoaded) return;

    const syncAuth = async () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;

      try {
        if (isSignedIn && clerkUser) {
          const clerkToken = await getToken();
          setToken(clerkToken);

          // Check admin role from Clerk's publicMetadata
          const clerkRole = (clerkUser.publicMetadata as any)?.role;
          const isAdminFromClerk = clerkRole === 'shows-admin' || clerkRole === 'admin';

          const userPayload: UserPayload = {
            sub: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            role: clerkRole || 'artist',
            is_admin: isAdminFromClerk,
            user_metadata: {
              full_name: clerkUser.fullName || undefined,
              name: clerkUser.firstName || undefined,
            },
          };

          // Sync with backend
          if (clerkToken) {
            try {
              const API = import.meta.env.VITE_API_URL;

              await fetch(`${API}/api/artists/me/ensure`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${clerkToken}`
                },
              });

              const meRes = await fetch(`${API}/api/artists/me`, {
                headers: { Authorization: `Bearer ${clerkToken}` },
              });

              if (meRes.ok) {
                const meData = await meRes.json();
                userPayload.is_admin = meData.is_admin === true || isAdminFromClerk;
                userPayload.backend_id = meData.id;
                userPayload.approval_status = meData.approval_status;
              }
            } catch (e) {
              console.warn('[Auth] Backend sync error:', e);
            }
          }

          setUser(userPayload);
        } else {
          setToken(null);
          setUser(null);
        }
      } catch (e) {
        console.error('[Auth] Token error:', e);
        setToken(null);
        setUser(null);
      } finally {
        isSyncingRef.current = false;
      }
    };

    syncAuth();
  }, [isLoaded, isSignedIn, clerkUser, getToken]);

  const signOut = async () => {
    await clerkSignOut();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoaded,
      isSignedIn: Boolean(isSignedIn),
      signOut,
      getFreshToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
