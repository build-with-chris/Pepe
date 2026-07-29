import { Helmet } from 'react-helmet-async'

const BASE_URL = 'https://www.pepeshows.com'

interface SEOProps {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'article'
  noindex?: boolean
}

const defaultMeta = {
  title: 'Pepe Shows - Artistenagentur & Show-Booking aus München',
  description: 'Pepe Shows ist Ihre Artistenagentur aus München. Wir vermitteln erstklassige Akrobaten, Feuerkünstler, Jongleure und Zirkusartisten für Events, Messen und Galas.',
  image: `${BASE_URL}/images/og-image.jpg`,
}

export default function SEO({
  title,
  description = defaultMeta.description,
  path = '',
  image = defaultMeta.image,
  type = 'website',
  noindex = false,
}: SEOProps) {
  const fullTitle = title
    ? `${title} | Pepe Shows`
    : defaultMeta.title
  const url = `${BASE_URL}${path}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}

// Pre-defined SEO configs for each public page
export const pageSEO = {
  home: {
    description: 'Pepe Shows ist Ihre Artistenagentur aus München. Erstklassige Akrobaten, Feuerkünstler, Jongleure und Zirkusartisten für Events, Messen und Galas buchen.',
    path: '/',
  },
  kuenstler: {
    title: 'Unsere Künstler - Akrobaten, Feuerkünstler & Artisten',
    description: 'Entdecken Sie unser Portfolio erstklassiger Artisten: Akrobaten, Feuerkünstler, Jongleure, Luftakrobaten und mehr. Professionelle Künstler für Ihr Event.',
    path: '/kuenstler',
  },
  shows: {
    title: 'Shows & Programme - Maßgeschneiderte Event-Unterhaltung',
    description: 'Maßgeschneiderte Show-Programme für Firmenevents, Galas, Messen und Privatfeiern. Von Feuershow bis Akrobatik - wir gestalten Ihr perfektes Entertainment.',
    path: '/shows',
  },
  galerie: {
    title: 'Galerie - Impressionen unserer Auftritte',
    description: 'Sehen Sie Fotos und Impressionen vergangener Auftritte unserer Artisten. Akrobatik, Feuershows, Luftakrobatik und mehr in Aktion.',
    path: '/galerie',
  },
  kontakt: {
    title: 'Kontakt - Jetzt Show anfragen',
    description: 'Kontaktieren Sie Pepe Shows für Ihre nächste Veranstaltung. Wir beraten Sie gerne und erstellen ein individuelles Angebot für Ihr Event.',
    path: '/kontakt',
  },
  anfragen: {
    title: 'Show anfragen - Unverbindliches Angebot',
    description: 'Fragen Sie jetzt unverbindlich Ihre Wunsch-Show an. Wir erstellen Ihnen ein maßgeschneidertes Angebot für Ihr Event.',
    path: '/anfragen',
  },
  team: {
    title: 'Unser Team - Die Menschen hinter Pepe Shows',
    description: 'Lernen Sie das Team hinter Pepe Shows kennen. Erfahrene Event-Profis und Künstlermanager aus München.',
    path: '/team',
  },
  agentur: {
    title: 'Über die Agentur - Pepe Shows München',
    description: 'Erfahren Sie mehr über Pepe Shows - Ihre Artistenagentur aus München. Unsere Geschichte, Werte und Vision.',
    path: '/agentur',
  },
  mediamaterial: {
    title: 'Mediamaterial - Presse & Downloads',
    description: 'Laden Sie Pressefotos, Logos und Mediamaterial von Pepe Shows herunter. Hochauflösende Bilder für Ihre Berichterstattung.',
    path: '/mediamaterial',
  },
  presskit: {
    title: 'Press Kit - Pepe Shows Media',
    description: 'Download press materials, high-resolution photos, and media assets from Pepe Shows artist agency.',
    path: '/presskit',
  },
  pressemappe: {
    title: 'Pressemappe - Pepe Shows',
    description: 'Pressemappe mit allen wichtigen Informationen, Fotos und Fakten über Pepe Shows für Journalisten und Medienvertreter.',
    path: '/pressemappe',
  },
  technicalRider: {
    title: 'Technical Rider - Technische Anforderungen',
    description: 'Technische Anforderungen und Rider für Pepe Shows Auftritte. Bühnenmaße, Licht, Ton und Sicherheitsanforderungen.',
    path: '/technical-rider',
  },
  impressum: {
    title: 'Impressum',
    description: 'Impressum und rechtliche Angaben der Pepe Shows Artistenagentur, München.',
    path: '/impressum',
  },
  datenschutz: {
    title: 'Datenschutzerklärung',
    description: 'Datenschutzerklärung der Pepe Shows Artistenagentur. Informationen zum Umgang mit Ihren personenbezogenen Daten.',
    path: '/datenschutz',
  },
  agb: {
    title: 'Allgemeine Geschäftsbedingungen',
    description: 'AGB der Pepe Shows Artistenagentur München. Allgemeine Geschäftsbedingungen für Buchungen und Auftritte.',
    path: '/agb',
  },
}
