export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center py-20 px-6">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">Datenschutzerklärung</h1>

        <p>
          Wir freuen uns über Ihr Interesse an unserer Website. Der Schutz Ihrer
          Privatsphäre ist uns sehr wichtig. Nachstehend informieren wir Sie ausführlich
          über den Umgang mit Ihren Daten.
        </p>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">1. Verantwortlicher</h2>
          <p>Heiduk & Hermann GbR PepeShows</p>
          <p>Maria-Montessori-Str. 4</p>
          <p>81829 München</p>
          <p>E-Mail: chris@pepearts.de</p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">2. Erhebung und Speicherung personenbezogener Daten</h2>
          <p>
            Wir erheben personenbezogene Daten, wenn Sie uns diese im Rahmen Ihrer Anfrage,
            bei der Nutzung des Booking-Assistenten oder per E-Mail mitteilen. Diese Daten
            verwenden wir ausschließlich zur Bearbeitung Ihrer Anfrage und Durchführung
            unserer Dienstleistungen.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">3. Weitergabe von Daten</h2>
          <p>
            Eine Weitergabe Ihrer Daten an Dritte erfolgt nur, soweit dies zur
            Vertragserfüllung notwendig ist (z. B. an Künstler:innen, die für Ihre
            Veranstaltung gebucht werden) oder wir gesetzlich dazu verpflichtet sind.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">4. Cookies & Analyse</h2>
          <p>
            Unsere Website verwendet Cookies, um die Benutzerfreundlichkeit zu verbessern.
            Außerdem nutzen wir ggf. Analyse-Tools (z. B. Google Analytics), um das
            Nutzungsverhalten auszuwerten. Sie können die Speicherung von Cookies jederzeit
            in Ihrem Browser deaktivieren.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">5. Ihre Rechte</h2>
          <p>
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der
            Verarbeitung Ihrer Daten sowie das Recht auf Datenübertragbarkeit. Zudem können
            Sie der Verarbeitung jederzeit widersprechen.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">6. Kontakt für Datenschutzanfragen</h2>
          <p>
            Wenn Sie Fragen zum Datenschutz haben oder Ihre Rechte ausüben möchten,
            kontaktieren Sie uns bitte unter: chris@pepearts.de
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">7. Rechtsgrundlagen der Verarbeitung</h2>
          <p>
            Wir verarbeiten personenbezogene Daten auf Basis von Art. 6 DSGVO:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Art. 6 Abs. 1 lit. b</strong> (Vertrag/vertragsähnliche Maßnahmen), z. B. zur Bearbeitung von Buchungsanfragen.</li>
            <li><strong>Art. 6 Abs. 1 lit. a</strong> (Einwilligung), z. B. für Newsletter oder optionale Cookies/Analysen.</li>
            <li><strong>Art. 6 Abs. 1 lit. f</strong> (berechtigtes Interesse), z. B. zur Abwehr von Missbrauch/Spam und zur Sicherstellung des Betriebs.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">8. Speicherdauer</h2>
          <p>
            Wir speichern personenbezogene Daten nur so lange, wie es für die jeweiligen Zwecke erforderlich ist
            oder wir gesetzlich (z. B. handels- und steuerrechtliche Aufbewahrungspflichten) dazu verpflichtet sind.
            Anschließend werden die Daten gelöscht oder anonymisiert.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">9. Eingesetzte Dienste & Empfänger</h2>
          <p>Wir setzen zur Bereitstellung unserer Leistungen sorgfältig ausgewählte Dienste ein:</p>
          <h3 className="text-lg font-semibold">9.1 Hosting/Backend (Render)</h3>
          <p>
            Unsere Anwendung wird bei Render (USA) betrieben. Dabei können technische Verbindungsdaten (z. B. IP-Adresse,
            Zeitstempel, Request-Informationen) verarbeitet werden. Eine Übermittlung in Drittländer kann nicht ausgeschlossen
            werden. Wir haben geeignete Schutzmaßnahmen (u. a. Standardvertragsklauseln) getroffen.
          </p>
          <h3 className="text-lg font-semibold">9.2 Authentifizierung (Supabase)</h3>
          <p>
            Für die Registrierung und Anmeldung (inkl. Google-Login) nutzen wir Supabase. Hierbei werden u. a. E-Mail-Adresse
            und – bei Social-Logins – die von Ihnen freigegebenen Profildaten verarbeitet. Supabase kann – je nach Region/Konfiguration –
            Daten in Drittländer übertragen. Wir haben geeignete Schutzmaßnahmen (u. a. Standardvertragsklauseln) getroffen.
          </p>
          <h3 className="text-lg font-semibold">9.3 Bot-Schutz (Cloudflare Turnstile)</h3>
          <p>
            Zum Schutz vor Spam und Missbrauch verwenden wir Cloudflare Turnstile. Bei der Nutzung von Formularen wird ein
            Prüf-Token erstellt, wozu eine Verbindung zu Cloudflare aufgebaut wird. Dabei können technische Daten (z. B. IP-Adresse)
            verarbeitet werden. Eine Übermittlung in Drittländer ist möglich. Wir setzen hierfür geeignete Schutzmechanismen ein.
          </p>
          <h3 className="text-lg font-semibold">9.4 Newsletter / E-Mail-Versand</h3>
          <p>
            Sofern Sie unseren Newsletter abonnieren, verarbeiten wir Ihre E-Mail-Adresse ausschließlich zum Versand des Newsletters.
            Ihre Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen (z. B. über den Abmeldelink).
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">10. Cookies & Analyse (Ergänzung)</h2>
          <p>
            Soweit wir optionale Cookies/Analyse-Tools einsetzen, erfolgt dies nur auf Grundlage Ihrer Einwilligung.
            Sie können Ihre Einwilligung jederzeit für die Zukunft widerrufen. Notwendige Cookies werden eingesetzt,
            um den sicheren Betrieb und grundlegende Funktionen zu gewährleisten.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">11. Ihre Rechte (Ergänzung)</h2>
          <p>
            Sie haben die in Art. 15–21 DSGVO geregelten Rechte (Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit,
            Widerspruch). Darüber hinaus haben Sie das Recht auf Beschwerde bei einer Aufsichtsbehörde. Für Bayern ist zuständig:
            Bayerisches Landesamt für Datenschutzaufsicht (BayLDA), Promenade 18, 91522 Ansbach, Deutschland.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">12. Internationale Datenübermittlungen</h2>
          <p>
            Sofern Daten in Drittländer (außerhalb der EU/des EWR) übertragen werden, stellen wir sicher, dass geeignete Garantien
            gemäß Art. 44 ff. DSGVO bestehen (z. B. EU-Standardvertragsklauseln) und dass ein dem EU-Niveau entsprechender Datenschutz
            gewährleistet ist.
          </p>
        </div>

        <p className="text-sm text-gray-400 pt-6">
          Stand: {new Date().toLocaleDateString("de-DE")}
        </p>
      </div>
    </div>
  )
}