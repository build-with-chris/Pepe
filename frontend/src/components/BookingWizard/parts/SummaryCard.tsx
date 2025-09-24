import React from 'react';
import { useTranslation } from 'react-i18next';
import type { BookingData } from '../types';

const translateDiscipline = (t: any, d?: string) => {
  if (!d) return '';
  const key = `artists.disciplines.${String(d)}`;
  const translated = t(key);
  return translated === key ? d : translated;
};

const translateEventType = (t: any, v?: string) => {
  if (!v) return '';
  const raw = String(v).trim();

  // 1) Try exact key path first
  let key = `booking.eventType.options.${raw}`;
  let translated = t(key);
  if (translated !== key) return translated;

  // 2) lowercase
  const lower = raw.toLowerCase();
  key = `booking.eventType.options.${lower}`;
  translated = t(key);
  if (translated !== key) return translated;

  // 3) alias mapping (normalize by removing spaces/underscores)
  const squashed = lower.replace(/[\s_]+/g, '');
  const aliasMap: Record<string, string> = {
    // corporate
    'firmenfeier': 'corporate',  
    'kulturevent': 'streetshow',
  };
  const alias = aliasMap[squashed] || aliasMap[lower];
  if (alias) {
    key = `booking.eventType.options.${alias}`;
    translated = t(key);
    if (translated !== key) return translated;
  }

  // 4) final fallback: show original value
  return v;
};

const translateShowType = (t: any, v?: string) => {
  if (!v) return '';
  const raw = String(v).trim();
  // expected keys: liveInteraction, stageShow
  let key = `booking.showType.options.${raw}`;
  let translated = t(key);
  if (translated !== key) return translated;

  const lower = raw.toLowerCase();
  key = `booking.showType.options.${lower}`;
  translated = t(key);
  if (translated !== key) return translated;

  // map common variants to canonical keys
  const map: Record<string, string> = {
    'live interaction': 'liveInteraction',
    'live_interaction': 'liveInteraction',
    'stage show': 'stageShow',
    'stage_show': 'stageShow',
  };
  const alias = map[lower] || map[lower.replace(/[\s]+/g, ' ')] || map[lower.replace(/[\s_]+/g, '_')];
  if (alias) {
    key = `booking.showType.options.${alias}`;
    translated = t(key);
    if (translated !== key) return translated;
  }

  // final fallback
  return v;
};

const translateTeamSize = (t: any, v: any) => {
  if (v === undefined || v === null) return '';
  const n = Number(v);
  if (!Number.isNaN(n)) {
    if (n === 1) return t('booking.teamSizes.solo', 'Solo');
    if (n === 2) return t('booking.teamSizes.duo', 'Duo');
    if (n >= 3) return t('booking.teamSizes.group', 'Gruppe');
  }
  // fallback string mapping
  const s = String(v).toLowerCase();
  if (s.includes('solo')) return t('booking.teamSizes.solo', 'Solo');
  if (s.includes('duo')) return t('booking.teamSizes.duo', 'Duo');
  if (s.includes('group') || s.includes('gruppe') || s.includes('trio')) return t('booking.teamSizes.group', 'Gruppe');
  return v;
};

import { CalendarDays, ListChecks, Users, Clock, MapPin, Lightbulb, Mic, Star, User as UserIcon, Mail } from 'lucide-react';

interface SummaryCardProps {
  data: BookingData;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 bg-white border border-gray-200/70 rounded-2xl shadow-sm p-5 sm:p-6 break-words">
    <h3 className="text-xl font-semibold mb-4 text-black ">{t('booking.showtime.summary.title')}</h3>
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-stone-700 break-words">
      <div>
        <dt className="font-semibold text-gray-800 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-blue-600" /> {t('booking.showtime.summary.labels.eventType', 'Eventtyp')}</dt>
        <dd>{translateEventType(t, data.event_type)}</dd>
      </div>
      <div>
        <dt className="font-semibold text-gray-800 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-blue-600" /> {t('booking.showtime.summary.labels.showType', 'Show-Typ')}</dt>
        <dd>{translateShowType(t, data.show_type)}</dd>
      </div>
      <div>
        <dt className="font-semibold text-gray-800 flex items-center gap-2"><ListChecks className="h-4 w-4 text-blue-600" /> {t('booking.showtime.summary.labels.disciplines')}</dt>
        <dd>{(data.disciplines || []).map((d) => translateDiscipline(t, d)).join(', ')}</dd>
      </div>
      <div>
        <dt className="font-semibold text-gray-800 flex items-center gap-2"><Users className="h-4 w-4 text-blue-600" /> {t('booking.showtime.summary.labels.teamSize')}</dt>
        <dd>{translateTeamSize(t, data.team_size)}</dd>
      </div>
      <div>
        <dt className="font-semibold text-gray-800 flex items-center gap-2"><Clock className="h-4 w-4 text-blue-600" /> {t('booking.showtime.summary.labels.duration')}</dt>
        <dd>{data.duration_minutes}{' ' + t('booking.showtime.summary.minutes')}</dd>
      </div>
      <div>
        <dt className="font-semibold text-gray-800 flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" /> {t('booking.showtime.summary.labels.address')}</dt>
        <dd>{data.event_address}</dd>
      </div>
      <div>
        <dt className="font-semibold text-gray-800 flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" /> {t('booking.showtime.summary.labels.venueType')}</dt>
        <dd>{data.is_indoor ? t('booking.showtime.summary.indoor') : t('booking.showtime.summary.outdoor')}</dd>
      </div>
      <div>
        <dt className="font-semibold text-gray-800 flex items-center gap-2"><Clock className="h-4 w-4 text-blue-600" /> {t('booking.showtime.summary.labels.datetime')}</dt>
        <dd>{data.event_date}{' ' + t('booking.showtime.summary.at') + ' '}{data.event_time}</dd>
      </div>
      {data.needs_light && (
        <div>
          <dt className="font-semibold text-gray-800 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-blue-600" /> {t('booking.showtime.summary.labels.light')}</dt>
          <dd>{t('common.yes')}</dd>
        </div>
      )}
      {data.needs_sound && (
        <div>
          <dt className="font-semibold text-gray-800 flex items-center gap-2"><Mic className="h-4 w-4 text-blue-600" /> {t('booking.showtime.summary.labels.sound')}</dt>
          <dd>{t('common.yes')}</dd>
        </div>
      )}
      <div className="md:col-span-2">
        <dt className="font-semibold text-gray-800 flex items-center gap-2"><Star className="h-4 w-4 text-blue-600" /> {t('booking.showtime.summary.labels.special')}</dt>
        <dd>{data.special_requests || t('booking.showtime.summary.none')}</dd>
      </div>
      <div>
        <dt className="font-semibold text-gray-800 flex items-center gap-2"><UserIcon className="h-4 w-4 text-blue-600" /> {t('booking.showtime.summary.labels.name')}</dt>
        <dd>{data.client_name}</dd>
      </div>
      <div>
        <dt className="font-semibold text-gray-800 flex items-center gap-2"><Mail className="h-4 w-4 text-blue-600" /> {t('booking.showtime.summary.labels.email')}</dt>
        <dd className="break-all">{data.client_email}</dd>
      </div>
    </dl>
  </div>
  )
}
export default SummaryCard;