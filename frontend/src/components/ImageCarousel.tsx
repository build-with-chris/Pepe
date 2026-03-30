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
import { useIsMobile } from "@/hooks/use-mobile";
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

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const isMobile = useIsMobile();

  // Exactly matches hero228: current = left (-45°), current+1 = center (0°, featured), current+2 = right (45°)
  const getRotation = useCallback(
    (index: number) => {
      if (index === current)
        return "md:-rotate-45 md:translate-x-40 md:scale-75 md:z-0 md:relative";
      if (index === current + 1) return "md:rotate-0 md:z-20 md:relative";
      if (index === current + 2)
        return "md:rotate-45 md:-translate-x-40 md:scale-75 md:z-0 md:relative";
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
    <Carousel
      className={cn("max-w-5xl", className)}
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
          length: isMobile ? images.length : images.length + 2,
        }).map((_, index) => (
          <CarouselItem key={index} className="my-10 md:basis-1/3">
            <div
              className={`h-105 w-full transition-transform duration-500 ease-in-out ${getRotation(index)}`}
            >
              <img
                src={
                  index >= images.length
                    ? images[index - images.length].src
                    : images[index].src
                }
                className="h-full w-full object-cover rounded-lg"
                alt={
                  index >= images.length
                    ? images[index - images.length]?.alt ?? ""
                    : images[index]?.alt ?? ""
                }
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
            {images[current % images.length]?.alt}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-2">{scrollbarBars}</div>
      </div>
    </Carousel>
  );
};

export default ImageCarousel;
