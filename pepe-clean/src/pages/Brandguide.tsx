import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Brandguide() {
  const { t } = useTranslation()

  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center max-w-4xl mx-auto py-16">
            <div className="overline text-pepe-gold mb-6">{t('brandguide.hero.kicker')}</div>
            <h1 className="display-1 display-gradient mb-8">
              {t('brandguide.hero.title')}
            </h1>
            <p className="lead mb-12 max-w-3xl mx-auto">
              {t('brandguide.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('brandguide.logos.title')}</h2>
            <p className="body-lg max-w-3xl mx-auto">
              {t('brandguide.logos.subtitle')}
            </p>
          </div>

          <div className="logo-grid">
            {/* Main Logo */}
            <div className="logo-card">
              <div className="logo-display bg-white">
                <img src="/logos/pepe-logo-color.svg" alt="Pepe Logo Color" className="logo-image" />
              </div>
              <h3 className="h3 mb-2">{t('brandguide.logos.main.title')}</h3>
              <p className="body-sm mb-4">{t('brandguide.logos.main.text')}</p>
              <div className="logo-downloads">
                <a href="/logos/pepe-logo-color.svg" download className="btn btn-secondary btn-sm">
                  {t('brandguide.common.svg')}
                </a>
                <a href="/logos/pepe-logo-color.png" download className="btn btn-ghost btn-sm">
                  {t('brandguide.common.png')}
                </a>
              </div>
            </div>

            {/* Inverted Logo */}
            <div className="logo-card">
              <div className="logo-display bg-pepe-dark">
                <img src="/logos/pepe-logo-white.svg" alt="Pepe Logo White" className="logo-image" />
              </div>
              <h3 className="h3 mb-2">{t('brandguide.logos.inverted.title')}</h3>
              <p className="body-sm mb-4">{t('brandguide.logos.inverted.text')}</p>
              <div className="logo-downloads">
                <a href="/logos/pepe-logo-white.svg" download className="btn btn-secondary btn-sm">
                  {t('brandguide.common.svg')}
                </a>
                <a href="/logos/pepe-logo-white.png" download className="btn btn-ghost btn-sm">
                  {t('brandguide.common.png')}
                </a>
              </div>
            </div>

            {/* Monochrome Logo */}
            <div className="logo-card">
              <div className="logo-display bg-gray-100">
                <img src="/logos/pepe-logo-black.svg" alt="Pepe Logo Black" className="logo-image" />
              </div>
              <h3 className="h3 mb-2">{t('brandguide.logos.mono.title')}</h3>
              <p className="body-sm mb-4">{t('brandguide.logos.mono.text')}</p>
              <div className="logo-downloads">
                <a href="/logos/pepe-logo-black.svg" download className="btn btn-secondary btn-sm">
                  {t('brandguide.common.svg')}
                </a>
                <a href="/logos/pepe-logo-black.png" download className="btn btn-ghost btn-sm">
                  {t('brandguide.common.png')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colors Section */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('brandguide.colors.title')}</h2>
            <p className="body-lg max-w-3xl mx-auto">
              {t('brandguide.colors.subtitle')}
            </p>
          </div>

          <div className="color-palette">
            {/* Primary Color */}
            <div className="color-card">
              <div className="color-swatch bg-pepe-dark" style={{ backgroundColor: '#0A0E27' }}></div>
              <h4 className="h4 mb-2">{t('brandguide.colors.primary')}</h4>
              <div className="color-values">
                <div className="color-value">
                  <span className="label">{t('brandguide.colors.hex')}</span>
                  <span className="value">#0A0E27</span>
                </div>
                <div className="color-value">
                  <span className="label">{t('brandguide.colors.rgb')}</span>
                  <span className="value">10, 14, 39</span>
                </div>
                <div className="color-value">
                  <span className="label">{t('brandguide.colors.cmyk')}</span>
                  <span className="value">74, 64, 0, 85</span>
                </div>
              </div>
            </div>

            {/* Gold Color */}
            <div className="color-card">
              <div className="color-swatch bg-pepe-gold" style={{ backgroundColor: '#F7C948' }}></div>
              <h4 className="h4 mb-2">Pepe Gold</h4>
              <div className="color-values">
                <div className="color-value">
                  <span className="label">{t('brandguide.colors.hex')}</span>
                  <span className="value">#F7C948</span>
                </div>
                <div className="color-value">
                  <span className="label">{t('brandguide.colors.rgb')}</span>
                  <span className="value">247, 201, 72</span>
                </div>
                <div className="color-value">
                  <span className="label">{t('brandguide.colors.cmyk')}</span>
                  <span className="value">0, 19, 71, 3</span>
                </div>
              </div>
            </div>

            {/* White */}
            <div className="color-card">
              <div className="color-swatch bg-white border border-gray-200"></div>
              <h4 className="h4 mb-2">{t('brandguide.colors.white')}</h4>
              <div className="color-values">
                <div className="color-value">
                  <span className="label">{t('brandguide.colors.hex')}</span>
                  <span className="value">#FFFFFF</span>
                </div>
                <div className="color-value">
                  <span className="label">{t('brandguide.colors.rgb')}</span>
                  <span className="value">255, 255, 255</span>
                </div>
                <div className="color-value">
                  <span className="label">{t('brandguide.colors.cmyk')}</span>
                  <span className="value">0, 0, 0, 0</span>
                </div>
              </div>
            </div>

            {/* Black */}
            <div className="color-card">
              <div className="color-swatch bg-black"></div>
              <h4 className="h4 mb-2">{t('brandguide.colors.black')}</h4>
              <div className="color-values">
                <div className="color-value">
                  <span className="label">{t('brandguide.colors.hex')}</span>
                  <span className="value">#000000</span>
                </div>
                <div className="color-value">
                  <span className="label">{t('brandguide.colors.rgb')}</span>
                  <span className="value">0, 0, 0</span>
                </div>
                <div className="color-value">
                  <span className="label">{t('brandguide.colors.cmyk')}</span>
                  <span className="value">0, 0, 0, 100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('brandguide.type.title')}</h2>
            <p className="body-lg max-w-3xl mx-auto">
              {t('brandguide.type.subtitle')}
            </p>
          </div>

          <div className="typography-grid">
            <div className="type-card">
              <h3 className="h2 mb-4">{t('brandguide.type.headlines.title')}</h3>
              <p className="body mb-6">{t('brandguide.type.headlines.text')}</p>
              <div className="type-samples">
                <h1 className="display-1 mb-4">Display Headline</h1>
                <h2 className="h1 mb-4">H1 Headline</h2>
                <h3 className="h2 mb-4">H2 Headline</h3>
                <h4 className="h3">H3 Headline</h4>
              </div>
              <a 
                href="https://fonts.google.com/specimen/Nunito+Sans" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm mt-6"
              >
                {t('brandguide.common.googleFonts')}
              </a>
            </div>

            <div className="type-card">
              <h3 className="h2 mb-4">{t('brandguide.type.body.title')}</h3>
              <p className="body mb-6">{t('brandguide.type.body.text')}</p>
              <div className="type-samples">
                <p className="lead mb-4">Lead paragraph text for introductions</p>
                <p className="body mb-4">Body text for regular content and descriptions</p>
                <p className="body-sm mb-4">Small body text for secondary information</p>
                <p className="body-xs">Extra small text for captions and labels</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Imagery Section */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('brandguide.imagery.title')}</h2>
            <p className="body-lg max-w-3xl mx-auto">
              {t('brandguide.imagery.subtitle')}
            </p>
          </div>

          <div className="imagery-grid">
            <div className="imagery-card">
              <img 
                src="/images/Galerie34/Solo.webp" 
                alt={t('brandguide.imagery.alt.streetshow')}
                className="imagery-sample"
              />
              <p className="body-sm mt-3">Streetshow Performance</p>
            </div>
            <div className="imagery-card">
              <img 
                src="/images/Galerie34/Duo.webp" 
                alt={t('brandguide.imagery.alt.solo')}
                className="imagery-sample"
              />
              <p className="body-sm mt-3">Solo Act</p>
            </div>
            <div className="imagery-card">
              <img 
                src="/images/Galerie34/Variete.webp" 
                alt={t('brandguide.imagery.alt.aerial')}
                className="imagery-sample"
              />
              <p className="body-sm mt-3">Luftakrobatik</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tone & Voice Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('brandguide.tone.title')}</h2>
            <p className="body-lg max-w-3xl mx-auto">
              {t('brandguide.tone.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="tone-card do-card">
              <h3 className="h3 mb-6 text-green-500">✓ {t('brandguide.tone.do.title')}</h3>
              <ul className="space-y-3">
                <li className="body">{t('brandguide.tone.do.i1')}</li>
                <li className="body">{t('brandguide.tone.do.i2')}</li>
                <li className="body">{t('brandguide.tone.do.i3')}</li>
              </ul>
            </div>
            <div className="tone-card dont-card">
              <h3 className="h3 mb-6 text-red-500">✗ {t('brandguide.tone.dont.title')}</h3>
              <ul className="space-y-3">
                <li className="body">{t('brandguide.tone.dont.i1')}</li>
                <li className="body">{t('brandguide.tone.dont.i2')}</li>
                <li className="body">{t('brandguide.tone.dont.i3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Download & Contact Section */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="text-center">
            <h2 className="h1 mb-6">Brand Assets Download</h2>
            <p className="body-lg mb-12 max-w-3xl mx-auto">
              Laden Sie alle Markenelemente als komplettes Paket herunter.
            </p>
            <div className="download-actions">
              <a 
                href="/media/pepe-brand-kit.zip" 
                download 
                className="btn btn-primary btn-xl"
              >
                Komplettes Brand Kit (ZIP)
              </a>
              <a 
                href="/media/brand-guidelines.pdf" 
                download 
                className="btn btn-secondary btn-lg"
              >
                Brand Guidelines (PDF)
              </a>
            </div>

            <div className="contact-help mt-16">
              <h3 className="h3 mb-4">{t('brandguide.tone.contact.title')}</h3>
              <p className="body mb-6">{t('brandguide.tone.contact.help')}</p>
              <div className="contact-actions">
                <a href="mailto:brand@pepe-shows.de" className="btn btn-ghost">
                  {t('brandguide.common.email')}
                </a>
                <Link to="/kontakt" className="btn btn-ghost">
                  Kontakt
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
          <h2 className="display-2 mb-8">Mit unserer Marke werben</h2>
          <p className="lead mb-12 max-w-3xl mx-auto">
            Nutzen Sie unsere Markenelemente für Ihre Veranstaltungswerbung 
            und schaffen Sie konsistente, professionelle Kommunikation.
          </p>
          <div className="cta-actions">
            <Link to="/mediamaterial" className="btn btn-primary btn-xl">
              Zum Mediamaterial
            </Link>
            <Link to="/kontakt" className="btn btn-ghost btn-lg">
              Marketing Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}