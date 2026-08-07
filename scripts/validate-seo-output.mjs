import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const SITE = 'https://copero.top'
const INFO_PAGES = ['about', 'contact', 'privacy', 'terms']
const LOCALES = [
  { id: 'es', htmlLang: 'es', hrefLang: 'es', prefix: '' },
  { id: 'en', htmlLang: 'en', hrefLang: 'en', prefix: '/en' },
  { id: 'zh-cn', htmlLang: 'zh-CN', hrefLang: 'zh-CN', prefix: '/zh-cn' },
]
const EXPECTED_SPANISH_TITLE = 'Copero Juego Online | Simulador de Carrera de Fútbol Gratis'
const EXPECTED_SPANISH_DESCRIPTION =
  'Juega Copero gratis en el navegador. Crea tu futbolista, completa el draft de 8 atributos y vive un modo carrera con clubes, fichajes, títulos y selección.'

const failures = []
const check = (label, condition) => {
  if (!condition) failures.push(label)
}

function routePath(locale, page) {
  const suffix = page === 'home' ? '/' : `/${page}`
  return locale.prefix ? `${locale.prefix}${suffix}` : suffix
}

function routeFile(locale, page) {
  const file = page === 'home' ? 'index.html' : `${page}.html`
  return locale.prefix ? join(DIST, locale.id, file) : join(DIST, file)
}

function collectStrings(value, excludedKeys = new Set()) {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap((item) => collectStrings(item, excludedKeys))
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).flatMap(([key, item]) =>
    excludedKeys.has(key) ? [] : collectStrings(item, excludedKeys),
  )
}

function latinWordCount(value) {
  const text = collectStrings(value, new Set(['seo'])).join(' ')
  return text.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+(?:['’-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+)*/g)?.length ?? 0
}

for (const locale of LOCALES) {
  const homeResource = JSON.parse(
    await readFile(join(ROOT, 'src', 'i18n', 'locales', locale.id, 'home.json'), 'utf8'),
  )
  const pagesResource = JSON.parse(
    await readFile(join(ROOT, 'src', 'i18n', 'locales', locale.id, 'pages.json'), 'utf8'),
  )
  const home = await readFile(routeFile(locale, 'home'), 'utf8')
  const game = await readFile(routeFile(locale, 'game'), 'utf8')
  const canonical = `${SITE}${routePath(locale, 'home')}`

  check(`${locale.id} html lang`, home.includes(`<html lang="${locale.htmlLang}">`))
  check(`${locale.id} localized title`, home.includes(`<title>${homeResource.seo.title}</title>`))
  check(`${locale.id} localized description`, home.includes(`content="${homeResource.seo.description}"`))
  check(`${locale.id} localized hero is present in raw HTML`, home.includes(`<h1>${homeResource.hero.title}</h1>`))
  check(`${locale.id} localized starter is present in raw HTML`, home.includes(homeResource.starter.title))
  check(`${locale.id} localized about section is present in raw HTML`, home.includes(homeResource.about.title))
  check(`${locale.id} localized career simulator section is present in raw HTML`, home.includes(homeResource.mechanics.title))
  check(`${locale.id} localized FAQ is present in raw HTML`, home.includes(homeResource.faq.title))
  check(`${locale.id} eight FAQ answers`, Object.keys(homeResource.faq.items).length === 8)
  check(`${locale.id} play-first anchor prerender`, home.includes('id="play"'))
  check(`${locale.id} starter CTA prerender`, home.includes(homeResource.starter.start))
  check(`${locale.id} prerender marker`, home.includes('data-prerendered="page"'))
  check(`${locale.id} root is not an empty SPA shell`, !home.includes('<div id="root"></div>'))
  check(`${locale.id} self canonical`, home.includes(`<link rel="canonical" href="${canonical}"`))
  check(`${locale.id} indexable`, home.includes('<meta name="robots" content="index, follow"'))
  check(`${locale.id} structured WebPage`, home.includes('"@type":"WebPage"'))
  check(`${locale.id} structured WebApplication`, home.includes('"@type":"WebApplication"'))

  for (const alternate of LOCALES) {
    const alternateUrl = `${SITE}${routePath(alternate, 'home')}`
    check(
      `${locale.id} hreflang ${alternate.hrefLang}`,
      home.includes(`<link rel="alternate" hreflang="${alternate.hrefLang}" href="${alternateUrl}"`),
    )
  }
  check(
    `${locale.id} x-default`,
    home.includes(`<link rel="alternate" hreflang="x-default" href="${SITE}/"`),
  )

  const gameCanonical = `${SITE}${routePath(locale, 'game')}`
  check(`${locale.id} game noindex`, game.includes('<meta name="robots" content="noindex, nofollow"'))
  check(`${locale.id} game canonical`, game.includes(`<link rel="canonical" href="${gameCanonical}"`))
  check(`${locale.id} game excludes hreflang`, !game.includes('hreflang='))
  check(`${locale.id} game excludes structured data`, !game.includes('copero-structured-data'))

  for (const page of INFO_PAGES) {
    const pageResource = pagesResource[page]
    const pageHtml = await readFile(routeFile(locale, page), 'utf8')
    const pageCanonical = `${SITE}${routePath(locale, page)}`

    check(`${locale.id}/${page} html lang`, pageHtml.includes(`<html lang="${locale.htmlLang}">`))
    check(`${locale.id}/${page} title`, pageHtml.includes(`<title>${pageResource.seo.title}</title>`))
    check(`${locale.id}/${page} description`, pageHtml.includes(`content="${pageResource.seo.description}"`))
    check(`${locale.id}/${page} H1 is present in raw HTML`, pageHtml.includes(`<h1>${pageResource.title}</h1>`))
    check(`${locale.id}/${page} intro is present in raw HTML`, pageHtml.includes(pageResource.intro))
    check(`${locale.id}/${page} canonical`, pageHtml.includes(`<link rel="canonical" href="${pageCanonical}"`))
    check(`${locale.id}/${page} indexable`, pageHtml.includes('<meta name="robots" content="index, follow"'))
    check(`${locale.id}/${page} structured WebPage`, pageHtml.includes('"@type":"WebPage"'))
    check(`${locale.id}/${page} excludes WebApplication`, !pageHtml.includes('"@type":"WebApplication"'))
    check(`${locale.id}/${page} prerender marker`, pageHtml.includes('data-prerendered="page"'))
    check(`${locale.id}/${page} is not an empty SPA shell`, !pageHtml.includes('<div id="root"></div>'))

    for (const alternate of LOCALES) {
      const alternateUrl = `${SITE}${routePath(alternate, page)}`
      check(
        `${locale.id}/${page} hreflang ${alternate.hrefLang}`,
        pageHtml.includes(`<link rel="alternate" hreflang="${alternate.hrefLang}" href="${alternateUrl}"`),
      )
    }
    check(
      `${locale.id}/${page} x-default`,
      pageHtml.includes(`<link rel="alternate" hreflang="x-default" href="${SITE}/${page}"`),
    )
  }

  if (locale.id === 'es') {
    const spanishWords = latinWordCount(homeResource)
    check('Spanish SEO title matches approved copy', homeResource.seo.title === EXPECTED_SPANISH_TITLE)
    check('Spanish meta description matches approved copy', homeResource.seo.description === EXPECTED_SPANISH_DESCRIPTION)
    check('Spanish H1 leads with Copero Juego', homeResource.hero.title.startsWith('Copero Juego:'))
    check('Spanish homepage copy stays within 1200–1500 words', spanishWords >= 1200 && spanishWords <= 1500)
    check('root HTML contains no Spanish /es/ canonical references', !home.includes('https://copero.top/es/'))
  }
}

const redirects = await readFile(join(DIST, '_redirects'), 'utf8')
const headers = await readFile(join(DIST, '_headers'), 'utf8')
const sitemap = await readFile(join(DIST, 'sitemap.xml'), 'utf8')
const robots = await readFile(join(DIST, 'robots.txt'), 'utf8')

check('root has no redirect', !redirects.includes('/ /es/ 301'))
check('legacy /es homepage redirects to root', redirects.includes('/es/ / 301'))
check('legacy /es game redirects to root game', redirects.includes('/es/game /game 301'))
check('robots sitemap declaration', robots.includes(`Sitemap: ${SITE}/sitemap.xml`))
check('sitemap includes canonical root', sitemap.includes(`<loc>${SITE}/</loc>`))
check('sitemap excludes legacy /es homepage', !sitemap.includes(`<loc>${SITE}/es/</loc>`))
check('sitemap excludes game routes', !sitemap.includes('/game</loc>'))

for (const locale of LOCALES) {
  check(`${locale.id} sitemap home`, sitemap.includes(`<loc>${SITE}${routePath(locale, 'home')}</loc>`))
  for (const page of INFO_PAGES) {
    check(`${locale.id} sitemap ${page}`, sitemap.includes(`<loc>${SITE}${routePath(locale, page)}</loc>`))
  }
}

check('Spanish X-Robots game', headers.includes('/game\n  X-Robots-Tag: noindex, nofollow'))
check('English X-Robots game', headers.includes('/en/game\n  X-Robots-Tag: noindex, nofollow'))
check('Chinese X-Robots game', headers.includes('/zh-cn/game\n  X-Robots-Tag: noindex, nofollow'))
check('Pages preview deployments noindex', headers.includes('https://:project.pages.dev/*'))
check('branch preview deployments noindex', headers.includes('https://:version.:project.pages.dev/*'))

if (failures.length > 0) {
  console.error(`SEO output validation failed: ${failures.join(', ')}`)
  process.exitCode = 1
} else {
  console.log('SEO output validation passed: root Spanish plus prefixed English/Chinese pages are fully prerendered.')
}
