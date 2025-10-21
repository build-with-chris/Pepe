import posthog from 'posthog-js'

// Initialize PostHog only if key is provided
if (typeof window !== 'undefined') {
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.posthog.com',
      loaded: (posthog) => {
        if (import.meta.env.VITE_NODE_ENV === 'development') posthog.debug()
      }
    })
  } else {
    console.warn('[PostHog] Skipping initialization: VITE_POSTHOG_KEY not set')
  }
}

export default posthog