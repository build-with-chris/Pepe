import hero from "../assets/PepeHero.webp"
import pepeMobile from "../assets/PEPE.webp";
import { useEffect, useState, useMemo, Suspense, lazy, useRef } from "react";
import { useTranslation } from "react-i18next";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

const Bento1 = lazy(() => import("@/components/bento1").then(m => ({ default: m.Bento1 })));
const Cta10 = lazy(() => import("@/components/cta10").then(m => ({ default: m.Cta10 })));
const Gallery23 = lazy(() => import("@/components/gallery23").then(m => ({ default: m.Gallery23 })));
const PepesParticles = lazy(() => import("@/components/InteractivePepeParticles"));
const SpotlightsFixed = lazy(() => import("@/components/SpotlightsFixed").then(m => ({ default: m.SpotlightsFixed })));
const ConsentBannerLite = lazy(() => import('@/components/ConsentBannerLite'));


function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}



export default function Home() {
  const { t } = useTranslation();
  const prefersReduced = usePrefersReducedMotion();

  const [offset, setOffset] = useState(0);
  const startOffset = -90; // start lower on the page
  const [autoplayPlugin, setAutoplayPlugin] = useState<any>(null);
  const [mobileSlide, setMobileSlide] = useState(0);
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const desktopSpotlightsRef = useRef<HTMLDivElement | null>(null);
  const [spotlightsVisible, setSpotlightsVisible] = useState(false);
  // Sentinels for lazy-mounting below-the-fold sections
  const bentoRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [bentoVisible, setBentoVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  useEffect(() => {
    if (!isDesktop) return;
    const el = desktopSpotlightsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some(e => e.isIntersecting)) {
          setSpotlightsVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isDesktop]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const opts: IntersectionObserverInit = { rootMargin: '1000px 0px' };

    const observers: IntersectionObserver[] = [];

    if (bentoRef.current && !bentoVisible) {
      const ob = new IntersectionObserver((entries, io) => {
        if (entries.some(e => e.isIntersecting)) {
          setBentoVisible(true);
          io.disconnect();
        }
      }, opts);
      ob.observe(bentoRef.current);
      observers.push(ob);
    }

    if (ctaRef.current && !ctaVisible) {
      const ob = new IntersectionObserver((entries, io) => {
        if (entries.some(e => e.isIntersecting)) {
          setCtaVisible(true);
          io.disconnect();
        }
      }, opts);
      ob.observe(ctaRef.current);
      observers.push(ob);
    }

    if (galleryRef.current && !galleryVisible) {
      const ob = new IntersectionObserver((entries, io) => {
        if (entries.some(e => e.isIntersecting)) {
          setGalleryVisible(true);
          io.disconnect();
        }
      }, opts);
      ob.observe(galleryRef.current);
      observers.push(ob);
    }

    return () => observers.forEach(o => o.disconnect());
  }, [bentoVisible, ctaVisible, galleryVisible]);

  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', apply) : mq.removeListener(apply);
    };
  }, []);

  const [showParticles, setShowParticles] = useState(false);
  useEffect(() => {
  if (!isDesktop || prefersReduced) return;
  const win: any = typeof window !== 'undefined' ? window : undefined;
  const id = win && 'requestIdleCallback' in win
    ? win.requestIdleCallback(() => setShowParticles(true))
    : setTimeout(() => setShowParticles(true), 1200);
  return () => {
    if (typeof id === 'number') clearTimeout(id);
    else if (win && 'cancelIdleCallback' in win) win.cancelIdleCallback(id);
  };
}, [isDesktop, prefersReduced]);

  const [showConsent, setShowConsent] = useState(false);
  useEffect(() => {
    const win: any = typeof window !== 'undefined' ? window : undefined;
    const id = win && 'requestIdleCallback' in win
      ? win.requestIdleCallback(() => setShowConsent(true))
      : setTimeout(() => setShowConsent(true), 1000);
    return () => {
      if (typeof id === 'number') clearTimeout(id);
      else if (win && 'cancelIdleCallback' in win) win.cancelIdleCallback(id);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    let cancelled = false;
    const load = async () => {
      try {
        const mod = await import('embla-carousel-autoplay');
        if (!cancelled) {
          const plugin = mod.default({ delay: 3200, stopOnInteraction: false });
          setAutoplayPlugin(plugin);
        }
      } catch {}
    };
    if (mq.matches) load();
    const onChange = (e: MediaQueryListEvent) => { if (e.matches && !autoplayPlugin) load(); };
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
    return () => {
      cancelled = true;
      mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
  if (prefersReduced) return;
  const interval = setInterval(() => {
    setMobileSlide(prev => (prev + 1) % 3);
  }, 4000);
  return () => clearInterval(interval);
}, [prefersReduced]);

  useEffect(() => {
    if (mobileCarouselRef.current) {
      const el = mobileCarouselRef.current;
      const child = el.children[mobileSlide] as HTMLElement;
      if (child) {
        el.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
      }
    }
  }, [mobileSlide]);

  const spotlights = [
    {
      posterSrc: "/images/posters/Pantomime-1024.webp",
      mediaType: "video" as const,
      mediaSrc: "/videos/Short%20Clips/Pantomime.webm",
      kicker: "Walking Act / Pantomime",
      title: "Stille, die spricht.",
      subtitle: "Interaktive Figuren, die Gäste zum Staunen bringen.",
      tags: ["Live", "Mobil", "Publikumsnähe"],
    },
    {
      posterSrc: "/images/posters/Pantomime 2-1024.webp",
      mediaType: "video" as const,
      mediaSrc: "/videos/Short%20Clips/Pantomime%202.webm",
      kicker: "Walking Act / Pantomime",
      title: "Gesten statt Worte.",
      subtitle: "Humorvoll, charmant und immer im Moment.",
      tags: ["Interaktiv", "< 10 Sek.", "Welcome"],
    },
    {
      posterSrc: "/images/posters/Cyr 5-1024.webp",
      mediaType: "video" as const,
      mediaSrc: "/videos/Short%20Clips/Cyr%205.webm",
      kicker: "Cyr-Wheel",
      title: "360° Eleganz.",
      subtitle: "Dynamik und Präzision im rollenden Kreis.",
      tags: ["Bühne", "Dynamisch", "Wow"],
    },
    {
      posterSrc: "/images/posters/LED CYR Blackbox-1024.webp",
      mediaType: "video" as const,
      mediaSrc: "/videos/Short%20Clips/LED%20CYR%20Blackbox.webm",
      kicker: "Cyr-Wheel (LED)",
      title: "Licht im perfekten Kreis.",
      subtitle: "LED-Inszenierung für dunkle Bühnen.",
      tags: ["LED", "Dark Stage", "Effekt"],
    },
    {
      posterSrc: "/images/posters/Chienise Pole-1024.webp",
      mediaType: "video" as const,
      mediaSrc: "/videos/Short%20Clips/Chienise%20Pole.webm",
      kicker: "Chinese Pole",
      title: "Kraft trifft Höhe.",
      subtitle: "Akrobatik am Pfahl mit Wow-Effekt.",
      tags: ["Kraft", "Vertikal", "Akrobatik"],
    },
    {
      posterSrc: "/images/posters/Contortion-1024.webp",
      mediaType: "video" as const,
      mediaSrc: "/videos/Short%20Clips/Contortion.webm",
      kicker: "Contortion",
      title: "Grenzenlose Beweglichkeit.",
      subtitle: "Akrobatik, die die Schwerkraft aushebelt.",
      tags: ["Flexibility", "Artistry"],
    },
    {
      posterSrc: "/images/posters/Handstand-1024.webp",
      mediaType: "video" as const,
      mediaSrc: "/videos/Short%20Clips/Handstand.webm",
      kicker: "Handstand Akrobatik",
      title: "Balance, die fesselt.",
      subtitle: "Konzentration, Kontrolle, Klasse.",
      tags: ["Balance", "Kontrolle"],
    },
    {
      posterSrc: "/images/posters/Hula-1024.webp",
      mediaType: "video" as const,
      mediaSrc: "/videos/Short%20Clips/Hula.webm",
      kicker: "Hula Hoop",
      title: "Ringe in Rotation.",
      subtitle: "Flow, Rhythmus und Präzision.",
      tags: ["Flow", "Rhythmus"],
    },
  ];

  const shuffledSpotlights = useMemo(() => shuffleArray(spotlights), []);

  useEffect(() => {
  if (!isDesktop || prefersReduced) {
    setOffset(0);
    return;
  }
  const onScroll = () => {
    const el = document.getElementById("hero");
    if (!el) return;
    const sectionTop = el.offsetTop;
    const y = window.scrollY;
    if (y >= sectionTop) {
      setOffset((y - sectionTop) * 1);
    } else {
      setOffset(0);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  return () => window.removeEventListener("scroll", onScroll);
}, [isDesktop, prefersReduced]);

  // (removed carouselApi, currentIndex, rightSize, groupRef, and related effects)


  return (
    <>
      <div className="hidden md:block">
        <div
          id="hero"
          className="relative w-screen min-h-[85vh] bg-black overflow-hidden"
        >
          {/* Hero image as real element so it can be prioritized as LCP */}
          <picture>
            <source srcSet={hero} type="image/webp" sizes="100vw" />
            <img
              src={hero}
              alt="PepeShows Hero"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 w-full h-full object-contain will-change-transform"
              style={{ transform: `translateY(${startOffset + offset}px)` }}
            />
          </picture>

          {/* Dark overlay to dim the hero image */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />

          {/* Pepe Canvas unten mittig */}
          <div className="pointer-events-none absolute inset-x-0 -bottom-12 md:-bottom-5 z-10 flex justify-center">
            <div className="relative w-full max-w-[1080px] aspect-[8/3] overflow-hidden">
              {isDesktop && showParticles && (
                <Suspense fallback={null}>
                  <PepesParticles />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-only hero image */}
      <section className="section-sm block md:hidden">
        <div className="stage-container flex items-center justify-center">
        <img
          src={pepeMobile}
          alt="Pepe"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width={380}
          height={380}
          className="max-w-full h-auto"
        />
        </div>
      </section>

      
          {/* Bento Section */}
          <section className="section">
            <div className="stage-container">
              <div ref={bentoRef} style={{ contentVisibility: 'auto', containIntrinsicSize: '1200px' }}>
                {bentoVisible && (
                  <Suspense fallback={null}>
                    <Bento1 />
                  </Suspense>
                )}
              </div>
            </div>
          </section>

          {/* Spotlights Section - Desktop/Tablet */}
          <section className="section hidden md:block">
            <div className="stage-container">
              <div ref={desktopSpotlightsRef}>
                {spotlightsVisible && (
                  <Suspense fallback={null}>
                    <SpotlightsFixed spotlights={shuffledSpotlights} autoplayPlugin={autoplayPlugin} />
                  </Suspense>
                )}
              </div>
            </div>
          </section>

          {/* Mobile Carousel Section */}
          <section className="section block md:hidden">
            <div className="stage-container">
              <div
                className="relative"
                aria-label="PepeShows Highlights Carousel"
              >
                <div
                  ref={mobileCarouselRef}
                  className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
                >
                  {/* Slide 1 */}
                  <div className="snap-start shrink-0 w-full px-4">
                    <img
                      src="/images/home_1.webp"
                      alt="PepeShows Highlight 1"
                      width={480}
                      height={270}
                      loading="lazy"
                      decoding="async"
                      className="w-full rounded-lg object-cover"
                    />
                  </div>
                  {/* Slide 2 */}
                  <div className="snap-start shrink-0 w-full px-4">
                    <img
                      src="/images/home_2.webp"
                      alt="PepeShows Highlight 2"
                      width={480}
                      height={270}
                      loading="lazy"
                      decoding="async"
                      className="w-full rounded-lg object-cover"
                    />
                  </div>
                  {/* Slide 3 */}
                  <div className="snap-start shrink-0 w-full px-4">
                    <img
                      src="/images/home_3.webp"
                      alt="PepeShows Highlight 3"
                      width={480}
                      height={270}
                      loading="lazy"
                      decoding="async"
                      className="w-full rounded-lg object-cover"
                    />
                  </div>
                </div>

                {/* Dots */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  {[0,1,2].map(i => (
                    <span
                      key={i}
                      className={
                        "h-1.5 rounded-full transition-all " +
                        (i === mobileSlide ? "w-4 bg-white/80" : "w-1.5 bg-white/30")
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Mobile text block */}
              <div className="bg-black/50 rounded-lg p-6 mt-6">
                <h2 className="h2 mb-3 text-left">
                  {t("home.findArtistTitle")}
                </h2>
                <p className="body mb-8">
                  {t("home.findArtistSubtitle")}
                </p>
                <a href="/anfragen?skipIntro=1">
                  <button className="btn btn-primary w-full">
                    {t("home.findArtistButton")}
                  </button>
                </a>
                <p className="body mb-8 text-left">
                  {t("home.findArtistTime")}
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="section">
            <div className="stage-container">
              <div ref={ctaRef} style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
                {ctaVisible && (
                  <Suspense fallback={null}>
                    <Cta10
                      heading={t("home.cta.heading")}
                      description={t("home.cta.description")}
                      buttons={{
                        primary: {
                          text: t("home.cta.button"),
                          url: "/agentur",
                        },
                      }}
                    />
                  </Suspense>
                )}
              </div>
            </div>
          </section>

          {/* Gallery Section */}
          <section className="section">
            <div className="stage-container">
              <div ref={galleryRef} style={{ contentVisibility: 'auto', containIntrinsicSize: '1200px' }}>
                {galleryVisible && (
                  <Suspense fallback={null}>
                    <Gallery23 />
                  </Suspense>
                )}
              </div>
            </div>
          </section>
      {showConsent && (
        <Suspense fallback={null}>
          <ConsentBannerLite />
        </Suspense>
      )}
    </>

  );
}