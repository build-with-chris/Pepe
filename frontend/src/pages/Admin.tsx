import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  MoreVertical,
  Check,
  Trash2,
  Loader2,
  CalendarDays,
  TrendingUp,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-[#D4A574]/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-[#D4A574]" />
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>('receivedDesc');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  async function handleAcceptRequest(id: number) {
    if (!token) return;
    try {
      const res = await fetch(api('/api/requests/requests/' + id + '/accept'), {
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
        const { availabilities, artistAvailability, slots, ...filtered } = data;
        setDashboardData(filtered);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const filteredAndSortedOffers = useMemo(() => {
    if (!dashboardData?.offers) return [] as any[];

    let list = [...dashboardData.offers];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter((o: any) =>
        o.client_name?.toLowerCase().includes(query) ||
        o.client_email?.toLowerCase().includes(query) ||
        String(o.id).includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      list = list.filter((o: any) => o.status === statusFilter);
    }

    // Sort
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
  }, [dashboardData?.offers, sortOption, searchQuery, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!dashboardData?.offers) return { total: 0, pending: 0, accepted: 0, thisMonth: 0 };

    const offers = dashboardData.offers;
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: offers.length,
      pending: offers.filter((o: any) => !o.status || o.status === 'offen' || o.status === 'pending').length,
      accepted: offers.filter((o: any) => o.status === 'akzeptiert').length,
      thisMonth: offers.filter((o: any) => {
        const d = getReceivedAt(o);
        return d && d >= thisMonthStart;
      }).length,
    };
  }, [dashboardData?.offers]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'akzeptiert': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'abgelehnt': 'bg-red-500/20 text-red-300 border-red-500/30',
      'offen': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Gesamt Anfragen"
            value={stats.total}
            icon={CalendarDays}
          />
          <StatCard
            title="Offene Anfragen"
            value={stats.pending}
            icon={Clock}
          />
          <StatCard
            title="Akzeptiert"
            value={stats.accepted}
            icon={Check}
          />
          <StatCard
            title="Diesen Monat"
            value={stats.thisMonth}
            icon={TrendingUp}
          />
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Suche nach Kunde oder ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px] bg-white/5 border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="offen">Offen</SelectItem>
                <SelectItem value="akzeptiert">Akzeptiert</SelectItem>
                <SelectItem value="abgelehnt">Abgelehnt</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Sortieren" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="receivedDesc">Neueste zuerst</SelectItem>
                <SelectItem value="receivedAsc">Älteste zuerst</SelectItem>
                <SelectItem value="dateAsc">Event aufsteigend</SelectItem>
                <SelectItem value="dateDesc">Event absteigend</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4A574]" />
            <span className="ml-3 text-gray-400">Lade Dashboard-Daten...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm px-6 py-4 text-red-300">
            Fehler: {error}
          </div>
        )}

        {/* Requests Table/Cards */}
        {!loading && !error && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">ID</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Kunde</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Event</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Eingegangen</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAndSortedOffers.map((offer: any) => (
                    <tr
                      key={offer.id}
                      className="hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/requests/${offer.id}/offers/${offer.id}/edit`)}
                    >
                      <td className="px-6 py-4">
                        <span className="text-white font-mono">#{offer.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{offer.client_name}</p>
                          <p className="text-gray-500 text-sm">{offer.client_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">{offer.event_date} {offer.event_time}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400">{formatDate(getReceivedAt(offer))}</span>
                      </td>
                      <td className="px-6 py-4">
                        {offer.status && (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(offer.status)}`}>
                            {offer.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-900 border-white/10">
                            <DropdownMenuItem
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleAcceptRequest(offer.id); }}
                              className="text-emerald-400 focus:text-emerald-300 focus:bg-white/5"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Annehmen
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDeleteRequest(offer.id); }}
                              className="text-red-400 focus:text-red-300 focus:bg-white/5"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-white/10">
              {filteredAndSortedOffers.map((offer: any) => (
                <div
                  key={offer.id}
                  className="p-4 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => navigate(`/admin/requests/${offer.id}/offers/${offer.id}/edit`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-white font-mono text-sm">#{offer.id}</span>
                      {offer.status && (
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(offer.status)}`}>
                          {offer.status}
                        </span>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-900 border-white/10">
                        <DropdownMenuItem
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleAcceptRequest(offer.id); }}
                          className="text-emerald-400"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Annehmen
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDeleteRequest(offer.id); }}
                          className="text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-white font-medium">{offer.client_name}</p>
                  <p className="text-gray-500 text-sm">{offer.client_email}</p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                    <span>{offer.event_date}</span>
                    <span>•</span>
                    <span>{formatDate(getReceivedAt(offer))}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredAndSortedOffers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">Keine Anfragen gefunden.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
