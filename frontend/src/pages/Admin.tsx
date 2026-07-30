import { useCallback, useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  MoreVertical,
  Check,
  Pencil,
  Trash2,
  CalendarDays,
  TrendingUp,
  Clock,
  Search,
  Filter,
  X
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/dashboard/PageState';
import {
  eventCity,
  formatDateTimeDE,
  formatEventDateTime,
  formatMoney,
  getReceivedAt,
} from '@/utils/dates';
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

// formatDate und getReceivedAt standen hier als eigene Kopien. Sie kommen jetzt
// aus utils/dates, damit Künstler- und Admin-Ansicht dieselben Formate zeigen.

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  /** Macht die Kachel zum Filter. Ohne das ist sie nur Dekoration. */
  onClick?: () => void;
  isActive?: boolean;
}

function StatCard({ title, value, icon: Icon, trend, trendUp, onClick, isActive }: StatCardProps) {
  const inner = (
    <>
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
        <div className="w-12 h-12 rounded-xl bg-pepe-gold/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-pepe-gold" aria-hidden="true" />
        </div>
      </div>
    </>
  );

  const shell =
    'rounded-2xl border p-6 text-left transition-colors ' +
    (isActive ? 'border-pepe-gold/40 bg-pepe-gold/10' : 'border-white/10 bg-white/5');

  // Als Knopf, wenn sie filtert. Sonst bleibt es ein reiner Anzeigeblock — ein
  // Knopf ohne Wirkung wäre für Tastatur- und Screenreader-Nutzer irreführend.
  if (!onClick) {
    return <div className={shell}>{inner}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`${shell} w-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold`}
    >
      {inner}
    </button>
  );
}

export default function Admin() {
  const { token, getFreshToken } = useAuth();
  // Kein useNavigate mehr: Die Anfrage wird über einen sichtbaren
  // „Angebot"-Knopf geöffnet, der ein echter Link ist und damit per Tastatur
  // erreichbar.
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>('receivedDesc');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  // Rückmeldung zu Annehmen und Löschen. Ersetzt zwei alert()-Fenster.
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  async function handleAcceptRequest(id: number) {
    if (!token) return;
    setNotice(null);
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
      setNotice({ kind: 'success', text: `Anfrage #${id} ist angenommen.` });
    } catch (e: any) {
      setNotice({
        kind: 'error',
        text: `Anfrage #${id} konnte nicht angenommen werden${e?.message ? `: ${e.message}` : '.'}`,
      });
    }
  }

  async function handleDeleteRequest(id: number) {
    if (!token) return;
    // Rückfrage bleibt: Löschen ist nicht umkehrbar.
    const ok = window.confirm(`Anfrage #${id} wirklich löschen? Das lässt sich nicht rückgängig machen.`);
    if (!ok) return;

    setNotice(null);
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
      setNotice({ kind: 'success', text: `Anfrage #${id} ist gelöscht.` });
    } catch (e: any) {
      // Die Zeile war schon aus der Liste genommen — neu laden, damit sie
      // wieder erscheint und der Stand wieder dem Server entspricht.
      await loadDashboard();
      setNotice({
        kind: 'error',
        text: `Anfrage #${id} konnte nicht gelöscht werden${e?.message ? `: ${e.message}` : '.'}`,
      });
    }
  }

  // Als eigene Funktion, damit der Fehlerzustand einen „Erneut versuchen"-Knopf
  // anbieten kann.
  const loadDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // Always use a fresh token to avoid 401 from admin gate
      const freshToken = await getFreshToken() || token;
      const res = await fetch(api('/api/admin/dashboard'), {
        headers: { Authorization: `Bearer ${freshToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      // slots und die Availability-Felder braucht diese Seite nicht.
      const { availabilities, artistAvailability, slots, ...filtered } = data;
      setDashboardData(filtered);
    } catch (err: any) {
      console.error('[Admin] Dashboard load failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

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
    if (statusFilter === 'offen') {
      // "Offen" = all active/pending statuses
      list = list.filter((o: any) => {
        const st = (o.status || '').toLowerCase();
        return !st || st === 'offen' || st === 'angefragt' || st === 'angeboten' || st === 'pending';
      });
    } else if (statusFilter !== 'all') {
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
      pending: offers.filter((o: any) => !o.status || o.status === 'offen' || o.status === 'pending' || o.status === 'angefragt' || o.status === 'angeboten').length,
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
      'storniert': 'bg-red-500/20 text-red-300 border-red-500/30',
      'offen': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'angefragt': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'angeboten': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'angefragt': 'Neu',
      'angeboten': 'Angebot liegt vor',
      'akzeptiert': 'Akzeptiert',
      'abgelehnt': 'Abgelehnt',
      'storniert': 'Storniert',
      'offen': 'Offen',
    };
    return labels[status] || status;
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <SEO title="Admin Dashboard" noindex />
      <div className="space-y-8">
        {/* Kennzahlen. Die ersten drei filtern die Liste darunter — vorher waren
            sie reine Anzeige, und man musste den Filter daneben von Hand
            umstellen, obwohl die Zahl direkt danebenstand. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Alle Anfragen"
            value={stats.total}
            icon={CalendarDays}
            onClick={() => setStatusFilter('all')}
            isActive={statusFilter === 'all'}
          />
          <StatCard
            title="Offen"
            value={stats.pending}
            icon={Clock}
            onClick={() => setStatusFilter('offen')}
            isActive={statusFilter === 'offen'}
          />
          <StatCard
            title="Akzeptiert"
            value={stats.accepted}
            icon={Check}
            onClick={() => setStatusFilter('akzeptiert')}
            isActive={statusFilter === 'akzeptiert'}
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
                <SelectItem value="offen">Offen / Neu</SelectItem>
                <SelectItem value="angeboten">Angebot liegt vor</SelectItem>
                <SelectItem value="akzeptiert">Akzeptiert</SelectItem>
                <SelectItem value="abgelehnt">Abgelehnt</SelectItem>
                <SelectItem value="storniert">Storniert</SelectItem>
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

        {/* Rückmeldung zu Annehmen und Löschen, statt eines alert()-Fensters. */}
        {notice && (
          <div
            aria-live="polite"
            className={
              'flex items-start justify-between gap-3 rounded-2xl border p-4 text-sm ' +
              (notice.kind === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-red-500/30 bg-red-500/10 text-red-200')
            }
          >
            <span>{notice.text}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Meldung ausblenden"
              className="flex-shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSkeleton rows={4} />}

        {/* Error State */}
        {error && !loading && <ErrorState message={error} onRetry={() => void loadDashboard()} />}

        {/* Requests List */}
        {!loading && !error && filteredAndSortedOffers.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <ul className="list-none divide-y divide-white/10">
              {filteredAndSortedOffers.map((offer: any) => (
                <li key={offer.id} className="relative transition-colors hover:bg-white/5">
                  <div className="flex items-start justify-between gap-3 p-4 lg:px-6 lg:py-5">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        {/*
                          Nur die Nummer, kein Link. Die Zeile war vorher ein
                          <div> mit onClick: per Tastatur nicht erreichbar und
                          für Screenreader kein Ziel. Ein Zwischenstand legte
                          dafür eine unsichtbare Überlagerung über die ganze
                          Zeile — die machte das Markieren von Text unmöglich
                          und verdeckte die anderen Bedienelemente. Jetzt gibt es
                          rechts einen sichtbaren „Angebot"-Knopf; das ist das
                          Ziel, und es steht da.
                        */}
                        <span className="font-mono text-sm text-gray-400">#{offer.id}</span>
                        {offer.status && (
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(offer.status)}`}
                          >
                            {getStatusLabel(offer.status)}
                          </span>
                        )}
                      </div>

                      <p className="font-medium text-white">{offer.client_name}</p>
                      <p className="truncate text-sm text-gray-500">{offer.client_email}</p>

                      {/* Das Event-Datum stand hier als rohes „2026-09-19
                          19:00:00". Jetzt mit Wochentag, denn ob ein Gig auf ein
                          Wochenende fällt, ist die erste Frage. */}
                      <p className="mt-2 text-sm text-gray-300">
                        {formatEventDateTime(offer.event_date, offer.event_time)}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                        {offer.show_discipline && <span>{offer.show_discipline}</span>}
                        {offer.event_address && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{eventCity(offer.event_address)}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>Eingegangen {formatDateTimeDE(getReceivedAt(offer))}</span>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 flex-col items-end gap-3">
                      {/* Der Preis fehlte in der Liste komplett — die Zahl, um
                          die es geht, musste man in jeder Anfrage einzeln
                          aufschlagen. z-10, damit er nicht unter der
                          Zeilen-Überlagerung liegt. */}
                      <div className="relative z-10 text-right">
                        {typeof offer.price_offered === 'number' ? (
                          <>
                            <p className="text-xs text-gray-500">Angebot</p>
                            <p className="font-semibold tabular-nums text-white">
                              {formatMoney(offer.price_offered)}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-gray-500">Empfehlung</p>
                            <p className="text-sm tabular-nums text-gray-400">
                              {typeof offer.price_min === 'number' || typeof offer.price_max === 'number'
                                ? `${formatMoney(offer.price_min)} – ${formatMoney(offer.price_max)}`
                                : '—'}
                            </p>
                          </>
                        )}
                      </div>

                      {/* Sichtbare Aktionen. Vorher lagen „Bearbeiten",
                          „Annehmen" und „Löschen" alle drei hinter einem ⋮ ohne
                          Beschriftung, und das einzige erkennbare Ziel war das
                          kleine `#12`. Man sah nicht, was hier möglich ist.
                          Löschen bleibt im Menü — es ist nicht umkehrbar und
                          gehört nicht neben die Alltagsaktion. */}
                      <div className="relative z-10 flex items-center gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-white/15 bg-transparent text-gray-200 hover:bg-white/10 hover:text-white"
                        >
                          <Link to={`/admin/requests/${offer.id}/offers/${offer.id}/edit`}>
                            <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                            Angebot
                          </Link>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcceptRequest(offer.id)}
                          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 hover:text-emerald-100"
                        >
                          <Check className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                          Annehmen
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Weitere Aktionen für Anfrage #${offer.id}`}
                              className="h-8 w-8 flex-shrink-0 text-gray-400 hover:bg-white/10 hover:text-white"
                            >
                              <MoreVertical className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-white/10 bg-pepe-surface">
                            <DropdownMenuItem
                              onClick={() => handleDeleteRequest(offer.id)}
                              className="text-red-400 focus:bg-white/5 focus:text-red-300"
                            >
                              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Leerzustand */}
        {!loading && !error && filteredAndSortedOffers.length === 0 && (
          dashboardData?.offers?.length > 0 ? (
            <EmptyState
              icon={Filter}
              title="Keine Anfrage passt zu diesem Filter"
              hint={`${dashboardData.offers.length} Anfragen sind insgesamt vorhanden.`}
              action={
                <button
                  type="button"
                  onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}
                  className="text-sm font-medium text-pepe-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold"
                >
                  Filter zurücksetzen
                </button>
              }
            />
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Noch keine Anfragen"
              hint="Anfragen aus dem Buchungsformular der Website erscheinen hier."
            />
          )
        )}
      </div>
    </DashboardLayout>
  );
}
