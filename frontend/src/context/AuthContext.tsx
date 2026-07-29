import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import type { ReactNode } from 'react';

interface UserPayload {
  sub: string;
  email?: string;
  role?: string;
  is_admin?: boolean;
  [key: string]: any;
}

interface AuthContextValue {
  user: UserPayload | null;
  token: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  /**
   * True, sobald das Backend-Profil (`/api/artists/me`) einmal beantwortet wurde —
   * erst dann ist `user.is_admin` aussagekräftig. Guards müssen darauf warten,
   * sonst werfen sie einen Admin beim ersten Render aus `/admin` raus.
   */
  profileLoaded: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Name des JWT-Templates im Clerk-Dashboard. Nur ein Template-Token enthält die
// Claims `email`, `name` und `public_metadata` — das Standard-Session-Token von
// getToken() enthält sie nicht, und ohne `email` kann das Backend beim ersten
// Login keinen Artist-Datensatz anlegen.
const CLERK_JWT_TEMPLATE = import.meta.env.VITE_CLERK_JWT_TEMPLATE || 'pepe-backend';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserPayload | null>(null);
  const [profileLoaded, setProfileLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoaded) return;

    const syncAuth = async () => {
      if (isSignedIn && clerkUser) {
        try {
          const clerkToken = await getToken({ template: CLERK_JWT_TEMPLATE });
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
              userPayload.artist_id = me?.id;
              userPayload.approval_status = me?.approval_status;
              userPayload.rejection_reason = me?.rejection_reason ?? null;
            } else {
              console.warn(`[Auth] /api/artists/me returned HTTP ${meRes.status}`);
            }
          } catch (e) {
            console.warn('[Auth] Backend sync error:', e);
          }

          setUser(userPayload);
          setProfileLoaded(true);
        } catch (e) {
          console.error('[Auth] Token error:', e);
          setToken(null);
          setUser(null);
          setProfileLoaded(true);
        }
      } else {
        setToken(null);
        setUser(null);
        setProfileLoaded(false);
      }
    };

    syncAuth();
  }, [isLoaded, isSignedIn, clerkUser, getToken]);

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
      signOut
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
