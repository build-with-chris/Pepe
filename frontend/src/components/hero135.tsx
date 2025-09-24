"use client";
import { Play } from "lucide-react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Hero135 = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Fragment>
      <section className="bg-black pb-12 font-sans px-4 sm:px-6 md:px-0 md:py-10 md:mb-12">
        <div className="container">
          <div className="flex flex-col justify-center gap-8 lg:flex-row lg:items-center">
            <div className="flex flex-1 flex-col gap-10">
              <h1 className="text-white max-w-96 text-2xl font-medium lg:text-3xl">
                {t("hero135.heading")}
              </h1>
              <p className="text-gray-300 max-w-96 text-lg leading-normal lg:text-xl">
                {t("hero135.subtitle")}
              </p>
            </div>
            <div className="flex-1">
              <div className="relative w-full overflow-hidden rounded-3xl group">
                <AspectRatio ratio={1}>
                  <div className="size-full">
                    <video
                      preload="metadata"
                      playsInline
                      {...({ 'webkit-playsinline': 'true' } as any)}
                      muted
                      autoPlay
                      loop
                      className="size-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    >
                      <source src="/videos/Vorschauloop.webm" type="video/webm" />
                      <source src="/videos/Vorschauloop.mp4" type="video/mp4" />
                    </video>
             
                    {/* Full overlay center play button */}
                    <button
                      onClick={() => setIsVideoOpen(true)}
                      aria-label={t("hero135.play.title") + " – " + t("hero135.play.brand")}
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 focus:outline-none"
                    >
                      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-xl shadow-red-500/50 transition-transform group-hover:scale-110">
                        <Play className="h-8 w-8 fill-black stroke-black" />
                      </span>
                      <span className="rounded-full bg-black/40 px-3 py-1 text-sm text-white md:text-base">
                        {t("hero135.play.title")}
                      </span>
                    </button>
                  </div>
                </AspectRatio>
                <p className="mt-3 text-center text-sm text-gray-400 md:text-base">
                  Vorschau – Vollversion auf YouTube
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{t("hero135.dialog.title")}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/dXHLaIkezTM"
              title={t("hero135.dialog.title")}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export { Hero135 };