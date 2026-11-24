import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { deDE } from '@clerk/localizations/de-DE'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY')
}

/**
 * Clerk innerhalb des Routers.
 *
 * Ohne `routerPush`/`routerReplace` wechselt Clerk die Seite über
 * `window.location`: Jeder Schritt der Registrierung (E-Mail bestätigen,
 * Rückkehr von Google) lädt die App neu. Und ohne Ziel-URL landet man nach der
 * Registrierung auf der Startseite statt im Profil, ohne Hinweis, wie es
 * weitergeht.
 *
 * `localization`: Die Seiten um das Formular herum sind deutsch, das Formular
 * selbst stand auf Englisch da ("Email address", "Continue").
 */
export function ClerkWithRouter({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      localization={deDE}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      signInUrl="/anmelden"
      signUpUrl="/registrieren"
      signInFallbackRedirectUrl="/profil"
      signUpFallbackRedirectUrl="/profil"
    >
      {children}
    </ClerkProvider>
  )
}
