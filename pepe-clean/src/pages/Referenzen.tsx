import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

interface Testimonial {
  id: number
  role: string
  content: string
  company?: string
  event?: string
}

interface Reference {
  id: number
  name: string
  logo?: string
  category: string
}

export default function Referenzen() {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const testimonials: Testimonial[] = [
    { id: 1, role: t('testimonial19.items.1.role'), content: t('testimonial19.items.1.content') },
    { id: 2, role: t('testimonial19.items.2.role'), content: t('testimonial19.items.2.content') },
    { id: 3, role: t('testimonial19.items.3.role'), content: t('testimonial19.items.3.content') },
    { id: 4, role: t('testimonial19.items.4.role'), content: t('testimonial19.items.4.content') },
    { id: 5, role: t('testimonial19.items.5.role'), content: t('testimonial19.items.5.content') },
    { id: 6, role: t('testimonial19.items.6.role'), content: t('testimonial19.items.6.content') }
  ]

  const references: Reference[] = [
    { id: 1, name: 'Porsche', category: 'corporate', logo: '/logos/porsche.png' },
    { id: 2, name: 'Google', category: 'corporate', logo: '/logos/google.png' },
    { id: 3, name: "McDonald's", category: 'corporate', logo: '/logos/mcdonalds.png' },
    { id: 4, name: 'AstraZeneca', category: 'corporate', logo: '/logos/astrazeneca.png' },
    { id: 5, name: 'Tollwood Festival', category: 'festival', logo: '/logos/tollwood.png' },
    { id: 6, name: 'Stadt Gütersloh', category: 'public', logo: '/logos/guetersloh.png' },
    { id: 7, name: 'BMW', category: 'corporate', logo: '/logos/bmw.png' },
    { id: 8, name: 'Siemens', category: 'corporate', logo: '/logos/siemens.png' },
    { id: 9, name: 'Red Bull', category: 'corporate', logo: '/logos/redbull.png' },
    { id: 10, name: 'Oktoberfest', category: 'festival', logo: '/logos/oktoberfest.png' },
    { id: 11, name: 'Stadtwerke München', category: 'public', logo: '/logos/swm.png' },
    { id: 12, name: 'Allianz', category: 'corporate', logo: '/logos/allianz.png' }
  ]

  const filteredReferences = selectedCategory === 'all' 
    ? references 
    : references.filter(ref => ref.category === selectedCategory)

  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center max-w-4xl mx-auto py-16">
            <div className="overline text-pepe-gold mb-6">UNSERE REFERENZEN</div>
            <h1 className="display-1 display-gradient mb-8">
              Vertrauen, das verbindet
            </h1>
            <p className="lead mb-12 max-w-3xl mx-auto">
              Von DAX-Konzernen über Festivals bis zu städtischen Veranstaltungen – 
              unsere Shows begeistern auf allen Ebenen.
            </p>
          </div>
        </div>
      </section>

      {/* Client Logos Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('logos3.heading')}</h2>
          </div>

          {/* Category Filter */}
          <div className="filter-section mb-12">
            <div className="filter-buttons">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              >
                Alle
              </button>
              <button
                onClick={() => setSelectedCategory('corporate')}
                className={`filter-btn ${selectedCategory === 'corporate' ? 'active' : ''}`}
              >
                Unternehmen
              </button>
              <button
                onClick={() => setSelectedCategory('festival')}
                className={`filter-btn ${selectedCategory === 'festival' ? 'active' : ''}`}
              >
                Festivals
              </button>
              <button
                onClick={() => setSelectedCategory('public')}
                className={`filter-btn ${selectedCategory === 'public' ? 'active' : ''}`}
              >
                Öffentlich
              </button>
            </div>
          </div>

          {/* Logo Grid */}
          <div className="logo-grid">
            {filteredReferences.map(ref => (
              <div key={ref.id} className="logo-card">
                {ref.logo ? (
                  <img src={ref.logo} alt={ref.name} className="client-logo" />
                ) : (
                  <div className="logo-placeholder">
                    <span className="logo-text">{ref.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <div className="overline text-pepe-gold mb-4">{t('testimonial19.kicker')}</div>
            <h2 className="h1 mb-6">{t('testimonial19.heading')}</h2>
            <p className="body-lg max-w-3xl mx-auto">
              {t('testimonial19.subheading')}
            </p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="testimonial-card">
                <blockquote className="testimonial-content">
                  <p className="body italic">
                    "{testimonial.content}"
                  </p>
                </blockquote>
                <div className="testimonial-author">
                  <div className="author-role">{testimonial.role}</div>
                  {testimonial.company && (
                    <div className="author-company">{testimonial.company}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/kontakt" className="btn btn-secondary">
              {t('testimonial19.moreLink')}
            </Link>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">Erfolgsgeschichten</h2>
            <p className="body-lg max-w-3xl mx-auto">
              Einige unserer unvergesslichen Projekte und Events
            </p>
          </div>

          <div className="stories-grid">
            <div className="story-card">
              <div className="story-image">
                <img src="/images/events/porsche-gala.jpg" alt="Porsche Gala" />
              </div>
              <div className="story-content">
                <h3 className="h3 mb-3">Porsche Gala Night</h3>
                <p className="body-sm mb-4">
                  Exklusive Gala-Veranstaltung mit maßgeschneidertem Showprogramm 
                  für 500 internationale Gäste. Kombination aus Luftakrobatik, 
                  LED-Performance und klassischer Artistik.
                </p>
                <div className="story-meta">
                  <span className="meta-item">📍 Stuttgart</span>
                  <span className="meta-item">👥 500 Gäste</span>
                  <span className="meta-item">⏱️ 90 Min Show</span>
                </div>
              </div>
            </div>

            <div className="story-card">
              <div className="story-image">
                <img src="/images/events/tollwood.jpg" alt="Tollwood Festival" />
              </div>
              <div className="story-content">
                <h3 className="h3 mb-3">Tollwood Festival</h3>
                <p className="body-sm mb-4">
                  Mehrwöchiges Engagement mit täglichen Shows. 
                  Walking Acts, Bühnenshows und interaktive Performances 
                  für über 50.000 Besucher.
                </p>
                <div className="story-meta">
                  <span className="meta-item">📍 München</span>
                  <span className="meta-item">👥 50.000+ Besucher</span>
                  <span className="meta-item">⏱️ 4 Wochen</span>
                </div>
              </div>
            </div>

            <div className="story-card">
              <div className="story-image">
                <img src="/images/events/guetersloh.jpg" alt="Stadt Gütersloh" />
              </div>
              <div className="story-content">
                <h3 className="h3 mb-3">5-Stunden Varieté Gütersloh</h3>
                <p className="body-sm mb-4">
                  Abendfüllendes Varietéprogramm für die Stadt Gütersloh. 
                  Über 20 Künstler, aufwendige Bühnentechnik und 
                  maßgeschneiderte Choreografien.
                </p>
                <div className="story-meta">
                  <span className="meta-item">📍 Gütersloh</span>
                  <span className="meta-item">👥 1.200 Gäste</span>
                  <span className="meta-item">⏱️ 5 Stunden</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section bg-gradient-dark">
        <div className="stage-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Erfolgreiche Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">15+</div>
              <div className="stat-label">Jahre Erfahrung</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Künstler im Netzwerk</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100%</div>
              <div className="stat-label">Kundenzufriedenheit</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-large text-center">
        <div className="stage-container">
          <div className="overline text-pepe-gold mb-4">BEREIT FÜR IHR EVENT?</div>
          <h2 className="display-2 mb-8">Werden Sie unsere nächste Erfolgsgeschichte</h2>
          <p className="lead mb-12 max-w-3xl mx-auto">
            Lassen Sie uns gemeinsam ein unvergessliches Event kreieren, 
            über das Ihre Gäste noch lange sprechen werden.
          </p>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              {t('about1.next.cta.assistant')}
            </Link>
            <Link to="/kontakt" className="btn btn-ghost btn-lg">
              Beratungsgespräch
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}