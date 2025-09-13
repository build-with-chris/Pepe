export default function Kontakt() {
  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero">
        <div className="stage-container">
          <div className="hero-content text-center max-w-4xl mx-auto">
            <div className="overline mb-6">Kontakt</div>
            <h1 className="h1 display-gradient mb-8">
              Sprechen wir über
              <br />
              Ihr Event
            </h1>
            <p className="lead mb-12">
              Haben Sie Fragen zu unseren Shows oder möchten Sie eine individuelle 
              Performance buchen? Wir freuen uns auf Ihre Nachricht.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="section">
        <div className="stage-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div className="card p-8">
              <h2 className="h2 mb-8">Nachricht senden</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Vorname *</label>
                    <input 
                      type="text" 
                      className="input w-full" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="form-label">Nachname *</label>
                    <input 
                      type="text" 
                      className="input w-full" 
                      required 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">E-Mail Adresse *</label>
                  <input 
                    type="email" 
                    className="input w-full" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="form-label">Telefon</label>
                  <input 
                    type="tel" 
                    className="input w-full" 
                  />
                </div>
                
                <div>
                  <label className="form-label">Art der Veranstaltung</label>
                  <select className="input w-full">
                    <option value="">Bitte wählen...</option>
                    <option value="hochzeit">Hochzeit</option>
                    <option value="firmenfeier">Firmenfeier</option>
                    <option value="geburtstag">Geburtstag</option>
                    <option value="stadtfest">Stadtfest</option>
                    <option value="theater">Theater/Bühne</option>
                    <option value="sonstiges">Sonstiges</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Datum</label>
                    <input 
                      type="date" 
                      className="input w-full" 
                    />
                  </div>
                  <div>
                    <label className="form-label">Geschätzte Gästeanzahl</label>
                    <input 
                      type="number" 
                      className="input w-full" 
                      placeholder="z.B. 100"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Ihre Nachricht *</label>
                  <textarea 
                    className="input w-full" 
                    rows={6}
                    placeholder="Beschreiben Sie uns Ihre Vorstellungen..."
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary btn-lg w-full">
                  Nachricht senden
                </button>
              </form>
            </div>
            
            {/* Contact Info */}
            <div>
              <h2 className="h2 mb-8">Kontaktinformationen</h2>
              
              <div className="space-y-8">
                <div className="card p-6">
                  <h3 className="h3 mb-4">Direkte Kontaktaufnahme</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="label mb-2">E-Mail</div>
                      <a 
                        href="mailto:info@pepe-shows.de" 
                        className="body text-pepe-gold hover:text-pepe-gold-hover"
                      >
                        info@pepe-shows.de
                      </a>
                    </div>
                    <div>
                      <div className="label mb-2">Telefon</div>
                      <a 
                        href="tel:+49123456789" 
                        className="body text-pepe-gold hover:text-pepe-gold-hover"
                      >
                        +49 123 456 789
                      </a>
                    </div>
                    <div>
                      <div className="label mb-2">Erreichbarkeit</div>
                      <p className="body-sm">
                        Mo-Fr: 9:00 - 18:00 Uhr<br />
                        Sa: 10:00 - 16:00 Uhr
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="card p-6">
                  <h3 className="h3 mb-4">Antwortzeiten</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="body-sm">E-Mail: innerhalb 24h</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      <span className="body-sm">Telefon: sofort</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="body-sm">Angebot: 2-3 Werktage</span>
                    </div>
                  </div>
                </div>
                
                <div className="card p-6">
                  <h3 className="h3 mb-4">Häufige Fragen</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="label mb-2">Wie weit im Voraus buchen?</div>
                      <p className="body-sm">
                        Mindestens 2 Wochen, für große Events empfehlen wir 2-3 Monate.
                      </p>
                    </div>
                    <div>
                      <div className="label mb-2">Kostenlose Beratung?</div>
                      <p className="body-sm">
                        Ja, die erste Beratung ist immer kostenfrei.
                      </p>
                    </div>
                    <div>
                      <div className="label mb-2">Deutschlandweite Auftritte?</div>
                      <p className="body-sm">
                        Ja, wir reisen gerne zu Ihnen. Fahrtkosten werden separat berechnet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}