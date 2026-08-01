/**
 * Kontaktseite, gebaut für Firmenkunden.
 *
 * Wer hier landet, plant eine Weihnachtsfeier, ein Incentive, ein Stadtfest
 * oder einen grösseren privaten Anlass. Das ist selten der Entscheider allein:
 * Meist sitzt eine Eventagentur, eine Assistenz oder der Einkauf mit am Tisch.
 * Diese Leute wollen drei Dinge wissen, bevor sie anfragen:
 *
 * 1. **Können die das?** Deshalb stehen die Kundenlogos oben und nicht als
 *    Fussnote. Sie sind der einzige Beleg auf dieser Seite, der nichts
 *    behauptet, sondern zeigt.
 * 2. **Mit wem rede ich?** Deshalb ein Mensch mit Namen und Gesicht statt
 *    einer Sammeladresse. Eine Agentur ohne Ansprechpartner wirkt wie ein
 *    Formular, und Formulare bekommen keine Budgets.
 * 3. **Was kostet mich die Anfrage?** Deshalb steht an jedem Weg, wie lange er
 *    dauert und wann eine Antwort kommt.
 *
 * Der Block „Das Kaufmännische" ist der Teil, den ein Einkauf sonst per Mail
 * erfragt. Jede Angabe darin steht so in den AGB (`pages/AGB.tsx`) und ist
 * nicht ausgedacht. Wer die AGB ändert, ändert auch diesen Block.
 *
 * Durchgehend Sie-Ansprache. Vorher stand „Wir sind für dich da" über einem
 * Absatz, der von „Ihrem Angebot" sprach.
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Receipt,
  RefreshCw,
  Users,
} from 'lucide-react';

import SEO, { pageSEO } from '@/components/SEO';

const PHONE = '+49 159 04891419';
const PHONE_HREF = 'tel:+4915904891419';
const MAIL = 'info@pepeshows.de';
const MAPS =
  'https://www.google.com/maps/place/Pepe+Dome+im+Theatron+im+Ostpark/@48.1119726,11.640768,17z/data=!3m1!4b1!4m6!3m5!1s0x479ddfe1623e7b83:0x8f776b2413dcab9e!8m2!3d48.1119726!4d11.6433429';

/**
 * Zwei Ansprechpartner mit klar getrennten Zuständigkeiten.
 *
 * Für einen Firmenkunden ist das mehr wert als eine Sammeladresse: Wer den
 * Vertrag braucht, schreibt Christoph. Wer wissen will, ob eine Luftnummer
 * unter eine Decke von vier Metern passt, ruft Michael an. Ohne diese Trennung
 * landet beides im selben Postfach und wartet.
 *
 * `objectPosition` steht als Stilangabe am Bild und nicht als Klasse: Beide
 * Gesichter sitzen ausserhalb der Bildmitte, und ein runder Ausschnitt hätte
 * sie sonst angeschnitten. Die Werte sind an den verkleinerten Fassungen
 * abgelesen, nicht geschätzt.
 */
const CONTACTS = [
  {
    name: 'Christoph Hermann',
    image: '/images/Team/christoph-hermann.jpg',
    width: 426,
    height: 640,
    objectPosition: '55% 22%',
    roleKey: 'kontakt.person.christoph.role',
    roleFallback: 'Anfragen, Details und Vertrag',
    forKey: 'kontakt.person.christoph.for',
    forFallback: 'Angebot, Termin, Konditionen und alles Schriftliche.',
    mail: 'info@pepeshows.de',
    phone: '+49 159 04891419',
    phoneHref: 'tel:+4915904891419',
  },
  {
    name: 'Michael Heiduk',
    image: '/images/Team/michael-heiduk.jpg',
    width: 640,
    height: 426,
    objectPosition: '62% 28%',
    roleKey: 'kontakt.person.michael.role',
    roleFallback: 'Künstlerisches und Machbarkeit',
    forKey: 'kontakt.person.michael.for',
    forFallback: 'Was geht auf Ihrer Fläche, unter Ihrer Decke, in Ihrem Ablauf.',
    mail: 'info@pepearts.de',
    phone: '+49 179 6990707',
    phoneHref: 'tel:+491796990707',
  },
];

const CLIENTS = [
  { src: '/images/Logos/Porsche.png', alt: 'Porsche' },
  { src: '/images/Logos/google.svg', alt: 'Google' },
  { src: '/images/Logos/mcdonalds.svg', alt: "McDonald's" },
  { src: '/images/Logos/astrazeneca.svg', alt: 'AstraZeneca' },
  { src: '/images/Logos/tollwood.svg', alt: 'Tollwood Festival' },
  { src: '/images/Logos/european-championships.svg', alt: 'European Championships' },
];

export default function Kontakt() {
  const { t } = useTranslation();

  /** Die drei Wege zu uns, mit ehrlicher Angabe von Aufwand und Antwortzeit. */
  const routes = [
    {
      icon: FileText,
      title: t('kontakt.routes.assistant.title', 'Angebot anfordern'),
      meta: t('kontakt.routes.assistant.meta', 'Rund 3 Minuten, Angebot binnen 24 Stunden'),
      body: t(
        'kontakt.routes.assistant.body',
        'Anlass, Datum, Ort und Rahmen eingeben. Sie bekommen eine Auswahl passender Künstlerinnen und Künstler mit Preisen, unverbindlich.'
      ),
      cta: t('kontakt.routes.assistant.cta', 'Anfrage starten'),
      to: '/anfragen',
      primary: true,
    },
    {
      icon: Mail,
      title: t('kontakt.routes.mail.title', 'Schreiben'),
      meta: t('kontakt.routes.mail.meta', 'Antwort in der Regel binnen 24 Stunden'),
      body: t(
        'kontakt.routes.mail.body',
        'Für Ausschreibungen, Rahmenverträge und alles, was ein Formular nicht abbildet.'
      ),
      cta: MAIL,
      href: `mailto:${MAIL}`,
    },
    {
      icon: Phone,
      title: t('kontakt.routes.phone.title', 'Anrufen'),
      meta: t('kontakt.routes.phone.meta', 'Montag bis Freitag, 9 bis 17 Uhr'),
      body: t(
        'kontakt.routes.phone.body',
        'Wenn es schnell gehen muss oder Sie erst sortieren wollen, was überhaupt passt.'
      ),
      cta: PHONE,
      href: PHONE_HREF,
    },
  ];

  /** Was ein Einkauf wissen will, bevor er eine Anfrage freigibt. */
  const facts = [
    {
      icon: Receipt,
      title: t('kontakt.facts.payment.title', 'Zahlung auf Rechnung'),
      body: t('kontakt.facts.payment.body', '14 Tage netto nach Rechnungsstellung.'),
    },
    {
      icon: CalendarClock,
      title: t('kontakt.facts.cancel.title', 'Storno bis 30 Tage vorher'),
      body: t('kontakt.facts.cancel.body', 'Bis 30 Tage vor der Veranstaltung kostenfrei.'),
    },
    {
      icon: CheckCircle2,
      title: t('kontakt.facts.contract.title', 'Schriftlich bestätigt'),
      body: t(
        'kontakt.facts.contract.body',
        'Der Vertrag kommt mit unserer schriftlichen Bestätigung zustande, nicht vorher.'
      ),
    },
    {
      icon: RefreshCw,
      title: t('kontakt.facts.replacement.title', 'Ersatz bei Ausfall'),
      body: t(
        'kontakt.facts.replacement.body',
        'Fällt jemand aus, stellen wir einen gleichwertigen Act. Ihr Programm steht.'
      ),
    },
    {
      icon: MapPin,
      title: t('kontakt.facts.area.title', 'Deutschsprachiger Raum'),
      body: t(
        'kontakt.facts.area.body',
        'Deutschland, Österreich und Schweiz. Darüber hinaus auf Anfrage.'
      ),
    },
    {
      icon: Users,
      title: t('kontakt.facts.short.title', 'Auch kurzfristig'),
      body: t(
        'kontakt.facts.short.body',
        'Wenn ein Act abspringt oder ein Termin dazukommt: fragen Sie an, oft geht es noch.'
      ),
    },
  ];

  /** Was eine Anfrage vollständig macht. Spart eine Rückfragerunde. */
  const briefing = [
    t('kontakt.briefing.date', 'Datum und Uhrzeit, gern mit Ausweichtermin'),
    t('kontakt.briefing.place', 'Ort und Art der Location, drinnen oder draussen'),
    t('kontakt.briefing.occasion', 'Anlass und ungefähre Gästezahl'),
    t('kontakt.briefing.format', 'Gewünschte Länge und ob Bühne, Walking Act oder beides'),
    t('kontakt.briefing.budget', 'Budgetrahmen, wenn er schon steht'),
  ];

  return (
    <main className="ui-surface">
      <SEO {...pageSEO.kontakt} />

      {/* ---------- Aufmacher: was hier passiert und wie lange es dauert ---------- */}
      <section className="section-hero-compact bg-gradient-dark">
        <div className="stage-container">
          <div className="mx-auto max-w-3xl py-10 text-center sm:py-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-pepe-gold">
              {t('kontakt.hero.kicker', 'Künstler für Ihre Veranstaltung')}
            </p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              {t('kontakt.hero.title', 'Ihr Angebot binnen 24 Stunden')}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-300">
              {t(
                'kontakt.hero.description',
                'Firmenfeiern, Incentives, öffentliche Feste und private Anlässe. Sagen Sie uns, was ansteht, und Sie bekommen eine Auswahl passender Künstlerinnen und Künstler mit Preisen.'
              )}
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                to="/anfragen"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-pepe-gold px-7 text-base font-semibold text-pepe-black transition-colors hover:bg-pepe-gold-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold focus-visible:ring-offset-2 focus-visible:ring-offset-pepe-coal"
              >
                {t('kontakt.hero.primary', 'Angebot anfordern')}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <a
                href={PHONE_HREF}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg border border-white/20 px-7 text-base font-medium text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                {PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Beleg statt Behauptung. Deshalb ganz oben. ---------- */}
      <section className="border-y border-white/5 bg-pepe-ink py-10">
        <div className="stage-container">
          <p className="text-center text-sm text-gray-500">
            {t('kontakt.clients.title', 'Für diese Häuser haben wir schon gearbeitet')}
          </p>
          <ul className="mt-7 flex list-none flex-wrap items-center justify-center gap-x-10 gap-y-7 pl-0 sm:gap-x-14">
            {CLIENTS.map((c) => (
              <li key={c.alt}>
                <img
                  src={c.src}
                  alt={c.alt}
                  className="h-8 w-auto opacity-75 brightness-0 invert transition-opacity hover:opacity-100 sm:h-9"
                  loading="lazy"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Zwei Ansprechpartner mit getrennten Zuständigkeiten ---------- */}
      <section className="section">
        <div className="stage-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold leading-tight text-white">
              {t('kontakt.person.title', 'Wer bei uns wofür zuständig ist')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-400">
              {t(
                'kontakt.person.intro',
                'Damit Ihre Frage direkt bei dem landet, der sie beantworten kann.'
              )}
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
            {CONTACTS.map((c) => (
              <div
                key={c.name}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={c.image}
                    alt={c.name}
                    width={c.width}
                    height={c.height}
                    className="h-20 w-20 flex-shrink-0 rounded-full object-cover"
                    style={{ objectPosition: c.objectPosition }}
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="text-lg font-semibold leading-snug text-white">{c.name}</p>
                    <p className="mt-1 text-sm text-pepe-gold">{t(c.roleKey, c.roleFallback)}</p>
                  </div>
                </div>

                <p className="mt-5 flex-1 text-sm leading-relaxed text-gray-400">
                  {t(c.forKey, c.forFallback)}
                </p>

                <dl className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500"
                      aria-hidden="true"
                    />
                    <dt className="sr-only">E-Mail</dt>
                    <dd className="min-w-0 break-all">
                      <a href={`mailto:${c.mail}`} className="text-gray-200 hover:text-pepe-gold">
                        {c.mail}
                      </a>
                    </dd>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500"
                      aria-hidden="true"
                    />
                    <dt className="sr-only">Telefon</dt>
                    <dd className="min-w-0">
                      <a href={c.phoneHref} className="text-gray-200 hover:text-pepe-gold">
                        {c.phone}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t('kontakt.person.hours', 'Erreichbar Montag bis Freitag, 9 bis 17 Uhr')}
          </p>
        </div>
      </section>

      {/* ---------- Die drei Wege, mit Aufwand und Antwortzeit ---------- */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {routes.map(({ icon: Icon, title, meta, body, cta, to, href, primary }) => (
                <div
                  key={title}
                  className={
                    'flex flex-col rounded-2xl border p-6 ' +
                    (primary
                      ? 'border-pepe-gold/30 bg-pepe-gold/5'
                      : 'border-white/10 bg-white/5')
                  }
                >
                  <Icon
                    className={'h-6 w-6 ' + (primary ? 'text-pepe-gold' : 'text-gray-400')}
                    aria-hidden="true"
                  />
                  <h2 className="mt-4 text-lg font-semibold leading-snug text-white">{title}</h2>
                  <p className="mt-1.5 text-xs text-gray-500">{meta}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-400">{body}</p>
                  {to ? (
                    <Link
                      to={to}
                      className="mt-5 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-pepe-gold px-5 text-sm font-semibold text-pepe-black transition-colors hover:bg-pepe-gold-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold"
                    >
                      {cta}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : (
                    <a
                      href={href}
                      className="mt-5 inline-flex min-h-[46px] items-center justify-center rounded-lg border border-white/15 px-5 text-sm font-medium text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold"
                    >
                      {cta}
                    </a>
                  )}
                </div>
              ))}
            </div>
        </div>
      </section>

      {/* ---------- Das Kaufmännische, damit der Einkauf nicht nachfragen muss ---------- */}
      <section className="section">
        <div className="stage-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold leading-tight text-white">
              {t('kontakt.facts.title', 'Das Kaufmännische auf einen Blick')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-400">
              {t(
                'kontakt.facts.intro',
                'Damit Sie nicht erst nachfragen müssen. Es gelten unsere AGB.'
              )}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-pepe-gold" aria-hidden="true" />
                <div className="min-w-0">
                  <h3 className="text-base font-semibold leading-snug text-white">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            <Link to="/agb" className="underline-offset-4 hover:text-gray-300 hover:underline">
              {t('kontakt.facts.terms', 'Vollständige AGB lesen')}
            </Link>
          </p>
        </div>
      </section>

      {/* ---------- Was eine Anfrage vollständig macht ---------- */}
      <section className="section">
        <div className="stage-container">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="font-display text-3xl font-bold leading-tight text-white">
                {t('kontakt.briefing.title', 'Das brauchen wir von Ihnen')}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-400">
                {t(
                  'kontakt.briefing.intro',
                  'Je mehr davon in der ersten Nachricht steht, desto genauer wird das Angebot. Fehlt etwas, fragen wir nach.'
                )}
              </p>
              <ul className="mt-7 list-none space-y-3.5 pl-0">
                {briefing.map((item) => (
                  <li key={item} className="flex gap-3 text-base text-gray-300">
                    <CheckCircle2
                      className="mt-1 h-4 w-4 flex-shrink-0 text-pepe-gold"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Der Ort, an dem man uns besuchen kann. Für Kunden aus München
                ist das oft der kürzeste Weg zu einer Entscheidung. */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
              <MapPin className="h-6 w-6 text-pepe-gold" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-semibold leading-snug text-white">
                {t('kontakt.space.title', 'Der PepeDome')}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-400">
                {t(
                  'kontakt.space.body',
                  'Unsere Spielstätte im Ostpark München. Hier proben wir, hier zeigen wir Programme, und hier können Sie sich einen Act vorher ansehen.'
                )}
              </p>
              <address className="mt-5 not-italic text-base text-gray-300">
                PepeDome
                <br />
                Ostpark München
                <br />
                81735 München
              </address>
              <a
                href={MAPS}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-[46px] items-center justify-center rounded-lg border border-white/15 px-5 text-sm font-medium text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold"
              >
                {t('kontakt.space.button', 'Route planen')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Abschluss ---------- */}
      <section className="section bg-gradient-dark">
        <div className="stage-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              {t('kontakt.cta.title', 'Sagen Sie uns, was ansteht')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-400">
              {t(
                'kontakt.cta.body',
                'Drei Minuten für die Anfrage, ein Angebot binnen 24 Stunden. Unverbindlich.'
              )}
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                to="/anfragen"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-pepe-gold px-7 text-base font-semibold text-pepe-black transition-colors hover:bg-pepe-gold-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold"
              >
                {t('kontakt.cta.booking_button', 'Angebot anfordern')}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <a
                href={`mailto:${MAIL}`}
                className="inline-flex min-h-[52px] items-center justify-center rounded-lg border border-white/20 px-7 text-base font-medium text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pepe-gold"
              >
                {t('kontakt.cta.email_button', 'Lieber schreiben')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
