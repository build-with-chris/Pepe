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
 * Versucht aus verschiedenen möglichen Feldern das „Eingegangen am“ Datum zu bestimmen.
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