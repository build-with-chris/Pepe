import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { getSupabase as loadSupabase } from '@/lib/supabase';

const BACKEND_BASE: string = (import.meta.env.VITE_API_URL as string) || '';
const buildApiUrl = (path: string) => `${BACKEND_BASE}${path}`.replace(/([^:]\/)\/+/g, '$1');

interface UserPayload {
  sub: string;           // User ID
  email?: string;        // User email
  role?: string;         // e.g., 'artist' or 'admin'
  is_admin?: boolean;    // backend flag to control admin UI
  [key: string]: any;    // any additional claims
}

interface AuthContextValue {
  user: UserPayload | null;
  token: string | null;
  supabase: SupabaseClient | null; // lazily set, may be null initially
  getSupabase: () => Promise<SupabaseClient>; // helper for consumers
  setUser: (u: UserPayload | null) => void; // kept for backward compatibility
  setToken: (t: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);

  async function syncSupabaseProfileWithBackend(client: SupabaseClient, u: { id: string; email?: string }, accessToken: string) {
    // Minimal: only ensure the artist exists in the **backend**. No Supabase table writes.
    try {
      if (!accessToken || !u?.id) return;
      const res = await fetch(buildApiUrl('/api/artists/me/ensure'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        console.warn('[Auth] ensure_my_artist failed:', payload);
      }
    } catch (e) {
      console.error('[Auth] profile sync error:', e);
    }
  }

  async function fetchBackendProfile(accessToken: string) {
    try {
      if (!accessToken) return null;
      const res = await fetch(buildApiUrl('/api/artists/me'), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('[Auth] fetchBackendProfile failed:', e);
      return null;
    }
  }

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    (async () => {
      const client = await loadSupabase();
      if (!isMounted) return;

      // expose for debugging if needed
      (window as any).supabaseClient = client;

      // set client in context
      setSupabaseClient(client);

      // initial session
      const { data } = await client.auth.getSession();
      const session: Session | null = data.session;
      if (session) {
        const u = session.user;
        setToken(session.access_token);
        const backendUser = await fetchBackendProfile(session.access_token);
        setUser({
          sub: u.id,
          email: u.email || undefined,
          role: (u.app_metadata as any)?.role || undefined,
          is_admin: Boolean(backendUser?.is_admin),
        });
        // sync Supabase profiles with backend artist link on initial session
        syncSupabaseProfileWithBackend(client, { id: u.id, email: u.email ?? undefined }, session.access_token);
      }

      const { data: listenerData } = client.auth.onAuthStateChange((_, newSession) => {
        if (newSession) {
          const u = newSession.user;
          setToken(newSession.access_token);
          (async () => {
            const backendUser = await fetchBackendProfile(newSession.access_token);
            setUser({
              sub: u.id,
              email: u.email || undefined,
              role: (u.app_metadata as any)?.role || undefined,
              is_admin: Boolean(backendUser?.is_admin),
            });
          })();
          // sync profiles link whenever session changes (login/refresh)
          syncSupabaseProfileWithBackend(client, { id: u.id, email: u.email ?? undefined }, newSession.access_token);
        } else {
          setToken(null);
          setUser(null);
        }
        (window as any).supabaseClient = client;
      });

      if (listenerData && typeof listenerData.subscription?.unsubscribe === 'function') {
        subscription = listenerData.subscription;
      }
    })();

    return () => {
      isMounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const getSupabase = async (): Promise<SupabaseClient> => {
    if (supabaseClient) return supabaseClient;
    const client = await loadSupabase();
    setSupabaseClient(client);
    return client;
  };

  return (
    <AuthContext.Provider value={{ user, token, supabase: supabaseClient, getSupabase, setUser, setToken }}>
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