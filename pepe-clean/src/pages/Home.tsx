import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Buhnenzauber from '../components/Buhnenzauber'

interface Artist {
  id: number
  name: string
  disciplines: string[]
  profile_image_url?: string
  bio?: string
  experience_years?: number
}

export default function Home() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'https://pepe-backend-4nid.onrender.com'
        const response = await fetch(`${baseUrl}/api/artists`)
        if (response.ok) {
          const data = await response.json()
          setArtists(data.slice(0, 6)) // Show only first 6 artists on home page
        }
      } catch (error) {
        console.error('Failed to fetch artists:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArtists()
  }, [])

  const resolveImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return ''
    if (imageUrl.startsWith('http')) return imageUrl
    const baseUrl = import.meta.env.VITE_API_URL || 'https://pepe-backend-4nid.onrender.com'
    return `${baseUrl}${imageUrl}`
  }

  return (
    <main>
      {/* Hero Section - Full Viewport Height */}
      <section className="hero-full">
        {/* Background Hero Image */}
        <div className="hero-background">
          <img 
            src="/src/assets/PepeHero.webp" 
            alt="Pepe Shows Hero" 
            className="hero-image"
          />
          <div className="hero-overlay"></div>
          <Buhnenzauber />
        </div>
        
        {/* Hero Content - Positioned Lower */}
        <div className="hero-content-wrapper">
          <div className="stage-container">
            <div className="hero-content">
              <div className="overline mb-6">Theater • Performance • Kunst</div>
              <h1 className="display-1 display-gradient mb-8">
                Die Bühne gehört
                <br />
                den Geschichten
              </h1>
              <p className="lead mb-12 max-w-3xl mx-auto">
                Erleben Sie außergewöhnliche Theaterstücke und Performances 
                mit den talentiertesten Künstlern der Stadt. 
              </p>
              <div className="hero-actions">
                <Link to="/anfragen" className="btn btn-primary btn-xl">
                  Show buchen
                </Link>
                <Link to="/shows" className="btn btn-secondary btn-lg">
                  Shows entdecken
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-dot"></div>
        </div>
      </section>

      {/* Booking Assistant Section */}
      <section className="section bg-gradient-dark">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <div className="overline text-pepe-gold">Unser Service</div>
            <h2 className="h2 mb-6">Booking Assistent</h2>
            <p className="body-lg max-w-3xl mx-auto">
              In nur 3 Schritten zur perfekten Show. Unser intelligenter 
              Booking-Assistent führt Sie durch den gesamten Prozess.
            </p>
          </div>

          <div className="booking-features">
            <div className="booking-card">
              <div className="booking-card-number">1</div>
              <h3 className="h3 mb-4">Event Details</h3>
              <p className="body">
                Teilen Sie uns Art, Datum und Ort Ihrer Veranstaltung mit.
              </p>
            </div>
            <div className="booking-card">
              <div className="booking-card-number">2</div>
              <h3 className="h3 mb-4">Show-Auswahl</h3>
              <p className="body">
                Wählen Sie aus unserem vielfältigen Programm die passende Performance.
              </p>
            </div>
            <div className="booking-card">
              <div className="booking-card-number">3</div>
              <h3 className="h3 mb-4">Angebot erhalten</h3>
              <p className="body">
                Erhalten Sie innerhalb von 24h ein maßgeschneidertes Angebot.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/anfragen" className="btn btn-primary btn-lg">
              Jetzt Booking starten
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <div className="overline">Unsere Stars</div>
            <h2 className="h2 mb-6">Featured Artists</h2>
            <p className="body-lg max-w-3xl mx-auto">
              Entdecken Sie die talentiertesten Künstler unseres Ensembles
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="body">Künstler werden geladen...</div>
            </div>
          ) : (
            <div className="artist-grid">
              {artists.map((artist) => (
                <div key={artist.id} className="artist-card">
                  <div className="artist-card-image">
                    {artist.profile_image_url ? (
                      <img 
                        src={resolveImageUrl(artist.profile_image_url)}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-pepe-ink flex items-center justify-center">
                        <span className="text-pepe-t64">Kein Bild</span>
                      </div>
                    )}
                  </div>
                  <div className="artist-card-overlay">
                    <div className="artist-card-content">
                      <h3 className="h3 mb-2">{artist.name}</h3>
                      <div className="label mb-3">
                        {artist.disciplines?.join(', ') || 'Künstler'}
                      </div>
                    </div>
                    <Link to="/kuenstler" className="btn btn-ghost btn-sm">
                      Mehr erfahren
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to="/kuenstler" className="btn btn-secondary btn-lg">
              Alle Künstler ansehen
            </Link>
          </div>
        </div>
      </section>

      {/* Show Categories */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <div className="overline">Unser Repertoire</div>
            <h2 className="h2 mb-6">Show-Kategorien</h2>
          </div>

          <div className="category-grid">
            <Link to="/shows" className="category-card">
              <div className="category-icon">🎭</div>
              <h3 className="h3 mb-3">Solo Performance</h3>
              <p className="body-sm">Einzelkünstler in Bestform</p>
            </Link>
            <Link to="/shows" className="category-card">
              <div className="category-icon">👥</div>
              <h3 className="h3 mb-3">Duo Acts</h3>
              <p className="body-sm">Perfekte Synchronisation</p>
            </Link>
            <Link to="/shows" className="category-card">
              <div className="category-icon">🎪</div>
              <h3 className="h3 mb-3">Varieté</h3>
              <p className="body-sm">Vielfältiges Entertainment</p>
            </Link>
            <Link to="/shows" className="category-card">
              <div className="category-icon">🎨</div>
              <h3 className="h3 mb-3">Konzeptshow</h3>
              <p className="body-sm">Thematische Performances</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-large text-center">
        <div className="stage-container">
          <h2 className="display-2 mb-8">
            Bereit für Ihre
            <br />
            <span className="text-pepe-gold">unvergessliche Show?</span>
          </h2>
          <p className="lead mb-12 max-w-3xl mx-auto">
            Lassen Sie uns gemeinsam Ihre Veranstaltung zu einem 
            außergewöhnlichen Erlebnis machen.
          </p>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              Jetzt anfragen
            </Link>
            <Link to="/kontakt" className="btn btn-ghost btn-lg">
              Kontakt aufnehmen
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}