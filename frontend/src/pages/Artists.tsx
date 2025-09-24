import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Artist {
  id: number;
  name: string;
  profile_image_url?: string | null;
  image_url?: string | null; // legacy fallback
  bio?: string | null;
  email?: string | null;
  address?: string | null;
  phone_number?: string | null;
  instagram?: string | null;
  disciplines?: string[];
  gallery_urls?: string[];
  approval_status?: 'pending' | 'approved' | 'rejected' | 'unsubmitted' | string;
  rejection_reason?: string | null;
  approved_at?: string | null;
  approved_by?: number | null;
  price_min?: number | null;
  price_max?: number | null;
}

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  approved: 1,
  rejected: 2,
  unsubmitted: 3,
};

export default function KuenstlerVerwaltung() {
  const { token } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // UI state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'unsubmitted'>('all');
  const [pendingFirst, setPendingFirst] = useState<boolean>(true);
  const [query, setQuery] = useState<string>('');
  const [selected, setSelected] = useState<Artist | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    let cancelled = false;

    const mapArtist = (a: any): Artist => ({
      id: a.id,
      name: a.name,
      profile_image_url: a.profile_image_url ?? a.image_url ?? null,
      image_url: a.image_url ?? null,
      bio: a.bio ?? null,
      email: a.email ?? null,
      address: a.address ?? null,
      phone_number: a.phone_number ?? null,
      instagram: a.instagram ?? null,
      disciplines: a.disciplines ?? [],
      gallery_urls: a.gallery_urls ?? [],
      approval_status: a.approval_status ?? 'approved',
      rejection_reason: a.rejection_reason ?? null,
      approved_at: a.approved_at ?? null,
      approved_by: a.approved_by ?? null,
      price_min: a.price_min ?? null,
      price_max: a.price_max ?? null,
    });

    const fetchAdminAll = async () => {
      const statuses = ['pending', 'approved', 'rejected', 'unsubmitted'];
      try {
        const results = await Promise.all(
          statuses.map(async (s) => {
            const res = await fetch(`${baseUrl}/api/admin/artists?status=${s}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error(`HTTP ${res.status} on /api/admin/artists?status=${s}`);
            const data = await res.json();
            return (data ?? []).map(mapArtist);
          })
        );
        if (!cancelled) {
          const merged = ([] as Artist[]).concat(...results);
          setArtists(merged);
          setLoading(false);
        }
      } catch (e: any) {
        console.error(e);
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      }
    };

    const fetchPublicApproved = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/artists`);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        const rawList: any[] = data.artists ?? data ?? [];
        const list: Artist[] = rawList.map(mapArtist).map(a => ({ ...a, approval_status: a.approval_status ?? 'approved' }));
        if (!cancelled) {
          setArtists(list);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      }
    };

    setLoading(true);
    setError(null);
    if (token) {
      fetchAdminAll();
    } else {
      fetchPublicApproved();
    }

    return () => {
      cancelled = true;
    };
  }, [token, baseUrl]);

  useEffect(() => {
    if (!token) return;
    fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => setSlots(data.slots || []))
      .catch(err => console.error('Fehler beim Laden der Slots:', err));
  }, [token, baseUrl]);

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = artists.filter(a =>
      (statusFilter === 'all' || (a.approval_status || 'approved') === statusFilter) &&
      (!q || a.name.toLowerCase().includes(q))
    );
    if (pendingFirst) {
      list = list.sort((a, b) => {
        const sa = STATUS_ORDER[(a.approval_status || 'approved').toLowerCase()] ?? 99;
        const sb = STATUS_ORDER[(b.approval_status || 'approved').toLowerCase()] ?? 99;
        if (sa !== sb) return sa - sb;
        return a.name.localeCompare(b.name);
      });
    } else {
      list = list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [artists, statusFilter, pendingFirst, query]);

  const statusBadge = (status?: string) => {
    const s = (status || 'approved').toLowerCase();
    const map: Record<string, string> = {
      pending: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      approved: 'bg-green-500/20 text-green-300 border border-green-500/40',
      rejected: 'bg-red-500/20 text-red-300 border border-red-500/40',
      unsubmitted: 'bg-gray-500/20 text-gray-300 border border-gray-500/40',
    };
    const label = s.charAt(0).toUpperCase() + s.slice(1);
    return <span className={`px-2 py-0.5 rounded text-xs ${map[s] || map.approved}`}>{label}</span>;
  };

  const openDetails = (artist: Artist) => setSelected(artist);
  const closeDetails = () => setSelected(null);

  const approveSelected = async () => {
    if (!selected) return;
    setActionError(null);
    setActionLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/admin/artists/${selected.id}/approve`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t}`);
      }
      const data = await res.json().catch(() => null);
      const newStatus = (data?.approval_status as string) || 'approved';
      const approvedAt = (data?.approved_at as string) || new Date().toISOString();

      // UI aktualisieren
      setSelected({ ...selected, approval_status: newStatus, approved_at: approvedAt });
      setArtists(prev =>
        prev.map(a => (a.id === selected.id ? { ...a, approval_status: newStatus, approved_at: approvedAt } : a))
      );
    } catch (e: any) {
      setActionError(e.message || 'Approve failed');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteArtist = async (artist: Artist) => {
    if (!token) return;
    const ok = window.confirm(`Artist "${artist.name}" wirklich löschen?`);
    if (!ok) return;
    setActionError(null);
    setDeletingId(artist.id);
    try {
      const res = await fetch(`${baseUrl}/api/admin/artists/${artist.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t}`);
      }
      // Entferne aus Liste und ggf. Modal schließen
      setArtists(prev => prev.filter(a => a.id !== artist.id));
      if (selected?.id === artist.id) setSelected(null);
    } catch (e: any) {
      setActionError(e.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p className="p-6 text-white">Lade Künstler...</p>;
  if (error) return <p className="p-6 text-red-500">Fehler: {error}</p>;

  return (
    <div className="w-screen bg-black min-h-screen text-white">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Künstlerverwaltung (Admin)</h1>
            <p className="text-white/70 text-sm">Übersicht aller Artists mit Status & Details</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suche nach Name…"
              className="bg-black text-white placeholder:text-white/50 border border-white/30 rounded px-3 py-2"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-black text-white border border-white/30 rounded px-3 py-2"
            >
              <option value="all">Alle Status</option>
              <option value="pending">Nur Pending</option>
              <option value="approved">Nur Approved</option>
              <option value="rejected">Nur Rejected</option>
              <option value="unsubmitted">Nur Unsubmitted</option>
            </select>
            <label className="inline-flex items-center gap-2 text-white/90">
              <input type="checkbox" checked={pendingFirst} onChange={(e) => setPendingFirst(e.target.checked)} />
              <span>Pending zuerst</span>
            </label>
          </div>
        </div>

        {actionError && (
          <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {actionError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSorted.map((artist) => (
            <button
              key={artist.id}
              className="bg-gray-800 rounded shadow-lg overflow-hidden text-left hover:ring-2 hover:ring-white/20 transition focus:outline-none"
              onClick={() => openDetails(artist)}
            >
              <div className="relative w-full aspect-square bg-gray-700">
                {artist.profile_image_url ? (
                  <img
                    src={artist.profile_image_url}
                    alt={artist.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    Kein Bild
                  </div>
                )}
                <div className="absolute top-2 left-2">{statusBadge(artist.approval_status)}</div>
                {token && (
                  <button
                    type="button"
                    title="Artist löschen"
                    onClick={(e) => { e.stopPropagation(); deleteArtist(artist); }}
                    disabled={deletingId === artist.id}
                    className="absolute top-2 right-2 rounded bg-red-600/90 px-2 py-1 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                  >
                    {deletingId === artist.id ? '…' : 'Löschen'}
                  </button>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-1 line-clamp-1">{artist.name}</h2>
                {artist.disciplines && artist.disciplines.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {artist.disciplines.slice(0, 4).map((d, i) => (
                      <span key={i} className="text-xs bg-white/10 px-2 py-0.5 rounded">{d}</span>
                    ))}
                    {artist.disciplines.length > 4 && (
                      <span className="text-xs text-white/60">+{artist.disciplines.length - 4} mehr</span>
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-300 line-clamp-3">
                  {artist.bio?.trim() || 'Keine Bio hinterlegt.'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeDetails} />
          <div className="relative bg-gray-900 text-white w-[95vw] max-w-5xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                {statusBadge(selected.approval_status)}
                <h3 className="text-xl font-semibold">{selected.name}</h3>
              </div>
             <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  {statusBadge(selected.approval_status)}
                  <h3 className="text-xl font-semibold">{selected.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {selected.approval_status !== 'approved' && (
                    <button
                      onClick={approveSelected}
                      disabled={actionLoading}
                      className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50"
                      title="Artist freigeben"
                    >
                      {actionLoading ? '…' : 'Approve'}
                    </button>
                  )}
                  <button onClick={closeDetails} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Schließen</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6 p-4 overflow-y-auto">
              {/* Bild + Galerie */}
              <div className="md:col-span-1 space-y-3">
                <div className="aspect-square bg-gray-800 rounded overflow-hidden">
                  {selected.profile_image_url ? (
                    <img src={selected.profile_image_url} alt={selected.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50">Kein Profilbild</div>
                  )}
                </div>
                {selected.gallery_urls && selected.gallery_urls.length > 0 && (
                  <div>
                    <div className="text-sm text-white/70 mb-2">Galerie</div>
                    <div className="grid grid-cols-3 gap-2">
                      {selected.gallery_urls.slice(0, 9).map((u, i) => (
                        <img key={i} src={u} className="w-full h-20 object-cover rounded" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <div className="text-sm text-white/60">Bio</div>
                  <p className="mt-1 whitespace-pre-line">{selected.bio || '—'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-white/60">Kontaktdaten</div>
                    <dl className="mt-1 space-y-1">
                      <div><dt className="text-white/60">E‑Mail</dt><dd>{selected.email || '—'}</dd></div>
                      <div><dt className="text-white/60">Telefon</dt><dd>{selected.phone_number || '—'}</dd></div>
                      <div><dt className="text-white/60">Adresse</dt><dd>{selected.address || '—'}</dd></div>
                      <div><dt className="text-white/60">Instagram</dt><dd>{selected.instagram ? (<a href={selected.instagram} target="_blank" rel="noreferrer" className="underline">{selected.instagram}</a>) : '—'}</dd></div>
                    </dl>
                  </div>

                  <div>
                    <div className="text-sm text-white/60">Status</div>
                    <dl className="mt-1 space-y-1">
                      <div><dt className="text-white/60">Freigabe</dt><dd>{(selected.approval_status || 'approved')}</dd></div>
                      {selected.rejection_reason && (<div><dt className="text-white/60">Grund (Ablehnung)</dt><dd>{selected.rejection_reason}</dd></div>)}
                      <div><dt className="text-white/60">Approved at</dt><dd>{selected.approved_at ? new Date(selected.approved_at).toLocaleString() : '—'}</dd></div>
                    </dl>
                  </div>

                  <div>
                    <div className="text-sm text-white/60">Disziplinen</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(selected.disciplines || []).length ? (
                        selected.disciplines!.map((d, i) => <span key={i} className="text-xs bg-white/10 px-2 py-0.5 rounded">{d}</span>)
                      ) : '—'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-white/60">Preisrahmen</div>
                    <div className="mt-1">{selected.price_min != null || selected.price_max != null ? (
                      <span>{selected.price_min ?? '—'} € – {selected.price_max ?? '—'} €</span>
                    ) : '—'}</div>
                  </div>
                </div>

                {/* Slots */}
                <div>
                  <div className="text-sm text-white/60">Verfügbarkeiten</div>
                  <ul className="mt-1 flex flex-wrap gap-2">
                    {slots
                      .filter((slot) => (slot.artist_id === selected.id) || (slot.artist && slot.artist.id === selected.id))
                      .slice(0, 20)
                      .map((slot) => (
                        <li key={slot.id ?? slot.date} className="text-xs bg-white/10 px-2 py-0.5 rounded">
                          {new Date(slot.date).toLocaleDateString()}
                        </li>
                      ))}
                    {(!slots || !slots.some((s)=> (s.artist_id === selected.id) || (s.artist && s.artist.id === selected.id))) && (
                      <li className="text-white/50">— keine Slots —</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
