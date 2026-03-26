import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Shield,
  CreditCard,
  Camera,
  MessageSquare,
  HelpCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || '';

interface GuideSection {
  id: string;
  icon: React.ElementType;
  title: string;
  items: string[];
}

const sections: GuideSection[] = [
  {
    id: "flow",
    icon: BookOpen,
    title: "So funktioniert's",
    items: [
      "Veranstalter geben Datum, Ort & Budget an",
      "Wir schlagen passende Artists vor",
      "Du nennst Konditionen, bei Zusage koordinieren wir alles",
      "Performance, Feedback & Zahlung mit Support",
    ],
  },
  {
    id: "rights",
    icon: CheckCircle2,
    title: "Deine Rechte",
    items: [
      "Alle relevanten Infos vor deiner Zusage",
      "Du entscheidest frei, welche Anfragen du annimmst",
      "Du definierst deine Konditionen selbst",
      "Profil, Medien und Links jederzeit bearbeitbar",
    ],
  },
  {
    id: "standards",
    icon: Shield,
    title: "Unsere Standards",
    items: [
      "Bestätigte Termine sind verbindlich",
      "Antwort auf Anfragen innerhalb von 24–48 h",
      "Pünktlichkeit & klare Kommunikation",
      "Keine riskanten Acts ohne Freigabe",
    ],
  },
  {
    id: "fees",
    icon: CreditCard,
    title: "Honorar & Gebühren",
    items: [
      "Netto-Gage + ggf. Reisekosten transparent ausgewiesen",
      "Service-Fee wird separat aufgeführt",
      "Zahlung nach Auftritt per Rechnung",
    ],
  },
  {
    id: "cancellations",
    icon: AlertCircle,
    title: "Storno & Ausfälle",
    items: [
      "Kundenseitig: Staffelung je nach Abstand zum Termin",
      "Artistenseitig: Nur aus wichtigem Grund",
      "Höhere Gewalt: Fairer Ausgleich nach Vertrag",
    ],
  },
  {
    id: "media",
    icon: Camera,
    title: "Medien & Rechte",
    items: [
      "Deine Bilder & Videos bleiben dein Eigentum",
      "Nutzung durch PepeShows nur zur Bewerbung",
      "Credits werden immer genannt",
      "Freigaben jederzeit widerrufbar",
    ],
  },
  {
    id: "communication",
    icon: MessageSquare,
    title: "Kommunikation",
    items: [
      "Bevorzugt über die Plattform",
      "Ziel: Antwort innerhalb von 24–48 h",
      "Bei Abwesenheit: Auto-Reply im Profil",
    ],
  },
  {
    id: "help",
    icon: HelpCircle,
    title: "Hilfe & Kontakt",
    items: [
      "Technik / Profil: info@pepeshows.de",
      "Buchungen / Verträge: info@pepeshows.de",
      "Notfälle am Eventtag: Hotline bei bestätigten Buchungen",
    ],
  },
];

export default function ArtistGuidlines() {
  const { token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const accept = async () => {
    if (!checked || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const url = `${API_BASE}/api/artists/me/accept_guidelines`;
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
      await refreshUser();
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
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Richtlinien</h1>
            <p className="text-sm text-gray-400 hidden sm:block">Bitte lies und akzeptiere unsere Richtlinien</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Startseite
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 md:py-12">
        {/* TL;DR Hero Card */}
        <div className="mb-10 rounded-2xl bg-gradient-to-br from-[#D4A574]/10 to-[#D4A574]/5 border border-[#D4A574]/20 p-6 md:p-8">
          <h2 className="text-lg md:text-xl font-semibold text-[#D4A574] mb-3">Kurz gesagt</h2>
          <p className="text-gray-300 leading-relaxed max-w-3xl">
            Fair, sicher, transparent. Du entscheidest über Anfragen & Gagen –
            wir kümmern uns um Matching, Vertrag & Support. Medien bleiben deine,
            wir nutzen sie nur zur Bewerbung. Bitte antworte auf Anfragen innerhalb
            von <strong className="text-white">24–48 Stunden</strong> und halte
            Sicherheits-/Venue-Regeln ein.
          </p>
        </div>

        {/* Sections Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className="group bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-5 md:p-6 hover:bg-white/[0.06] transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-[#D4A574]/10 group-hover:bg-[#D4A574]/15 transition-colors">
                    <Icon className="w-5 h-5 text-[#D4A574]" />
                  </div>
                  <h3 className="font-semibold text-white">{section.title}</h3>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400 leading-relaxed">
                      <ChevronRight className="w-3.5 h-3.5 text-[#D4A574]/60 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Consent & Accept - Sticky Footer Card */}
        <div className="sticky bottom-4 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl p-5 md:p-6 shadow-2xl shadow-black/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label
              htmlFor="consent"
              className="flex items-start gap-3 cursor-pointer flex-1 select-none"
            >
              <div className="mt-0.5">
                <input
                  id="consent"
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                  checked
                    ? "bg-[#D4A574] border-[#D4A574]"
                    : "border-white/30 hover:border-[#D4A574]/50"
                }`}>
                  {checked && (
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-300 leading-relaxed">
                Ich habe die Richtlinien gelesen und akzeptiere sie.
              </span>
            </label>
            <button
              onClick={accept}
              disabled={!checked || submitting}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-[#D4A574] px-6 py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-[#E6B887] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#D4A574]/20 disabled:shadow-none"
            >
              {submitting ? 'Speichere…' : 'Richtlinien akzeptieren'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Stand: {new Date().toLocaleDateString("de-DE")} · Bei Fragen:{' '}
            <a href="mailto:info@pepeshows.de" className="text-[#D4A574] hover:underline">info@pepeshows.de</a>
          </p>
        </div>
      </main>
    </div>
  );
}
