"use client";

import Autoplay from "embla-carousel-autoplay";
import { AnimatePresence, motion } from "framer-motion";
import React, { useMemo } from "react";
import { useCallback } from "react";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import { useTranslation } from "react-i18next";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const Hero228 = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const isMobile = useIsMobile();

  const { t } = useTranslation();

  const mobileHeading = React.useMemo(() => {
    const fallback = `${t('hero228.headingDesktopLine1', { defaultValue: '' })} ${t('hero228.headingDesktopLine2', { defaultValue: '' })}`.trim() || 'Unsere Künstler';
    return t('hero228.headingMobile', { defaultValue: fallback });
  }, [t]);

  const baseTestimonials = [
    { id: 1, image: "/images/Hero228/Artist1.webp", name: "Artist 1" },
    { id: 2, image: "/images/Hero228/Artist2.webp", name: "Artist 2" },
    { id: 3, image: "/images/Hero228/Artist3.webp", name: "Artist 3" },
    { id: 4, image: "/images/Hero228/Artist4.webp", name: "Artist 4" },
    { id: 5, image: "/images/Hero228/Artist5.webp", name: "Artist 5" },
    { id: 6, image: "/images/Hero228/Artist6.webp", name: "Artist 6" },
    { id: 7, image: "/images/Hero228/Artist7.webp", name: "Artist 7" },
    { id: 8, image: "/images/Hero228/Artist8.webp", name: "Artist 8" },
    { id: 9, image: "/images/Hero228/Artist9.webp", name: "Artist 9" },
    { id: 10, image: "/images/Hero228/Artist10.webp", name: "Artist 10" },
    { id: 11, image: "/images/Hero228/Artist11.webp", name: "Artist 11" },
  ];

  const testimonials = React.useMemo(() => shuffleArray(baseTestimonials), []);

  const getRotation = useCallback(
    (index: number) => {
      if (index === current)
        return "md:-rotate-45 md:translate-x-40 md:scale-75 md:relative";
      if (index === current + 1) return "md:rotate-0 md:z-10 md:relative";
      if (index === current + 2)
        return "md:rotate-45 md:-translate-x-40 md:scale-75 md:relative";
    },
    [current],
  );

  const scrollbarBars = useMemo(
    () =>
      [...Array(40)].map((_, item) => (
        <motion.div
          key={item}
          initial={{
            opacity: item % 5 === 0 ? 0.2 : 0.2,
            filter: "blur(1px)",
          }}
          animate={{
            opacity: item % 5 === 0 ? 1 : 0.2,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.2,
            delay: item % 5 === 0 ? (item / 5) * 0.05 : 0,
            ease: "easeOut",
          }}
          className={cn(
            "w-[1px] bg-white",
            item % 5 === 0 ? "h-[15px]" : "h-[10px]",
          )}
        />
      )),
    [],
  );

  return (
    <section className="bg-black pt-24 sm:pt-32 pb-24 sm:pb-32 text-white">
      <div className="container flex flex-col items-center justify-center gap-4 text-center">
        <h1 className="relative z-10 mb-8 max-w-3xl text-5xl font-medium tracking-tighter text-white md:px-9 md:text-6xl leading-tight">
          <span className="block text-3xl sm:hidden mt-2">{mobileHeading}</span>
          <span className="hidden sm:block text-4xl md:text-5xl">{t("hero228.headingDesktopLine1")}<br />{t("hero228.headingDesktopLine2")}</span>
        </h1>
        <p className="mt-5 max-w-xl text-white/70 hidden sm:block">
        {t("hero228.subtitle")}
        </p>

        <Carousel
          className="max-w-5xl block relative z-0 mt-4"
          plugins={[
            Autoplay({
              delay: 2000,
              stopOnInteraction: true,
            }),
          ]}
          setApi={setApi}
        >
          <CarouselContent>
            {Array.from({
              length: isMobile ? testimonials.length : testimonials.length + 2,
            }).map((_, index) => (
              <CarouselItem key={index} className="my-10 md:basis-1/3">
                <div
                  className={`w-full aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-lg transition-transform duration-500 ease-in-out ${getRotation(index)}`}
                >
                  <img
                    src={
                      index == testimonials.length
                        ? testimonials[0].image
                        : index == testimonials.length + 1
                          ? testimonials[1].image
                          : index == testimonials.length + 2
                            ? testimonials[2].image
                            : testimonials[index].image
                    }
                    className="h-full w-full object-cover"
                    alt=""
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute right-0 bottom-0 flex w-full translate-y-full flex-col items-center justify-center gap-2">
     
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export { Hero228 };
