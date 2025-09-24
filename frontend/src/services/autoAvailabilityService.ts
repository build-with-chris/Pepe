import { formatISODate } from "@/utils/calendar";
import { createAvailability } from "@/services/availabilityApi";
import type {AvailabilitySlot} from "@/services/availabilityApi";


/**
 * Stellt sicher, dass für heute+365 ein Slot existiert.
 * Läuft nur, wenn der Artist eingeloggt ist (Frontend).
 */
export async function ensureOneYearAhead(params: {
  token: string;
  artistId?: string | null;
  available: AvailabilitySlot[];
}): Promise<void> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const oneYearAhead = new Date(startOfToday);
  oneYearAhead.setDate(oneYearAhead.getDate() + 365);

  const iso = formatISODate(oneYearAhead);
  const exists = params.available.some((s) => s.date === iso);
  if (exists) return;

  console.log("🟢 Auto-Availability (frontend): adding", iso, "for artist", params.artistId ?? "me");

  try {
    await createAvailability({
      token: params.token,
      date: iso as any,
      artistId: params.artistId ?? undefined,
    });
  } catch (err) {
    console.warn("Auto-Availability failed for", iso, err);
  }
}