import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarCheck, CalendarClock, MapPin } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/dashboard/PageState';
import { cn } from '@/lib/utils';

interface AdminGig {
  id: number;
  status: string; // globaler Status der Anfrage
  event_date: string; // "YYYY-MM-DD"
  event_time?: string | null; // "HH:MM:SS" oder null
  event_address?: string | null;
  event_type?: string | null;
  show_type?: string | null;
  client_name?: string | null;
}

const normalize = (s?: string | null) => (s ?? '').toString().trim().toLowerCase();

const parseEventDateTime = (dateStr?: string | null, timeStr?: string | null) => {
  // Fallback: keine Uhrzeit -> 00:00:00
  const t = (timeStr && timeStr !== 'null' && timeStr !== 'undefined') ? timeStr : '00:00:00';
  return new Date(`${dateStr}T${t}`);
};

const formatDateTimeDE = (d: Date) => {
  const datum = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const zeit = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${datum} ${zeit}`;
};

function GigList({
  gigs,
  variant,
}: {
  gigs: (AdminGig & { _dt: Date })[];
  variant: 'upcoming' | 'past';
}) {
  return (
    <ul className="list-none space-y-3">
      {gigs.map((g) => (
        <li
          key={`${variant}-${g.id}`}
          className={cn(
            'rounded-2xl border p-4 sm:p-5',
            variant === 'upcoming'
              ? 'border-white/10 bg-white/5'
              : // Vergangenes tritt zurueck, statt gleich stark zu wirken.
                'border-white/5 bg-white/[0.02]'
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p
                className={cn(
                  'font-medium',
                  variant === 'upcoming' ? 'text-white' : 'text-gray-300'
                )}
              >
                {g.event_type || 'Event'}
                {g.show_type ? ` – ${g.show_type}` : ''}
              </p>
              {g.client_name && (
                <p className="mt-0.5 truncate text-sm text-gray-400">{g.client_name}</p>
              )}
              {g.event_address && (
                <p className="mt-1.5 flex items-start gap-1.5 text-sm text-gray-500">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span className="min-w-0 break-words">{g.event_address}</span>
                </p>
              )}
            </div>

            {/* tabular-nums haelt die Datumsspalte ruhig, sonst zappeln die
                Ziffern je nach Breite. Das <time>-Element gibt Assistenz-
                software das maschinenlesbare Datum. */}
            <time
              dateTime={g._dt.toISOString()}
              className="flex-shrink-0 text-sm tabular-nums text-gray-300 sm:text-right"
            >
              {formatDateTimeDE(g._dt)}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SectionHeading({ children, count }: { children: React.ReactNode; count: number }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h2 className="text-lg font-semibold text-white">{children}</h2>
      <span className="flex-shrink-0 text-sm tabular-nums text-gray-500">
        {count} {count === 1 ? 'Eintrag' : 'Einträge'}
      </span>
    </div>
  );
}

export default function AnstehendeGigs() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gigs, setGigs] = useState<AdminGig[]>([]);

  // Als eigene Funktion, damit der Fehlerzustand einen „Erneut versuchen"-Knopf
  // anbieten kann.
  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/requests/all`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${txt}`);
      }
      const json = await res.json();
      const list: AdminGig[] = Array.isArray(json) ? json : (json?.requests ?? []);
      if (signal?.aborted) return;
      setGigs(list);
    } catch (e: any) {
      if (signal?.aborted || e?.name === 'AbortError') return;
      console.error('PendingGigs fetch failed:', e);
      setError(e?.message ?? 'Fehler beim Laden');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const { upcoming, past } = useMemo(() => {
    const accepted = gigs.filter(g => normalize(g.status) === 'akzeptiert');
    const now = new Date();
    const withDt = accepted.map(g => ({ ...g, _dt: parseEventDateTime(g.event_date, g.event_time) }));
    const upcoming = withDt
      .filter(g => g._dt >= now)
      .sort((a, b) => +a._dt - +b._dt);
    const past = withDt
      .filter(g => g._dt < now)
      .sort((a, b) => +b._dt - +a._dt);
    return { upcoming, past } as {
      upcoming: (AdminGig & { _dt: Date })[];
      past: (AdminGig & { _dt: Date })[];
    };
  }, [gigs]);

  return (
    <DashboardLayout
      title="Gigs"
      description="Alle bestätigten Gigs aus dem gesamten System, nach Datum sortiert."
    >
      {loading && <LoadingSkeleton rows={3} />}

      {error && !loading && <ErrorState message={error} onRetry={() => void load()} />}

      {!loading && !error && (
        <>
          <section aria-labelledby="upcoming-heading">
            <SectionHeading count={upcoming.length}>
              <span id="upcoming-heading">Bevorstehend</span>
            </SectionHeading>
            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="Keine bevorstehenden Gigs"
                hint="Sobald eine Anfrage bestätigt wird und das Datum in der Zukunft liegt, erscheint sie hier."
              />
            ) : (
              <GigList gigs={upcoming} variant="upcoming" />
            )}
          </section>

          <section aria-labelledby="past-heading" className="pt-4">
            <SectionHeading count={past.length}>
              <span id="past-heading">Vergangen</span>
            </SectionHeading>
            {past.length === 0 ? (
              <EmptyState icon={CalendarCheck} title="Noch keine vergangenen Gigs" />
            ) : (
              <GigList gigs={past} variant="past" />
            )}
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
