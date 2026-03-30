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

  const getRotation = useCallback(
    (index: number) => {
      const total = images.length;
      // Calculate relative position with wrapping for loop mode
      const diff = ((index - current) % total + total) % total;

      if (diff === 0)
        return "md:-rotate-45 md:translate-x-40 md:scale-75 md:relative";
      if (diff === 1) return "md:rotate-0 md:z-10 md:relative";
      if (diff === 2)
        return "md:rotate-45 md:-translate-x-40 md:scale-75 md:relative";
      return "";
    },
    [current, images.length],
  );

  const scrollbarBars = useMemo(
    () =>
      [...Array(40)].map((_, item) => (
        <motion.div
          key={item}
          initial={{
            opacity: 0.2,
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
      opts={{
        loop: true,
        slidesToScroll: 1,
        align: "center",
      }}
      plugins={[
        Autoplay({
          delay: 2000,
          stopOnInteraction: true,
        }),
      ]}
      setApi={setApi}
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index} className="my-10 md:basis-1/3">
            <div
              className={`h-105 w-full transition-transform duration-500 ease-in-out ${getRotation(index)}`}
            >
              <img
                src={image.src}
                className="h-full w-full object-cover rounded-lg"
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
