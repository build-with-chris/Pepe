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
      </Routes>

      <Footer />
    </div>
  )
}

export default App