import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Presskit() {
  const { t } = useTranslation()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center max-w-4xl mx-auto py-16">
            <div className="overline text-pepe-gold mb-6">{t('presskit.hero.kicker')}</div>
            <h1 className="display-1 display-gradient mb-8">
              {t('presskit.hero.title')}
            </h1>
            <p className="lead mb-12 max-w-3xl mx-auto">
              {t('presskit.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Press Texts Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('presskit.texts.title')}</h2>
            <p className="body-lg max-w-3xl mx-auto">
              {t('presskit.texts.subtitle')}
            </p>
          </div>

          <div className="press-text-grid">
            {/* Teaser */}
            <div className="press-text-card">
              <div className="press-text-header">
                <h3 className="h3">{t('presskit.blocks.teaser.headline')}</h3>
                <span className="text-pepe-gold">~50 Wörter</span>
              </div>
              <div className="press-text-content">
                <p className="body">
                  {t('presskit.blocks.teaser.text')}
                </p>
                <button 
                  onClick={() => navigator.clipboard.writeText(t('presskit.blocks.teaser.text'))}
                  className="btn btn-ghost btn-sm mt-4"
                >
                  Text kopieren
                </button>
              </div>
            </div>

            {/* Elevator Pitch */}
            <div className="press-text-card">
              <div className="press-text-header">
                <h3 className="h3">{t('presskit.blocks.elevator.headline')}</h3>
                <span className="text-pepe-gold">~150 Wörter</span>
              </div>
              <div className="press-text-content">
                <div className={`press-text-body ${expandedSections.elevator ? 'expanded' : 'collapsed'}`}>
                  <p className="body">
                    {t('presskit.blocks.elevator.text')}
                  </p>
                </div>
                <div className="press-text-actions">
                  <button 
                    onClick={() => toggleSection('elevator')}
                    className="btn btn-secondary btn-sm"
                  >
                    {expandedSections.elevator ? t('presskit.readLess') : t('presskit.readMore')}
                  </button>
                  <button 
                    onClick={() => navigator.clipboard.writeText(t('presskit.blocks.elevator.text'))}
                    className="btn btn-ghost btn-sm"
                  >
                    Text kopieren
                  </button>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="press-text-card">
              <div className="press-text-header">
                <h3 className="h3">{t('presskit.blocks.about.headline')}</h3>
                <span className="text-pepe-gold">~300 Wörter</span>
              </div>
              <div className="press-text-content">
                <div className={`press-text-body ${expandedSections.about ? 'expanded' : 'collapsed'}`}>
                  <p className="body">
                    {t('presskit.blocks.about.text')}
                  </p>
                </div>
                <div className="press-text-actions">
                  <button 
                    onClick={() => toggleSection('about')}
                    className="btn btn-secondary btn-sm"
                  >
                    {expandedSections.about ? t('presskit.readLess') : t('presskit.readMore')}
                  </button>
                  <button 
                    onClick={() => navigator.clipboard.writeText(t('presskit.blocks.about.text'))}
                    className="btn btn-ghost btn-sm"
                  >
                    Text kopieren
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formats & Combinations */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('presskit.formats.title')}</h2>
            <p className="body-lg max-w-3xl mx-auto">
              {t('presskit.formats.subtitle')}
            </p>
          </div>

          <div className="format-showcase-grid">
            <div className="format-showcase-card">
              <div className="format-icon">🎭</div>
              <h3 className="h3 mb-3">{t('presskit.formats.cards.solo.title')}</h3>
              <p className="body-sm">{t('presskit.formats.cards.solo.body')}</p>
            </div>
            <div className="format-showcase-card">
              <div className="format-icon">👥</div>
              <h3 className="h3 mb-3">{t('presskit.formats.cards.duo.title')}</h3>
              <p className="body-sm">{t('presskit.formats.cards.duo.body')}</p>
            </div>
            <div className="format-showcase-card">
              <div className="format-icon">🎪</div>
              <h3 className="h3 mb-3">{t('presskit.formats.cards.evening.title')}</h3>
              <p className="body-sm">{t('presskit.formats.cards.evening.body')}</p>
            </div>
          </div>

          <div className="disciplines-note">
            <p className="body-sm text-center">
              {t('presskit.formats.disciplinesNote')}
            </p>
          </div>
        </div>
      </section>

      {/* Audiences & References */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('presskit.audref.title')}</h2>
            <p className="body-lg max-w-3xl mx-auto">
              {t('presskit.audref.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="audience-card">
              <h3 className="h3 mb-6">{t('presskit.audref.audiences.title')}</h3>
              <ul className="list-disc list-inside space-y-3">
                <li className="body">{t('presskit.audref.audiences.i1')}</li>
                <li className="body">{t('presskit.audref.audiences.i2')}</li>
                <li className="body">{t('presskit.audref.audiences.i3')}</li>
              </ul>
            </div>
            <div className="reference-card">
              <h3 className="h3 mb-6">{t('presskit.audref.references.title')}</h3>
              <ul className="list-disc list-inside space-y-3">
                <li className="body">{t('presskit.audref.references.i1')}</li>
                <li className="body">{t('presskit.audref.references.i2')}</li>
                <li className="body">{t('presskit.audref.references.i3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technical & Logistics */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('presskit.tech.title')}</h2>
            <p className="body-lg max-w-3xl mx-auto">
              {t('presskit.tech.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="tech-card">
              <h3 className="h3 mb-6">{t('presskit.tech.rider.title')}</h3>
              <ul className="list-disc list-inside space-y-3">
                <li className="body">{t('presskit.tech.rider.i1')}</li>
                <li className="body">{t('presskit.tech.rider.i2')}</li>
                <li className="body">{t('presskit.tech.rider.i3')}</li>
              </ul>
              <Link to="/technical-rider" className="btn btn-primary btn-sm mt-6">
                Technical Rider ansehen
              </Link>
            </div>
            <div className="flex-card">
              <h3 className="h3 mb-6">{t('presskit.tech.flex.title')}</h3>
              <ul className="list-disc list-inside space-y-3">
                <li className="body">{t('presskit.tech.flex.i1')}</li>
                <li className="body">{t('presskit.tech.flex.i2')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Language Note */}
      <section className="section">
        <div className="stage-container text-center">
          <div className="contact-info-card">
            <h3 className="h3 mb-6">{t('presskit.contact.title')}</h3>
            <p className="body-lg mb-8">{t('presskit.contact.person')}</p>
            <div className="contact-actions">
              <a href="mailto:info@pepeshows.de" className="btn btn-primary">
                E-Mail senden
              </a>
              <a href="tel:+4915904891419" className="btn btn-secondary">
                Anrufen
              </a>
            </div>
          </div>
          <div className="language-note mt-12">
            <p className="body-sm text-pepe-t64">
              {t('presskit.langnote')}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-large text-center bg-gradient-dark">
        <div className="stage-container">
          <div className="overline text-pepe-gold mb-4">BEREIT FÜR IHR EVENT?</div>
          <h2 className="display-2 mb-8">Pressematerial nutzen & loslegen</h2>
          <p className="lead mb-12 max-w-3xl mx-auto">
            Nutzen Sie unsere Pressetexte für Ihre Veranstaltungswerbung 
            oder kontaktieren Sie uns für individuelle Anfragen.
          </p>
          <div className="cta-actions">
            <Link to="/mediamaterial" className="btn btn-primary btn-xl">
              Zum Mediamaterial
            </Link>
            <Link to="/kontakt" className="btn btn-ghost btn-lg">
              Direkter Kontakt
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}