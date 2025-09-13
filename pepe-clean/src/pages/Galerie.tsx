export default function Galerie() {
  const galleryImages = [
    { id: 1, src: '/images/gallery/performance1.jpg', alt: 'Akrobatik Performance', category: 'Akrobatik' },
    { id: 2, src: '/images/gallery/performance2.jpg', alt: 'Tanz Performance', category: 'Tanz' },
    { id: 3, src: '/images/gallery/performance3.jpg', alt: 'Theater Szene', category: 'Theater' },
    { id: 4, src: '/images/gallery/performance4.jpg', alt: 'Varieté Show', category: 'Varieté' },
    { id: 5, src: '/images/gallery/performance5.jpg', alt: 'Solo Act', category: 'Solo' },
    { id: 6, src: '/images/gallery/performance6.jpg', alt: 'Duo Performance', category: 'Duo' },
  ]

  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero">
        <div className="stage-container">
          <div className="hero-content text-center max-w-4xl mx-auto">
            <div className="overline mb-6">Impressionen</div>
            <h1 className="h1 display-gradient mb-8">
              Galerie &amp; Momente
            </h1>
            <p className="lead mb-12">
              Werfen Sie einen Blick hinter die Kulissen und erleben Sie 
              die Magie unserer Aufführungen in bewegenden Bildern.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section">
        <div className="stage-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image) => (
              <div key={image.id} className="group relative overflow-hidden rounded-lg aspect-video bg-pepe-ink">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTYxNjE2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbGVyaWUgQmlsZDwvdGV4dD48L3N2Zz4='
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="label mb-1 text-pepe-gold">{image.category}</div>
                    <p className="body-sm text-white">{image.alt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h2 mb-6">Videos unserer Aufführungen</h2>
            <p className="body-lg max-w-3xl mx-auto">
              Erleben Sie die Dynamik und Energie unserer Shows in bewegten Bildern.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-video bg-pepe-ink rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-pepe-t64 mb-2">▶</div>
                <p className="body-sm text-pepe-t64">Video wird geladen</p>
              </div>
            </div>
            <div className="aspect-video bg-pepe-ink rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-pepe-t64 mb-2">▶</div>
                <p className="body-sm text-pepe-t64">Video wird geladen</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}