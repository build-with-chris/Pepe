import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'

export default function Team() {
  const { t } = useTranslation();
  return (
    <main>
      {/* Hero Section - Streamlined */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center">
            <h1 className="display-1 display-gradient mb-6">
              {t('team.hero.title')}
            </h1>
            <p className="display-3 text-pepe-gold/90 max-w-3xl mx-auto font-light">
              {t('team.hero.tagline')}
            </p>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-12">
            <h2 className="h1 mb-8">{t('team.whoWeAre.title')}</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="card bg-gradient-to-br from-pepe-ink/50 to-pepe-black/50 border-pepe-gold/20 mb-8">
              <div className="card-body">
                <p className="lead text-center mb-6">
                  {t('team.whoWeAre.intro_paragraph1')}
                </p>
                <div className="h-px bg-pepe-line mb-6 max-w-xs mx-auto"></div>
                <p className="body-lg text-pepe-t80 text-center">
                  {t('team.whoWeAre.intro_paragraph2')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-12">
            <h2 className="h1 mb-8">{t('team.community.title')}</h2>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Community Image Placeholder */}
              <div className="card">
                <div className="aspect-[4/3] bg-gradient-to-br from-pepe-ink to-pepe-black flex items-center justify-center">
                  <div className="text-center text-pepe-t48">
                    <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-sm">Gemeinsames Training im PepeDome</p>
                  </div>
                </div>
              </div>

              {/* Community Text */}
              <div className="flex flex-col justify-center">
                <p className="body-lg text-pepe-t80 mb-6 leading-relaxed">
                  {t('team.community.paragraph1')}
                </p>
                <p className="body-lg text-pepe-t80 leading-relaxed">
                  {t('team.community.paragraph2')}
                </p>
              </div>
            </div>

            <div className="card bg-gradient-to-r from-pepe-ink to-pepe-black/50 p-8 text-center">
              <p className="lead font-semibold text-pepe-gold">
                {t('team.community.closing')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section - Michael & Christoph */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-8">{t('team.founders.title')}</h2>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Michael Card */}
            <div className="card hover:border-pepe-gold/50 transition-all">
              <div className="card-body">
                {/* Image Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-pepe-black to-pepe-ink flex items-center justify-center mb-6 rounded-xl overflow-hidden">
                  <div className="text-center text-pepe-t48">
                    <svg className="w-32 h-32 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="h2 text-pepe-gold mb-4">{t('team.founders.michael_name')}</h3>
                <p className="body-lg text-pepe-t80 leading-relaxed">
                  {t('team.founders.michael_bio')}
                </p>
              </div>
            </div>

            {/* Christoph Card */}
            <div className="card hover:border-pepe-gold/50 transition-all">
              <div className="card-body">
                {/* Image Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-pepe-black to-pepe-ink flex items-center justify-center mb-6 rounded-xl overflow-hidden">
                  <div className="text-center text-pepe-t48">
                    <svg className="w-32 h-32 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="h2 text-pepe-gold mb-4">{t('team.founders.christoph_name')}</h3>
                <p className="body-lg text-pepe-t80 leading-relaxed">
                  {t('team.founders.christoph_bio')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-12">
            <h2 className="h1 mb-8">{t('team.about.title')}</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="card bg-gradient-to-br from-pepe-ink/80 to-pepe-black/80 border-pepe-gold/20">
              <div className="card-body text-center">
                <p className="lead mb-6">
                  <Trans
                    i18nKey="team.about.leadership"
                    values={{
                      michael: 'Michael Heiduk',
                      christoph: 'Christoph Hermann'
                    }}
                    components={{
                      strong: <strong className="text-pepe-gold" />
                    }}
                  />
                </p>
                <div className="h-px bg-pepe-line mb-6 max-w-xs mx-auto"></div>
                <p className="body-lg text-pepe-t80">
                  {t('team.about.perspective')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Promise Section */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-12">
            <h2 className="h1 mb-8">{t('team.servicePromise.title')}</h2>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="card bg-gradient-to-r from-pepe-black/50 to-pepe-ink/50 border-pepe-gold/20 mb-12">
              <div className="card-body text-center">
                <p className="lead">
                  {t('team.servicePromise.intro')}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Point 1 */}
              <div className="card hover:border-pepe-gold/50 transition-all">
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pepe-gold/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-pepe-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="h4 text-pepe-gold mb-3">
                        {t('team.servicePromise.point1_title')}
                      </h3>
                      <p className="body-lg text-pepe-t80">
                        {t('team.servicePromise.point1_text')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Point 2 */}
              <div className="card hover:border-pepe-gold/50 transition-all">
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pepe-gold/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-pepe-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="h4 text-pepe-gold mb-3">
                        {t('team.servicePromise.point2_title')}
                      </h3>
                      <p className="body-lg text-pepe-t80">
                        {t('team.servicePromise.point2_text')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Point 3 */}
              <div className="card hover:border-pepe-gold/50 transition-all">
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pepe-gold/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-pepe-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="h4 text-pepe-gold mb-3">
                        {t('team.servicePromise.point3_title')}
                      </h3>
                      <p className="body-lg text-pepe-t80">
                        {t('team.servicePromise.point3_text')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Point 4 */}
              <div className="card hover:border-pepe-gold/50 transition-all">
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pepe-gold/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-pepe-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="h4 text-pepe-gold mb-3">
                        {t('team.servicePromise.point4_title')}
                      </h3>
                      <p className="body-lg text-pepe-t80">
                        {t('team.servicePromise.point4_text')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-r from-pepe-gold/10 to-pepe-bronze/10 border-pepe-gold/30">
              <div className="card-body text-center">
                <p className="lead font-semibold text-pepe-white">
                  {t('team.servicePromise.closing')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-dark">
        <div className="stage-container text-center">
          <h2 className="display-2 mb-8">{t('team.cta.title')}</h2>

          <div className="max-w-3xl mx-auto mb-12">
            <p className="lead mb-6">
              {t('team.cta.message')}
            </p>
            <p className="h3 text-pepe-gold font-semibold">
              {t('team.cta.closing')}
            </p>
          </div>

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