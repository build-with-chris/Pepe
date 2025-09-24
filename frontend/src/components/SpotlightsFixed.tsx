import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import React from "react";
import { useTranslation } from "react-i18next";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export type Spotlight = {
  mediaType: "video" | "image";
  mediaSrc: string;
  /** Optional poster image to show before/without loading the video */
  posterSrc?: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  tags?: string[];
};

interface SpotlightsFixedProps {
  spotlights: Spotlight[];
  autoplayPlugin?: any;
}

export const SpotlightsFixed: React.FC<SpotlightsFixedProps> = ({ spotlights, autoplayPlugin }) => {
  const { t } = useTranslation();
  const prefersReduced = usePrefersReducedMotion();
  const desktopCarouselRef = React.useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [carouselApi, setCarouselApi] = React.useState<any>(null);

  function hydrateVideoSources(video: HTMLVideoElement) {
    const sources = Array.from(video.querySelectorAll('source[data-src]')) as HTMLSourceElement[];
    let updated = false;
    for (const s of sources) {
      const ds = s.getAttribute('data-src');
      if (ds && s.src !== ds) {
        s.src = ds;
        updated = true;
      }
    }
    if (updated) {
      try { video.load(); } catch {}
    }
  }

  function pauseAndUnload(video: HTMLVideoElement) {
    try { video.pause(); } catch {}
  }

  function activateSlide(container: HTMLElement, index: number) {
    const videos = Array.from(container.querySelectorAll('video')) as HTMLVideoElement[];
    if (!videos.length) return;
    videos.forEach(v => pauseAndUnload(v));
    const idx = ((index % videos.length) + videos.length) % videos.length;
    const current = videos[idx];
    if (current) {
      hydrateVideoSources(current);
      current.muted = true;
      current.play?.().catch(() => {});
    }
    const prev = videos[((idx - 1) % videos.length + videos.length) % videos.length];
    const next = videos[(idx + 1) % videos.length];
    if (prev) hydrateVideoSources(prev);
    if (next) hydrateVideoSources(next);
  }

  function posterFrom(src: string) {
    // try to replace video extension with webp poster
    return src.replace(/\.(webm|mp4)$/i, ".webp");
  }

  React.useEffect(() => {
    const container = desktopCarouselRef.current;
    if (!container) return;
    activateSlide(container, currentIndex);
  }, [currentIndex]);

  React.useEffect(() => {
    const container = desktopCarouselRef.current;
    if (!container) return;
    activateSlide(container, 0);
  }, []);

  React.useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentIndex(carouselApi.selectedScrollSnap());
    onSelect();
    carouselApi.on("select", onSelect);
    return () => {
      try { carouselApi.off("select", onSelect); } catch {}
    };
  }, [carouselApi]);

  return (
    <div className="hidden md:block">
      <div className="w-full mx-auto my-12 px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 rounded-lg overflow-hidden">
        <div className="flex gap-0 rounded-lg overflow-hidden">
          {/* Left column (55%) */}
          <div className="basis-[55%] grow flex flex-col justify-center px-8 md:px-10 py-10 bg-black/50 w-full">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white text-left">
              {t("home.findArtistTitle")}
            </h2>
            <p className="mb-8 text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg leading-relaxed text-left">
              {t("home.findArtistSubtitle")}
            </p>
            <div className="flex flex-row gap-4 items-center">
              <a href="/anfragen">
                <button className="bg-[#3c4a8f] hover:bg-[#2d366d] text-white font-semibold px-7 py-3.5 rounded-full transition-colors duration-200 cursor-pointer text-sm md:text-base">
                  {t("home.findArtistButton")}
                </button>
              </a>
            </div>
            <p className="mb-0 mt-8 text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg leading-relaxed text-left">
              {t("home.findArtistTime")}
            </p>
          </div>

          {/* Right column (45%) — fixed width instead of resizable */}
          <div className="basis-[45%] shrink-0 bg-black w-full min-h-[420px] p-2">
            <div ref={desktopCarouselRef} className="h-full min-h-[420px]">
              <Carousel
                className="h-full"
                opts={{ loop: true }}
                plugins={!prefersReduced && autoplayPlugin ? [autoplayPlugin] : []}
                setApi={setCarouselApi}
              >
                <CarouselContent className="h-full">
                  {spotlights.map((s, i) => (
                    <CarouselItem key={i} className="h-full p-3">
                      <div className="relative w-full h-full overflow-hidden rounded-xl ring-1 ring-white/12 shadow-lg">
                        {s.mediaType === "video" ? (
                          <>
                            {/* Poster first: lightweight, lazy */}
                            <img
                              src={s.posterSrc || posterFrom(s.mediaSrc)}
                              alt={s.title}
                              loading="lazy"
                              decoding="async"
                              fetchPriority="low"
                              width={1280}
                              height={720}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Only mount the video when this slide is active to avoid decoding off-screen videos */}
                            {i === currentIndex && !prefersReduced && (
                              <video
                                key={s.mediaSrc}
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="none"
                                aria-label="PepeShows Showcase Video"
                                className="absolute inset-0 w-full h-full object-cover"
                                {...({ 'webkit-playsinline': 'true' } as any)}
                              >
                                <source data-src={s.mediaSrc} type="video/webm" />
                                <source data-src={s.mediaSrc.replace(/\.webm$/i, ".mp4")} type="video/mp4" />
                              </video>
                            )}
                          </>
                        ) : (
                          <img
                            src={s.mediaSrc}
                            alt={s.title}
                            loading="lazy"
                            decoding="async"
                            fetchPriority="low"
                            width={1280}
                            height={720}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                        {/* Tags */}
                        {s.tags && (
                          <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
                            {s.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Text overlay */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          {s.kicker && (
                            <div className="text-[11px] uppercase tracking-widest opacity-80">{s.kicker}</div>
                          )}
                          <div className="text-base md:text-lg font-semibold leading-snug">{s.title}</div>
                          {s.subtitle && (
                            <div className="text-xs opacity-80 mt-0.5">{s.subtitle}</div>
                          )}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};