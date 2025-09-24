import React, { useEffect, useMemo, useState } from 'react';
// Falls dein Auth-Context woanders liegt, ggf. den Import-Pfad anpassen
import { useAuth } from '../context/AuthContext';

interface Gig {
  id: number;
  event_date: string; // "YYYY-MM-DD"
  event_time?: string | null; // "HH:MM:SS"
  status: string; // sollte bereits per-Artist sein
  event_address?: string | null;
  event_type?: string | null;
  show_type?: string | null;
  client_name?: string | null;
}

const normalize = (s?: string | null) => (s ?? '').toString().trim().toLowerCase();

const parseEventDateTime = (dateStr?: string | null, timeStr?: string | null) => {
  // Fallback auf 00:00, wenn keine Uhrzeit vorhanden ist
  const t = (timeStr && timeStr !== 'null' && timeStr !== 'undefined') ? timeStr : '00:00:00';
  // Ohne Zeitzone: wird als lokale Zeit interpretiert (Europe/Berlin)
  return new Date(`${dateStr}T${t}`);
};

const formatDateTimeDE = (d: Date) => {
  const datum = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const zeit = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${datum} ${zeit}`;
};

const MyGigs: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gigs, setGigs] = useState<Gig[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ${txt}`);
        }
        const data = (await res.json()) as Gig[];
        if (!isMounted) return;
        setGigs(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!isMounted) return;
        console.error('❌ MyGigs fetch failed:', e);
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
    const withDates = accepted.map(g => ({ ...g, _dt: parseEventDateTime(g.event_date, g.event_time) }));
    const upcoming = withDates
      .filter(g => g._dt >= now)
      .sort((a, b) => +a._dt - +b._dt);
    const past = withDates
      .filter(g => g._dt < now)
      .sort((a, b) => +b._dt - +a._dt);
    return { upcoming, past } as {
      upcoming: (Gig & { _dt: Date })[];
      past: (Gig & { _dt: Date })[];
    };
  }, [gigs]);

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">🎤 Meine Gigs</h1>

      {loading && <p>⏳ Lädt…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <>
          {/* Bevorstehende Gigs */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Bevorstehende Gigs</h2>
            {upcoming.length === 0 ? (
              <p className="text-gray-400">Keine bevorstehenden Gigs.</p>) : (
              <ul className="space-y-3">
                {upcoming.map(g => {
                  const dt = parseEventDateTime(g.event_date, g.event_time);
                  return (
                    <li key={`up-${g.id}`} className="bg-gray-800 rounded p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="font-medium">{g.event_type || 'Event'}{g.show_type ? ` – ${g.show_type}` : ''}</div>
                          <div className="text-sm text-gray-300">{g.client_name || ''}</div>
                        </div>
                        <div className="text-sm text-gray-200">
                          <div className='mb-3'>📅 {formatDateTimeDE(dt)}</div>
                          {g.event_address && <div>📍 {g.event_address}</div>}
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
            <h2 className="text-xl font-semibold mb-4">Vergangene Gigs</h2>
            {past.length === 0 ? (
              <p className="text-gray-400">Keine vergangenen Gigs.</p>) : (
              <ul className="space-y-3">
                {past.map(g => {
                  const dt = parseEventDateTime(g.event_date, g.event_time);
                  return (
                    <li key={`past-${g.id}`} className="bg-gray-900 rounded p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="font-medium">{g.event_type || 'Event'}{g.show_type ? ` – ${g.show_type}` : ''}</div>
                          <div className="text-sm text-gray-300">{g.client_name || ''}</div>
                        </div>
                        <div className="text-sm text-gray-200">
                          <div>📅 {formatDateTimeDE(dt)}</div>
                          {g.event_address && <div>📍 {g.event_address}</div>}
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
};

export default MyGigs;