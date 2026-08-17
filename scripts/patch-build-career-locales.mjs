import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const SITE = 'https://copero.top'
const SLUG = 'copero-build-your-own-football-career'
const LOCALES = [
  { id: 'es', htmlLang: 'es', hrefLang: 'es', ogLocale: 'es_ES', prefix: '' },
  { id: 'en', htmlLang: 'en', hrefLang: 'en', ogLocale: 'en_US', prefix: '/en' },
  { id: 'zh-cn', htmlLang: 'zh-CN', hrefLang: 'zh-CN', ogLocale: 'zh_CN', prefix: '/zh-cn' },
  { id: 'de', htmlLang: 'de', hrefLang: 'de', ogLocale: 'de_DE', prefix: '/de' },
  { id: 'it', htmlLang: 'it', hrefLang: 'it', ogLocale: 'it_IT', prefix: '/it' },
  { id: 'pt-br', htmlLang: 'pt-BR', hrefLang: 'pt-BR', ogLocale: 'pt_BR', prefix: '/pt-br' },
  { id: 'ko', htmlLang: 'ko', hrefLang: 'ko', ogLocale: 'ko_KR', prefix: '/ko' },
]

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function route(locale) {
  return `${locale.prefix}/${SLUG}`
}

function absolute(locale) {
  return `${SITE}${route(locale)}`
}

async function loadContent(locale) {
  const file = locale.id === 'en'
    ? join(ROOT, 'src', 'data', 'build-career-page.json')
    : join(ROOT, 'src', 'data', 'build-career', `${locale.id}.json`)
  return JSON.parse(await readFile(file, 'utf8'))
}

function seoBlock(locale, content) {
  const canonical = absolute(locale)
  const alternates = LOCALES.map(
    (candidate) => `<link rel="alternate" hreflang="${candidate.hrefLang}" href="${absolute(candidate)}" />`,
  ).join('\n    ')
  const ogAlternates = LOCALES.filter((candidate) => candidate.id !== locale.id)
    .map((candidate) => `<meta property="og:locale:alternate" content="${candidate.ogLocale}" />`)
    .join('\n    ')
  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: `${SITE}/`,
        name: 'Copero',
      },
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: content.seo.title,
        description: content.seo.description,
        inLanguage: locale.htmlLang,
        isPartOf: { '@id': `${SITE}/#website` },
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE}/#game`,
        url: `${SITE}${locale.prefix}/game`,
        name: 'Copero',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true,
        inLanguage: locale.htmlLang,
        description: content.seo.description,
      },
    ],
  }).replaceAll('<', '\\u003c')

  return `<!-- copero:seo:start -->
    <title>${escapeHtml(content.seo.title)}</title>
    <meta name="description" content="${escapeHtml(content.seo.description)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonical}" />
    ${alternates}
    <link rel="alternate" hreflang="x-default" href="${absolute(LOCALES[0])}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Copero" />
    <meta property="og:locale" content="${locale.ogLocale}" />
    ${ogAlternates}
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${escapeHtml(content.seo.title)}" />
    <meta property="og:description" content="${escapeHtml(content.seo.description)}" />
    <meta property="og:image" content="${SITE}/og.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(content.seo.title)}" />
    <meta name="twitter:description" content="${escapeHtml(content.seo.description)}" />
    <meta name="twitter:image" content="${SITE}/og.png" />
    <script id="copero-structured-data" type="application/ld+json">${structuredData}</script>
    <!-- copero:seo:end -->`
}

function pageShell(content) {
  return `<div class="marketing-page build-career-page">
    <main>
      <section class="site-section build-career-hero">
        <div class="site-container">
          <p class="eyebrow">${escapeHtml(content.hero.eyebrow)}</p>
          <h1>${escapeHtml(content.hero.title)}</h1>
          <p class="lead">${escapeHtml(content.hero.lead)}</p>
          <a class="button button--primary" href="#build-player">${escapeHtml(content.hero.primary)}</a>
          <ul>${content.hero.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join('')}</ul>
        </div>
      </section>
      <section class="site-section" id="build-player"><div class="site-container"><h2>${escapeHtml(content.intro.title)}</h2>${content.intro.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div></section>
      <section class="site-section" id="career-steps"><div class="site-container"><p class="eyebrow">${escapeHtml(content.stages.eyebrow)}</p><h2>${escapeHtml(content.stages.title)}</h2><p>${escapeHtml(content.stages.body)}</p>${content.stages.items.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`).join('')}</div></section>
      <section class="site-section"><div class="site-container"><p class="eyebrow">${escapeHtml(content.draft.eyebrow)}</p><h2>${escapeHtml(content.draft.title)}</h2><p>${escapeHtml(content.draft.body)}</p>${content.draft.modes.map((mode) => `<article><h3>${escapeHtml(mode.name)}</h3><p>${escapeHtml(mode.body)}</p></article>`).join('')}</div></section>
      <section class="site-section"><div class="site-container"><p class="eyebrow">${escapeHtml(content.decisions.eyebrow)}</p><h2>${escapeHtml(content.decisions.title)}</h2>${content.decisions.items.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`).join('')}</div></section>
      <section class="site-section"><div class="site-container"><p class="eyebrow">${escapeHtml(content.result.eyebrow)}</p><h2>${escapeHtml(content.result.title)}</h2><p>${escapeHtml(content.result.body)}</p></div></section>
      <section class="site-section" id="build-career-faq"><div class="site-container"><p class="eyebrow">${escapeHtml(content.faq.eyebrow)}</p><h2>${escapeHtml(content.faq.title)}</h2>${content.faq.items.map((item) => `<article><h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p></article>`).join('')}</div></section>
      <section class="site-section"><div class="site-container"><h2>${escapeHtml(content.finalCta.title)}</h2><p>${escapeHtml(content.finalCta.body)}</p></div></section>
    </main>
  </div>`
}

function replaceSeo(template, block) {
  const marker = /<!-- copero:seo:start -->[\s\S]*?<!-- copero:seo:end -->/
  if (!marker.test(template)) throw new Error('SEO marker block missing from built index.html')
  return template.replace(marker, block)
}

function replaceRoot(template, markup) {
  const root = /<div id="root"><\/div>/
  if (!root.test(template)) throw new Error('Root element missing from built index.html')
  return template.replace(root, `<div id="root" data-prerendered="page">${markup}</div>`)
}

async function write(relativePath, html) {
  const output = join(DIST, relativePath)
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, html)
}

const template = await readFile(join(DIST, 'index.html'), 'utf8')

for (const locale of LOCALES) {
  const content = await loadContent(locale)
  let html = template.replace(/<html lang="[^"]*">/, `<html lang="${locale.htmlLang}">`)
  html = replaceSeo(html, seoBlock(locale, content))
  html = replaceRoot(html, pageShell(content))

  const relativePath = locale.prefix
    ? join(locale.id, `${SLUG}.html`)
    : `${SLUG}.html`
  await write(relativePath, html)

  if (locale.id === 'es') {
    await write(join('es', `${SLUG}.html`), html)
  }
}

console.log('Prerendered seven localized build-career landing pages with canonical and hreflang coverage.')
