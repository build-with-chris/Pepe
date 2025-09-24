/** Returns a Date in local time from a YYYY-MM-DD string. Returns null if invalid. */
export function toLocalDate(iso: string | null | undefined): Date | null {
  if (!iso || typeof iso !== 'string') return null;
  const parts = iso.split('-');
  if (parts.length !== 3) return null;
  const [yStr, mStr, dStr] = parts;
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null;
  if (y < 1000 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, m - 1, d);
  // Validate round-trip to guard against things like 2025-02-31
  return (
    dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
  ) ? dt : null;
}

/** Formats a Date to YYYY-MM-DD in local time. Returns empty string if invalid. */
export function formatISODate(date: Date | null | undefined): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Returns an inclusive array of dates from start to end (local). */
export function getDateRange(start: Date, end: Date): Date[] {
  if (!(start instanceof Date) || isNaN(start.getTime())) return [];
  if (!(end instanceof Date) || isNaN(end.getTime())) return [];
  const from = start <= end ? start : end;
  const to = start <= end ? end : start;
  const days: Date[] = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const stop = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  while (cur <= stop) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

/** True if a value is a valid Date object. */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/** Adds days to a date and returns a new Date (does not mutate input). */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

/** Clamp a date range to a maximum number of days. */
export function clampRange(start: Date, end: Date, maxDays = 366): { start: Date; end: Date } {
  const asc = start <= end;
  const from = asc ? start : end;
  const to = asc ? end : start;
  const ms = to.getTime() - from.getTime();
  const maxMs = maxDays * 24 * 60 * 60 * 1000;
  if (ms <= maxMs) return { start: from, end: to };
  return { start: from, end: addDays(from, maxDays) };
}