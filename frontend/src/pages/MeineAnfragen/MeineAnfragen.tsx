import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Inbox } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../context/AuthContext';
import List from "./components/List";
import RequestCard, { type RequestNotice } from "./components/RequestCard";
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardCard } from '@/components/DashboardCard';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/dashboard/PageState';

import { ProfileStatusBanner } from '@/components/ProfileStatusBanner';

function getReceivedAtTs(record: any): number {
  const v =
    record?.request_created_at ??
    record?.booking_request_created_at ??
    record?.request?.created_at ??
    record?.created_at ??
    record?.createdAt ??
    record?.created ??
    record?.received_at ??
    record?.submitted_at ?? null;
  if (!v) return 0;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

type Status = 'angefragt' | 'angeboten' | 'akzeptiert' | 'abgelehnt' | 'storniert';

interface Anfrage {
  id: number | string;
  event_type: string;
  show_type: string;
  event_date: string; // YYYY-MM-DD
  event_time: string; // HH:MM:SS
  event_address: string;
  duration_minutes: number;
  number_of_guests: number;
  is_indoor: boolean;
  recommended_price_min: number;
  recommended_price_max: number;
  show_discipline: string;
  special_requests: string;
  status: Status | string;
  team_size: string | number;
  artist_gage?: number;           
  artist_offer_date?: string;    
  admin_comment?: string; // Kommentar vom Admin (Backend: comment/artist_comment)
};

const MeineAnfragen: React.FC = () => {
  const { token, user, getFreshToken } = useAuth();
  const { t } = useTranslation();
  
  const [anfragen, setAnfragen] = useState<Anfrage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'aktion' | 'alle'>('aktion');
  const [offerInputs, setOfferInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | number | null>(null);
  // Rückmeldung je Anfrage. Ersetzt die drei alert()-Aufrufe.
  const [notices, setNotices] = useState<Record<string, RequestNotice | null>>({});

  const API_BASE = import.meta.env.VITE_API_URL;

  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    // Always use a fresh token to avoid 401 from expired Clerk JWT
    const freshToken = await getFreshToken() || token;
    if (freshToken) headers['Authorization'] = `Bearer ${freshToken}`;
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { ...headers, ...(options.headers as any) },
      ...options,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    return res.json();
  };

  // Als eigene Funktion, damit der Fehlerzustand einen „Erneut versuchen"-Knopf
  // anbieten kann.
  const load = useCallback(async () => {
    if (!token || !user) return;

    // If artist is not approved, we can't fetch requests
    if (user.approval_status !== 'approved') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/requests/requests');
      // Erwartet ein Array direkt oder in { requests: [...] }
      const rawList: any[] = Array.isArray(data) ? data : data.requests || [];
      const list: Anfrage[] = rawList.map((item: any) => ({
        ...item,
        admin_comment: item.comment ?? item.artist_comment ?? undefined,
      }));
      // Sort by received/created date (newest first)
      list.sort((a, b) => getReceivedAtTs(b) - getReceivedAtTs(a));
      setAnfragen(list);
    } catch (e: any) {
      console.error('Anfragen konnten nicht geladen werden:', e);
      setError(e.message || t('requests.errors.loadFailed', { defaultValue: 'Die Anfragen konnten nicht geladen werden.' }));
    } finally {
      setLoading(false);
    }
    // apiFetch haengt an getFreshToken und token; die Abhaengigkeiten hier
    // bewusst auf das Wesentliche begrenzt, sonst laedt die Seite bei jedem
    // Render neu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.approval_status]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCount = anfragen.filter(a => String(a.status).toLowerCase() === 'angefragt').length;

  const filtered = anfragen.filter(a => {
    if (activeTab === 'aktion') {
      // Nur angefragte, also die noch nicht beantworteten.
      return String(a.status).toLowerCase() === 'angefragt';
    }
    return true;
  });

  /** Eine Stelle für den Meldungstyp — sonst verbreitert TypeScript `kind` zu string. */
  const setNotice = (id: string | number, notice: RequestNotice | null) => {
    setNotices(prev => ({ ...prev, [String(id)]: notice }));
  };

  const handleOfferChange = (id: string | number, value: string) => {
    setOfferInputs(prev => ({ ...prev, [String(id)]: value }));
    // Eine alte Meldung passt nicht mehr, sobald der Betrag sich aendert.
    if (notices[String(id)]) setNotice(id, null);
  };

  const sendOffer = async (id: string | number, preisNum: number) => {
    if (!Number.isFinite(preisNum) || preisNum <= 0) {
      setNotice(id, {
        kind: 'error',
        text: t('requests.offer.invalidPrice', { defaultValue: 'Bitte einen Betrag groesser als 0 eintragen.' }),
      });
      return;
    }

    setSubmitting(id);
    setNotice(id, null);

    // Vorher merken, um bei einem Fehler genau dorthin zurueckzurollen.
    const before = anfragen.find(a => a.id === id);

    // Optimistische Aktualisierung von Status und Gage
    setAnfragen(prev => prev.map(a => a.id === id ? { ...a, status: 'angeboten', artist_gage: preisNum } : a));
    try {
      const result = await apiFetch(`/api/requests/requests/${id}/offer`, {
        method: 'PUT',
        body: JSON.stringify({ price_offered: preisNum }),
      });
      setAnfragen(prev => prev.map(a => a.id === id ? { ...a, status: result.status, artist_gage: result.price_offered } : a));
      // Rückmeldung an der Karte statt in einem alert()-Fenster, und sie sagt,
      // was als Naechstes passiert.
      setNotice(id, {
        kind: 'success',
        text: t('requests.offer.success', {
          defaultValue: 'Angebot gesendet. Die Agentur prüft es und meldet sich beim Kunden.',
        }),
      });
    } catch (e: any) {
      console.error('Angebot konnte nicht gesendet werden:', e);
      setAnfragen(prev => prev.map(a => (a.id === id && before ? before : a)));
      setNotice(id, {
        kind: 'error',
        text:
          t('requests.offer.failed', { defaultValue: 'Das Angebot konnte nicht gesendet werden' }) +
          (e?.message ? `: ${e.message}` : '. Bitte versuche es erneut.'),
      });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <DashboardLayout title={t('requests.title', { defaultValue: 'Meine Anfragen' })}>
      <div className="space-y-6">

        {/* Reiter mit Zähler: Ohne die Zahl muss man umschalten, um zu sehen,
            ob überhaupt etwas zu tun ist. */}
        <div role="tablist" aria-label="Ansicht" className="flex gap-2">
          {([
            { key: 'aktion' as const, label: t('requests.tabs.actionNeeded', { defaultValue: 'Aktion nötig' }), count: openCount },
            { key: 'alle' as const, label: t('requests.tabs.all', { defaultValue: 'Alle' }), count: anfragen.length },
          ]).map(tab => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.key)}
                className={
                  'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold ' +
                  (active
                    ? 'border-pepe-gold/40 bg-pepe-gold/15 text-pepe-gold'
                    : 'border-white/15 text-gray-300 hover:bg-white/5 hover:text-white')
                }
              >
                {tab.label}
                <span
                  className={
                    'min-w-[1.5rem] rounded-full px-1.5 py-0.5 text-xs tabular-nums ' +
                    (active ? 'bg-pepe-gold text-pepe-black' : 'bg-white/10 text-gray-300')
                  }
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && <LoadingSkeleton rows={2} />}

        {/* Error State */}
        {error && !loading && (
          <ErrorState message={error} onRetry={() => void load()} />
        )}

        {/* Not Approved State */}
        {!loading && user?.approval_status !== 'approved' && (
          <div className="space-y-6">
            <ProfileStatusBanner status={user?.approval_status || 'unsubmitted'} />
            <DashboardCard className="text-center py-12">
              <p className="text-gray-400">
                {user?.approval_status === 'pending' 
                  ? 'Sobald dein Profil freigeschaltet wurde, siehst du hier neue Buchungsanfragen.'
                  : 'Bitte vervollständige dein Profil und reiche es zur Prüfung ein, um Anfragen zu erhalten.'}
              </p>
            </DashboardCard>
          </div>
        )}

        {/* Leerzustand. Vorher stand hier für beide Fälle derselbe Satz
            („Keine Anfragen in dieser Ansicht"), obwohl „alles beantwortet" und
            „noch nie eine Anfrage bekommen" völlig Verschiedenes bedeuten. */}
        {!loading && !error && user?.approval_status === 'approved' && filtered.length === 0 && (
          activeTab === 'aktion' && anfragen.length > 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Alles beantwortet"
              hint="Auf keine Anfrage wartet gerade ein Angebot von dir."
              action={
                <button
                  type="button"
                  onClick={() => setActiveTab('alle')}
                  className="text-sm font-medium text-pepe-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold"
                >
                  Alle {anfragen.length} Anfragen ansehen
                </button>
              }
            />
          ) : (
            <EmptyState
              icon={Inbox}
              title="Noch keine Anfragen"
              hint="Sobald eine Buchungsanfrage zu deinen Disziplinen und deiner Verfügbarkeit passt, erscheint sie hier. Ein gepflegter Kalender erhöht die Chance."
            />
          )
        )}

        {/* Requests List */}
        {user?.approval_status === 'approved' && filtered.length > 0 && (
          <List variant="stack" ariaLabel={t('requests.title', { defaultValue: 'Meine Anfragen' })}>
            {filtered.map(anfrage => (
              <RequestCard
                key={anfrage.id}
                request={anfrage}
                // Bewusst kein Vorbelegen mit `recommended_price_min`: Das war
                // der niedrigste Wert der Empfehlung, ein schneller Klick auf
                // „Senden" verschenkte damit Geld. Die Karte bietet stattdessen
                // Minimum, Mitte und Maximum zum Antippen an.
                offerInput={offerInputs[String(anfrage.id)] ?? ''}
                onOfferChange={handleOfferChange}
                onSendOffer={sendOffer}
                submitting={submitting === anfrage.id}
                notice={notices[String(anfrage.id)] ?? null}
              />
            ))}
          </List>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MeineAnfragen;