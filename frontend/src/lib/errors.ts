/**
 * Lesbarer Text aus einem gefangenen Wert.
 *
 * `catch` liefert `unknown`: meist ein Error, manchmal eine Zeichenkette oder
 * ein beliebiges Objekt. Gibt `undefined` zurück, wenn kein Text zu holen ist,
 * damit der Aufrufer mit `??` oder `||` seinen eigenen Ersatztext setzen kann.
 */
export function errorMessage(e: unknown): string | undefined {
  if (e instanceof Error) return e.message || undefined;
  if (typeof e === 'string') return e || undefined;
  if (e && typeof e === 'object' && 'message' in e && typeof e.message === 'string') {
    return e.message || undefined;
  }
  return undefined;
}
