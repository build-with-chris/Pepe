import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Buhnenzauber from '../components/Buhnenzauber'
import DotCloudImage from '../components/ui/DotCloudImage'
import heroImage from '../assets/PepeHero.webp'

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
  const [disciplines, setDisciplines] = useState<Array<{id: string, name: string, image: string, description: string, artistCount: number}>>([])
  const [loading, setLoading] = useState(true)
  const [expandedDiscipline, setExpandedDiscipline] = useState<number>(0)
  const [isStackPaused, setIsStackPaused] = useState(false)
  const [randomIcon1, setRandomIcon1] = useState('cyrwheel')
  const [autoAnimPosition, setAutoAnimPosition] = useState(0)
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Available icons for random shuffling
  const availableIcons = ['cyrwheel', 'juggling', 'magician', 'breakdance', 'handstand', 'pantomime', 'contemporary', 'partnerakrobatik', 'luftakrobatik', 'pole']

  // Map discipline names to icon names for DotCloudImage
  const disciplineToIcon: Record<string, string> = {
    'contemporary dance': 'contemporary',
    'chinese pole': 'pole',
    'cyr-wheel': 'cyrwheel',
    'cyr wheel': 'cyrwheel',
    'hula hoop': 'logo',
    'bodenakrobatik': 'logo',
    'breakdance': 'breakdance',
    'handstand': 'handstand',
    'jonglage': 'juggling',
    'luftakrobatik': 'luftakrobatik',
    'moderation': 'logo',
    'pantomime': 'pantomime',
    'partnerakrobatik': 'partnerakrobatik',
    'zauberer': 'magician',
    'zauberei': 'magician'
  }

  // Shuffle random icons every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newIcon1 = availableIcons[Math.floor(Math.random() * availableIcons.length)]
      const newIcon2 = availableIcons[Math.floor(Math.random() * availableIcons.length)]
      setRandomIcon1(newIcon1)
      setRandomIcon2(newIcon2)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Animation synced to accordion opening - starts from 0 when card becomes active
  useEffect(() => {
    let animationFrame: number
    const startTime = performance.now()
    const duration = 8000 // 8 seconds for slow animation

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = (elapsed % duration) / duration
      const position = Math.sin(progress * Math.PI * 2) * 50 + 50 // 0-100 oscillation
      setAutoAnimPosition(position)
      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [expandedDiscipline]) // Reset animation when accordion changes

  const handleArtistClick = (artistId: number) => {
    navigate(`/kuenstler?flip=${artistId}`)
  }

  // Create disciplines from artists data
  const createDisciplinesFromArtists = (artistsData: Artist[]) => {
    const disciplineMap = new Map<string, { artists: Artist[], count: number }>()
    
    // Collect all unique disciplines with their artists
    artistsData.forEach(artist => {
      artist.disciplines?.forEach(discipline => {
        const normalizedDiscipline = discipline.trim()
        if (!disciplineMap.has(normalizedDiscipline)) {
          disciplineMap.set(normalizedDiscipline, { artists: [], count: 0 })
        }
        const disciplineData = disciplineMap.get(normalizedDiscipline)!
        disciplineData.artists.push(artist)
        disciplineData.count += 1
      })
    })

    // Convert to array and shuffle randomly
    const allDisciplines = Array.from(disciplineMap.entries())
    const shuffled = allDisciplines.sort(() => Math.random() - 0.5)
    
    // Take random 6 disciplines
    const randomDisciplines = shuffled
      .slice(0, 6)
      .map(([discipline, data]) => {
        // Create different versions for different purposes
        const normalizedName = discipline.trim()
        const lowerCaseName = normalizedName.toLowerCase()
        
        // Try different translation key formats
        const possibleKeys = [
          `artists.disciplines.${lowerCaseName.replace(/[\s-]+/g, '')}`,
          `artists.disciplines.${normalizedName.replace(/[\s-]+/g, '')}`,
          `artists.disciplines.${lowerCaseName}`,
        ]
        
        // Find first working translation
        let translatedName = normalizedName
        for (const key of possibleKeys) {
          const translation = t(key)
          if (translation && translation !== key) {
            translatedName = translation
            break
          }
        }
        
        // Map to correct image path - check various naming conventions
        let imagePath = ''
        
        // Common discipline to image mappings
        const imageMapping: Record<string, string> = {
          'contemporary dance': 'Contemporary_Dance',
          'chinese pole': 'Chinese_Pole',
          'cyr-wheel': 'Cyr-Wheel',
          'cyr wheel': 'Cyr-Wheel',
          'hula hoop': 'Hula_Hoop',
          'bodenakrobatik': 'Bodenakrobatik',
          'breakdance': 'Breakdance',
          'handstand': 'Handstand',
          'jonglage': 'Jonglage',
          'luftakrobatik': 'Luftakrobatik',
          'moderation': 'Moderation',
          'pantomime': 'Pantomime',
          'partnerakrobatik': 'Partnerakrobatik',
          'zauberer': 'Zauberer',
          'zauberei': 'Zauberer'
        }
        
        // Try to find matching image
        const searchKey = lowerCaseName
        if (imageMapping[searchKey]) {
          imagePath = `/images/disciplines/${imageMapping[searchKey]}.webp`
        } else {
          // Fallback: try with underscores for multi-word disciplines
          const fallbackName = normalizedName.replace(/\s+/g, '_')
          imagePath = `/images/disciplines/${fallbackName}.webp`
        }

        // Create dynamic description based on actual artists
        const artistCount = data.count
        const sampleArtists = data.artists.slice(0, 3).map(a => a.name).join(', ')
        const description = `${artistCount} erfahrene Künstler in unserem Netzwerk beherrschen ${translatedName}. ${sampleArtists.length > 0 ? `Darunter: ${sampleArtists}` : ''}`
        
        return {
          id: lowerCaseName.replace(/[\s-]+/g, ''),
          name: translatedName,
          image: imagePath,
          description: description,
          artistCount: artistCount
        }
      })

    return randomDisciplines
  }

  // Auto-cycle through disciplines (pause when user interacts)
  useEffect(() => {
    if (isStackPaused || disciplines.length === 0) return
    
    const interval = setInterval(() => {
      setExpandedDiscipline(prev => (prev + 1) % disciplines.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [disciplines.length, isStackPaused])

  // Reset expanded discipline when disciplines change
  useEffect(() => {
    if (disciplines.length > 0) {
      setExpandedDiscipline(0)
    }
  }, [disciplines])

  const handleDisciplineClick = (index: number) => {
    setExpandedDiscipline(index)
    setIsStackPaused(true)
    // Resume auto-cycling after 8 seconds
    setTimeout(() => setIsStackPaused(false), 8000)
  }

  const handleStackMouseEnter = () => {
    setIsStackPaused(true)
  }

  const handleStackMouseLeave = () => {
    setIsStackPaused(false)
  }

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'https://pepe-backend-4nid.onrender.com'
        const response = await fetch(`${baseUrl}/api/artists`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000)
        })
        
        if (response.ok) {
          const data = await response.json()
          // Shuffle artists randomly and take only 4
          const shuffled = data.sort(() => 0.5 - Math.random())
          setArtists(shuffled.slice(0, 4))
          
          // Create disciplines from all artists data
          const dynamicDisciplines = createDisciplinesFromArtists(data)
          setDisciplines(dynamicDisciplines.length > 0 ? dynamicDisciplines : [
            // Fallback disciplines if database is empty
            {
              id: 'zauberer',
              name: t('artists.disciplines.zauberer') || 'Zauberei',
              image: '/images/disciplines/Zauberer.webp',
              description: 'Magische Momente und Illusionen für jedes Publikum.',
              artistCount: 0
            }
          ])
        } else {
          console.error('Failed to fetch artists, status:', response.status)
        }
      } catch (error) {
        console.error('Failed to fetch artists:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArtists()
  }, [t])

  const resolveImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return ''
    if (imageUrl.startsWith('http')) return imageUrl
    const baseUrl = import.meta.env.VITE_API_URL || 'https://pepe-backend-4nid.onrender.com'
    return `${baseUrl}${imageUrl}`
  }

  // Helper functions for discipline accordion content
  const getDisciplineSpecialties = (disciplineId: string): string => {
    const specialties: Record<string, string> = {
      'zauberer': 'Close-Up Magic, Bühnenillusionen, mentale Magie und interaktive Tricks',
      'luftakrobatik': 'Vertikaltuch, Aerial Hoop, Trapez und freihängende Akrobatik',
      'handstand': 'Ein-Hand-Handstand, Cane-Balance, Adagio und Kraft-Akrobatik',
      'jonglage': 'Objekt-Manipulation, LED-Jonglage, Feuer-Jonglage und Comedy-Jonglage',
      'pantomime': 'Stumme Komödie, Charakterspiel, Interaktion und emotionales Theater',
      'partnerakrobatik': 'Adagio, Hebungen, menschliche Pyramiden und synchrone Bewegungen',
      'bodenakrobatik': 'Akrobatische Sprünge, Rollen, Handstände und dynamische Sequenzen',
      'contemporaryDance': 'Moderne Choreografie, expressive Bewegung und künstlerischer Tanz',
      'breakdance': 'Power Moves, Freezes, Toprock und Battle-orientierte Performance'
    }
    return specialties[disciplineId] || 'Professionelle Technik, jahrelange Erfahrung und einzigartige Performance-Qualität'
  }

  const getDisciplineApplications = (disciplineId: string): string => {
    const applications: Record<string, string> = {
      'zauberer': 'Gala-Dinner, Firmenevents, Hochzeiten, Meet & Greet, Tischzauberei',
      'luftakrobatik': 'Große Bühnen, Hotels, Messen, Gala-Shows, Outdoor-Events',
      'handstand': 'Kompakte Räume, Cocktail-Empfänge, Gala-Highlights, Corporate Events',
      'jonglage': 'Street Performance, Bühnen-Shows, Kinder-Events, LED-Shows, Outdoor',
      'pantomime': 'Theater, Comedy-Shows, Straßenfeste, Kinder-Unterhaltung, Interaktives',
      'partnerakrobatik': 'Romantische Events, Hochzeiten, Gala-Abende, Tanz-Performances',
      'bodenakrobatik': 'Sport-Events, Jugend-Shows, Schulveranstaltungen, Competitions',
      'contemporaryDance': 'Kulturelle Events, Kunstgalerien, moderne Hochzeiten, Corporate',
      'breakdance': 'Urban Events, Jugend-Kultur, Battles, Street-Festivals, Hip-Hop-Shows'
    }
    return applications[disciplineId] || 'Vielseitig einsetzbar für Events aller Art - von intimen Feiern bis zu großen Shows'
  }


  return (
    <main>
      {/* Hero Section - Full Viewport Height */}
      <section className="hero-full">
        {/* Background Hero Image */}
        <div className="hero-background">
          <img 
            src={heroImage} 
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
              {/* DotIcon Logo with scroll animation */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
                <DotCloudImage
                  disciplineId="logo"
                  size={600}
                  density={2.0}
                  color="#FFFFFF"
                  aspectRatio={3}
                  sampleGap={2}
                  minDotSize={1.2}
                  maxDotSize={5.8}
                />
              </div>
              <div className="overline text-pepe-gold mb-4">{t('home.hero.kicker')}</div>
              <h1 className="hero-title-elegant display-gradient mb-6">
                {t('home.hero.title')}
              </h1>
              <div className="hero-actions">
                <Link to="/anfragen" className="btn btn-primary btn-lg">
                  {t('home.hero.primaryCta')}
                </Link>
                <Link to="/shows" className="btn btn-secondary btn-lg">
                  {t('home.hero.secondaryCta')}
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

      {/* Bento Grid Section */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="bento-grid-square">
            {/* Main Circus Tent Card - Square Format */}
            <Link to="/anfragen" className="bento-card-square bento-card-main-square bento-clickable">
              <div className="bento-card-bg">
                <img 
                  src="/images/Bento1/CircusTent.png" 
                  alt="Circuszelt mit Luftartistin"
                  className="bento-main-image"
                />
                <div className="bento-spotlight-left"></div>
                <div className="bento-spotlight-right"></div>
                <div className="bento-gradient-overlay"></div>
              </div>
              <div className="bento-card-header">
                <h2 className="bento-title">{t('bento1.hero.title')}</h2>
                <div className="bento-sparkles">
                  <Buhnenzauber />
                </div>
              </div>
              <div className="bento-destination-tag">
                <span>Booking Assistant</span>
              </div>
            </Link>

            {/* Booking Assistant Card - Square Format */}
            <Link to="/anfragen" className="bento-card-square bento-card-cta-square bento-clickable">
              <div className="bento-card-content">
                <p className="bento-cta-text">
                  {t('bento1.cta.body')}
                </p>
                <div className="btn btn-primary btn-lg">
                  {t('bento1.cta.btnStart')}
                  <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </div>
              </div>
              <div className="bento-destination-tag">
                <span>Booking starten</span>
              </div>
            </Link>

            {/* Innovative Concepts Card - Square Format */}
            <Link to="/shows" className="bento-card-square bento-card-image-square bento-clickable">
              <div className="bento-card-bg">
                <img 
                  src="/images/Bento1/Burn.webp" 
                  alt="Innovative show concepts"
                  className="bento-bg-image"
                />
                <div className="bento-image-overlay"></div>
              </div>
              <div className="bento-card-header">
                <h3 className="bento-title">{t('bento1.third.title')}</h3>
              </div>
              <div className="bento-destination-tag">
                <span>Shows entdecken</span>
              </div>
            </Link>

            {/* Captivating Artistry Slider Card - Square Format */}
            <Link to="/kuenstler" className="bento-card-square bento-card-slider-square bento-clickable">
              <div className="bento-card-bg">
                <img 
                  src="/images/Bento1/Slider1.webp" 
                  alt="Show impression"
                  className="bento-bg-image active"
                />
                <img 
                  src="/images/Bento1/Slider2.webp" 
                  alt="Show impression"
                  className="bento-bg-image"
                />
                <img 
                  src="/images/Bento1/Slider3.webp" 
                  alt="Show impression"
                  className="bento-bg-image"
                />
                <div className="bento-image-overlay"></div>
              </div>
              <div className="bento-card-header">
                <h3 className="bento-title">{t('bento1.middle.title')}</h3>
              </div>
              <div className="bento-destination-tag">
                <span>Künstler ansehen</span>
              </div>
            </Link>

            {/* Taking Responsibility Card - Square Format */}
            <Link to="/team" className="bento-card-square bento-card-responsibility-square bento-clickable">
              <div className="bento-card-content">
                <div className="responsibility-icon">
                  <div className="circular-progress"></div>
                </div>
                <h3 className="bento-title">{t('bento1.responsibility.title')}</h3>
                <p className="bento-text">
                  {t('bento1.responsibility.body1')}<br/>
                  {t('bento1.responsibility.body2')}
                </p>
              </div>
              <div className="bento-destination-tag">
                <span>Unser Team</span>
              </div>
            </Link>

            {/* 100% Fairness Card - Square Format */}
            <Link to="/referenzen" className="bento-card-square bento-card-fairness-square bento-clickable">
              <div className="bento-card-content">
                <h3 className="bento-title">{t('bento1.values.fairnessTitle')}</h3>
                <p className="bento-text">
                  {t('bento1.values.fairnessBodyPrefix')} <span className="text-pepe-gold">{t('bento1.values.linkText')}</span>.
                </p>
                <div className="artist-avatars">
                  <img src="/images/Slider/Artist1.webp" alt="Artist 1" className="avatar" />
                  <img src="/images/Slider/Artist2.webp" alt="Artist 2" className="avatar" />
                  <img src="/images/Slider/Artist3.webp" alt="Artist 3" className="avatar" />
                  <img src="/images/Slider/Artist4.webp" alt="Artist 4" className="avatar" />
                  <img src="/images/Slider/Artist5.webp" alt="Artist 5" className="avatar" />
                </div>
              </div>
              <div className="bento-destination-tag">
                <span>Referenzen</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Find the Perfect Showact Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            {/* Random shuffling DotIcon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
              <DotCloudImage
                key={randomIcon1}
                disciplineId={randomIcon1}
                size={300}
                density={2.0}
                color="var(--pepe-gold)"
                sampleGap={2}
                minDotSize={1.2}
                maxDotSize={3.4}
              />
            </div>
            <h2 className="h1 mb-6">{t('home.findArtistTitle')}</h2>
            <p className="body-lg max-w-3xl mx-auto mb-8">
              {t('home.findArtistSubtitle')}
            </p>
            <div className="text-center mb-12">
              <Link to="/anfragen" className="btn btn-primary btn-xl">
                {t('home.findArtistButton')}
              </Link>
              <p className="text-sm text-pepe-t64 mt-4">{t('home.findArtistTime')}</p>
            </div>
          </div>

          {/* Featured Artists Preview */}
          {loading ? (
            <div className="text-center py-12">
              <div className="body">{t('artists.loading')}</div>
            </div>
          ) : (
            <div className="artist-preview-grid">
              {artists.map((artist) => (
                <div 
                  key={artist.id} 
                  className="artist-preview-item"
                  onClick={() => handleArtistClick(artist.id)}
                >
                  <div className="artist-preview-card-image">
                    {artist.profile_image_url ? (
                      <img 
                        src={resolveImageUrl(artist.profile_image_url)}
                        alt={artist.name}
                        className="artist-square-image"
                      />
                    ) : (
                      <div className="artist-image-placeholder">
                        <span className="text-4xl">🎭</span>
                      </div>
                    )}
                  </div>
                  <div className="artist-preview-info">
                    <h4 className="artist-preview-name">{artist.name}</h4>
                    <div className="artist-preview-badges">
                      {artist.disciplines?.slice(0, 3).map((discipline, index) => (
                        <span key={index} className="artist-discipline-tag">
                          {discipline}
                        </span>
                      )) || <span className="artist-discipline-tag">Künstler</span>}
                      {(artist.disciplines?.length || 0) > 3 && (
                        <span className="artist-discipline-tag-more">+{(artist.disciplines?.length || 0) - 3}</span>
                      )}
                    </div>
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

      {/* PepeShows - More than Artist Agency */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="text-center mb-16">
            <h2 className="display-2 mb-8">
              {t('home.cta.heading')}
            </h2>
            <p className="lead max-w-4xl mx-auto">
              {t('home.cta.description')}
            </p>
          </div>
          <div className="text-center">
            <Link to="/team" className="btn btn-secondary btn-lg">
              {t('home.cta.button')}
            </Link>
          </div>
        </div>
      </section>

      {/* Excellence Section with Animated Disciplines */}
      <section className="section">
        <div className="stage-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            <div>
              <h2 className="display-2 mb-6">{t('home.excellence.heading')}</h2>
              <p className="body-lg mb-6">{t('home.excellence.copy')}</p>
              <p className="body text-pepe-t64 mb-0">{t('home.excellence.note')}</p>
            </div>
            <div 
              className="discipline-card-stack"
              onMouseEnter={handleStackMouseEnter}
              onMouseLeave={handleStackMouseLeave}
            >
              {disciplines.map((discipline, index) => (
                <div 
                  key={discipline.id} 
                  className={`discipline-card ${index === expandedDiscipline ? 'active' : ''}`}
                  style={{ '--index': index } as React.CSSProperties}
                  onMouseEnter={() => handleDisciplineClick(index)}
                >
                  {/* Text-only display for closed cards */}
                  <div className="discipline-text-only">
                    {discipline.name}
                  </div>
                  
                  {/* DotIcon only - no background image */}
                  <div className="discipline-image-container">
                    {index === expandedDiscipline && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        pointerEvents: 'none'
                      }}>
                        <DotCloudImage
                          disciplineId={disciplineToIcon[discipline.name.toLowerCase()] || 'logo'}
                          size={300}
                          density={2.0}
                          color="var(--pepe-gold)"
                          sampleGap={2}
                          minDotSize={1.2}
                          maxDotSize={3.4}
                          manualAnimationPosition={autoAnimPosition}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced Overlay content for active card */}
                  <div className="discipline-overlay">
                    <h3 className="text-2xl font-bold text-white mb-4">{discipline.name}</h3>
                    <p className="discipline-description text-white/90 mb-6">
                      {discipline.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Logos */}
          <div className="text-center mb-10">
            <h3 className="h2 mb-8">{t('logos3.heading')}</h3>
          </div>
          <div className="logo-strip">
            <div className="logo-item">
              <img src="/images/Logos/Porsche.png" alt="Porsche" className="client-logo" />
            </div>
            <div className="logo-item">
              <img src="/images/Logos/google.svg" alt="Google" className="client-logo" />
            </div>
            <div className="logo-item">
              <img src="/images/Logos/mcdonalds.svg" alt="McDonald's" className="client-logo" />
            </div>
            <div className="logo-item">
              <img src="/images/Logos/astrazeneca.svg" alt="AstraZeneca" className="client-logo" />
            </div>
            <div className="logo-item">
              <img src="/images/Logos/tollwood.svg" alt="Tollwood Festival" className="client-logo" />
            </div>
            <div className="logo-item">
              <img src="/images/Logos/european-championships.svg" alt="European Championships" className="client-logo" />
            </div>
          </div>
        </div>
      </section>


      {/* Next Steps CTA */}
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

      {/* Mission Statement */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="overline text-pepe-gold mb-4">{t('about1.mission.kicker')}</div>
            <p className="h2 mb-0">{t('about1.mission.body')}</p>
          </div>
        </div>
      </section>

      {/* Final CTA with Agency Info */}
      <section className="section-large text-center">
        <div className="stage-container">
          <h2 className="display-2 mb-8">
            {t('home.cta.heading')}
          </h2>
          <p className="lead mb-12 max-w-3xl mx-auto">
            {t('home.cta.description')}
          </p>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              Jetzt anfragen
            </Link>
            <Link to="/kontakt" className="btn btn-ghost btn-lg">
              {t('home.cta.button')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
