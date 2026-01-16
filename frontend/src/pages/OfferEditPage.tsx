import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OfferEditPage() {
  const { reqId, offerId } = useParams<{ reqId: string; offerId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [gage, setGage] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [recMin, setRecMin] = useState<number>(0);
  const [recMax, setRecMax] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [requestData, setRequestData] = useState<any>(null);
  const [adminOffers, setAdminOffers] = useState<any[]>([]);
  const [artistNameById, setArtistNameById] = useState<Record<number, string>>({});
  const [artistStatuses, setArtistStatuses] = useState<Record<number, string>>({});
  const [artistGages, setArtistGages] = useState<Record<number, number | null>>({});
  const [artistRemarks, setArtistRemarks] = useState<Record<number, string>>({});

  const allowedStatuses = ['angefragt','angeboten','akzeptiert','abgelehnt','storniert'] as const;

  // Neuer Handler: Admin ändert Status für EINEN Artist (per-artist status)
  async function handleArtistStatusChange(artistId: number, newStatus: string) {
    if (!reqId) return;
    const remark = (artistRemarks[artistId] ?? '').trim();

    // Bei Ablehnung: Bemerkung erforderlich
    if (newStatus === 'abgelehnt' && remark.length === 0) {
      alert('Bitte gib eine kurze Bemerkung an, warum abgelehnt wurde.');
      // Select nicht umschalten, bis Bemerkung vorhanden
      setArtistStatuses(prev => ({ ...prev }));
      return;
    }

    console.log('🛠️ handleArtistStatusChange →', { reqId, artistId, newStatus, remark });
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/requests/${reqId}/artist_status/${artistId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          // Bemerkung mitsenden (Backend kann "remark" oder "comment" akzeptieren)
          body: JSON.stringify({ status: newStatus, remark, comment: remark }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // UI-State aktualisieren
      setArtistStatuses(prev => ({ ...prev, [artistId]: newStatus }));
    } catch (err) {
      console.error('❌ Konnte Artist-Status nicht setzen', err);
      alert('Status konnte nicht aktualisiert werden');
    }
  }

  // Bulk: Setze alle Artists dieser Anfrage auf "storniert"
  async function handleBulkCancel() {
    if (!reqId) return;
    const confirmAll = window.confirm('Willst du wirklich ALLE Artists auf "storniert" setzen?');
    if (!confirmAll) return;
    try {
      console.log('🛠️ handleBulkCancel →', { reqId });
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/requests/${reqId}/artist_status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'storniert' }), // ohne artist_ids => alle
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // UI-State: alle bekannten Artist-IDs auf 'storniert' setzen
      const ids: number[] = Array.isArray(requestData?.artist_ids) ? (requestData.artist_ids as number[]) : [];
      setArtistStatuses(prev => {
        const next = { ...prev } as Record<number, string>;
        for (const id of ids) next[id] = 'storniert';
        return next;
      });
    } catch (err) {
      console.error('❌ Bulk-Status-Update fehlgeschlagen', err);
      alert('Bulk-Status-Update fehlgeschlagen');
    }
  }

  useEffect(() => {
    if (!token || !reqId || !offerId) return;
    setLoading(true);
    // Debug: Show all fetch URLs
    const baseUrl = import.meta.env.VITE_API_URL;
    console.groupEnd();

    // Fetch all requests (ADMIN view) to get the specific booking request
    const reqsPromise = fetch(
      `${baseUrl}/api/admin/requests/all`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(async res => {
      console.log('🎯 admin requests all response status:', res.status);
      const text = await res.text().catch(() => '');
      if (!res.ok) {
        console.error('admin requests all failed:', res.status, text);
        throw new Error(`HTTP ${res.status}`);
      }
      // Try to parse JSON even if text was already read
      let json: any;
      try { json = text ? JSON.parse(text) : []; } catch (e) { json = []; }
      const list = Array.isArray(json)
        ? json
        : (json && Array.isArray(json.requests))
          ? json.requests
          : [];
      const ids = list.map((r:any) => r && r.id);
      console.log('🧾 admin requests count:', list.length, 'ids:', ids);
      if (!Array.isArray(list) || list.length === 0) {
        console.warn('⚠️ admin requests: leere Liste oder unbekanntes Format', json);
      }
      return list;
    });
    // Fetch all admin offers for this request to get override-price
    const offersPromise = fetch(
      `${baseUrl}/api/admin/requests/${reqId}/admin_offers`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(res => {
      console.log('🎯 admin_offers response status:', res.status);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    });
    // NEU: Per-Artist-Status für diese Anfrage (Admin-Route)
    const artistStatusesPromise = fetch(
      `${baseUrl}/api/admin/requests/${reqId}/artist_status`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(res => {
      console.log('🎯 artist_status response status:', res.status);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    });
    Promise.all([reqsPromise, offersPromise, artistStatusesPromise])
      .then(([reqList, offers, artistStatusesList]) => {
        // Debug: Suche Request in admin list
        console.log('🔎 Suche Request in admin list nach reqId=', reqId, 'typ:', typeof reqId);
        console.log('📦 Erstes Element der Liste (falls vorhanden):', reqList[0]);
        const targetIdNum = Number(reqId);
        const reqData = reqList.find((r: any) => Number(r.id) === targetIdNum);
        if (!reqData) {
          console.error('❌ Request not found in admin list. Available IDs:', reqList.map((r:any)=>r.id));
          throw new Error(`Request not found (id=${reqId})`);
        }
        // Set recommended customer price with fallback to price_min/max if missing
        const recMinVal = (reqData.recommended_price_min ?? reqData.price_min ?? 0);
        const recMaxVal = (reqData.recommended_price_max ?? reqData.price_max ?? 0);
        setRecMin(recMinVal);
        setRecMax(recMaxVal);
        // Determine current offer override price or fallback to recommendation
        const currentOffer = offers.find((o: any) => String(o.id) === offerId);
        const gageInit = (currentOffer?.override_price ?? recMinVal);
        setGage(Number.isFinite(gageInit) ? Number(gageInit) : 0);
        setNotes(currentOffer?.notes ?? '');
        setRequestData(reqData);
        setAdminOffers(offers);
        // Map per-artist Status & gesendete Gage → { [artist_id]: status } & { [artist_id]: requested_gage }
        if (Array.isArray(artistStatusesList)) {
          const mapStatus: Record<number, string> = {};
          const mapGage: Record<number, number | null> = {};
          for (const row of artistStatusesList) {
            if (!row) continue;
            const idNum = Number((row as any).artist_id);
            console.log('🧩 per-artist status row', row, '→ parsed artist_id:', idNum, 'raw type:', typeof (row as any).artist_id);
            if (!Number.isFinite(idNum)) continue;
            mapStatus[idNum] = (row as any).status;
            mapGage[idNum] = ((row as any).requested_gage ?? null);
          }
          console.log('🧭 mapped artistStatuses =', mapStatus);
          console.log('🧭 mapped artistGages    =', mapGage);
          setArtistStatuses(mapStatus);
          setArtistGages(mapGage);
        }
        // Fetch artist names for display
        if (reqData.artist_ids?.length) {
          fetch(`${import.meta.env.VITE_API_URL}/api/artists`)
            .then(res => res.json())
            .then((allArtists: any[]) => {
              const idsArr: number[] = Array.isArray(reqData.artist_ids) ? reqData.artist_ids : [];
              const nameMap: Record<number, string> = {};
              for (const a of allArtists) {
                if (idsArr.includes(a.id)) {
                  nameMap[a.id] = a.name;
                }
              }
              setArtistNameById(nameMap);
              // Debug log loaded data
              console.log('🔍 OfferEditPage loaded:', {
                requestData: reqData,
                adminOffers: offers,
                artistStatuses: artistStatusesList,
                artistNameById: nameMap,
                recMin,
                recMax,
                gage,
                notes
              });
            })
            .catch(err => console.error('Fehler beim Laden der Künstlernamen:', err));
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token, reqId, offerId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/admin_offers/${offerId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ override_price: gage, notes }),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      navigate(-1);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (loading) return <p className="p-6 text-white">Lade Daten...</p>;
  if (error) {
    console.error('🚨 OfferEditPage error:', error);
    return <p className="p-6 text-red-500">Fehler: {error}</p>;
  }
  // Debug log before render
  console.log('🔄 Rendering OfferEditPage with state:', {
    requestData,
    adminOffers,
    artistStatuses,
    artistGages,
    artistNameById,
    gage,
    notes
  });

  // Typed artistIds to avoid implicit any in map
  const artistIds: number[] = Array.isArray(requestData?.artist_ids)
    ? (requestData.artist_ids as number[])
    : [];

  return (
    <div className="w-screen bg-black min-h-screen text-white">
      <div className="container mx-auto p-6 max-w-6xl">
        <h1 className="text-2xl font-bold mb-4">Angebot bearbeiten</h1>
        <div className="flex flex-col gap-6">
          {/* Left: Event Details */}
          <div className="bg-gray-800 p-4 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <h2 className="text-xl font-semibold mb-4 col-span-full">Event-Details</h2>
            <p><strong>Angefragte Künstler:</strong> {artistIds.map((id) => artistNameById[id] ?? id).join(', ')}</p>
            <p><strong>Angefragte Disziplinen:</strong> {requestData.show_discipline}</p>
            <p><strong>Name Veranstalter:</strong> {requestData.client_name}</p>
            <p><strong>Dauer der Show:</strong> {requestData.duration_minutes} Minuten</p>
            <p><strong>Adresse:</strong> {requestData.event_address}</p>
            <p><strong>Datum:</strong> {requestData.event_date}</p>
            <p><strong>Uhrzeit:</strong> {requestData.event_time}</p>
            <p><strong>Event-Typ:</strong> {requestData.event_type}</p>
            <p><strong>Indoor:</strong> {requestData.is_indoor ? 'Ja' : 'Nein'}</p>
            <p><strong>Beleuchtung:</strong> {requestData.needs_light ? 'Ja' : 'Nein'}</p>
            <p><strong>Ton:</strong> {requestData.needs_sound ? 'Ja' : 'Nein'}</p>
            <p><strong>Gäste:</strong> {requestData.number_of_guests}</p>
            <p><strong>Empf. Preis Max:</strong> {Number(recMax ?? 0).toLocaleString('de-DE')}€</p>
            <p><strong>Disziplin:</strong> {requestData.show_discipline}</p>
            <p><strong>Show-Typ:</strong> {requestData.show_type}</p>
            <p><strong>Besondere Wünsche:</strong> {requestData.special_requests || '–'}</p>
            <p><strong>Team-Größe:</strong> {requestData.team_size}</p>
          </div>
          {/* Right: Artist Offers */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Artist-Angebote</h2>
              <button
                type="button"
                onClick={handleBulkCancel}
                className="px-3 py-2 rounded text-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
                disabled={!artistIds.length}
              >
                Alle stornieren
              </button>
            </div>
            {artistIds.map((artistId: number, idx: number) => {
              console.log('🔁 Rendering artist card idx:', idx, 'artistId:', artistId, 'adminOffer:', adminOffers[idx]);
              return (
              <div key={artistId} className="bg-gray-800 p-4 rounded shadow">
                <p><strong>Künstler:</strong> {artistNameById[artistId] ?? artistId}</p>
                {/* Gesendete Gage (vom Artist). Fallback: Solo-Request → requestData.artist_gage */}
                {artistGages[artistId] != null ? (
                  <p><strong>Gesendete Gage:</strong> {Number(artistGages[artistId]).toLocaleString('de-DE')}€</p>
                ) : (
                  artistIds.length === 1 && requestData?.artist_gage != null ? (
                    <p><strong>Gesendete Gage:</strong> {Number(requestData.artist_gage).toLocaleString('de-DE')}€</p>
                  ) : (
                    <p className="italic">noch keine Gage gesendet</p>
                  )
                )}
                <label className="block mt-2 font-medium">Status</label>
                <select
                  className="mt-1 w-full bg-gray-700 text-white p-2 rounded"
                  value={artistStatuses[artistId] ?? 'angefragt'}
                  onChange={e => handleArtistStatusChange(artistId, e.target.value)}
                >
                  {allowedStatuses.map(s => (
                    <option key={s} value={s} className="text-black">
                      {s}
                    </option>
                  ))}
                </select>
                {/* Bemerkung an den Künstler (bei Ablehnung erforderlich) */}
                <label className="block mt-3 text-sm font-medium">Bemerkung an den Künstler</label>
                <textarea
                  className="mt-1 w-full bg-gray-700 text-white p-2 rounded resize-y min-h-[72px]"
                  placeholder="z. B. Termin bereits vergeben / Stil passt nicht zum Event / logistisch nicht machbar"
                  value={artistRemarks[artistId] ?? ''}
                  onChange={(e) => setArtistRemarks(prev => ({ ...prev, [artistId]: e.target.value }))}
                />
                { (artistStatuses[artistId] === 'abgelehnt') && !(artistRemarks[artistId]?.trim()) && (
                  <p className="mt-1 text-xs text-red-400">Bei Ablehnung ist eine kurze Bemerkung erforderlich.</p>
                ) }
                <p className="mt-1 text-xs text-gray-400">(Status-Quelle: {artistStatuses[artistId] ? 'per-Artist' : 'Default'})</p>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
