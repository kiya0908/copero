import { readFile } from 'node:fs/promises'

const files = {
  index: await readFile(new URL('../index.html', import.meta.url), 'utf8'),
  robots: await readFile(new URL('../public/robots.txt', import.meta.url), 'utf8'),
  sitemap: await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8'),
  env: await readFile(new URL('../.env.example', import.meta.url), 'utf8'),
  analytics: await readFile(new URL('../src/lib/analytics.ts', import.meta.url), 'utf8'),
}

const assertions = [
  ['canonical domain', files.index.includes('<link rel="canonical" href="https://copero.top/"')],
  ['Open Graph URL', files.index.includes('property="og:url" content="https://copero.top/"')],
  ['support email', files.index.includes('support@copero.top')],
  ['robots sitemap', files.robots.includes('Sitemap: https://copero.top/sitemap.xml')],
  ['sitemap homepage', files.sitemap.includes('<loc>https://copero.top/</loc>')],
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
