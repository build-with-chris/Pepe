import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Referenzen() {
  const { t } = useTranslation();
  // Nur echte Referenzen, keine erfundenen
  const references = [
    'Porsche', 'Google', 'BMW', 'Siemens',
    'Tollwood Festival', 'Stadt Gütersloh', 
    'Red Bull', 'Oktoberfest'
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center">
            <h1 className="display-1 display-gradient mb-8">
              {t('referenzen.hero.title')}
            </h1>
          </div>
        </div>
      </section>

      {/* Client Logos Section */}
      <section className="section">
        <div className="stage-container">
          <div className="logo-grid">
            {references.map((ref, index) => (
              <div key={index} className="logo-card">
                <div className="logo-placeholder">
                  <span className="logo-text">{ref}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-dark">
        <div className="stage-container text-center">
          <h2 className="display-2 mb-8">{t('referenzen.cta.title')}</h2>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              {t('referenzen.cta.button')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}