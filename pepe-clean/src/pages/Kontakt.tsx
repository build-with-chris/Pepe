import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Kontakt() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    guestCount: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Try multiple endpoints for reliability
      const endpoints = [
        `${import.meta.env.VITE_API_URL || 'https://pepe-backend-4nid.onrender.com'}/api/contact-requests`,
        '/api/contact-requests', 
        'https://api.pepe-shows.com/contact-requests'
      ]
      
      let success = false
      let lastError: any = null
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              ...formData,
              timestamp: new Date().toISOString(),
              source: 'contact-form'
            }),
          })
          
          if (response.ok) {
            success = true
            break
          } else {
            lastError = new Error(`${endpoint}: ${response.status}`)
          }
        } catch (endpointError) {
          lastError = endpointError
          continue
        }
      }
      
      if (success) {
        alert('Vielen Dank für Ihre Nachricht! Wir melden uns innerhalb von 24 Stunden bei Ihnen.')
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          eventType: '',
          eventDate: '',
          guestCount: '',
          message: ''
        })
      } else {
        // Fallback: Store locally
        const requestId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('pending-contact-request', JSON.stringify({
          id: requestId,
          ...formData,
          timestamp: new Date().toISOString(),
          status: 'pending'
        }))
        
        alert('Ihre Nachricht wurde lokal gespeichert. Bitte kontaktieren Sie uns direkt unter info@pepe-shows.com. Ihre Anfrage-ID: ' + requestId)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Es gab einen Fehler beim Senden Ihrer Nachricht. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center max-w-4xl mx-auto py-16">
            <div className="overline text-pepe-gold mb-6">{t('contact.title')}</div>
            <h1 className="display-1 display-gradient mb-8">
              Sprechen wir über
              <br />
              Ihr Event
            </h1>
            <p className="lead mb-12 max-w-3xl mx-auto">
              {t('contact.description')} Haben Sie Fragen zu unseren Shows oder möchten Sie eine individuelle 
              Performance buchen? Wir freuen uns auf Ihre Nachricht.
            </p>
            <div className="hero-actions">
              <Link to="/anfragen" className="btn btn-primary btn-xl">
                {t('about1.next.cta.assistant')}
              </Link>
              <a href="tel:+49123456789" className="btn btn-ghost btn-lg">
                Direkt anrufen
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Options */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">Schnell erreichen</h2>
            <p className="body-lg max-w-3xl mx-auto">
              Wählen Sie den für Sie passenden Kontaktweg. 
              Wir antworten schnell und zuverlässig.
            </p>
          </div>

          <div className="contact-methods-grid">
            <div className="contact-method-card">
              <div className="contact-icon">📧</div>
              <h3 className="h3 mb-3">{t('contact.email.label')}</h3>
              <p className="body-sm mb-4">{t('contact.email.description')}</p>
              <a href="mailto:info@pepe-shows.de" className="btn btn-primary">
                E-Mail schreiben
              </a>
            </div>
            
            <div className="contact-method-card">
              <div className="contact-icon">📞</div>
              <h3 className="h3 mb-3">{t('contact.phone.label')}</h3>
              <p className="body-sm mb-4">{t('contact.phone.description')}</p>
              <a href="tel:+49123456789" className="btn btn-primary">
                Jetzt anrufen
              </a>
            </div>
            
            <div className="contact-method-card">
              <div className="contact-icon">🏢</div>
              <h3 className="h3 mb-3">{t('contact.office.label')}</h3>
              <p className="body-sm mb-4">{t('contact.office.description')}</p>
              <div className="body-sm text-pepe-t80">{t('contact.office.address')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="section">
        <div className="stage-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div className="contact-form-card">
              <h2 className="h2 mb-8">Nachricht senden</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Vorname *</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="form-input" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nachname *</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="form-input" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">E-Mail Adresse *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input" 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Art der Veranstaltung</label>
                  <select 
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Bitte wählen...</option>
                    <option value="hochzeit">Hochzeit</option>
                    <option value="firmenfeier">Firmenfeier</option>
                    <option value="geburtstag">Geburtstag</option>
                    <option value="stadtfest">Stadtfest</option>
                    <option value="theater">Theater/Bühne</option>
                    <option value="incentive">Incentive Event</option>
                    <option value="messe">Messe/Ausstellung</option>
                    <option value="sonstiges">Sonstiges</option>
                  </select>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Datum</label>
                    <input 
                      type="date" 
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Geschätzte Gästeanzahl</label>
                    <input 
                      type="number" 
                      name="guestCount"
                      value={formData.guestCount}
                      onChange={handleInputChange}
                      className="form-input" 
                      placeholder="z.B. 100"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ihre Nachricht *</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-textarea" 
                    rows={6}
                    placeholder="Beschreiben Sie uns Ihre Vorstellungen..."
                    required
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-primary btn-lg submit-btn"
                >
                  {isSubmitting ? 'Wird gesendet...' : 'Nachricht senden'}
                </button>
              </form>
            </div>
            
            {/* Contact Info */}
            <div className="contact-info-section">
              <h2 className="h2 mb-8">Weitere Informationen</h2>
              
              <div className="contact-info-grid">
                <div className="info-card-contact">
                  <h3 className="h3 mb-4">Antwortzeiten</h3>
                  <div className="response-times">
                    <div className="response-item">
                      <span className="status-dot status-green"></span>
                      <span className="body-sm">E-Mail: innerhalb 24h</span>
                    </div>
                    <div className="response-item">
                      <span className="status-dot status-yellow"></span>
                      <span className="body-sm">Telefon: sofort</span>
                    </div>
                    <div className="response-item">
                      <span className="status-dot status-blue"></span>
                      <span className="body-sm">Angebot: 2-3 Werktage</span>
                    </div>
                  </div>
                </div>
                
                <div className="info-card-contact">
                  <h3 className="h3 mb-4">Häufige Fragen</h3>
                  <div className="faq-items">
                    <div className="faq-item">
                      <div className="faq-question">Wie weit im Voraus buchen?</div>
                      <p className="faq-answer">
                        Mindestens 2 Wochen, für große Events empfehlen wir 2-3 Monate.
                      </p>
                    </div>
                    <div className="faq-item">
                      <div className="faq-question">Kostenlose Beratung?</div>
                      <p className="faq-answer">
                        Ja, die erste Beratung ist immer kostenfrei.
                      </p>
                    </div>
                    <div className="faq-item">
                      <div className="faq-question">Deutschlandweite Auftritte?</div>
                      <p className="faq-answer">
                        Ja, wir reisen gerne zu Ihnen. Fahrtkosten werden separat berechnet.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="info-card-contact full-width">
                  <h3 className="h3 mb-4">Unsere Leistungen im Überblick</h3>
                  <div className="services-grid">
                    <div className="service-item">
                      <div className="service-icon">🎭</div>
                      <div className="service-content">
                        <h4 className="service-title">Solo & Duo Acts</h4>
                        <p className="service-description">Kompakte Highlights für jede Veranstaltung</p>
                      </div>
                    </div>
                    <div className="service-item">
                      <div className="service-icon">🎪</div>
                      <div className="service-content">
                        <h4 className="service-title">Varieté Shows</h4>
                        <p className="service-description">Abendfüllende Programme mit Regie</p>
                      </div>
                    </div>
                    <div className="service-item">
                      <div className="service-icon">🎨</div>
                      <div className="service-content">
                        <h4 className="service-title">Maßgeschneiderte Konzepte</h4>
                        <p className="service-description">Individuelle Shows für Ihr Event</p>
                      </div>
                    </div>
                    <div className="service-item">
                      <div className="service-icon">🎵</div>
                      <div className="service-content">
                        <h4 className="service-title">Komplettservice</h4>
                        <p className="service-description">Technik, Musik & Bühnenbild inklusive</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-large text-center bg-gradient-dark">
        <div className="stage-container">
          <div className="overline text-pepe-gold mb-4">SCHNELL & EINFACH</div>
          <h2 className="display-2 mb-8">Nutzen Sie unseren Booking-Assistenten</h2>
          <p className="lead mb-12 max-w-3xl mx-auto">
            Für eine schnelle und präzise Angebotsstellung nutzen Sie unseren 
            interaktiven Booking-Assistenten. Alle Informationen in einem Prozess.
          </p>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              {t('about1.next.cta.assistant')}
            </Link>
            <a href="mailto:info@pepe-shows.de" className="btn btn-ghost btn-lg">
              Direkte E-Mail
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}