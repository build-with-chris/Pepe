import { useEffect, useMemo, useState } from 'react';
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
import { Search, Users, CheckCircle, Clock, XCircle, FileQuestion, X, Loader2, Trash2 } from 'lucide-react';

interface Artist {
  id: number;
  name: string;
  profile_image_url?: string | null;
  image_url?: string | null;
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

export default function KuenstlerVerwaltung() {
  const { token } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('all');
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
            const res = await fetch(`${baseUrl}/admin/artists?status=${s}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error(`HTTP ${res.status} on /admin/artists?status=${s}`);
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
    fetch(`${baseUrl}/admin/dashboard`, {
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

  // Stats
  const stats = useMemo(() => {
    return {
      total: artists.length,
      pending: artists.filter(a => a.approval_status === 'pending').length,
      approved: artists.filter(a => a.approval_status === 'approved').length,
      rejected: artists.filter(a => a.approval_status === 'rejected').length,
    };
  }, [artists]);

  const statusBadge = (status?: string) => {
    const s = (status || 'approved').toLowerCase();
    const map: Record<string, string> = {
      pending: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      approved: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      rejected: 'bg-red-500/20 text-red-300 border border-red-500/40',
      unsubmitted: 'bg-gray-500/20 text-gray-300 border border-gray-500/40',
    };
    const label = s.charAt(0).toUpperCase() + s.slice(1);
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[s] || map.approved}`}>{label}</span>;
  };

  const openDetails = (artist: Artist) => setSelected(artist);
  const closeDetails = () => setSelected(null);

  const approveSelected = async () => {
    if (!selected) return;
    setActionError(null);
    setActionLoading(true);
    try {
      const res = await fetch(`${baseUrl}/admin/artists/${selected.id}/approve`, {
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

  const deleteArtist = async (artist: Artist, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!token) return;
    const ok = window.confirm(`Artist "${artist.name}" wirklich löschen?`);
    if (!ok) return;
    setActionError(null);
    setDeletingId(artist.id);
    try {
      const res = await fetch(`${baseUrl}/admin/artists/${artist.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t}`);
      }
      setArtists(prev => prev.filter(a => a.id !== artist.id));
      if (selected?.id === artist.id) setSelected(null);
    } catch (e: any) {
      setActionError(e.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout title="Künstlerverwaltung">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard title="Gesamt" value={stats.total} icon={Users} color="bg-[#D4A574]/20" />
          <StatCard title="Pending" value={stats.pending} icon={Clock} color="bg-amber-500/20" />
          <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="bg-emerald-500/20" />
          <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="bg-red-500/20" />
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-5">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Suche nach Name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-11 py-3 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] py-3 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="unsubmitted">Unsubmitted</SelectItem>
              </SelectContent>
            </Select>

            {/* Pending First Toggle */}
            <label className="hidden sm:inline-flex items-center gap-3 text-white/90 text-sm whitespace-nowrap px-2">
              <input
                type="checkbox"
                checked={pendingFirst}
                onChange={(e) => setPendingFirst(e.target.checked)}
                className="rounded border-white/20 bg-white/5 w-4 h-4"
              />
              <span>Pending zuerst</span>
            </label>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4A574]" />
            <span className="ml-3 text-gray-400">Lade Künstler...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm px-6 py-4 text-red-300">
            Fehler: {error}
          </div>
        )}

        {/* Action Error */}
        {actionError && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm px-6 py-4 text-red-300">
            {actionError}
          </div>
        )}

        {/* Artist Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {filteredSorted.map((artist) => (
              <button
                key={artist.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden text-left hover:border-[#D4A574]/30 hover:bg-white/[0.07] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50"
                onClick={() => openDetails(artist)}
              >
                <div className="relative w-full aspect-square bg-gray-800/50">
                  {artist.profile_image_url ? (
                    <img
                      src={artist.profile_image_url}
                      alt={artist.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      <Users className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">{statusBadge(artist.approval_status)}</div>
                  {token && (
                    <button
                      type="button"
                      title="Artist löschen"
                      onClick={(e) => deleteArtist(artist, e)}
                      disabled={deletingId === artist.id}
                      className="absolute top-3 right-3 rounded-lg bg-red-500/80 p-2 text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
                    >
                      {deletingId === artist.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-white mb-1 line-clamp-1">{artist.name}</h2>
                  {artist.disciplines && artist.disciplines.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {artist.disciplines.slice(0, 3).map((d, i) => (
                        <span key={i} className="text-xs bg-[#D4A574]/20 text-[#D4A574] px-2 py-0.5 rounded-full">{d}</span>
                      ))}
                      {artist.disciplines.length > 3 && (
                        <span className="text-xs text-gray-500">+{artist.disciplines.length - 3}</span>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {artist.bio?.trim() || 'Keine Bio hinterlegt.'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredSorted.length === 0 && (
          <div className="text-center py-12">
            <FileQuestion className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Keine Künstler gefunden.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeDetails} />
          <div className="relative bg-[#111111] border border-white/10 text-white w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                {statusBadge(selected.approval_status)}
                <h3 className="text-lg sm:text-xl font-semibold">{selected.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                {selected.approval_status !== 'approved' && (
                  <Button
                    onClick={approveSelected}
                    disabled={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    size="sm"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={closeDetails} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 sm:p-6">
                {/* Left Column - Image */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-800 rounded-xl overflow-hidden">
                    {selected.profile_image_url ? (
                      <img src={selected.profile_image_url} alt={selected.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <Users className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                  {selected.gallery_urls && selected.gallery_urls.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Galerie</div>
                      <div className="grid grid-cols-3 gap-2">
                        {selected.gallery_urls.slice(0, 6).map((u, i) => (
                          <img key={i} src={u} className="w-full aspect-square object-cover rounded-lg" alt="" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Details */}
                <div className="md:col-span-2 space-y-6">
                  {/* Bio */}
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Bio</div>
                    <p className="text-gray-200 whitespace-pre-line">{selected.bio || '—'}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Contact */}
                    <div className="space-y-3">
                      <div className="text-sm text-gray-400">Kontaktdaten</div>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">E-Mail</dt>
                          <dd className="text-white">{selected.email || '—'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Telefon</dt>
                          <dd className="text-white">{selected.phone_number || '—'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Adresse</dt>
                          <dd className="text-white text-right">{selected.address || '—'}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Status & Pricing */}
                    <div className="space-y-3">
                      <div className="text-sm text-gray-400">Status & Preise</div>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Status</dt>
                          <dd>{statusBadge(selected.approval_status)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Preisrahmen</dt>
                          <dd className="text-white">
                            {selected.price_min != null || selected.price_max != null
                              ? `${selected.price_min ?? '—'} € – ${selected.price_max ?? '—'} €`
                              : '—'}
                          </dd>
                        </div>
                        {selected.approved_at && (
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Approved</dt>
                            <dd className="text-white">{new Date(selected.approved_at).toLocaleDateString('de-DE')}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                  {/* Disciplines */}
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Disziplinen</div>
                    <div className="flex flex-wrap gap-2">
                      {(selected.disciplines || []).length ? (
                        selected.disciplines!.map((d, i) => (
                          <span key={i} className="text-sm bg-[#D4A574]/20 text-[#D4A574] px-3 py-1 rounded-full">{d}</span>
                        ))
                      ) : <span className="text-gray-500">—</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
