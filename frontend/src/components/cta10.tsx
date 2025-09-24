import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface Cta10Props {
  heading?: string;
  description?: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
  rightAddon?: React.ReactNode; // optional Zusatz-Element rechts neben dem Primary-Button (z. B. Lottie)
}
const Cta10 = ({
  heading,
  description,
  rightAddon,
}: Cta10Props) => {
  const { t } = useTranslation();
  return (
    <section className="bg-black text-white pt-12 md:py-16 px-6 md:px-12 lg:pt-20 cv-auto">
      <div className="w-full ">
        <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-16 overflow-hidden rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm p-8 lg:p-12 hover:bg-white/10 transition">
          <div className="flex-1">
            <h3 className="mb-3 text-2xl font-semibold text-white md:mb-4 md:text-4xl ">
              {heading ?? t("contactCta.heading")}
            </h3>
            <p className="w-full text-white/70 lg:text-xl leading-relaxed whitespace-pre-line">
              {description ?? t("contactCta.description")}
            </p>
          </div>
          {rightAddon && (
            <div className="flex items-center justify-center lg:justify-start">
              <div className="w-16 h-16 lg:w-20 lg:h-20">
                {rightAddon}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export { Cta10 };
