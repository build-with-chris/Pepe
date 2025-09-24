"use client";

import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from "@/components/ui/carousel";


const Gallery14 = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const { t } = useTranslation();

  const carouselItems = [
    {
      image: "/images/Galery14/Luft.webp",
      title: t("gallery14.items.1.title"),
      description: t("gallery14.items.1.description"),
    },
    {
      image: "/images/Galery14/Feuershow.webp",
      title: t("gallery14.items.2.title"),
      description: t("gallery14.items.2.description"),
    },
    {
      image: "/images/Galery14/Jonglage.webp",
      title: t("gallery14.items.3.title"),
      description: t("gallery14.items.3.description"),
    },
    {
      image: "/images/Galery14/CustomActs.webp",
      title: t("gallery14.items.4.title"),
      description: t("gallery14.items.4.description"),
    },
    {
      image: "/images/Galery14/Firmenevent.webp",
      title: t("gallery14.items.5.title"),
      description: t("gallery14.items.5.description"),
    },
  ];

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <section className="overflow-hidden bg-black text-white py-32 px-4 sm:px-6 md:px-0">
        <Carousel setApi={setApi} opts={{ loop: true }}>
          <div className="grid gap-8 md:gap-4 lg:grid-cols-2 [&>div[data-slot=carousel-content]]:overflow-visible [&>div[data-slot=carousel-content]]:[clip-path:inset(-100vw_-100vw_-100vw_0)]">
            <div>
              <h2 className="text-4xl font-semibold md:text-6xl text-white">
                {t("gallery14.heading")}
              </h2>
              <div className="mt-6 space-y-6">
                <p className="text-xl text-gray-300">
                  {t("gallery14.subheading")}
                </p>
                <ul className="grid gap-2 text-gray-200 list-disc pl-5">
                  <li>
                    <span className="font-medium">{t("gallery14.bullets.b1.title")}</span> {t("gallery14.bullets.b1.text")}
                  </li>
                  <li>
                    <span className="font-medium">{t("gallery14.bullets.b2.title")}</span> {t("gallery14.bullets.b2.text")}
                  </li>
                  <li>
                    <span className="font-medium">{t("gallery14.bullets.b3.title")}</span> {t("gallery14.bullets.b3.text")}
                  </li>
                </ul>
                <p className="text-sm text-white/70">{t("gallery14.tagline")}</p>
              </div>
              <div className="mt-18 hidden md:flex justify-center">
                <CarouselNext className="static size-12 text-black border-white" />
              </div>
            </div>

            <CarouselContent className="max-w-[400px] select-none">
              {carouselItems.map((item, idx) => (
                <CarouselItem className="w-fit" key={idx}>
                  <div className="relative aspect-4/5 max-h-[500px] rounded-2xl">
                    <div className="absolute inset-0 rounded-2xl bg-linear-to-b from-primary to-transparent to-40%" />
                    <img
                      src={item.image}
                      alt={item.title}
                      className="size-full rounded-2xl bg-cover"
                    />
                    <div className="absolute inset-0 p-8">
                      <p className="text-sm font-semibold text-white/70">
                        <span className="mr-1 text-white">
                          {item.title}.
                        </span>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        </Carousel>
        <div className="mt-8 flex items-center lg:ml-[50%]">
          {Array.from({ length: carouselItems.length }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "flex h-8 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white/40 text-xs font-semibold whitespace-nowrap transition-all duration-300",
                index + 1 === current ? "w-32" : "m-4 size-4",
              )}
              onClick={() => api && api.scrollTo(index)}
            >
              <span
                className={cn(
                  "inline-block transition-all duration-300",
                  index + 1 === current
                    ? "translate-x-0 opacity-100"
                    : "translate-x-6 opacity-0",
                )}
              >
                {carouselItems[index].title}
              </span>
            </span>
          ))}
        </div>
    </section>
  );
};

export { Gallery14 };
