import { useTranslation } from 'react-i18next'

export default function Imprint() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-pepe-dark py-16">
      <div className="stage-container">
        <div className="max-w-4xl mx-auto">
          <h1 className="display-2 mb-8 text-center">Impressum / Legal Notice</h1>
          
          <div className="prose max-w-none">
            <div className="bg-pepe-surface border border-pepe-line rounded-xl p-8 mb-8">
              <h2 className="h2 mb-6">Deutsch</h2>
              
              <h3 className="h3 mb-4">Angaben gemäß § 5 TMG</h3>
              <div className="space-y-2 mb-6">
                <p className="body"><strong>Heiduk & Hermann GbR PepeShows</strong></p>
                <p className="body">Maria-Montessori-Str. 4</p>
                <p className="body">81829 München</p>
                <p className="body">Deutschland</p>
              </div>

              <h3 className="h3 mb-4">Kontakt</h3>
              <div className="space-y-2 mb-6">
                <p className="body">Telefon: +49 123 456 789</p>
                <p className="body">E-Mail: info@pepeshows.de</p>
              </div>

              <h3 className="h3 mb-4">Vertreten durch</h3>
              <p className="body mb-6">
                Christoph Hermann und Michael Heiduk
              </p>

              <h3 className="h3 mb-4">Registereintrag</h3>
              <div className="space-y-2 mb-6">
                <p className="body">Eintragung im Handelsregister.</p>
                <p className="body">Registergericht: Amtsgericht Berlin</p>
                <p className="body">Registernummer: HRB 12345</p>
              </div>

              <h3 className="h3 mb-4">Umsatzsteuer-ID</h3>
              <p className="body mb-6">
                Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br />
                DE123456789
              </p>

              <h3 className="h3 mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
              <div className="space-y-2 mb-6">
                <p className="body">Max Mustermann</p>
                <p className="body">Musterstraße 123</p>
                <p className="body">12345 Berlin</p>
              </div>

              <h3 className="h3 mb-4">Streitschlichtung</h3>
              <p className="body mb-6">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                https://ec.europa.eu/consumers/odr<br />
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>

              <p className="body mb-6">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>

              <h3 className="h3 mb-4">Haftung für Inhalte</h3>
              <p className="body mb-4">
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
                nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als 
                Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder gespeicherte 
                fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine 
                rechtswidrige Tätigkeit hinweisen.
              </p>
            </div>

            <div className="bg-pepe-surface border border-pepe-line rounded-xl p-8">
              <h2 className="h2 mb-6">English</h2>
              
              <h3 className="h3 mb-4">Information according to § 5 TMG</h3>
              <div className="space-y-2 mb-6">
                <p className="body"><strong>Heiduk & Hermann GbR PepeShows</strong></p>
                <p className="body">Maria-Montessori-Str. 4</p>
                <p className="body">81829 Munich</p>
                <p className="body">Germany</p>
              </div>

              <h3 className="h3 mb-4">Contact</h3>
              <div className="space-y-2 mb-6">
                <p className="body">Phone: +49 123 456 789</p>
                <p className="body">Email: info@pepeshows.de</p>
              </div>

              <h3 className="h3 mb-4">Represented by</h3>
              <p className="body mb-6">
                Christoph Hermann and Michael Heiduk
              </p>

              <h3 className="h3 mb-4">Registry entry</h3>
              <div className="space-y-2 mb-6">
                <p className="body">Entry in the commercial register.</p>
                <p className="body">Registry court: District Court Berlin</p>
                <p className="body">Registration number: HRB 12345</p>
              </div>

              <h3 className="h3 mb-4">VAT ID</h3>
              <p className="body mb-6">
                Sales tax identification number according to §27 a Sales Tax Law:<br />
                DE123456789
              </p>

              <h3 className="h3 mb-4">Responsible for content according to § 55 para. 2 RStV</h3>
              <div className="space-y-2 mb-6">
                <p className="body">Max Mustermann</p>
                <p className="body">Sample Street 123</p>
                <p className="body">12345 Berlin</p>
              </div>

              <h3 className="h3 mb-4">Dispute resolution</h3>
              <p className="body mb-6">
                The European Commission provides a platform for online dispute resolution (ODR): 
                https://ec.europa.eu/consumers/odr<br />
                You can find our email address in the imprint above.
              </p>

              <p className="body">
                We are not willing or obliged to participate in dispute resolution proceedings 
                before a consumer arbitration board.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}