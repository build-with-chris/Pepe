import { Link } from 'react-router-dom'

export default function Team() {
  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center">
            <h1 className="display-1 display-gradient mb-8">
              Netzwerk von Weltklasse-Künstlern
            </h1>
            <p className="lead mb-12 max-w-4xl mx-auto">
              Wir sind ein breites Netz aus den besten Artisten ihres Fachs – vom 7-fachen Jonglage-Weltmeister über die Cyr-Wheel-Weltmeisterin bis hin zum Olympia-Kader-Breakdancer und dem deutschen Meister der Zauberkunst. Geleitet von PepeShows Michael Heiduk und Christoph Hermann – beide selbst Artisten aus Leidenschaft.
            </p>
          </div>
        </div>
      </section>

      {/* Champions Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-12">
            <h2 className="h1 mb-8">In unserem Team finden sich wahre Champions</h2>
          </div>

          <div className="champion-grid">
            <div className="champion-card">
              <div className="champion-icon">🥇</div>
              <h3 className="h3 mb-2">7-facher Jonglage-Weltmeister</h3>
            </div>
            
            <div className="champion-card">
              <div className="champion-icon">🌐</div>
              <h3 className="h3 mb-2">Cyr-Wheel-Weltmeisterin</h3>
            </div>
            
            <div className="champion-card">
              <div className="champion-icon">💃</div>
              <h3 className="h3 mb-2">Breakdancer aus dem Olympia-Kader</h3>
            </div>
            
            <div className="champion-card">
              <div className="champion-icon">🎩</div>
              <h3 className="h3 mb-2">Deutscher Meister der Zauberkunst</h3>
            </div>
          </div>
          
          <p className="lead text-center mt-12 max-w-4xl mx-auto">
            Wir bringen sie zusammen, um Events unvergesslich zu machen – 
            präzise, eindrucksvoll und auf höchstem Niveau.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-12">
            <h2 className="h1 mb-8">Über uns</h2>
          </div>
          
          <div className="prose-lg max-w-4xl mx-auto text-center">
            <p className="lead mb-6">
              Geleitet und organisiert wird PepeShows von <strong className="text-pepe-gold">Michael Heiduk</strong> und 
              <strong className="text-pepe-gold"> Christoph Hermann</strong> – beide selbst Artisten aus Leidenschaft.
            </p>
            <p className="body-lg text-pepe-t80">
              Mit dieser doppelten Perspektive – Künstler und Veranstalter – wissen wir genau, 
              worauf es ankommt: Professionalität, reibungslose Abläufe und Acts, die dein Publikum begeistern.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-dark">
        <div className="stage-container text-center">
          <h2 className="display-2 mb-8">Unser Team für Ihr Event</h2>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              Jetzt anfragen
            </Link>
            <Link to="/kuenstler" className="btn btn-ghost btn-lg">
              Künstler entdecken
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}