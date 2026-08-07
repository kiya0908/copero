import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const LOCALES = ['es', 'en', 'zh-cn']
const SUPPORT_EMAIL = 'support@copero.top'
const OLD_CONTACT_HREF = 'href="https://github.com/kiya0908/copero/issues"'

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

for (const locale of LOCALES) {
  const pages = JSON.parse(
    await readFile(join(ROOT, 'src', 'i18n', 'locales', locale, 'pages.json'), 'utf8'),
  )
  const output = join(DIST, locale, 'contact.html')
  let html = await readFile(output, 'utf8')

  if (!html.includes(OLD_CONTACT_HREF)) {
    throw new Error(`${locale} contact prerender is missing the expected channel link marker.`)
  }

  html = html.replace(
    '<p class="eyebrow">GitHub</p>',
    `<p class="eyebrow">${escapeHtml(pages.contact.channelLabel)}</p>`,
  )
  html = html.replace(OLD_CONTACT_HREF, `href="mailto:${SUPPORT_EMAIL}"`)

  await writeFile(output, html)
}

console.log('Patched localized prerendered contact pages to use support@copero.top.')
