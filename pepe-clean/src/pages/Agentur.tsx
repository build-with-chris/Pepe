import { useTranslation } from "react-i18next";

export default function Agentur() {
  const { t } = useTranslation();

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-black"
      onMouseMove={(e) => {
        const target = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - target.left;
        const y = e.clientY - target.top;
        ;(e.currentTarget as HTMLElement).style.setProperty("--mx", `${x}px`);
        ;(e.currentTarget as HTMLElement).style.setProperty("--my", `${y}px`);
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `radial-gradient(500px at var(--mx, 50%) var(--my, 50%), rgba(99,102,241,0.10), transparent 60%)`
        }}
      />
      <div className="mt-8 mb-12 md:mt-12 md:mb-16 lg:mt-16 lg:mb-24">
        {/* Hero Section */}
        <div className="text-center mb-16 px-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('agentur.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
            {t('agentur.hero.subtitle')}
          </p>
        </div>

        <section className="w-full px-6 md:px-12 lg:px-20 py-16 text-white space-y-12 text-left">
          <div className="space-y-4 text-lg leading-relaxed text-left">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{t('agentur.champions.title')}</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <li className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition text-white/90 shadow-md">{t('agentur.champions.juggling')}</li>
              <li className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition text-white/90 shadow-md">{t('agentur.champions.cyr')}</li>
              <li className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition text-white/90 shadow-md">{t('agentur.champions.breakdance')}</li>
              <li className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition text-white/90 shadow-md">{t('agentur.champions.magic')}</li>
            </ul>
            <p className="mt-6 text-lg text-white/80 italic border-l-4 border-indigo-500 pl-4">{t('agentur.champions.mission')}</p>
          </div>

          <div className="relative border-t border-white/10 pt-8 text-left">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-6">{t('agentur.about.title')}</h2>
            <p className="text-white/90 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: t('agentur.about.leadership') }} />
            <p className="text-white/80 leading-relaxed mt-4 text-lg" dangerouslySetInnerHTML={{ __html: t('agentur.about.perspective') }} />
          </div>
        </section>
            </div>
        </div>
    )
}