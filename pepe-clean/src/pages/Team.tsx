import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

interface TeamMember {
  name: string
  role: string
  image?: string
  bio?: string
}

export default function Team() {
  const { t } = useTranslation()

  const teamMembers: TeamMember[] = [
    { name: 'Michael Heiduk', role: t('team10.roles.michiHeiduk'), image: '/images/team/michi.jpg' },
    { name: 'Christoph Hermann', role: t('team10.roles.chrisHermann'), image: '/images/team/chris.jpg' },
    { name: 'Daniela Meier', role: t('team10.roles.danielaMeier'), image: '/images/team/daniela.jpg' },
    { name: 'Jakob Vöckler', role: t('team10.roles.jakobVoeckler'), image: '/images/team/jakob.jpg' },
    { name: 'Jonas Dürrbeck', role: t('team10.roles.jonasDuerrbeck'), image: '/images/team/jonas.jpg' },
    { name: 'Carmen Lück', role: t('team10.roles.carmenLueck'), image: '/images/team/carmen.jpg' },
    { name: 'Lukas Brandl', role: t('team10.roles.lukasBrandl'), image: '/images/team/lukas.jpg' },
    { name: 'Thomas Dietz', role: t('team10.roles.thomasDietz'), image: '/images/team/thomas.jpg' },
    { name: 'Oles Koval', role: t('team10.roles.olesKoval'), image: '/images/team/oles.jpg' },
    { name: 'Julian Bellini', role: t('team10.roles.julianBellini'), image: '/images/team/julian.jpg' },
    { name: 'Jawad Rajpoot', role: t('team10.roles.jawadRajpoot'), image: '/images/team/jawad.jpg' },
    { name: 'Serhard Perhat', role: t('team10.roles.serhardPerhat'), image: '/images/team/serhard.jpg' },
    { name: 'Florian', role: t('team10.roles.flo'), image: '/images/team/flo.jpg' },
    { name: 'Henry Hernandez', role: t('team10.roles.henryHernandez'), image: '/images/team/henry.jpg' },
    { name: 'Gabriel Drouin', role: t('team10.roles.gabrielDrouin'), image: '/images/team/gabriel.jpg' },
    { name: 'Svetlana Wotschel', role: t('team10.roles.svetlanaWotschel'), image: '/images/team/svetlana.jpg' },
    { name: 'Sankofa Crew', role: t('team10.roles.sankofaCrew'), image: '/images/team/sankofa.jpg' },
    { name: 'Jana Rippel', role: t('team10.roles.janaRippel'), image: '/images/team/jana.jpg' },
    { name: 'Sarah', role: t('team10.roles.sarah'), image: '/images/team/sarah.jpg' },
    { name: 'Jannick', role: t('team10.roles.jannick'), image: '/images/team/jannick.jpg' },
    { name: 'Dani Thalmaier', role: t('team10.roles.daniThalmaier'), image: '/images/team/dani.jpg' }
  ]

  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center max-w-4xl mx-auto py-16">
            <div className="overline text-pepe-gold mb-6">UNSER TEAM</div>
            <h1 className="display-1 display-gradient mb-8">
              {t('team10.heading')}
            </h1>
            <p className="lead mb-12 max-w-3xl mx-auto">
              {t('team10.subheading')}
            </p>
            <Link to="/login" className="btn btn-primary btn-xl">
              {t('team10.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Network Description */}
      <section className="section">
        <div className="stage-container">
          <div className="text-center mb-16">
            <h2 className="h1 mb-6">{t('hero224.headline')}</h2>
            <p className="body-lg max-w-4xl mx-auto">
              {t('hero224.subline')}
            </p>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member-card">
                <div className="team-member-image">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="team-member-placeholder">
                      <div className="placeholder-icon">👤</div>
                    </div>
                  )}
                </div>
                <div className="team-member-content">
                  <h3 className="h3">{member.name}</h3>
                  <p className="body-sm text-pepe-gold">{member.role}</p>
                  {member.bio && (
                    <p className="body-xs mt-2 text-pepe-t64">{member.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Team Section */}
      <section className="section">
        <div className="stage-container">
          <div className="join-team-card">
            <h2 className="h1 text-center mb-6">Werde Teil des Teams</h2>
            <p className="body-lg text-center mb-12 max-w-3xl mx-auto">
              Du bist Artist und möchtest Teil unseres Netzwerks werden? 
              Wir sind immer auf der Suche nach talentierten Künstlern, 
              die unsere Vision teilen.
            </p>
            <div className="text-center">
              <Link to="/login" className="btn btn-primary btn-xl">
                Als Artist registrieren
              </Link>
              <Link to="/kontakt" className="btn btn-ghost btn-lg ml-4">
                Kontakt aufnehmen
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🎯</div>
              <h3 className="h3 mb-4">Exzellenz</h3>
              <p className="body">
                Wir streben nach künstlerischer Perfektion und 
                liefern Shows auf internationalem Niveau.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3 className="h3 mb-4">Fairness</h3>
              <p className="body">
                Faire Bezahlung und transparente Kommunikation 
                sind die Basis unserer Zusammenarbeit.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">💡</div>
              <h3 className="h3 mb-4">Innovation</h3>
              <p className="body">
                Wir entwickeln ständig neue Showformate und 
                kombinieren Tradition mit modernen Elementen.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌍</div>
              <h3 className="h3 mb-4">Nachhaltigkeit</h3>
              <p className="body">
                Verantwortungsvoller Umgang mit Ressourcen und 
                soziales Engagement sind uns wichtig.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-large text-center bg-gradient-dark">
        <div className="stage-container">
          <div className="overline text-pepe-gold mb-4">BEREIT FÜR IHR EVENT?</div>
          <h2 className="display-2 mb-8">Unser Team für Ihr Event</h2>
          <p className="lead mb-12 max-w-3xl mx-auto">
            Lernen Sie unsere Künstler persönlich kennen oder 
            nutzen Sie den Booking-Assistenten für eine schnelle Anfrage.
          </p>
          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              {t('about1.next.cta.assistant')}
            </Link>
            <Link to="/kuenstler" className="btn btn-ghost btn-lg">
              Künstler entdecken
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}