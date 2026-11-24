import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ClerkWithRouter } from './components/ClerkWithRouter'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import './i18n'
import App from './App.tsx'

// Die vorgerenderten SEO-Tags aus index.html weichen denen der SEO-Komponente,
// sonst stuenden Titel, Beschreibung und Canonical doppelt im Kopf.
document.querySelectorAll('[data-prerender]').forEach((el) => el.remove())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ClerkWithRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ClerkWithRouter>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
