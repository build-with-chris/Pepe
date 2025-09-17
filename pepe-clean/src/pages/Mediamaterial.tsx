import { Download, FileText, Image as ImageIcon, Video, ExternalLink } from "lucide-react";

export default function Mediamaterial() {
  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center">
            <h1 className="display-1 display-gradient mb-8">
              Mediamaterial
            </h1>
            <p className="lead mb-12 max-w-3xl mx-auto">
              Alles für eure Promo – an einem Ort
            </p>
            <p className="body-lg mb-12 max-w-4xl mx-auto text-pepe-t80">
              Logos, Titelbilder, Pressetexte und Trailer. Dazu optional Pakete je Disziplin, damit ihr genau das bewerben könnt, was ihr gebucht habt.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-xl">
                <Download className="w-5 h-5 mr-2" />
                Komplettes Media-Kit (ZIP)
              </button>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg">
                <ExternalLink className="w-5 h-5 mr-2" />
                YouTube-Trailer
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* General Media Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">Allgemeines Mediamaterial</h2>
          </div>

          <div className="media-grid">
            <div className="media-card">
              <div className="media-card-preview">
                <ImageIcon className="w-16 h-16 text-pepe-gold" />
                <span className="preview-label">Vorschau</span>
              </div>
              <h3 className="h3 mb-3">Logos (SVG/PNG)</h3>
              <p className="body-sm text-pepe-t60 mb-6">
                Farbig, Schwarz, Weiß – mit/ohne Hintergrund.
              </p>
              <div className="media-actions">
                <button className="btn btn-primary btn-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Logo-Pack (ZIP)
                </button>
                <a href="#" className="btn btn-secondary btn-sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Brand-Guide (Seite)
                </a>
              </div>
            </div>

            <div className="media-card">
              <div className="media-card-preview">
                <ImageIcon className="w-16 h-16 text-pepe-gold" />
                <span className="preview-label">Vorschau</span>
              </div>
              <h3 className="h3 mb-3">Titel- / Headerbild</h3>
              <p className="body-sm text-pepe-t60 mb-6">
                High-Res Header für Plakate, Websites & Social.
              </p>
              <div className="media-actions">
                <button className="btn btn-primary btn-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Header 16:9 (JPG)
                </button>
                <button className="btn btn-primary btn-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Header 5:4 (JPG)
                </button>
              </div>
            </div>

            <div className="media-card">
              <div className="media-card-icon">
                <FileText className="w-16 h-16 text-pepe-gold" />
              </div>
              <h3 className="h3 mb-3">Pressemappe / Fact Sheet</h3>
              <p className="body-sm text-pepe-t60 mb-6">
                Kurzvorstellung, USP, Kontakt & Rider.
              </p>
              <div className="media-actions">
                <a href="#" className="btn btn-secondary btn-sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Pressemappe (Seite)
                </a>
                <a href="#" className="btn btn-secondary btn-sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Technik-Rider (Seite)
                </a>
              </div>
            </div>

            <div className="media-card">
              <div className="media-card-icon">
                <Video className="w-16 h-16 text-pepe-gold" />
              </div>
              <h3 className="h3 mb-3">Trailer (Kurzclip)</h3>
              <p className="body-sm text-pepe-t60 mb-6">
                Kurzvorschau für eure Kanäle.
              </p>
              <div className="media-actions">
                <button className="btn btn-primary btn-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download (WEBM)
                </button>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  YouTube-Trailer
                </a>
              </div>
            </div>

            <div className="media-card">
              <div className="media-card-preview">
                <div className="w-16 h-16 bg-pepe-gold/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <span className="preview-label">Vorschau</span>
              </div>
              <h3 className="h3 mb-3">QR-Code zum Trailer</h3>
              <p className="body-sm text-pepe-t60 mb-6">
                Für Flyer, Plakate & Programme.
              </p>
              <div className="media-actions">
                <button className="btn btn-primary btn-sm">
                  <Download className="w-4 h-4 mr-2" />
                  QR-Code (PNG)
                </button>
                <button className="btn btn-primary btn-sm">
                  <Download className="w-4 h-4 mr-2" />
                  QR-Code (SVG)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disciplines Section */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">Disziplinen – Materialpakete</h2>
            <p className="body-lg max-w-3xl mx-auto text-pepe-t80">
              Für gezielte Promo: pro Disziplin 2–3 Fotos, kurzer Textbaustein und ggf. ein Poster-Template.
            </p>
          </div>

          <div className="disciplines-grid">
            <div className="discipline-card">
              <h3 className="h2 mb-3">Cyr-Wheel</h3>
              <p className="body-lg text-pepe-t80 mb-6">
                Atemberaubende Artistik im rotierenden Rad.
              </p>
              <button className="btn btn-ghost">
                aufklappen
              </button>
            </div>

            <div className="discipline-card">
              <h3 className="h2 mb-3">Jonglage</h3>
              <p className="body-lg text-pepe-t80 mb-6">
                Präzision, Rhythmus und Humor – modern inszeniert.
              </p>
              <button className="btn btn-ghost">
                aufklappen
              </button>
            </div>

            <div className="discipline-card">
              <h3 className="h2 mb-3">Akrobatik</h3>
              <p className="body-lg text-pepe-t80 mb-6">
                Dynamische Hebefiguren und kraftvolle Soli.
              </p>
              <button className="btn btn-ghost">
                aufklappen
              </button>
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="btn btn-primary btn-lg">
              <Download className="w-5 h-5 mr-2" />
              Alle Disziplin-Pakete (ZIP)
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-dark">
        <div className="stage-container text-center">
          <h2 className="display-2 mb-8">Alles für Ihre Promotion</h2>
          <div className="cta-actions">
            <button className="btn btn-primary btn-xl">
              <Download className="w-5 h-5 mr-2" />
              Komplettes Media-Kit (ZIP)
            </button>
            <a href="mailto:presse@pepeshows.de" className="btn btn-ghost btn-lg">
              Fragen zum Material
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}