import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Kontakt() {
  const { t } = useTranslation()
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
            
            {/* Direct Contact Options */}
            <div className="contact-form-card">
              <h2 className="h2 mb-8">Direkt Kontakt aufnehmen</h2>
              <div className="direct-contact-options">
                <div className="contact-option-large">
                  <div className="contact-icon-large mb-4">📧</div>
                  <h3 className="h3 mb-3">{t('contact.email.label')}</h3>
                  <p className="body-md mb-4">{t('contact.email.description')}</p>
                  <a 
                    href="mailto:info@pepe-shows.de?subject=Anfrage%20für%20Pepe%20Shows"
                    className="btn btn-primary btn-lg w-full"
                  >
                    E-Mail schreiben
                  </a>
                  <p className="body-sm text-pepe-t60 mt-3">info@pepe-shows.de</p>
                </div>
                
                <div className="contact-option-large">
                  <div className="contact-icon-large mb-4">📞</div>
                  <h3 className="h3 mb-3">{t('contact.phone.label')}</h3>
                  <p className="body-md mb-4">{t('contact.phone.description')}</p>
                  <a 
                    href="tel:+49123456789"
                    className="btn btn-primary btn-lg w-full"
                  >
                    Jetzt anrufen
                  </a>
                  <p className="body-sm text-pepe-t60 mt-3">+49 123 456789</p>
                </div>
                
                <div className="contact-option-large full-width">
                  <div className="contact-icon-large mb-4">💬</div>
                  <h3 className="h3 mb-3">{t('contact.chat.label')}</h3>
                  <p className="body-md mb-4">{t('contact.chat.description')}</p>
                  <Link 
                    to="/anfragen"
                    className="btn btn-primary btn-lg"
                  >
                    Booking Assistant nutzen
                  </Link>
                </div>
                
                <div className="contact-option-large full-width">
                  <div className="contact-icon-large mb-4">📍</div>
                  <h3 className="h3 mb-3">{t('contact.office.label')}</h3>
                  <p className="body-md mb-4">{t('contact.office.description')}</p>
                  <a 
                    href="https://www.google.de/maps/place/Pepe+Dome+im+Theatron+im+Ostpark/@48.1119726,11.640768,16z/data=!3m1!4b1!4m6!3m5!1s0x479ddfe1623e7b83:0x8f776b2413dcab9e!8m2!3d48.1119726!4d11.6433429!16s%2Fg%2F11dfj6w_tt?entry=ttu&g_ep=EgoyMDI1MDgxOS4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-lg"
                  >
                    Auf Google Maps ansehen
                  </a>
                  <p className="body-sm text-pepe-t60 mt-3">{t('contact.office.address')}</p>
                </div>
              </div>
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