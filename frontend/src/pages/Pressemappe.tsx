import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { BadgeCheck, Calendar, Copy, Star, Building2, Mail, Phone, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Pressemappe – PepeShows
 * Stil: dunkler Pepe‑Look, klare Blöcke, flexibel kopierbare Textbausteine
 * Hinweis: Schrift bevorzugt Futura; Fallback Nunito Sans.
 */

const wrapperStyle: React.CSSProperties = {
  fontFamily: 'Futura, "Nunito Sans", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
};

function Section({ title, children, subtitle }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="bg-black py-12 md:py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-white">
            <Sparkles className="h-5 w-5" />
            <span className="text-lg font-bold">{title}</span>
          </div>
          {subtitle ? <p className="mx-auto max-w-3xl text-gray-300">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-gray-800 bg-[#0b0b0b] p-6">{children}</div>;
}

function Block({
  headline,
  text,
  collapsible = false,
  previewChars = 300,
}: {
  headline: string;
  text: string;
  collapsible?: boolean;
  previewChars?: number;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const needsClamp = collapsible && text.length > previewChars;
  const displayText = expanded || !needsClamp ? text : (text.slice(0, previewChars).trimEnd() + "…");

  return (
    <Card>
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-white text-2xl font-semibold">{headline}</h3>
      </div>
      <p className="text-gray-200 whitespace-pre-line">{displayText}</p>
      {needsClamp && (
        <div className="mt-3">
          <Button size="sm" className="rounded-full" variant="secondary" onClick={() => setExpanded(!expanded)}>
            {expanded ? t("presskit.readLess") : t("presskit.readMore")}
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function Pressemappe() {
  const { t } = useTranslation();
  return (
    <Fragment>
      {/* Hero */}
      <section className="bg-black py-16 md:py-24" style={wrapperStyle}>
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="bg-gray-800 inline-flex items-center gap-2 rounded-md py-2 pl-4 pr-3">
              <BadgeCheck className="h-6 w-6 stroke-white" />
              <span className="text-white text-lg font-bold">{t("presskit.hero.kicker")}</span>
            </div>
            <h1 className="text-white mt-6 text-5xl font-semibold leading-tight md:text-6xl">{t("presskit.hero.title")}</h1>
            <p className="text-gray-300 mt-4 text-lg md:text-xl">
              {t("presskit.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Teaser / Elevator / About */}
      <Section
        title={t("presskit.texts.title")}
        subtitle={t("presskit.texts.subtitle")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Block
            headline={t("presskit.blocks.teaser.headline")}
            text={t("presskit.blocks.teaser.text")}
          />
          <Block
            headline={t("presskit.blocks.elevator.headline")}
            text={t("presskit.blocks.elevator.text")}
            collapsible
            previewChars={420}
          />
          <Block
            headline={t("presskit.blocks.about.headline")}
            text={t("presskit.blocks.about.text")}
            collapsible
            previewChars={420}
          />
        </div>
      </Section>

      {/* Angebote & Formate */}
      <Section
        title={t("presskit.formats.title")}
        subtitle={t("presskit.formats.subtitle")}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-white text-xl font-semibold mb-2">{t("presskit.formats.cards.solo.title")}</h3>
            <p className="text-gray-300">{t("presskit.formats.cards.solo.body")}</p>
          </Card>
          <Card>
            <h3 className="text-white text-xl font-semibold mb-2">{t("presskit.formats.cards.duo.title")}</h3>
            <p className="text-gray-300">{t("presskit.formats.cards.duo.body")}</p>
          </Card>
          <Card>
            <h3 className="text-white text-xl font-semibold mb-2">{t("presskit.formats.cards.evening.title")}</h3>
            <p className="text-gray-300">{t("presskit.formats.cards.evening.body")}</p>
          </Card>
        </div>
        <div className="mt-6 rounded-2xl border border-gray-800 bg-[#0b0b0b] p-6">
          <p className="text-gray-200">
            {t("presskit.formats.disciplinesNote")}
          </p>
        </div>
      </Section>

      {/* Zielgruppen & Referenzen */}
      <Section title={t("presskit.audref.title")} subtitle={t("presskit.audref.subtitle")}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-white text-xl font-semibold mb-3 flex items-center gap-2"><Building2 className="h-5 w-5" /> {t("presskit.audref.audiences.title")}</h3>
            <ul className="text-gray-200 list-disc pl-5 space-y-2">
              <li>{t("presskit.audref.audiences.i1")}</li>
              <li>{t("presskit.audref.audiences.i2")}</li>
              <li>{t("presskit.audref.audiences.i3")}</li>
            </ul>
          </Card>
          <Card>
            <h3 className="text-white text-xl font-semibold mb-3 flex items-center gap-2"><Star className="h-5 w-5" /> {t("presskit.audref.references.title")}</h3>
            <ul className="text-gray-200 list-disc pl-5 space-y-2">
              <li>{t("presskit.audref.references.i1")}</li>
              <li>{t("presskit.audref.references.i2")}</li>
              <li>{t("presskit.audref.references.i3")}</li>
            </ul>
          </Card>
        </div>
      </Section>

      {/* Technik & Logistik */}
      <Section title={t("presskit.tech.title")} subtitle={t("presskit.tech.subtitle")}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-white text-xl font-semibold mb-2">{t("presskit.tech.rider.title")}</h3>
            <ul className="text-gray-200 list-disc pl-5 space-y-2">
              <li>{t("presskit.tech.rider.i1")}</li>
              <li>{t("presskit.tech.rider.i2")}</li>
              <li>{t("presskit.tech.rider.i3")}</li>
            </ul>
          </Card>
          <Card>
            <h3 className="text-white text-xl font-semibold mb-2">{t("presskit.tech.flex.title")}</h3>
            <ul className="text-gray-200 list-disc pl-5 space-y-2">
              <li>{t("presskit.tech.flex.i1")}</li>
              <li>{t("presskit.tech.flex.i2")}</li>
            </ul>
          </Card>
        </div>
      </Section>

      {/* Kontakt */}
      <Section title={t("presskit.contact.title")}>
        <div className="mx-auto max-w-xl">
          <Card>
            <div className="space-y-2 text-gray-200">
              <p className="text-white text-2xl font-semibold mb-2">{t("presskit.contact.person")}</p>
              <p className="flex items-center gap-2"><Mail className="h-5 w-5" /> chris@pepearts.de</p>
              <p className="flex items-center gap-2"><Phone className="h-5 w-5" /> +49 159 04891419</p>
              <p className="flex items-center gap-2"><Globe className="h-5 w-5" /> pepeshows.de</p>
            </div>
          </Card>
        </div>
      </Section>

      {/* Hinweis Sprache/Region */}
      <section className="bg-black pb-20" style={wrapperStyle}>
        <div className="container mx-auto max-w-6xl">
          <div className="rounded-2xl border border-gray-800 bg-[#0b0b0b] p-6 text-center text-gray-300">
            {t("presskit.langnote")}
          </div>
        </div>
      </section>
    </Fragment>
  );
}
