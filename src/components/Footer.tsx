import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Instagram } from 'lucide-react'

export default function Footer() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  
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
            <h3 className="h3 mb-6">Pepe Shows</h3>
            
            {/* Instagram */}
            <div className="mb-8">
              <a 
                href="https://www.instagram.com/pepe_arts/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-social-link inline-flex items-center gap-2"
              >
                <Instagram className="w-3 h-3" />
                <span>@pepe_arts</span>
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
                <Link to="/referenzen" className="footer-link">{t('footer.mainLinks.referenzen')}</Link>
                <Link to="/team" className="footer-link">{t('footer.mainLinks.agenturUndTeam')}</Link>
                <Link to="/login" className="footer-link">{t('footer.mainLinks.artistLogin')}</Link>
              </div>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="footer-group">
            <h4 className="footer-title">Kontakt</h4>
            <div className="footer-link-group">
              <a href="mailto:info@pepe-shows.de" className="footer-link">
                info@pepe-shows.de
              </a>
              <a href="tel:+49123456789" className="footer-link">
                +49 123 456 789
              </a>
              <div className="footer-link">
                PepeDome, Ostpark München
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2024 {t('footer.copyright')}
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