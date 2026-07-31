"use client";

import Autoplay from "embla-carousel-autoplay";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useMemo } from "react";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface CarouselImage {
  src: string;
  alt: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, className = "" }) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    // Auch beim Aufbau einmal setzen. `select` feuert erst beim Wechsel, davor
    // stand `current` auf 0, ohne dass das mit dem tatsächlich gewählten Bild
    // etwas zu tun haben musste.
    const sync = () => setCurrent(api.selectedScrollSnap());
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  const count = images.length;

  /**
   * Abstand eines Bildes zur Mitte, über den Rand hinweg gezählt: 0 ist die
   * Mitte, -1 links davon, +1 rechts davon.
   *
   * Vorher rechnete die Komponente mit `current`, `current + 1` und
   * `current + 2` und nahm damit an, `selectedScrollSnap()` liefere das linke
   * der drei sichtbaren Bilder. Das tut es nicht, und das Fächern kippte um:
   * Das mittlere Bild stand schräg, die äusseren flach. Mit `align: 'center'`
   * ist der gewählte Slide der mittlere, und die Rechnung geht über den
   * Rundenwechsel hinweg auf, statt am Ende der Liste ins Leere zu greifen.
   */
  const offsetFromCenter = useCallback(
    (index: number) => {
      const raw = (index - current + count) % count;
      return raw > count / 2 ? raw - count : raw;
    },
    [current, count],
  );

  const getRotation = useCallback(
    (index: number) => {
      switch (offsetFromCenter(index)) {
        case 0:
          // Das gewählte Bild: gerade, vorn, in voller Grösse.
          return "md:rotate-0 md:scale-100 md:z-20";
        case -1:
          return "md:-rotate-45 md:translate-x-40 md:scale-75 md:z-0";
        case 1:
          return "md:rotate-45 md:-translate-x-40 md:scale-75 md:z-0";
        default:
          return "";
      }
    },
    [offsetFromCenter],
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
    <Carousel
      className={cn("max-w-5xl", className)}
      plugins={[
        Autoplay({
          delay: 2000,
          stopOnInteraction: true,
        }),
      ]}
      setApi={setApi}
      // `align: 'center'` ist die Voraussetzung für die Rechnung oben: Erst
      // damit ist der gewählte Slide auch der mittlere der drei sichtbaren.
      opts={{ loop: true, align: "center" }}
      aria-label="Bildergalerie"
      aria-roledescription="Karussell"
    >
      <CarouselContent>
        {/* Vorher liefen hier `images.length + 2` Durchgänge, um die Reihe zu
            füllen. Das brauchte es nie: Bei `loop` klont Embla die Bilder
            selbst. Der Zusatz sorgte nur dafür, dass links und rechts dasselbe
            Bild stand. */}
        {images.map((image, index) => (
          <CarouselItem key={index} className="my-10 md:basis-1/3">
            <div
              className={cn(
                "relative h-105 w-full transition-transform duration-500 ease-in-out",
                getRotation(index),
              )}
            >
              <img
                src={image.src}
                className="h-full w-full rounded-lg object-cover"
                alt={image.alt}
                loading="lazy"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="absolute right-0 bottom-0 flex w-full translate-y-full flex-col items-center justify-center gap-2">
        <div className="flex gap-2">{scrollbarBars}</div>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={current}
            className="w-full text-lg font-medium text-white text-center"
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, scale: 0.9, filter: "blur(5px)" }}
            transition={{ duration: 0.5 }}
          >
            {images[current]?.alt}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-2">{scrollbarBars}</div>
      </div>
    </Carousel>
  );
};

export default ImageCarousel;
