/**
 * Hilfen für Seitentests hinter dem Login.
 *
 * Die Seiten holen ihre Daten mit `fetch` direkt. Im Test antwortet darauf
 * eine kleine Tabelle aus Methode, Adressteil und Antwort, in der Form, die
 * das Backend tatsächlich liefert.
 */
import { vi } from 'vitest';

export interface Route {
  /** HTTP-Methode, Standard GET. */
  method?: string;
  /** Teil der Adresse, an dem die Route erkannt wird. Die erste passende gewinnt. */
  match: string;
  status?: number;
  body?: unknown;
}

export interface FetchCall {
  method: string;
  url: string;
  body: unknown;
}

/** Ersetzt `fetch` durch die Tabelle und gibt die Liste der Aufrufe zurück. */
export function stubFetch(routes: Route[]): FetchCall[] {
  const calls: FetchCall[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? 'GET').toUpperCase();
      calls.push({ method, url, body: init?.body ? JSON.parse(String(init.body)) : undefined });
      const route = routes.find((r) => (r.method ?? 'GET').toUpperCase() === method && url.includes(r.match));
      if (!route) {
        return new Response(JSON.stringify({ error: 'not_found', message: `keine Testroute für ${method} ${url}` }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify(route.body ?? {}), {
        status: route.status ?? 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  );
  return calls;
}

/** Aufrufe einer Methode an eine Adresse, die `match` enthält. */
export const callsTo = (calls: FetchCall[], method: string, match: string) =>
  calls.filter((c) => c.method === method && c.url.includes(match));
