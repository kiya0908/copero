import { readFile } from 'node:fs/promises'

const files = {
  index: await readFile(new URL('../index.html', import.meta.url), 'utf8'),
  main: await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8'),
  seo: await readFile(new URL('../src/components/seo/SeoHead.tsx', import.meta.url), 'utf8'),
  home: await readFile(new URL('../src/pages/HomePage.tsx', import.meta.url), 'utf8'),
  robots: await readFile(new URL('../public/robots.txt', import.meta.url), 'utf8'),
  sitemap: await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8'),
  redirects: await readFile(new URL('../public/_redirects', import.meta.url), 'utf8'),
  env: await readFile(new URL('../.env.example', import.meta.url), 'utf8'),
  analytics: await readFile(new URL('../src/lib/analytics.ts', import.meta.url), 'utf8'),
}

const assertions = [
  ['root index is Vite mount only', files.index.includes('<div id="root"></div>') && !files.index.includes('GoalSaga')],
  ['localized routes', ['/es/', '/en/', '/zh-cn/'].every((path) => files.sitemap.includes(`<loc>https://copero.top${path}</loc>`))],
  ['localized game route', files.main.includes('path="game"')],
  ['canonical domain', files.seo.includes("const SITE_URL = 'https://copero.top'")],
  ['hreflang support', files.seo.includes("'alternate'") && files.seo.includes("'x-default'")],
  ['localized html lang', files.seo.includes('document.documentElement.lang')],
  ['game noindex', files.seo.includes("page === 'home' ? 'index, follow' : 'noindex, follow'")],
  ['support email', files.home.includes('support@copero.top')],
  ['robots sitemap', files.robots.includes('Sitemap: https://copero.top/sitemap.xml')],
  ['Cloudflare SPA fallback', files.redirects.includes('/* /index.html 200')],
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
