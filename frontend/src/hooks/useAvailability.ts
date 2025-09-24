import { useState, useCallback, useEffect } from "react";
import { listAvailability, createAvailability, deleteAvailability } from "@/services/availabilityApi";
import { ensureOneYearAhead } from "@/services/autoAvailabilityService";
import type { AvailabilitySlot, ISODate } from "@/services/availabilityApi";

type UseAvailabilityProps = {
  token: string | null;
  artistId?: string | null;
};

export function useAvailability({ token, artistId }: UseAvailabilityProps) {
  const [available, setAvailable] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch slots
  const fetchAvailability = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listAvailability({ token, artistId: artistId ?? undefined });
      setAvailable(data);
    } catch (err: any) {
      setError("Verfügbarkeit konnte nicht geladen werden. " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  }, [token, artistId]);

  // add slot
  const addAvailability = useCallback(
    async (date: Date) => {
      if (!token) return;
      const iso = date.toISOString().split("T")[0] as ISODate;

      // Optimistic update
      const tempSlot: AvailabilitySlot = { id: -Date.now(), date: iso };
      setAvailable((prev) => [...prev, tempSlot]);

      try {
        const newSlot = await createAvailability({ token, date: iso, artistId: artistId ?? undefined });
        setAvailable((prev) => {
          const withoutTemp = prev.filter((s) => s.id !== tempSlot.id && s.date !== iso);
          return [...withoutTemp, newSlot];
        });
      } catch (err: any) {
        setError("Verfügbarkeit konnte nicht hinzugefügt werden. " + (err?.message || ""));
        setAvailable((prev) => prev.filter((s) => s.id !== tempSlot.id && s.date !== iso));
      }
    },
    [token, artistId]
  );

  // remove slot
  const removeAvailability = useCallback(
    async (slot: AvailabilitySlot) => {
      if (!token) return;
      setAvailable((prev) => prev.filter((s) => s.id !== slot.id));
      try {
        await deleteAvailability({ token, slotId: slot.id, artistId: artistId ?? undefined });
      } catch (err: any) {
        setError("Verfügbarkeit konnte nicht entfernt werden. " + (err?.message || ""));
        setAvailable((prev) => [...prev, slot]); // rollback
      }
    },
    [token, artistId]
  );

  // auto-availability
  useEffect(() => {
    if (!token || !artistId || available.length === 0) return;
    ensureOneYearAhead({ token, artistId, available });
  }, [token, artistId, available]);

  return { available, loading, error, fetchAvailability, addAvailability, removeAvailability };
}