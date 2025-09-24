import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Calendar } from "@/components/ui/calendar";
import GuideAccordion from "./components/GuideAccordion";
import { useAuth } from '@/context/AuthContext';
import { toLocalDate, formatISODate } from "@/utils/calendar";
import { deleteAvailability } from "@/services/availabilityApi";
import type { AvailabilitySlot, ISODate } from "@/services/availabilityApi";
import RangeActionsPanel from "./components/RangeActionsPanel";
import AvailabilityLegend from "./components/AvailabilityLegend";
import useRangeSelection from "@/hooks/useRangeSelection";


const baseUrl = import.meta.env.VITE_API_URL as string;

function useBackendArtistId(user: any, token: string | null) {
  const [backendArtistId, setBackendArtistId] = useState<string | null>(null);
  const [loadingArtistId, setLoadingArtistId] = useState(true);

  const load = async () => {
    if (!token) { setLoadingArtistId(false); return; }
    setLoadingArtistId(true);
    try {
      const base = import.meta.env.VITE_API_URL;
      // First try to read the current artist
      let res = await fetch(`${base}/api/artists/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // If not linked/exists yet, ensure and retry
      if (res.status === 403 || res.status === 404) {
        await fetch(`${base}/api/artists/me/ensure`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }).catch(() => {});
        res = await fetch(`${base}/api/artists/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (res.ok) {
        const me = await res.json().catch(() => ({}));
        if (me?.id) {
          setBackendArtistId(String(me.id));
          return;
        }
      }

      setBackendArtistId(null);
    } catch (e) {
      console.warn('[useBackendArtistId] error resolving id from backend', e);
      setBackendArtistId(null);
    } finally {
      setLoadingArtistId(false);
    }
  };

  useEffect(() => { load(); }, [token, user?.email]);

  return { backendArtistId, loadingArtistId, refreshArtistId: load };
}


const CalendarPage: React.FC = () => {
  const { token, user } = useAuth();
  const { t } = useTranslation();
  const [available, setAvailable] = useState<AvailabilitySlot[]>([]);
  // Tick once per day at local midnight so the UI drops past days automatically
  const [todayTick, setTodayTick] = useState(0);

  // Start of today (local time)
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, [todayTick]);

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const ms = nextMidnight.getTime() - now.getTime() + 1000; // +1s safety
    const t = setTimeout(() => setTodayTick((x) => x + 1), ms);
    return () => clearTimeout(t);
  }, [todayTick]);

  // Only highlight future (and today) availability
  const futureAvailable = useMemo(() => {
    return available.filter((s) => {
      const d = new Date(s.date + 'T00:00:00');
      return d >= startOfToday;
    });
  }, [available, startOfToday]);

  const availableDates = (futureAvailable ?? []).map((s) => toLocalDate(s.date)).filter(Boolean) as Date[];
  // Matcher for blocked days: only future/today days NOT in available
  const blockedMatcher = (date: Date) => {
    if (date < startOfToday) return false;
    const iso = formatISODate(date);
    return !(available ?? []).some((s) => s.date === iso);
  };
  const modifiers = { available: availableDates, blocked: blockedMatcher };
  const disabledDays = { before: startOfToday };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Merkt sich, für welches Datum (ISO) wir bereits automatisch Verfügbarkeit sichergestellt haben
  const lastEnsuredIsoRef = useRef<string | null>(null);

  const { backendArtistId, loadingArtistId, refreshArtistId } =
    useBackendArtistId(user, token);

  const { rangeStart, rangeEnd, setRangeStart, setRangeEnd, handleDayClick } = useRangeSelection({ disabledBefore: startOfToday });

    const fetchAvailability = async () => {
      if (!token) return;
    
      // Artist-ID sicherstellen
      if (!backendArtistId) {
        await refreshArtistId();
        if (!backendArtistId) {
          await fetch(`${baseUrl}/api/artists/me/ensure`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          }).catch(() => {});
          await refreshArtistId();
          if (!backendArtistId) return;
        }
      }
    
      setLoading(true);
      setError(null);
      try {
        let res = await fetch(`${baseUrl}/api/availability`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          const linkedErr = text.includes('Current user not linked to an artist');
    
          if ((res.status === 400 || res.status === 401 || res.status === 403) && linkedErr) {
            await fetch(`${baseUrl}/api/artists/me/ensure`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            }).catch(() => {});
            await refreshArtistId();
            res = await fetch(`${baseUrl}/api/availability`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
          if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
        }
    
        const data = await res.json();
        setAvailable(Array.isArray(data) ? data : (data?.items ?? []));
      } catch (e: any) {
        setError(e?.message || 'Fehler beim Laden der Verfügbarkeiten');
      } finally {
        setLoading(false);
      }
    };

  const addAvailability = async (date: Date) => {
    if (!token) return;
  
    const postOnce = async (): Promise<Response> => {
      const iso = formatISODate(date) as ISODate;
      return fetch(`${baseUrl}/api/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: iso }),
      });
    };
  
    // Artist-ID sicherstellen
    if (!backendArtistId) {
      await refreshArtistId();
      if (!backendArtistId) {
        await fetch(`${baseUrl}/api/artists/me/ensure`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }).catch(() => {});
        await refreshArtistId();
        if (!backendArtistId) {
          setError('Kein verknüpfter Künstler gefunden. Bitte neu anmelden oder Seite neu laden.');
          return;
        }
      }
    }
  
    setLoading(true);
    setError(null);
    try {
      let res = await postOnce();
  
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const linkedErr = text.includes('Current user not linked to an artist');
  
        if ((res.status === 400 || res.status === 401 || res.status === 403) && linkedErr) {
          // Selbstheilung: ensure + refresh + einmal retry
          await fetch(`${baseUrl}/api/artists/me/ensure`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          }).catch(() => {});
          await refreshArtistId();
          res = await postOnce();
        }
        if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
      }
  
      await fetchAvailability(); // Liste aktualisieren
    } catch (e: any) {
      setError(`Verfügbarkeit konnte nicht hinzugefügt werden. ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  const removeAvailability = async (slot: AvailabilitySlot) => {
    if (!token) return;
    setAvailable((prev) => (prev ?? []).filter((s) => s.id !== slot.id));
    try {
      await deleteAvailability({ token, slotId: slot.id, artistId: backendArtistId ?? undefined });
    } catch (err: any) {
      let message = 'Verfügbarkeit konnte nicht entfernt werden.';
      if (err && err.message) message += ' ' + err.message;
      setError(message);
      setAvailable((prev) => [...(prev ?? []), slot]);
    }
  };

  useEffect(() => {
    if (!token || !backendArtistId) return;
    fetchAvailability();
  }, [token, backendArtistId]);

  // Stelle sicher, dass der Tag heute+365 existiert (ein stabiler „Grenzmarker“)
  useEffect(() => {
    if (!token) return;
    if (loadingArtistId) return;

    const oneYearAhead = new Date(startOfToday);
    oneYearAhead.setDate(oneYearAhead.getDate() + 365);
    const iso = formatISODate(oneYearAhead);

    if (lastEnsuredIsoRef.current === iso) return;

    const exists = (available ?? []).some((s) => s.date === iso);
    if (exists) {
      lastEnsuredIsoRef.current = iso;
      return;
    }

    console.log('🟢 Auto-Availability: adding', iso, 'for artist', backendArtistId ?? '(current user)');
    lastEnsuredIsoRef.current = iso;
    (async () => {
      try {
        try {
          await addAvailability(oneYearAhead);
        } catch (e) {
          // Fehler pro Add-Aufruf abfangen
          console.warn('Auto-Availability failed for', iso, e);
          lastEnsuredIsoRef.current = null;
        }
      } catch (e) {
        // catch block für den outer try
        console.warn('Auto-Availability outer error for', iso, e);
        lastEnsuredIsoRef.current = null;
      }
    })();
  }, [token, loadingArtistId, startOfToday, available, backendArtistId]);

  // helper to check if date is available
  const isAvailable = (date: Date) => {
    const iso = formatISODate(date);
    return (available ?? []).some((s) => s.date === iso);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mx-auto w-full max-w-[28rem] md:max-w-[36rem]">
        <h1 className="text-2xl font-bold mb-4 text-white">{t('calendar.title')}</h1>
        <GuideAccordion />
      </div>
      {error && (
        <div className="mb-2 text-red-600 flex items-center gap-3">
          <div>{error}</div>
          <button
            className="text-sm underline"
            onClick={() => fetchAvailability()}
          >
            {t('calendar.reload')}
          </button>
        </div>
      )}
      {loading && <div className="mb-2">{t('calendar.loading')}</div>}
      <AvailabilityLegend />
      {/* Range actions — now shown above the calendar for better visibility */}
      <RangeActionsPanel
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        setRangeStart={setRangeStart}
        setRangeEnd={setRangeEnd}
        processingRange={false}
        setProcessingRange={() => {}}
        available={available}
        addAvailability={addAvailability}
        removeAvailability={removeAvailability}
      />
      <div className="w-full flex justify-center">
        <Calendar
          mode="multiple"
          numberOfMonths={1}
          onDayClick={handleDayClick as any}
          modifiers={modifiers}
          disabled={disabledDays}
          initialFocus
          className="mx-auto w-full max-w-[28rem] md:max-w-[36rem] [--cell-size:2.25rem] md:[--cell-size:2.75rem] lg:[--cell-size:3rem]"
        />
      </div>
      {/* Range panel moved above the calendar */}
      {error && error.startsWith("Fehler beim Laden: 500") && (
        <div className="mt-2 text-sm text-yellow-700">
          {t('calendar.hints.backend500')}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;