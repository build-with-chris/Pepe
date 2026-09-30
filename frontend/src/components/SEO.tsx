import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import pages from '@/seo/pages.json'

// Muss zur Live-Domain passen. Dieselbe Angabe steht in scripts/prerender-seo.mjs.
export const BASE_URL = 'https://www.pepeshows.de'

type Lang = 'de' | 'en'
type PageKey = keyof typeof pages

interface SEOProps {
  /** Eintrag aus src/seo/pages.json; liefert Titel, Beschreibung und Pfad je Sprache */
  page?: PageKey
  title?: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'article'
  noindex?: boolean
}

const defaultMeta = {
  title: 'Pepe Shows - Artistenagentur & Show-Booking aus München',
  description: pages.home.de.description,
  image: `${BASE_URL}/images/og-image.jpg`,
}

export default function SEO({
  page,
  title,
  description,
  path,
  image = defaultMeta.image,
  type = 'website',
  noindex = false,
}: SEOProps) {
  const { i18n } = useTranslation()
  const lang: Lang = i18n.language?.startsWith('en') ? 'en' : 'de'

  const entry = page ? pages[page] : undefined
  const texts = entry ? (entry[lang] as { title?: string; description: string }) : undefined
  const pageTitle = title ?? texts?.title
  const fullTitle = pageTitle ? `${pageTitle} | Pepe Shows` : defaultMeta.title
  const fullDescription = description ?? texts?.description ?? defaultMeta.description
  const pagePath = path ?? entry?.path

  // Die URL ist die Quelle der Sprache: ohne ?lang=en ist die Seite deutsch.
  const deUrl = pagePath ? `${BASE_URL}${pagePath}` : undefined
  const enUrl = pagePath ? `${BASE_URL}${pagePath}?lang=en` : undefined
  const canonical = lang === 'en' ? enUrl : deUrl

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {canonical && !noindex && <link rel="canonical" href={canonical} />}
      {deUrl && !noindex && <link rel="alternate" hrefLang="de" href={deUrl} />}
      {enUrl && !noindex && <link rel="alternate" hrefLang="en" href={enUrl} />}
      {deUrl && !noindex && <link rel="alternate" hrefLang="x-default" href={deUrl} />}
      {noindex && <meta name="robots" content="noindex, follow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={lang === 'en' ? 'en_US' : 'de_DE'} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}

// Kurzform fuer die oeffentlichen Seiten: <SEO {...pageSEO.kuenstler} />
export const pageSEO = Object.fromEntries(
  (Object.keys(pages) as PageKey[]).map((key) => [key, { page: key }]),
) as Record<PageKey, { page: PageKey }>
