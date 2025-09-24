import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BookingData } from '../types';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

const DISCIPLINE_OPTIONS: { value: string; img: string; labelKey: string; descKey: string }[] = [
  { value: 'Zauberer', img: 'Zauberer', labelKey: 'booking.disciplines.options.zauberer.label', descKey: 'booking.disciplines.options.zauberer.description' },
  { value: 'Cyr-Wheel', img: 'Cyr-Wheel', labelKey: 'booking.disciplines.options.cyrWheel.label', descKey: 'booking.disciplines.options.cyrWheel.description' },
  { value: 'Bodenakrobatik', img: 'Bodenakrobatik', labelKey: 'booking.disciplines.options.bodenakrobatik.label', descKey: 'booking.disciplines.options.bodenakrobatik.description' },
  { value: 'Luftakrobatik', img: 'Luftakrobatik', labelKey: 'booking.disciplines.options.luftakrobatik.label', descKey: 'booking.disciplines.options.luftakrobatik.description' },
  { value: 'Partnerakrobatik', img: 'Partnerakrobatik', labelKey: 'booking.disciplines.options.partnerakrobatik.label', descKey: 'booking.disciplines.options.partnerakrobatik.description' },
  { value: 'Chinese Pole', img: 'Chinese_Pole', labelKey: 'booking.disciplines.options.chinesePole.label', descKey: 'booking.disciplines.options.chinesePole.description' },
  { value: 'Hula Hoop', img: 'Hula_Hoop', labelKey: 'booking.disciplines.options.hulaHoop.label', descKey: 'booking.disciplines.options.hulaHoop.description' },
  { value: 'Handstand', img: 'Handstand', labelKey: 'booking.disciplines.options.handstand.label', descKey: 'booking.disciplines.options.handstand.description' },
  { value: 'Contemporary Dance', img: 'Contemporary_Dance', labelKey: 'booking.disciplines.options.contemporaryDance.label', descKey: 'booking.disciplines.options.contemporaryDance.description' },
  { value: 'Breakdance', img: 'Breakdance', labelKey: 'booking.disciplines.options.breakdance.label', descKey: 'booking.disciplines.options.breakdance.description' },
  { value: 'Teeterboard', img: 'Teeterboard', labelKey: 'booking.disciplines.options.teeterboard.label', descKey: 'booking.disciplines.options.teeterboard.description' },
  { value: 'Jonglage', img: 'Jonglage', labelKey: 'booking.disciplines.options.jonglage.label', descKey: 'booking.disciplines.options.jonglage.description' },
  { value: 'Moderation', img: 'Moderation', labelKey: 'booking.disciplines.options.moderation.label', descKey: 'booking.disciplines.options.moderation.description' },
  { value: 'Pantomime', img: 'Pantomime', labelKey: 'booking.disciplines.options.pantomimeEntertainment.label', descKey: 'booking.disciplines.options.pantomimeEntertainment.description' }
];

const BACKEND_TO_OPTION_VALUE: Record<string, string> = {
  'zauberer': 'Zauberer',
  'cyr-wheel': 'Cyr-Wheel',
  'bodenakrobatik': 'Bodenakrobatik',
  'luftakrobatik': 'Luftakrobatik',
  'partnerakrobatik': 'Partnerakrobatik',
  'chinese pole': 'Chinese Pole',
  'hula hoop': 'Hula Hoop',
  'hula': 'Hula Hoop',
  'handstand': 'Handstand',
  'contemporary dance': 'Contemporary Dance',
  'contemporary': 'Contemporary Dance',
  'breakdance': 'Breakdance',
  'teeterboard': 'Teeterboard',
  'jonglage': 'Jonglage',
  'moderation': 'Moderation',
  'pantomime': 'Pantomime'
};

export interface StepDisciplinesProps {
  data: BookingData;
  onChange: (update: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const StepShowDisciplines: React.FC<StepDisciplinesProps> = ({
  data,
  onChange,
  onNext,
  onPrev,
}) => {
  const { t } = useTranslation();

  const [allowedOptionValues, setAllowedOptionValues] = useState<string[] | null>(null);
  const [loadingAllowed, setLoadingAllowed] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const didAutoAdvance = useRef(false);
  const didSanitize = useRef(false);

  useEffect(() => {
    let active = true;
    const stored = (() => { try { return localStorage.getItem('bookingTargetArtistId'); } catch { return null; } })();
    if (!stored) { setAllowedOptionValues(null); return; }
    const artistId = Number(stored);
    if (!artistId || Number.isNaN(artistId)) { setAllowedOptionValues(null); return; }

    const baseUrl = (import.meta as any).env?.VITE_API_URL || '';
    if (!baseUrl) { setAllowedOptionValues(null); return; }

    (async () => {
      try {
        setLoadingAllowed(true);
        setLoadError(null);
        const res = await fetch(`${baseUrl}/api/artists/${artistId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const a = await res.json();
        const backendDiscs: string[] = Array.isArray(a?.disciplines) ? a.disciplines : [];
        const normalized = backendDiscs.map((d) => String(d || '').trim().toLowerCase());
        const mappedValues = normalized.map((k) => BACKEND_TO_OPTION_VALUE[k]).filter(Boolean);
        if (!active) return;
        setAllowedOptionValues(mappedValues.length ? Array.from(new Set(mappedValues)) : []);

        // Sanitize any previous selections to only allowed values (prevents leakage from prior sessions)
        const allowedSet = new Set(mappedValues);
        const current = Array.isArray(data.disciplines) ? data.disciplines : [];
        const sanitized = current.filter(v => allowedSet.has(v));

        if (!didSanitize.current) {
          didSanitize.current = true;
          if (mappedValues.length === 1) {
            // Force the single allowed discipline and auto-advance
            const only = mappedValues[0];
            if (sanitized.length !== 1 || sanitized[0] !== only) {
              onChange({ disciplines: [only] });
            }
            if (!didAutoAdvance.current) {
              didAutoAdvance.current = true;
              setTimeout(() => { try { onNext(); } catch {} }, 0);
            }
          } else {
            // Multiple allowed: prune disallowed selections once
            if (sanitized.length !== current.length) {
              onChange({ disciplines: sanitized });
            }
          }
        }
      } catch (e: any) {
        if (!active) return;
        setLoadError(e?.message || 'Failed to load artist disciplines');
        setAllowedOptionValues(null);
      } finally {
        if (active) setLoadingAllowed(false);
      }
    })();

    return () => { active = false; };
  }, [data.disciplines, onChange]);

  const optionsToRender = useMemo(() => {
    if (allowedOptionValues === null) return DISCIPLINE_OPTIONS; // no targeting
    const allowedSet = new Set(allowedOptionValues);
    return DISCIPLINE_OPTIONS.filter(opt => allowedSet.has(opt.value));
  }, [allowedOptionValues]);

  const toggleDiscipline = useCallback((value: string) => {
    if (allowedOptionValues !== null) {
      const allowedSet = new Set(allowedOptionValues);
      if (!allowedSet.has(value)) return;
    }
    const selected = data.disciplines.includes(value);
    const newList = selected
      ? data.disciplines.filter(d => d !== value)
      : [...data.disciplines, value];
    onChange({ disciplines: newList });
  }, [data.disciplines, onChange, allowedOptionValues]);

  return (
    <div className="step flex flex-col items-center pb-28">
      <h2 className="text-3xl md:text-4xl text-center mb-3 font-extrabold">{t('booking.disciplines.heading')}</h2>
      <p className="text-sm text-white-200 text-center mb-2">{t('booking.disciplines.multi')}</p>
      
      <div className="w-full px-4">
        {allowedOptionValues !== null && (
          <p className="text-xs text-white/70 mb-2 text-center">
            Du fragst einen bestimmten Künstler an – wähle eine seiner angebotenen Disziplinen.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto justify-items-center">
          {optionsToRender.map((opt) => {
            const label = t(opt.labelKey);
            const desc = t(opt.descKey);
            const isSelected = data.disciplines.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleDiscipline(opt.value)}
                aria-pressed={isSelected}
                title={String(label)}
                className={`aspect-square w-full relative cursor-pointer rounded-lg overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isSelected ? 'border-4 border-blue-500' : 'border-2 border-transparent'
                }`}
              >
                <div className="absolute inset-0 w-full h-full">
                  {/* Schwarz-Weiß default */}
                  <img
                    src={`/images/bookingagent/BW/${opt.img}.webp`}
                    alt={String(label)}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition duration-200"
                  />
                  {/* Farbig on hover or selected */}
                  <img
                    src={`/images/bookingagent/Farbig/${opt.img}.webp`}
                    alt={String(label)}
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </div>
                <div className="absolute bottom-0 w-full bg-black/50 py-1 transition-opacity group-hover:opacity-0">
                  <span className="text-white text-center block text-sm">{label}</span>
                </div>
                <div className="absolute inset-x-3 bottom-3 bg-black/60 text-white rounded-md px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <p className="text-md text-center leading-snug">{desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    {/* Erklärung – Mobile nur als Accordion */}
    <div className="md:hidden w-full mt-3 px-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="why-disciplines">
          <AccordionTrigger>
            {t('booking.disciplines.why.title')}
          </AccordionTrigger>
          <AccordionContent>
            {t('booking.disciplines.why.body')}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
      {/* Fixed footer CTA */}
      <div className="fixed bottom-0 inset-x-0 px-4 py-4 bg-black/60 backdrop-blur-sm flex justify-center">
        <button
          type="button"
          onClick={onNext}
          disabled={(() => {
            if ((data.disciplines || []).length === 0) return true;
            if (allowedOptionValues === null) return false;
            const allowedSet = new Set(allowedOptionValues);
            return !data.disciplines.some(d => allowedSet.has(d));
          })()}
          className={`bg-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-opacity ${data.disciplines.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          aria-label={t('booking.disciplines.next')}
        >
          {t('booking.disciplines.next')}
        </button>
      </div>
    </div>
  );
};

export default StepShowDisciplines;