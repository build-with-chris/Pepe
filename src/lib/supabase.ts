// Lazy Supabase client: loads @supabase/supabase-js only when needed
// This keeps the heavy library out of the initial bundle and improves FCP/TBT.

let clientPromise: Promise<import('@supabase/supabase-js').SupabaseClient<any, "public", any>> | null = null;

/**
 * Dynamically import and create a singleton Supabase client on first use.
 * Usage:
 *   const supabase = await getSupabase();
 *   const { data } = await supabase.from('artists').select('*');
 */
export async function getSupabase() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const url = import.meta.env.VITE_SUPABASE_URL as string;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      return createClient(url, key);
    })();
  }
  return clientPromise;
}

/**
 * Helper to run a function with a lazily-created client.
 * Example:
 *   await withSupabase(async (sb) => sb.auth.signInWithOtp({ email }));
 */
export async function withSupabase<T>(fn: (sb: Awaited<ReturnType<typeof getSupabase>>) => Promise<T> | T): Promise<T> {
  const sb = await getSupabase();
  return fn(sb);
}

// (Optional) Backwards compat shim for rare cases where a top-level client is required.
// Prefer getSupabase() to avoid pulling supabase into the initial chunk.
// export const supabase = await getSupabase(); // <- do NOT enable in SPA initial route