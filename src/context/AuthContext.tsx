import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
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
  supabase: SupabaseClient;
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

      // 1) Ensure artist exists in backend and get the id
      const res = await fetch(`${backendUrl}/api/artists/me/ensure`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const artist = await res.json();
      if (!res.ok || !artist?.id) {
        console.warn('[Auth] ensure_my_artist failed:', artist);
        return;
      }

      // 2) Upsert profile link in Supabase (user_id -> backend_artist_id)
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: u.id,                    // adjust to your column name if needed (e.g., id)
            backend_artist_id: artist.id,
            email: u.email ?? null,           // optional convenience fields
            display_name: artist.name ?? null,
          },
          { onConflict: 'user_id' }
        );
      if (upsertErr) console.warn('[Auth] profiles.upsert error:', upsertErr);
    } catch (e) {
      console.error('[Auth] profile sync error:', e);
    }
  }

  useEffect(() => {
    // initial session
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session: Session | null = data.session;
      if (session) {
        const u = session.user;
        setToken(session.access_token);
        setUser({ sub: u.id, email: u.email || undefined, role: (u.app_metadata as any)?.role || undefined });
        (window as any).supabaseClient = supabase;
        // sync Supabase profiles with backend artist link on initial session
        syncSupabaseProfileWithBackend({ id: u.id, email: u.email ?? undefined }, session.access_token);
      }
    })();

    let subscription: { unsubscribe: () => void } | null = null;
    const { data: listenerData } = supabase.auth.onAuthStateChange((_, newSession) => {
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
      (window as any).supabaseClient = supabase;
    });
    if (listenerData && typeof listenerData.subscription?.unsubscribe === 'function') {
      subscription = listenerData.subscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, supabase, setUser, setToken }}>
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