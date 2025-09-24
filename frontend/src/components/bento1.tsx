"use client";

import { useEffect, useRef, useState, lazy, Suspense } from "react";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { motion, useAnimation, useInView } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

import { Helmet } from "react-helmet-async";

// Lazy-load Lottie only when actually rendered (desktop only)
const Lottie = lazy(() =>
  import("@lottiefiles/dotlottie-react").then((m) => ({ default: m.DotLottieReact }))
);

const Bento1 = () => {
  const { t } = useTranslation();
  const prefersReduced = usePrefersReducedMotion();
  const [showBeams, setShowBeams] = useState(false);


  const cardRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(cardRef, { amount: 0.4, margin: "-10% 0px -10% 0px" });
  const mobileSliderRef = useRef<HTMLDivElement | null>(null);
  const mobileSliderInView = useInView(mobileSliderRef, { amount: 0.4, margin: "-10% 0px -10% 0px" });
  const controls = useAnimation();
  const isSmallScreen = typeof window !== "undefined"
    ? window.matchMedia && window.matchMedia("(max-width: 639px)").matches
    : false;

  useEffect(() => {
    if (inView) {
      const target = isSmallScreen
        ? { y: 0, opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 80, damping: 18, mass: 1.2, duration: 1.2 } }
        : { y: -70, opacity: 1, scale: 1.08, transition: { type: "spring" as const, stiffness: 80, damping: 18, mass: 1.2, duration: 1.6 } };
      controls.start(target).then(() => setShowBeams(true));
    }
  }, [inView, controls, isSmallScreen]);

  // Crossfade slider for middle card
  const sliderImages = [
    "/images/Bento1/Slider1.webp",
    "/images/Bento1/Slider2.webp",
    "/images/Bento1/Slider3.webp",
  ]


  const sliderImagesMobile =[
    "/images/Bento1/Slider1Mobile.webp",
    "/images/Bento1/Slider2Mobile.webp",
    "/images/Bento1/Slider3Mobile.webp",
  ]

  const [slide, setSlide] = useState(0);
  const [showSparkleAnim, setShowSparkleAnim] = useState(false);
  const [showGlobalSparkles, setShowGlobalSparkles] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Responsive slider images (mobile/desktop)
  const isMobile = typeof window !== "undefined"
    ? window.matchMedia && window.matchMedia("(max-width: 639px)").matches
    : false;
  const images = isMobile ? sliderImagesMobile : sliderImages;
  const thirdImage = isMobile ? "/images/Bento1/BurnMobile-380.webp" : "/images/Bento1/Burn.webp";

  useEffect(() => {
    setSlide((s) => s % images.length);
    // Pause animation if explicitly paused, (on mobile) when the slider is not in view, or when user prefers reduced motion
    if (isPaused || (isMobile && !mobileSliderInView) || prefersReduced) return;
    const interval = isMobile ? 4500 : 3500;
    const id = setInterval(() => {
      setSlide((s) => (s + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images.length, isPaused, isMobile, mobileSliderInView, prefersReduced]);

  return (
    <section className="sm:pt-16 sm:pb-8 md:py-16 cv-auto">
      <Helmet>
        <link rel="preload" as="image" href="/images/Bento1/CircusTentMobile.webp" media="(max-width: 639px)" />
      </Helmet>
      <div className="container">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12">
          <Card className="group relative h-60 overflow-hidden rounded-xl border border-white/10 bg-black transition md:col-span-2 md:row-span-2 md:h-[400px] lg:col-span-4 lg:h-full">
            <div ref={cardRef} />


            {/* Circus tent fly-in */}
            <motion.div
              initial={isSmallScreen ? { y: 40, opacity: 0, scale: 1 } : { y: -180, opacity: 0, scale: 0.9 }}
              animate={controls}
              transition={{ type: "spring", stiffness: 80, damping: 18, mass: 1.2, duration: 1.6 }}
              onAnimationComplete={() => setShowBeams(true)}
              className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end items-center"
              aria-hidden
            >
              <picture>
                <source
                  srcSet="/images/Bento1/CircusTentMobile.webp"
                  type="image/webp"
                  media="(max-width: 639px)"
                  sizes="100vw"
                />
                <img
                  src="/images/Bento1/CircusTent.png"
                  alt="Circuszelt mit Luftartistin"
                  width={1400}
                  height={900}
                  className="mt-auto h-auto w-full max-w-[1400px] max-h-full select-none object-contain object-center md:object-cover"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={(e) => {
                    console.error("/images/Bento1/CircusTent.png failed to load", e.currentTarget.src);
                  }}
                />
              </picture>
            </motion.div>

            {/* Spotlights: appear after fly-in */}
            {showBeams && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ duration: 0.6 }}
                  className="pointer-events-none absolute bottom-0 left-[8%] h-[140%] w-[45%] rotate-[-18deg] blur-sm z-20"
                  style={{
                    clipPath: "polygon(0% 0%, 22% 0%, 90% 100%, 0% 100%)",
                    background:
                      "linear-gradient(to bottom, rgba(255,255,220,0.0) 0%, rgba(255,255,200,0.25) 25%, rgba(255,253,170,0.35) 55%, rgba(255,253,170,0.0) 100%)",
                    mixBlendMode: "screen",
                  }}
                  aria-hidden
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ duration: 0.6, delay: 0.08 }}
                  className="pointer-events-none absolute bottom-0 right-[8%] h-[140%] w-[45%] rotate-[18deg] blur-sm z-20"
                  style={{
                    clipPath: "polygon(78% 0%, 100% 0%, 100% 100%, 10% 100%)",
                    background:
                      "linear-gradient(to bottom, rgba(255,255,220,0.0) 0%, rgba(255,255,200,0.25) 25%, rgba(255,253,170,0.35) 55%, rgba(255,253,170,0.0) 100%)",
                    mixBlendMode: "screen",
                  }}
                  aria-hidden
                />
              </>
            )}

            {/* Subtle top gradient for readability */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 z-10 bg-gradient-to-b from-black/35 via-black/10 to-transparent" />
            {/* Discreet top-centered header with centered icon below */}
            <div className="absolute inset-x-0 top-3 z-20 flex items-start justify-center pointer-events-none min-h-[40px]">
              <div className="flex flex-col items-center gap-2">
                <h2
                  className="text-center text-white font-semibold text-xl md:text-3xl lg:text-4xl tracking-tight px-3 leading-tight transition-opacity duration-300 group-hover:opacity-40"
                  style={{ textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}
                >
                  {t("bento1.hero.title")}
                </h2>
                <div
                  className="pointer-events-auto cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label="Show sparkles and spotlights"
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                  onClick={() => {
                    setShowBeams(true);
                    setShowSparkleAnim(true);
                    setTimeout(() => {
                      setShowSparkleAnim(false);
                      setShowGlobalSparkles(true);
                      setTimeout(() => setShowGlobalSparkles(false), 10000);
                    }, 2500);
                  }}
                >
                  <motion.div
                    animate={{ opacity: [0.75, 1, 0.75], scale: [1, 1.02, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-[1px] sm:h-10 sm:w-10"
                  >
                    <Sparkles className="h-4 w-4 text-yellow-400 opacity-90 sm:h-5 sm:w-5" />
                  </motion.div>
                </div>
              </div>
            </div>

            <CardContent className="relative z-20 flex h-full flex-col justify-end p-6 pointer-events-none">
              {/* Visually hidden title for a11y (overlay above shows the visual title) */}
              <h2 className="sr-only">{t("bento1.hero.title")}</h2>
              {!isSmallScreen && showSparkleAnim && !prefersReduced && (
                <div className="absolute top-4 right-2 sm:right-3 md:right-4 z-30 pointer-events-none">
                  <Suspense fallback={null}>
                    <Lottie
                      src="https://lottie.host/8f8332c8-41ef-4d9d-ad07-d9dd352b1cb4/UVLLlb0OP5.lottie"
                      loop
                      autoplay
                      style={{
                        width: "clamp(56px, 12vw, 128px)",
                        height: "clamp(56px, 12vw, 128px)",
                        filter: "brightness(1.8)",
                      }}
                    />
                  </Suspense>
                </div>
              )}
              {!isSmallScreen && showGlobalSparkles && !prefersReduced && (
                <div className="absolute inset-0 z-40 pointer-events-none">
                  <Suspense fallback={null}>
                    <Lottie
                      src="https://lottie.host/e86a7557-375e-4cf6-abc0-c8f0d034b637/mQay5cJDVU.lottie"
                      loop
                      autoplay
                      style={{ width: "100%", height: "100%", filter: "brightness(2)" }}
                    />
                  </Suspense>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="relative col-span-1 h-60 rounded-xl border border-white/10 bg-neutral-900/80 backdrop-blur-sm transition 
          hover:bg-neutral-900/60 md:col-span-2 md:row-span-1 md:h-[300px] lg:col-span-4 lg:h-[300px]">
            <CardContent className="flex h-full flex-col items-center justify-center text-center p-6">
              <p className="text-gray-300 mb-6 text-center text-base md:text-lg lg:text-xl">
                {t("bento1.cta.body")}
              </p>
              <div className="mt-6 flex flex-col gap-4">
                <a href="/anfragen?skipIntro=1">
                  <Button
                    className="group flex w-full min-w-[220px] items-center justify-center gap-2 rounded-full tracking-tight bg-white text-black hover:bg-gray-200 font-[futura] px-6 py-2"
                  >
                    {t("bento1.cta.btnStart")}
                    <ArrowRight className="size-4 -rotate-45 transition-all ease-out group-hover:rotate-0" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          

          <Card
            className="group relative h-60 overflow-hidden rounded-xl border border-white/10 bg-neutral-900/80 backdrop-blur-sm transition hover:bg-neutral-900/60 md:col-span-2 md:row-span-2 md:h-[400px] lg:col-span-4 lg:h-full"
          >
            <div className="absolute inset-0">
              <motion.img
                src={thirdImage}
                srcSet={isMobile ? "/images/Bento1/BurnMobile-380.webp 380w, /images/Bento1/BurnMobile-720.webp 720w" : undefined}
                alt={t("bento1.third.title")}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                width={isMobile ? 380 : 1400}
                height={isMobile ? 252 : 900}
                className="absolute inset-0 h-full w-full object-cover"
                initial={{ scale: 1.02, x: 0, y: 0 }}
                animate={prefersReduced ? { scale: 1.02, x: 0, y: 0 } : { scale: [1.02, 1.08, 1.02], x: [0, 8, 0], y: [0, -8, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              />
              {/* Soft vignette and readability layer */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/35" />
            </div>
            {/* Discreet top-centered header */}
            <div className="absolute inset-x-0 top-3 z-20 flex items-start justify-center pointer-events-none min-h-[40px]">
              <h2
                className="text-center text-white font-semibold text-xl md:text-3xl lg:text-4xl tracking-tight px-3 leading-tight transition-opacity duration-300 group-hover:opacity-40"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}
              >
                {t("bento1.third.title")}
              </h2>
            </div>
            <CardContent className="z-10 flex h-full flex-col justify-end p-6">
              <h2 className="sr-only">{t("bento1.third.title")}</h2>
            </CardContent>
          </Card>

          {!isMobile && (
            <Card
              className="group relative h-60 overflow-hidden rounded-xl border border-white/10 bg-neutral-900/80 backdrop-blur-sm transition hover:bg-neutral-900/60 md:col-span-2 md:row-span-2 md:h-[400px] lg:col-span-4 lg:h-[600px]"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="absolute inset-0">
                {images.map((src, i) => (
                  <motion.img
                    key={src}
                    src={src}
                    alt={t("bento1.slider.alt")}
                    decoding="async"
                    fetchPriority="low"
                    width={1400}
                    height={900}
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: i === slide ? 0.9 : 0 }}
                    transition={{ duration: 0.8 }}
                  />
                ))}
                <div className="absolute inset-0 bg-black/30" />
              </div>
              {/* Subtle top gradient for readability */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 z-10 bg-gradient-to-b from-black/35 via-black/10 to-transparent" />
              {/* Discreet top-centered title */}
              <div className="absolute inset-x-0 top-3 z-20 flex items-start justify-center pointer-events-none min-h-[40px]">
                <h2
                  className="text-center text-white font-semibold text-xl md:text-3xl lg:text-4xl tracking-tight px-3 leading-tight transition-opacity duration-300 group-hover:opacity-40"
                  style={{ textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}
                >
                  {t("bento1.middle.title")}
                </h2>
              </div>
              <CardContent className="z-10 flex h-full flex-col justify-end p-6">
                <h2 className="sr-only">{t("bento1.middle.title")}</h2>
              </CardContent>
            </Card>
          )}

          <Card className="relative col-span-1 h-60 overflow-hidden rounded-xl border border-white/10 bg-neutral-900/80 
          backdrop-blur-sm transition hover:bg-neutral-900/60 md:col-span-2 md:row-span-1 md:h-[300px] lg:col-span-4 lg:h-[300px]">
            <div className="flex h-full flex-col items-center justify-center p-6">
              <div className="flex flex-col items-center text-center">
                {!isSmallScreen && (
                  <div className="mb-4 h-24 w-24">
                    <Suspense fallback={null}>
                      <Lottie
                        src="https://lottie.host/b2962fce-3098-47a6-872c-94da6b12033f/vP0MmCNB7f.lottie"
                        loop
                        autoplay
                      />
                    </Suspense>
                  </div>
                )}
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 text-white">{t("bento1.responsibility.title")}</h3>
                <p className="text-base md:text-lg lg:text-xl text-gray-300 ">
                  {t("bento1.responsibility.body1")}<br/>
                  {t("bento1.responsibility.body2")}
                </p>
              </div>
            </div>
          </Card>

          {/* Mobile-only Gallery clone to alternate text/media order */}
          <Card
            className="group relative h-60 overflow-hidden rounded-xl border border-white/10 bg-neutral-900/80 backdrop-blur-sm transition hover:bg-neutral-900/60 block md:hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div ref={mobileSliderRef} className="absolute inset-0">
              {mobileSliderInView ? (
                <>
                  {images.map((src, i) => (
                    <motion.img
                      key={src}
                      src={src}
                      alt={t("bento1.slider.alt")}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      width={800}
                      height={600}
                      className="absolute inset-0 h-full w-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: i === slide ? 0.9 : 0 }}
                      transition={{ duration: 0.8 }}
                    />
                  ))}
                  <div className="absolute inset-0 bg-black/30" />
                </>
              ) : (
                // Reserve space but avoid image network before in-view
                <div className="absolute inset-0 bg-black/20" />
              )}
            </div>
            {/* Subtle top gradient for readability */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 z-10 bg-gradient-to-b from-black/35 via-black/10 to-transparent" />
            {/* Discreet top-centered title */}
            <div className="absolute inset-x-0 top-3 z-20 flex items-start justify-center pointer-events-none min-h-[40px]">
              <h2
                className="text-center text-white font-semibold text-xl tracking-tight px-3 leading-tight transition-opacity duration-300 group-hover:opacity-40"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}
              >
                {t("bento1.middle.title")}
              </h2>
            </div>
            <CardContent className="z-10 flex h-full flex-col justify-end p-6">
              <h2 className="sr-only">{t("bento1.middle.title")}</h2>
            </CardContent>
          </Card>


          <Card className="relative col-span-1 h-60 rounded-xl border border-white/10 bg-neutral-900/80 backdrop-blur-sm transition hover:bg-neutral-900/60 
          md:col-span-2 md:row-span-1 md:h-[300px] lg:col-span-4 lg:h-[300px]">
            <CardContent className="flex h-full flex-col items-center justify-center p-6">
              <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{t("bento1.values.fairnessTitle")}</span>
              <p className="text-gray-300 my-6 text-center text-base md:text-lg lg:text-xl">
                {t("bento1.values.fairnessBodyPrefix")}{" "}
                <a
                  href="https://darstellende-kuenste.de/themen/soziale-lage#anchor-1376"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  {t("bento1.values.linkText")}
                </a>
                .
              </p>
              <div className="flex -space-x-2">
                {["Artist1.webp","Artist2.webp","Artist3.webp","Artist4.webp","Artist5.webp"].map((file, i) => (
                  <Avatar
                    key={i}
                    className="border-border h-8 w-8 border-2 md:h-8 md:w-8 lg:h-10 lg:w-10"
                  >
                    <AvatarImage
                      src={`/images/Slider/${file}`}
                      srcSet={`/images/Slider/${file.replace('.webp','-64.webp')} 64w`}
                      sizes="28px"
                      width={28}
                      height={28}
                      alt={`Artist ${i + 1}`}
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.onerror = null; // prevent loops
                        img.src = `/images/Slider/${file}`; // fall back to original
                        img.removeAttribute('srcset');
                        img.removeAttribute('sizes');
                      }}
                    />
                    <AvatarFallback>ART{i+1}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </CardContent>
          </Card>

         
        </div>
      </div>
    </section>
  );
};

export { Bento1 };
