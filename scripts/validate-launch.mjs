import { readFile } from 'node:fs/promises'

const files = {
  index: await readFile(new URL('../index.html', import.meta.url), 'utf8'),
  robots: await readFile(new URL('../public/robots.txt', import.meta.url), 'utf8'),
  sitemap: await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8'),
  redirects: await readFile(new URL('../public/_redirects', import.meta.url), 'utf8'),
  headers: await readFile(new URL('../public/_headers', import.meta.url), 'utf8'),
  env: await readFile(new URL('../.env.example', import.meta.url), 'utf8'),
  analytics: await readFile(new URL('../src/lib/analytics.ts', import.meta.url), 'utf8'),
}

const locales = ['es', 'en', 'zh-cn']
const infoPages = ['about', 'contact', 'privacy', 'terms']

const assertions = [
  ['root HTML is noindex fallback', files.index.includes('<meta name="robots" content="noindex, follow"')],
  ['root redirects permanently to Spanish', files.redirects.includes('/ /es/ 301')],
  ['legacy game redirects permanently to Spanish', files.redirects.includes('/game /es/game 301')],
  ...infoPages.map((page) => [
    `root ${page} redirects permanently to Spanish`,
    files.redirects.includes(`/${page} /es/${page} 301`),
  ]),
  ['robots sitemap', files.robots.includes('Sitemap: https://copero.top/sitemap.xml')],
  ['Spanish sitemap homepage', files.sitemap.includes('<loc>https://copero.top/es/</loc>')],
  ['English sitemap homepage', files.sitemap.includes('<loc>https://copero.top/en/</loc>')],
  ['Chinese sitemap homepage', files.sitemap.includes('<loc>https://copero.top/zh-cn/</loc>')],
  ...locales.flatMap((locale) =>
    infoPages.map((page) => [
      `${locale} sitemap ${page}`,
      files.sitemap.includes(`<loc>https://copero.top/${locale}/${page}</loc>`),
    ]),
  ),
  ['sitemap excludes redirect root', !files.sitemap.includes('<loc>https://copero.top/</loc>')],
  ['sitemap excludes noindex game pages', !files.sitemap.includes('/game</loc>')],
  ['Spanish game X-Robots noindex', files.headers.includes('/es/game\n  X-Robots-Tag: noindex, nofollow')],
  ['English game X-Robots noindex', files.headers.includes('/en/game\n  X-Robots-Tag: noindex, nofollow')],
  ['Chinese game X-Robots noindex', files.headers.includes('/zh-cn/game\n  X-Robots-Tag: noindex, nofollow')],
  ['Pages previews noindex', files.headers.includes('https://:project.pages.dev/*')],
  ['GA4 environment variable', files.env.includes('VITE_GA_MEASUREMENT_ID=')],
  ['Clarity environment variable', files.env.includes('VITE_CLARITY_PROJECT_ID=')],
  ['analytics avoids PII field', !files.analytics.includes('lastName')],
]

const failures = assertions.filter(([, passed]) => !passed).map(([label]) => label)
if (failures.length > 0) {
  console.error(`Launch validation failed: ${failures.join(', ')}`)
  process.exitCode = 1
} else {
  console.log(`Launch validation passed (${assertions.length} checks).`)
}
