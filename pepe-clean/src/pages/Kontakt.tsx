import { Link } from 'react-router-dom'

export default function Kontakt() {
  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center">
            <h1 className="display-1 display-gradient mb-8">
              Kontakt
            </h1>
            <p className="lead mb-12 max-w-3xl mx-auto">
              Wir sind für dich da.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Assistant Section */}
      <section className="section">
        <div className="stage-container">
          <div className="booking-assistant-card">
            <h2 className="h1 text-center mb-6">Schnell & einfach zur Show</h2>
            <p className="body-lg text-center mb-8 max-w-3xl mx-auto">
              Der schnellste Weg zu Ihrem Angebot: unser Booking-Assistent. 
              Alle Infos eingeben, Angebot erhalten – einfach, unverbindlich & effizient.
            </p>
            <div className="text-center">
              <Link to="/anfragen" className="btn btn-primary btn-xl">
                Booking-Assistent starten
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
              <h3 className="h3 mb-3">E-Mail</h3>
              <p className="body-sm text-pepe-t60 mb-4">
                Auf E-Mails antworten wir in der Regel innerhalb von 24 Stunden.
              </p>
              <a href="mailto:info@pepeshows.de" className="btn btn-primary">
                E-Mail schreiben
              </a>
            </div>
            
            <div className="contact-method-card">
              <div className="contact-icon">🏢</div>
              <h3 className="h3 mb-3">Space</h3>
              <p className="body-sm text-pepe-t60 mb-4">
                Unser PepeDome im Ostpark München.
              </p>
              <div className="contact-address mb-4">
                <div className="body-sm">PepeDome, Ostpark München, 81735</div>
              </div>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Route planen
              </a>
            </div>
            
            <div className="contact-method-card">
              <div className="contact-icon">📞</div>
              <h3 className="h3 mb-3">Telefon</h3>
              <p className="body-sm text-pepe-t60 mb-4">
                Mo–Fr, 9–17 Uhr
              </p>
              <a href="tel:+498912345678" className="btn btn-primary">
                Jetzt anrufen
              </a>
            </div>
            
            <div className="contact-method-card">
              <div className="contact-icon">💬</div>
              <h3 className="h3 mb-3">Live Chat</h3>
              <p className="body-sm text-pepe-t60 mb-4">
                Coming soon...
              </p>
              <button className="btn btn-secondary" disabled>
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">Diese Kunden vertrauen auf Pepe</h2>
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
          <h2 className="display-2 mb-8">Bereit für Ihre Show?</h2>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              Booking-Assistent starten
            </Link>
            <a href="mailto:info@pepeshows.de" className="btn btn-ghost btn-lg">
              Direkte E-Mail
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}