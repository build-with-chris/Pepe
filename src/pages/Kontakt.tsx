import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Kontakt() {
  const { t } = useTranslation();
  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero-compact bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center py-8">
            <h1 className="h1 display-gradient mb-4">
              {t('kontakt.hero.title')}
            </h1>
            <p className="body-lg max-w-3xl mx-auto">
              {t('kontakt.hero.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Booking Assistant Section */}
      <section className="section">
        <div className="stage-container">
          <div className="booking-assistant-card">
            <h2 className="h1 text-center mb-6">{t('kontakt.booking.title')}</h2>
            <p className="body-lg text-center mb-8 max-w-3xl mx-auto">
              {t('kontakt.booking.description')}
            </p>
            <div className="text-center">
              <Link to="/anfragen" className="btn btn-primary btn-xl">
                {t('kontakt.booking.button')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods Section */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="contact-methods-grid">
            <div className="contact-method-card">
              <div className="contact-icon">📧</div>
              <h3 className="h3 mb-3">{t('kontakt.methods.email.title')}</h3>
              <p className="body-sm text-pepe-t60 mb-4">
                {t('kontakt.methods.email.description')}
              </p>
              <a href="mailto:info@pepeshows.de" className="btn btn-primary">
                {t('kontakt.methods.email.button')}
              </a>
            </div>
            
            <div className="contact-method-card">
              <div className="contact-icon">🏢</div>
              <h3 className="h3 mb-3">{t('kontakt.methods.space.title')}</h3>
              <p className="body-sm text-pepe-t60 mb-4">
                {t('kontakt.methods.space.description')}
              </p>
              <div className="contact-address mb-4">
                <div className="body-sm">{t('kontakt.methods.space.address')}</div>
              </div>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                {t('kontakt.methods.space.button')}
              </a>
            </div>
            
            <div className="contact-method-card">
              <div className="contact-icon">📞</div>
              <h3 className="h3 mb-3">{t('kontakt.methods.phone.title')}</h3>
              <p className="body-sm text-pepe-t60 mb-4">
                {t('kontakt.methods.phone.hours')}
              </p>
              <a href="tel:+498912345678" className="btn btn-primary">
                {t('kontakt.methods.phone.button')}
              </a>
            </div>
            
            <div className="contact-method-card">
              <div className="contact-icon">💬</div>
              <h3 className="h3 mb-3">{t('kontakt.methods.chat.title')}</h3>
              <p className="body-sm text-pepe-t60 mb-4">
                {t('kontakt.methods.chat.status')}
              </p>
              <button className="btn btn-secondary" disabled>
                {t('kontakt.methods.chat.button')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('kontakt.clients.title')}</h2>
          </div>

          <div className="clients-marquee">
            <div className="clients-track">
              <div className="client-logo">Porsche</div>
              <div className="client-logo">Google</div>
              <div className="client-logo">McDonald's</div>
              <div className="client-logo">AstraZeneca</div>
              <div className="client-logo">Munich Mash</div>
              <div className="client-logo">European Championships</div>
              <div className="client-logo">Tollwood</div>
              <div className="client-logo">Porsche</div>
              <div className="client-logo">Google</div>
              <div className="client-logo">McDonald's</div>
              <div className="client-logo">AstraZeneca</div>
              <div className="client-logo">Munich Mash</div>
              <div className="client-logo">European Championships</div>
              <div className="client-logo">Tollwood</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-dark">
        <div className="stage-container text-center">
          <h2 className="display-2 mb-8">{t('kontakt.cta.title')}</h2>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              {t('kontakt.cta.booking_button')}
            </Link>
            <a href="mailto:info@pepeshows.de" className="btn btn-ghost btn-lg">
              {t('kontakt.cta.email_button')}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}