// src/components/ConsentBannerLite.tsx
import * as React from 'react';
import posthog from 'posthog-js';
import { useTranslation } from 'react-i18next';
import { initAnalytics } from '@/lib/analytics';

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}
function setCookie(name: string, value: string, days = 180) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}
function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

const COOKIE_NAME = 'pepe-consent-v2';

type Consent = { analytics: boolean };

export default function ConsentBannerLite() {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [analyticsChoice, setAnalyticsChoice] = React.useState(false);

  React.useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    if (qs.get('consent') === 'reset') {
      deleteCookie(COOKIE_NAME);
      setOpen(true);
      setAnalyticsChoice(false);
      try { posthog.opt_out_capturing(); posthog.set_config({ persistence: 'memory' }); } catch {}
      return;
    }
    const saved = getCookie(COOKIE_NAME);
    if (!saved) {
      setOpen(true);
      setAnalyticsChoice(false);
      try { posthog.opt_out_capturing(); posthog.set_config({ persistence: 'memory' }); } catch {}
    } else {
      try {
        const cons: Consent = JSON.parse(saved);
        setAnalyticsChoice(!!cons.analytics);
        if (cons.analytics) {
          posthog.opt_in_capturing();
          posthog.set_config({ persistence: 'cookie' });
        } else {
          posthog.opt_out_capturing();
          posthog.set_config({ persistence: 'memory' });
        }
      } catch {}
    }
  }, []);

  const persist = (val: boolean) => {
    setCookie(COOKIE_NAME, JSON.stringify({ analytics: val }));
    try {
      if (val) { posthog.opt_in_capturing(); posthog.set_config({ persistence: 'cookie' }); }
      else { posthog.opt_out_capturing(); posthog.set_config({ persistence: 'memory' }); }
    } catch {}
    setOpen(false);
  };

  const acceptAll = async () => {
    try { await initAnalytics(); } catch {}
    return persist(true);
  };
  const onlyEssential = () => persist(false);
  const saveSelection = async () => {
    try { if (analyticsChoice) { await initAnalytics(); } } catch {}
    return persist(analyticsChoice);
  };

  // Dev helper: window.pepeShowConsent() to reopen
  (window as any).pepeShowConsent = () => setOpen(true);

  if (!open) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] min-h-14">
      {/* gradient border frame */}
      <div className="mx-auto w-full max-w-5xl p-[1px] bg-gradient-to-r from-white/30 via-white/10 to-white/30 rounded-t-2xl shadow-2xl">
        {/* panel */}
        <div className="rounded-t-2xl border border-white/10 bg-black/85 ring-1 ring-white/10 backdrop-blur supports-[backdrop-filter]:bg-black/70">
          <div className="px-4 py-3 md:px-5 md:py-3.5">
            <div className="flex flex-col gap-3">
              {/* Header Row */}
              <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="sm:grid h-8 w-8 place-items-center rounded-full text-black shadow">
                    <span aria-hidden>🍪</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t('consent.title')}</p>
                    <p className="hidden sm:block text-xs text-white/70">{t('consent.intro')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="rounded-full border border-white/25 px-4 py-2 text-sm text-white hover:bg-white/10"
                  >
                    {t('consent.settings')}
                  </button>
                  <button
                    onClick={acceptAll}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
                  >
                    {t('consent.acceptAll')}
                  </button>
                </div>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-white">{t('consent.analyticsTitle')}</p>
                      <p className="text-xs text-white/60">{t('consent.analyticsDesc')}</p>
                    </div>
                    {/* Toggle */}
                    <button
                      role="switch"
                      aria-checked={analyticsChoice}
                      onClick={() => setAnalyticsChoice((v) => !v)}
                      className={[
                        'relative inline-flex h-6 w-11 items-center rounded-full transition',
                        analyticsChoice ? 'bg-white' : 'bg-white/20'
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'inline-block h-4 w-4 transform rounded-full bg-black transition',
                          analyticsChoice ? 'translate-x-6' : 'translate-x-1'
                        ].join(' ')}
                      />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <button
                      onClick={onlyEssential}
                      className="rounded-full border border-white/25 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                    >
                      {t('consent.onlyEssential')}
                    </button>
                    <div className="flex items-center gap-2">
                      <a href="/datenschutz" className="text-xs text-white/70 underline underline-offset-4 hover:text-white">{t('consent.privacy')}</a>
                      <button
                        onClick={saveSelection}
                        className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
                      >
                        {t('consent.saveSelection')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}