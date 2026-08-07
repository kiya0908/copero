import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const root = new URL('../', import.meta.url)

async function read(relativePath) {
  return readFile(new URL(relativePath, root), 'utf8')
}

async function collectSourceFiles(directory) {
  const absolute = new URL(directory, root)
  const entries = await readdir(absolute, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const relative = path.posix.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await collectSourceFiles(`${relative}/`))
    else if (/\.(ts|tsx|css)$/.test(entry.name)) files.push(relative)
  }

  return files
}

const [
  envExample,
  analytics,
  router,
  main,
  releaseCss,
  siteHeader,
  notFound,
  state,
  packageJson,
] = await Promise.all([
  read('.env.example'),
  read('src/lib/analytics.ts'),
  read('src/app/router.tsx'),
  read('src/main.tsx'),
  read('src/styles/release.css'),
  read('src/components/layout/SiteHeader.tsx'),
  read('src/components/pages/NotFoundPage.tsx'),
  read('src/engine/state.ts'),
  read('package.json'),
])

const sourceFiles = await collectSourceFiles('src/')
const sourceContents = await Promise.all(sourceFiles.map(async (file) => [file, await read(file)]))
const runtimeDesignReferenceImports = sourceContents.filter(([, content]) => content.includes('design-reference/'))
const hardcodedGaIds = sourceContents.filter(([, content]) => /\bG-[A-Z0-9]{6,}\b/.test(content))

const envLines = Object.fromEntries(
  envExample
    .split(/\r?\n/)
    .filter((line) => line.includes('='))
    .map((line) => {
      const [key, ...rest] = line.split('=')
      return [key.trim(), rest.join('=').trim()]
    }),
)

const checks = [
  ['GA4 environment placeholder is present', Object.hasOwn(envLines, 'VITE_GA_MEASUREMENT_ID')],
  ['GA4 environment placeholder is intentionally blank', envLines.VITE_GA_MEASUREMENT_ID === ''],
  ['Clarity environment placeholder remains optional', Object.hasOwn(envLines, 'VITE_CLARITY_PROJECT_ID')],
  ['analytics only activates in production', analytics.includes('import.meta.env.PROD')],
  ['GA4 automatic page view is disabled to avoid SPA duplicates', analytics.includes('send_page_view: false')],
  ['SPA page view helper exists', analytics.includes('export function trackPageView')],
  ['route tracker is mounted', router.includes('<AnalyticsRouteTracker />')],
  ['release CSS is loaded last', main.includes("import './styles/release.css'")],
  ['narrow-screen release breakpoint exists', releaseCss.includes('@media (max-width: 420px)')],
  ['very narrow header fallback exists', releaseCss.includes('@media (max-width: 350px)')],
  ['touch hover fallback exists', releaseCss.includes('@media (hover: none)')],
  ['horizontal overflow is guarded', releaseCss.includes('overflow-x: clip')],
  ['textarea focus-visible is covered', releaseCss.includes('textarea:focus-visible')],
  ['navigation aria label is localized', siteHeader.includes("t('common', 'nav.primary')")],
  ['runtime 404 derives locale from URL', notFound.includes('localeFromPathname(location.pathname)')],
  ['runtime 404 clears stale hreflang', notFound.includes('link[rel="alternate"][hreflang]')],
  ['runtime 404 is noindex', notFound.includes("ensureMeta('robots', 'noindex, nofollow')")],
  ['save state remains locale-neutral', !/locale\s*:/.test(state)],
  ['build still includes prerender', packageJson.includes('vite build && node scripts/prerender.mjs')],
  ['production source has no design-reference runtime imports', runtimeDesignReferenceImports.length === 0],
  ['production source has no hard-coded GA4 measurement ID', hardcodedGaIds.length === 0],
]

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label)
if (failures.length) {
  console.error(`Release validation failed:\n- ${failures.join('\n- ')}`)
  if (runtimeDesignReferenceImports.length) {
    console.error(`Runtime design-reference imports: ${runtimeDesignReferenceImports.map(([file]) => file).join(', ')}`)
  }
  if (hardcodedGaIds.length) {
    console.error(`Hard-coded GA4 IDs: ${hardcodedGaIds.map(([file]) => file).join(', ')}`)
  }
  process.exitCode = 1
} else {
  console.log(`Release validation passed (${checks.length} checks across ${sourceFiles.length} source files).`)
}
