import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BadgeCheck, Star, Building2, Mail, Phone, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Pressemappe – PepeShows
 * Merged version: New design system + Original content from main branch
 */

function Section({ title, children, subtitle }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <div className="stage-container">
        <div className="section-header text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-pepe-ink border border-pepe-line rounded-lg px-4 py-2 mb-4">
            <Sparkles className="h-5 w-5 text-pepe-gold" />
            <span className="text-pepe-white text-lg font-semibold">{title}</span>
          </div>
          {subtitle ? <p className="body-lg max-w-3xl mx-auto text-pepe-t80">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
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
    <div className="card hover:border-pepe-gold/50 transition-all">
      <div className="card-body">
        <h3 className="h3 text-pepe-gold mb-4">{headline}</h3>
        <p className="body-md text-pepe-t80 whitespace-pre-line leading-relaxed">{displayText}</p>
        {needsClamp && (
          <div className="mt-4">
            <Button size="sm" variant="secondary" onClick={() => setExpanded(!expanded)}>
              {expanded ? t("presskit.readLess") : t("presskit.readMore")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Pressemappe() {
  const { t } = useTranslation();
  return (
    <main>
      {/* Hero Section - New Design */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center">
            <div className="inline-flex items-center gap-2 bg-pepe-ink border border-pepe-line rounded-lg px-4 py-2 mb-8">
              <BadgeCheck className="h-6 w-6 text-pepe-gold" />
              <span className="text-pepe-white text-lg font-semibold">{t("presskit.hero.kicker")}</span>
            </div>

            <h1 className="display-1 display-gradient mb-8">
              {t("presskit.hero.title")}
            </h1>

            <p className="lead max-w-3xl mx-auto">
              {t("presskit.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Text Blocks: Teaser / Elevator / About */}
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

      {/* Formats & Combinations */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-pepe-black border border-pepe-line rounded-lg px-4 py-2 mb-4">
              <Sparkles className="h-5 w-5 text-pepe-gold" />
              <span className="text-pepe-white text-lg font-semibold">{t("presskit.formats.title")}</span>
            </div>
            <p className="body-lg max-w-3xl mx-auto text-pepe-t80">{t("presskit.formats.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="card hover:border-pepe-gold/50 transition-all">
              <div className="card-body">
                <h3 className="h4 text-pepe-gold mb-2">{t("presskit.formats.cards.solo.title")}</h3>
                <p className="body-md text-pepe-t80">{t("presskit.formats.cards.solo.body")}</p>
              </div>
            </div>
            <div className="card hover:border-pepe-gold/50 transition-all">
              <div className="card-body">
                <h3 className="h4 text-pepe-gold mb-2">{t("presskit.formats.cards.duo.title")}</h3>
                <p className="body-md text-pepe-t80">{t("presskit.formats.cards.duo.body")}</p>
              </div>
            </div>
            <div className="card hover:border-pepe-gold/50 transition-all">
              <div className="card-body">
                <h3 className="h4 text-pepe-gold mb-2">{t("presskit.formats.cards.evening.title")}</h3>
                <p className="body-md text-pepe-t80">{t("presskit.formats.cards.evening.body")}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <p className="body-md text-pepe-t80">
                {t("presskit.formats.disciplinesNote")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences & References */}
      <Section title={t("presskit.audref.title")} subtitle={t("presskit.audref.subtitle")}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card hover:border-pepe-gold/50 transition-all">
            <div className="card-body">
              <h3 className="h4 text-pepe-gold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t("presskit.audref.audiences.title")}
              </h3>
              <ul className="body-md text-pepe-t80 list-disc pl-5 space-y-2">
                <li>{t("presskit.audref.audiences.i1")}</li>
                <li>{t("presskit.audref.audiences.i2")}</li>
                <li>{t("presskit.audref.audiences.i3")}</li>
              </ul>
            </div>
          </div>
          <div className="card hover:border-pepe-gold/50 transition-all">
            <div className="card-body">
              <h3 className="h4 text-pepe-gold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5" />
                {t("presskit.audref.references.title")}
              </h3>
              <ul className="body-md text-pepe-t80 list-disc pl-5 space-y-2">
                <li>{t("presskit.audref.references.i1")}</li>
                <li>{t("presskit.audref.references.i2")}</li>
                <li>{t("presskit.audref.references.i3")}</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Technical & Logistics */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-pepe-black border border-pepe-line rounded-lg px-4 py-2 mb-4">
              <Sparkles className="h-5 w-5 text-pepe-gold" />
              <span className="text-pepe-white text-lg font-semibold">{t("presskit.tech.title")}</span>
            </div>
            <p className="body-lg max-w-3xl mx-auto text-pepe-t80">{t("presskit.tech.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card hover:border-pepe-gold/50 transition-all">
              <div className="card-body">
                <h3 className="h4 text-pepe-gold mb-3">{t("presskit.tech.rider.title")}</h3>
                <ul className="body-md text-pepe-t80 list-disc pl-5 space-y-2">
                  <li>{t("presskit.tech.rider.i1")}</li>
                  <li>{t("presskit.tech.rider.i2")}</li>
                  <li>{t("presskit.tech.rider.i3")}</li>
                </ul>
              </div>
            </div>
            <div className="card hover:border-pepe-gold/50 transition-all">
              <div className="card-body">
                <h3 className="h4 text-pepe-gold mb-3">{t("presskit.tech.flex.title")}</h3>
                <ul className="body-md text-pepe-t80 list-disc pl-5 space-y-2">
                  <li>{t("presskit.tech.flex.i1")}</li>
                  <li>{t("presskit.tech.flex.i2")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <Section title={t("presskit.contact.title")}>
        <div className="mx-auto max-w-xl">
          <div className="card hover:border-pepe-gold/50 transition-all">
            <div className="card-body">
              <p className="h3 text-pepe-gold mb-4">{t("presskit.contact.person")}</p>
              <div className="space-y-3 body-md text-pepe-t80">
                <p className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-pepe-gold" />
                  chris@pepearts.de
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-pepe-gold" />
                  +49 159 04891419
                </p>
                <p className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-pepe-gold" />
                  pepeshows.de
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Language/Region Note */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="card">
            <div className="card-body text-center">
              <p className="body-md text-pepe-t80">
                {t("presskit.langnote")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}