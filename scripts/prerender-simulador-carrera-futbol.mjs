import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const SITE_ORIGIN = 'https://copero.top'
const SLUG = 'simulador-carrera-futbol'
const OG_IMAGE_URL = `${SITE_ORIGIN}/og.png`
const OG_IMAGE_ALT = 'Copero football career simulator'
const LOCALES = [
  { id: 'es', htmlLang: 'es', hrefLang: 'es', ogLocale: 'es_ES' },
  { id: 'en', htmlLang: 'en', hrefLang: 'en', ogLocale: 'en_US' },
  { id: 'zh-cn', htmlLang: 'zh-CN', hrefLang: 'zh-CN', ogLocale: 'zh_CN' },
  { id: 'de', htmlLang: 'de', hrefLang: 'de', ogLocale: 'de_DE' },
  { id: 'it', htmlLang: 'it', hrefLang: 'it', ogLocale: 'it_IT' },
  { id: 'pt-br', htmlLang: 'pt-BR', hrefLang: 'pt-BR', ogLocale: 'pt_BR' },
  { id: 'ko', htmlLang: 'ko', hrefLang: 'ko', ogLocale: 'ko_KR' },
]

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function pageUrl(locale) {
  return `${SITE_ORIGIN}/${locale}/${SLUG}`
}

async function loadContent(locale) {
  const path = join(ROOT, 'src', 'data', 'simulador-carrera-futbol', `${locale}.json`)
  return JSON.parse(await readFile(path, 'utf8'))
}

function renderStructuredData(locale, content) {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${SITE_ORIGIN}/#website`,
      url: SITE_ORIGIN,
      name: 'Copero',
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl(locale.id)}#webpage`,
      url: pageUrl(locale.id),
      name: content.seo.title,
      description: content.seo.description,
      inLanguage: locale.htmlLang,
      isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
    },
    {
      '@type': 'WebApplication',
      '@id': `${SITE_ORIGIN}/#game`,
      url: `${SITE_ORIGIN}/${locale.id}/game`,
      name: 'Copero',
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      inLanguage: locale.htmlLang,
      description: content.seo.description,
    },
  ]

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c')
}

function renderSeoBlock(locale, content) {
  const canonical = pageUrl(locale.id)
  const alternateLinks = [
    ...LOCALES.map(
      (candidate) => `<link rel="alternate" hreflang="${candidate.hrefLang}" href="${pageUrl(candidate.id)}" />`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${pageUrl('es')}" />`,
  ].join('\n    ')
  const ogAlternates = LOCALES.filter((candidate) => candidate.id !== locale.id)
    .map((candidate) => `<meta property="og:locale:alternate" content="${candidate.ogLocale}" />`)
    .join('\n    ')

  return `<!-- copero:seo:start -->
    <title>${escapeHtml(content.seo.title)}</title>
    <meta name="description" content="${escapeHtml(content.seo.description)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonical}" />
    ${alternateLinks}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Copero" />
    <meta property="og:locale" content="${locale.ogLocale}" />
    ${ogAlternates}
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${escapeHtml(content.seo.title)}" />
    <meta property="og:description" content="${escapeHtml(content.seo.description)}" />
    <meta property="og:image" content="${OG_IMAGE_URL}" />
    <meta property="og:image:secure_url" content="${OG_IMAGE_URL}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${OG_IMAGE_ALT}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:domain" content="copero.top" />
    <meta name="twitter:title" content="${escapeHtml(content.seo.title)}" />
    <meta name="twitter:description" content="${escapeHtml(content.seo.description)}" />
    <meta name="twitter:image" content="${OG_IMAGE_URL}" />
    <meta name="twitter:image:alt" content="${OG_IMAGE_ALT}" />
    <script id="copero-structured-data" type="application/ld+json">${renderStructuredData(locale, content)}</script>
    <!-- copero:seo:end -->`
}

function renderShell(content, locale) {
  return `<div class="marketing-page build-career-page">
    <main>
      <section class="site-section build-career-hero">
        <div class="site-container build-career-hero__grid">
          <div class="build-career-hero__copy">
            <p class="eyebrow">${escapeHtml(content.hero.eyebrow)}</p>
            <h1>${escapeHtml(content.hero.title)}</h1>
            <p class="lead">${escapeHtml(content.hero.lead)}</p>
            <div class="build-career-hero__actions">
              <a class="button button--primary" href="/${locale.id}/game">${escapeHtml(content.hero.primary)}</a>
              <a class="button button--secondary" href="#guia-simulador">${escapeHtml(content.hero.secondary)}</a>
            </div>
            <ul class="build-career-facts">${content.hero.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join('')}</ul>
          </div>
          <aside class="career-route-board" aria-label="${escapeHtml(content.route.label)}">
            <div class="career-route-board__top"><span>${escapeHtml(content.route.label)}</span><strong>${escapeHtml(content.route.live)}</strong></div>
            <div class="career-route-board__player"><span class="career-route-board__shirt">10</span><div><strong>${escapeHtml(content.route.player)}</strong><small>${escapeHtml(content.route.age)}</small></div></div>
            <ol class="career-route-board__stages">${content.route.stages.map((stage, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><div><strong>${escapeHtml(stage.title)}</strong><small>${escapeHtml(stage.detail)}</small></div></li>`).join('')}</ol>
            <p>${escapeHtml(content.route.footer)}</p>
          </aside>
        </div>
      </section>
      <section class="site-section build-career-player"><div class="site-container"><div class="final-cta build-career-final-cta"><p class="eyebrow">${escapeHtml(content.hero.eyebrow)}</p><h2>${escapeHtml(content.finalCta.title)}</h2><p class="lead">${escapeHtml(content.finalCta.body)}</p><a class="button button--primary" href="/${locale.id}/game">${escapeHtml(content.hero.primary)}</a></div></div></section>
      <section class="site-section site-section--seo-intro" id="guia-simulador"><div class="site-container seo-intro-grid"><div class="section-heading section-heading--wide"><p class="eyebrow">${escapeHtml(content.intro.eyebrow)}</p><h2>${escapeHtml(content.intro.title)}</h2></div><div class="seo-copy">${content.intro.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div></div></section>
      ${content.sections.map((section, index) => `<section class="${index % 2 === 1 ? 'site-section build-career-result-section' : 'site-section'}"><div class="site-container"><div class="section-heading section-heading--wide"><p class="eyebrow">${escapeHtml(section.eyebrow)}</p><h2>${escapeHtml(section.title)}</h2></div><div class="seo-copy">${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div></div></section>`).join('')}
      <section class="site-section" id="simulador-faq"><div class="site-container"><div class="section-heading"><p class="eyebrow">${escapeHtml(content.faq.eyebrow)}</p><h2>${escapeHtml(content.faq.title)}</h2></div><div class="build-career-faq-list">${content.faq.items.map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')}</div></div></section>
      <section class="site-section"><div class="site-container"><div class="final-cta build-career-final-cta"><p class="eyebrow">${escapeHtml(content.finalCta.eyebrow)}</p><h2>${escapeHtml(content.finalCta.title)}</h2><p class="lead">${escapeHtml(content.finalCta.body)}</p><a class="button button--primary" href="/${locale.id}/game">${escapeHtml(content.finalCta.button)}</a></div></div></section>
    </main>
  </div>`
}

function replaceSeo(template, seoBlock) {
  const marker = /<!-- copero:seo:start -->[\s\S]*?<!-- copero:seo:end -->/
  if (!marker.test(template)) throw new Error('SEO marker block missing from built index.html')
  return template.replace(marker, seoBlock)
}

function replaceRoot(template, markup) {
  const root = /<div id="root"><\/div>/
  if (!root.test(template)) throw new Error('Root element missing from built index.html')
  return template.replace(root, `<div id="root" data-prerendered="page">${markup}</div>`)
}

async function writeRoute(relativePath, html) {
  const output = join(DIST, relativePath)
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, html)
}

const template = await readFile(join(DIST, 'index.html'), 'utf8')

for (const locale of LOCALES) {
  const content = await loadContent(locale.id)
  let html = template.replace(/<html lang="[^"]*">/, `<html lang="${locale.htmlLang}">`)
  html = replaceSeo(html, renderSeoBlock(locale, content))
  html = replaceRoot(html, renderShell(content, locale))
  await writeRoute(join(locale.id, `${SLUG}.html`), html)
}

console.log('Prerendered localized simulador-carrera-futbol landing pages.')
