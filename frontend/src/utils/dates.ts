// src/utils/dates.ts
export function formatDateTimeDE(value: any): string {
  if (!value) return "—";
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("de-DE", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return "—";
  }
}

/**
 * Versucht aus verschiedenen möglichen Feldern das „Eingegangen am" Datum zu bestimmen.
 * Nutze überall die gleichen Feldnamen, und ergänze hier zentral neue Aliase.
 */
export function getReceivedAt(offer: any): Date | null {
  const v =
    offer?.request_created_at ||
    offer?.booking_request_created_at ||
    offer?.request?.created_at ||
    offer?.created_at ||
    offer?.createdAt ||
    offer?.created ||
    offer?.received_at ||
    offer?.submitted_at;
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Datum und Uhrzeit eines Events, wie sie aus der API kommen
 * (`event_date` = "YYYY-MM-DD", `event_time` = "HH:MM[:SS]" oder null).
 *
 * Mit Wochentag: Bei Auftritten ist „Samstag" die halbe Information. Ob ein Gig
 * am Wochenende liegt, entscheidet über Gage und Verfügbarkeit, und niemand
 * rechnet sich das aus einem Datum im Kopf aus.
 *
 * Bewusst über einzelne Teile statt `dateStyle`: So steht der Wochentag davor
 * und die Sekunden fallen weg.
 */
export function formatEventDateTime(
  dateStr?: string | null,
  timeStr?: string | null
): string {
  const d = parseEventDate(dateStr, timeStr);
  if (!d) return '—';

  const datum = new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);

  if (!hasTime(timeStr)) return datum;

  const zeit = new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
  return `${datum}, ${zeit} Uhr`;
}

/** Nur das Datum, ohne Wochentag — für enge Spalten. */
export function formatEventDate(dateStr?: string | null): string {
  const d = parseEventDate(dateStr);
  if (!d) return '—';
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

function hasTime(timeStr?: string | null): boolean {
  // Das Backend liefert für „keine Uhrzeit" teils null, teils die Zeichenketten
  // "null" oder "undefined". Alle drei bedeuten dasselbe.
  return !!timeStr && timeStr !== 'null' && timeStr !== 'undefined';
}

export function parseEventDate(
  dateStr?: string | null,
  timeStr?: string | null
): Date | null {
  if (!dateStr) return null;
  const time = hasTime(timeStr) ? timeStr : '00:00:00';
  const d = new Date(`${dateStr}T${time}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Geldbetrag in Euro, ohne Nachkommastellen.
 *
 * Gagen sind runde Beträge; „1.200 €" liest sich schneller als „1.200,00 €".
 * Ohne festes Gebietsschema würde ein Browser auf Englisch „€1,200" zeigen,
 * mitten in einer deutschen Oberfläche.
 */
export function formatMoney(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Gibt die Stadt aus einer Adresse — das letzte Segment nach dem Komma. */
export function eventCity(address?: string | null): string | undefined {
  if (!address) return undefined;
  const parts = address.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return undefined;
  const last = parts[parts.length - 1];
  // „…, 80331 München, Deutschland" — das Land ist als Ort unbrauchbar, dann
  // lieber das Segment davor nehmen.
  if (parts.length >= 2 && /^(deutschland|germany|österreich|schweiz)$/i.test(last)) {
    return stripPostalCode(parts[parts.length - 2]);
  }
  return stripPostalCode(last);
}

function stripPostalCode(segment: string): string {
  return segment.replace(/^\d{4,5}\s+/, '').trim() || segment;
}
