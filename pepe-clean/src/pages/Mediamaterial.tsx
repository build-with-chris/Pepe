import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Mediamaterial() {
  const { t } = useTranslation()

  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center max-w-4xl mx-auto py-16">
            <div className="overline text-pepe-gold mb-6">{t('mediamaterial.hero.kicker')}</div>
            <h1 className="display-1 display-gradient mb-8">
              {t('mediamaterial.hero.title')}
            </h1>
            <p className="lead mb-12 max-w-3xl mx-auto">
              {t('mediamaterial.hero.subtitle')}
            </p>
            <div className="hero-actions">
              <a 
                href="/media/pepe-media-kit.zip" 
                download 
                className="btn btn-primary btn-xl"
              >
                {t('mediamaterial.hero.buttons.zip')}
              </a>
              <a 
                href="https://youtube.com/pepeshows" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-ghost btn-lg"
              >
                {t('mediamaterial.hero.buttons.trailer')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* General Media Material */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('mediamaterial.general.title')}</h2>
          </div>

          <div className="media-grid">
            {/* Logos Card */}
            <div className="media-card">
              <div className="media-card-header">
                <div className="media-icon">🎨</div>
                <h3 className="h3">{t('mediamaterial.cards.logos.title')}</h3>
              </div>
              <p className="body-sm mb-6">{t('mediamaterial.cards.logos.desc')}</p>
              <div className="media-card-actions">
                <a href="/media/logos.zip" download className="btn btn-secondary btn-sm">
                  {t('mediamaterial.cards.logos.zip')}
                </a>
                <Link to="/brandguide" className="btn btn-ghost btn-sm">
                  {t('mediamaterial.cards.logos.brandguide')}
                </Link>
              </div>
            </div>

            {/* Header Images Card */}
            <div className="media-card">
              <div className="media-card-header">
                <div className="media-icon">🖼️</div>
                <h3 className="h3">{t('mediamaterial.cards.header.title')}</h3>
              </div>
              <p className="body-sm mb-6">{t('mediamaterial.cards.header.desc')}</p>
              <div className="media-card-actions">
                <a href="/media/header-16-9.jpg" download className="btn btn-secondary btn-sm">
                  {t('mediamaterial.cards.header.h169')}
                </a>
                <a href="/media/header-5-4.jpg" download className="btn btn-ghost btn-sm">
                  {t('mediamaterial.cards.header.h54')}
                </a>
              </div>
            </div>

            {/* Press Kit Card */}
            <div className="media-card">
              <div className="media-card-header">
                <div className="media-icon">📄</div>
                <h3 className="h3">{t('mediamaterial.cards.press.title')}</h3>
              </div>
              <p className="body-sm mb-6">{t('mediamaterial.cards.press.desc')}</p>
              <div className="media-card-actions">
                <Link to="/presskit" className="btn btn-secondary btn-sm">
                  {t('mediamaterial.cards.press.page')}
                </Link>
                <Link to="/technical-rider" className="btn btn-ghost btn-sm">
                  {t('mediamaterial.cards.press.rider')}
                </Link>
              </div>
            </div>

            {/* Trailer Card */}
            <div className="media-card">
              <div className="media-card-header">
                <div className="media-icon">🎬</div>
                <h3 className="h3">{t('mediamaterial.cards.trailer.title')}</h3>
              </div>
              <p className="body-sm mb-6">{t('mediamaterial.cards.trailer.desc')}</p>
              <div className="media-card-actions">
                <a href="/media/trailer.webm" download className="btn btn-secondary btn-sm">
                  {t('mediamaterial.cards.trailer.webm')}
                </a>
                <a 
                  href="https://youtube.com/pepeshows" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  {t('mediamaterial.cards.trailer.youtube')}
                </a>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="media-card">
              <div className="media-card-header">
                <div className="media-icon">📱</div>
                <h3 className="h3">{t('mediamaterial.cards.qr.title')}</h3>
              </div>
              <p className="body-sm mb-6">{t('mediamaterial.cards.qr.desc')}</p>
              <div className="media-card-actions">
                <a href="/media/qr-code.png" download className="btn btn-secondary btn-sm">
                  {t('mediamaterial.cards.qr.png')}
                </a>
                <a href="/media/qr-code.svg" download className="btn btn-ghost btn-sm">
                  {t('mediamaterial.cards.qr.svg')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discipline Material Packages */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('mediamaterial.disciplines.title')}</h2>
            <p className="body-lg max-w-3xl mx-auto">
              {t('mediamaterial.disciplines.subtitle')}
            </p>
          </div>

          <div className="discipline-media-grid">
            {/* Cyr-Wheel */}
            <div className="discipline-media-card">
              <div className="discipline-media-image">
                <img src="/images/disciplines/cyr.jpg" alt={t('mediamaterial.disciplines.items.cyr.name')} />
              </div>
              <div className="discipline-media-content">
                <h3 className="h3 mb-2">{t('mediamaterial.disciplines.items.cyr.name')}</h3>
                <p className="body-sm mb-4">{t('mediamaterial.disciplines.items.cyr.teaser')}</p>
                <div className="discipline-media-actions">
                  <a href="/media/cyr-photos.zip" download className="btn btn-primary btn-sm">
                    {t('mediamaterial.disciplines.items.cyr.zip')}
                  </a>
                  <a href="/media/cyr-text.txt" download className="btn btn-ghost btn-sm">
                    {t('mediamaterial.disciplines.items.cyr.copy')}
                  </a>
                  <a href="/media/cyr-poster.pdf" download className="btn btn-ghost btn-sm">
                    {t('mediamaterial.disciplines.items.cyr.poster')}
                  </a>
                </div>
              </div>
            </div>

            {/* Jonglage */}
            <div className="discipline-media-card">
              <div className="discipline-media-image">
                <img src="/images/disciplines/jonglage.jpg" alt={t('mediamaterial.disciplines.items.jonglage.name')} />
              </div>
              <div className="discipline-media-content">
                <h3 className="h3 mb-2">{t('mediamaterial.disciplines.items.jonglage.name')}</h3>
                <p className="body-sm mb-4">{t('mediamaterial.disciplines.items.jonglage.teaser')}</p>
                <div className="discipline-media-actions">
                  <a href="/media/jonglage-photos.zip" download className="btn btn-primary btn-sm">
                    {t('mediamaterial.disciplines.items.jonglage.zip')}
                  </a>
                  <a href="/media/jonglage-text.txt" download className="btn btn-ghost btn-sm">
                    {t('mediamaterial.disciplines.items.jonglage.copy')}
                  </a>
                </div>
              </div>
            </div>

            {/* Akrobatik */}
            <div className="discipline-media-card">
              <div className="discipline-media-image">
                <img src="/images/disciplines/akrobatik.jpg" alt={t('mediamaterial.disciplines.items.akrobatik.name')} />
              </div>
              <div className="discipline-media-content">
                <h3 className="h3 mb-2">{t('mediamaterial.disciplines.items.akrobatik.name')}</h3>
                <p className="body-sm mb-4">{t('mediamaterial.disciplines.items.akrobatik.teaser')}</p>
                <div className="discipline-media-actions">
                  <a href="/media/akrobatik-photos.zip" download className="btn btn-primary btn-sm">
                    {t('mediamaterial.disciplines.items.akrobatik.zip')}
                  </a>
                  <a href="/media/akrobatik-text.txt" download className="btn btn-ghost btn-sm">
                    {t('mediamaterial.disciplines.items.akrobatik.copy')}
                  </a>
                  <a href="/media/akrobatik-poster.pdf" download className="btn btn-ghost btn-sm">
                    {t('mediamaterial.disciplines.items.akrobatik.poster')}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <a href="/media/all-disciplines.zip" download className="btn btn-secondary btn-lg">
              {t('mediamaterial.disciplines.allZip')}
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-large text-center bg-gradient-dark">
        <div className="stage-container">
          <div className="overline text-pepe-gold mb-4">BEREIT FÜR IHR EVENT?</div>
          <h2 className="display-2 mb-8">Material erhalten & loslegen</h2>
          <p className="lead mb-12 max-w-3xl mx-auto">
            Nutzen Sie unser Mediamaterial für Ihre Veranstaltungswerbung 
            oder kontaktieren Sie uns für individuelle Anfragen.
          </p>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              {t('about1.next.cta.assistant')}
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