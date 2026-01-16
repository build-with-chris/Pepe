import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import { ProtectedRoute } from './components/ProtectedRoute'
import './index.css'
import './i18n'

// Lazy load Buhnenzauber - only when needed
const Buhnenzauber = lazy(() => import('./components/Buhnenzauber'))

// Routes that should NOT show public Navigation/Footer (dashboard routes)
const DASHBOARD_ROUTES = [
  '/admin',
  '/profil',
  '/profile',
  '/profile-setup',
  '/kalender',
  '/calendar',
  '/meine-gigs',
  '/gigs',
  '/meine-anfragen',
  '/buchhaltung',
  '/dashboard',
  '/login',
  '/signup',
  '/anmelden',
  '/registrieren',
  '/carousel',
  '/richtlinien',
]

// Check if current path is a dashboard route
function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

// Lazy load all page components
const Home = lazy(() => import('./pages/Home'))
const Kuenstler = lazy(() => import('./pages/Kuenstler'))
const Shows = lazy(() => import('./pages/Shows'))
const Galerie = lazy(() => import('./pages/Galerie'))
const Kontakt = lazy(() => import('./pages/Kontakt'))
const Anfragen = lazy(() => import('./pages/Anfragen'))
const Mediamaterial = lazy(() => import('./pages/Mediamaterial'))
const Presskit = lazy(() => import('./pages/Presskit'))
const Pressemappe = lazy(() => import('./pages/Pressemappe'))
const TechnicalRider = lazy(() => import('./pages/TechnicalRider'))
const Team = lazy(() => import('./pages/Team'))
const LoginForm = lazy(() => import('./components/login-form').then(m => ({ default: m.Login })))
const SignUp = lazy(() => import('./components/SignUp'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Imprint = lazy(() => import('./pages/Imprint'))
const Terms = lazy(() => import('./pages/Terms'))
const ArtistGuidlines = lazy(() => import('./pages/ArtistGuidlines'))
const Admin = lazy(() => import('./pages/Admin'))
const Artists = lazy(() => import('./pages/Artists'))
const Invoices = lazy(() => import('./pages/Invoices'))
const PendingGigs = lazy(() => import('./pages/PendingGigs'))
const OfferEditPage = lazy(() => import('./pages/OfferEditPage'))
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'))
const Kalender = lazy(() => import('./pages/Kalender'))
const Richtlinien = lazy(() => import('./pages/Richtlinien'))
const MyGigs = lazy(() => import('./pages/MyGigs'))
const MeineAnfragen = lazy(() => import('./pages/MeineAnfragen/MeineAnfragen'))
const Buchhaltung = lazy(() => import('./pages/Buchhaltung/Buchhaltung'))
const Impressum = lazy(() => import('./pages/Impressum'))
const Datenschutz = lazy(() => import('./pages/Datenschutz'))
const AGB = lazy(() => import('./pages/AGB'))
const Agentur = lazy(() => import('./pages/Agentur'))
const NotFound = lazy(() => import('./pages/NotFound'))
const DotCloudDemo = lazy(() => import('./pages/DotCloudDemo'))
const DisciplinesCarousel = lazy(() => import('./pages/DisciplinesCarousel'))
const GeneratePNGs = lazy(() => import('./pages/GeneratePNGs'))
const ColorDemo = lazy(() => import('./pages/ColorDemo'))
const SSOCallback = lazy(() => import('./pages/SSOCallback'))

// Loading fallback component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    color: 'var(--pepe-gold)'
  }}>
    <div style={{
      fontSize: '1.125rem',
      fontWeight: 500
    }}>
      Wird geladen...
    </div>
  </div>
)

// Layout wrapper that conditionally shows Navigation/Footer
function AppLayout() {
  const { pathname } = useLocation()
  const [showBuhnenzauber, setShowBuhnenzauber] = useState(false)
  const showPublicLayout = !isDashboardRoute(pathname)

  // Defer Buhnenzauber loading until after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBuhnenzauber(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* Buhnenzauber only on public pages */}
      {showPublicLayout && showBuhnenzauber && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 999,
          pointerEvents: 'none'
        }}>
          <Suspense fallback={null}>
            <Buhnenzauber />
          </Suspense>
        </div>
      )}

      {/* Navigation only on public pages */}
      {showPublicLayout && <Navigation />}

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Fullscreen carousel */}
          <Route path="/carousel" element={<DisciplinesCarousel />} />

          {/* Auth pages */}
          <Route path="/login/*" element={<LoginForm />} />
          <Route path="/signup/*" element={<SignUp />} />
          <Route path="/anmelden/*" element={<LoginForm />} />
          <Route path="/registrieren/*" element={<SignUp />} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
          <Route path="/admin/kuenstler" element={<ProtectedRoute requiredRole="admin"><Artists /></ProtectedRoute>} />
          <Route path="/admin/rechnungen" element={<ProtectedRoute requiredRole="admin"><Invoices /></ProtectedRoute>} />
          <Route path="/admin/anstehende-gigs" element={<ProtectedRoute requiredRole="admin"><PendingGigs /></ProtectedRoute>} />
          <Route path="/admin/requests/:reqId/offers/:offerId/edit" element={<ProtectedRoute requiredRole="admin"><OfferEditPage /></ProtectedRoute>} />
          <Route path="/admin/artists" element={<ProtectedRoute requiredRole="admin"><Artists /></ProtectedRoute>} />

          {/* Artist portal routes */}
          <Route path="/profil" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
          <Route path="/kalender" element={<ProtectedRoute><Kalender /></ProtectedRoute>} />
          <Route path="/meine-gigs" element={<ProtectedRoute><MyGigs /></ProtectedRoute>} />
          <Route path="/meine-anfragen" element={<ProtectedRoute><MeineAnfragen /></ProtectedRoute>} />
          <Route path="/buchhaltung" element={<ProtectedRoute><Buchhaltung /></ProtectedRoute>} />
          <Route path="/richtlinien" element={<ProtectedRoute><Richtlinien /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
          <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Kalender /></ProtectedRoute>} />
          <Route path="/gigs" element={<ProtectedRoute><MyGigs /></ProtectedRoute>} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/kuenstler" element={<Kuenstler />} />
          <Route path="/shows" element={<Shows />} />
          <Route path="/galerie" element={<Galerie />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/anfragen" element={<Anfragen />} />
          <Route path="/mediamaterial" element={<Mediamaterial />} />
          <Route path="/presskit" element={<Presskit />} />
          <Route path="/pressemappe" element={<Pressemappe />} />
          <Route path="/technical-rider" element={<TechnicalRider />} />
          <Route path="/team" element={<Team />} />
          <Route path="/agentur" element={<Agentur />} />

          {/* Demo routes */}
          <Route path="/demo/dotcloud" element={<DotCloudDemo />} />
          <Route path="/demo/colors" element={<ColorDemo />} />

          {/* PNG Generator utility */}
          <Route path="/generate-pngs" element={<GeneratePNGs />} />

          {/* SSO and onboarding routes */}
          <Route path="/sso-callback" element={<SSOCallback />} />
          <Route path="/kuenstler-richtlinien" element={<ArtistGuidlines />} />
          <Route path="/onboarding" element={<ArtistGuidlines />} />
          <Route path="/artist-guidelines" element={<ArtistGuidlines />} />

          {/* Legal pages */}
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/agb" element={<AGB />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/imprint" element={<Imprint />} />
          <Route path="/terms" element={<Terms />} />

          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Footer only on public pages */}
      {showPublicLayout && <Footer />}
    </>
  )
}

function App() {
  return (
    <div className="min-h-screen">
      <ScrollToTop />
      <AppLayout />
    </div>
  )
}

export default App