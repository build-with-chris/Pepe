import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

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

export default function AnstehendeGigs() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gigs, setGigs] = useState<AdminGig[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/requests/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ${txt}`);
        }
        const json = await res.json();
        const list: AdminGig[] = Array.isArray(json) ? json : (json?.requests ?? []);
        if (!isMounted) return;
        setGigs(list);
      } catch (e: any) {
        if (!isMounted) return;
        console.error('❌ PendingGigs fetch failed:', e);
        setError(e?.message ?? 'Fehler beim Laden');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [token]);

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
    <div className="max-w-6xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">📋 Gigs – Übersicht (Admin)</h1>

      {loading && <p>⏳ Lädt…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <>
          {/* Bevorstehende Gigs */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Bevorstehende Gigs</h2>
              <span className="text-sm text-gray-300">{upcoming.length} Einträge</span>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-gray-400">Keine bevorstehenden Gigs.</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map(g => {
                  const dt = parseEventDateTime(g.event_date, g.event_time);
                  return (
                    <li key={`up-${g.id}`} className="bg-gray-800 rounded p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="font-medium">{g.event_type || 'Event'}{g.show_type ? ` – ${g.show_type}` : ''}</div>
                          <div className="text-sm text-gray-300">{g.client_name || ''}</div>
                          {g.event_address && <div className="text-sm text-gray-400">📍 {g.event_address}</div>}
                        </div>
                        <div className="text-sm text-gray-200 text-right">
                          <div>📅 {formatDateTimeDE(dt)}</div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Vergangene Gigs */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Vergangene Gigs</h2>
              <span className="text-sm text-gray-300">{past.length} Einträge</span>
            </div>
            {past.length === 0 ? (
              <p className="text-gray-400">Keine vergangenen Gigs.</p>
            ) : (
              <ul className="space-y-3">
                {past.map(g => {
                  const dt = parseEventDateTime(g.event_date, g.event_time);
                  return (
                    <li key={`past-${g.id}`} className="bg-gray-900 rounded p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="font-medium">{g.event_type || 'Event'}{g.show_type ? ` – ${g.show_type}` : ''}</div>
                          <div className="text-sm text-gray-300">{g.client_name || ''}</div>
                          {g.event_address && <div className="text-sm text-gray-400">📍 {g.event_address}</div>}
                        </div>
                        <div className="text-sm text-gray-200 text-right">
                          <div>📅 {formatDateTimeDE(dt)}</div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
