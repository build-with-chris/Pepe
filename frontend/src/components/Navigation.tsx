import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface NavigationProps {
  className?: string
}

export default function Navigation({ className = '' }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Add/remove body class when mobile menu opens/closes
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open')
    } else {
      document.body.classList.remove('mobile-menu-open')
    }
    return () => {
      document.body.classList.remove('mobile-menu-open')
    }
  }, [isMobileMenuOpen])

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/kuenstler', label: t('nav.artists') },
    { href: '/shows', label: t('nav.shows') },
    { href: '/galerie', label: t('nav.gallery') },
    { href: '/kontakt', label: t('nav.contact') },
  ]

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <nav 
      className={`nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md bg-black/90' : 'bg-transparent'
      } ${className}`}
      style={{ '--navbar-height': '80px' } as React.CSSProperties}
    >
      <div className="stage-container">
        <div className="nav-content">
          {/* Logo */}
          <div className="nav-brand">
            <Link to="/" className="nav-brand-link">
              <img
                src="/logos/SVG/PEPE_logos_shows.svg"
                alt="Pepe Shows Logo"
                className="nav-logo-svg"
                style={{ height: '40px', width: 'auto' }}
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          {/* Desktop Actions */}
          <div className="nav-actions">
            {/* Compact Language Switch - Show only inactive choice */}
            <div className="nav-language-compact">
              <button
                onClick={() => changeLanguage(i18n.language === 'de' ? 'en' : 'de')}
                className="lang-btn-compact"
              >
                {i18n.language === 'de' ? 'EN' : 'DE'}
              </button>
            </div>

            <Link to="/anfragen" className="btn btn-primary btn-xs">
              {t('nav.booking')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu öffnen"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay - Full Screen */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="mobile-menu-content">
            <div className="mobile-menu-header">
              <Link to="/" className="nav-brand-link" onClick={() => setIsMobileMenuOpen(false)}>
                <img src={logoIcon} alt="Pepe Logo" className="nav-logo-svg" />
                <span className="nav-brand-text">PEPE</span>
                <span className="nav-shows-text">SHOWS</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-menu-close"
                aria-label="Menu schließen"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mobile-menu-body">
              <nav className="mobile-menu-nav">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`mobile-menu-link ${location.pathname === link.href ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Language Switch */}
              <div className="mobile-menu-language">
                <span className="mobile-menu-language-label">{t('nav.language')}</span>
                <div className="mobile-menu-language-buttons">
                  <button
                    onClick={() => changeLanguage('de')}
                    className={`mobile-menu-lang-btn ${i18n.language === 'de' ? 'active' : ''}`}
                  >
                    Deutsch
                  </button>
                  <span className="mobile-menu-lang-separator">|</span>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`mobile-menu-lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="mobile-menu-cta">
                <Link to="/anfragen" className="btn btn-primary btn-lg mobile-menu-cta-btn" onClick={() => setIsMobileMenuOpen(false)}>
                  {t('nav.booking')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}