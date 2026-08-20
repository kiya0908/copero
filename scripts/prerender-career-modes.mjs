import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const SITE = 'https://copero.top'
const LOCALES = [
  { id: 'es', htmlLang: 'es', hrefLang: 'es', og: 'es_ES' },
  { id: 'en', htmlLang: 'en', hrefLang: 'en', og: 'en_US' },
  { id: 'zh-cn', htmlLang: 'zh-CN', hrefLang: 'zh-CN', og: 'zh_CN' },
  { id: 'de', htmlLang: 'de', hrefLang: 'de', og: 'de_DE' },
  { id: 'it', htmlLang: 'it', hrefLang: 'it', og: 'it_IT' },
  { id: 'pt-br', htmlLang: 'pt-BR', hrefLang: 'pt-BR', og: 'pt_BR' },
  { id: 'ko', htmlLang: 'ko', hrefLang: 'ko', og: 'ko_KR' },
]
const MODES = [
  { id: 'full', slug: 'carrera-completa' },
  { id: 'quick', slug: 'carrera-rapida' },
]
const GUIDE_SECTION_INDEXES = {
  es: { full: [0, 2], quick: [1, 3, 5] }, en: { full: [0, 2], quick: [1, 3] }, 'zh-cn': { full: [0, 2], quick: [1, 3] },
  de: { full: [0, 2, 4], quick: [1, 3, 5] }, it: { full: [0, 2, 4], quick: [1, 3, 5] }, 'pt-br': { full: [0, 2, 4], quick: [1, 3, 5] },
  ko: { full: [0, 2, 4, 6], quick: [1, 3, 5, 7] },
}
const MODE_VISUALS = {
  full: [
    { src: '/media/minigames/career-simulator/header2.jpg', width: 1200, height: 675 },
    { src: '/career-simulator/career-events/position_competition-compete.jpg', width: 434, height: 365 },
    { src: '/career-simulator/career-events/personal_coach-accept.jpg', width: 514, height: 300 },
    { src: '/career-simulator/career-events/finish_high_school-accept.jpg', width: 369, height: 360 },
  ],
  quick: [
    { src: '/career-simulator/career-events/training_extra-accept.jpg', width: 521, height: 343 },
    { src: '/career-simulator/career-events/season_load-accept.jpg', width: 585, height: 370 },
    { src: '/career-simulator/career-events/retirement.jpg', width: 512, height: 338 },
    { src: '/career-simulator/career-events/injury-continue.jpg', width: 720, height: 342 },
  ],
}

const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')
const pageUrl = (locale, slug) => `${SITE}/${locale}/${slug}`

function structuredData(locale, slug, content) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: SITE, name: 'Copero' },
    { '@type': 'WebPage', '@id': `${pageUrl(locale.id, slug)}#webpage`, url: pageUrl(locale.id, slug), name: content.seo.title, description: content.seo.description, inLanguage: locale.htmlLang, isPartOf: { '@id': `${SITE}/#website` } },
    { '@type': 'WebApplication', '@id': `${SITE}/#game`, url: `${SITE}/${locale.id}/game`, name: 'Copero', applicationCategory: 'GameApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript', isAccessibleForFree: true, inLanguage: locale.htmlLang, description: content.seo.description },
  ] }).replaceAll('<', '\\u003c')
}

function seo(locale, slug, content) {
  const canonical = pageUrl(locale.id, slug)
  const alternates = [...LOCALES.map((item) => `<link rel="alternate" hreflang="${item.hrefLang}" href="${pageUrl(item.id, slug)}" />`), `<link rel="alternate" hreflang="x-default" href="${pageUrl('es', slug)}" />`].join('\n    ')
  return `<!-- copero:seo:start -->
    <title>${escapeHtml(content.seo.title)}</title>
    <meta name="description" content="${escapeHtml(content.seo.description)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonical}" />
    ${alternates}
    <meta property="og:type" content="website" /><meta property="og:site_name" content="Copero" /><meta property="og:locale" content="${locale.og}" />
    <meta property="og:url" content="${canonical}" /><meta property="og:title" content="${escapeHtml(content.seo.title)}" /><meta property="og:description" content="${escapeHtml(content.seo.description)}" />
    <meta property="og:image" content="${SITE}/og.png" /><meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${escapeHtml(content.seo.title)}" /><meta name="twitter:description" content="${escapeHtml(content.seo.description)}" /><meta name="twitter:image" content="${SITE}/og.png" />
    <script id="copero-structured-data" type="application/ld+json">${structuredData(locale, slug, content)}</script>
    <!-- copero:seo:end -->`
}

function shell(locale, mode, content, alternateContent) {
  const game = `/${locale.id}/game`
  const alternate = `/${locale.id}/${mode.id === 'full' ? 'carrera-rapida' : 'carrera-completa'}`
  return `<div class="marketing-page build-career-page career-mode-page career-mode-page--${mode.id}"><main>
    <section class="site-section build-career-hero"><div class="site-container build-career-hero__grid"><div class="build-career-hero__copy"><p class="eyebrow">${escapeHtml(content.hero.eyebrow)}</p><h1>${escapeHtml(content.hero.title)}</h1><p class="lead">${escapeHtml(content.hero.lead)}</p><a class="button button--primary" href="${game}">${escapeHtml(content.hero.primary)}</a><ul class="build-career-facts">${content.hero.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join('')}</ul></div><aside class="career-mode-board"><span>${mode.id === 'full' ? '01' : '03'}</span><strong>${mode.id === 'full' ? 'SEASON' : 'SEASONS'}</strong></aside></div></section>
    <section class="site-section site-section--seo-intro"><div class="site-container seo-intro-grid"><div class="section-heading"><h2>${escapeHtml(content.intro.title)}</h2></div><div class="seo-copy">${content.intro.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</div></div></section>
    ${content.sections.map((section, index) => `<section class="site-section${index % 2 ? ' build-career-result-section' : ''}"><div class="site-container career-mode-content-grid${section.visual ? ' career-mode-content-grid--visual' : ''}"><div class="section-heading"><h2>${escapeHtml(section.title)}</h2></div><div class="seo-copy">${section.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</div>${section.visual ? `<figure class="career-mode-figure"><img src="${section.visual.src}" alt="${escapeHtml(section.title)}" width="${section.visual.width}" height="${section.visual.height}" loading="lazy" decoding="async" /><figcaption>${escapeHtml(section.title)}</figcaption></figure>` : ''}</div></section>`).join('')}
    <section class="site-section"><div class="site-container"><div class="section-heading"><h2>${escapeHtml(content.faq.title)}</h2></div><div class="build-career-faq-list">${content.faq.items.map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')}</div></div></section>
    <section class="site-section"><div class="site-container"><div class="final-cta"><h2>${escapeHtml(content.finalCta.title)}</h2><p>${escapeHtml(content.finalCta.body)}</p><a class="button button--primary" href="${game}">${escapeHtml(content.finalCta.button)}</a><a class="button button--secondary" href="${alternate}">${escapeHtml(alternateContent.hero.title)}</a></div></div></section>
  </main></div>`
}

const template = await readFile(join(DIST, 'index.html'), 'utf8')
for (const locale of LOCALES) {
  const resource = JSON.parse(await readFile(join(ROOT, 'src', 'data', 'career-modes', `${locale.id}.json`), 'utf8'))
  const simulator = JSON.parse(await readFile(join(ROOT, 'src', 'data', 'simulador-carrera-futbol', `${locale.id}.json`), 'utf8'))
  for (const mode of MODES) {
    const guideSections = GUIDE_SECTION_INDEXES[locale.id][mode.id].map((sectionIndex, visualIndex) => ({ ...simulator.sections[sectionIndex], visual: MODE_VISUALS[mode.id][visualIndex] }))
    const content = { ...resource[mode.id], sections: [...resource[mode.id].sections, ...guideSections] }
    let html = template.replace(/<html lang="[^"]*">/, `<html lang="${locale.htmlLang}">`)
    html = html.replace(/<!-- copero:seo:start -->[\s\S]*?<!-- copero:seo:end -->/, seo(locale, mode.slug, content))
    html = html.replace('<div id="root"></div>', `<div id="root" data-prerendered="page">${shell(locale, mode, content, resource[mode.id === 'full' ? 'quick' : 'full'])}</div>`)
    const output = join(DIST, locale.id, `${mode.slug}.html`)
    await mkdir(dirname(output), { recursive: true })
    await writeFile(output, html)
  }
}
console.log('Prerendered fourteen localized full and quick career pages.')
