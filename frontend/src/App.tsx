import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import ParticleBackground from './components/ParticleBackground'
import { ProtectedRoute } from './components/ProtectedRoute'
import Home from './pages/Home'
import Kuenstler from './pages/Kuenstler'
import Shows from './pages/Shows'
import Galerie from './pages/Galerie'
import Kontakt from './pages/Kontakt'
import Anfragen from './pages/Anfragen'
import Mediamaterial from './pages/Mediamaterial'
import Presskit from './pages/Presskit'
import Pressemappe from './pages/Pressemappe'
import Team from './pages/Team'
import Referenzen from './pages/Referenzen'
import {Login as LoginForm} from './components/login-form'
import SignUp from './components/SignUp'
import Dashboard from './pages/Dashboard'
import Privacy from './pages/Privacy'
import Imprint from './pages/Imprint'
import Terms from './pages/Terms'
import ArtistGuidlines from './pages/ArtistGuidlines'
import Admin from './pages/Admin'
import Artists from './pages/Artists'
import ProfileSetup from './pages/ProfileSetup'
import Kalender from './pages/Kalender'
import MyGigs from './pages/MyGigs'
import Impressum from './pages/Impressum'
import Datenschutz from './pages/Datenschutz'
import AGB from './pages/AGB'
import Agentur from './pages/Agentur'
import NotFound from './pages/NotFound'
import DotCloudDemo from './pages/DotCloudDemo'
import DisciplinesCarousel from './pages/DisciplinesCarousel'
import './index.css'

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        {/* Fullscreen carousel - no nav/footer */}
        <Route path="/carousel" element={<DisciplinesCarousel />} />

        {/* Regular pages with nav/footer */}
        <Route path="*" element={
          <>
            <ParticleBackground />
            <Navigation />
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
              <Route path="/team" element={<Team />} />
              <Route path="/agentur" element={<Agentur />} />
              <Route path="/referenzen" element={<Referenzen />} />

              {/* Demo route for DotCloud particle system */}
              <Route path="/demo/dotcloud" element={<DotCloudDemo />} />

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
            <Footer />
          </>
        } />
      </Routes>
    </div>
  )
}

export default App