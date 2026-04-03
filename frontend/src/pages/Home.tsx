import { useState, useEffect, lazy, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DotCloudImage from '../components/ui/DotCloudImage'
import { getApiBaseUrl } from '@/lib/apiBase'
import FloatingDisciplines from '../components/FloatingDisciplines'
import heroImage from '../assets/PepeHero.webp'
import SEO, { pageSEO } from '@/components/SEO'

const InteractivePepeParticles = lazy(() => import('../components/InteractivePepeParticles'))

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
  const [responsibilityWorldPosition, setResponsibilityWorldPosition] = useState(0)
  const [responsibilityWorldClicked, setResponsibilityWorldClicked] = useState(false)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const apply = () => setIsDesktop(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // Available icons for random shuffling
  const availableIcons = ['cyrwheel', 'magician', 'breakdance', 'handstand', 'contemporary', 'partnerakrobatik', 'luftakrobatik', 'pole', 'hulahoop', 'flooracrobatics', 'moderation']

  // Map discipline names to icon names for DotCloudImage
  const disciplineToIcon: Record<string, string> = {
    'contemporary dance': 'contemporary',
    'chinese pole': 'pole',
    'cyr-wheel': 'cyrwheel',
    'cyr wheel': 'cyrwheel',
    'hula hoop': 'hulahoop',
    'bodenakrobatik': 'flooracrobatics',
    'breakdance': 'breakdance',
    'handstand': 'handstand',
    'jonglage': 'juggling',
    'luftakrobatik': 'luftakrobatik',
    'moderation': 'moderation',
    'pantomime': 'pantomime',
    'partnerakrobatik': 'partnerakrobatik',
    'zauberer': 'magician',
    'zauberei': 'magician',
    'verantwortung': 'world'
  }

  // Shuffle random icons every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newIcon1 = availableIcons[Math.floor(Math.random() * availableIcons.length)]
      setRandomIcon1(newIcon1)
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
    // Use hardcoded disciplines with all icons
    const hardcodedDisciplines = [
      { id: '1', name: 'Cyr Wheel', image: '/images/disciplines/Cyr-Wheel.webp', description: 'Spektakuläre Akrobatik im Riesenrad', artistCount: 5 },
      { id: '3', name: 'Zauberer', image: '/images/disciplines/Zauberer.webp', description: 'Magische Illusionen', artistCount: 6 },
      { id: '4', name: 'Breakdance', image: '/images/disciplines/Breakdance.webp', description: 'Urbane Tanzkunst', artistCount: 4 },
      { id: '5', name: 'Handstand', image: '/images/disciplines/Handstand.webp', description: 'Kraft und Balance', artistCount: 7 },
      { id: '7', name: 'Contemporary Dance', image: '/images/disciplines/Contemporary_Dance.webp', description: 'Moderne Choreografie', artistCount: 5 },
      { id: '8', name: 'Partnerakrobatik', image: '/images/disciplines/Partnerakrobatik.webp', description: 'Synchrone Bewegungen', artistCount: 6 },
      { id: '9', name: 'Luftakrobatik', image: '/images/disciplines/Luftakrobatik.webp', description: 'Artistik in der Luft', artistCount: 9 },
      { id: '10', name: 'Chinese Pole', image: '/images/disciplines/Chinese_Pole.webp', description: 'Vertikale Akrobatik', artistCount: 4 },
    ]

    setDisciplines(hardcodedDisciplines)

    // Set loading to false immediately
    setLoading(false)

    const fetchArtists = async () => {
      try {
        const baseUrl = getApiBaseUrl()
        if (!baseUrl) return
        const response = await fetch(`${baseUrl}/api/artists`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000) // Shorter timeout
        })

        if (response.ok) {
          const data = await response.json()
          // Shuffle artists randomly and take only 4
          const shuffled = data.sort(() => 0.5 - Math.random())
          setArtists(shuffled.slice(0, 4))
        }
      } catch (error) {
        // Silently fail - page works without artist preview
        console.warn('Artists API unavailable:', error)
      }
    }

    fetchArtists()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const resolveImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return ''
    if (imageUrl.startsWith('http')) return imageUrl
    const baseUrl = getApiBaseUrl()
    if (!baseUrl) return ''
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
      <SEO {...pageSEO.home} />
      {/* Desktop Hero - Interactive Particles */}
      {isDesktop ? (
        <section style={{
          position: 'relative',
          height: '100vh',
          overflow: 'hidden',
          background: '#000'
        }}>
          {/* Background image */}
          <img
            src={heroImage}
            alt="Pepe Shows – Artistik und Bühnenkunst bei einer Live-Veranstaltung"
            width={1920}
            height={1080}
            fetchPriority="high"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              zIndex: 0
            }}
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1
          }} />

          {/* Particles overlay */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
            <Suspense fallback={null}>
              <InteractivePepeParticles />
            </Suspense>
          </div>

          <div style={{
            position: 'absolute',
            bottom: '10vh',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(1rem, 2.5vh, 2rem)',
            textAlign: 'center',
            maxWidth: '1200px',
            width: '90%',
            padding: '0 1rem'
          }}>
            <h1 className="hero-title-elegant display-gradient" style={{
              fontSize: 'clamp(1.5rem, 6vw, 4rem)',
              margin: 0,
              lineHeight: 1.1,
              maxWidth: '100%',
              wordWrap: 'break-word'
            }}>
              {t('home.hero.title')}
            </h1>

            <p className="body-lg" style={{
              color: 'var(--pepe-gold)',
              margin: 'clamp(0.5rem, 1.5vh, 1rem) 0',
              fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
              fontWeight: 500,
              letterSpacing: '0.02em'
            }}>
              {t('home.hero.claim')}
            </p>

            <div style={{
              display: 'flex',
              gap: 'clamp(0.5rem, 2vw, 1rem)',
              flexWrap: 'wrap',
              justifyContent: 'center',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
            }}>
              <Link to="/anfragen" className="btn btn-primary btn-lg" style={{
                fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
                padding: 'clamp(0.625rem, 2vw, 0.875rem) clamp(1.25rem, 4vw, 2rem)'
              }}>
                {t('home.hero.primaryCta')}
              </Link>
              <Link to="/shows" className="btn btn-secondary btn-lg" style={{
                fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
                padding: 'clamp(0.625rem, 2vw, 0.875rem) clamp(1.25rem, 4vw, 2rem)'
              }}>
                {t('home.hero.secondaryCta')}
              </Link>
            </div>
          </div>
        </section>
      ) : (
        /* Mobile Hero - Static image with DotCloud logo */
        <section style={{
          position: 'relative',
          height: '100svh',
          overflow: 'visible'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0
          }}>
            <img
              src={heroImage}
              alt="Pepe Shows – Artistik und Bühnenkunst bei einer Live-Veranstaltung"
              width={1200}
              height={800}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.7) 100%)'
            }} />
          </div>

          {/* Fixed Logo for mobile - smaller and higher */}
          <div className="hero-logo-doticon" style={{
            position: 'fixed',
            top: '25%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease, visibility 0.3s ease'
          }}>
            <DotCloudImage
              disciplineId="logo"
              size={Math.min(70, typeof window !== 'undefined' ? window.innerWidth * 0.26 : 70)}
              color="var(--pepe-gold)"
              aspectRatio={3}
              density={0.5}
              sampleGap={1}
              minDotSize={1.4}
              maxDotSize={2.5}
              reverseScroll={true}
              dynamicDensity={true}
            />
          </div>

          {/* Content positioned lower with more space */}
          <div style={{
            position: 'absolute',
            bottom: 'clamp(10vh, 15vh, 18vh)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(0.75rem, 2vh, 1.5rem)',
            textAlign: 'center',
            maxWidth: '1200px',
            width: '90%',
            padding: '0 1rem'
          }}>
            <h1 className="hero-title-elegant display-gradient" style={{
              fontSize: 'clamp(1.75rem, 7vw, 4rem)',
              margin: 0,
              lineHeight: 1.1,
              maxWidth: '100%',
              wordWrap: 'break-word'
            }}>
              {t('home.hero.title')}
            </h1>

            <p className="body-lg" style={{
              color: 'var(--pepe-gold)',
              margin: '0',
              fontSize: 'clamp(0.9rem, 2.5vw, 1.125rem)',
              fontWeight: 500,
              letterSpacing: '0.02em'
            }}>
              {t('home.hero.claim')}
            </p>

            <div style={{
              display: 'flex',
              gap: 'clamp(0.5rem, 2vw, 1rem)',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: 'clamp(0.25rem, 1vh, 0.5rem)'
            }}>
              <Link to="/anfragen" className="btn btn-primary btn-lg" style={{
                fontSize: 'clamp(0.9rem, 2.5vw, 1.125rem)',
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 5vw, 2.5rem)'
              }}>
                {t('home.hero.primaryCta')}
              </Link>
              <Link to="/shows" className="btn btn-secondary btn-lg" style={{
                fontSize: 'clamp(0.9rem, 2.5vw, 1.125rem)',
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 5vw, 2.5rem)'
              }}>
                {t('home.hero.secondaryCta')}
              </Link>
            </div>
          </div>

          <div style={{
            position: 'absolute',
            bottom: '3vh',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20
          }}>
            <div className="scroll-indicator">
              <div className="scroll-dot"></div>
            </div>
          </div>
        </section>
      )}

      {/* Bento Grid Section */}
      <section className="section bg-pepe-ink" style={{ position: 'relative', zIndex: 1 }}>
        <div className="stage-container">
          <div className="bento-grid-square">
            {/* Main Circus Tent Card - Square Format */}
            <Link to="/anfragen" className="bento-card-square bento-card-main-square bento-clickable">
              <div className="bento-card-bg">
                <img 
                  src="/images/Bento1/CircusTent.png" 
                  alt="Circuszelt mit Luftartistin bei einer Pepe Shows Veranstaltung"
                  className="bento-main-image"
                />
                <div className="bento-spotlight-left"></div>
                <div className="bento-spotlight-right"></div>
                <div className="bento-gradient-overlay"></div>
              </div>
              <div className="bento-card-header">
                <h2 className="bento-title">{t('bento1.hero.title')}</h2>
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
                  alt="Feuershow – innovative Showkonzepte von Pepe Shows"
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
                  alt="Showimpression – Akrobatik auf der Bühne"
                  className="bento-bg-image active"
                />
                <img
                  src="/images/Bento1/Slider2.webp"
                  alt="Showimpression – Artistik bei einer Veranstaltung"
                  className="bento-bg-image"
                />
                <img
                  src="/images/Bento1/Slider3.webp"
                  alt="Showimpression – Künstler in Aktion"
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
            <Link
              to="/team"
              className="bento-card-square bento-card-responsibility-square bento-clickable"
              style={{ position: 'relative', overflow: 'hidden' }}
              onMouseEnter={() => !responsibilityWorldClicked && setResponsibilityWorldPosition(100)}
              onMouseLeave={() => !responsibilityWorldClicked && setResponsibilityWorldPosition(0)}
              onClick={(e) => {
                e.preventDefault()
                setResponsibilityWorldClicked(!responsibilityWorldClicked)
                setResponsibilityWorldPosition(responsibilityWorldClicked ? 0 : 100)
              }}
            >
              {/* World Icon Background - 100% container width, centered, 50% opacity */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  height: '100%',
                  zIndex: 0,
                  opacity: 0.5,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DotCloudImage
                  disciplineId="world"
                  size={300}
                  color="#FFFFFF"
                  manualAnimationPosition={responsibilityWorldPosition}
                  density={0.15}
                  sampleGap={2}
                  minDotSize={1.0}
                  maxDotSize={4.0}
                  noGlow={true}
                />
              </div>

              <div className="bento-card-content" style={{ position: 'relative', zIndex: 1 }}>
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

            {/* Team Box - Full Width */}
            <Link to="/team" className="bento-card-square bento-card-fairness-square bento-clickable">
              <div className="bento-card-content">
                <h3 className="bento-title">{t('bento1.values.fairnessTitle')}</h3>
                <p className="bento-text">
                  {t('bento1.values.fairnessBodyPrefix')} <span className="text-pepe-gold">{t('bento1.values.linkText')}</span>.
                </p>
                <div className="artist-avatars">
                  <div className="team-member">
                    <img src="/images/Slider/Artist1.webp" alt="Carmen" className="avatar" />
                    <span className="team-member-name">Carmen</span>
                  </div>
                  <div className="team-member">
                    <img src="/images/Slider/Artist2.webp" alt="Jonas" className="avatar" />
                    <span className="team-member-name">Jonas</span>
                  </div>
                  <div className="team-member">
                    <img src="/images/Slider/Artist3.webp" alt="Sophie" className="avatar" />
                    <span className="team-member-name">Sophie</span>
                  </div>
                  <div className="team-member">
                    <img src="/images/Slider/Artist4.webp" alt="Dani" className="avatar" />
                    <span className="team-member-name">Dani</span>
                  </div>
                  <div className="team-member">
                    <img src="/images/Slider/Artist5.webp" alt="Jakob" className="avatar" />
                    <span className="team-member-name">Jakob</span>
                  </div>
                </div>
              </div>
              <div className="bento-destination-tag">
                <span>Unser Team</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Find the Perfect Showact Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
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
              {t('home.viewAllArtists') || 'Alle Künstler ansehen'}
            </Link>
          </div>
        </div>
      </section>

      {/* PepeShows - More than Artist Agency */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h2 className="display-3 mb-6">
                {t('home.cta.heading')}
              </h2>
              <p className="lead text-pepe-t80 mb-8 max-w-xl mx-auto lg:mx-0">
                {t('home.cta.description')}
              </p>
              <Link to="/team" className="btn btn-secondary btn-lg">
                {t('home.cta.button')}
              </Link>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/5 group">
                <img 
                  src="/images/Brandguide/Header Pepe 16:9.jpg" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt="Pepe Shows – mehr als eine Künstleragentur"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Excellence Section with Floating Disciplines */}
      <section className="section">
        <div className="stage-container">
          <div className="text-center mb-16">
            <h2 className="display-2 mb-6">{t('home.excellence.heading')}</h2>
            <p className="body-lg max-w-3xl mx-auto mb-6">{t('home.excellence.copy')}</p>
            <p className="body text-pepe-t64">{t('home.excellence.note')}</p>
          </div>

          <FloatingDisciplines
            disciplines={disciplines}
            disciplineToIcon={disciplineToIcon}
          />

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
