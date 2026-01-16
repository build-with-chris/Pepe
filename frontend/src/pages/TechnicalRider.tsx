import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Technical Rider – Pepe Shows
 * Merged version: New design system + Original content from main branch
 */

type Detail = { labelKey: string; valueKey: string };

type Disziplin = {
  key: string; // i18n key id, e.g., "akrobatik"
  details: Detail[];
};

const RAW_DISZIPLINEN: Disziplin[] = [
  {
    key: "akrobatik",
    details: [
      { labelKey: "area", valueKey: "area" },
      { labelKey: "duration", valueKey: "duration" },
      { labelKey: "music", valueKey: "music" },
      { labelKey: "other", valueKey: "other" },
    ],
  },
  {
    key: "chinesischePole",
    details: [
      { labelKey: "area", valueKey: "area" },
      { labelKey: "rigging", valueKey: "rigging" },
      { labelKey: "setup", valueKey: "setup" },
      { labelKey: "other", valueKey: "other" },
    ],
  },
  {
    key: "cyrWheel",
    details: [
      { labelKey: "area", valueKey: "area" },
      { labelKey: "duration", valueKey: "duration" },
      { labelKey: "music", valueKey: "music" },
    ],
  },
  {
    key: "feuershow",
    details: [
      { labelKey: "area", valueKey: "area" },
      { labelKey: "duration", valueKey: "duration" },
      { labelKey: "music", valueKey: "music" },
    ],
  },
  {
    key: "jonglage",
    details: [
      { labelKey: "area", valueKey: "area" },
      { labelKey: "duration", valueKey: "duration" },
      { labelKey: "music", valueKey: "music" },
    ],
  },
  {
    key: "luftakrobatik",
    details: [
      { labelKey: "area", valueKey: "area" },
      { labelKey: "duration", valueKey: "duration" },
      { labelKey: "music", valueKey: "music" },
      { labelKey: "rigging", valueKey: "rigging" },
      { labelKey: "outdoorOption", valueKey: "outdoorOption" },
    ],
  },
  {
    key: "walkingAct",
    details: [
      { labelKey: "area", valueKey: "area" },
      { labelKey: "duration", valueKey: "duration" },
      { labelKey: "music", valueKey: "music" },
    ],
  },
  {
    key: "zauberei",
    details: [
      { labelKey: "area", valueKey: "area" },
      { labelKey: "duration", valueKey: "duration" },
      { labelKey: "music", valueKey: "music" },
      { labelKey: "light", valueKey: "light" },
    ],
  },
];

export default function TechnicalRider() {
  const { t } = useTranslation();

  const DISZIPLINEN = useMemo(() => {
    const withNames = RAW_DISZIPLINEN.map((d) => ({
      ...d,
      name: t(`technicalRider.disciplines.${d.key}.name`),
    }));
    return withNames.sort((a, b) => a.name.localeCompare(b.name, t("_locale", { defaultValue: "de" })));
  }, [t]);

  return (
    <main>
      {/* Hero Section - New Design */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center">
            <div className="inline-flex items-center gap-2 bg-pepe-ink border border-pepe-line rounded-lg px-4 py-2 mb-8">
              <span className="text-pepe-white text-lg font-semibold">{t("technicalRider.hero.kicker")}</span>
            </div>

            <h1 className="display-1 display-gradient mb-8">
              {t("technicalRider.hero.title")}
            </h1>

            <p className="lead max-w-3xl mx-auto">
              {t("technicalRider.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Disciplines Grid - New Design with Original Content */}
      <section className="section">
        <div className="stage-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DISZIPLINEN.map((d) => (
              <article key={d.key} className="card hover:border-pepe-gold/50 transition-all">
                <div className="card-body">
                  <h3 className="h3 text-pepe-gold mb-4">{d.name}</h3>
                  <dl className="space-y-3">
                    {d.details.map((detail, idx) => (
                      <div key={idx}>
                        <dt className="text-pepe-t60 text-sm font-medium uppercase tracking-wide mb-1">
                          {t(`technicalRider.labels.${detail.labelKey}`)}
                        </dt>
                        <dd className="body-md text-pepe-t90">
                          {t(`technicalRider.values.${d.key}.${detail.valueKey}`)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
