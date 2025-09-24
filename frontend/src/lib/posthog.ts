import posthog from 'posthog-js';
if (typeof window !== 'undefined') (window as any).posthog = posthog;

export function initPostHog() {
  // In Dev standardmäßig ausschalten (optional)
  const enableFromEnv = (import.meta.env.VITE_ENABLE_ANALYTICS ?? 'false') === 'true';
  const isProd = import.meta.env.MODE === 'production';
  // In Development nur aktivieren, wenn VITE_ENABLE_ANALYTICS=true gesetzt ist
  if (!isProd && !enableFromEnv) return;

  console.log("PostHog init KEY:", import.meta.env.VITE_POSTHOG_KEY);
  console.log("PostHog init HOST:", import.meta.env.VITE_POSTHOG_HOST);

  posthog.init(
    import.meta.env.VITE_POSTHOG_KEY,
    {
      // Stelle sicher, dass du VITE_POSTHOG_HOST in deiner .env auf deinen eigenen CDN/Proxy setzt,
      // z.B. https://analytics.pepeshows.de
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://analytics.pepeshows.de',
      autocapture: true,
      capture_pageview: false,
      person_profiles: 'identified_only',
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '*[data-ph-no-capture="true"]'
      }
    }
  );
}

export default posthog;