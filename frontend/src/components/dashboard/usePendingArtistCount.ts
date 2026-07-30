/**
 * Anzahl der Künstler, die auf eine Freigabe warten.
 *
 * Steht als Abzeichen an „Künstler" in der Admin-Navigation und am
 * Bereichsumschalter. Ohne diese Zahl muss ein Admin die Seite aufrufen, um zu
 * sehen, ob dort etwas liegt — und genau das wurde vergessen, weshalb Künstler
 * ewig auf `pending` standen.
 */

import { useCallback, useEffect, useState } from 'react';

const CACHE_TTL_MS = 60_000;

// Modulweit, damit ein Wechsel zwischen Admin-Seiten nicht jedes Mal neu lädt.
let cachedCount: number | null = null;
let cachedAt = 0;

/**
 * Nach einer Freigabe oder Ablehnung aufrufen, damit das Abzeichen die neue
 * Zahl zeigt.
 *
 * Setzt auch den Wert zurueck, nicht nur den Zeitstempel: `useState(cachedCount)`
 * liest den Zwischenspeicher beim ersten Rendern, sonst stuende dort weiter die
 * alte Zahl, bis der Abruf zurueckkommt.
 */
export function invalidatePendingArtistCount() {
  cachedCount = null;
  cachedAt = 0;
}

export function usePendingArtistCount(token: string | null, enabled: boolean): number | null {
  const [count, setCount] = useState<number | null>(cachedCount);

  const load = useCallback(
    async (signal: AbortSignal) => {
      if (!enabled || !token) return;
      if (cachedCount !== null && Date.now() - cachedAt < CACHE_TTL_MS) {
        setCount(cachedCount);
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/artists?status=pending`,
          { headers: { Authorization: `Bearer ${token}` }, signal }
        );
        if (!res.ok) return; // Ein fehlendes Abzeichen ist kein Grund, etwas zu melden.
        const data = await res.json();
        if (!Array.isArray(data)) return;

        cachedCount = data.length;
        cachedAt = Date.now();
        setCount(cachedCount);
      } catch {
        // Abbruch beim Aufräumen oder Netzfehler: Abzeichen bleibt einfach leer.
      }
    },
    [token, enabled]
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return enabled ? count : null;
}
