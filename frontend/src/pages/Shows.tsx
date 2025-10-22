import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import DotCloudImage from '../components/ui/DotCloudImage'

interface Show {
  id: number
  title: string
  description: string
  image_url?: string
  category: string
  price?: string
  duration?: string
  created_at?: string
}

export default function Shows() {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [randomIcon, setRandomIcon] = useState('cyrwheel')
  const [autoAnimPosition, setAutoAnimPosition] = useState(0)
  const { t } = useTranslation()

  // Available icons for random shuffling
  const availableIcons = ['cyrwheel', 'juggling', 'magician', 'breakdance', 'handstand', 'pantomime', 'contemporary', 'partnerakrobatik', 'luftakrobatik', 'pole']

  // Shuffle random icon every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newIcon = availableIcons[Math.floor(Math.random() * availableIcons.length)]
      setRandomIcon(newIcon)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Auto-animation loop (8 seconds)
  useEffect(() => {
    let animationFrame: number
    const startTime = performance.now()
    const duration = 8000

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = (elapsed % duration) / duration
      const position = Math.sin(progress * Math.PI * 2) * 50 + 50
      setAutoAnimPosition(position)
      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [])

  useEffect(() => {
    const fetchShows = async () => {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://pepe-backend-4nid.onrender.com'
      
      try {
        const response = await fetch(`${baseUrl}/api/shows`, {
          signal: AbortSignal.timeout(5000)
        })
        if (response.ok) {
          const data = await response.json()
          setShows(data)
        }
      } catch (error) {
        // Shows endpoint not available, use empty array
        setShows([])
      } finally {
        setLoading(false)
      }
    }

    fetchShows()
  }, [])

  const resolveImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return ''
    if (imageUrl.startsWith('http')) return imageUrl
    const baseUrl = import.meta.env.VITE_API_URL || 'https://pepe-backend-4nid.onrender.com'
    return `${baseUrl}${imageUrl}`
  }

  const categories = Array.from(new Set(shows.map(show => show.category)))
  
  const filteredShows = selectedCategory 
    ? shows.filter(show => show.category === selectedCategory)
    : shows

  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center max-w-3xl mx-auto py-12">
            {/* Random animated DotIcon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
              <DotCloudImage
                disciplineId={randomIcon}
                size={300}
                color="#FFFFFF"
                manualAnimationPosition={autoAnimPosition}
                density={0.15}
                sampleGap={1}
              />
            </div>
            <div className="overline text-pepe-gold mb-4">{t('hero37.kicker')}</div>
            <h1 className="h1 display-gradient mb-6">
              {t('hero37.title')}
            </h1>
            <div className="hero-actions">
              <Link to="/anfragen" className="btn btn-primary btn-xl">
                {t('hero37.cta.requestShow')}
              </Link>
              <Link to="/kontakt" className="btn btn-ghost btn-lg">
                {t('hero37.cta.bookConsult')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Show Formats Overview from gallery34 */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('shows.formats.title') || 'Unsere Show-Formate'}</h2>
            <p className="body-lg max-w-3xl mx-auto">
              {t('shows.formats.subtitle') || 'Von kurzem Solo-Act bis abendfüllendem Varieté - entdecken Sie unsere professionellen Show-Formate.'}
            </p>
            <div className="text-center mt-6">
              <span className="overline text-pepe-gold">{t('gallery34.hint')}</span>
            </div>
          </div>

          <div className="show-formats-grid">
            {Array.from({ length: 6 }, (_, i) => i + 1).map((num) => {
              const item = t(`gallery34.items.${num}`, { returnObjects: true }) as any
              if (!item || typeof item === 'string') return null
              
              // Map images based on show format number (matching old Gallery34)
              const imageMap: { [key: number]: string } = {
                1: '/images/Galerie34/Solo.webp',
                2: '/images/Galerie34/Duo.webp', 
                3: '/images/Galerie34/Konzeptshow.webp',
                4: '/images/Galerie34/Variete.webp',
                5: '/images/Galerie34/Zauberer.webp',
                6: '/images/Galerie34/Feuershow.webp'
              }
              
              return (
                <div key={num} className="show-format-card">
                  <div className="show-format-image">
                    <img 
                      src={imageMap[num]} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="show-format-content">
                    <div className="show-format-meta mb-2">{item.desc}</div>
                    <h3 className="h2 mb-4">{item.title}</h3>
                    {item.details && Array.isArray(item.details) && (
                      <ul className="show-format-features mb-6">
                        {item.details.map((detail: string, index: number) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    )}
                    <Link to="/anfragen" className="btn btn-primary btn-sm">
                      Format anfragen
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Available Shows from Database */}
      {!loading && shows.length > 0 && (
        <section className="section">
          <div className="stage-container">
            <div className="section-header text-center mb-16">
              <h2 className="h1 mb-6">{t('shows.available.title') || 'Verfügbare Shows'}</h2>
              <p className="body-lg max-w-3xl mx-auto">
                {t('shows.available.subtitle') || 'Entdecken Sie unser aktuelles Show-Portfolio aus der Datenbank.'}
              </p>
            </div>

            {/* Filter Section */}
            {categories.length > 0 && (
              <div className="filter-section mb-12">
                <h3 className="h3 text-center mb-8">{t('shows.filter.title') || 'Shows nach Kategorie'}</h3>
                <div className="filter-buttons">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`filter-btn ${!selectedCategory ? 'active' : ''}`}
                  >
                    {t('shows.filter.all') || 'Alle Shows'}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`filter-btn ${
                        selectedCategory === category ? 'active' : ''
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <div className="results-count">
                    <span className="label">
                      {filteredShows.length} Shows verfügbar
                      {selectedCategory && ` in Kategorie "${selectedCategory}"`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Shows Grid - Artist Card Style */}
            <div className="show-grid-enhanced">
              {filteredShows.map((show) => (
                <div key={show.id} className="show-card-artist-style">
                  <div className="show-card-image-compact">
                    {show.image_url ? (
                      <img 
                        src={resolveImageUrl(show.image_url)}
                        alt={show.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="show-placeholder">
                        <div className="placeholder-icon">🎬</div>
                        <span className="placeholder-text">Kein Bild verfügbar</span>
                      </div>
                    )}
                    {show.category && (
                      <div className="show-category-overlay">
                        <div className="show-category-compact">
                          <span className="category-tag-compact">
                            {show.category}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="show-card-content-compact">
                    <div className="show-meta-compact">
                      <h3 className="h3 mb-2 text-left">{show.title}</h3>
                      {show.duration && (
                        <div className="show-duration">
                          <span className="duration-badge">
                            {show.duration}
                          </span>
                        </div>
                      )}
                    </div>
                    {show.description && (
                      <div className="show-description-compact">
                        <p className="body-sm line-clamp-2 text-left">{show.description}</p>
                      </div>
                    )}
                    <div className="show-actions">
                      <Link to="/anfragen" className="btn btn-primary btn-sm">
                        Show anfragen
                      </Link>
                      {show.price && (
                        <span className="show-price text-pepe-gold font-medium">
                          {show.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <section className="section">
          <div className="stage-container">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p className="body mt-4">Shows werden geladen...</p>
            </div>
          </div>
        </section>
      )}


      {/* Call-to-Action */}
      <section className="section-large text-center bg-gradient-dark">
        <div className="stage-container">
          <div className="overline text-pepe-gold mb-4">{t('about1.next.kicker')}</div>
          <h2 className="display-2 mb-8">{t('about1.next.title')}</h2>
          <p className="lead mb-12 max-w-3xl mx-auto">
            {t('about1.next.body')}
          </p>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              {t('about1.next.cta.assistant')}
            </Link>
            <Link to="/kontakt" className="btn btn-ghost btn-lg">
              {t('about1.next.cta.consult')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}