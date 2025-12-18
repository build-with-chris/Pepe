import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Receipt, RefreshCw, ExternalLink, CheckCircle, XCircle, FileCheck, Upload, Loader2 } from 'lucide-react';

interface AdminInvoice {
  id: number;
  artist_id: number;
  storage_path: string;
  status?: 'uploaded' | 'verified' | 'paid' | 'rejected' | string;
  amount_cents?: number | null;
  currency?: string | null;
  invoice_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  artist_name?: string;
  artist_email?: string;
}

type SortKey = 'created_at' | 'invoice_date' | 'amount_cents' | 'status' | 'artist_name';

const BACKEND = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '').trim();

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 lg:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminInvoicesPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  function fmtAmount(cents?: number | null, currency?: string | null) {
    if (cents == null) return '—';
    const v = cents / 100;
    try {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: currency || 'EUR' }).format(v);
    } catch {
      return `${v.toFixed(2)} ${currency || 'EUR'}`;
    }
  }

  function fmtDate(iso?: string | null) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('de-DE');
    } catch { return iso; }
  }

  // Stats
  const stats = useMemo(() => {
    return {
      total: invoices.length,
      uploaded: invoices.filter(i => i.status === 'uploaded' || !i.status).length,
      verified: invoices.filter(i => i.status === 'verified').length,
      paid: invoices.filter(i => i.status === 'paid').length,
    };
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices
      .filter(inv => (statusFilter === 'all' ? true : (inv.status || 'uploaded') === statusFilter))
      .filter(inv => !q ||
        inv.storage_path.toLowerCase().includes(q) ||
        (inv.artist_name || '').toLowerCase().includes(q) ||
        (inv.artist_email || '').toLowerCase().includes(q)
      );
  }, [invoices, query, statusFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const get = (x: AdminInvoice) => {
        switch (sortKey) {
          case 'amount_cents': return x.amount_cents ?? -1;
          case 'status': return (x.status || '').localeCompare(b.status || '');
          case 'artist_name': return (x.artist_name || '').localeCompare(b.artist_name || '');
          case 'invoice_date': return new Date(x.invoice_date || 0).getTime();
          case 'created_at':
          default: return new Date(x.created_at || 0).getTime();
        }
      };
      const ga = get(a);
      const gb = get(b);
      if (ga < gb) return -1 * dir;
      if (ga > gb) return 1 * dir;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  async function fetchAll() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      if (!BACKEND) {
        throw new Error('VITE_API_URL ist nicht gesetzt');
      }
      const res = await fetch(`${BACKEND}/api/admin/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        redirect: 'follow',
      });
      const ct = res.headers.get('content-type') || '';
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      if (!ct.includes('application/json')) {
        const txt = await res.text();
        throw new Error(`Unerwarteter Inhaltstyp: ${ct}. Antwort: ${txt.slice(0, 200)}...`);
      }
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error('[AdminInvoices] load error', e);
      setError(e?.message || 'Konnte Rechnungen nicht laden');
    } finally {
      setLoading(false);
    }
  }

  async function patchInvoice(id: number, patch: Partial<AdminInvoice>) {
    if (!token) return;
    setError(null);
    try {
      if (!BACKEND) {
        throw new Error('VITE_API_URL ist nicht gesetzt');
      }
      const res = await fetch(`${BACKEND}/api/admin/invoices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      await fetchAll();
    } catch (e: any) {
      console.error('[AdminInvoices] patch error', e);
      setError(e?.message || 'Aktion fehlgeschlagen');
    }
  }

  useEffect(() => { fetchAll(); }, [token]);

  async function openInvoice(id: number) {
    if (!token) return;
    try {
      if (!BACKEND) throw new Error('VITE_API_URL ist nicht gesetzt');
      const res = await fetch(`${BACKEND}/api/admin/invoices/${id}/url`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      const data = await res.json();
      const url = data?.url as string | undefined;
      if (!url) throw new Error('Keine URL erhalten');
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e: any) {
      console.error('[AdminInvoices] open error', e);
      setError(e?.message || 'Konnte Datei nicht öffnen');
    }
  }

  const getStatusBadge = (status?: string) => {
    const s = status || 'uploaded';
    const styles: Record<string, string> = {
      'paid': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'rejected': 'bg-red-500/20 text-red-300 border-red-500/30',
      'verified': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'uploaded': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    };
    const labels: Record<string, string> = {
      'paid': 'Bezahlt',
      'rejected': 'Abgelehnt',
      'verified': 'Geprüft',
      'uploaded': 'Hochgeladen',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[s] || styles.uploaded}`}>
        {labels[s] || s}
      </span>
    );
  };

  return (
    <DashboardLayout title="Rechnungen">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard title="Gesamt" value={stats.total} icon={Receipt} color="bg-[#D4A574]/20" />
          <StatCard title="Hochgeladen" value={stats.uploaded} icon={Upload} color="bg-gray-500/20" />
          <StatCard title="Geprüft" value={stats.verified} icon={FileCheck} color="bg-amber-500/20" />
          <StatCard title="Bezahlt" value={stats.paid} icon={CheckCircle} color="bg-emerald-500/20" />
        </div>

        {/* Error for missing backend */}
        {!BACKEND && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm px-6 py-5 text-amber-300">
            Hinweis: VITE_API_URL ist nicht gesetzt. Bitte in der Frontend .env eintragen.
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Suche: Künstler, E-Mail, Datei..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-11 py-3 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] py-3 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="uploaded">Hochgeladen</SelectItem>
                <SelectItem value="verified">Geprüft</SelectItem>
                <SelectItem value="paid">Bezahlt</SelectItem>
                <SelectItem value="rejected">Abgelehnt</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={fetchAll}
              disabled={loading}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 py-3 px-5"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Neu laden
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm px-6 py-4 text-red-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4A574]" />
            <span className="ml-3 text-gray-400">Lade Rechnungen...</span>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Hochgeladen</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Künstler</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Datei</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Datum</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Betrag</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sorted.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-gray-500">Keine Rechnungen gefunden</td></tr>
                  ) : sorted.map(inv => (
                    <tr key={inv.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 text-gray-400 text-sm">{fmtDate(inv.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{inv.artist_name || `Artist #${inv.artist_id}`}</div>
                        <div className="text-gray-500 text-sm">{inv.artist_email || '—'}</div>
                      </td>
                      <td className="px-6 py-4 max-w-[200px]">
                        <div className="text-gray-400 text-sm truncate" title={inv.storage_path}>{inv.storage_path}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{fmtDate(inv.invoice_date)}</td>
                      <td className="px-6 py-4 text-white font-medium">{fmtAmount(inv.amount_cents, inv.currency)}</td>
                      <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openInvoice(inv.id)}
                            className="text-gray-400 hover:text-white"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          {inv.status !== 'paid' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => patchInvoice(inv.id, { status: 'paid' })}
                              className="text-emerald-400 hover:text-emerald-300"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {inv.status !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => patchInvoice(inv.id, { status: 'rejected' })}
                              className="text-red-400 hover:text-red-300"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-white/10">
              {sorted.length === 0 ? (
                <div className="py-12 text-center text-gray-500">Keine Rechnungen gefunden</div>
              ) : sorted.map(inv => (
                <div key={inv.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">{inv.artist_name || `Artist #${inv.artist_id}`}</p>
                      <p className="text-gray-500 text-sm">{inv.artist_email || '—'}</p>
                    </div>
                    {getStatusBadge(inv.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{fmtDate(inv.created_at)}</span>
                    <span className="text-white font-medium">{fmtAmount(inv.amount_cents, inv.currency)}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openInvoice(inv.id)} className="flex-1 text-gray-400 border-white/10">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Öffnen
                    </Button>
                    {inv.status !== 'paid' && (
                      <Button size="sm" onClick={() => patchInvoice(inv.id, { status: 'paid' })} className="bg-emerald-600 hover:bg-emerald-500">
                        Bezahlt
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
