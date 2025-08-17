"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import { ChevronRight, Star, Zap } from "lucide-react";
import { useRef } from "react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const testimonials = [
  {
    name: "Laura König",
    role: "Eventmanagerin, Automobilbranche",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
    content:
      "Reibungslose Abstimmung, pünktlicher Aufbau und eine Show, die genau zu unserem Markenauftritt gepasst hat. Unser Team spricht heute noch darüber.",
  },
  {
    name: "Daniel Weber",
    role: "Leitung Unternehmenskommunikation",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
    content:
      "Von der ersten Beratung bis zum letzten Cue: sehr professionell. Die Kombination aus Luftartistik und Moderation hat unser Gala-Programm perfekt getragen.",
  },
  {
    name: "Maja Richter",
    role: "Projektleitung Festival",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
    content:
      "Flexibel, zuverlässig und publikumsnah. Besonders die Walking Acts haben das Gelände lebendig gemacht – super Stimmung!",
  },
  {
    name: "Jonas Pfister",
    role: "Agenturinhaber",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
    content:
      "Klarer Prozess, faire Konditionen und starke Künstler:innen. Wir buchen wieder – die Resonanz unserer Kund:innen war durchweg positiv.",
  },
  {
    name: "Sophie Brandt",
    role: "HR & Internal Events",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp",
    content:
      "Sommerfest mit Wow-Effekt. Die Showlänge wurde perfekt an unsere Agenda angepasst – null Stress für uns, maximaler Effekt fürs Team.",
  },
  {
    name: "Marco Hoffmann",
    role: "Hotel- & Veranstaltungsleitung",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-6.webp",
    content:
      "Professionelles Rigging, saubere Abläufe und ein sehr angenehmes Team. Genau so stellt man sich eine Zusammenarbeit vor.",
  },
];

const Testimonial19 = () => {
  const plugin = useRef(
    AutoScroll({
      startDelay: 500,
      speed: 0.7,
    }),
  );

  return (
    <section className="mb-12 bg-black text-white py-16">
      <div className="container flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
          <Zap className="h-5 w-auto" /> Stimmen unserer Kund:innen
        </div>
        <h2 className="text-center text-3xl font-semibold lg:text-4xl">Das sagen unsere Auftraggeber</h2>
        <p className="text-center text-gray-300 lg:text-lg">
          Auszüge aus echtem Feedback nach Firmenfeiern, Galas und Festivals.
        </p>
        <a href="/kontakt" className="flex items-center gap-1 font-semibold text-white hover:underline">
          Mehr Referenzen anfragen
          <ChevronRight className="mt-0.5 h-4 w-auto" />
        </a>
      </div>
      <div className="lg:container">
        <div className="mt-16 space-y-4">
          <Carousel
            opts={{
              loop: true,
            }}
            plugins={[plugin.current]}
            onMouseLeave={() => plugin.current.play()}
            className="relative before:absolute before:top-0 before:bottom-0 before:left-0 before:z-10 before:w-36 before:bg-gradient-to-r before:from-black before:to-transparent after:absolute after:top-0 after:right-0 after:bottom-0 after:z-10 after:w-36 after:bg-gradient-to-l after:from-black after:to-transparent"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="basis-auto">
                  <Card className="max-w-96 p-6 select-none bg-white/5 border-white/10 text-white">
                    <div className="flex justify-between">
                      <div className="mb-4 flex gap-4">
                        <Avatar className="size-14 rounded-full ring-1 ring-input">
                          <AvatarImage
                            src={testimonial.avatar}
                            alt={testimonial.name}
                          />
                        </Avatar>
                        <div>
                          <p className="font-medium">{testimonial.name}</p>
                          <p className="text-sm text-white/60">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Star className="size-5 fill-amber-500 text-amber-500" />
                        <Star className="size-5 fill-amber-500 text-amber-500" />
                        <Star className="size-5 fill-amber-500 text-amber-500" />
                        <Star className="size-5 fill-amber-500 text-amber-500" />
                        <Star className="size-5 fill-amber-500 text-amber-500" />
                      </div>
                    </div>
                    <q className="leading-7 text-gray-300">
                      {testimonial.content}
                    </q>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export { Testimonial19 };
