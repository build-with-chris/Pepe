import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Instagram } from 'lucide-react'

export default function Footer() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const followerCount = '45k' // Static follower count

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Newsletter subscription logic here
    alert('Newsletter-Anmeldung erfolgreich!')
    setEmail('')
  }
  return (
    <footer className="footer">
      <div className="stage-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <img
              src="/logos/SVG/PEPE_logos_shows.svg"
              alt="Pepe Shows Logo"
              style={{ height: '96px', width: 'auto', marginBottom: '1.5rem' }}
            />
            
            {/* Instagram */}
            <div className="mb-8">
              <a
                href="https://www.instagram.com/pepe_arts/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link inline-flex"
                style={{
                  gap: '0.5rem',
                  alignItems: 'baseline'
                }}
              >
                <Instagram
                  style={{
                    width: '0.875rem',
                    height: '0.875rem',
                    color: '#CD7F32',
                    flexShrink: 0
                  }}
                />
                <span>
                  @pepe_arts
                  {followerCount && ` · ${followerCount} Follower`}
                </span>
              </a>
            </div>
            
            {/* Newsletter */}
            <div className="footer-newsletter">
              <h4 className="footer-newsletter-title">{t('footer.newsletter.title')}</h4>
              <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                <div className="newsletter-input-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('footer.newsletter.placeholder')}
                    className="newsletter-input"
                    required
                  />
                  <button type="submit" className="newsletter-btn">
                    {t('footer.newsletter.button')}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Main Links */}
          <div className="footer-links">
            <div className="footer-group">
              <h4 className="footer-title">{t('footer.navigation')}</h4>
              <div className="footer-link-group">
                <Link to="/shows" className="footer-link">{t('footer.mainLinks.showsAndFormate')}</Link>
                <Link to="/kuenstler" className="footer-link">Künstler</Link>
                <Link to="/galerie" className="footer-link">Galerie</Link>
                <Link to="/kontakt" className="footer-link">{t('footer.mainLinks.kontakt')}</Link>
              </div>
            </div>
            
            <div className="footer-group">
              <h4 className="footer-title">Services</h4>
              <div className="footer-link-group">
                <Link to="/anfragen" className="footer-link">Booking Assistent</Link>
                <Link to="/mediamaterial" className="footer-link">{t('footer.mainLinks.mediamaterial')}</Link>
                <Link to="/team" className="footer-link">{t('footer.mainLinks.agenturUndTeam')}</Link>
                <Link to="/login" className="footer-link">{t('footer.mainLinks.artistLogin')}</Link>
              </div>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="footer-group">
            <h4 className="footer-title">Kontakt</h4>
            <div className="footer-link-group">
              <a href="mailto:info@pepeshows.de" className="footer-link">
                info@pepeshows.de
              </a>
              <a href="tel:+4915904891419" className="footer-link">
                +49 159 04891419
              </a>
              <div className="footer-link">
                Heiduk & Hermann GbR PepeShows
              </div>
              <div className="footer-link">
                Maria-Montessori-Str. 4
              </div>
              <div className="footer-link">
                81829 München
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} {t('footer.copyright')}
          </p>
          <div className="footer-legal">
            <Link to="/imprint" className="footer-legal-link">{t('footer.legalLinks.impressum')}</Link>
            <Link to="/privacy" className="footer-legal-link">{t('footer.legalLinks.datenschutz')}</Link>
            <Link to="/terms" className="footer-legal-link">{t('footer.legalLinks.agb')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}