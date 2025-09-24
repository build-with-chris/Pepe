import React, { useState } from "react";
import AboutImage1 from "/images/About1/About1.1.webp";
import AboutImage2 from "/images/About1/About1.2.webp";
import { useTranslation } from "react-i18next";
import { useLazyVideo } from "@/hooks/useLazyVideo";
import { Flashlight } from "lucide-react";

const About1 = () => {
  const { t } = useTranslation();
  const videoRef = useLazyVideo();
  const videoRefSpot = useLazyVideo();
  const [spotPos, setSpotPos] = useState<{ x: string; y: string }>({ x: "50%", y: "50%" });
  const [isHovering, setIsHovering] = useState(false);
  return (
    <section className="py-32 bg-black text-white">
      <div className="container flex flex-col gap-28 px-4 sm:px-6 lg:px-0">
        <div className="flex flex-col gap-7">
          <h1 className="text-4xl font-semibold lg:text-5xl [text-wrap:balance]">
            {t("about1.hero.title")}
          </h1>
          <p className="max-w-2xl text-lg text-white/70">
            {t("about1.hero.subtitle")}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
      
          <img
            src={AboutImage1}
            alt="PepeShows Performance"
            className="size-full max-h-96 rounded-2xl object-cover"
          />
          <div className="flex flex-col justify-between gap-10 rounded-2xl bg-white/5 backdrop-blur-sm p-10">
            <p className="text-sm text-white/60 tracking-wide">{t("about1.mission.kicker")}</p>
            <p className="text-lg font-medium text-white/90">
              {t("about1.mission.body")}
            </p>
          </div>
        </div>
        {/* Spotlight Video Section */}
        <div className="grid gap-6 md:grid-cols-2 items-stretch">
          {/* Left text */}
          <div className="flex flex-col justify-center rounded-2xl bg-white/5 backdrop-blur-sm p-8">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">{t("about1.spotlight.title")}</h2>
            <p className="text-white/80 leading-relaxed">
              {t("about1.spotlight.body")}
            </p>
          </div>

          {/* Right video with spotlight effect */}
          <div
            className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-black"
            onMouseEnter={() => setIsHovering(true)}
            onMouseMove={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              setSpotPos({ x: `${x.toFixed(2)}%`, y: `${y.toFixed(2)}%` });
            }}
            onMouseLeave={() => { setIsHovering(false); setSpotPos({ x: "50%", y: "50%" }); }}
          >
            <video
              ref={videoRefSpot}
              preload="metadata"
              {...({ 'webkit-playsinline': 'true' } as any)}
              muted
              autoPlay
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/videos/bentoVideoMobile.mp4" type="video/mp4" />
            </video>
            {/* Spotlight overlay: dark layer with a transparent circle following the mouse */}
            <div
              className="pointer-events-none absolute inset-0 transition-all duration-200"
              style={
                isHovering
                  ? {
                      // Large spotlight radius, softer inner falloff, strong dark outside
                      background: `radial-gradient(circle 320px at ${spotPos.x} ${spotPos.y}, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.88) 100%)`,
                    }
                  : {
                      // Very dark when not hovering
                      background: 'rgba(0,0,0,0.88)'
                    }
              }
            />
            {/* Flashlight icon in the center that pulses (yellow, only when not hovering) */}
            {!isHovering && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <Flashlight className="w-12 h-12 text-yellow-400 opacity-80 animate-pulse" />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-6 md:gap-20">
          </div>
   
     

        


        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="mb-10 text-sm font-medium text-white/60 tracking-wide">
              {t("about1.next.kicker")}
            </p>
            <h2 className="mb-2.5 text-3xl font-semibold">
              {t("about1.next.title")}
            </h2>
            <div className="flex justify-center md:mt-10 md:-ml-20">
              <video
                ref={videoRef}
                preload="metadata"
                {...({ 'webkit-playsinline': 'true' } as any)}
                muted
                autoPlay
                loop
                playsInline
                className="w-full max-w-2xl h-64 md:h-80 lg:h-96 object-cover rounded-2xl"
              >
                <source src="/videos/Short Trailer.webm" type="video/webm" />
                <source src="/videos/Short Trailer.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
          <div className="md:mt-35">
     
            <p className="text-white/70 mb-4">
              {t("about1.next.body")}
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/anfragen" className="inline-flex items-center px-4 py-2 rounded-md bg-white text-black hover:bg-gray-200">{t("about1.next.cta.assistant")}</a>
              <a href="/kontakt" className="inline-flex items-center px-4 py-2 rounded-md border border-white/30 text-white hover:bg-white/10">{t("about1.next.cta.consult")}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { About1 };
