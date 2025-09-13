import { useState, useEffect } from 'react'

interface Artist {
  id: number
  name: string
  disciplines: string[]
  profile_image_url?: string
  bio?: string
  experience_years?: number
}

export default function Kuenstler() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('')

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
      {/* Hero Section */}
      <section className="section-hero">
        <div className="stage-container">
          <div className="hero-content text-center max-w-4xl mx-auto">
            <div className="overline mb-6">Unsere Talente</div>
            <h1 className="h1 display-gradient mb-8">
              Künstler &amp; Performer
            </h1>
            <p className="lead mb-12">
              Entdecken Sie die außergewöhnlichen Talente, die unsere Bühne 
              mit Leben füllen. Jeder Künstler bringt seine einzigartige 
              Geschichte und Leidenschaft mit.
            </p>
          </div>
        </div>
      </section>

      {/* Artists Section */}
      <section className="section">
        <div className="stage-container">
          
          {/* Filter Section */}
          {!loading && allDisciplines.length > 0 && (
            <div className="mb-16">
              <h2 className="h2 text-center mb-8">Nach Disziplin filtern</h2>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {allDisciplines.map((discipline) => (
                  <button
                    key={discipline}
                    onClick={() => handleFilter(discipline)}
                    className={`btn btn-sm ${
                      selectedDiscipline === discipline 
                        ? 'btn-primary' 
                        : 'btn-ghost'
                    }`}
                  >
                    {discipline}
                  </button>
                ))}
              </div>
              {selectedDiscipline && (
                <div className="text-center">
                  <button
                    onClick={clearFilters}
                    className="btn btn-secondary btn-sm"
                  >
                    Alle anzeigen
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Count */}
          {!loading && (
            <div className="text-center mb-8">
              <p className="body">
                {filteredArtists.length} {filteredArtists.length === 1 ? 'Künstler' : 'Künstler'} 
                {selectedDiscipline && ` für "${selectedDiscipline}"`}
              </p>
            </div>
          )}
          
          {/* Artists Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="body">Künstler werden geladen...</div>
            </div>
          ) : filteredArtists.length === 0 ? (
            <div className="text-center py-12">
              <div className="body mb-4">
                Keine Künstler für "{selectedDiscipline}" gefunden.
              </div>
              <button
                onClick={clearFilters}
                className="btn btn-secondary"
              >
                Alle Künstler anzeigen
              </button>
            </div>
          ) : (
            <div className="artist-grid">
              {filteredArtists.map((artist) => (
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
                      {artist.bio && (
                        <p className="body-sm mb-4 line-clamp-3">
                          {artist.bio}
                        </p>
                      )}
                      {artist.experience_years && (
                        <p className="caption mb-4">
                          {artist.experience_years} Jahre Erfahrung
                        </p>
                      )}
                    </div>
                    <button className="btn btn-ghost btn-sm">
                      Profil ansehen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}