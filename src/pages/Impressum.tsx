export default function Impressum() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center py-20 px-6">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">Impressum</h1>
        
        <div className="space-y-2">
          <p><strong>Angaben gemäß § 5 TMG:</strong></p>
          <p>Heiduk & Hermann GbR PepeShows</p>
          <p>Maria-Montessori-Str. 4</p>
          <p>81829 München</p>
        </div>

        <div className="space-y-2">
          <p><strong>Vertreten durch:</strong></p>
          <p>Christoph Hermann und Michael Heiduk</p>
        </div>

        <div className="space-y-2">
          <p><strong>Kontakt:</strong></p>
          <p>Telefon: <a href="tel:+4915904891419" className="underline">+49 159 04891419</a></p>
          <p>E-Mail: <a href="mailto:chris@pepearts.de" className="underline">chris@pepearts.de</a></p>
        </div>

        <div className="space-y-2">
          <p><strong>Rechtsform:</strong></p>
          <p>Gesellschaft bürgerlichen Rechts (GbR)</p>
        </div>

        <div className="space-y-2">
          <p><strong>Umsatzsteuer-Identifikationsnummer gem. § 27a UStG:</strong></p>
          <p>nicht vorhanden</p>
        </div>

        <div className="space-y-2">
          <p><strong>Online-Streitbeilegung / Verbraucherstreitbeilegung:</strong></p>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer" className="underline">
              https://ec.europa.eu/consumers/odr
            </a>.
          </p>
          <p>
            Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </div>

        <div className="space-y-2 text-sm text-white/80">
          <p><strong>Haftung für Inhalte & Links:</strong> Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung
          für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.</p>
        </div>

        <div className="pt-6 text-sm text-gray-400">
          <p>Inhaltlich Verantwortlicher gemäß § 18 Abs. 2 MStV: Christoph Hermann und Michael Heiduk</p>
        </div>
        <p className="text-sm text-gray-400">Stand: {new Date().toLocaleDateString("de-DE")}</p>
      </div>
    </div>
  )
}