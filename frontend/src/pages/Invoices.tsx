import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Types matching backend shape from routes/api_routes.py (list endpoint suggestion)
// Extend as your backend returns more fields
interface AdminInvoice {
  id: number;
  artist_id: number;
  storage_path: string;
  status?: 'uploaded' | 'verified' | 'paid' | 'rejected' | string;
  amount_cents?: number | null;
  currency?: string | null;
  invoice_date?: string | null; // ISO date
  created_at?: string | null;
  updated_at?: string | null;
  // optional denormalized fields from backend for convenience
  artist_name?: string;
  artist_email?: string;
}

type SortKey = 'created_at' | 'invoice_date' | 'amount_cents' | 'status' | 'artist_name';

const BACKEND = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '').trim();

export default function AdminInvoicesPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'uploaded' | 'verified' | 'paid' | 'rejected'>('all');
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
        throw new Error('VITE_BACKEND_URL (oder VITE_API_URL) ist nicht gesetzt');
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
        throw new Error('VITE_BACKEND_URL (oder VITE_API_URL) ist nicht gesetzt');
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
      // optimistic refresh
      await fetchAll();
    } catch (e: any) {
      console.error('[AdminInvoices] patch error', e);
      setError(e?.message || 'Aktion fehlgeschlagen');
    }
  }

  useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, [token]);


  async function openInvoice(id: number) {
  if (!token) return;
  try {
    if (!BACKEND) throw new Error('VITE_BACKEND_URL (oder VITE_API_URL) ist nicht gesetzt');
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


  const SortHeader: React.FC<{ k: SortKey; label: string }> = ({ k, label }) => (
    <button
      className="flex items-center gap-1 hover:underline"
      onClick={() => {
        if (sortKey === k) {
          setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        } else {
          setSortKey(k);
          setSortDir('desc');
        }
      }}
      title={`Nach ${label} sortieren`}
    >
      <span>{label}</span>
      {sortKey === k && <span className="text-xs opacity-70">{sortDir === 'asc' ? '▲' : '▼'}</span>}
    </button>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Rechnungen (Admin)</h1>

      {!BACKEND && (
        <div className="mt-2 p-2 border border-amber-400 text-amber-200 rounded bg-amber-950/20">
          Hinweis: BACKEND-URL ist nicht gesetzt. Bitte <code>VITE_BACKEND_URL</code> (oder <code>VITE_API_URL</code>) in der Frontend <code>.env</code> eintragen.
        </div>
      )}

      {/* Toolbar */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Suche: Künstler, E-Mail, Dateiname"
          className="px-3 py-2 rounded border border-white/20 bg-transparent text-white placeholder:text-white/50 min-w-[260px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 rounded border border-white/20 bg-transparent text-white"
        >
          <option value="all" className="bg-black">Alle Status</option>
          <option value="uploaded" className="bg-black">Hochgeladen</option>
          <option value="verified" className="bg-black">Geprüft</option>
          <option value="paid" className="bg-black">Bezahlt</option>
          <option value="rejected" className="bg-black">Abgelehnt</option>
        </select>
        <button
          onClick={fetchAll}
          className="ml-auto px-3 py-2 rounded border border-white/20 hover:bg-white/10 text-white"
        >Neu laden</button>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded border border-red-400 text-red-200 bg-red-950/20">
          {error}
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-white/90 min-w-[800px]">
          <thead>
            <tr className="border-b border-white/10 text-white">
              <th className="py-2 pr-4"><SortHeader k="created_at" label="Hochgeladen" /></th>
              <th className="py-2 pr-4"><SortHeader k="artist_name" label="Künstler" /></th>
              <th className="py-2 pr-4">Datei</th>
              <th className="py-2 pr-4"><SortHeader k="invoice_date" label="Rechnungsdatum" /></th>
              <th className="py-2 pr-4"><SortHeader k="amount_cents" label="Betrag" /></th>
              <th className="py-2 pr-4"><SortHeader k="status" label="Status" /></th>
              <th className="py-2 pr-4">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-6 text-center text-white/70">Lade…</td></tr>
            ) : sorted.length === 0 ? (
              <tr><td colSpan={7} className="py-6 text-center text-white/70">Keine Rechnungen gefunden</td></tr>
            ) : (
              sorted.map(inv => (
                <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 pr-4 whitespace-nowrap">{fmtDate(inv.created_at)}</td>
                  <td className="py-2 pr-4">
                    <div className="font-medium">{inv.artist_name || `Artist #${inv.artist_id}`}</div>
                    <div className="text-xs text-white/60">{inv.artist_email || '—'}</div>
                  </td>
                  <td className="py-2 pr-4 max-w-[320px]">
                    <div className="truncate" title={inv.storage_path}>{inv.storage_path}</div>
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">{fmtDate(inv.invoice_date)}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{fmtAmount(inv.amount_cents, inv.currency || 'EUR')}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <span className={
                      inv.status === 'paid' ? 'text-green-300' :
                      inv.status === 'rejected' ? 'text-red-300' :
                      inv.status === 'verified' ? 'text-amber-300' : 'text-white/80'
                    }>
                      {inv.status || 'uploaded'}
                    </span>
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap flex items-center gap-2">
                    <button
                      onClick={() => openInvoice(inv.id)}
                      className="px-2 py-1 rounded border border-white/20 hover:bg-white/10"
                      title="Datei öffnen"
                    >Öffnen</button>

                    {inv.status !== 'paid' && (
                      <button
                        onClick={() => patchInvoice(inv.id, { status: 'paid' })}
                        className="px-2 py-1 rounded border border-white/20 hover:bg-white/10"
                        title="Als bezahlt markieren"
                      >Bezahlt</button>
                    )}
                    {inv.status !== 'verified' && (
                      <button
                        onClick={() => patchInvoice(inv.id, { status: 'verified' })}
                        className="px-2 py-1 rounded border border-white/20 hover:bg-white/10"
                        title="Als geprüft markieren"
                      >Geprüft</button>
                    )}
                    {inv.status !== 'rejected' && (
                      <button
                        onClick={() => patchInvoice(inv.id, { status: 'rejected' })}
                        className="px-2 py-1 rounded border border-white/20 hover:bg-white/10"
                        title="Ablehnen"
                      >Ablehnen</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
