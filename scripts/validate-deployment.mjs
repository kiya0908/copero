const rawBase = process.env.COPERO_DEPLOYMENT_URL || process.argv[2]
if (!rawBase) {
  console.error('Usage: COPERO_DEPLOYMENT_URL=https://copero.top npm run validate:deployment')
  process.exit(1)
}

const base = rawBase.replace(/\/$/, '')
const infoPages = ['about', 'contact', 'privacy', 'terms']
const locales = [
  ['es', 'es'],
  ['en', 'en'],
  ['zh-cn', 'zh-CN'],
]

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function request(path, options = {}) {
  return fetch(`${base}${path}`, {
    redirect: 'manual',
    headers: { 'user-agent': 'CoperoReleaseValidator/1.0' },
    ...options,
  })
}

async function html(path) {
  const response = await request(path)
  const body = await response.text()
  return { response, body }
}

const root = await request('/')
assert(root.status === 301, `/ must return 301, received ${root.status}`)
assert(root.headers.get('location')?.endsWith('/es/'), '/ must redirect to /es/')

const legacyGame = await request('/game')
assert(legacyGame.status === 301, `/game must return 301, received ${legacyGame.status}`)
assert(legacyGame.headers.get('location')?.endsWith('/es/game'), '/game must redirect to /es/game')

for (const [locale, htmlLang] of locales) {
  const homePath = `/${locale}/`
  const canonical = `https://copero.top${homePath}`
  const { response, body } = await html(homePath)

  assert(response.status === 200, `${homePath} must return 200`)
  assert(body.includes(`<html lang="${htmlLang}"`), `${homePath} must expose html lang ${htmlLang}`)
  assert(body.includes(`<link rel="canonical" href="${canonical}"`), `${homePath} canonical is incorrect`)
  assert(body.includes('hreflang="es"'), `${homePath} is missing es hreflang`)
  assert(body.includes('hreflang="en"'), `${homePath} is missing en hreflang`)
  assert(body.includes('hreflang="zh-CN"'), `${homePath} is missing zh-CN hreflang`)
  assert(body.includes('hreflang="x-default" href="https://copero.top/es/"'), `${homePath} is missing x-default`)
  assert(!/name="robots" content="noindex/i.test(body), `${homePath} must remain indexable`)

  for (const page of infoPages) {
    const pagePath = `/${locale}/${page}`
    const pageCanonical = `https://copero.top${pagePath}`
    const info = await html(pagePath)
    assert(info.response.status === 200, `${pagePath} must return 200`)
    assert(info.body.includes(`<html lang="${htmlLang}"`), `${pagePath} must expose html lang ${htmlLang}`)
    assert(info.body.includes(`<link rel="canonical" href="${pageCanonical}"`), `${pagePath} canonical is incorrect`)
    assert(info.body.includes(`hreflang="x-default" href="https://copero.top/es/${page}"`), `${pagePath} x-default is incorrect`)
    assert(!/name="robots" content="noindex/i.test(info.body), `${pagePath} must remain indexable`)
  }

  const gamePath = `/${locale}/game`
  const game = await html(gamePath)
  assert(game.response.status === 200, `${gamePath} must return 200`)
  assert(/name="robots" content="noindex, nofollow"/i.test(game.body), `${gamePath} meta robots must be noindex`)
  assert(/noindex/i.test(game.response.headers.get('x-robots-tag') ?? ''), `${gamePath} X-Robots-Tag must be noindex`)
}

const sitemap = await html('/sitemap.xml')
assert(sitemap.response.status === 200, '/sitemap.xml must return 200')
for (const [locale] of locales) {
  assert(sitemap.body.includes(`<loc>https://copero.top/${locale}/</loc>`), `sitemap is missing /${locale}/`)
  for (const page of infoPages) {
    assert(sitemap.body.includes(`<loc>https://copero.top/${locale}/${page}</loc>`), `sitemap is missing /${locale}/${page}`)
  }
}
assert(!sitemap.body.includes('/game</loc>'), 'sitemap must not include game routes')
assert(!sitemap.body.includes('<loc>https://copero.top/</loc>'), 'sitemap must not include redirect-only root')

const missingPath = `/__copero-release-check-${Date.now()}`
const missing = await html(missingPath)
assert(missing.response.status === 404, `unknown path must return 404, received ${missing.response.status}`)
assert(/noindex/i.test(missing.body), '404 response must include noindex')

if (new URL(base).hostname.endsWith('.pages.dev')) {
  const preview = await request('/es/')
  assert(/noindex/i.test(preview.headers.get('x-robots-tag') ?? ''), 'pages.dev preview must expose X-Robots-Tag noindex')
}

console.log(`Deployment validation passed for ${base}.`)
