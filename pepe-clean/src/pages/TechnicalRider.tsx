import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

interface DisciplineRequirement {
  area?: string
  duration?: string
  music?: string
  rigging?: string
  setup?: string
  other?: string
  outdoorOption?: string
  light?: string
}

export default function TechnicalRider() {
  const { t } = useTranslation()

  const disciplines = [
    'akrobatik',
    'chinesischePole',
    'cyrWheel',
    'feuershow',
    'jonglage',
    'luftakrobatik',
    'walkingAct',
    'zauberei'
  ]

  const getRequirement = (discipline: string, key: keyof DisciplineRequirement): string => {
    const value = t(`technicalRider.values.${discipline}.${key}`, { defaultValue: '' })
    return value || '–'
  }

  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center max-w-4xl mx-auto py-16">
            <div className="overline text-pepe-gold mb-6">{t('technicalRider.hero.kicker')}</div>
            <h1 className="display-1 display-gradient mb-8">
              {t('technicalRider.hero.title')}
            </h1>
            <p className="lead mb-12 max-w-3xl mx-auto">
              {t('technicalRider.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Technical Requirements Grid */}
      <section className="section">
        <div className="stage-container">
          <div className="technical-rider-grid">
            {disciplines.map((discipline) => (
              <div key={discipline} className="rider-card">
                <div className="rider-card-header">
                  <h3 className="h2">{t(`technicalRider.disciplines.${discipline}.name`)}</h3>
                </div>
                <div className="rider-requirements">
                  {/* Area */}
                  {getRequirement(discipline, 'area') !== '–' && (
                    <div className="requirement-item">
                      <span className="requirement-label">{t('technicalRider.labels.area')}</span>
                      <span className="requirement-value">{getRequirement(discipline, 'area')}</span>
                    </div>
                  )}
                  
                  {/* Duration */}
                  {getRequirement(discipline, 'duration') !== '–' && (
                    <div className="requirement-item">
                      <span className="requirement-label">{t('technicalRider.labels.duration')}</span>
                      <span className="requirement-value">{getRequirement(discipline, 'duration')}</span>
                    </div>
                  )}
                  
                  {/* Music */}
                  {getRequirement(discipline, 'music') !== '–' && (
                    <div className="requirement-item">
                      <span className="requirement-label">{t('technicalRider.labels.music')}</span>
                      <span className="requirement-value">{getRequirement(discipline, 'music')}</span>
                    </div>
                  )}
                  
                  {/* Rigging */}
                  {getRequirement(discipline, 'rigging') !== '–' && (
                    <div className="requirement-item">
                      <span className="requirement-label">{t('technicalRider.labels.rigging')}</span>
                      <span className="requirement-value">{getRequirement(discipline, 'rigging')}</span>
                    </div>
                  )}
                  
                  {/* Setup */}
                  {getRequirement(discipline, 'setup') !== '–' && (
                    <div className="requirement-item">
                      <span className="requirement-label">{t('technicalRider.labels.setup')}</span>
                      <span className="requirement-value">{getRequirement(discipline, 'setup')}</span>
                    </div>
                  )}
                  
                  {/* Light */}
                  {getRequirement(discipline, 'light') !== '–' && (
                    <div className="requirement-item">
                      <span className="requirement-label">{t('technicalRider.labels.light')}</span>
                      <span className="requirement-value">{getRequirement(discipline, 'light')}</span>
                    </div>
                  )}
                  
                  {/* Outdoor Option */}
                  {getRequirement(discipline, 'outdoorOption') !== '–' && (
                    <div className="requirement-item">
                      <span className="requirement-label">{t('technicalRider.labels.outdoorOption')}</span>
                      <span className="requirement-value">{getRequirement(discipline, 'outdoorOption')}</span>
                    </div>
                  )}
                  
                  {/* Other */}
                  {getRequirement(discipline, 'other') !== '–' && (
                    <div className="requirement-item">
                      <span className="requirement-label">{t('technicalRider.labels.other')}</span>
                      <span className="requirement-value">{getRequirement(discipline, 'other')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="download-section text-center">
            <h2 className="h1 mb-6">Technische Dokumente</h2>
            <p className="body-lg mb-12 max-w-3xl mx-auto">
              Laden Sie unseren vollständigen Technical Rider und weitere technische Dokumente herunter.
            </p>
            <div className="download-actions">
              <a 
                href="/media/technical-rider.pdf" 
                download 
                className="btn btn-primary btn-xl"
              >
                Technical Rider (PDF)
              </a>
              <a 
                href="/media/stage-plot.pdf" 
                download 
                className="btn btn-secondary btn-lg"
              >
                Stage Plot (PDF)
              </a>
              <a 
                href="/media/light-plan.pdf" 
                download 
                className="btn btn-ghost btn-lg"
              >
                Lichtplan (PDF)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section">
        <div className="stage-container">
          <div className="tech-contact-card">
            <h3 className="h2 mb-6 text-center">Technische Fragen?</h3>
            <p className="body-lg text-center mb-12 max-w-3xl mx-auto">
              Unser technisches Team beantwortet gerne alle Fragen zu Bühnenaufbau, 
              Rigging, Sound und Licht. Wir passen uns flexibel an Ihre Gegebenheiten an.
            </p>
            <div className="contact-grid">
              <div className="contact-item">
                <h4 className="h4 mb-3">Technische Leitung</h4>
                <p className="body">Christoph Hermann</p>
                <a href="mailto:tech@pepe-shows.de" className="text-pepe-gold hover:underline">
                  tech@pepe-shows.de
                </a>
              </div>
              <div className="contact-item">
                <h4 className="h4 mb-3">Produktionsleitung</h4>
                <p className="body">Michael Heiduk</p>
                <a href="tel:+49123456789" className="text-pepe-gold hover:underline">
                  +49 123 456 789
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-large text-center bg-gradient-dark">
        <div className="stage-container">
          <div className="overline text-pepe-gold mb-4">BEREIT FÜR IHR EVENT?</div>
          <h2 className="display-2 mb-8">Technische Details geklärt?</h2>
          <p className="lead mb-12 max-w-3xl mx-auto">
            Nutzen Sie unseren Booking-Assistenten für eine schnelle Anfrage 
            oder kontaktieren Sie uns direkt für eine persönliche Beratung.
          </p>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              {t('about1.next.cta.assistant')}
            </Link>
            <Link to="/kontakt" className="btn btn-ghost btn-lg">
              Technische Beratung
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}