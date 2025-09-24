import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || '';

export default function ArtistGuidlines() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const accept = async () => {
    if (!checked || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const url = `${API_BASE}/api/artists/me/accept_guidelines`; console.log('POST', url);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ok: true }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      try { window.dispatchEvent(new Event('artist:guidelines-accepted')); } catch {}
      navigate('/profile');
    } catch (e: any) {
      setError(e?.message || 'Konnte nicht speichern');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="mx-auto max-w-5xl px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Artist Guidelines</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={accept}
              disabled={!checked || submitting}
              className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
              title={!checked ? 'Bitte Checkbox bestätigen' : 'Richtlinien akzeptieren'}
            >
              {submitting ? 'Speichere…' : 'Akzeptieren'}
            </button>
            <Link
              to="/home"
              className="text-sm text-gray-300 hover:text-white underline underline-offset-4"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        {/* Consent Bar */}
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <input
            id="consent"
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-white focus:ring-white"
          />
          <label htmlFor="consent" className="text-sm text-gray-300">
            Ich habe die Richtlinien gelesen und akzeptiere sie.
          </label>
        </div>
        {error && (
          <div className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Intro */}
        <section className="mb-8 md:mb-10">
          <p className="text-gray-300 text-lg leading-relaxed">
            Willkommen bei PepeShows! Diese Seite erklärt dir transparent,{" "}
            wie unsere Plattform funktioniert, welche Rechte du hast und welche Standards
            wir für alle Buchungen setzen. Klar, fair, auf den Punkt.
          </p>
        </section>

        {/* Inhaltsverzeichnis */}
        <nav className="mb-10 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h2 className="font-semibold mb-2">Inhalt</h2>
          <ul className="grid sm:grid-cols-2 gap-y-1 text-sm text-gray-300">
            <li><a className="hover:underline" href="#flow">So funktioniert’s</a></li>
            <li><a className="hover:underline" href="#rights">Deine Rechte</a></li>
            <li><a className="hover:underline" href="#standards">Unsere Standards</a></li>
            <li><a className="hover:underline" href="#fees">Honorar & Gebühren</a></li>
            <li><a className="hover:underline" href="#cancellations">Storno & Ausfälle</a></li>
            <li><a className="hover:underline" href="#media">Medien & Nutzungsrechte</a></li>
            <li><a className="hover:underline" href="#privacy">Datenschutz</a></li>
            <li><a className="hover:underline" href="#communication">Kommunikation</a></li>
            <li><a className="hover:underline" href="#help">Hilfe & Kontakt</a></li>
          </ul>
        </nav>

        {/* TL;DR Karte */}
        <section className="mb-10 rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-semibold mb-2">Kurz gesagt (TL;DR)</h2>
          <p className="text-gray-300">
            Fair, sicher, transparent. Du entscheidest über Anfragen &amp; Gagen,
            wir kümmern uns um Matching, Vertrag &amp; Support. Medien bleiben deine –
            wir nutzen sie nur zur Bewerbung. Bitte antworte auf Anfragen innerhalb von{" "}
            <strong>24–48 h</strong> und halte Sicherheits‑/Venue‑Regeln ein.
          </p>
        </section>

        {/* Abschnitte */}
        <section id="flow" className="mb-10">
          <h3 className="text-lg font-semibold mb-2">So funktioniert’s (4 Schritte)</h3>
          <ol className="list-decimal list-inside space-y-1 text-gray-300">
            <li><strong>Anfrage:</strong> Veranstalter geben Datum, Ort, Rahmen & Budget an.</li>
            <li><strong>Matching:</strong> Wir schlagen passende Artists vor (Disziplin, Stil, Verfügbarkeit).</li>
            <li><strong>Angebot & Zusage:</strong> Du nennst Konditionen; bei Zusage koordinieren wir Ablauf & Details.</li>
            <li><strong>Auftritt & Abrechnung:</strong> Performance, Feedback, Zahlung – mit Support bis zum Schluss.</li>
          </ol>
        </section>

        <section id="rights" className="mb-10">
          <h3 className="text-lg font-semibold mb-2">Deine Rechte</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li><strong>Transparenz:</strong> Alle relevanten Infos vor deiner Zusage.</li>
            <li><strong>Selbstbestimmung:</strong> Du entscheidest frei, welche Anfragen du annimmst.</li>
            <li><strong>Eigene Gagen:</strong> Du definierst Konditionen; wir unterstützen bei der Kalkulation.</li>
            <li><strong>Datenkontrolle:</strong> Profil, Medien und Links jederzeit bearbeiten/löschen.</li>
            <li><strong>Support:</strong> Schnelle Hilfe bei Technik, Rechten oder Konflikten.</li>
          </ul>
        </section>

        <section id="standards" className="mb-10">
          <h3 className="text-lg font-semibold mb-2">Unsere Standards (für alle Buchungen)</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li><strong>Zuverlässigkeit:</strong> Bestätigte Termine sind verbindlich.</li>
            <li><strong>Response-Zeit:</strong> Antwort auf Anfragen innerhalb von <strong>24–48 h</strong>.</li>
            <li><strong>Professionalität:</strong> Pünktlichkeit, klare Kommunikation, Technik-/Sicherheits‑Rider beachten.</li>
            <li><strong>Sicherheit:</strong> Keine riskanten Acts ohne Freigabe/Absicherung; Venue-Regeln einhalten.</li>
            <li><strong>Fair Play:</strong> Keine Umgehung vereinbarter Prozesse/Verträge.</li>
            <li><strong>Respekt & Inklusion:</strong> Null Toleranz für Diskriminierung & grenzüberschreitendes Verhalten.</li>
          </ul>
        </section>

        <section id="fees" className="mb-10">
          <h3 className="text-lg font-semibold mb-2">Honorar & Gebühren</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li><strong>Dein Honorar:</strong> Netto‑Gage + ggf. Reisekosten/Spesen – transparent im Angebot.</li>
            <li><strong>Service‑Fee:</strong> Plattform-/Vermittlungsgebühr wird separat ausgewiesen.</li>
            <li><strong>Zahlung:</strong> Üblicherweise nach Auftritt per Rechnung; Anzahlung/Vorkasse möglich.</li>
          </ul>
        </section>

        <section id="cancellations" className="mb-10">
          <h3 className="text-lg font-semibold mb-2">Storno & Ausfälle (Kurzregel)</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li><strong>Kundenseitig:</strong> Staffelung je nach Abstand zum Termin (z. B. 30/50/100 %).</li>
            <li><strong>Artistenseitig:</strong> Nur aus wichtigem Grund; wir helfen beim gleichwertigen Ersatz.</li>
            <li><strong>Höhere Gewalt:</strong> Fairer Ausgleich nach Vertrag & Aufwand.</li>
          </ul>
        </section>

        <section id="media" className="mb-10">
          <h3 className="text-lg font-semibold mb-2">Medien & Nutzungsrechte</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li><strong>Eigentum:</strong> Deine Bilder/Videos bleiben dein Eigentum.</li>
            <li><strong>Nutzung durch PepeShows:</strong> Nur zur Bewerbung deiner Person/Acts & der Plattform – keine Weitergabe/Verkäufe.</li>
            <li><strong>Credits:</strong> Wir nennen dich (und Fotocredits, wenn hinterlegt).</li>
            <li><strong>Widerruf:</strong> Du kannst Freigaben für Medien jederzeit widerrufen.</li>
          </ul>
        </section>

        <section id="privacy" className="mb-10">
          <h3 className="text-lg font-semibold mb-2">Datenschutz</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>Wir verarbeiten nur, was für Matching, Buchung und Abrechnung nötig ist.</li>
            <li>Du kannst alle personenbezogenen Daten exportieren oder löschen (Profil &gt; Datenschutz).</li>
            <li>Mehr Details in unserer Datenschutzerklärung.</li>
          </ul>
        </section>

        <section id="communication" className="mb-10">
          <h3 className="text-lg font-semibold mb-2">Kommunikation & Erreichbarkeit</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li><strong>Ein Kanal:</strong> Bevorzugt über die Plattform (Chat/E‑Mail), damit nichts verloren geht.</li>
            <li><strong>Response‑Ziel:</strong> 24–48 h. Wenn du verhindert bist → kurzer Auto‑Reply im Profil.</li>
          </ul>
        </section>

        <section id="help" className="mb-12">
          <h3 className="text-lg font-semibold mb-2">Hilfe & Kontakt</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li><strong>Technik/Profil:</strong> support@pepeshows.de</li>
            <li><strong>Buchungen/Verträge:</strong> booking@pepeshows.de</li>
            <li><strong>Notfälle am Eventtag:</strong> Hotline (erscheint bei bestätigten Buchungen)</li>
          </ul>
        </section>

        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
          <span className="text-xs text-gray-400">Stand: {new Date().toLocaleDateString("de-DE")}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={accept}
              disabled={!checked || submitting}
              className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Speichere…' : 'Richtlinien akzeptieren'}
            </button>
            <Link
              to="/home"
              className="text-sm text-gray-300 hover:text-white underline underline-offset-4"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}