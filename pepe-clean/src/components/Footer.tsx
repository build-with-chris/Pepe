import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="stage-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <h3 className="h3 mb-3">Pepe Shows</h3>
            <p className="body-sm">
              Ihre Bühne für außergewöhnliche Theatererlebnisse
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="footer-links">
            <div className="footer-group">
              <h4 className="footer-title">Navigation</h4>
              <div className="footer-link-group">
                <Link to="/" className="footer-link">Home</Link>
                <Link to="/kuenstler" className="footer-link">Künstler</Link>
                <Link to="/shows" className="footer-link">Shows</Link>
                <Link to="/galerie" className="footer-link">Galerie</Link>
              </div>
            </div>
            
            <div className="footer-group">
              <h4 className="footer-title">Services</h4>
              <div className="footer-link-group">
                <Link to="/anfragen" className="footer-link">Booking</Link>
                <Link to="/kontakt" className="footer-link">Kontakt</Link>
                <a href="#" className="footer-link">Workshops</a>
                <a href="#" className="footer-link">Events</a>
              </div>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="footer-contact">
            <h4 className="footer-title">Kontakt</h4>
            <div className="footer-contact-info">
              <a href="mailto:info@pepe-shows.de" className="footer-contact-link">
                info@pepe-shows.de
              </a>
              <a href="tel:+49123456789" className="footer-contact-link">
                +49 123 456 789
              </a>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2024 Pepe Shows. Alle Rechte vorbehalten.
          </p>
          <div className="footer-legal">
            <a href="#" className="footer-legal-link">Impressum</a>
            <a href="#" className="footer-legal-link">AGB</a>
            <a href="#" className="footer-legal-link">Datenschutz</a>
          </div>
        </div>
      </div>
    </footer>
  )
}