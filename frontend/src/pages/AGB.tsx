

export default function AGB() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center py-20 px-6">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">1. Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen
            Heiduk & Hermann GbR PepeShows und ihren Kund:innen. Abweichende Bedingungen
            der Kund:innen finden keine Anwendung, es sei denn, wir haben ihrer Geltung
            ausdrücklich schriftlich zugestimmt.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">2. Vertragsabschluss</h2>
          <p>
            Ein Vertrag kommt zustande, sobald wir eine schriftliche Bestätigung einer
            Anfrage (z. B. per E-Mail oder über unseren Booking-Assistenten) versenden.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">3. Leistungen</h2>
          <p>
            Der Umfang der Leistungen ergibt sich aus der individuellen Vereinbarung.
            Änderungen oder Ergänzungen bedürfen der Schriftform. Wir behalten uns vor,
            Künstler:innen bei Verhinderung durch gleichwertige Acts zu ersetzen.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">4. Preise & Zahlungsbedingungen</h2>
          <p>
            Alle angegebenen Preise verstehen sich als Endpreise, sofern nichts anderes
            vereinbart ist. Zahlungen sind nach Rechnungsstellung innerhalb von 14 Tagen
            ohne Abzug fällig.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">5. Stornierung</h2>
          <p>
            Eine Stornierung durch den Auftraggeber ist bis 30 Tage vor Veranstaltungsbeginn
            kostenfrei möglich. Bei späteren Stornierungen fallen folgende Gebühren an:
          </p>
          <ul className="list-disc pl-6">
            <li>29 bis 15 Tage vor Beginn: 50 % des Auftragswertes</li>
            <li>14 bis 7 Tage vor Beginn: 75 % des Auftragswertes</li>
            <li>6 Tage oder weniger: 100 % des Auftragswertes</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">6. Haftung</h2>
          <p>
            Wir haften nur für Schäden, die auf grobe Fahrlässigkeit oder Vorsatz zurückzuführen sind.
            Für leichte Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten
            (Kardinalpflichten).
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">7. Datenschutz</h2>
          <p>
            Es gilt unsere aktuelle Datenschutzerklärung, die unter /datenschutz abrufbar ist.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">8. Schlussbestimmungen</h2>
          <p>
            Es gilt deutsches Recht. Gerichtsstand ist, soweit gesetzlich zulässig, München.
            Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit
            der übrigen Bestimmungen unberührt.
          </p>
        </div>

        <p className="text-sm text-gray-400 pt-6">
          Stand: {new Date().toLocaleDateString("de-DE")}
        </p>
      </div>
    </div>
  )
}