import { useTranslation } from 'react-i18next'
import BookingWizard from '../components/BookingWizard'

export default function Anfragen() {
  const { t } = useTranslation()
  return (
    <main>
      {/* Hero Section */}
      <section className="section-compact">
        <div className="stage-container">
          <div className="hero-content text-center max-w-4xl mx-auto">
            <div className="overline mb-4">{t('bookingIntro.kicker') || 'Professionelle Booking Anfrage'}</div>
            <h1 className="h1 display-gradient mb-6">
              {t('bookingIntro.heading') || 'Ihre perfekte Show in 7 Schritten'}
            </h1>
            <p className="lead mb-8">
              {t('bookingIntro.body') || 'Detaillierte Planung für maßgeschneiderte Performances. Unser erweiterter Booking-Assistent erfasst alle wichtigen Details für ein präzises Angebot.'}
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Booking Wizard */}
      <section className="section-tight">
        <div className="stage-container">
          <BookingWizard />
        </div>
      </section>
    </main>
  )
}