let started = false;

export async function initAnalytics() {
  await new Promise<void>((resolve) => {
    const start = async () => {
      if (started) return resolve();
      started = true;
      try {
        const { default: posthog } = await import('posthog-js');
        posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
          api_host: 'https://eu.posthog.com',
          autocapture: false,
          capture_pageview: false,
          person_profiles: 'identified_only',
        });
        // Pageview NUR nach Interaktion, im Idle
        const onIdle = (cb: () => void, ms = 800) => {
          const w: any = typeof window !== 'undefined' ? window : undefined;
          if (w && 'requestIdleCallback' in w) return w.requestIdleCallback(cb, { timeout: ms });
          return setTimeout(cb, ms);
        };
        onIdle(() => posthog.capture('$pageview'));
      } catch {
        // ignore
      } finally {
        resolve();
      }
    };

    const cleanup = () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('pointerdown', onInteract);
        document.removeEventListener('keydown', onInteract);
      }
    };

    const onInteract = () => {
      cleanup();
      start();
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('pointerdown', onInteract, { once: true, passive: true });
      document.addEventListener('keydown', onInteract, { once: true });
    }
  });
}