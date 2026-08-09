import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const SITE_ORIGIN = 'https://copero.top'
const OG_IMAGE_URL = `${SITE_ORIGIN}/og.png`
const OG_IMAGE_ALT = 'Copero football career simulator'
const INFO_PAGES = ['about', 'contact', 'privacy', 'terms']
const LOCALES = [
  { id: 'es', htmlLang: 'es', hrefLang: 'es', ogLocale: 'es_ES' },
  { id: 'en', htmlLang: 'en', hrefLang: 'en', ogLocale: 'en_US' },
  { id: 'zh-cn', htmlLang: 'zh-CN', hrefLang: 'zh-CN', ogLocale: 'zh_CN' },
  { id: 'de', htmlLang: 'de', hrefLang: 'de', ogLocale: 'de_DE' },
  { id: 'it', htmlLang: 'it', hrefLang: 'it', ogLocale: 'it_IT' },
  { id: 'pt-br', htmlLang: 'pt-BR', hrefLang: 'pt-BR', ogLocale: 'pt_BR' },
]

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

async function loadJson(locale, file) {
  const path = join(ROOT, 'src', 'i18n', 'locales', locale, file)
  return JSON.parse(await readFile(path, 'utf8'))
}

function pagePath(page) {
  if (page === 'home') return '/'
  return `/${page}`
}

function pageUrl(locale, page) {
  return `${SITE_ORIGIN}/${locale}${pagePath(page)}`
}

function renderStructuredData(locale, page, title, description) {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${SITE_ORIGIN}/#website`,
      url: pageUrl('es', 'home'),
      name: 'Copero',
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl(locale.id, page)}#webpage`,
      url: pageUrl(locale.id, page),
      name: title,
      description,
      inLanguage: locale.htmlLang,
      isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
    },
  ]

  if (page === 'home') {
    graph.push({
      '@type': 'WebApplication',
      '@id': `${SITE_ORIGIN}/#game`,
      url: pageUrl(locale.id, 'game'),
      name: 'Copero',
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      inLanguage: locale.htmlLang,
      description,
    })
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c')
}

function renderSeoBlock(locale, home, pages, page) {
  const isHome = page === 'home'
  const isGame = page === 'game'
  const title = isHome ? home.seo.title : isGame ? home.seo.ogTitle : pages[page].seo.title
  const description = isHome ? home.seo.description : isGame ? home.seo.ogDescription : pages[page].seo.description
  const canonical = pageUrl(locale.id, page)
  const robots = isGame ? 'noindex, nofollow' : 'index, follow'
  const alternateLinks = !isGame
    ? [
        ...LOCALES.map(
          (candidate) =>
            `<link rel="alternate" hreflang="${candidate.hrefLang}" href="${pageUrl(candidate.id, page)}" />`,
        ),
        `<link rel="alternate" hreflang="x-default" href="${pageUrl('es', page)}" />`,
      ].join('\n    ')
    : ''
  const ogAlternates = !isGame
    ? LOCALES.filter((candidate) => candidate.id !== locale.id)
        .map((candidate) => `<meta property="og:locale:alternate" content="${candidate.ogLocale}" />`)
        .join('\n    ')
    : ''
  const structured = !isGame
    ? `<script id="copero-structured-data" type="application/ld+json">${renderStructuredData(locale, page, title, description)}</script>`
    : ''
  const ogTitle = isHome ? home.seo.ogTitle : title
  const ogDescription = isHome ? home.seo.ogDescription : description

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
    <meta property="og:title" content="${escapeHtml(ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(ogDescription)}" />
    <meta property="og:image" content="${OG_IMAGE_URL}" />
    <meta property="og:image:secure_url" content="${OG_IMAGE_URL}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${OG_IMAGE_ALT}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:domain" content="copero.top" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${OG_IMAGE_URL}" />
    <meta name="twitter:image:alt" content="${OG_IMAGE_ALT}" />
    ${structured}
    <!-- copero:seo:end -->`
}

function renderFooter(common, locale) {
  return `<footer class="site-footer">
    <div class="site-container site-footer__inner site-footer__inner--links">
      <div class="site-footer__copy">
        <p>© 2026 copero.top · ${escapeHtml(common.footer.independent)}</p>
        <p>${escapeHtml(common.footer.disclaimer)}</p>
      </div>
      <nav class="site-footer__nav" aria-label="${escapeHtml(common.footer.navigation)}">
        ${INFO_PAGES.map((page) => `<a href="/${locale}/${page}">${escapeHtml(common.footer[page])}</a>`).join('')}
      </nav>
    </div>
  </footer>`
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

function renderHomeShell(home, common, locale) {
  const aboutParagraphs = ['one', 'two']
  const steps = ['identity', 'draft', 'origin', 'career']
  const mechanics = ['growth', 'clubs', 'events', 'national']
  const faqs = ['what', 'play', 'career', 'football', 'free', 'save', 'classic', 'official']

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
        <section class="site-section site-section--seo-intro" id="what-is-copero">
          <div class="site-container seo-intro-grid">
            <div class="section-heading section-heading--wide">
              <p class="eyebrow">${escapeHtml(home.about.eyebrow)}</p>
              <h2>${escapeHtml(home.about.title)}</h2>
            </div>
            <div class="seo-copy">
              ${aboutParagraphs.map((key) => `<p>${escapeHtml(home.about.paragraphs[key])}</p>`).join('')}
            </div>
          </div>
        </section>
        <section class="site-section" id="how-to-play">
          <div class="site-container">
            <div class="section-heading">
              <p class="eyebrow">${escapeHtml(home.howTo.eyebrow)}</p>
              <h2>${escapeHtml(home.howTo.title)}</h2>
              <p class="lead">${escapeHtml(home.howTo.body)}</p>
            </div>
            <div class="card-grid card-grid--two seo-step-grid">
              ${steps.map((key, index) => `<article class="content-card"><span class="step-number">${String(index + 1).padStart(2, '0')}</span><h3>${escapeHtml(home.howTo.steps[key].title)}</h3><p>${escapeHtml(home.howTo.steps[key].body)}</p></article>`).join('')}
            </div>
          </div>
        </section>
        <section class="site-section site-section--split" id="mechanics">
          <div class="site-container">
            <div class="section-heading section-heading--wide"><p class="eyebrow">${escapeHtml(home.modes.eyebrow)}</p><h2>${escapeHtml(home.modes.title)}</h2><p class="lead">${escapeHtml(home.modes.body)}</p></div>
            <div class="mode-grid"><article class="mode-card mode-card--accent"><h3>${escapeHtml(home.modes.classic.title)}</h3><p>${escapeHtml(home.modes.classic.body)}</p></article><article class="mode-card"><h3>${escapeHtml(home.modes.purist.title)}</h3><p>${escapeHtml(home.modes.purist.body)}</p></article></div>
            <div class="section-heading section-heading--wide section-heading--spaced"><p class="eyebrow">${escapeHtml(home.mechanics.eyebrow)}</p><h2>${escapeHtml(home.mechanics.title)}</h2><p class="lead">${escapeHtml(home.mechanics.body)}</p></div>
            <div class="card-grid card-grid--two">${mechanics.map((key) => `<article class="content-card content-card--rule"><h3>${escapeHtml(home.mechanics.items[key].title)}</h3><p>${escapeHtml(home.mechanics.items[key].body)}</p></article>`).join('')}</div>
          </div>
        </section>
        <section class="site-section"><div class="site-container result-story"><div><p class="eyebrow eyebrow--gold">${escapeHtml(home.career.eyebrow)}</p><h2>${escapeHtml(home.career.title)}</h2><p class="lead">${escapeHtml(home.career.body)}</p><a class="button button--primary" href="#play">${escapeHtml(home.career.cta)}</a></div></div></section>
        <section class="site-section" id="faq"><div class="site-container"><div class="section-heading"><p class="eyebrow">${escapeHtml(home.faq.eyebrow)}</p><h2>${escapeHtml(home.faq.title)}</h2></div><div class="faq-grid">${faqs.map((key) => `<article class="faq-card"><h3>${escapeHtml(home.faq.items[key].question)}</h3><p>${escapeHtml(home.faq.items[key].answer)}</p></article>`).join('')}</div></div></section>
        <section class="site-section"><div class="site-container"><div class="final-cta"><p class="eyebrow">${escapeHtml(home.finalCta.eyebrow)}</p><h2>${escapeHtml(home.finalCta.title)}</h2><p class="lead">${escapeHtml(home.finalCta.body)}</p><a class="button button--primary" href="#play">${escapeHtml(home.finalCta.button)}</a></div></div></section>
      </main>
      ${renderFooter(common, locale)}
    </div>`
}

function renderInfoShell(page, pages, common, locale) {
  const resource = pages[page]
  const sections = Object.values(resource.sections)
  const contactCard = page === 'contact'
    ? `<section class="site-section info-page__channel-section"><div class="site-container info-page__container"><article class="info-contact-card"><div><p class="eyebrow">GitHub</p><h2>${escapeHtml(resource.channelTitle)}</h2><p>${escapeHtml(resource.channelBody)}</p></div><a class="button button--primary" href="https://github.com/kiya0908/copero/issues">${escapeHtml(resource.channelCta)}</a></article></div></section>`
    : ''
  const updated = resource.updated ? `<p class="info-page__updated">${escapeHtml(resource.updated)}</p>` : ''

  return `<div class="marketing-page info-page">
    <main class="info-page__main">
      <section class="site-section info-page__hero"><div class="site-container info-page__container"><p class="eyebrow">${escapeHtml(resource.eyebrow)}</p><h1>${escapeHtml(resource.title)}</h1><p class="lead">${escapeHtml(resource.intro)}</p>${updated}</div></section>
      ${contactCard}
      <section class="site-section info-page__content-section"><div class="site-container info-page__container info-page__sections">${sections.map((section) => `<article class="info-section"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p></article>`).join('')}</div></section>
      <section class="site-section info-page__back-section"><div class="site-container info-page__container"><a class="button button--secondary" href="/${locale}/">← ${escapeHtml(common.actions.backHome)}</a></div></section>
    </main>
    ${renderFooter(common, locale)}
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
  const attribute = prerendered ? ' data-prerendered="page"' : ''
  return template.replace(root, `<div id="root"${attribute}>${markup}</div>`)
}

async function writeRoute(relativePath, html) {
  const output = join(DIST, relativePath)
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, html)
}

const template = await readFile(join(DIST, 'index.html'), 'utf8')

for (const locale of LOCALES) {
  const [home, pages, common] = await Promise.all([
    loadJson(locale.id, 'home.json'),
    loadJson(locale.id, 'pages.json'),
    loadJson(locale.id, 'common.json'),
  ])

  let homeHtml = template.replace(/<html lang="[^"]*">/, `<html lang="${locale.htmlLang}">`)
  homeHtml = replaceSeo(homeHtml, renderSeoBlock(locale, home, pages, 'home'))
  homeHtml = replaceRoot(homeHtml, renderHomeShell(home, common, locale.id), true)
  await writeRoute(join(locale.id, 'index.html'), homeHtml)

  let gameHtml = template.replace(/<html lang="[^"]*">/, `<html lang="${locale.htmlLang}">`)
  gameHtml = replaceSeo(gameHtml, renderSeoBlock(locale, home, pages, 'game'))
  await writeRoute(join(locale.id, 'game.html'), gameHtml)

  for (const page of INFO_PAGES) {
    let infoHtml = template.replace(/<html lang="[^"]*">/, `<html lang="${locale.htmlLang}">`)
    infoHtml = replaceSeo(infoHtml, renderSeoBlock(locale, home, pages, page))
    infoHtml = replaceRoot(infoHtml, renderInfoShell(page, pages, common, locale.id), true)
    await writeRoute(join(locale.id, `${page}.html`), infoHtml)
  }
}

console.log('Prerendered localized home, info/legal pages and noindex game entry pages.')
