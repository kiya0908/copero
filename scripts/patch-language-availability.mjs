import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const LOCALES = ['es', 'en', 'zh-cn', 'de', 'it', 'pt-br']
const availability = JSON.parse(
  await readFile(join(ROOT, 'src', 'i18n', 'language-availability.json'), 'utf8'),
)

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

async function patch(locale, file, currentText, desiredText) {
  if (currentText === desiredText) return
  const output = join(DIST, locale, file)
  let html = await readFile(output, 'utf8')
  const current = escapeHtml(currentText)
  const desired = escapeHtml(desiredText)
  if (!html.includes(current)) {
    throw new Error(`${locale}/${file} is missing the language availability text to patch.`)
  }
  html = html.replaceAll(current, desired)
  await writeFile(output, html)
}

for (const locale of LOCALES) {
  const [home, pages] = await Promise.all([
    readFile(join(ROOT, 'src', 'i18n', 'locales', locale, 'home.json'), 'utf8').then(JSON.parse),
    readFile(join(ROOT, 'src', 'i18n', 'locales', locale, 'pages.json'), 'utf8').then(JSON.parse),
  ])

  await patch(locale, 'index.html', home.faq.items.save.answer, availability[locale].save)
  await patch(locale, 'about.html', pages.about.sections.languages.body, availability[locale].about)
}

console.log('Patched six-language availability copy into localized prerendered pages.')
