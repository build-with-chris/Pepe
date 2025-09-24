

import { useCallback, useEffect, useMemo, useRef } from "react";
import { formatISODate, toLocalDate } from "@/utils/calendar";
import type { AvailabilitySlot } from "@/services/availabilityApi";;

/**
 * Ensures there is a rolling window of availability for the next 365 days.
 * - On mount (and whenever prerequisites are ready), it fills missing dates from `startOfToday` (inclusive)
 *   up to `startOfToday + 365d` (exclusive).
 * - It also schedules a daily run at local midnight to add the new day at the end of the window.
 *
 * This hook is side-effectful by design. It never removes availability; it only adds missing dates.
 */
export type UseAutoEnsureOneYearAheadOptions = {
  /** Whether the hook should run. Default true. */
  enabled?: boolean;
  /** Start-of-today (00:00 local) used as the left boundary of the window. */
  startOfToday: Date | null;
  /** All current availability slots for the artist (at least for the relevant horizon). */
  available: AvailabilitySlot[] | null | undefined;
  /** While the artist id is being discovered/ensured, set this to true to avoid duplicate ensures. */
  loadingArtistId?: boolean;
  /** Artist id presence gates the effect. */
  backendArtistId?: string | null;
  /** Adds a single availability date (local time). Implemented by the caller. */
  addAvailability: (date: Date) => Promise<void>;
  /** Horizon length in days. Default 365. */
  daysHorizon?: number;
  /** Optional: verbose console logs for debugging. */
  debug?: boolean;
};

export function useAutoEnsureOneYearAhead({
  enabled = true,
  startOfToday,
  available,
  loadingArtistId = false,
  backendArtistId,
  addAvailability,
  daysHorizon = 365,
  debug = false,
}: UseAutoEnsureOneYearAheadOptions) {
  const timerRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  const availableSet = useMemo(() => {
    const set = new Set<string>();
    (available ?? []).forEach((s) => {
      if (s?.date) set.add(s.date);
    });
    return set;
  }, [available]);

  const computeMissingDates = useCallback((): Date[] => {
    if (!startOfToday) return [];
    const missing: Date[] = [];
    const start = new Date(startOfToday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + daysHorizon); // exclusive upper bound

    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const iso = formatISODate(d);
      if (!availableSet.has(iso)) {
        // clone date (loop cursor is mutable)
        missing.push(new Date(d));
      }
    }
    if (debug) console.debug("[useAutoEnsureOneYearAhead] missing count:", missing.length);
    return missing;
  }, [availableSet, daysHorizon, startOfToday, debug]);

  const ensureNow = useCallback(async () => {
    if (!enabled || runningRef.current) return;
    if (!backendArtistId || !startOfToday) return;
    if (loadingArtistId) return;

    const missing = computeMissingDates();
    if (missing.length === 0) return;

    runningRef.current = true;
    try {
      // Add sequentially to avoid backend race conditions
      for (const d of missing) {
        const local = toLocalDate(formatISODate(d));
        if (debug) console.debug("[useAutoEnsureOneYearAhead] add", local);
        try {
          await addAvailability(local as Date);
        } catch (e) {
          if (debug) console.warn("[useAutoEnsureOneYearAhead] add failed for", local, e);
          // continue trying others; caller may retry on next tick
        }
      }
    } finally {
      runningRef.current = false;
    }
  }, [addAvailability, backendArtistId, computeMissingDates, debug, enabled, loadingArtistId, startOfToday]);

  // initial/whenever-ready ensure
  useEffect(() => {
    if (!enabled) return;
    if (!backendArtistId || !startOfToday) return;
    if (loadingArtistId) return;
    void ensureNow();
  }, [enabled, backendArtistId, startOfToday, loadingArtistId, ensureNow]);

  // daily schedule at next local midnight
  useEffect(() => {
    if (!enabled) return;

    function clearTimer() {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    function scheduleNextMidnight() {
      clearTimer();
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 5, 0); // a few seconds past midnight for safety
      const ms = next.getTime() - now.getTime();
      if (debug) console.debug("[useAutoEnsureOneYearAhead] scheduling in ms:", ms);
      timerRef.current = window.setTimeout(async () => {
        await ensureNow();
        // re-schedule for the following day
        scheduleNextMidnight();
      }, Math.max(1000, ms));
    }

    scheduleNextMidnight();
    return clearTimer;
  }, [enabled, ensureNow, debug]);

  return { ensureNow };
}

export default useAutoEnsureOneYearAhead;