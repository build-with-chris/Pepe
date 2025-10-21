import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';
import type {Session} from '@supabase/supabase-js';
import type {ReactNode} from 'react';

interface UserPayload {
  sub: string;           // User ID
  email?: string;        // User email
  role?: string;         // e.g., 'artist' or 'admin'
  [key: string]: any;    // any additional claims
}

interface AuthContextValue {
  user: UserPayload | null;
  token: string | null;
  getSupabase: () => Promise<SupabaseClient>;
  setUser: (u: UserPayload | null) => void; // kept for backward compatibility
  setToken: (t: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Ensure profiles row in Supabase is synced with backend artist id on login
  async function syncSupabaseProfileWithBackend(u: { id: string; email?: string }, accessToken: string) {
    try {
      const backendUrl = import.meta.env.VITE_API_URL as string;
      if (!backendUrl || !accessToken || !u?.id) return;

      // 1) Try to ensure artist exists in backend and get the id
      try {
        const res = await fetch(`${backendUrl}/api/artists/me/ensure`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        if (res.ok) {
          const artist = await res.json();
          console.log('[Auth] Backend artist sync successful:', artist);
          // Only try to sync with profiles table if we have a valid artist
          if (artist?.id) {
            try {
              const sb = await getSupabase();
              // Try to upsert to profiles table - handle if table doesn't exist or columns are missing
              const { error: upsertErr } = await sb
                .from('profiles')
                .upsert(
                  {
                    user_id: u.id,
                    email: u.email ?? null,
                  },
                  { onConflict: 'user_id' }
                );
              if (upsertErr) console.warn('[Auth] profiles.upsert error (non-critical):', upsertErr);
            } catch (profileErr) {
              console.warn('[Auth] profiles table operation failed (non-critical):', profileErr);
            }
          }
        } else {
          const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
          console.warn('[Auth] Backend artist ensure failed (non-critical):', res.status, errorData);
        }
      } catch (backendErr) {
        console.warn('[Auth] Backend request failed (non-critical):', backendErr);
      }
    } catch (e) {
      console.warn('[Auth] Profile sync error (non-critical):', e);
    }
  }

  useEffect(() => {
    // initial session
    (async () => {
      try {
        const sb = await getSupabase();
        const { data, error } = await sb.auth.getSession();
        if (error) {
          console.warn('[Auth] getSession error:', error.message);
          // Clear any invalid session data
          setToken(null);
          setUser(null);
          return;
        }
        
        const session: Session | null = data.session;
        if (session) {
          const u = session.user;
          setToken(session.access_token);
          setUser({ sub: u.id, email: u.email || undefined, role: (u.app_metadata as any)?.role || undefined });
          (window as any).supabaseClient = sb;
          // sync Supabase profiles with backend artist link on initial session
          syncSupabaseProfileWithBackend({ id: u.id, email: u.email ?? undefined }, session.access_token);
        }
      } catch (error) {
        console.error('[Auth] Session initialization error:', error);
        setToken(null);
        setUser(null);
      }
    })();

    let subscription: { unsubscribe: () => void } | null = null;
    (async () => {
      const sb = await getSupabase();
      const { data: listenerData } = sb.auth.onAuthStateChange((_: any, newSession: any) => {
        if (newSession) {
          const u = newSession.user;
          setToken(newSession.access_token);
          setUser({ sub: u.id, email: u.email || undefined, role: (u.app_metadata as any)?.role || undefined });
          // sync profiles link whenever session changes (login/refresh)
          syncSupabaseProfileWithBackend({ id: u.id, email: u.email ?? undefined }, newSession.access_token);
        } else {
          setToken(null);
          setUser(null);
        }
        (window as any).supabaseClient = sb;
      });
      if (listenerData && typeof listenerData.subscription?.unsubscribe === 'function') {
        subscription = listenerData.subscription;
      }
    })();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, getSupabase, setUser, setToken }}>
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