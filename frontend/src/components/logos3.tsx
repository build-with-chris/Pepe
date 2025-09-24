"use client";

import AutoScroll from "embla-carousel-auto-scroll";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import { useTranslation } from "react-i18next";

interface Logo {
  id: string;
  description: string;
  image: string;
  className?: string;
}

interface Logos3Props {
  heading?: string;
  logos?: Logo[];
  className?: string;
}

const Logos3 = ({
  heading = "Diese Kunden vertrauen auf Pepe",
  logos = [
    {
      id: "logo-porsche",
      description: "Porsche",
      image: "/images/Logos/Porsche.png",
      className: "h-8 w-auto",
    },
    {
      id: "logo-google",
      description: "Google",
      image: "/images/Logos/google.svg",
      className: "h-8 w-auto",
    },
    {
      id: "logo-mcdonalds",
      description: "McDonald’s",
      image: "/images/Logos/mcdonalds.svg",
      className: "h-8 w-auto",
    },
    {
      id: "logo-astrazeneca",
      description: "AstraZeneca",
      image: "/images/Logos/astrazeneca.svg",
      className: "h-8 w-auto",
    },
    {
      id: "logo-munich-mash",
      description: "Munich Mash",
      image: "/images/Logos/munich-mash.png",
      className: "h-8 w-auto",
    },
    {
      id: "logo-european-championships",
      description: "European Championships",
      image: "/images/Logos/european-championships.svg",
      className: "h-8 w-auto",
    },
    {
      id: "logo-tollwood",
      description: "Tollwood",
      image: "/images/Logos/tollwood.svg",
      className: "h-8 w-auto",
    },
  ],
}: Logos3Props) => {
  const { t } = useTranslation();
  const marqueeLogos = [...logos, ...logos, ...logos];
  return (
    <section className="bg-black text-white lg:pt-10 pb-20 mb-10 overflow-hidden">
      <div className="mx-auto w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-5xl px-4">
        <div className="w-full flex justify-center">
          <h1 className="my-6 text-xl sm:text-2xl lg:text-4xl font-bold text-center text-white">
            {t("logos3.heading")}
          </h1>
        </div>
        <div className="pt-8 md:pt-12 lg:pt-16">
          <div className="relative mx-auto flex items-center justify-center w-full max-w-none">
            <Carousel
              opts={{ loop: true, align: "start", containScroll: "keepSnaps" }}
              plugins={[
                AutoScroll({
                  playOnInit: true,
                  stopOnInteraction: false,
                  stopOnMouseEnter: false,
                  stopOnFocusIn: false,
                  speed: 1.2,
                }),
              ]}
            >
              <CarouselContent className="ml-0">
                {marqueeLogos.map((logo, i) => (
                  <CarouselItem
                    key={`${logo.id}-${i}`}
                    className="flex basis-1/3 justify-center pl-0 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                  >
                    <div className="mx-6 md:mx-8 lg:mx-10 flex shrink-0 items-center justify-center">
                      <div>
                        <img
                          src={logo.image}
                          alt={logo.description}
                          className={(logo.className ? logo.className + " " : "") + "max-h-8 sm:max-h-10 md:max-h-12 w-auto"}
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Logos3 };
