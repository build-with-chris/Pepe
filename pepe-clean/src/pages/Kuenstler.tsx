import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

interface Artist {
  id: number
  name: string
  disciplines: string[]
  profile_image_url?: string
  bio?: string
  experience_years?: number
  gallery_urls?: string[]
}

export default function Kuenstler() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('')
  const [cardStates, setCardStates] = useState<Map<number, 'front' | 'back' | 'gallery'>>(new Map())
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [galleryImageIndices, setGalleryImageIndices] = useState<Map<number, number>>(new Map())
  const [enlargedCard, setEnlargedCard] = useState<number | null>(null)
  const { t } = useTranslation()
  const location = useLocation()

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

  // Check for flip parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const flipId = urlParams.get('flip')
    if (flipId) {
      const artistId = parseInt(flipId)
      if (!isNaN(artistId)) {
        setCardState(artistId, 'back')
        // Scroll to the artist card after a short delay
        setTimeout(() => {
          const element = document.getElementById(`artist-${artistId}`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 500)
      }
    }
  }, [location.search])

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'https://pepe-backend-4nid.onrender.com'
        const response = await fetch(`${baseUrl}/api/artists`)
        if (response.ok) {
          const data = await response.json()
          setArtists(data)
          setFilteredArtists(data)
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

  const setCardState = (artistId: number, state: 'front' | 'back' | 'gallery') => {
    const newCardStates = new Map(cardStates)
    newCardStates.set(artistId, state)
    setCardStates(newCardStates)
  }

  const getCardState = (artistId: number) => {
    return cardStates.get(artistId) || 'front'
  }

  const navigateGallery = (artistId: number, direction: 'next' | 'prev') => {
    const artist = filteredArtists.find(a => a.id === artistId)
    if (!artist?.gallery_urls?.length) return
    
    const currentIndex = galleryImageIndices.get(artistId) || 0
    let newIndex = currentIndex
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % artist.gallery_urls.length
    } else {
      newIndex = currentIndex === 0 ? artist.gallery_urls.length - 1 : currentIndex - 1
    }
    
    const newIndices = new Map(galleryImageIndices)
    newIndices.set(artistId, newIndex)
    setGalleryImageIndices(newIndices)
  }

  const getCurrentGalleryImage = (artistId: number) => {
    return galleryImageIndices.get(artistId) || 0
  }

  const toggleCardEnlarge = (artistId: number | null) => {
    setEnlargedCard(enlargedCard === artistId ? null : artistId)
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

      {/* Disciplines Showcase */}
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

      {/* Artists Section */}
      <section className="section">
        <div className="stage-container">
          
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">Unsere Künstler</h2>
            <p className="body-lg max-w-3xl mx-auto">
              Lernen Sie die talentierten Persönlichkeiten kennen, die unsere Vision zum Leben erwecken.
            </p>
          </div>

          {/* Filter Section */}
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
            <div className="artist-grid-enhanced">
              {filteredArtists.map((artist) => {
                const cardState = getCardState(artist.id)
                const currentGalleryIndex = getCurrentGalleryImage(artist.id)
                const hasGallery = artist.gallery_urls && artist.gallery_urls.length > 0
                const isEnlarged = enlargedCard === artist.id

                return (
                  <div key={artist.id} id={`artist-${artist.id}`} className={`artist-card-container ${cardState} ${isEnlarged ? 'enlarged' : ''}`}>
                    <div className="artist-card-inner">
                      {/* Card Navigation Circles */}
                      <div className="card-navigation">
                        <button 
                          className={`nav-circle ${cardState === 'front' ? 'active' : ''}`}
                          onClick={() => setCardState(artist.id, 'front')}
                          aria-label="Vorderseite"
                        >
                          <span className="material-icon">person</span>
                        </button>
                        <button 
                          className={`nav-circle ${cardState === 'back' ? 'active' : ''}`}
                          onClick={() => setCardState(artist.id, 'back')}
                          aria-label="Rückseite"
                        >
                          <span className="material-icon">info</span>
                        </button>
                        {hasGallery && (
                          <button 
                            className={`nav-circle ${cardState === 'gallery' ? 'active' : ''}`}
                            onClick={() => setCardState(artist.id, 'gallery')}
                            aria-label="Galerie"
                          >
                            <span className="material-icon">photo_library</span>
                          </button>
                        )}
                        <button 
                          className="nav-circle enlarge-btn"
                          onClick={() => toggleCardEnlarge(artist.id)}
                          aria-label="Vergrößern"
                        >
                          <span className="material-icon">{isEnlarged ? 'close_fullscreen' : 'open_in_full'}</span>
                        </button>
                      </div>

                      {/* Front Side */}
                      <div className={`artist-card-side front ${cardState === 'front' ? 'active' : ''}`}>
                        <div className="artist-card-image-compact">
                          {artist.profile_image_url ? (
                            <img 
                              src={resolveImageUrl(artist.profile_image_url)}
                              alt={artist.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="artist-placeholder">
                              <div className="placeholder-icon">🎭</div>
                              <span className="placeholder-text">Kein Bild verfügbar</span>
                            </div>
                          )}
                          <div className="artist-disciplines-overlay">
                            <div className="artist-disciplines-compact">
                              {artist.disciplines?.map((discipline, index) => (
                                <span key={index} className="discipline-tag-compact">
                                  {discipline}
                                </span>
                              )) || <span className="discipline-tag-compact">Künstler</span>}
                            </div>
                          </div>
                        </div>
                        <div className="artist-card-content-compact">
                          <div className="artist-meta-compact">
                            <h3 className="h3 mb-2 text-left">{artist.name}</h3>
                            {artist.experience_years && (
                              <div className="artist-experience">
                                <span className="experience-badge">
                                  {artist.experience_years} Jahre Erfahrung
                                </span>
                              </div>
                            )}
                          </div>
                          {artist.bio && (
                            <div className="artist-bio-compact">
                              <p className="body-sm line-clamp-2 text-left">{artist.bio}</p>
                            </div>
                          )}
                          <div className="artist-actions">
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => setCardState(artist.id, 'back')}
                            >
                              Profil ansehen
                            </button>
                            <Link to="/anfragen" className="btn btn-ghost btn-sm">
                              Buchen
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Back Side */}
                      <div className={`artist-card-side back ${cardState === 'back' ? 'active' : ''}`}>
                        <div className="artist-card-back-header">
                          <div className="artist-back-image-large">
                            {artist.profile_image_url ? (
                              <img 
                                src={resolveImageUrl(artist.profile_image_url)}
                                alt={artist.name}
                                className="w-full h-full object-cover opacity-20"
                              />
                            ) : (
                              <div className="artist-placeholder opacity-20">
                                <div className="placeholder-icon">🎭</div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="artist-card-back-content">
                          {artist.bio ? (
                            <div className="artist-full-bio">
                              <h4 className="h4 mb-3 text-left">Über {artist.name}</h4>
                              <div className="bio-scroll-area">
                                <p className="body-sm leading-relaxed text-left">{artist.bio}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="no-bio-message">
                              <p className="body-sm text-left opacity-70">
                                Keine weiteren Informationen verfügbar.
                              </p>
                            </div>
                          )}
                          
                          <div className="artist-back-actions">
                            <Link to="/anfragen" className="btn btn-primary btn-sm w-full">
                              {artist.name} buchen
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Gallery Side */}
                      {hasGallery && (
                        <div className={`artist-card-side gallery ${cardState === 'gallery' ? 'active' : ''}`}>
                          <div className="artist-gallery-container">
                            <div className="gallery-header">
                              <h4 className="h4 text-left">{artist.name} - Galerie</h4>
                              <div className="gallery-counter">
                                {currentGalleryIndex + 1} / {artist.gallery_urls!.length}
                              </div>
                            </div>
                            
                            <div className="gallery-image-container">
                              <img 
                                src={resolveImageUrl(artist.gallery_urls![currentGalleryIndex])}
                                alt={`${artist.name} Galerie ${currentGalleryIndex + 1}`}
                                className="gallery-image"
                              />
                              
                              {/* Gallery Navigation */}
                              {artist.gallery_urls!.length > 1 && (
                                <>
                                  <button 
                                    className="gallery-nav prev"
                                    onClick={() => navigateGallery(artist.id, 'prev')}
                                    aria-label="Vorheriges Bild"
                                  >
                                    <span className="material-icon">chevron_left</span>
                                  </button>
                                  <button 
                                    className="gallery-nav next"
                                    onClick={() => navigateGallery(artist.id, 'next')}
                                    aria-label="Nächstes Bild"
                                  >
                                    <span className="material-icon">chevron_right</span>
                                  </button>
                                </>
                              )}
                            </div>
                            
                            {/* Gallery Dots */}
                            {artist.gallery_urls!.length > 1 && (
                              <div className="gallery-dots">
                                {artist.gallery_urls!.map((_, index) => (
                                  <button 
                                    key={index}
                                    className={`gallery-dot ${index === currentGalleryIndex ? 'active' : ''}`}
                                    onClick={() => {
                                      const newIndices = new Map(galleryImageIndices)
                                      newIndices.set(artist.id, index)
                                      setGalleryImageIndices(newIndices)
                                    }}
                                    aria-label={`Bild ${index + 1} anzeigen`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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