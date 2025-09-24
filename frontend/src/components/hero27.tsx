import { Button } from "@/components/ui/button";
import { useTranslation, Trans } from "react-i18next";

const Hero27 = () => {
  const { t } = useTranslation();

  return (
    <section className="relative -mt-3 md:-mt-6 overflow-hidden bg-black text-white py-20">
      {/* Top fade into previous section */}
      <div className="pointer-events-none absolute -top-16 inset-x-0 h-20 bg-gradient-to-t from-black/0 to-black/70" />

      {/* Subtle color accents that gently overlap upwards */}
      <div className="pointer-events-none absolute -top-10 right-1/4 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-6 left-1/5 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
      <div className="container mx-auto w-full md:w-4/5 px-4">
        <div className="mx-auto flex flex-col items-center text-center gap-6">
          <h1 className="text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight tracking-tight [text-wrap:balance]">
            <Trans i18nKey="hero27.title">
              Wir bringen <span className="font-bold text-white/90">außergewöhnliche Künstler</span> und <span className="font-bold text-white/90">unvergessliche Showmomente</span> auf Ihre Bühne.
            </Trans>
          </h1>
          <p className="mb-8 text-muted-foreground md:text-base lg:max-w-xl lg:text-lg leading-relaxed">
            {t("hero27.subtitle")}
          </p>
          {/* USP Inline Meta (lightweight, not buttons) */}
          <ul className="-mt-2 mb-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs md:text-sm leading-relaxed text-white/60">
            <li className="before:content-[''] first:before:hidden">{t("hero27.usp.custom")}</li>
            <li className="before:content-['·'] before:mx-2 before:text-white/40">{t("hero27.usp.experience")}</li>
            <li className="before:content-['·'] before:mx-2 before:text-white/40">{t("hero27.usp.europe")}</li>
            <li className="before:content-['·'] before:mx-2 before:text-white/40">{t("hero27.usp.fair")}</li>
          </ul>
          {/* CTAs */}
          <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="/mediamaterial" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-white/80 text-black hover:bg-gray-200 cursor-pointer">{t("hero27.cta.media")}</Button>
            </a>
            <a href="/shows&formate" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-white/80 text-black hover:bg-gray-200 cursor-pointer">{t("hero27.cta.shows")}</Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero27 };
