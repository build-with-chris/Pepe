import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import List from "./components/List";
import RequestCard from "./components/RequestCard";

import { useTranslation } from 'react-i18next';

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
  const { token } = useAuth();
  const { t } = useTranslation();
  if (!token) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-red-600">
        {t('auth.missingToken', { defaultValue: 'Kein Auth-Token gefunden. Bitte neu einloggen oder Seite neu laden.' })}
      </div>
    );
  }
  const [anfragen, setAnfragen] = useState<Anfrage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'aktion' | 'alle'>('aktion');
  const [offerInputs, setOfferInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | number | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL;

  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
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

  useEffect(() => {
    const load = async () => {
      console.log('Lade Anfragen, Token:', token);
      setLoading(true);
      setError(null);
      try {
        const url = '/api/requests/requests';
        console.log('Fetch URL:', import.meta.env.VITE_API_URL + url);
        const data = await apiFetch(url);
        console.log('Rohdaten von /api/requests/requests:', data);
        // Erwartet ein Array direkt oder in { requests: [...] }
        const rawList: any[] = Array.isArray(data) ? data : data.requests || [];
        const list: Anfrage[] = rawList.map((item: any) => ({
          ...item,
          admin_comment: item.comment ?? item.artist_comment ?? undefined,
        }));
        // Sort by received/created date (newest first)
        list.sort((a, b) => getReceivedAtTs(b) - getReceivedAtTs(a));
        setAnfragen(list);
        console.log('🕵️‍♀️ Loaded requests with all fields:', list);
        console.log('🧐 Loaded statuses:', list.map(a => a.status));
      } catch (e: any) {
        console.error('Fehler beim Laden:', e);
        setError(e.message || t('requests.errors.loadFailed', { defaultValue: 'Fehler beim Laden der Anfragen' }));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const filtered = anfragen.filter(a => {
    const st = String(a.status).toLowerCase();
    console.log(`🧐 Filtering id=${a.id}, raw='${a.status}', norm='${st}', tab='${activeTab}'`);
    if (activeTab === 'aktion') {
      // Zeige nur angefragte (noch nicht beantwortete) Anfragen
      return st === 'angefragt';
    }
    // Bei 'alle' Tab wirklich alle anzeigen
    if (activeTab === 'alle') {
      return true;
    }
    return false;  // falls später weitere Tabs hinzukommen
  });

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return d;
    }
  };

  const formatTime = (t: string) => {
    // expects HH:MM:SS
    return t.slice(0,5);
  };

  // Extract the city part from an address (last segment after comma)
  const getCity = (address: string) => {
    const parts = address.split(',');
    return parts.length > 1 ? parts[parts.length - 1].trim() : address;
  };

  const handleOfferChange = (id: string | number, value: string) => {
    setOfferInputs(prev => ({ ...prev, [id]: value }));
  };

  const sendOffer = async (id: string | number, preisNum: number) => {
    if (!Number.isFinite(preisNum) || preisNum <= 0) {
      alert(t('requests.offer.invalidPrice', { defaultValue: 'Bitte gültigen Preis eingeben.' }));
      return;
    }
    setSubmitting(id);
    // Optimistische Aktualisierung von Status und Gage
    setAnfragen(prev => prev.map(a => a.id === id ? { ...a, status: 'angeboten', artist_gage: preisNum } : a));
    try {
      console.log('🛰️ Sende Artist-Angebot PUT payload:', { price_offered: preisNum });
      const result = await apiFetch(`/api/requests/requests/${id}/offer`, {
        method: 'PUT',
        body: JSON.stringify({ price_offered: preisNum }),
      });
      // Serverwerte übernehmen
      setAnfragen(prev => prev.map(a => a.id === id ? { ...a, status: result.status, artist_gage: result.price_offered } : a));
      alert(t('requests.offer.success', { defaultValue: 'Angebot erfolgreich an den Admin weitergegeben.' }));
    } catch (e: any) {
      console.error(e);
      alert(t('requests.offer.failed', { defaultValue: 'Fehler beim Absenden des Angebots' }) + ': ' + (e.message || ''));
      // rollback
      setAnfragen(prev => prev.map(a => a.id === id ? { ...a, status: 'angefragt' } : a));
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6 text-gray-300">Stay up to date</h1>
      <div className="flex gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded border transition-colors ${
            activeTab === 'aktion'
              ? 'bg-white text-black border-white'
              : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
          }`}
          onClick={() => setActiveTab('aktion')}
        >
          {t('requests.tabs.actionNeeded', { defaultValue: 'Aktion nötig' })}
        </button>
        <button
          className={`px-4 py-2 rounded border transition-colors ${
            activeTab === 'alle'
              ? 'bg-white text-black border-white'
              : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
          }`}
          onClick={() => setActiveTab('alle')}
        >
          {t('requests.tabs.all', { defaultValue: 'Alle Anfragen' })}
        </button>
      </div>

      {loading && <div className="text-gray-300">{t('requests.loading', { defaultValue: 'Lade Anfragen…' })}</div>}
      {error && <div className="text-red-400 mb-4">{error}</div>}


      {!loading && filtered.length === 0 && (
        <div className="text-center text-gray-400">{t('requests.empty', { defaultValue: 'Keine Anfragen in dieser Ansicht.' })}</div>
      )}

      <List variant="stack" ariaLabel={t('requests.title', { defaultValue: 'Meine Anfragen' })}>
        {filtered.map(anfrage => (
          <RequestCard
            key={anfrage.id}
            request={anfrage}
            activeTab={activeTab}
            offerInput={offerInputs[anfrage.id as any] ?? String(anfrage.recommended_price_min)}
            onOfferChange={handleOfferChange}
            onSendOffer={sendOffer}
            submitting={submitting === anfrage.id}
          />
        ))}
      </List>
    </div>
  );
};

export default MeineAnfragen;