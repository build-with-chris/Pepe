// Laeuft nach `vite build`. Schreibt fuer jede oeffentliche Seite eine eigene
// index.html mit passendem Titel, Beschreibung, Canonical und hreflang, dazu
// die sitemap.xml. Crawler ohne JavaScript (Social-Previews, KI-Bots) sehen so
// pro URL die richtigen Angaben statt immer die der Startseite.
//
// Quelle der Texte ist src/seo/pages.json, dieselbe Datei wie fuer die
// SEO-Komponente. Beim App-Start werden diese Tags entfernt (main.tsx) und von
// der SEO-Komponente neu gesetzt.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE_URL = 'https://www.pepeshows.de'
const OG_IMAGE = `${BASE_URL}/images/og-image.jpg`
const DEFAULT_TITLE = 'Pepe Shows - Artistenagentur & Show-Booking aus München'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const pages = JSON.parse(readFileSync(join(root, 'src/seo/pages.json'), 'utf8'))
const template = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const fullTitle = (page) => (page.de.title ? `${page.de.title} | Pepe Shows` : DEFAULT_TITLE)

const headFor = (page) => {
  const url = `${BASE_URL}${page.path}`
  const title = esc(fullTitle(page))
  const desc = esc(page.de.description)
  return [
    `<title data-prerender>${title}</title>`,
    `<meta data-prerender name="description" content="${desc}" />`,
    `<link data-prerender rel="canonical" href="${url}" />`,
    `<link data-prerender rel="alternate" hreflang="de" href="${url}" />`,
    `<link data-prerender rel="alternate" hreflang="en" href="${url}?lang=en" />`,
    `<link data-prerender rel="alternate" hreflang="x-default" href="${url}" />`,
    `<meta data-prerender property="og:title" content="${title}" />`,
    `<meta data-prerender property="og:description" content="${desc}" />`,
    `<meta data-prerender property="og:url" content="${url}" />`,
    `<meta data-prerender property="og:image" content="${OG_IMAGE}" />`,
    `<meta data-prerender property="og:type" content="website" />`,
    `<meta data-prerender property="og:locale" content="de_DE" />`,
    `<meta data-prerender name="twitter:title" content="${title}" />`,
    `<meta data-prerender name="twitter:description" content="${desc}" />`,
    `<meta data-prerender name="twitter:image" content="${OG_IMAGE}" />`,
  ].join('\n    ')
}

// Kurzfassung fuer Besucher und Bots ohne JavaScript, mit Links auf alle Seiten.
const noscriptFor = (page) => {
  const heading = esc(page.de.title ?? DEFAULT_TITLE)
  const links = Object.values(pages)
    .map((p) => `<li><a href="${p.path}">${esc(p.de.title ?? 'Startseite')}</a></li>`)
    .join('')
  return `<noscript><h1>${heading}</h1><p>${esc(page.de.description)}</p><nav><ul>${links}</ul></nav></noscript>`
}

const seoBlock = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/
if (!seoBlock.test(template)) {
  throw new Error('dist/index.html enthaelt keinen <!-- seo:start --> Block')
}

for (const page of Object.values(pages)) {
  const html = template
    .replace(seoBlock, headFor(page))
    .replace('<div id="root"></div>', `${noscriptFor(page)}\n    <div id="root"></div>`)
  const file = page.path === '/' ? join(dist, 'index.html') : join(dist, page.path.slice(1), 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${Object.values(pages)
  .map((p) => {
    const url = `${BASE_URL}${p.path}`
    const alternates = [
      `<xhtml:link rel="alternate" hreflang="de" href="${url}"/>`,
      `<xhtml:link rel="alternate" hreflang="en" href="${url}?lang=en"/>`,
      `<xhtml:link rel="alternate" hreflang="x-default" href="${url}"/>`,
    ]
    return [url, `${url}?lang=en`]
      .map((loc) => `  <url>\n    <loc>${loc}</loc>\n    ${alternates.join('\n    ')}\n  </url>`)
      .join('\n')
  })
  .join('\n')}
</urlset>
`
writeFileSync(join(dist, 'sitemap.xml'), sitemap)

console.log(`prerender-seo: ${Object.keys(pages).length} Seiten und sitemap.xml geschrieben`)
