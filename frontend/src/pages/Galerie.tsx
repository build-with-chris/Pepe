import { useState, useEffect } from 'react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import DotCloudImage from '../components/ui/DotCloudImage'


// Artist interface for discipline creation
interface Artist {
  id: number
  name: string
  disciplines: string[]
  profile_image_url?: string
  bio?: string
  experience_years?: number
  gallery_urls?: string[]
}

export default function Galerie() {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [autoAnimPosition, setAutoAnimPosition] = useState(0)

  // Discipline stack state from Home page
  const [disciplines, setDisciplines] = useState<Array<{id: string, name: string, image: string, description: string, artistCount: number}>>([])
  const [expandedDiscipline, setExpandedDiscipline] = useState<number>(0)
  const [isStackPaused, setIsStackPaused] = useState(false)

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
    'moderation': 'logo',
    'pantomime': 'pantomime',
    'partnerakrobatik': 'partnerakrobatik',
    'zauberer': 'magician',
    'zauberei': 'magician'
  }

  // Slow auto-animation for disciplines accordion
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
  }, [])
  
  // State for combined static and dynamic images
  const [allImages, setAllImages] = useState<Array<{
    id: number | string
    src: string
    alt: string
    category: string
    aspectRatio: number
    source?: 'static' | 'database'
  }>>([])

  // Static gallery images
  const staticGalleryImages = [
    // Show Formats
    { id: 1, src: '/images/Galerie34/Solo.webp', alt: 'Solo Performance', category: 'Solo', aspectRatio: 4/3, source: 'static' as const },
    { id: 2, src: '/images/Galerie34/Duo.webp', alt: 'Duo Performance', category: 'Duo', aspectRatio: 16/9, source: 'static' as const },
    { id: 3, src: '/images/Galerie34/Variete.webp', alt: 'Varieté Show', category: 'Varieté', aspectRatio: 3/4, source: 'static' as const },
    { id: 4, src: '/images/Galerie34/Konzeptshow.webp', alt: 'Konzept Show', category: 'Konzept', aspectRatio: 4/3, source: 'static' as const },
    { id: 5, src: '/images/Galerie34/Zauberer.webp', alt: 'Zauber Performance', category: 'Magie', aspectRatio: 16/9, source: 'static' as const },
    { id: 6, src: '/images/Galerie34/Feuershow.webp', alt: 'Feuer Show', category: 'Feuer', aspectRatio: 4/3, source: 'static' as const },
    // Akrobatik & Artistik
    { id: 7, src: '/images/posters/Handstand-768.webp', alt: 'Handstand Akrobatik', category: 'Akrobatik', aspectRatio: 3/4, source: 'static' as const },
    { id: 8, src: '/images/posters/Cyr 5-768.webp', alt: 'Cyr Wheel Performance', category: 'Akrobatik', aspectRatio: 3/4, source: 'static' as const },
    { id: 9, src: '/images/posters/Chienise Pole-768.webp', alt: 'Chinese Pole', category: 'Akrobatik', aspectRatio: 3/4, source: 'static' as const },
    { id: 10, src: '/images/posters/Hula-768.webp', alt: 'Hula Hoop Performance', category: 'Artistik', aspectRatio: 3/4, source: 'static' as const },
    { id: 11, src: '/images/posters/Contortion-768.webp', alt: 'Contortion', category: 'Akrobatik', aspectRatio: 3/4, source: 'static' as const },
    { id: 12, src: '/images/posters/LED CYR Blackbox-768.webp', alt: 'LED Cyr Wheel', category: 'Akrobatik', aspectRatio: 16/9, source: 'static' as const },
    // Theater & Pantomime
    { id: 13, src: '/images/posters/Pantomime-768.webp', alt: 'Pantomime Performance', category: 'Theater', aspectRatio: 3/4, source: 'static' as const },
    { id: 14, src: '/images/posters/Pantomime 2-768.webp', alt: 'Pantomime Act 2', category: 'Theater', aspectRatio: 3/4, source: 'static' as const },
    // PepeShows Impressions - New category from gallery folder
    { id: 15, src: '/images/gallery/performance1.jpg', alt: 'PepeShows Live Performance', category: 'PepeShows Impressions', aspectRatio: 4/3, source: 'static' as const },
    { id: 16, src: '/images/gallery/performance2.jpg', alt: 'Artist Showcase', category: 'PepeShows Impressions', aspectRatio: 16/9, source: 'static' as const },
    { id: 17, src: '/images/gallery/performance3.jpg', alt: 'Stage Performance', category: 'PepeShows Impressions', aspectRatio: 3/4, source: 'static' as const },
    { id: 18, src: '/images/gallery/performance4.jpg', alt: 'Event Highlight', category: 'PepeShows Impressions', aspectRatio: 4/3, source: 'static' as const },
    { id: 19, src: '/images/gallery/performance5.jpg', alt: 'Artist in Action', category: 'PepeShows Impressions', aspectRatio: 16/9, source: 'static' as const },
    { id: 20, src: '/images/gallery/performance6.jpg', alt: 'Show Atmosphere', category: 'PepeShows Impressions', aspectRatio: 3/4, source: 'static' as const }
  ]

  const filteredImages = selectedCategory 
    ? allImages.filter(img => img.category === selectedCategory)
    : allImages

  // Helper functions from Home page for discipline accordion content
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
        
        // Map to correct image path
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
        
        const searchKey = lowerCaseName
        let imagePath = ''
        if (imageMapping[searchKey]) {
          imagePath = `/images/disciplines/${imageMapping[searchKey]}.webp`
        } else {
          imagePath = `/images/disciplines/${normalizedName.replace(/\s+/g, '_')}.webp`
        }
        
        return {
          id: lowerCaseName.replace(/\s+/g, ''),
          name: translatedName,
          image: imagePath,
          description: `${translatedName}`,
          artistCount: data.count
        }
      })

    return randomDisciplines
  }

  // Event handlers from Home page
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

  // Auto-cycling effect
  React.useEffect(() => {
    if (!isStackPaused && disciplines.length > 0) {
      const interval = setInterval(() => {
        setExpandedDiscipline(prev => (prev + 1) % disciplines.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [disciplines.length, isStackPaused])

  // Fetch artists and create disciplines + combine gallery images
  React.useEffect(() => {
    const fetchArtistsAndImages = async () => {
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
          
          // Create disciplines
          const dynamicDisciplines = createDisciplinesFromArtists(data)
          setDisciplines(dynamicDisciplines.length > 0 ? dynamicDisciplines : [
            // Fallback disciplines if database is empty
            {
              id: 'zauberer',
              name: t('booking.disciplines.options.zauberer.label') || 'Zauberei',
              image: '/images/disciplines/Zauberer.webp',
              description: 'Magische Momente und Illusionen für jedes Publikum.',
              artistCount: 0
            },
            {
              id: 'luftakrobatik',
              name: t('booking.disciplines.options.luftakrobatik.label') || 'Luftakrobatik',
              image: '/images/disciplines/Luftakrobatik.webp',
              description: 'Schwebende Eleganz und atemberaubende Höhenakrobatik.',
              artistCount: 0
            },
            {
              id: 'handstand',
              name: t('artists.disciplines.handstand') || 'Handstand',
              image: '/images/disciplines/Handstand.webp',
              description: 'Kraft, Balance und Präzision in perfekter Harmonie.',
              artistCount: 0
            }
          ])

          // Extract gallery images from artists
          const dynamicImages: Array<{
            id: string
            src: string
            alt: string
            category: string
            aspectRatio: number
            source: 'database'
          }> = []
          
          data.forEach((artist: Artist, artistIndex: number) => {
            if (artist.gallery_urls && artist.gallery_urls.length > 0) {
              artist.gallery_urls.forEach((url, imageIndex) => {
                // Determine category based on artist disciplines
                const primaryDiscipline = artist.disciplines?.[0] || 'General'
                const category = mapDisciplineToCategory(primaryDiscipline)
                
                dynamicImages.push({
                  id: `artist-${artistIndex}-${imageIndex}`,
                  src: url,
                  alt: `${artist.name} - ${primaryDiscipline}`,
                  category: category,
                  aspectRatio: 4/3, // Default aspect ratio for database images
                  source: 'database'
                })
              })
            }
          })

          // Combine static and dynamic images
          const combinedImages = [...staticGalleryImages, ...dynamicImages]
          setAllImages(combinedImages)
          
        } else {
          // Fallback to static images only
          setAllImages(staticGalleryImages)
        }
      } catch (error) {
        console.error('Failed to fetch artists:', error)
        // Set fallback disciplines and static images only
        setDisciplines([
          {
            id: 'zauberer',
            name: t('artists.disciplines.zauberer') || 'Zauberei',
            image: '/images/disciplines/Zauberer.webp',
            description: 'Magische Momente und Illusionen für jedes Publikum.',
            artistCount: 0
          },
          {
            id: 'luftakrobatik',
            name: t('artists.disciplines.luftakrobatik') || 'Luftakrobatik',
            image: '/images/disciplines/Luftakrobatik.webp',
            description: 'Schwebende Eleganz und atemberaubende Höhenakrobatik.',
            artistCount: 0
          },
          {
            id: 'handstand',
            name: t('artists.disciplines.handstand') || 'Handstand',
            image: '/images/disciplines/Handstand.webp',
            description: 'Kraft, Balance und Präzision in perfekter Harmonie.',
            artistCount: 0
          }
        ])
        setAllImages(staticGalleryImages)
      }
    }

    fetchArtistsAndImages()
  }, [t])

  // Helper function to map discipline to gallery category
  const mapDisciplineToCategory = (discipline: string): string => {
    const mapping: Record<string, string> = {
      'Zauberer': 'Magie',
      'Zauberei': 'Magie',
      'Handstand': 'Akrobatik',
      'Luftakrobatik': 'Akrobatik',
      'Bodenakrobatik': 'Akrobatik',
      'Partnerakrobatik': 'Akrobatik',
      'Jonglage': 'Artistik',
      'Pantomime': 'Theater',
      'Contemporary Dance': 'Artistik',
      'Breakdance': 'Artistik'
    }
    return mapping[discipline] || 'General'
  }

  return (
    <main>
      {/* Smaller Hero Section */}
      <section className="section bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center max-w-4xl mx-auto py-12">
            <div className="overline text-pepe-gold mb-4">KÜNSTLER GALERIE</div>
            <h1 className="h1 mb-6">
              {t('gallery14.heading') || 'Wow, not "nice".'}
            </h1>
            <p className="body-lg mb-8 max-w-2xl mx-auto">
              {t('gallery14.subheading') || 'Acrobatics, juggling, fire & more – combined individually for your occasion.'}
            </p>
          </div>
        </div>
      </section>

      {/* Excellence Section with Discipline Stack Accordion */}
      <section className="section">
        <div className="stage-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            <div>
              <h2 className="h2 mb-6">
                {t('gallery23.headingDesktop') || 'We don\'t believe in average – with us it\'s excellence.'}
              </h2>
              <p className="body-lg mb-6">
                Unsere Künstler:innen sind Weltmeister:innen, internationale Champions und ausgewiesene Profis in ihren Disziplinen.
              </p>
              <p className="body text-pepe-t64 mb-0">
                {t('gallery23.subtitle') || 'Wählen Sie eine Disziplin, um Referenzen, Einsätze und passende Künstler zu sehen.'}
              </p>
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
                  
                  {/* Image only - no DotIcon overlay */}
                  <div className="discipline-image-container">
                    <img
                      src={discipline.image}
                      alt={discipline.name}
                      className="discipline-image"
                    />
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
        </div>
      </section>


      {/* Video Section - "Vorhang auf für unsere Artisten" */}
      <section className="section bg-gradient-dark">
        <div className="stage-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content Column */}
            <div className="text-center lg:text-left">
              <h2 className="h2 mb-8">
                {t('hero135.heading') || 'Vorhang auf für unsere Artisten'}
              </h2>
              <div className="video-text-wrapper">
                <p className="body-xl leading-relaxed mb-12 max-w-2xl mx-auto lg:mx-0">
                  {t('hero135.subtitle') || 'Ein Vorgeschmack auf unsere Artisten – voller Energie, Kreativität und Leidenschaft. Klick auf Play für die volle Show auf YouTube.'}
                </p>
              </div>
            </div>
            
            {/* Video Column */}
            <div className="relative">
              <div 
                className="video-showcase-container group cursor-pointer"
                onClick={() => setIsVideoModalOpen(true)}
              >
                <div className="video-preview-wrapper">
                  {/* Autoplay Video Preview */}
                  <div className="video-thumbnail-container">
                    <iframe 
                      src="https://www.youtube.com/embed/dXHLaIkezTM?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&playlist=dXHLaIkezTM"
                      title="PepeShows Showreel Vorschau"
                      className="video-preview-thumbnail"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  </div>
                  
                  {/* Play Button Overlay */}
                  <div className="video-play-overlay">
                    <div className="video-play-button">
                      <svg className="video-play-icon" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <div className="video-play-text">
                      {t('hero135.play.title') || 'Showreel'}
                    </div>
                  </div>
                </div>
                
                <p className="video-caption">
                  Vorschau – Vollversion auf YouTube
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="video-modal-backdrop" onClick={() => setIsVideoModalOpen(false)}>
          <div className="video-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <h3 className="video-modal-title">
                {t('hero135.dialog.title') || 'Präsentationsvideo'}
              </h3>
              <button 
                className="video-modal-close"
                onClick={() => setIsVideoModalOpen(false)}
                aria-label="Schließen"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M6 18l12-12" />
                </svg>
              </button>
            </div>
            <div className="video-modal-content">
              <iframe
                className="video-modal-iframe"
                src="https://www.youtube.com/embed/dXHLaIkezTM?autoplay=1"
                title={t('hero135.dialog.title') || 'Präsentationsvideo'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Image Grid */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('nav.gallery') || 'Gallery'}</h2>
            <p className="body-lg max-w-3xl mx-auto">
              {t('gallery.subtitle') || 'Discover our artists in action'}
            </p>
          </div>

          {/* Category Filter - Enhanced Styling */}
          <div className="text-center mb-12">
            <div className="inline-flex flex-wrap gap-2 justify-center p-2 bg-pepe-dark/50 backdrop-blur-sm rounded-2xl border border-pepe-line/30">
              <button
                onClick={() => setSelectedCategory('')}
                className={`gallery-filter-btn ${
                  !selectedCategory ? 'active' : ''
                }`}
              >
                {t('artists.filters.all')}
              </button>
              {Array.from(new Set(allImages.map(img => img.category))).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`gallery-filter-btn ${
                    selectedCategory === category ? 'active' : ''
                  } ${
                    category === 'PepeShows Impressions' ? 'pepe-impressions' : ''
                  }`}
                >
                  {category === 'PepeShows Impressions' ? '⭐ ' : ''}{category}
                </button>
              ))}
            </div>
          </div>

          {/* Masonry Layout - Flexible Column Fill */}
          <div className="gallery-masonry-container">
            <div className="gallery-column">
              {filteredImages
                .filter((_, index) => index % 3 === 0)
                .map((image) => (
                  <div 
                    key={image.id} 
                    className="gallery-masonry-item group cursor-pointer"
                  >
                    <div className="gallery-image-wrapper">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="gallery-masonry-image"
                        style={{ aspectRatio: image.aspectRatio }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTYxNjE2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbGVyaWUgQmlsZDwvdGV4dD48L3N2Zz4='
                        }}
                      />
                      <div className="gallery-image-overlay">
                        <div className="gallery-image-content">
                          <div className="gallery-image-category">{image.category}</div>
                          <div className="gallery-image-title">{image.alt}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="gallery-column">
              {filteredImages
                .filter((_, index) => index % 3 === 1)
                .map((image) => (
                  <div 
                    key={image.id} 
                    className="gallery-masonry-item group cursor-pointer"
                  >
                    <div className="gallery-image-wrapper">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="gallery-masonry-image"
                        style={{ aspectRatio: image.aspectRatio }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTYxNjE2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbGVyaWUgQmlsZDwvdGV4dD48L3N2Zz4='
                        }}
                      />
                      <div className="gallery-image-overlay">
                        <div className="gallery-image-content">
                          <div className="gallery-image-category">{image.category}</div>
                          <div className="gallery-image-title">{image.alt}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="gallery-column">
              {filteredImages
                .filter((_, index) => index % 3 === 2)
                .map((image) => (
                  <div 
                    key={image.id} 
                    className="gallery-masonry-item group cursor-pointer"
                  >
                    <div className="gallery-image-wrapper">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="gallery-masonry-image"
                        style={{ aspectRatio: image.aspectRatio }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTYxNjE2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbGVyaWUgQmlsZDwvdGV4dD48L3N2Zz4='
                        }}
                      />
                      <div className="gallery-image-overlay">
                        <div className="gallery-image-content">
                          <div className="gallery-image-category">{image.category}</div>
                          <div className="gallery-image-title">{image.alt}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-large text-center bg-gradient-dark">
        <div className="stage-container">
          <div className="overline text-pepe-gold mb-4">{t('gallery.cta.kicker') || 'EXPERIENCE IT LIVE'}</div>
          <h2 className="h2 mb-8">{t('gallery.cta.title') || 'Book Your Show'}</h2>
          <p className="lead mb-12 max-w-3xl mx-auto">
            {t('gallery.cta.description') || 'These impressions show only a small part of our capabilities. Experience the full magic live at your event.'}
          </p>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              {t('about1.next.cta.assistant') || 'Start booking assistant'}
            </Link>
            <Link to="/kuenstler" className="btn btn-ghost btn-lg">
              {t('nav.artists') || 'Artists'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
