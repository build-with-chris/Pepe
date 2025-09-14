import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

interface FAQItem {
  id: number
  question: string
  answer: string
  category: string
}

export default function FAQ() {
  const { t } = useTranslation()
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const toggleItem = (id: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const faqItems: FAQItem[] = [
    { id: 1, question: t('faq1.items.1.q'), answer: t('faq1.items.1.a'), category: 'general' },
    { id: 2, question: t('faq1.items.2.q'), answer: t('faq1.items.2.a'), category: 'booking' },
    { id: 3, question: t('faq1.items.3.q'), answer: t('faq1.items.3.a'), category: 'booking' },
    { id: 4, question: t('faq1.items.4.q'), answer: t('faq1.items.4.a'), category: 'technical' },
    { id: 5, question: t('faq1.items.5.q'), answer: t('faq1.items.5.a'), category: 'general' },
    { id: 6, question: t('faq1.items.6.q'), answer: t('faq1.items.6.a'), category: 'pricing' },
    { id: 7, question: t('faq1.items.7.q'), answer: t('faq1.items.7.a'), category: 'pricing' },
    { id: 8, question: t('faq1.items.8.q'), answer: t('faq1.items.8.a'), category: 'pricing' },
    { id: 9, question: t('faq1.items.9.q'), answer: t('faq1.items.9.a'), category: 'booking' },
    { id: 10, question: t('faq1.items.10.q'), answer: t('faq1.items.10.a'), category: 'general' },
    { id: 11, question: t('faq1.items.11.q'), answer: t('faq1.items.11.a'), category: 'general' }
  ]

  const filteredItems = selectedCategory === 'all' 
    ? faqItems 
    : faqItems.filter(item => item.category === selectedCategory)

  const categories = [
    { id: 'all', label: 'Alle Fragen', icon: '📋' },
    { id: 'general', label: 'Allgemein', icon: '💡' },
    { id: 'booking', label: 'Buchung', icon: '📅' },
    { id: 'technical', label: 'Technik', icon: '⚙️' },
    { id: 'pricing', label: 'Preise', icon: '💰' }
  ]

  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center max-w-4xl mx-auto py-16">
            <div className="overline text-pepe-gold mb-6">HILFE & SUPPORT</div>
            <h1 className="display-1 display-gradient mb-8">
              {t('faq1.heading')}
            </h1>
            <p className="lead mb-12 max-w-3xl mx-auto">
              Hier finden Sie Antworten auf die wichtigsten Fragen zu unseren Shows, 
              Buchungen und Services.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="section">
        <div className="stage-container">
          <div className="quick-links-grid">
            <Link to="/anfragen" className="quick-link-card">
              <div className="quick-link-icon">🎯</div>
              <h3 className="h3">Booking-Assistent</h3>
              <p className="body-sm">Schnell zur perfekten Show</p>
            </Link>
            <Link to="/technical-rider" className="quick-link-card">
              <div className="quick-link-icon">📋</div>
              <h3 className="h3">Technical Rider</h3>
              <p className="body-sm">Technische Anforderungen</p>
            </Link>
            <Link to="/mediamaterial" className="quick-link-card">
              <div className="quick-link-icon">📦</div>
              <h3 className="h3">Mediamaterial</h3>
              <p className="body-sm">Logos, Bilder & mehr</p>
            </Link>
            <Link to="/kontakt" className="quick-link-card">
              <div className="quick-link-icon">💬</div>
              <h3 className="h3">Direkter Kontakt</h3>
              <p className="body-sm">Persönliche Beratung</p>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          {/* Category Filter */}
          <div className="category-filter mb-12">
            <div className="category-buttons">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="faq-list">
            {filteredItems.map(item => (
              <div key={item.id} className="faq-item">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="faq-question"
                  aria-expanded={expandedItems.has(item.id)}
                >
                  <h3 className="h4">{item.question}</h3>
                  <span className="faq-toggle">
                    {expandedItems.has(item.id) ? '−' : '+'}
                  </span>
                </button>
                {expandedItems.has(item.id) && (
                  <div className="faq-answer">
                    <p className="body">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why PepeShows Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('feature43.heading')}</h2>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="h3 mb-3">{t('feature43.reasons.1.title')}</h3>
              <p className="body-sm">{t('feature43.reasons.1.description')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3 className="h3 mb-3">{t('feature43.reasons.2.title')}</h3>
              <p className="body-sm">{t('feature43.reasons.2.description')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3 className="h3 mb-3">{t('feature43.reasons.3.title')}</h3>
              <p className="body-sm">{t('feature43.reasons.3.description')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3 className="h3 mb-3">{t('feature43.reasons.4.title')}</h3>
              <p className="body-sm">{t('feature43.reasons.4.description')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3 className="h3 mb-3">{t('feature43.reasons.5.title')}</h3>
              <p className="body-sm">{t('feature43.reasons.5.description')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3 className="h3 mb-3">{t('feature43.reasons.6.title')}</h3>
              <p className="body-sm">{t('feature43.reasons.6.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="support-card">
            <h2 className="h1 text-center mb-6">Noch Fragen?</h2>
            <p className="body-lg text-center mb-12 max-w-3xl mx-auto">
              Unser Team steht Ihnen gerne für alle Fragen zur Verfügung. 
              Kontaktieren Sie uns per E-Mail, Telefon oder nutzen Sie unser Kontaktformular.
            </p>
            <div className="support-options">
              <div className="support-option">
                <div className="support-icon">📧</div>
                <h4 className="h4 mb-2">E-Mail Support</h4>
                <p className="body-sm mb-4">Antwort innerhalb von 24 Stunden</p>
                <a href="mailto:info@pepe-shows.de" className="btn btn-secondary btn-sm">
                  E-Mail senden
                </a>
              </div>
              <div className="support-option">
                <div className="support-icon">📞</div>
                <h4 className="h4 mb-2">Telefon Support</h4>
                <p className="body-sm mb-4">Mo-Fr, 9-17 Uhr</p>
                <a href="tel:+49123456789" className="btn btn-secondary btn-sm">
                  Anrufen
                </a>
              </div>
              <div className="support-option">
                <div className="support-icon">💬</div>
                <h4 className="h4 mb-2">Kontaktformular</h4>
                <p className="body-sm mb-4">Detaillierte Anfragen</p>
                <Link to="/kontakt" className="btn btn-secondary btn-sm">
                  Zum Formular
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-large text-center bg-gradient-dark">
        <div className="stage-container">
          <div className="overline text-pepe-gold mb-4">BEREIT FÜR IHR EVENT?</div>
          <h2 className="display-2 mb-8">Lassen Sie uns loslegen!</h2>
          <p className="lead mb-12 max-w-3xl mx-auto">
            Nutzen Sie unseren Booking-Assistenten für eine schnelle Anfrage 
            oder kontaktieren Sie uns direkt für eine persönliche Beratung.
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