import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { useState, useEffect } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { useIsMobile } from "@/hooks/use-mobile"

// Künstler-Bilder für den Slider
const artistImages = [
  { src: '/images/Kuenstler/slide1.webp', srcLg: '/images/Kuenstler/slide1-lg.webp', alt: 'Künstler 1' },
  { src: '/images/Kuenstler/slide2.webp', srcLg: '/images/Kuenstler/slide2-lg.webp', alt: 'Künstler 2' },
  { src: '/images/Kuenstler/slide3.webp', srcLg: '/images/Kuenstler/slide3-lg.webp', alt: 'Künstler 3' },
  { src: '/images/Kuenstler/slide4.webp', srcLg: undefined, alt: 'Künstler 4' },
  { src: '/images/Kuenstler/slide5.webp', srcLg: '/images/Kuenstler/slide5-lg.webp', alt: 'Künstler 5' },
  { src: '/images/Kuenstler/slide6.webp', srcLg: '/images/Kuenstler/slide6-lg.webp', alt: 'Künstler 6' },
  { src: '/images/Kuenstler/slide7.webp', srcLg: undefined, alt: 'Künstler 7' },
]

export default function Team() {
  const { t } = useTranslation();
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const isMobile = useIsMobile()

  // Auto-Play alle 2,5 Sekunden
  useEffect(() => {
    if (!api) return

    const interval = setInterval(() => {
      api.scrollNext()
    }, 2500) // 2.5 Sekunden

    return () => clearInterval(interval)
  }, [api])

  // Aktuellen Index verfolgen
  useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <main>
      {/* Hero Section - Streamlined mit Slider */}
      <section className="section-hero bg-gradient-dark relative overflow-hidden" style={{ minHeight: '70vh', height: '70vh' }}>
        {/* Künstler Slider - Füllt die gesamte Hero-Section */}
        <div className="absolute inset-0 w-full h-full z-20">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
              slidesToScroll: 1,
              containScroll: "trimSnaps",
            }}
            className="w-full h-full"
          >
            <CarouselContent className="h-full -ml-0 ml-0">
              {artistImages.map((image, index) => (
                <CarouselItem key={index} className="pl-0 basis-full h-full" style={{ width: '100%', height: '100%', minWidth: '100%', flexShrink: 0, flexGrow: 0 }}>
                  <div className="relative w-full h-full flex items-end justify-center" style={{ width: '100%', height: '100%', position: 'relative', paddingBottom: '2%' }}>
                    <img
                      src={image.srcLg || image.src}
                      alt={image.alt}
                      className="object-contain"
                      style={{ width: '85%', maxHeight: '70%', objectFit: 'contain', display: 'block', zIndex: 5 }}
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                    {/* Overlay für bessere Textlesbarkeit */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-10"></div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Hero Content - Über den Bildern */}
        <div className="relative z-10 flex flex-col justify-start pt-20" style={{ minHeight: '70vh', height: '70vh' }}>
          <div className="stage-container">
            <div className="hero-content text-center">
              <h1 className="display-1 display-gradient mb-6">
                {t('team.hero.title')}
              </h1>
              <p className="text-xl md:text-4xl lg:text-5xl xl:text-6xl text-pepe-gold/90 max-w-3xl mx-auto font-semibold leading-relaxed">
                Eine Community aus Weltklasse-Künstlern,<br />
                die gemeinsam Außergewöhnliches erschafft.
              </p>
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-8 left-0 right-0 z-10">
          <div className="stage-container">
            <div className="flex justify-center gap-2">
              {artistImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === current
                      ? 'bg-pepe-gold w-6'
                      : 'bg-pepe-gold/40 hover:bg-pepe-gold/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="section" style={{ paddingTop: 'var(--space-4)' }}>
        <div className="stage-container">
          <div className="section-header text-center mb-12">
            <h2 className="h1 mb-8">{t('team.whoWeAre.title')}</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="card bg-gradient-to-br from-pepe-ink/50 to-pepe-black/50 border-pepe-gold/20 mb-8">
              <div className="card-body">
                <p className="lead text-center mb-6">
                  {t('team.whoWeAre.intro_paragraph1')}
                </p>
                <div className="h-px bg-pepe-line mb-6 max-w-xs mx-auto"></div>
                <p className="body-lg text-pepe-t80 text-center">
                  {t('team.whoWeAre.intro_paragraph2')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-12">
            <h2 className="h1 mb-8">{t('team.community.title')}</h2>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Community Image */}
              <div className="card overflow-hidden">
                <img
                  src="/images/About1/About1.2.webp"
                  alt="Gemeinsames Training im PepeDome"
                  className="w-full h-full object-cover aspect-[4/3]"
                />
              </div>

              {/* Community Text */}
              <div className="flex flex-col justify-center">
                <p className="body-lg text-pepe-t80 mb-6 leading-relaxed">
                  {t('team.community.paragraph1')}
                </p>
                <p className="body-lg text-pepe-t80 leading-relaxed">
                  {t('team.community.paragraph2')}
                </p>
              </div>
            </div>

            <div className="card bg-gradient-to-r from-pepe-ink to-pepe-black/50 p-8 text-center">
              <p className="lead font-semibold text-pepe-gold">
                {t('team.community.closing')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section - Michael & Christoph */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-8">{t('team.founders.title')}</h2>
          </div>

          <div 
            className="max-w-6xl mx-auto gap-6"
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '1.5rem'
            }}
          >
            {/* Mobile: untereinander, Desktop: nebeneinander */}
            {/* Michael Card */}
            <div className="card hover:border-pepe-gold/50 transition-all overflow-hidden flex flex-col">
              <div className="card-body p-0 flex flex-col">
                {/* Michael Image */}
                <div className="w-full aspect-square max-h-[300px] overflow-hidden flex-shrink-0">
                  <img
                    src="/images/Michi.webp"
                    alt="Michael Heiduk"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Text unter dem Bild */}
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="h4 text-pepe-gold mb-3">{t('team.founders.michael_name')}</h3>
                  <p className="body-md text-pepe-t80 leading-relaxed flex-grow">
                    {t('team.founders.michael_bio')}
                  </p>
                </div>
              </div>
            </div>

            {/* Christoph Card */}
            <div className="card hover:border-pepe-gold/50 transition-all overflow-hidden flex flex-col">
              <div className="card-body p-0 flex flex-col">
                {/* Christoph Image */}
                <div className="w-full aspect-square max-h-[300px] overflow-hidden flex-shrink-0">
                  <img
                    src="/images/Chris.webp"
                    alt="Christoph Hermann"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Text unter dem Bild */}
                <div className="p-6 flex-grow flex flex-col">
                  <h4 className="h4 text-pepe-gold mb-3">{t('team.founders.christoph_name')}</h4>
                  <p className="body-md text-pepe-t80 leading-relaxed flex-grow">
                    {t('team.founders.christoph_bio')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-12">
            <h2 className="h1 mb-8">{t('team.about.title')}</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="card bg-gradient-to-br from-pepe-ink/80 to-pepe-black/80 border-pepe-gold/20">
              <div className="card-body text-center">
                <p className="lead mb-6">
                  <Trans
                    i18nKey="team.about.leadership"
                    values={{
                      michael: 'Michael Heiduk',
                      christoph: 'Christoph Hermann'
                    }}
                    components={{
                      strong: <strong className="text-pepe-gold" />
                    }}
                  />
                </p>
                <div className="h-px bg-pepe-line mb-6 max-w-xs mx-auto"></div>
                <p className="body-lg text-pepe-t80">
                  {t('team.about.perspective')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Promise Section */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-12">
            <h2 className="h1 mb-8">{t('team.servicePromise.title')}</h2>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="card bg-gradient-to-r from-pepe-black/50 to-pepe-ink/50 border-pepe-gold/20 mb-12">
              <div className="card-body text-center">
                <p className="lead">
                  {t('team.servicePromise.intro')}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Point 1 */}
              <div className="card hover:border-pepe-gold/50 transition-all">
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pepe-gold/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-pepe-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="h4 text-pepe-gold mb-3">
                        {t('team.servicePromise.point1_title')}
                      </h3>
                      <p className="body-lg text-pepe-t80">
                        {t('team.servicePromise.point1_text')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Point 2 */}
              <div className="card hover:border-pepe-gold/50 transition-all">
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pepe-gold/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-pepe-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="h4 text-pepe-gold mb-3">
                        {t('team.servicePromise.point2_title')}
                      </h3>
                      <p className="body-lg text-pepe-t80">
                        {t('team.servicePromise.point2_text')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Point 3 */}
              <div className="card hover:border-pepe-gold/50 transition-all">
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pepe-gold/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-pepe-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="h4 text-pepe-gold mb-3">
                        {t('team.servicePromise.point3_title')}
                      </h3>
                      <p className="body-lg text-pepe-t80">
                        {t('team.servicePromise.point3_text')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Point 4 */}
              <div className="card hover:border-pepe-gold/50 transition-all">
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pepe-gold/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-pepe-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="h4 text-pepe-gold mb-3">
                        {t('team.servicePromise.point4_title')}
                      </h3>
                      <p className="body-lg text-pepe-t80">
                        {t('team.servicePromise.point4_text')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-r from-pepe-gold/10 to-pepe-bronze/10 border-pepe-gold/30">
              <div className="card-body text-center">
                <p className="lead font-semibold text-pepe-white">
                  {t('team.servicePromise.closing')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-dark">
        <div className="stage-container text-center">
          <h2 className="display-2 mb-8">{t('team.cta.title')}</h2>

          <div className="max-w-3xl mx-auto mb-12">
            <p className="lead mb-6">
              {t('team.cta.message')}
            </p>
            <p className="h3 text-pepe-gold font-semibold">
              {t('team.cta.closing')}
            </p>
          </div>

          <div className="cta-actions">
            <Link to="/anfragen" className="btn btn-primary btn-xl">
              {t('team.cta.request_button')}
            </Link>
            <Link to="/kuenstler" className="btn btn-ghost btn-lg">
              {t('team.cta.artists_button')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}