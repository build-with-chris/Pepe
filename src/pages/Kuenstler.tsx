import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import ArtistCardFinal from '@/components/ArtistCardFinal'
import type { Artist } from '@/types/artist'

export default function Kuenstler() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation()

  // Get all artist images for backdrop
  const artistImages = artists
    .filter(artist => artist.profile_image_url)
    .map(artist => artist.profile_image_url!)

  // Cycle through images for backdrop
  useEffect(() => {
    if (artistImages.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % artistImages.length)
    }, 4000) // Change image every 4 seconds
    
    return () => clearInterval(interval)
  }, [artistImages.length])


  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'https://pepe-backend-4nid.onrender.com'
        console.log('Fetching artists from:', `${baseUrl}/api/artists`)
        
        const response = await fetch(`${baseUrl}/api/artists`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(10000) // 10 second timeout
        })
        
        console.log('Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Artists data received:', data.length, 'artists')
          setArtists(data)
          setFilteredArtists(data)
        } else {
          console.error('Failed to fetch artists, status:', response.status)
          // Use mock data as fallback when API is down
          const mockArtists: Artist[] = []
          setArtists(mockArtists)
          setFilteredArtists(mockArtists)
        }
      } catch (error) {
        console.error('Failed to fetch artists:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArtists()
  }, [])

  // Handle flip parameter from URL to auto-open specific artist card
  useEffect(() => {
    const flipParam = searchParams.get('flip')
    if (flipParam && artists.length > 0) {
      const artistId = parseInt(flipParam, 10)
      if (!isNaN(artistId)) {
        setSelectedArtistId(artistId)
        // Scroll to the artist card after a short delay to ensure it's rendered
        setTimeout(() => {
          const artistElement = document.querySelector(`[data-artist-id="${artistId}"]`)
          if (artistElement) {
            artistElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
      }
    }
  }, [searchParams, artists])

  const resolveBackdropImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) return imageUrl
    const baseUrl = import.meta.env.VITE_API_URL || 'https://pepe-backend-4nid.onrender.com'
    return `${baseUrl}${imageUrl}`
  }

  // Get unique disciplines for filter buttons
  const allDisciplines = Array.from(
    new Set(
      artists.flatMap(artist => artist.disciplines || [])
    )
  ).sort()

  const handleFilter = (discipline: string) => {
    if (discipline === selectedDiscipline) {
      // Deselect if clicking same discipline
      setSelectedDiscipline('')
      setFilteredArtists(artists)
    } else {
      setSelectedDiscipline(discipline)
      const filtered = artists.filter(artist => 
        artist.disciplines?.some(d => 
          d.toLowerCase().includes(discipline.toLowerCase())
        )
      )
      setFilteredArtists(filtered)
    }
  }

  const clearFilters = () => {
    setSelectedDiscipline('')
    setFilteredArtists(artists)
  }


  return (
    <main>
      {/* Hero Section with Layered Animated Background */}
      <section className="artist-hero-layered">
        {/* Layer 1: Black Background */}
        <div className="hero-layer-black"></div>
        
        {/* Layer 2: Image Slideshow */}
        <div className="hero-layer-slideshow">
          {artistImages.length > 0 && artistImages.map((imageUrl, index) => (
            <div
              key={`${imageUrl}-${index}`}
              className={`slideshow-image ${index === currentImageIndex ? 'active' : ''}`}
            >
              <img
                src={resolveBackdropImageUrl(imageUrl)}
                alt={`Artist ${index + 1}`}
                className="slideshow-img"
              />
            </div>
          ))}
        </div>
        
        {/* Layer 3: Particle Effects */}
        <div className="hero-layer-particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
          <div className="particle particle-6"></div>
          <div className="particle particle-7"></div>
          <div className="particle particle-8"></div>
        </div>
        
        {/* Layer 4: Gradient Overlay */}
        <div className="hero-layer-gradient"></div>

        {/* Content Layer */}
        <div className="hero-content-layer">
          <div className="stage-container">
            <div className="hero-content text-center max-w-4xl mx-auto">
              <div className="overline text-pepe-gold mb-6 animate-fade-in">{t('artists.quote')}</div>
              <h1 className="display-1 display-gradient mb-8 animate-slide-up">
                {t('hero87.heading') || 'Künstler & Performer'}
              </h1>
              <p className="lead mb-12 max-w-3xl mx-auto animate-fade-in-delayed">
                {t('hero87.body') || 'Entdecken Sie die außergewöhnlichen Talente, die unsere Bühne mit Leben füllen. Jeder Künstler bringt seine einzigartige Geschichte und Leidenschaft mit.'}
              </p>
              <div className="hero-actions animate-fade-in-delayed-more">
                <Link to="/anfragen" className="btn btn-primary btn-xl">
                  {t('about1.next.cta.assistant')}
                </Link>
                <Link to="/shows" className="btn btn-ghost btn-lg">
                  Shows entdecken
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artists Section */}
      <section className="section">
        <div className="stage-container">
          
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">Unsere Künstler</h2>
            <p className="body-lg max-w-3xl mx-auto">
              Lernen Sie die talentierten Persönlichkeiten kennen, die unsere Vision zum Leben erwecken.
            </p>
          </div>

          {/* Filter Section - Moved to top of cards */}
          {!loading && allDisciplines.length > 0 && (
            <div className="mb-16">
              <div className="filter-section">
                <h3 className="h3 text-center mb-8">Nach Disziplin filtern</h3>
                <div className="filter-buttons">
                  {allDisciplines.map((discipline) => (
                    <button
                      key={discipline}
                      onClick={() => handleFilter(discipline)}
                      className={`filter-btn ${
                        selectedDiscipline === discipline 
                          ? 'active' 
                          : ''
                      }`}
                    >
                      {discipline}
                    </button>
                  ))}
                </div>
                {selectedDiscipline && (
                  <div className="text-center mt-6">
                    <button
                      onClick={clearFilters}
                      className="btn btn-secondary btn-sm"
                    >
                      {t('artists.filters.all')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* Results Count */}
          {!loading && (
            <div className="text-center mb-12">
              <div className="results-count">
                <span className="label">
                  {filteredArtists.length} {filteredArtists.length === 1 ? 'Künstler' : 'Künstler'} 
                  {selectedDiscipline && ` für "${selectedDiscipline}"`}
                </span>
              </div>
            </div>
          )}
          
          {/* Artists Grid */}
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p className="body mt-4">{t('artists.loading')}</p>
            </div>
          ) : filteredArtists.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎭</div>
              <h3 className="h3 mb-4">
                {selectedDiscipline ? 
                  `Keine Künstler für "${selectedDiscipline}" gefunden` : 
                  t('artists.empty')
                }
              </h3>
              {selectedDiscipline && (
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary"
                >
                  Alle Künstler anzeigen
                </button>
              )}
            </div>
          ) : (
            <div className="artist-grid-final">
              {filteredArtists.map((artist) => (
                <div key={artist.id} data-artist-id={artist.id}>
                  <ArtistCardFinal 
                    artist={artist} 
                    isInitiallySelected={selectedArtistId === artist.id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Disciplines Showcase - Moved to bottom above CTA */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">Unsere Disziplinen</h2>
            <p className="body-lg max-w-3xl mx-auto">
              Von klassischer Akrobatik bis zu modernen Performances – 
              unsere Künstler beherrschen ein breites Spektrum an Disziplinen.
            </p>
          </div>

          <div className="discipline-showcase-grid">
            <div className="discipline-showcase-card">
              <div className="discipline-icon">🪂</div>
              <h3 className="h3 mb-3">{t('gallery14.items.1.title') || 'Luftakrobatik'}</h3>
              <p className="body-sm">{t('gallery14.items.1.description') || 'Schwerelos & elegant: Luftshows, die Galas und Firmenfeiern veredeln – mit eigenem, schnell aufbaubarem Rig.'}</p>
            </div>
            <div className="discipline-showcase-card">
              <div className="discipline-icon">🔥</div>
              <h3 className="h3 mb-3">{t('gallery14.items.2.title') || 'Feuershow'}</h3>
              <p className="body-sm">{t('gallery14.items.2.description') || 'Epische Bilder, präzise Choreo, maximale Gänsehaut – für Outdoor-Momente, die niemand vergisst.'}</p>
            </div>
            <div className="discipline-showcase-card">
              <div className="discipline-icon">🎪</div>
              <h3 className="h3 mb-3">{t('gallery14.items.3.title') || 'Jonglage & Variety'}</h3>
              <p className="body-sm">{t('gallery14.items.3.description') || 'Tempo, Timing, Interaktion: von Close-up bis Bühne – perfekt für Übergänge & Opening-Acts.'}</p>
            </div>
            <div className="discipline-showcase-card">
              <div className="discipline-icon">⭐</div>
              <h3 className="h3 mb-3">{t('gallery14.items.4.title') || 'Custom Acts'}</h3>
              <p className="body-sm">{t('gallery14.items.4.description') || 'Brandfarben, Produkt-Motive, Show-Dauer: Wir bauen den Act um deinen Anlass herum.'}</p>
            </div>
            <div className="discipline-showcase-card">
              <div className="discipline-icon">🏢</div>
              <h3 className="h3 mb-3">{t('gallery14.items.5.title') || 'Firmen-Events'}</h3>
              <p className="body-sm">{t('gallery14.items.5.description') || 'Sommerfest, Weihnachtsfeier, Jubiläum – wir liefern Idee, Cast & Ablauf aus einer Hand.'}</p>
            </div>
            <div className="discipline-showcase-card">
              <div className="discipline-icon">🎭</div>
              <h3 className="h3 mb-3">{t('artists.disciplines.zauberer') || 'Zauberei'}</h3>
              <p className="body-sm">Magische Shows und Illusionen, die Ihr Publikum in Staunen versetzen</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-large text-center bg-gradient-dark">
        <div className="stage-container">
          <div className="overline text-pepe-gold mb-4">BEREIT FÜR IHR EVENT?</div>
          <h2 className="display-2 mb-8">Den passenden Künstler finden</h2>
          <p className="lead mb-12 max-w-3xl mx-auto">
            Nutzen Sie unseren Booking-Assistenten für eine maßgeschneiderte 
            Künstlerempfehlung oder kontaktieren Sie uns direkt.
          </p>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              {t('about1.next.cta.assistant')}
            </Link>
            <Link to="/kontakt" className="btn btn-ghost btn-lg">
              Direkter Kontakt
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}