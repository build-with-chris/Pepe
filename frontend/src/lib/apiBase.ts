/**
 * Backend-Basis-URL, ausschliesslich über Umgebungsvariablen.
 *
 * Rückgabe ohne abschliessenden Schrägstrich, weil alle Aufrufer
 * `${base}/api/...` zusammensetzen.
 *
 * Ein leerer Wert bedeutet "gleiche Herkunft": Die Aufrufe werden dann relativ
 * (`/api/...`). Das ist in der Vercel-Services-Aufstellung der richtige Fall,
 * weil Frontend und Backend unter derselben Domain liegen.
 */
export function getApiBaseUrl(): string {
  const raw = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    ''
  )
    .trim()
    .replace(/\/+$/, '');

  if (!raw) return '';

  // Relativ gemeint ("/api" oder "/") bleibt relativ.
  if (raw.startsWith('/')) return raw;

  // Fehlt das Schema, waere der Wert ein *relativer* Pfad: aus
  // "pepe-services.vercel.app" wuerde
  // "https://meine-seite.de/pepe-services.vercel.app/api/artists".
  // Das ist ein Konfigurationsfehler, der sich als 404 tarnt, deshalb hier
  // geradeziehen statt daran scheitern.
  if (!/^https?:\/\//i.test(raw)) {
    const fixed = `https://${raw}`;
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        `[Pepe] VITE_API_URL ohne Schema ("${raw}"), interpretiere als "${fixed}". ` +
        'Bitte in der Umgebungsvariable "https://" ergaenzen.'
      );
    }
    return fixed;
  }

  return raw;
}

/**
 * Für Requests, die zwingend ein Backend brauchen.
 *
 * Ein leerer Wert ist hier kein Fehler mehr: Er heisst "gleiche Herkunft" und
 * ist in der Services-Aufstellung der Normalfall.
 */
export function requireApiBaseUrl(): string {
  return getApiBaseUrl();
}
