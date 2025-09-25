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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md bg-black/90' : 'bg-transparent'
      } ${className}`}
      style={{
        height: '80px',
      } as React.CSSProperties}
    >
      <div
        className="max-w-6xl mx-auto px-4"
      >
        <div className="flex items-center justify-between h-full">
          {/* Enhanced Logo Section */}
          <div>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                color: '#FFFFFF'
              }}
            >
              {/* Logo SVG */}
              <img
                src={logoIcon}
                alt="Pepe Logo"
                style={{
                  width: '32px',
                  height: '32px'
                }}
              />

              {/* Pepe Text */}
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  fontFamily: "'Outfit', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
                }}
              >
                PEPE
              </span>

              {/* Shows Text */}
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 'normal',
                  color: '#D4A574',
                  fontFamily: "'Outfit', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
                }}
              >
                SHOWS
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                style={{
                  padding: '0.5rem 1rem',
                  textDecoration: 'none',
                  color: location.pathname === link.href ? '#D4A574' : '#FFFFFF',
                  fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#D4A574'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = location.pathname === link.href ? '#D4A574' : '#FFFFFF'
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Compact Language Switch - Show only inactive choice */}
            <button
              onClick={() => changeLanguage(i18n.language === 'de' ? 'en' : 'de')}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.875rem',
                background: 'transparent',
                border: '1px solid #374151',
                color: '#FFFFFF',
                borderRadius: '0.375rem',
                fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D4A574'
                e.currentTarget.style.color = '#D4A574'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#374151'
                e.currentTarget.style.color = '#FFFFFF'
              }}
            >
              {i18n.language === 'de' ? 'EN' : 'DE'}
            </button>

            <Link
              to="/anfragen"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.375rem 0.75rem',
                fontSize: '0.875rem',
                background: '#B8860B',
                color: '#000000',
                textDecoration: 'none',
                borderRadius: '1rem',
                fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                fontWeight: '600',
                transition: 'all 0.3s ease',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#C69315'
                e.currentTarget.style.color = '#FFFFFF'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#B8860B'
                e.currentTarget.style.color = '#000000'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {t('nav.booking')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="block md:hidden p-2 text-white"
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
          <div className="fixed right-0 top-0 h-full w-4/5 max-w-sm bg-neutral-900 border-l border-white/10">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Menu</h3>
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
                  className={`block text-lg py-2 text-white hover:text-yellow-300 transition-colors ${location.pathname === link.href ? 'text-yellow-300' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Language Switch */}
              <div className="pt-4 border-t border-white/10">
                <div className="mb-3">
                  <span className="text-sm text-gray-400">{t('nav.language')}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeLanguage('de')}
                    className={`px-3 py-1 rounded text-sm ${i18n.language === 'de' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    Deutsch
                  </button>
                  <span className="text-gray-500">|</span>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`px-3 py-1 rounded text-sm ${i18n.language === 'en' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <Link to="/anfragen" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
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