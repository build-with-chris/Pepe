import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import ParticleBackground from './components/ParticleBackground'
import Home from './pages/Home'
import Kuenstler from './pages/Kuenstler'
import Shows from './pages/Shows'
import Galerie from './pages/Galerie'
import Kontakt from './pages/Kontakt'
import Anfragen from './pages/Anfragen'
import Mediamaterial from './pages/Mediamaterial'
import Presskit from './pages/Presskit'
import TechnicalRider from './pages/TechnicalRider'
import Brandguide from './pages/Brandguide'
import Team from './pages/Team'
import Referenzen from './pages/Referenzen'
import FAQ from './pages/FAQ'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Privacy from './pages/Privacy'
import Imprint from './pages/Imprint'
import Terms from './pages/Terms'
import './index.css'

function App() {
  return (
    <div className="min-h-screen">
      {/* Global Particle Background */}
      <ParticleBackground />
      
      <Navigation />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kuenstler" element={<Kuenstler />} />
        <Route path="/shows" element={<Shows />} />
        <Route path="/galerie" element={<Galerie />} />
        <Route path="/kontakt" element={<Kontakt />} />
        <Route path="/anfragen" element={<Anfragen />} />
        <Route path="/mediamaterial" element={<Mediamaterial />} />
        <Route path="/presskit" element={<Presskit />} />
        <Route path="/technical-rider" element={<TechnicalRider />} />
        <Route path="/brandguide" element={<Brandguide />} />
        <Route path="/team" element={<Team />} />
        <Route path="/referenzen" element={<Referenzen />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/imprint" element={<Imprint />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>

      <Footer />
    </div>
  )
}

export default App