import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { BookingData } from '../types';
import { postRequest } from '../../../services/bookingApi';
import { Loader2 } from 'lucide-react';
import { useTranslation } from "react-i18next";
import SummaryCard from '../parts/SummaryCard';
import WaitingOverlay from '../parts/WaitingOverlay';
import SuccessView from '../parts/SuccessView';
import posthog from "@/lib/posthog";

const ANIM_DURATION = 800; // ms
const CONFETTI_COUNT = 100;
const MIN_DELAY = 5000;

// Clear any locally cached booking/wizard data (best-effort)
function clearBookingCache() {
  try {
    const candidateKeys = [
      'bookingData',
      'wizardState',
      'pepe-booking',
      'pepe:wizard',
      'formData',
    ];

    // remove known keys
    candidateKeys.forEach((k) => {
      try { localStorage.removeItem(k); } catch {}
      try { sessionStorage.removeItem(k); } catch {}
    });

    // best-effort: remove anything that looks related
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i) || '';
        if (/(booking|wizard|form|pepe)/i.test(key)) {
          localStorage.removeItem(key);
        }
      }
    } catch {}
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i) || '';
        if (/(booking|wizard|form|pepe)/i.test(key)) {
          sessionStorage.removeItem(key);
        }
      }
    } catch {}
  } catch {}
}

const DISCIPLINE_VIDEO_MAP: Record<string, string> = {
  "led cyr": "LED CYR Blackbox.webm",
  "cyr": "Cyr 5.webm",
  "pantom": "Pantomime.webm",
  "akro": "Contortion.webm",
  "contortion": "Contortion.webm",
  "hula": "Hula.webm",
  "handstand": "Handstand.webm",
  "chinese": "Chienise Pole.webm",
  "pole": "Chienise Pole.webm"
};

const UI_TO_BACKEND_DISC: Record<string, string> = {
  'Zauberer': 'zauberer',
  'Cyr-Wheel': 'cyr-wheel',
  'Bodenakrobatik': 'bodenakrobatik',
  'Luftakrobatik': 'luftakrobatik',
  'Partnerakrobatik': 'partnerakrobatik',
  'Chinese Pole': 'chinese pole',
  'Hula Hoop': 'hula hoop',
  'Handstand': 'handstand',
  'Contemporary Dance': 'contemporary dance',
  'Breakdance': 'breakdance',
  'Teeterboard': 'teeterboard',
  'Jonglage': 'jonglage',
  'Moderation': 'moderation',
  'Pantomime': 'pantomime'
};

export interface StepShowtimeProps {
  data: BookingData;
  onPrev: () => void;
}

const StepShowtime: React.FC<StepShowtimeProps> = ({ data, onPrev }) => {
  const responseRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const [response, setResponse] = useState<any>(null);
  const [pendingResponse, setPendingResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAnim, setShowAnim] = useState(false);

  const [animArtists, setAnimArtists] = useState<number>(0);
  const [animPriceMin, setAnimPriceMin] = useState<number>(0);
  const [animPriceMax, setAnimPriceMax] = useState<number>(0);
  const [showReplay, setShowReplay] = useState(false);

  const isGroup = Number(data.team_size) === 3;
  const isDuo = Number(data.team_size) === 2;

  // Pick a short cinematic loop based on discipline/show type
  const pickVideoFile = () => {
    const primary = (Array.isArray(data.disciplines) && data.disciplines[0]) || data.show_type || '';
    const key = String(primary).toLowerCase();
    for (const k of Object.keys(DISCIPLINE_VIDEO_MAP)) {
      if (key.includes(k)) return DISCIPLINE_VIDEO_MAP[k];
    }
    return 'Vorschau loop.webm';
  };
  const visualSrc = encodeURI(`/videos/Short Clips/${pickVideoFile()}`);

  useEffect(() => {
    if (responseRef.current && response) {
      responseRef.current.scrollIntoView({ behavior: 'smooth' });
      confetti({
        particleCount: CONFETTI_COUNT,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [response]);

  useEffect(() => {
    const onReset = () => clearBookingCache();
    window.addEventListener('booking:reset', onReset);
    return () => window.removeEventListener('booking:reset', onReset);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setShowAnim(true);
    const startTime = Date.now();
    try {
      try {
        posthog.capture('booking_request_submitted', {
          path: window.location.pathname,
          show_type: (data as any)?.show_type ?? null,
          disciplines: Array.isArray((data as any)?.disciplines) ? (data as any).disciplines : undefined,
          team_size: Number((data as any)?.team_size) || null,
          is_group: Number((data as any)?.team_size) === 3,
        });
      } catch {}

      // Build payload with minimal, backwards-compatible additions
      const payload: any = { ...(data as any) };
      // If wizard was started from a specific artist, include target_artist_ids
      try {
        const stored = localStorage.getItem('bookingTargetArtistId');
        const artistId = stored ? Number(stored) : 0;
        if (artistId) {
          payload.target_artist_ids = [artistId];
          // If team_size not explicitly chosen yet, default to solo when targeting a specific artist
          const ts = Number((payload as any).team_size || 0);
          if (!ts || ts < 1) {
            (payload as any).team_size = 1;
          }
        }
      } catch {}
      // If user selected any discipline in the wizard, map UI label to backend key
      try {
        const first = Array.isArray((data as any)?.disciplines) ? (data as any).disciplines[0] : null;
        if (first) {
          payload.show_discipline = UI_TO_BACKEND_DISC[String(first)] || String(first).toLowerCase();
        }
      } catch {}

      const res = await postRequest(payload);

      try {
        posthog.capture('booking_request_succeeded', {
          num_available_artists: Number((res as any)?.num_available_artists || 0),
          price_min: Number((res as any)?.price_min || 0),
          price_max: Number((res as any)?.price_max || 0),
          latency_ms: Date.now() - startTime,
        });
      } catch {}

      setPendingResponse(res);

      // ensure at least MIN_DELAY delay
      const elapsed = Date.now() - startTime;
      const waitTime = elapsed < MIN_DELAY ? MIN_DELAY - elapsed : 0;
      setTimeout(() => {
        setResponse(res);
        try {
          const duration = ANIM_DURATION; // ms
          const start = performance.now();
          const fromArtists = 0;
          const toArtists = Number(res?.num_available_artists || 0);
          const fromMin = 0;
          // Prefer fully calculated backend prices; fall back to raw duo sums only if calculated values are missing.
          const calcMin = Number(res?.price_min ?? 0);
          const calcMax = Number(res?.price_max ?? 0);
          const fallbackDuoMin = isDuo && res?.duo_price_min != null ? Number(res.duo_price_min) : 0;
          const fallbackDuoMax = isDuo && res?.duo_price_max != null ? Number(res.duo_price_max) : 0;

          const toMin = isGroup ? 0 : (calcMin > 0 ? calcMin : fallbackDuoMin);
          const toMax = isGroup ? 0 : (calcMax > 0 ? calcMax : fallbackDuoMax);

          const fromMax = 0;

          const step = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const ease = t * (2 - t); // easeOutQuad
            setAnimArtists(Math.round(fromArtists + (toArtists - fromArtists) * ease));
            setAnimPriceMin(Math.round(fromMin + (toMin - fromMin) * ease));
            setAnimPriceMax(Math.round(fromMax + (toMax - fromMax) * ease));
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        } catch {}
        // 👉 Notify the wizard to clear its cached data and also clear here as a fallback
        try {
          window.dispatchEvent(new Event('booking:submitted'));
          console.log('ℹ️ bookingData cleared after submission (Step 11)');
        } catch (e) {
          console.warn('Could not notify booking submitted:', e);
        }
        // Fallback: proactively clear local caches here as well
        clearBookingCache();
        setShowAnim(false);
        setLoading(false);
      }, waitTime);
    } catch (err: any) {
      try {
        posthog.capture('booking_request_failed', {
          message: err?.message || String(err),
          latency_ms: Date.now() - startTime,
        });
      } catch {}
      console.error('❌ postRequest failed:', err);
      setError(err.message || 'Ein Fehler ist aufgetreten');
      setShowAnim(false);
      setLoading(false);
    }
  };


  return (
    <div className="step pb-28">
      <h2 className="text-3xl md:text-4xl text-center mb-3 font-extrabold">
        {t('booking.showtime.heading.line1')}
        <br />
        {t('booking.showtime.heading.line2')}
      </h2>

      <SummaryCard data={data} />

      <div className="navigation flex justify-center w-full mt-4">
        {!response ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow cursor-pointer hover:bg-sky-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t('booking.showtime.actions.sending')}
              </>
            ) : (
              t('booking.showtime.actions.submit')
            )}
          </button>
        ) : null}
      </div>

      {showAnim && (
        <WaitingOverlay
          message={t('booking.showtime.waiting.line1', { defaultValue: 'Ich spüre schon, wie es aussehen wird…' })}
        />
      )}
      
      {response && !showAnim && (
        <SuccessView
          responseRef={responseRef}
          data={data}
          response={response}
          visualSrc={visualSrc}
          isGroup={isGroup}
          animArtists={animArtists}
          animPriceMin={animPriceMin}
          animPriceMax={animPriceMax}
          showReplay={showReplay}
          setShowReplay={setShowReplay}
        />
      )}
      {error && (
        <div className="error" style={{ color: 'red', marginTop: '16px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default StepShowtime;