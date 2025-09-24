import * as React from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { formatDateTimeDE, getReceivedAt } from "@/utils/dates";

// --- Types (local, aligned with your API shape) ---
export type Anfrage = {
  id: string | number;
  event_type?: string;
  show_type?: string;
  show_discipline?: string;
  event_date?: string;      // YYYY-MM-DD
  event_time?: string;      // HH:MM[:SS]
  event_address?: string;
  duration_minutes?: number;
  number_of_guests?: number;
  is_indoor?: boolean;
  recommended_price_min?: number;
  recommended_price_max?: number;
  special_requests?: string;
  status?: string;          // "angefragt" | "angeboten" | ...
  artist_gage?: number;     // offered price
  admin_comment?: string;
};

export type RequestCardProps = {
  request: Anfrage;
  /** which tab is active on the page, e.g. 'aktion'|'alle' */
  activeTab?: string;
  /** controlled input value for offer field */
  offerInput: string | number;
  /** called when the offer input changes */
  onOfferChange: (id: Anfrage["id"], value: string) => void;
  /** called to submit an offer */
  onSendOffer: (id: Anfrage["id"], price: number) => Promise<any>;
  /** disable send while submitting */
  submitting?: boolean;
  className?: string;
};

// --- Small helpers ---
const formatMoney = (v?: number) =>
  typeof v === "number" && !Number.isNaN(v)
    ? new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v)
    : "—";

const join = (...parts: Array<string | undefined>) => parts.filter(Boolean).join(" · ");

const getCity = (addr?: string) => {
  if (!addr) return undefined;
  const bits = addr.split(",").map((s) => s.trim());
  return bits[bits.length - 1] || addr;
};

const StatusBadge: React.FC<{ status?: string }>
  = ({ status }) => {
  const s = String(status || "").toLowerCase();
  const { t } = useTranslation();
  const color = s === "akzeptiert"
    ? "bg-green-900/30 text-green-200 border-green-700"
    : s === "abgelehnt" || s === "storniert"
    ? "bg-red-900/30 text-red-200 border-red-700"
    : s === "angeboten"
    ? "bg-amber-900/30 text-amber-200 border-amber-700"
    : "bg-slate-800 text-slate-200 border-slate-600";
  return (
    <span className={clsx("inline-flex items-center px-2 py-1 rounded border text-xs font-medium", color)}>
      {t(`requests.status.${s || 'unknown'}`, { defaultValue: status || '—' })}
    </span>
  );
};

const Row: React.FC<{ label: React.ReactNode; value: React.ReactNode }>
  = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-3 text-sm">
    <div className="col-span-1 text-white/70">{label}</div>
    <div className="col-span-2 text-white">{value}</div>
  </div>
);

const OfferPanel: React.FC<{
  id: Anfrage["id"];
  value: string | number;
  onChange: (id: Anfrage["id"], v: string) => void;
  onSubmit: (id: Anfrage["id"], price: number) => void | Promise<void>;
  submitting?: boolean;
}>
  = ({ id, value, onChange, onSubmit, submitting }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-4 flex flex-col sm:flex-row gap-3">
      <input
        type="number"
        inputMode="numeric"
        className="w-full sm:w-48 rounded-md border border-white/20 bg-transparent px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
        placeholder={t('requests.offer.placeholder', { defaultValue: 'Dein Angebot (€)' })}
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
      />
      <button
        disabled={submitting || !value}
        onClick={() => {
          const n = Number(value);
          if (!Number.isFinite(n) || n <= 0) return;
          void onSubmit(id, n);
        }}
        className={clsx(
          "inline-flex items-center justify-center rounded-md px-4 py-2 bg-blue-600 text-white",
          "hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {submitting ? t('requests.offer.submitting', { defaultValue: 'Sende…' }) : t('requests.offer.send', { defaultValue: 'Angebot senden' })}
      </button>
    </div>
  );
};

const Meta: React.FC<{ request: Anfrage }> = ({ request }) => {
  const { t } = useTranslation();
  const dateStr = request.event_date ? new Date(request.event_date + (request.event_time ? `T${request.event_time}` : "T00:00:00")).toLocaleString() : "—";
  const guests = request.number_of_guests ? `${request.number_of_guests}` : "—";
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Row label={t('requests.meta.dateTime', { defaultValue: 'Datum & Uhrzeit' })} value={dateStr} />
      <Row label={t('requests.meta.address', { defaultValue: 'Adresse' })} value={request.event_address || "—"} />
      <Row label={t('requests.meta.duration', { defaultValue: 'Dauer' })} value={request.duration_minutes ? `${request.duration_minutes} min` : "—"} />
      <Row label={t('requests.meta.guests', { defaultValue: 'Gäste' })} value={guests} />
      <Row label={t('requests.meta.location', { defaultValue: 'Ort' })} value={request.is_indoor ? t('requests.meta.indoor', { defaultValue: 'Indoor' }) : t('requests.meta.outdoor', { defaultValue: 'Outdoor' })} />
      <Row label={t('requests.meta.disciplines', { defaultValue: 'Disziplinen' })} value={request.show_discipline || "—"} />
    </div>
  );
};

const PriceSummary: React.FC<{ request: Anfrage }> = ({ request }) => {
  const { t } = useTranslation();
  const min = formatMoney(request.recommended_price_min);
  const max = formatMoney(request.recommended_price_max);
  const offered = request.artist_gage;
  return (
    <div className="mt-3 rounded-md border border-white/20 p-3">
      <div className="text-sm text-white/70">{t('requests.price.estimated', { defaultValue: 'Voraussichtlicher Preis' })}</div>
      <div className="text-lg text-white font-medium">{min} – {max}</div>
      {typeof offered === 'number' && (
        <div className="mt-2 text-sm text-green-300">
          {t('requests.price.offered', { defaultValue: 'Gesendet' })}: {formatMoney(offered)}
        </div>
      )}
    </div>
  );
};

export default function RequestCard({
  request,
  activeTab,
  offerInput,
  onOfferChange,
  onSendOffer,
  submitting,
  className,
}: RequestCardProps) {
  const { t } = useTranslation();

  const headerLeft = join(
    request.event_type,
    request.show_type,
    getCity(request.event_address)
  );

  const showOfferPanel = String(request.status || '').toLowerCase() === 'angefragt' || activeTab === 'aktion';

  return (
    <div className={clsx("rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm p-4 sm:p-5 text-white", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold">{headerLeft || t('requests.card.untitled', { defaultValue: 'Anfrage' })}</h3>
          {request.special_requests && (
            <div className="mt-1 text-sm text-white/70 line-clamp-2">
              {request.special_requests}
            </div>
          )}
          <div className="mt-1 text-xs text-white/60">
            {t('requests.receivedAt', { defaultValue: 'Eingegangen am' })}: {formatDateTimeDE(getReceivedAt(request))}
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Meta */}
      <div className="mt-4">
        <Meta request={request} />
      </div>

      {/* Price */}
      <PriceSummary request={request} />

      {/* Offer */}
      {showOfferPanel ? (
        <OfferPanel
          id={request.id}
          value={offerInput}
          onChange={onOfferChange}
          onSubmit={onSendOffer}
          submitting={submitting}
        />
      ) : null}
    </div>
  );
}
