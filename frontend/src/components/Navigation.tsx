import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth, UserButton, useUser } from '@clerk/clerk-react'

interface NavigationProps {
  className?: string
}

export default function Navigation({ className = '' }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  const publicLinks = [
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
                style={{ height: '80px', width: 'auto' }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-links">
            {publicLinks.map((link) => (
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
            {/* Language Switch */}
            <div className="nav-language-compact">
              <button
                onClick={() => changeLanguage(i18n.language === 'de' ? 'en' : 'de')}
                className="lang-btn-compact"
              >
                {i18n.language === 'de' ? 'EN' : 'DE'}
              </button>
            </div>

            {/* Auth Section */}
            {isLoaded && isSignedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="nav-link text-sm"
                >
                  {t('nav.profile', 'Profil')}
                </Link>
                {(user?.publicMetadata as any)?.role === 'shows-admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="nav-link text-sm text-[#D4A574]"
                  >
                    Admin
                  </Link>
                )}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                      userButtonPopoverCard: "bg-[#1A1A1A] border border-[#333]",
                      userButtonPopoverActionButton: "text-white hover:bg-white/10",
                      userButtonPopoverActionButtonText: "text-white",
                      userButtonPopoverFooter: "hidden",
                    }
                  }}
                />
              </div>
            ) : isLoaded ? (
              <div className="flex items-center gap-2">
                <Link to="/login" className="nav-link text-sm">
                  Login
                </Link>
                <Link to="/anfragen" className="btn btn-primary btn-xs">
                  {t('nav.booking')}
                </Link>
              </div>
            ) : null}
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="mobile-menu-content">
            <div className="mobile-menu-header">
              <Link to="/" className="nav-brand-link" onClick={() => setIsMobileMenuOpen(false)}>
                <img
                  src="/logos/SVG/PEPE_logos_shows.svg"
                  alt="Pepe Logo"
                  className="nav-logo-svg"
                  style={{ height: '40px' }}
                />
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
                {publicLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`mobile-menu-link ${location.pathname === link.href ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Auth links for mobile */}
                {isLoaded && isSignedIn ? (
                  <>
                    <Link
                      to="/profile"
                      className="mobile-menu-link"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('nav.profile', 'Mein Profil')}
                    </Link>
                    {user?.is_admin && (
                      <Link
                        to="/admin/dashboard"
                        className="mobile-menu-link text-[#D4A574]"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                  </>
                ) : isLoaded ? (
                  <Link
                    to="/login"
                    className="mobile-menu-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                ) : null}
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
                {isLoaded && isSignedIn ? (
                  <div className="flex items-center justify-center gap-4">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10",
                        }
                      }}
                    />
                  </div>
                ) : (
                  <Link
                    to="/anfragen"
                    className="btn btn-primary btn-lg mobile-menu-cta-btn"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.booking')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
