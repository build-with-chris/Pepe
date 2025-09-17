import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Artist {
  id: number;
  name: string;
  profile_image_url?: string;
  disciplines?: string[];
}

export default function Agentur() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'https://pepe-backend-4nid.onrender.com';
        const response = await fetch(`${baseUrl}/api/artists`);
        if (response.ok) {
          const data = await response.json();
          const shuffled = data.sort(() => 0.5 - Math.random());
          setArtists(shuffled.slice(0, 12));
        }
      } catch (error) {
        console.error('Failed to fetch artists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return '/placeholder-artist.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    const baseUrl = import.meta.env.VITE_API_URL || 'https://pepe-backend-4nid.onrender.com';
    return `${baseUrl}${imageUrl}`;
  };

  return (
    <main>
      {/* Hero Section with Artist Network */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center">
            <h1 className="display-1 display-gradient mb-12">
              Netzwerk von Weltklasse-Künstlern
            </h1>
            
            {/* Floating Artist Particles */}
            <div className="artist-network-container">
              <div className="artist-particles">
                {!loading && artists.map((artist, index) => (
                  <div
                    key={artist.id}
                    className="artist-particle"
                    style={{
                      '--delay': `${index * 0.2}s`,
                      '--duration': `${20 + Math.random() * 10}s`,
                      '--x': `${(index % 4) * 25 + Math.random() * 15}%`,
                      '--y': `${Math.floor(index / 4) * 33 + Math.random() * 10}%`
                    } as React.CSSProperties}
                  >
                    <div className="artist-bubble">
                      <img 
                        src={getImageUrl(artist.profile_image_url)} 
                        alt={artist.name}
                        className="artist-bubble-image"
                      />
                    </div>
                    <span className="artist-bubble-name">{artist.name}</span>
                  </div>
                ))}
              </div>
            </div>
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

      {/* Why PepeShows Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="display-2 mb-8">Warum PepeShows?</h2>
          </div>

          <div className="feature-cards-grid">
            <div className="feature-card gradient-purple">
              <div className="feature-icon">🎭</div>
              <h3 className="h2 mb-4">Künstler-Expertise</h3>
              <p className="body-lg">
                Wir verstehen beide Seiten – als Künstler und Veranstalter.
              </p>
            </div>
            
            <div className="feature-card gradient-blue">
              <div className="feature-icon">🏆</div>
              <h3 className="h2 mb-4">Weltklasse-Niveau</h3>
              <p className="body-lg">
                Champions und Meister ihres Fachs in unserem Netzwerk.
              </p>
            </div>
            
            <div className="feature-card gradient-green">
              <div className="feature-icon">✨</div>
              <h3 className="h2 mb-4">Unvergessliche Shows</h3>
              <p className="body-lg">
                Präzise, eindrucksvoll und auf höchstem Niveau.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-large text-center bg-gradient-dark">
        <div className="stage-container">
          <h2 className="display-2 mb-8">Lassen Sie uns Ihr Event unvergesslich machen</h2>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              Jetzt anfragen
            </Link>
            <Link to="/shows" className="btn btn-ghost btn-lg">
              Shows entdecken
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}