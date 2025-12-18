import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Shield,
  Users,
  CreditCard,
  Camera,
  MessageSquare,
  HelpCircle,
  AlertCircle
} from "lucide-react";

interface GuideSection {
  id: string;
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
}

const sections: GuideSection[] = [
  {
    id: "profile-setup",
    icon: Users,
    title: "Profil einrichten",
    content: (
      <ul className="space-y-2 text-gray-300 list-none">
        <li>• Fülle alle Pflichtfelder aus: Name, Kontaktdaten, Adresse, Disziplinen</li>
        <li>• Lade ein professionelles Profilbild und Galeriebilder hoch</li>
        <li>• Beschreibe deine Acts klar und ansprechend</li>
        <li>• Halte deine Verfügbarkeit im Kalender aktuell</li>
      </ul>
    ),
  },
  {
    id: "approval",
    icon: CheckCircle2,
    title: "Freischaltung",
    content: (
      <ul className="space-y-2 text-gray-300 list-none">
        <li>• Nach der Einreichung prüft unser Team dein Profil</li>
        <li>• Dies dauert in der Regel <strong className="text-white">1-2 Werktage</strong></li>
        <li>• Du erhältst eine E-Mail, sobald dein Profil freigeschaltet ist</li>
        <li>• Bei Änderungen nach Freischaltung erfolgt erneute Prüfung</li>
      </ul>
    ),
  },
  {
    id: "bookings",
    icon: Clock,
    title: "Buchungen verwalten",
    content: (
      <ul className="space-y-2 text-gray-300 list-none">
        <li>• Verwalte deine Gigs im Bereich "Meine Gigs"</li>
        <li>• Antworte auf Anfragen innerhalb von <strong className="text-white">24-48 Stunden</strong></li>
        <li>• Halte deine Verfügbarkeit stets aktuell</li>
        <li>• Bestätigte Termine sind verbindlich</li>
      </ul>
    ),
  },
  {
    id: "standards",
    icon: Shield,
    title: "Unsere Standards",
    content: (
      <ul className="space-y-2 text-gray-300 list-none">
        <li>• <strong className="text-white">Zuverlässigkeit:</strong> Pünktlichkeit und professionelles Auftreten</li>
        <li>• <strong className="text-white">Kommunikation:</strong> Klar, freundlich, zeitnah</li>
        <li>• <strong className="text-white">Sicherheit:</strong> Keine riskanten Acts ohne Freigabe</li>
        <li>• <strong className="text-white">Respekt:</strong> Null Toleranz für Diskriminierung</li>
      </ul>
    ),
  },
  {
    id: "fees",
    icon: CreditCard,
    title: "Honorar & Gebühren",
    content: (
      <ul className="space-y-2 text-gray-300 list-none">
        <li>• Du definierst deine Konditionen selbst</li>
        <li>• Netto-Gage + eventuelle Reisekosten werden transparent ausgewiesen</li>
        <li>• Service-Fee wird separat aufgeführt</li>
        <li>• Zahlung erfolgt üblicherweise nach dem Auftritt per Rechnung</li>
      </ul>
    ),
  },
  {
    id: "media",
    icon: Camera,
    title: "Medien & Rechte",
    content: (
      <ul className="space-y-2 text-gray-300 list-none">
        <li>• Deine Bilder und Videos bleiben dein Eigentum</li>
        <li>• Nutzung durch PepeShows nur zur Bewerbung</li>
        <li>• Credits werden immer genannt</li>
        <li>• Freigaben können jederzeit widerrufen werden</li>
      </ul>
    ),
  },
  {
    id: "cancellation",
    icon: AlertCircle,
    title: "Storno & Ausfälle",
    content: (
      <ul className="space-y-2 text-gray-300 list-none">
        <li>• <strong className="text-white">Kundenseitig:</strong> Gestaffelt je nach Abstand zum Termin</li>
        <li>• <strong className="text-white">Artistenseitig:</strong> Nur aus wichtigem Grund</li>
        <li>• Wir helfen bei der Suche nach gleichwertigem Ersatz</li>
        <li>• Höhere Gewalt: Fairer Ausgleich nach Vertrag & Aufwand</li>
      </ul>
    ),
  },
  {
    id: "communication",
    icon: MessageSquare,
    title: "Kommunikation",
    content: (
      <ul className="space-y-2 text-gray-300 list-none">
        <li>• Bevorzugt über die Plattform (Chat/E-Mail)</li>
        <li>• Ziel: Antwort innerhalb von 24-48 Stunden</li>
        <li>• Bei Abwesenheit: Auto-Reply im Profil aktivieren</li>
        <li>• Alle Absprachen dokumentiert = nichts geht verloren</li>
      </ul>
    ),
  },
  {
    id: "help",
    icon: HelpCircle,
    title: "Hilfe & Kontakt",
    content: (
      <div className="space-y-3 text-gray-300">
        <p><strong className="text-white">Technik / Profil:</strong> info@pepeshows.de</p>
        <p><strong className="text-white">Buchungen / Verträge:</strong> info@pepeshows.de</p>
        <p><strong className="text-white">Notfälle am Eventtag:</strong> Hotline (erscheint bei bestätigten Buchungen)</p>
      </div>
    ),
  },
];

export default function Richtlinien() {
  return (
    <DashboardLayout title="Richtlinien">
      <div className="space-y-8">
        {/* Header */}
        <p className="text-gray-400 max-w-2xl">
          Alles was du wissen musst, um erfolgreich bei PepeShows dabei zu sein.
          Fair, transparent, auf den Punkt.
        </p>

        {/* TL;DR Card */}
        <div className="bg-gradient-to-br from-[#D4A574]/10 to-[#D4A574]/5 border border-[#D4A574]/20 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[#D4A574] mb-3">Kurz gesagt (TL;DR)</h2>
          <p className="text-gray-300 leading-relaxed">
            Du entscheidest über Anfragen & Gagen – wir kümmern uns um Matching, Vertrag & Support.
            Medien bleiben deine – wir nutzen sie nur zur Bewerbung.
            Bitte antworte auf Anfragen innerhalb von <strong className="text-white">24-48 Stunden</strong> und
            halte Sicherheits-/Venue-Regeln ein.
          </p>
        </div>

        {/* Sections Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-[#D4A574]/10">
                    <Icon className="w-5 h-5 text-[#D4A574]" />
                  </div>
                  <h3 className="font-semibold text-white">{section.title}</h3>
                </div>
                <div className="text-sm leading-relaxed">{section.content}</div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-center pt-6 border-t border-white/10">
          <p className="text-sm text-gray-500">
            Stand: {new Date().toLocaleDateString("de-DE")} •
            Bei Fragen wende dich an <a href="mailto:info@pepeshows.de" className="text-[#D4A574] hover:underline">info@pepeshows.de</a>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
