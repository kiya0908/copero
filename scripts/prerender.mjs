import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const SITE_ORIGIN = 'https://copero.top'
const LOCALES = [
  { id: 'es', htmlLang: 'es', hrefLang: 'es', ogLocale: 'es_ES' },
  { id: 'en', htmlLang: 'en', hrefLang: 'en', ogLocale: 'en_US' },
  { id: 'zh-cn', htmlLang: 'zh-CN', hrefLang: 'zh-CN', ogLocale: 'zh_CN' },
]

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

async function loadHome(locale) {
  const file = join(ROOT, 'src', 'i18n', 'locales', locale, 'home.json')
  return JSON.parse(await readFile(file, 'utf8'))
}

function homeUrl(locale) {
  return `${SITE_ORIGIN}/${locale}/`
}

function gameUrl(locale) {
  return `${SITE_ORIGIN}/${locale}/game`
}

function renderStructuredData(locale, home) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        url: homeUrl('es'),
        name: 'Copero',
      },
      {
        '@type': 'WebPage',
        '@id': `${homeUrl(locale.id)}#webpage`,
        url: homeUrl(locale.id),
        name: home.seo.title,
        description: home.seo.description,
        inLanguage: locale.htmlLang,
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_ORIGIN}/#game`,
        url: gameUrl(locale.id),
        name: 'Copero',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true,
        inLanguage: locale.htmlLang,
        description: home.seo.description,
      },
    ],
  }).replaceAll('<', '\\u003c')
}

function renderSeoBlock(locale, home, page) {
  const isHome = page === 'home'
  const canonical = isHome ? homeUrl(locale.id) : gameUrl(locale.id)
  const title = isHome ? home.seo.title : home.seo.ogTitle
  const description = isHome ? home.seo.description : home.seo.ogDescription
  const robots = isHome ? 'index, follow' : 'noindex, nofollow'
  const alternateLinks = isHome
    ? [
        ...LOCALES.map(
          (candidate) =>
            `<link rel="alternate" hreflang="${candidate.hrefLang}" href="${homeUrl(candidate.id)}" />`,
        ),
        `<link rel="alternate" hreflang="x-default" href="${homeUrl('es')}" />`,
      ].join('\n    ')
    : ''
  const ogAlternates = isHome
    ? LOCALES.filter((candidate) => candidate.id !== locale.id)
        .map((candidate) => `<meta property="og:locale:alternate" content="${candidate.ogLocale}" />`)
        .join('\n    ')
    : ''
  const structured = isHome
    ? `<script id="copero-structured-data" type="application/ld+json">${renderStructuredData(locale, home)}</script>`
    : ''

  return `<!-- copero:seo:start -->
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${canonical}" />
    ${alternateLinks}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Copero" />
    <meta property="og:locale" content="${locale.ogLocale}" />
    ${ogAlternates}
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${escapeHtml(isHome ? home.seo.ogTitle : title)}" />
    <meta property="og:description" content="${escapeHtml(isHome ? home.seo.ogDescription : description)}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:domain" content="copero.top" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${structured}
    <!-- copero:seo:end -->`
}

function renderStarterShell(home, locale) {
  return `<article class="career-starter" aria-labelledby="career-starter-title">
    <div class="career-starter__header">
      <div>
        <p class="career-starter__eyebrow">${escapeHtml(home.starter.eyebrow)}</p>
        <h2 id="career-starter-title">${escapeHtml(home.starter.title)}</h2>
        <p>${escapeHtml(home.starter.body)}</p>
      </div>
    </div>
    <div class="career-starter__body">
      <div class="career-starter__form">
        <div class="career-starter__row career-starter__row--identity">
          <label class="career-starter__field"><span>${escapeHtml(home.starter.lastName)}</span><input disabled placeholder="${escapeHtml(home.starter.lastNamePlaceholder)}" /></label>
          <label class="career-starter__field career-starter__field--number"><span>${escapeHtml(home.starter.number)}</span><input disabled value="10" /></label>
        </div>
        <fieldset class="career-starter__fieldset"><legend>${escapeHtml(home.starter.foot)}</legend><div class="career-starter__segmented"><button class="career-starter__segment" disabled>${escapeHtml(home.starter.left)}</button><button class="career-starter__segment" disabled aria-pressed="true">${escapeHtml(home.starter.right)}</button></div></fieldset>
        <div class="career-starter__row">
          <label class="career-starter__field"><span>${escapeHtml(home.starter.nationality)}</span><select disabled><option>${escapeHtml(home.starter.nationality)}</option></select></label>
          <label class="career-starter__field"><span>${escapeHtml(home.starter.position)}</span><select disabled><option>ST</option></select></label>
        </div>
        <fieldset class="career-starter__fieldset"><legend>${escapeHtml(home.starter.draftMode)}</legend><div class="career-starter__modes"><button class="career-starter__mode" disabled aria-pressed="true"><strong>${escapeHtml(home.modes.classic.title)}</strong><span>${escapeHtml(home.starter.classicHint)}</span></button><button class="career-starter__mode" disabled><strong>${escapeHtml(home.modes.purist.title)}</strong><span>${escapeHtml(home.starter.puristHint)}</span></button></div></fieldset>
        <a class="career-starter__start" href="/${locale}/game"><span>${escapeHtml(home.starter.start)}</span><span aria-hidden="true">→</span></a>
        <p class="career-starter__microcopy">${escapeHtml(home.starter.microcopy)}</p>
      </div>
    </div>
  </article>`
}

function renderHomeShell(home, locale) {
  const steps = ['identity', 'draft', 'origin', 'career']
  const mechanics = ['growth', 'clubs', 'events', 'national']
  const faqs = ['free', 'save', 'classic', 'official']

  return `<div class="marketing-page">
      <main>
        <section class="site-section site-section--hero" id="play">
          <div class="site-container play-first-hero">
            <div class="hero-copy">
              <p class="eyebrow">${escapeHtml(home.hero.eyebrow)}</p>
              <h1>${escapeHtml(home.hero.title)}</h1>
              <p class="lead">${escapeHtml(home.hero.body)}</p>
              <div class="tag-list">
                <span class="tag">${escapeHtml(home.hero.tags.browser)}</span>
                <span class="tag">${escapeHtml(home.hero.tags.draft)}</span>
                <span class="tag">${escapeHtml(home.hero.tags.career)}</span>
                <span class="tag">${escapeHtml(home.hero.tags.save)}</span>
              </div>
              <a class="play-first-hero__how" href="#how-to-play">${escapeHtml(home.hero.secondary)} ↓</a>
            </div>
            ${renderStarterShell(home, locale)}
          </div>
        </section>
        <section class="site-section" id="how-to-play">
          <div class="site-container">
            <div class="section-heading">
              <p class="eyebrow">${escapeHtml(home.howTo.eyebrow)}</p>
              <h2>${escapeHtml(home.howTo.title)}</h2>
              <p class="lead">${escapeHtml(home.howTo.body)}</p>
            </div>
            <div class="card-grid card-grid--four">
              ${steps
                .map(
                  (key, index) => `<article class="content-card">
                  <span class="step-number">${String(index + 1).padStart(2, '0')}</span>
                  <h3>${escapeHtml(home.howTo.steps[key].title)}</h3>
                  <p>${escapeHtml(home.howTo.steps[key].body)}</p>
                </article>`,
                )
                .join('')}
            </div>
          </div>
        </section>
        <section class="site-section site-section--split" id="mechanics">
          <div class="site-container">
            <div class="section-heading section-heading--wide">
              <p class="eyebrow">${escapeHtml(home.modes.eyebrow)}</p>
              <h2>${escapeHtml(home.modes.title)}</h2>
              <p class="lead">${escapeHtml(home.modes.body)}</p>
            </div>
            <div class="mode-grid">
              <article class="mode-card mode-card--accent"><h3>${escapeHtml(home.modes.classic.title)}</h3><p>${escapeHtml(home.modes.classic.body)}</p></article>
              <article class="mode-card"><h3>${escapeHtml(home.modes.purist.title)}</h3><p>${escapeHtml(home.modes.purist.body)}</p></article>
            </div>
            <div class="section-heading section-heading--wide section-heading--spaced">
              <p class="eyebrow">${escapeHtml(home.mechanics.eyebrow)}</p>
              <h2>${escapeHtml(home.mechanics.title)}</h2>
              <p class="lead">${escapeHtml(home.mechanics.body)}</p>
            </div>
            <div class="card-grid card-grid--two">
              ${mechanics
                .map(
                  (key) => `<article class="content-card content-card--rule"><h3>${escapeHtml(home.mechanics.items[key].title)}</h3><p>${escapeHtml(home.mechanics.items[key].body)}</p></article>`,
                )
                .join('')}
            </div>
          </div>
        </section>
        <section class="site-section">
          <div class="site-container result-story">
            <div>
              <p class="eyebrow eyebrow--gold">${escapeHtml(home.career.eyebrow)}</p>
              <h2>${escapeHtml(home.career.title)}</h2>
              <p class="lead">${escapeHtml(home.career.body)}</p>
              <a class="button button--primary" href="#play">${escapeHtml(home.career.cta)}</a>
            </div>
          </div>
        </section>
        <section class="site-section" id="faq">
          <div class="site-container">
            <div class="section-heading"><p class="eyebrow">${escapeHtml(home.faq.eyebrow)}</p><h2>${escapeHtml(home.faq.title)}</h2></div>
            <div class="faq-grid">
              ${faqs
                .map(
                  (key) => `<article class="faq-card"><h3>${escapeHtml(home.faq.items[key].question)}</h3><p>${escapeHtml(home.faq.items[key].answer)}</p></article>`,
                )
                .join('')}
            </div>
          </div>
        </section>
        <section class="site-section">
          <div class="site-container"><div class="final-cta"><p class="eyebrow">${escapeHtml(home.finalCta.eyebrow)}</p><h2>${escapeHtml(home.finalCta.title)}</h2><p class="lead">${escapeHtml(home.finalCta.body)}</p><a class="button button--primary" href="#play">${escapeHtml(home.finalCta.button)}</a></div></div>
        </section>
      </main>
    </div>`
}

function replaceSeo(template, seoBlock) {
  const marker = /<!-- copero:seo:start -->[\s\S]*?<!-- copero:seo:end -->/
  if (!marker.test(template)) throw new Error('SEO marker block missing from built index.html')
  return template.replace(marker, seoBlock)
}

function replaceRoot(template, markup, prerendered = false) {
  const root = /<div id="root"><\/div>/
  if (!root.test(template)) throw new Error('Root element missing from built index.html')
  const attribute = prerendered ? ' data-prerendered="home"' : ''
  return template.replace(root, `<div id="root"${attribute}>${markup}</div>`)
}

async function writeRoute(relativePath, html) {
  const output = join(DIST, relativePath)
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, html)
}

const template = await readFile(join(DIST, 'index.html'), 'utf8')

for (const locale of LOCALES) {
  const home = await loadHome(locale.id)

  let homeHtml = template.replace(/<html lang="[^"]*">/, `<html lang="${locale.htmlLang}">`)
  homeHtml = replaceSeo(homeHtml, renderSeoBlock(locale, home, 'home'))
  homeHtml = replaceRoot(homeHtml, renderHomeShell(home, locale.id), true)
  await writeRoute(join(locale.id, 'index.html'), homeHtml)

  let gameHtml = template.replace(/<html lang="[^"]*">/, `<html lang="${locale.htmlLang}">`)
  gameHtml = replaceSeo(gameHtml, renderSeoBlock(locale, home, 'game'))
  await writeRoute(join(locale.id, 'game.html'), gameHtml)
}

console.log('Prerendered localized play-first home and noindex game entry pages.')
