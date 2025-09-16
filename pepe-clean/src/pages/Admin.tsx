import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

function formatDate(value: any) {
  if (!value) return '—';
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  } catch {
    return '—';
  }
}

function getReceivedAt(offer: any): Date | null {
  const v =
    offer?.request_created_at ||
    offer?.booking_request_created_at ||
    offer?.request?.created_at ||
    offer?.created_at ||
    offer?.createdAt ||
    offer?.created ||
    offer?.received_at ||
    offer?.submitted_at;

  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function Admin() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>('receivedDesc');

  const [expandedActions, setExpandedActions] = useState<number | null>(null);

  async function handleAcceptRequest(id: number) {
    if (!token) return;
    const API = import.meta.env.VITE_API_URL;
    try {
      const res = await fetch(`${API}/api/requests/requests/${id}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDashboardData((prev: any) => {
        if (!prev?.offers) return prev;
        return { ...prev, offers: prev.offers.map((o: any) => o.id === id ? { ...o, status: 'akzeptiert' } : o) };
      });
    } catch (e) {
      alert('Konnte Anfrage nicht annehmen.');
    }
  }

  async function handleDeleteRequest(id: number) {
    if (!token) return;
    const ok = window.confirm('Anfrage wirklich löschen?');
    if (!ok) return;
    const API = import.meta.env.VITE_API_URL;

    setDashboardData((prev: any) => {
      if (!prev?.offers) return prev;
      return { ...prev, offers: prev.offers.filter((o: any) => o.id !== id) };
    });

    try {
      const res = await fetch(`${API}/api/requests/requests/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 0));
      setLoading(true);
      try {
        const res = await fetch(`${API}/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        const { availabilities, artistAvailability, slots, ...filtered } = data;
        setDashboardData(filtered);
      } catch (err) {
        console.error('Reload after delete failed', err);
      } finally {
        setLoading(false);
      }
      alert('Löschen fehlgeschlagen.');
    }
  }

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        console.log('🚀 Raw dashboard data:', data);
        const { availabilities, artistAvailability, slots, ...filtered } = data;
        setDashboardData(filtered);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const sortedOffers = useMemo(() => {
    if (!dashboardData?.offers) return [] as any[];
    const list = [...dashboardData.offers];
    const byReceived = (a: any, b: any) => {
      const da = getReceivedAt(a);
      const db = getReceivedAt(b);
      const ta = da ? da.getTime() : 0;
      const tb = db ? db.getTime() : 0;
      return ta - tb;
    };
    const byEvent = (a: any, b: any) => {
      const ta = new Date(`${a.event_date}T${a.event_time || '00:00:00'}`).getTime();
      const tb = new Date(`${b.event_date}T${b.event_time || '00:00:00'}`).getTime();
      return ta - tb;
    };
    switch (sortOption) {
      case 'receivedAsc':
        return list.sort(byReceived);
      case 'receivedDesc':
        return list.sort((a, b) => byReceived(b, a));
      case 'dateAsc':
        return list.sort(byEvent);
      case 'dateDesc':
        return list.sort((a, b) => byEvent(b, a));
      case 'statusAsc':
        return list.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
      case 'statusDesc':
        return list.sort((a, b) => (b.status || '').localeCompare(a.status || ''));
      default:
        return list.sort((a, b) => byReceived(b, a));
    }
  }, [dashboardData?.offers, sortOption]);

  return (
    <div className="w-screen bg-black min-h-screen text-white">
      <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin-Bereich</h1>
      <p>Willkommen im Admin-Panel! Hier kannst du Einstellungen verwalten.</p>
      {dashboardData?.offers && (
        <div className="mb-4">
          <label className="mr-2">
            Sortieren nach:
            <select
              className="ml-2 bg-gray-700 text-white rounded px-2 py-1"
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
            >
              <option value="receivedDesc">Eingang (neueste zuerst)</option>
              <option value="receivedAsc">Eingang (älteste zuerst)</option>
              <option value="dateAsc">Eventdatum aufsteigend</option>
              <option value="dateDesc">Eventdatum absteigend</option>
              <option value="statusAsc">Status A–Z</option>
              <option value="statusDesc">Status Z–A</option>
            </select>
          </label>
        </div>
      )}
      {loading && <p>Lade Dashboard-Daten...</p>}
      {error && <p className="text-red-500">Fehler: {error}</p>}
      {sortedOffers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {sortedOffers.map((offer: any) => (
            <div
              key={offer.id}
              className="cursor-pointer bg-gray-800 shadow rounded p-4"
              onClick={() => navigate(`/admin/requests/${offer.id}/offers/${offer.id}/edit`)}
            >
              <h2 className="text-lg font-semibold mb-2">Anfrage #{offer.id}</h2>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Kunde:</span> {offer.client_name} ({offer.client_email})</p>
                <p><span className="font-medium">Datum:</span> {offer.event_date} {offer.event_time}</p>
                <p><span className="font-medium">Eingegangen:</span> {formatDate(getReceivedAt(offer))}</p>
                {offer.status && (<p><span className="font-medium">Status:</span> {offer.status}</p>)}
              </div>
              <div className="mt-3 flex items-center justify-end">
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedActions(expandedActions === offer.id ? null : offer.id); }}
                    className="flex items-center gap-1 rounded bg-gray-700 px-2 py-1 text-sm text-white hover:bg-gray-600"
                    title="Aktionen anzeigen"
                  >
                    Aktionen <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  {expandedActions === offer.id && (
                    <div className="absolute right-0 mt-1 w-32 rounded bg-gray-800 shadow-lg border border-gray-700 z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAcceptRequest(offer.id); setExpandedActions(null); }}
                        className="block w-full text-left px-3 py-2 text-sm text-emerald-400 hover:bg-gray-700"
                      >
                        Annehmen
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteRequest(offer.id); setExpandedActions(null); }}
                        className="block w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-gray-700"
                      >
                        Löschen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p>Keine Angebote gefunden.</p>
      )}
      </div>
    </div>
  );
}