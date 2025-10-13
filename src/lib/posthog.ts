import posthog from 'posthog-js'

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY || '', {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.posthog.com',
    loaded: (posthog) => {
      if (import.meta.env.VITE_NODE_ENV === 'development') posthog.debug()
    }
  })
}

export default posthog