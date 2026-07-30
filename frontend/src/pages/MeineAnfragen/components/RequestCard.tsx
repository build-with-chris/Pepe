import * as React from 'react';
import clsx from 'clsx';
import { Check, Clock, MapPin, Users, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  eventCity,
  formatDateTimeDE,
  formatEventDateTime,
  formatMoney,
  getReceivedAt,
} from '@/utils/dates';

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

/** Rückmeldung zu einer Karte, statt eines alert()-Fensters. */
export type RequestNotice = { kind: 'success' | 'error'; text: string };

export type RequestCardProps = {
  request: Anfrage;
  /** controlled input value for offer field */
  offerInput: string;
  /** called when the offer input changes */
  onOfferChange: (id: Anfrage['id'], value: string) => void;
  /** called to submit an offer */
  onSendOffer: (id: Anfrage['id'], price: number) => void | Promise<unknown>;
  /** disable send while submitting */
  submitting?: boolean;
  notice?: RequestNotice | null;
  className?: string;
};

const STATUS_STYLES: Record<string, { className: string; label: string }> = {
  angefragt: { className: 'border-pepe-gold/40 bg-pepe-gold/15 text-pepe-gold', label: 'Angebot offen' },
  angeboten: { className: 'border-sky-500/40 bg-sky-500/10 text-sky-200', label: 'Angebot gesendet' },
  akzeptiert: { className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200', label: 'Zugesagt' },
  abgelehnt: { className: 'border-white/15 bg-white/5 text-gray-400', label: 'Abgelehnt' },
  storniert: { className: 'border-white/15 bg-white/5 text-gray-400', label: 'Storniert' },
};

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const s = String(status || '').toLowerCase();
  const { t } = useTranslation();
  // „angefragt" ist der Zustand, der etwas vom Künstler verlangt — der bekommt
  // deshalb die Akzentfarbe. Vorher war er das unauffälligste Grau der Karte.
  const style = STATUS_STYLES[s] ?? {
    className: 'border-white/15 bg-white/5 text-gray-300',
    label: status || '—',
  };
  return (
    <span
      className={clsx(
        'inline-flex flex-shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        style.className
      )}
    >
      {t(`requests.status.${s || 'unknown'}`, { defaultValue: style.label })}
    </span>
  );
};

/** Ein Fakt mit Symbol. Auf schmalen Schirmen untereinander, sonst in einer Reihe. */
const Fact: React.FC<{ icon: React.ElementType; children: React.ReactNode }> = ({
  icon: Icon,
  children,
}) => (
  <span className="flex min-w-0 items-start gap-1.5 text-sm text-gray-300">
    <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" aria-hidden="true" />
    <span className="min-w-0 break-words">{children}</span>
  </span>
);

const OfferPanel: React.FC<{
  request: Anfrage;
  value: string;
  onChange: (id: Anfrage['id'], v: string) => void;
  onSubmit: (id: Anfrage['id'], price: number) => void | Promise<unknown>;
  submitting?: boolean;
}> = ({ request, value, onChange, onSubmit, submitting }) => {
  const { t } = useTranslation();
  const id = request.id;
  const min = request.recommended_price_min;
  const max = request.recommended_price_max;
  const inputId = `offer-${id}`;
  const hintId = `offer-hint-${id}`;

  const num = Number(value);
  const valid = value.trim() !== '' && Number.isFinite(num) && num > 0;

  // Schnellwahl statt Vorbelegung. Das Feld war mit `recommended_price_min`
  // vorbelegt, also mit dem *niedrigsten* Wert der Empfehlung — ein Klick auf
  // „Senden" verschenkte damit Geld. Leer lassen und die Spanne anbieten heisst:
  // Der Künstler entscheidet, und zwar mit einem Antippen.
  const quick = [
    typeof min === 'number' ? { label: 'Minimum', value: min } : null,
    typeof min === 'number' && typeof max === 'number'
      ? { label: 'Mitte', value: Math.round((min + max) / 2) }
      : null,
    typeof max === 'number' ? { label: 'Maximum', value: max } : null,
  ].filter(Boolean) as { label: string; value: number }[];

  return (
    <div className="mt-5 border-t border-white/10 pt-5">
      <label htmlFor={inputId} className="block text-sm font-medium text-white">
        {t('requests.offer.label', { defaultValue: 'Deine Gage für diesen Auftritt' })}
      </label>

      {quick.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {quick.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => onChange(id, String(q.value))}
              className={clsx(
                'rounded-full border px-3 py-1.5 text-xs font-medium tabular-nums transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold',
                Number(value) === q.value
                  ? 'border-pepe-gold/50 bg-pepe-gold/15 text-pepe-gold'
                  : 'border-white/15 text-gray-300 hover:bg-white/5 hover:text-white'
              )}
            >
              {q.label} · {formatMoney(q.value)}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <div className="relative sm:w-52">
          <input
            id={inputId}
            type="number"
            min={1}
            step={10}
            inputMode="decimal"
            aria-describedby={hintId}
            className="w-full rounded-lg border border-white/15 bg-pepe-surface py-2.5 pl-3 pr-9 text-white tabular-nums placeholder:text-gray-600 focus:border-pepe-gold focus:outline-none focus:ring-1 focus:ring-pepe-gold"
            placeholder={t('requests.offer.placeholder', { defaultValue: 'Betrag' })}
            value={value}
            onChange={(e) => onChange(id, e.target.value)}
          />
          <span
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            aria-hidden="true"
          >
            €
          </span>
        </div>
        <button
          type="button"
          disabled={submitting || !valid}
          onClick={() => {
            if (!valid) return;
            void onSubmit(id, num);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-pepe-gold px-4 py-2.5 text-sm font-semibold text-pepe-black transition-colors hover:bg-pepe-gold-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold focus-visible:ring-offset-2 focus-visible:ring-offset-pepe-coal disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? t('requests.offer.submitting', { defaultValue: 'Sende…' })
            : t('requests.offer.send', { defaultValue: 'Angebot senden' })}
        </button>
      </div>

      <p id={hintId} className="mt-2 text-xs text-gray-500">
        {t('requests.offer.hint', {
          defaultValue:
            'Die Agentur prüft dein Angebot und meldet sich beim Kunden. Du kannst es danach nicht mehr selbst ändern.',
        })}
      </p>
    </div>
  );
};

export default function RequestCard({
  request,
  offerInput,
  onOfferChange,
  onSendOffer,
  submitting,
  notice,
  className,
}: RequestCardProps) {
  const { t } = useTranslation();

  const status = String(request.status || '').toLowerCase();
  // Nur im Zustand „angefragt". Vorher stand hier zusaetzlich
  // `|| activeTab === 'aktion'`, wodurch das Feld auch bei einer bereits
  // zugesagten Anfrage erschienen waere, sobald der Filter sich aendert.
  const showOfferPanel = status === 'angefragt';

  const title = [request.event_type, request.show_type].filter(Boolean).join(' · ');
  const city = eventCity(request.event_address);

  return (
    <div
      className={clsx(
        'rounded-2xl border bg-white/5 p-4 text-white sm:p-5',
        // Was Aufmerksamkeit braucht, hebt sich ab.
        status === 'angefragt' ? 'border-pepe-gold/25' : 'border-white/10',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold sm:text-xl">
            {title || t('requests.card.untitled', { defaultValue: 'Anfrage' })}
          </h3>
          {/* Das Wichtigste zuerst: Wann und wo. Vorher stand das Datum weiter
              unten in einer Tabelle mit sechs gleich gewichteten Zeilen. */}
          <p className="mt-1 font-medium text-gray-200">
            {formatEventDateTime(request.event_date, request.event_time)}
            {city ? ` · ${city}` : ''}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
        {request.event_address && <Fact icon={MapPin}>{request.event_address}</Fact>}
        {typeof request.duration_minutes === 'number' && (
          <Fact icon={Clock}>{request.duration_minutes} Minuten</Fact>
        )}
        {typeof request.number_of_guests === 'number' && (
          <Fact icon={Users}>{request.number_of_guests} Gäste</Fact>
        )}
        <Fact icon={request.is_indoor ? Check : XCircle}>
          {request.is_indoor
            ? t('requests.meta.indoor', { defaultValue: 'Indoor' })
            : t('requests.meta.outdoor', { defaultValue: 'Outdoor' })}
        </Fact>
      </div>

      {request.show_discipline && (
        <p className="mt-3 text-sm text-gray-400">
          <span className="text-gray-500">
            {t('requests.meta.disciplines', { defaultValue: 'Disziplinen' })}:{' '}
          </span>
          {request.show_discipline}
        </p>
      )}

      {request.special_requests && (
        <p className="mt-3 rounded-lg bg-white/5 p-3 text-sm text-gray-300">
          <span className="text-gray-500">
            {t('requests.meta.specialRequests', { defaultValue: 'Besondere Wünsche' })}:{' '}
          </span>
          {request.special_requests}
        </p>
      )}

      {request.admin_comment && (
        <p className="mt-3 rounded-lg border border-sky-500/25 bg-sky-500/10 p-3 text-sm text-sky-100">
          <span className="text-sky-300/80">Anmerkung der Agentur: </span>
          {request.admin_comment}
        </p>
      )}

      {/* Empfehlung und gesendete Gage */}
      <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <span className="text-sm text-gray-400">
          {t('requests.price.recommended', { defaultValue: 'Empfohlene Gage' })}:{' '}
          <span className="font-medium tabular-nums text-white">
            {formatMoney(request.recommended_price_min)} –{' '}
            {formatMoney(request.recommended_price_max)}
          </span>
        </span>
        {typeof request.artist_gage === 'number' && (
          <span className="text-sm text-gray-400">
            {t('requests.price.offered', { defaultValue: 'Gesendet' })}:{' '}
            <span className="font-semibold tabular-nums text-emerald-300">
              {formatMoney(request.artist_gage)}
            </span>
          </span>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        {t('requests.receivedAt', { defaultValue: 'Eingegangen am' })}:{' '}
        {formatDateTimeDE(getReceivedAt(request))}
      </p>

      {showOfferPanel && (
        <OfferPanel
          request={request}
          value={offerInput}
          onChange={onOfferChange}
          onSubmit={onSendOffer}
          submitting={submitting}
        />
      )}

      {/* Rückmeldung an der Karte, nicht als alert()-Fenster. aria-live, damit
          Screenreader sie mitbekommen. */}
      {notice && (
        <p
          aria-live="polite"
          className={clsx(
            'mt-4 rounded-lg border p-3 text-sm',
            notice.kind === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
          )}
        >
          {notice.text}
        </p>
      )}
    </div>
  );
}
