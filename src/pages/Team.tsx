import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Team() {
  const { t } = useTranslation();
  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center">
            <h1 className="display-1 display-gradient mb-8">
              {t('team.hero.title')}
            </h1>
            <p className="lead mb-12 max-w-4xl mx-auto">
              {t('team.hero.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Champions Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-12">
            <h2 className="h1 mb-8">{t('team.champions.title')}</h2>
          </div>

          <div className="champion-grid">
            <div className="champion-card">
              <div className="champion-icon">🥇</div>
              <h3 className="h3 mb-2">{t('team.champions.juggling')}</h3>
            </div>
            
            <div className="champion-card">
              <div className="champion-icon">🌐</div>
              <h3 className="h3 mb-2">{t('team.champions.cyr_wheel')}</h3>
            </div>
            
            <div className="champion-card">
              <div className="champion-icon">💃</div>
              <h3 className="h3 mb-2">{t('team.champions.breakdancer')}</h3>
            </div>
            
            <div className="champion-card">
              <div className="champion-icon">🎩</div>
              <h3 className="h3 mb-2">{t('team.champions.magician')}</h3>
            </div>
          </div>
          
          <p className="lead text-center mt-12 max-w-4xl mx-auto">
            {t('team.champions.description')}
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-12">
            <h2 className="h1 mb-8">{t('team.about.title')}</h2>
          </div>
          
          <div className="prose-lg max-w-4xl mx-auto text-center">
            <p className="lead mb-6">
              {t('team.about.leadership', {
                michael: 'Michael Heiduk',
                christoph: 'Christoph Hermann'
              })}
            </p>
            <p className="body-lg text-pepe-t80">
              {t('team.about.perspective')}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-dark">
        <div className="stage-container text-center">
          <h2 className="display-2 mb-8">{t('team.cta.title')}</h2>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              {t('team.cta.request_button')}
            </Link>
            <Link to="/kuenstler" className="btn btn-ghost btn-lg">
              {t('team.cta.artists_button')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}