import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logoIcon from '../assets/Logos/icon_pepe.svg'

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
          {/* Enhanced Logo Section */}
          <div className="nav-brand">
            <Link to="/" className="nav-brand-link">
              {/* Logo SVG */}
              <img 
                src={logoIcon} 
                alt="Pepe Logo" 
                className="nav-logo-svg"
              />
              
              {/* Pepe Text */}
              <span className="nav-brand-text">PEPE</span>
              
              {/* Shows Text */}
              <span className="nav-shows-text">SHOWS</span>
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
            className="mobile-menu-btn p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu öffnen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-60 md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-4/5 max-w-sm bg-pepe-dark border-l border-pepe-line">
            <div className="flex items-center justify-between p-6 border-b border-pepe-line">
              <h3 className="h3">Menu</h3>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-white"
                aria-label="Menu schließen"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M6 18l12-12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block nav-link text-lg py-2 ${location.pathname === link.href ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile Language Switch */}
              <div className="pt-4 border-t border-pepe-line">
                <div className="mb-3">
                  <span className="text-sm text-pepe-t64">{t('nav.language')}</span>
                </div>
                <div className="nav-language">
                  <button
                    onClick={() => changeLanguage('de')}
                    className={`lang-btn ${i18n.language === 'de' ? 'active' : ''}`}
                  >
                    Deutsch
                  </button>
                  <span className="lang-separator">|</span>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                  >
                    English
                  </button>
                </div>
              </div>
              
              <div className="pt-6 space-y-3">
                <Link to="/anfragen" className="btn btn-primary btn-xs w-full" onClick={() => setIsMobileMenuOpen(false)}>
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