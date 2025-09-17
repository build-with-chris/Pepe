import { Link } from 'react-router-dom';

export default function Referenzen() {
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
              Unsere Referenzen
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
          <h2 className="display-2 mb-8">Werden Sie unsere nächste Referenz</h2>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              Jetzt anfragen
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}