import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from '../context/AuthContext';
import { toLocalDate, formatISODate } from "@/utils/calendar";
import { deleteAvailability } from "@/services/availabilityApi";
import type { AvailabilitySlot, ISODate } from "@/services/availabilityApi";
import RangeActionsPanel from "../components/RangeActionsPanel";
import AvailabilityLegend from "../components/AvailabilityLegend";
import useRangeSelection from "@/hooks/useRangeSelection";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

const baseUrl = import.meta.env.VITE_API_URL as string;

function useBackendArtistId(user: any, token: string | null) {
  const [backendArtistId, setBackendArtistId] = useState<string | null>(null);
  const [loadingArtistId, setLoadingArtistId] = useState(true);

  const load = async () => {
    if (!token) { setLoadingArtistId(false); return; }
    setLoadingArtistId(true);
    try {
      const base = import.meta.env.VITE_API_URL;
      let res = await fetch(`${base}/api/artists/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
  const [todayTick, setTodayTick] = useState(0);

  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, [todayTick]);

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const ms = nextMidnight.getTime() - now.getTime() + 1000;
    const t = setTimeout(() => setTodayTick((x) => x + 1), ms);
    return () => clearTimeout(t);
  }, [todayTick]);

  const futureAvailable = useMemo(() => {
    return available.filter((s) => {
      const d = new Date(s.date + 'T00:00:00');
      return d >= startOfToday;
    });
  }, [available, startOfToday]);

  const availableDates = (futureAvailable ?? []).map((s) => toLocalDate(s.date)).filter(Boolean) as Date[];
  const blockedMatcher = (date: Date) => {
    if (date < startOfToday) return false;
    const iso = formatISODate(date);
    return !(available ?? []).some((s) => s.date === iso);
  };
  const modifiers = { available: availableDates, blocked: blockedMatcher };
  const disabledDays = { before: startOfToday };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastEnsuredIsoRef = useRef<string | null>(null);

  const { backendArtistId, loadingArtistId, refreshArtistId } =
    useBackendArtistId(user, token);

  const { rangeStart, rangeEnd, setRangeStart, setRangeEnd, handleDayClick } = useRangeSelection({ disabledBefore: startOfToday });

    const fetchAvailability = async () => {
      if (!token) return;
    
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
          await fetch(`${baseUrl}/api/artists/me/ensure`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          }).catch(() => {});
          await refreshArtistId();
          res = await postOnce();
        }
        if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
      }
  
      await fetchAvailability();
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
          console.warn('Auto-Availability failed for', iso, e);
          lastEnsuredIsoRef.current = null;
        }
      } catch (e) {
        console.warn('Auto-Availability outer error for', iso, e);
        lastEnsuredIsoRef.current = null;
      }
    })();
  }, [token, loadingArtistId, startOfToday, available, backendArtistId]);

  const isAvailable = (date: Date) => {
    const iso = formatISODate(date);
    return (available ?? []).some((s) => s.date === iso);
  };

  return (
    <DashboardLayout title={t('calendar.title')}>
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
            <span className="text-red-300">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchAvailability()}
              className="text-red-300 hover:text-red-200 hover:bg-red-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('calendar.reload')}
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400 mr-2" />
            <span className="text-gray-400">{t('calendar.loading')}</span>
          </div>
        )}

        {/* Legend */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <AvailabilityLegend />
        </div>

        {/* Range Actions */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
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
        </div>

        {/* Calendar */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
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
        </div>

        {/* Backend 500 Hint */}
        {error && error.startsWith("Fehler beim Laden: 500") && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm px-4 py-3 text-sm text-yellow-300">
            {t('calendar.hints.backend500')}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CalendarPage;