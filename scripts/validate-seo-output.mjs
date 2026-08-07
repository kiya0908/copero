import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const SITE = 'https://copero.top'
const LOCALES = [
  { id: 'es', htmlLang: 'es', hrefLang: 'es' },
  { id: 'en', htmlLang: 'en', hrefLang: 'en' },
  { id: 'zh-cn', htmlLang: 'zh-CN', hrefLang: 'zh-CN' },
]

const failures = []
const check = (label, condition) => {
  if (!condition) failures.push(label)
}

for (const locale of LOCALES) {
  const homeResource = JSON.parse(
    await readFile(join(ROOT, 'src', 'i18n', 'locales', locale.id, 'home.json'), 'utf8'),
  )
  const home = await readFile(join(DIST, locale.id, 'index.html'), 'utf8')
  const game = await readFile(join(DIST, locale.id, 'game.html'), 'utf8')
  const canonical = `${SITE}/${locale.id}/`

  check(`${locale.id} html lang`, home.includes(`<html lang="${locale.htmlLang}">`))
  check(`${locale.id} localized title`, home.includes(`<title>${homeResource.seo.title}</title>`))
  check(`${locale.id} localized hero prerender`, home.includes(homeResource.hero.title))
  check(`${locale.id} prerender marker`, home.includes('data-prerendered="home"'))
  check(`${locale.id} self canonical`, home.includes(`<link rel="canonical" href="${canonical}"`))
  check(`${locale.id} indexable`, home.includes('<meta name="robots" content="index, follow"'))
  check(`${locale.id} structured WebPage`, home.includes('"@type":"WebPage"'))
  check(`${locale.id} structured WebApplication`, home.includes('"@type":"WebApplication"'))

  for (const alternate of LOCALES) {
    check(
      `${locale.id} hreflang ${alternate.hrefLang}`,
      home.includes(
        `<link rel="alternate" hreflang="${alternate.hrefLang}" href="${SITE}/${alternate.id}/"`,
      ),
    )
  }
  check(
    `${locale.id} x-default`,
    home.includes(`<link rel="alternate" hreflang="x-default" href="${SITE}/es/"`),
  )

  check(`${locale.id} game noindex`, game.includes('<meta name="robots" content="noindex, nofollow"'))
  check(
    `${locale.id} game canonical`,
    game.includes(`<link rel="canonical" href="${SITE}/${locale.id}/game"`),
  )
  check(`${locale.id} game excludes hreflang`, !game.includes('hreflang='))
  check(`${locale.id} game excludes structured data`, !game.includes('copero-structured-data'))
}

const fallback = await readFile(join(DIST, 'index.html'), 'utf8')
const redirects = await readFile(join(DIST, '_redirects'), 'utf8')
const headers = await readFile(join(DIST, '_headers'), 'utf8')
const sitemap = await readFile(join(DIST, 'sitemap.xml'), 'utf8')
const robots = await readFile(join(DIST, 'robots.txt'), 'utf8')

check('fallback root noindex', fallback.includes('<meta name="robots" content="noindex, follow"'))
check('root permanent redirect', redirects.includes('/ /es/ 301'))
check('legacy game permanent redirect', redirects.includes('/game /es/game 301'))
check('robots sitemap declaration', robots.includes(`Sitemap: ${SITE}/sitemap.xml`))
check('sitemap excludes redirect root', !sitemap.includes(`<loc>${SITE}/</loc>`))
check('sitemap excludes game routes', !sitemap.includes('/game</loc>'))

for (const locale of LOCALES) {
  check(`${locale.id} sitemap home`, sitemap.includes(`<loc>${SITE}/${locale.id}/</loc>`))
  check(`${locale.id} X-Robots game`, headers.includes(`/${locale.id}/game\n  X-Robots-Tag: noindex, nofollow`))
}

check('Pages preview deployments noindex', headers.includes('https://:project.pages.dev/*'))
check('branch preview deployments noindex', headers.includes('https://:version.:project.pages.dev/*'))

if (failures.length > 0) {
  console.error(`SEO output validation failed: ${failures.join(', ')}`)
  process.exitCode = 1
} else {
  console.log(`SEO output validation passed (${LOCALES.length} localized route sets).`)
}
