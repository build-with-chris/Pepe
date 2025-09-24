import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

const Hero87 = () => {
  const { t } = useTranslation();
  return (
    <section className="py-32 bg-black text-white">
      <div className="container">
        <h1 className="text-5xl lg:text-7xl text-white">
          {t("hero87.heading")}
        </h1>
        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-lg text-white/70 lg:text-xl">
              {t("hero87.body")}
            </p>
            <Button size="lg" className="mt-12 bg-white text-black hover:bg-gray-200">
              {t("hero87.cta")}
              <ArrowRight className="ml-2 h-auto w-4" />
            </Button>
          </div>
          <div className="relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 -top-1 -z-10 mx-auto h-full w-full max-w-3xl bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_100%_at_50%_50%,#000_60%,transparent_100%)] bg-[size:56px_56px] opacity-10"></div>
            <img
              src="/images/CircusSchool.webp"
              alt={t("hero87.imgAlt")}
              className="max-h-[400px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero87 };
