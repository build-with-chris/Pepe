import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Users, XCircle } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/dashboard/PageState';

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
  // `adminOffers` stand hier als State, wurde aber nur in einer Debug-Ausgabe
  // gelesen. Das gesuchte Angebot wird im Ladevorgang direkt aus der Antwort
  // herausgesucht (`offers.find`), eine eigene Ablage braucht es nicht.
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
        const targetIdNum = Number(reqId);
        const reqData = reqList.find((r: any) => Number(r.id) === targetIdNum);
        if (!reqData) {
          throw new Error(`Anfrage ${reqId} nicht gefunden.`);
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
        // Map per-artist Status & gesendete Gage → { [artist_id]: status } & { [artist_id]: requested_gage }
        if (Array.isArray(artistStatusesList)) {
          const mapStatus: Record<number, string> = {};
          const mapGage: Record<number, number | null> = {};
          for (const row of artistStatusesList) {
            if (!row) continue;
            const idNum = Number((row as any).artist_id);
            if (!Number.isFinite(idNum)) continue;
            mapStatus[idNum] = (row as any).status;
            mapGage[idNum] = ((row as any).requested_gage ?? null);
          }
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

  const backButton = (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Zurück
    </button>
  );

  if (loading) {
    return (
      <DashboardLayout title="Angebot bearbeiten" actions={backButton}>
        <LoadingSkeleton rows={2} />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Angebot bearbeiten" actions={backButton}>
        <ErrorState message={error} />
      </DashboardLayout>
    );
  }

  // Typed artistIds to avoid implicit any in map
  const artistIds: number[] = Array.isArray(requestData?.artist_ids)
    ? (requestData.artist_ids as number[])
    : [];

  const details: { label: string; value: React.ReactNode }[] = [
    { label: 'Veranstalter', value: requestData.client_name },
    { label: 'Datum', value: requestData.event_date },
    { label: 'Uhrzeit', value: requestData.event_time },
    { label: 'Adresse', value: requestData.event_address },
    { label: 'Event-Typ', value: requestData.event_type },
    { label: 'Show-Typ', value: requestData.show_type },
    { label: 'Disziplin', value: requestData.show_discipline },
    { label: 'Dauer', value: `${requestData.duration_minutes} Minuten` },
    { label: 'Gäste', value: requestData.number_of_guests },
    { label: 'Team-Größe', value: requestData.team_size },
    { label: 'Indoor', value: requestData.is_indoor ? 'Ja' : 'Nein' },
    { label: 'Beleuchtung', value: requestData.needs_light ? 'Ja' : 'Nein' },
    { label: 'Ton', value: requestData.needs_sound ? 'Ja' : 'Nein' },
    {
      label: 'Empf. Preis max.',
      value: `${Number(recMax ?? 0).toLocaleString('de-DE')} €`,
    },
    {
      label: 'Angefragte Künstler',
      value: artistIds.map((id) => artistNameById[id] ?? id).join(', ') || '–',
    },
    { label: 'Besondere Wünsche', value: requestData.special_requests || '–' },
  ];

  return (
    <DashboardLayout title="Angebot bearbeiten" actions={backButton}>
      {/* Event-Details als Beschreibungsliste. Vorher waren es 17 Absaetze der
          Form `<strong>Label:</strong> Wert` — auf dem Handy eine Textwand, in
          der man nichts fand. */}
      <section
        aria-labelledby="event-details-heading"
        className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"
      >
        <h2 id="event-details-heading" className="text-lg font-semibold text-white">
          Event-Details
        </h2>
        <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {details.map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <dt className="text-xs uppercase tracking-wider text-gray-500">{label}</dt>
              <dd className="mt-1 break-words text-sm text-gray-100">{value ?? '–'}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Angebot an den Kunden.
          Diese Felder fehlten. `handleSubmit` gab es schon, war aber an nichts
          gebunden: kein Formular, kein Knopf, kein onSubmit. Die Seite hiess
          „Angebot bearbeiten" und konnte nichts speichern. */}
      <form
        onSubmit={handleSubmit}
        aria-labelledby="offer-heading"
        className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"
      >
        <h2 id="offer-heading" className="text-lg font-semibold text-white">
          Angebot an den Kunden
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <label htmlFor="offer-price" className="block text-sm font-medium text-gray-200">
              Kundenpreis
            </label>
            <div className="relative mt-1.5">
              <input
                id="offer-price"
                type="number"
                min={0}
                step={10}
                inputMode="decimal"
                value={gage}
                onChange={(e) => setGage(Number(e.target.value))}
                aria-describedby="offer-price-hint"
                className="w-full rounded-lg border border-white/10 bg-pepe-surface py-2.5 pl-3 pr-9 text-sm tabular-nums text-white focus:border-pepe-gold focus:outline-none focus:ring-1 focus:ring-pepe-gold"
              />
              <span
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                aria-hidden="true"
              >
                €
              </span>
            </div>
            <p id="offer-price-hint" className="mt-1.5 text-xs text-gray-500">
              Empfehlung {Number(recMin ?? 0).toLocaleString('de-DE')} € bis{' '}
              {Number(recMax ?? 0).toLocaleString('de-DE')} €
            </p>
          </div>

          <div>
            <label htmlFor="offer-notes" className="block text-sm font-medium text-gray-200">
              Anmerkung <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              id="offer-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Interne Notiz zu diesem Angebot"
              className="mt-1.5 min-h-[76px] w-full resize-y rounded-lg border border-white/10 bg-pepe-surface px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-pepe-gold focus:outline-none focus:ring-1 focus:ring-pepe-gold"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-pepe-gold px-4 py-2.5 text-sm font-semibold text-pepe-black transition-colors hover:bg-pepe-gold-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold focus-visible:ring-offset-2 focus-visible:ring-offset-pepe-coal"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Angebot speichern
          </button>
        </div>
      </form>

      <section aria-labelledby="artist-offers-heading" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="artist-offers-heading" className="text-lg font-semibold text-white">
            Künstler-Angebote
          </h2>
          <button
            type="button"
            onClick={handleBulkCancel}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!artistIds.length}
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Alle stornieren
          </button>
        </div>

        {artistIds.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Keine Künstler angefragt"
            hint="Zu dieser Anfrage sind keine Künstler hinterlegt."
          />
        ) : (
          artistIds.map((artistId: number) => {
            const sentGage =
              artistGages[artistId] ??
              (artistIds.length === 1 ? requestData?.artist_gage : null);
            const status = artistStatuses[artistId] ?? 'angefragt';
            const remark = artistRemarks[artistId] ?? '';
            const remarkMissing = status === 'abgelehnt' && !remark.trim();
            // Eigene IDs je Künstler, sonst zeigen alle Beschriftungen auf das
            // erste Feld und ein Klick darauf springt in die falsche Karte.
            const statusId = `status-${artistId}`;
            const remarkId = `remark-${artistId}`;
            const remarkErrorId = `remark-error-${artistId}`;

            return (
              <div
                key={artistId}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-medium text-white">
                    {artistNameById[artistId] ?? `Künstler ${artistId}`}
                  </h3>
                  {sentGage != null ? (
                    <p className="text-sm text-gray-300">
                      Gesendete Gage{' '}
                      <span className="font-semibold tabular-nums text-white">
                        {Number(sentGage).toLocaleString('de-DE')} €
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">Noch keine Gage gesendet</p>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div>
                    <label htmlFor={statusId} className="block text-sm font-medium text-gray-200">
                      Status
                    </label>
                    <select
                      id={statusId}
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-pepe-surface px-3 py-2.5 text-sm text-white focus:border-pepe-gold focus:outline-none focus:ring-1 focus:ring-pepe-gold"
                      value={status}
                      onChange={(e) => handleArtistStatusChange(artistId, e.target.value)}
                    >
                      {allowedStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor={remarkId} className="block text-sm font-medium text-gray-200">
                      Bemerkung an den Künstler
                    </label>
                    <textarea
                      id={remarkId}
                      className="mt-1.5 min-h-[76px] w-full resize-y rounded-lg border border-white/10 bg-pepe-surface px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-pepe-gold focus:outline-none focus:ring-1 focus:ring-pepe-gold"
                      placeholder="z. B. Termin bereits vergeben, Stil passt nicht zum Event, logistisch nicht machbar"
                      value={remark}
                      onChange={(e) =>
                        setArtistRemarks((prev) => ({ ...prev, [artistId]: e.target.value }))
                      }
                      aria-invalid={remarkMissing || undefined}
                      aria-describedby={remarkMissing ? remarkErrorId : undefined}
                    />
                    {remarkMissing && (
                      <p id={remarkErrorId} className="mt-1.5 text-xs text-red-400">
                        Bei einer Ablehnung ist eine kurze Bemerkung erforderlich.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </DashboardLayout>
  );
}
