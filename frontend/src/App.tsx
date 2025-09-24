import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { initAnalytics } from './lib/analytics';
import { useEffect, Suspense, lazy } from 'react';
import {Login} from './components/login-form'
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import Navbar01Page from './components/navbar-01/navbar-01';

const Home = lazy(() => import('./pages/Home'));
const Anfragen = lazy(() => import('./pages/Anfragen'));
const Kuenstler = lazy(() => import('./pages/Kuenstler'));
const SignUp = lazy(() => import('./components/SignUp'));
const Admin = lazy(() => import('./pages/Admin'));
const Profile = lazy(() => import('./pages/ProfileSetup/ProfileSetup'));
const CalendarPage = lazy(() => import('./pages/Kalender/Kalender'));
const Kontakt = lazy(() => import('./pages/Kontakt'));
const MyGigs = lazy(() => import('./pages/MyGigs'));
const MeineAnfragen = lazy(() => import('./pages/MeineAnfragen/MeineAnfragen'));
const Rechnungen = lazy(() => import('./pages/Invoices'));
const AnstehendeGigs = lazy(() => import('./pages/PendingGigs'));
const KuenstlerVerwaltung = lazy(() => import('./pages/Artists'));
const OfferEditPage = lazy(() => import('./pages/OfferEditPage'));
const Buchhaltung = lazy(() => import('./pages/Buchhaltung/Buchhaltung'));
const NotFound = lazy(() => import('./pages/404'));
const ArtistGuidlines = lazy(() => import('./pages/ArtistGuidlines'));
const Shows = lazy(() => import('./pages/Shows'));
const Agentur = lazy(() => import('./pages/Agentur'));
const Referenzen = lazy(() => import('./pages/Referenzen'));
const Impressum = lazy(() => import('./pages/Impressum'));
const Datenschutz = lazy(() => import('./pages/Datenschutz'));
const AGB = lazy(() => import('./pages/AGB'));
const Gallerie = lazy(() => import('./pages/Galerie'));
const Mediamaterial = lazy(() => import('./pages/Mediamaterial'));
const TechnicalRider = lazy(() => import('./pages/TechnicalRider'));
const Brandguide = lazy(() => import('./pages/Brandguid'));
const Pressemappe = lazy(() => import('./pages/Pressemappe'));
const Footer = lazy(() => import('./components/footer-04/footer-04'));

import "./i18n"

function App() {
  const location = useLocation();

  useEffect(() => {
    // Initialize analytics only after user interaction, no idle fallback
    initAnalytics();
  }, [location.pathname]);

  return (

    <div className="bg-black text-white min-h-screen">
      {location.pathname !== '/splash' && <Navbar01Page />}
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/anfragen" element={<Anfragen />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/galerie" element={<Gallerie />} />
          <Route path="/mediamaterial" element={<Mediamaterial />} />

          <Route path="/shows" element={<Shows />} />
          <Route path="/referenzen" element={<Referenzen />} />
          
          <Route path="/kuenstler" element={<Kuenstler />} />
          <Route path="/agentur" element={<Agentur />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/agb" element={<AGB />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/technical-rider" element={<TechnicalRider />} />
          <Route path="/brandguide" element={<Brandguide />} />
          <Route path="/pressemappe" element={<Pressemappe />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/buchhaltung" element={<Buchhaltung />} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/kalender" element={<CalendarPage />} />
            <Route path="/meine-gigs" element={<MyGigs />} />
            <Route path="/meine-anfragen" element={<MeineAnfragen />} />
          </Route>

          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin/dashboard" element={<Admin />} />
            <Route path="/admin/rechnungen" element={<Rechnungen />} />
            <Route path="/admin/anstehende-gigs" element={<AnstehendeGigs />} />
            <Route path="/admin/kuenstler" element={<KuenstlerVerwaltung />} />
            <Route
              path="/admin/requests/:reqId/offers/:offerId/edit"
              element={<OfferEditPage />}
            />
          </Route>
          <Route path="*" element={<NotFound />} />
          <Route path="/artist-guidelines" element={<ArtistGuidlines />} />
          <Route path="/onboarding" element={<ArtistGuidlines />} />
        </Routes>
      </Suspense>
      {!['/anfragen', '/login', '/signup', '/buchhaltung', '/profile', '/kalender', '/meine-gigs', '/meine-anfragen'].includes(location.pathname) && (
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      )}
    </div>
  )
}

export default App