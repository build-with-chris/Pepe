// services/availabilityAPI.ts
import posthog from "@/lib/posthog";
const API = import.meta.env.VITE_API_URL; 
const BASE = `${API}/api`;

export type ISODate = `${number}-${number}-${number}`;

export interface AvailabilitySlot {
  id: number;
  date: ISODate;
  artist_id?: string; // optional, falls Backend es mitliefert
}

// Eigener Fehlertyp für bessere Messages
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** Alle Verfügbarkeiten (optional eines Artists) */
export async function listAvailability(params: {
  token: string;
  artistId?: string | null;
}): Promise<AvailabilitySlot[]> {
  const url = params.artistId
    ? `${BASE}/availability?artist_id=${encodeURIComponent(params.artistId)}`
    : `${BASE}/availability`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${params.token}` },
    });

    const text = await res.text();
    if (!res.ok) {
      try { posthog.capture("calendar_api_error", { action: "list", status: res.status }); } catch {}
      throw new ApiError(res.status, text || `GET /availability failed`);
    }

    let data: unknown;
    try { data = JSON.parse(text); } catch {
      try { posthog.capture("calendar_api_error", { action: "list", message: "invalid_json" }); } catch {}
      throw new ApiError(500, "Invalid JSON from server");
    }
    if (!Array.isArray(data)) {
      try { posthog.capture("calendar_api_error", { action: "list", message: "expected_array" }); } catch {}
      throw new ApiError(500, "Expected an array of availability slots");
    }

    try {
      posthog.capture("calendar_loaded", {
        artistId: params.artistId ?? undefined,
        count: (data as any[]).length,
      });
    } catch {}

    return data as AvailabilitySlot[];
  } catch (err: any) {
    try { posthog.capture("calendar_api_error", { action: "list", message: err?.message || String(err) }); } catch {}
    throw err;
  }
}

/** Einzelnen Slot anlegen */
export async function createAvailability(params: {
  token: string;
  date: ISODate;
  artistId?: string | null;
}): Promise<AvailabilitySlot> {
  const body: any = { date: params.date };
  if (params.artistId) body.artist_id = params.artistId;

  try {
    const res = await fetch(`${BASE}/availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${params.token}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) {
      try { posthog.capture("calendar_api_error", { action: "create", status: res.status }); } catch {}
      throw new ApiError(res.status, text || "POST /availability failed");
    }

    let slot: AvailabilitySlot;
    try {
      const parsed = JSON.parse(text);
      slot = (Array.isArray(parsed) ? parsed[0] : parsed) as AvailabilitySlot;
    } catch {
      // Fallback: falls der Server keine JSON gibt, min. das Datum zurückgeben
      slot = { id: -Date.now(), date: params.date } as AvailabilitySlot;
    }

    try {
      posthog.capture("calendar_slot_created", {
        artistId: params.artistId ?? undefined,
        date: params.date,
      });
    } catch {}

    return slot;
  } catch (err: any) {
    try { posthog.capture("calendar_api_error", { action: "create", message: err?.message || String(err) }); } catch {}
    throw err;
  }
}

/** Slot löschen */
export async function deleteAvailability(params: {
  token: string;
  slotId: number;
  artistId?: string | null;
}): Promise<void> {
  try {
    const res = await fetch(`${BASE}/availability/${params.slotId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${params.token}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      try { posthog.capture("calendar_api_error", { action: "delete", status: res.status }); } catch {}
      throw new ApiError(res.status, text || "DELETE /availability/:id failed");
    }

    try {
      posthog.capture("calendar_slot_deleted", {
        artistId: params.artistId ?? undefined,
        slotId: params.slotId,
      });
    } catch {}
  } catch (err: any) {
    try { posthog.capture("calendar_api_error", { action: "delete", message: err?.message || String(err) }); } catch {}
    throw err;
  }
}