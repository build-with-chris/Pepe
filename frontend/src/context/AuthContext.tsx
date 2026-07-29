import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import type { ReactNode } from 'react';

interface UserPayload {
  sub: string;
  email?: string;
  role?: string;
  is_admin?: boolean;
  approval_status?: 'approved' | 'pending' | 'rejected' | 'unsubmitted';
  rejection_reason?: string | null;
  guidelines_accepted?: boolean;
  backend_id?: number | string;
  [key: string]: any;
}

interface AuthContextValue {
  user: UserPayload | null;
  token: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  /**
   * True, sobald das Backend-Profil (`/api/artists/me`) einmal beantwortet wurde —
   * erst dann sind `user.is_admin` und `user.guidelines_accepted` aussagekräftig.
   * Guards müssen darauf warten, sonst werfen sie einen Admin beim ersten Render
   * aus `/admin` raus.
   */
  profileLoaded: boolean;
  signOut: () => Promise<void>;
  /** Always returns a fresh token (auto-refreshed by Clerk) */
  getFreshToken: () => Promise<string | null>;
  /** Re-sync user data from backend (e.g. after guidelines acceptance) */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Name des JWT-Templates im Clerk-Dashboard. Nur ein Template-Token enthält die
// Claims `email`, `name` und `public_metadata` — das Standard-Session-Token von
// getToken() enthält sie nicht, und ohne `email` kann das Backend beim ersten
// Login keinen Artist-Datensatz anlegen. Deshalb muss *jeder* getToken-Aufruf
// das Template mitgeben, auch die Auffrischung im Hintergrund.
const CLERK_JWT_TEMPLATE = import.meta.env.VITE_CLERK_JWT_TEMPLATE || 'pepe-backend';

// Token refresh interval: 50 seconds (Clerk tokens expire after ~60s)
const TOKEN_REFRESH_INTERVAL_MS = 50_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserPayload | null>(null);
  const [profileLoaded, setProfileLoaded] = useState<boolean>(false);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSyncingRef = useRef(false);

  const getTemplateToken = useCallback(
    () => getToken({ template: CLERK_JWT_TEMPLATE }),
    [getToken]
  );

  // Fresh token getter – always calls Clerk's getToken() for a non-expired token
  const getFreshToken = useCallback(async (): Promise<string | null> => {
    if (!isSignedIn) return null;
    try {
      const freshToken = await getTemplateToken();
      if (freshToken && freshToken !== token) {
        setToken(freshToken);
      }
      return freshToken;
    } catch (e) {
      console.error('[Auth] getFreshToken error:', e);
      return token; // fallback to cached
    }
  }, [isSignedIn, getTemplateToken, token]);

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
        const freshToken = await getTemplateToken();
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
  }, [isLoaded, isSignedIn, getTemplateToken]);

  // Also refresh token on window focus (user switches tabs/pages)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const handleFocus = async () => {
      try {
        const freshToken = await getTemplateToken();
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
  }, [isLoaded, isSignedIn, getTemplateToken]);

  // Initial sync and backend user resolution
  useEffect(() => {
    if (!isLoaded) return;

    const syncAuth = async () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;

      try {
        if (isSignedIn && clerkUser) {
          const clerkToken = await getTemplateToken();
          if (!clerkToken) {
            throw new Error(
              `Clerk returned no token for template "${CLERK_JWT_TEMPLATE}". ` +
              'Is the JWT template configured in the Clerk dashboard?'
            );
          }
          setToken(clerkToken);

          // Die Clerk-Rolle ist nur noch informativ — `is_admin` kommt
          // ausschließlich aus der DB (artists.is_admin), siehe unten.
          const clerkRole = (clerkUser.publicMetadata as any)?.role;

          const userPayload: UserPayload = {
            sub: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            role: clerkRole || 'artist', // Default role is artist
            is_admin: false,
            user_metadata: {
              full_name: clerkUser.fullName || undefined,
              name: clerkUser.firstName || undefined,
            },
          };

          // Sync with backend: Artist-Datensatz sicherstellen und Profil laden.
          // `/api/artists/me` ist die einzige Quelle für is_admin.
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
              const me = await meRes.json();
              userPayload.is_admin = Boolean(me?.is_admin);
              userPayload.backend_id = me?.id;
              userPayload.artist_id = me?.id;
              userPayload.approval_status = me?.approval_status;
              userPayload.rejection_reason = me?.rejection_reason ?? null;
              userPayload.guidelines_accepted = Boolean(me?.guidelines_accepted);
            } else {
              console.warn(`[Auth] /api/artists/me returned HTTP ${meRes.status}`);
            }
          } catch (e) {
            console.warn('[Auth] Backend sync error:', e);
          }

          setUser(userPayload);
          setProfileLoaded(true);
        } else {
          setToken(null);
          setUser(null);
          setProfileLoaded(false);
        }
      } catch (e) {
        console.error('[Auth] Token error:', e);
        setToken(null);
        setUser(null);
        // Bewusst true: Ohne Profil bleibt is_admin false. Die Guards sollen
        // entscheiden können, statt endlos einen Ladebalken zu zeigen.
        setProfileLoaded(true);
      } finally {
        isSyncingRef.current = false;
      }
    };

    syncAuth();
  }, [isLoaded, isSignedIn, clerkUser, getTemplateToken]);

  // Refresh user data from backend (e.g. after guidelines acceptance)
  const refreshUser = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const freshToken = await getTemplateToken();
      if (!freshToken) return;
      const API = import.meta.env.VITE_API_URL;
      const meRes = await fetch(`${API}/api/artists/me`, {
        headers: { Authorization: `Bearer ${freshToken}` },
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(prev => prev ? {
          ...prev,
          is_admin: Boolean(meData.is_admin),
          guidelines_accepted: Boolean(meData.guidelines_accepted),
          approval_status: meData.approval_status,
          rejection_reason: meData.rejection_reason ?? null,
          backend_id: meData.id,
          artist_id: meData.id,
        } : prev);
      }
    } catch (e) {
      console.warn('[Auth] refreshUser error:', e);
    }
  }, [isSignedIn, getTemplateToken]);

  const signOut = async () => {
    await clerkSignOut();
    setToken(null);
    setUser(null);
    setProfileLoaded(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoaded,
      isSignedIn: Boolean(isSignedIn),
      profileLoaded,
      signOut,
      getFreshToken,
      refreshUser,
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
