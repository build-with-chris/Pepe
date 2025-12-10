import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Check, Trash2, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardCard } from '@/components/DashboardCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const API_BASE: string = (import.meta.env.VITE_API_URL as string) || '';
const api = (path: string) => `${API_BASE}${path}`.replace(/([^:]\/)\/+/g, '$1');

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
  // Prefer the booking request's real creation timestamp
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

  async function handleAcceptRequest(id: number) {
    if (!token) return;
    try {
      const res = await fetch(api('/api/requests/requests/' + id + '/accept'), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Update status locally
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

    // Optimistic UI: entferne sofort aus der Liste
    setDashboardData((prev: any) => {
      if (!prev?.offers) return prev;
      return { ...prev, offers: prev.offers.filter((o: any) => o.id !== id) };
    });

    try {
      const res = await fetch(api('/api/requests/requests/' + id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (e) {
      // Rollback bei Fehler: neu laden
      await new Promise(r => setTimeout(r, 0));
      setLoading(true);
      try {
        const res = await fetch(api('/api/admin/dashboard'), { headers: { Authorization: `Bearer ${token}` } });
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
    fetch(api('/api/admin/dashboard'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        console.log('🚀 Raw dashboard data:', data);
        // Entferne Artist-Verfügbarkeiten und Slots, bevor wir die Daten setzen
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin-Bereich</h1>
            <p className="text-gray-400 mt-1">Willkommen im Admin-Panel! Hier kannst du Einstellungen verwalten.</p>
          </div>

          {dashboardData?.offers && (
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[220px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Sortieren nach..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="receivedDesc">Eingang (neueste zuerst)</SelectItem>
                <SelectItem value="receivedAsc">Eingang (älteste zuerst)</SelectItem>
                <SelectItem value="dateAsc">Eventdatum aufsteigend</SelectItem>
                <SelectItem value="dateDesc">Eventdatum absteigend</SelectItem>
                <SelectItem value="statusAsc">Status A–Z</SelectItem>
                <SelectItem value="statusDesc">Status Z–A</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            <span className="ml-3 text-gray-400">Lade Dashboard-Daten...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm px-4 py-3 text-red-300">
            Fehler: {error}
          </div>
        )}

        {/* Offers Grid */}
        {sortedOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedOffers.map((offer: any) => (
              <DashboardCard
                key={offer.id}
                className="cursor-pointer hover:border-white/20 transition-all"
                onClick={() => navigate(`/admin/requests/${offer.id}/offers/${offer.id}/edit`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-lg font-semibold text-white">Anfrage #{offer.id}</h2>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-900 border-white/10">
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); handleAcceptRequest(offer.id); }}
                        className="text-emerald-400 focus:text-emerald-300 focus:bg-white/5"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Annehmen
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); handleDeleteRequest(offer.id); }}
                        className="text-red-400 focus:text-red-300 focus:bg-white/5"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="text-sm space-y-2 text-gray-300">
                  <p>
                    <span className="text-gray-500">Kunde:</span>{' '}
                    <span className="text-white">{offer.client_name}</span>
                    <span className="text-gray-500 ml-1">({offer.client_email})</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Datum:</span>{' '}
                    <span className="text-white">{offer.event_date} {offer.event_time}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Eingegangen:</span>{' '}
                    <span className="text-white">{formatDate(getReceivedAt(offer))}</span>
                  </p>
                  {offer.status && (
                    <p>
                      <span className="text-gray-500">Status:</span>{' '}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        offer.status === 'akzeptiert'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : offer.status === 'abgelehnt'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {offer.status}
                      </span>
                    </p>
                  )}
                </div>
              </DashboardCard>
            ))}
          </div>
        ) : (
          !loading && (
            <DashboardCard className="text-center py-12">
              <p className="text-gray-400">Keine Angebote gefunden.</p>
            </DashboardCard>
          )
        )}
      </div>
    </DashboardLayout>
  );
}