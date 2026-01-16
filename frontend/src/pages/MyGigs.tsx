import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardCard } from '@/components/DashboardCard';
import { Loader2, Calendar, MapPin } from 'lucide-react';

interface Gig {
  id: number;
  event_date: string;
  event_time?: string | null;
  status: string;
  event_address?: string | null;
  event_type?: string | null;
  show_type?: string | null;
  client_name?: string | null;
}

const normalize = (s?: string | null) => (s ?? '').toString().trim().toLowerCase();

const parseEventDateTime = (dateStr?: string | null, timeStr?: string | null) => {
  const t = (timeStr && timeStr !== 'null' && timeStr !== 'undefined') ? timeStr : '00:00:00';
  return new Date(`${dateStr}T${t}`);
};

const formatDateTimeDE = (d: Date) => {
  const datum = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const zeit = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${datum} ${zeit}`;
};

const MyGigs: React.FC = () => {
  const { token } = useAuth();
  const { t } = useTranslation();
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
    <DashboardLayout title={t('myGigs.title')}>
      <div className="space-y-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4A574]" />
            <span className="ml-3 text-gray-400">{t('myGigs.loading')}</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm px-6 py-4 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Upcoming Gigs */}
            <section className="space-y-5">
              <h2 className="text-lg font-semibold text-white">{t('myGigs.upcoming')}</h2>
              {upcoming.length === 0 ? (
                <DashboardCard className="text-center py-10">
                  <p className="text-gray-400">{t('myGigs.noUpcoming')}</p>
                </DashboardCard>
              ) : (
                <div className="space-y-4">
                  {upcoming.map(g => {
                    const dt = parseEventDateTime(g.event_date, g.event_time);
                    return (
                      <DashboardCard key={`up-${g.id}`} className="hover:border-[#D4A574]/30 transition-all p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <div className="font-medium text-white text-base">{g.event_type || 'Event'}{g.show_type ? ` – ${g.show_type}` : ''}</div>
                            <div className="text-sm text-gray-400 mt-1">{g.client_name || ''}</div>
                          </div>
                          <div className="text-sm space-y-2">
                            <div className="flex items-center text-gray-300">
                              <Calendar className="w-4 h-4 mr-3 text-[#D4A574]" />
                              {formatDateTimeDE(dt)}
                            </div>
                            {g.event_address && (
                              <div className="flex items-center text-gray-300">
                                <MapPin className="w-4 h-4 mr-3 text-[#D4A574]" />
                                {g.event_address}
                              </div>
                            )}
                          </div>
                        </div>
                      </DashboardCard>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Past Gigs */}
            <section className="space-y-5">
              <h2 className="text-lg font-semibold text-white">{t('myGigs.past')}</h2>
              {past.length === 0 ? (
                <DashboardCard className="text-center py-10">
                  <p className="text-gray-400">{t('myGigs.noPast')}</p>
                </DashboardCard>
              ) : (
                <div className="space-y-4">
                  {past.map(g => {
                    const dt = parseEventDateTime(g.event_date, g.event_time);
                    return (
                      <DashboardCard key={`past-${g.id}`} className="opacity-70 hover:opacity-100 transition-all p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <div className="font-medium text-white text-base">{g.event_type || 'Event'}{g.show_type ? ` – ${g.show_type}` : ''}</div>
                            <div className="text-sm text-gray-400 mt-1">{g.client_name || ''}</div>
                          </div>
                          <div className="text-sm space-y-2">
                            <div className="flex items-center text-gray-400">
                              <Calendar className="w-4 h-4 mr-3" />
                              {formatDateTimeDE(dt)}
                            </div>
                            {g.event_address && (
                              <div className="flex items-center text-gray-400">
                                <MapPin className="w-4 h-4 mr-3" />
                                {g.event_address}
                              </div>
                            )}
                          </div>
                        </div>
                      </DashboardCard>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyGigs;