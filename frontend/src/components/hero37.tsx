import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import HeroLinks from "/images/Hero37/HeroLinks.webp";
import HeroMitte from "/images/Hero37/HeroMitte.webp";
import HeroRechts from "/images/Hero37/HeroRechts.webp";
import { Button } from "@/components/ui/button";
import React from "react";
import { useTranslation } from "react-i18next";

const Hero37 = () => {
  const { t } = useTranslation();
  return (
    <section className="overflow-hidden bg-black text-white pt-20">
      <div className="container flex flex-col items-center text-center">
        <p className="text-xs uppercase tracking-wide text-white/60">{t("hero37.kicker")}</p>
        <h1 className="my-3 text-2xl font-bold text-pretty sm:text-4xl md:my-6 lg:text-5xl">
          {t("hero37.title")}
        </h1>
        <p className="mb-6 max-w-xl text-gray-300 md:mb-12 lg:text-xl">
          {t("hero37.subtitle")}
        </p>
        <div className="flex w-full flex-col justify-center gap-2 sm:flex-row">
          <Link to="/anfragen" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <ArrowRight className="mr-2 size-4" />
              {t("hero37.cta.requestShow")}
            </Button>
          </Link>
          <Link to="/kontakt" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              {t("hero37.cta.bookConsult")}
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-16 flex flex-col items-center justify-center lg:mt-32">
        <div className="b relative mx-auto aspect-square w-[95%] max-w-[31.25rem] sm:w-full">
          <div className="absolute inset-x-1/2 top-full z-0 flex w-[120rem] -translate-x-1/2 -translate-y-[4rem] md:-translate-y-[2rem]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              viewBox="0 0 800 800"
              className="h-full w-full text-white/20"
            >
              {Array.from(Array(4000).keys()).map((dot, index, array) => {
                const angle = 0.2 * index;
                const scalar = 300 + index * (100 / array.length);
                const x = Math.round(Math.cos(angle) * scalar);
                const y = Math.round(Math.sin(angle) * scalar);
                return (
                  <circle
                    key={index}
                    r={1}
                    cx={400 + x}
                    cy={400 + y}
                    fill="currentColor"
                    opacity={(array.length - index) / array.length}
                  />
                );
              })}
            </svg>
          </div>
          <img
            src={HeroLinks}
            alt="Hero Links"
            className="absolute inset-0 z-20 m-auto flex w-4/5 max-w-[16rem] translate-x-[-75%] translate-y-[10%] scale-[0.85] rotate-[-15deg] justify-center rounded-lg border border-white/20 bg-white/10 opacity-60 md:w-[22rem] md:max-w-[22rem] md:translate-x-[-90%] md:translate-y-[-10%] md:scale-100"
            style={{ aspectRatio: "29/36", objectFit: "cover" }}
          />
          <img
            src={HeroMitte}
            alt="Hero Mitte"
            className="hidden md:block absolute inset-0 z-10 m-auto w-full max-w-[28rem] rounded-lg border border-white/20 bg-white/10"
            style={{ aspectRatio: "29/36", objectFit: "cover" }}
          />
          <img
            src={HeroMitte}
            alt="Hero Mitte"
            className="block md:hidden absolute inset-0 z-10 m-auto flex w-4/5 max-w-[16rem] justify-center rounded-lg border border-white/20 bg-white/10 md:w-[21.25rem] md:max-w-[21.25rem]"
            style={{ aspectRatio: "29/36", objectFit: "cover" }}
          />
          <img
            src={HeroRechts}
            alt="Hero Rechts"
            className="absolute inset-0 z-20 m-auto flex w-4/5 max-w-[16rem] translate-x-[75%] translate-y-[10%] scale-[0.85] rotate-[15deg] justify-center rounded-lg border border-white/20 bg-white/10 opacity-60 md:w-[22rem] md:max-w-[22rem] md:translate-x-[90%] md:translate-y-[-10%] md:scale-100"
            style={{ aspectRatio: "29/36", objectFit: "cover" }}
          />
        </div>
      </div>
    </section>
  );
};

export { Hero37 };
