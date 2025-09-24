import React, { Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Technical Rider – Pepe Shows
 * Stil: dunkler Hintergrund (Pepe-Style), klare Cards, responsives Grid
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
    <Fragment>
      {/* Hero */}
      <section className="bg-black py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="bg-gray-800 inline-flex items-center gap-2 rounded-md py-2 pl-4 pr-3">
              <span className="text-white text-lg font-bold">{t("technicalRider.hero.kicker")}</span>
            </div>
            <h1 className="text-white mt-6 text-5xl font-semibold leading-tight md:text-6xl">
              {t("technicalRider.hero.title")}
            </h1>
            <p className="text-gray-300 mt-4 text-lg md:text-xl">
              {t("technicalRider.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="bg-black pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DISZIPLINEN.map((d) => (
              <article key={d.key} className="rounded-2xl border border-gray-800 bg-[#0b0b0b] p-6">
                <h3 className="text-white text-2xl font-semibold mb-4">{d.name}</h3>
                <dl className="space-y-3">
                  {d.details.map((detail, idx) => (
                    <div key={idx}>
                      <dt className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                        {t(`technicalRider.labels.${detail.labelKey}`)}
                      </dt>
                      <dd className="text-gray-200 text-base">
                        {t(`technicalRider.values.${d.key}.${detail.valueKey}`)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Fragment>
  );
}