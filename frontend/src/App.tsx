import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import { ProtectedRoute } from './components/ProtectedRoute'
import './index.css'

// Lazy load Buhnenzauber - only when needed
const Buhnenzauber = lazy(() => import('./components/Buhnenzauber'))

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
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'))
const Kalender = lazy(() => import('./pages/Kalender'))
const MyGigs = lazy(() => import('./pages/MyGigs'))
const Impressum = lazy(() => import('./pages/Impressum'))
const Datenschutz = lazy(() => import('./pages/Datenschutz'))
const AGB = lazy(() => import('./pages/AGB'))
const Agentur = lazy(() => import('./pages/Agentur'))
const NotFound = lazy(() => import('./pages/NotFound'))
const DotCloudDemo = lazy(() => import('./pages/DotCloudDemo'))
const DisciplinesCarousel = lazy(() => import('./pages/DisciplinesCarousel'))
const GeneratePNGs = lazy(() => import('./pages/GeneratePNGs'))
const ColorDemo = lazy(() => import('./pages/ColorDemo'))

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

function App() {
  const [showBuhnenzauber, setShowBuhnenzauber] = useState(false)

  // Defer Buhnenzauber loading until after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBuhnenzauber(true)
    }, 1000) // Load after 1 second delay
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen">
      <ScrollToTop />
      <Routes>
        {/* Fullscreen carousel - no nav/footer */}
        <Route path="/carousel" element={
          <Suspense fallback={<PageLoader />}>
            <DisciplinesCarousel />
          </Suspense>
        } />

        {/* Regular pages with nav/footer */}
        <Route path="*" element={
          <>
            {showBuhnenzauber && (
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
            <Navigation />
            <Suspense fallback={<PageLoader />}>
              <Routes>
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

              {/* Authentication routes - use working components */}
              <Route path="/anmelden" element={<LoginForm />} />
              <Route path="/registrieren" element={<SignUp />} />
              <Route path="/kuenstler-richtlinien" element={<ArtistGuidlines />} />
              <Route path="/onboarding" element={<ArtistGuidlines />} />

              {/* Legacy English routes for backwards compatibility */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/artist-guidelines" element={<ArtistGuidlines />} />

              {/* Admin routes (protected) */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin" />}>
                <Route index element={<Admin />} />
              </Route>
              <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin" />}>
                <Route index element={<Admin />} />
              </Route>
              <Route path="/admin/kuenstler" element={<ProtectedRoute requiredRole="admin" />}>
                <Route index element={<Artists />} />
              </Route>

              {/* Legacy admin route */}
              <Route path="/admin/artists" element={<ProtectedRoute requiredRole="admin" />}>
                <Route index element={<Artists />} />
              </Route>

              {/* User profile routes (protected) - German names */}
              <Route path="/profil" element={<ProtectedRoute />}>
                <Route index element={<ProfileSetup />} />
              </Route>
              <Route path="/kalender" element={<ProtectedRoute />}>
                <Route index element={<Kalender />} />
              </Route>
              <Route path="/meine-gigs" element={<ProtectedRoute />}>
                <Route index element={<MyGigs />} />
              </Route>

              {/* Legacy English routes for backwards compatibility */}
              <Route path="/profile" element={<ProtectedRoute />}>
                <Route index element={<ProfileSetup />} />
              </Route>
              <Route path="/profile-setup" element={<ProtectedRoute />}>
                <Route index element={<ProfileSetup />} />
              </Route>
              <Route path="/calendar" element={<ProtectedRoute />}>
                <Route index element={<Kalender />} />
              </Route>
              <Route path="/gigs" element={<ProtectedRoute />}>
                <Route index element={<MyGigs />} />
              </Route>

              {/* Legacy dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Legal pages - German versions */}
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              <Route path="/agb" element={<AGB />} />

              {/* Legacy legal pages - English versions */}
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/imprint" element={<Imprint />} />
              <Route path="/terms" element={<Terms />} />

                {/* 404 fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  )
}

export default App