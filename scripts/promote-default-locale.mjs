import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const DEFAULT_LOCALE = 'es'
const OTHER_LOCALES = ['en', 'zh-cn', 'de', 'it', 'pt-br']
const ROUTE_FILES = ['index.html', 'game.html', 'about.html', 'contact.html', 'privacy.html', 'terms.html']
const SPANISH_ABSOLUTE_PREFIX = 'https://copero.top/es/'

function rewriteSpanishCanonicalReferences(html) {
  return html.replaceAll(SPANISH_ABSOLUTE_PREFIX, 'https://copero.top/')
}

function rewriteSpanishRouteLinks(html) {
  return rewriteSpanishCanonicalReferences(html).replaceAll('href="/es/', 'href="/')
}

for (const locale of OTHER_LOCALES) {
  for (const file of ROUTE_FILES) {
    const output = join(DIST, locale, file)
    const html = rewriteSpanishCanonicalReferences(await readFile(output, 'utf8'))
    await writeFile(output, html)
  }
}

for (const file of ROUTE_FILES) {
  const source = join(DIST, DEFAULT_LOCALE, file)
  const html = rewriteSpanishRouteLinks(await readFile(source, 'utf8'))

  // Keep the legacy /es static artifact safe even though Cloudflare redirects it.
  await writeFile(source, html)

  // The default Spanish locale is served directly from the site root.
  await writeFile(join(DIST, file), html)
}

const root = await readFile(join(DIST, 'index.html'), 'utf8')
if (!root.includes('data-prerendered="page"') || !root.includes('<h1>')) {
  throw new Error('Root homepage promotion did not produce a prerendered HTML document.')
}
if (!root.includes('<link rel="canonical" href="https://copero.top/"')) {
  throw new Error('Root homepage canonical was not rewritten to https://copero.top/.')
}
if (root.includes('https://copero.top/es/')) {
  throw new Error('Root homepage still contains a Spanish /es/ absolute URL.')
}

console.log('Promoted Spanish prerendered pages to unprefixed root routes and rewrote hreflang canonicals.')
