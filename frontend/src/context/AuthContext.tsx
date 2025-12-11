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
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserPayload | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const syncAuth = async () => {
      if (isSignedIn && clerkUser) {
        try {
          const clerkToken = await getToken();
          setToken(clerkToken);

          // Check admin role from Clerk's publicMetadata
          const clerkRole = (clerkUser.publicMetadata as any)?.role;
          const isAdminFromClerk = clerkRole === 'shows-admin' || clerkRole === 'admin';

          const userPayload: UserPayload = {
            sub: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            role: clerkRole || 'artist', // Default role is artist
            is_admin: isAdminFromClerk, // Admin status from Clerk metadata
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

              await fetch(`${API}/api/artists/me`, {
                headers: { Authorization: `Bearer ${clerkToken}` },
              });
            } catch (e) {
              console.warn('[Auth] Backend sync error:', e);
            }
          }

          setUser(userPayload);
        } catch (e) {
          console.error('[Auth] Token error:', e);
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
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
