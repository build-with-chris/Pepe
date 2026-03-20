/**
 * Backend-Basis-URL – ausschließlich über Umgebungsvariablen.
 * Kein Hardcode eines früheren Hosting-Anbieters; fehlende URL = leerer String.
 */
export function getApiBaseUrl(): string {
  const raw = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    ''
  )
    .trim()
    .replace(/\/$/, '');
  return raw;
}

/**
 * Für Requests, die zwingend ein Backend brauchen.
 */
export function requireApiBaseUrl(): string {
  const u = getApiBaseUrl();
  if (!u) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(
        '[Pepe] VITE_API_URL fehlt. In frontend/.env setzen, z. B. VITE_API_URL=http://127.0.0.1:5000'
      );
    }
    throw new Error('VITE_API_URL ist nicht gesetzt (Backend-URL). Siehe frontend/.env.example.');
  }
  return u;
}
