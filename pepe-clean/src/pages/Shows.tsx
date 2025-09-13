import { useState } from 'react'

interface Show {
  id: number
  title: string
  description: string
  image: string
  category: string
  price?: string
  duration?: string
}

const showsData: Show[] = [
  {
    id: 1,
    title: "Solo Performance",
    description: "Individuelle Kunstdarbietungen unserer talentiertesten Einzelkünstler",
    image: "/images/Galerie34/Solo.webp",
    category: "Solo",
    price: "ab 800€",
    duration: "20-45 Min"
  },
  {
    id: 2,
    title: "Duo Acts",
    description: "Harmonische Zusammenspiele zweier Künstler in perfekter Synchronisation",
    image: "/images/Galerie34/Duo.webp", 
    category: "Duo",
    price: "ab 1.200€",
    duration: "25-50 Min"
  },
  {
    id: 3,
    title: "Konzeptshow",
    description: "Thematische Shows mit durchdachtem Konzept und roter Faden",
    image: "/images/Galerie34/Konzeptshow.webp",
    category: "Konzept",
    price: "ab 2.000€",
    duration: "45-90 Min"
  },
  {
    id: 4,
    title: "Varieté Abend",
    description: "Klassisches Varieté mit verschiedenen Acts und Moderation",
    image: "/images/Galerie34/Variete.webp",
    category: "Varieté",
    price: "ab 3.500€",
    duration: "90-120 Min"
  },
  {
    id: 5,
    title: "Walkact",
    description: "Mobile Performances die zwischen den Gästen stattfinden",
    image: "/images/Galerie34/Walkact.webp",
    category: "Walkact",
    price: "ab 600€",
    duration: "flexibel"
  },
  {
    id: 6,
    title: "Firmenfeier Special",
    description: "Maßgeschneiderte Shows für Firmenevents und Betriebsfeiern",
    image: "/images/Galerie34/Firmenfeier.webp",
    category: "Corporate",
    price: "auf Anfrage",
    duration: "anpassbar"
  }
]

export default function Shows() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [expandedShow, setExpandedShow] = useState<number | null>(null)

  const categories = Array.from(new Set(showsData.map(show => show.category)))
  
  const filteredShows = selectedCategory 
    ? showsData.filter(show => show.category === selectedCategory)
    : showsData

  const toggleExpand = (showId: number) => {
    setExpandedShow(expandedShow === showId ? null : showId)
  }

  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero">
        <div className="stage-container">
          <div className="hero-content text-center max-w-4xl mx-auto">
            <div className="overline mb-6">Unser Programm</div>
            <h1 className="h1 display-gradient mb-8">
              Shows &amp; Aufführungen
            </h1>
            <p className="lead mb-12">
              Von intimen Solo-Performances bis hin zu großen Varieté-Abenden - 
              entdecken Sie unser vielfältiges Show-Portfolio für jeden Anlass.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="section-compact">
        <div className="stage-container">
          <div className="text-center mb-12">
            <h2 className="h2 mb-8">Shows nach Kategorie</h2>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <button
                onClick={() => setSelectedCategory('')}
                className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-ghost'}`}
              >
                Alle Shows
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`btn btn-sm ${
                    selectedCategory === category ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <p className="body">
              {filteredShows.length} Shows verfügbar
              {selectedCategory && ` in Kategorie "${selectedCategory}"`}
            </p>
          </div>
        </div>
      </section>

      {/* Shows Grid */}
      <section className="section">
        <div className="stage-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredShows.map((show) => (
              <div key={show.id} className="card p-0 overflow-hidden">
                <div className="aspect-video bg-pepe-ink">
                  <img
                    src={show.image}
                    alt={show.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTYxNjE2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJpbGQgd2lyZCBnZWxhZGVuPC90ZXh0Pjwvc3ZnPg=='
                    }}
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="label mb-2">{show.category}</div>
                      <h3 className="h3 mb-3">{show.title}</h3>
                    </div>
                    <button
                      onClick={() => toggleExpand(show.id)}
                      className="btn btn-ghost btn-sm ml-4"
                      aria-label={expandedShow === show.id ? 'Details schließen' : 'Details öffnen'}
                    >
                      {expandedShow === show.id ? '−' : '+'}
                    </button>
                  </div>
                  
                  <p className="body-sm mb-4 line-clamp-2">
                    {show.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="caption">
                      <div>Preis: {show.price}</div>
                      <div>Dauer: {show.duration}</div>
                    </div>
                  </div>
                  
                  {expandedShow === show.id && (
                    <div className="border-t border-pepe-line pt-4 mt-4">
                      <h4 className="h4 mb-3">Details zur Show</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="label mb-1">Beschreibung</div>
                          <p className="body-sm">
                            {show.description} Diese Show kann individuell an Ihre 
                            Veranstaltung angepasst werden. Sprechen Sie uns für 
                            spezielle Wünsche gerne an.
                          </p>
                        </div>
                        <div>
                          <div className="label mb-1">Technische Anforderungen</div>
                          <p className="body-sm">
                            Grundlegende Beleuchtung, Musikanlage nach Absprache, 
                            Mindestbühnenfläche variiert je nach Act.
                          </p>
                        </div>
                        <div>
                          <div className="label mb-1">Buchung</div>
                          <p className="body-sm">
                            Mindestvorlaufzeit: 2 Wochen. Für kurzfristige Anfragen 
                            kontaktieren Sie uns direkt.
                          </p>
                        </div>
                      </div>
                      <div className="pt-4">
                        <a href="/anfragen" className="btn btn-primary btn-sm">
                          Show anfragen
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="section-large">
        <div className="stage-container">
          <div className="cta-content text-center">
            <h2 className="h2 mb-6">Individuelle Show gewünscht?</h2>
            <p className="body-lg mb-12 max-w-3xl mx-auto">
              Wir entwickeln gerne eine maßgeschneiderte Show für Ihre 
              Veranstaltung. Lassen Sie uns über Ihre Vorstellungen sprechen.
            </p>
            <div className="cta-actions">
              <a href="/anfragen" className="btn btn-primary btn-lg mr-4">
                Individuelle Anfrage
              </a>
              <a href="/kontakt" className="btn btn-secondary btn-lg">
                Beratung vereinbaren
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}