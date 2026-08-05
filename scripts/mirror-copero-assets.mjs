/**
 * Mirror Copero media into public/ and rewrite catalog.json URLs to local paths.
 * CDN directories return 403 — we download by known URL inventory only.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const catalogPath = path.join(root, 'src', 'data', 'catalog.json')
const publicDir = path.join(root, 'public')
const CDN = 'https://media.copero.com.ar'
const SITE = 'https://copero.com.ar'

const BUNDLE_TROPHIES = [
  'trophies/football/generic-league.svg',
  'trophies/football/generic-cup.svg',
  'trophies/football/international/FIFA/golden-glove.png',
  'trophies/football/international/FIFA/ballon-dor.png',
  'trophies/football/international/FIFA/world-cup.png',
  'trophies/football/international/FIFA/club-world-cup.png',
  'trophies/football/international/UEFA/golden-boot.png',
  'trophies/football/international/UEFA/champions-league.png',
  'trophies/football/international/UEFA/europa-league.png',
  'trophies/football/international/UEFA/euro.svg',
  'trophies/football/international/CONMEBOL/libertadores.png',
  'trophies/football/international/CONMEBOL/copa-sudamericana.png',
  'trophies/football/international/CONMEBOL/copa-america.png',
  'trophies/football/international/CONCACAF/concachampions.svg',
  'trophies/football/international/CONCACAF/gold-cup.svg',
  'trophies/football/international/CAF/afcon.svg',
  'trophies/football/international/AFC/asian-cup.svg',
  'trophies/football/international/OFC/nations-cup.png',
  'trophies/football/national/ARG/copa-argentina.png',
  'trophies/football/national/ARG/liga-profesional.png',
  'trophies/football/national/ARG/primera-nacional.png',
  'trophies/football/national/BOL/copa-bolivia.png',
  'trophies/football/national/BRA/copa-do-brasil.png',
  'trophies/football/national/BRA/brasileirao.png',
  'trophies/football/national/CHI/copa-chile.png',
  'trophies/football/national/CHI/liga-de-primera.png',
  'trophies/football/national/COL/copa-colombia.png',
  'trophies/football/national/COL/liga-dimayor.png',
  'trophies/football/national/NCA/copa-primera-de-nicaragua.png',
  'trophies/football/national/ECU/copa-ecuador.png',
  'trophies/football/national/ECU/serie-a.svg',
  'trophies/football/national/ENG/fa-cup.png',
  'trophies/football/national/ENG/championship.webp',
  'trophies/football/national/ENG/premier-league.png',
  'trophies/football/national/ESP/copa-del-rey.png',
  'trophies/football/national/ESP/la-liga.png',
  'trophies/football/national/ESP/la-liga-2.png',
  'trophies/football/national/FRA/coupe-de-france.png',
  'trophies/football/national/FRA/ligue-1.png',
  'trophies/football/national/FRA/ligue-2.png',
  'trophies/football/national/GER/dfb-pokal.png',
  'trophies/football/national/GER/2-bundesliga.png',
  'trophies/football/national/GER/bundesliga.png',
  'trophies/football/national/ITA/coppa-italia.png',
  'trophies/football/national/ITA/serie-a.png',
  'trophies/football/national/ITA/serie-b.webp',
  'trophies/football/national/MEX/copa-mx.png',
  'trophies/football/national/MEX/liga-mx.png',
  'trophies/football/national/NED/knvb-becker.png',
  'trophies/football/national/NED/eredivisie.png',
  'trophies/football/national/PAR/copa-paraguay.png',
  'trophies/football/national/PAR/copa-de-primera.png',
  'trophies/football/national/POL/polish-cup.png',
  'trophies/football/national/POR/taca-portugal.png',
  'trophies/football/national/POR/primeira-liga.svg',
  'trophies/football/national/RUS/russian-cup.png',
  'trophies/football/national/RUS/russian-premier-league.png',
  'trophies/football/national/SLV/copa-presidente.png',
  'trophies/football/national/GUA/supercopa-guatemala.png',
  'trophies/football/national/CRC/copa.png',
  'trophies/football/national/CRC/liga.png',
  'trophies/football/national/HON/liga.png',
  'trophies/football/national/TUR/turkey-cup.png',
  'trophies/football/national/TUR/turkey-league.png',
  'trophies/football/national/URU/copa-uruguay.png',
  'trophies/football/national/URU/liga-uruguaya.png',
  'trophies/football/national/USA/us-open-cup.png',
  'trophies/football/national/USA/mls.png',
  'trophies/football/national/VEN/copa-venezuela.png',
  'trophies/football/national/VEN/liga-futve.png',
  'trophies/football/national/PER/liga-1.svg',
]

const CONFED_LOGOS = [
  'logos/football/confederations/L/afc.svg',
  'logos/football/confederations/L/caf.svg',
  'logos/football/confederations/L/concacaf.svg',
  'logos/football/confederations/L/conmebol.svg',
  'logos/football/confederations/L/ofc.svg',
  'logos/football/confederations/L/uefa.svg',
]

const EVENT_KEYS = [
  'club_national_team_conflict-comply',
  'club_national_team_conflict-go_anyway',
  'controversial_statement-apologize',
  'controversial_post-support_family',
  'controversial_post-support_club',
  'fan_backlash-stay',
  'finish_high_school-accept',
  'finish_high_school-reject',
  'giant_tattoo-accept',
  'giant_tattoo-reject',
  'honesty_test-accept',
  'honesty_test-reject',
  'injury_at_peak-play_injured',
  'injury_at_peak-recover',
  'injury-continue',
  'indecent_proposal-proceed',
  'indecent_proposal-reject',
  'mysterious_substance-consume',
  'mysterious_substance-reject',
  'personal_coach-accept',
  'personal_coach-reject',
  'personal_coach-nutrition_plan-accept',
  'personal_coach-nutrition_plan-reject',
  'position_change-accept',
  'position_change-reject',
  'position_competition-compete',
  'rival_offer-accept',
  'rival_offer-reject',
  'season_load-accept',
  'season_load-stay_calm',
  'season_load-double_session-accept',
  'season_load-double_session-stay_calm',
  'tax_trouble-stay_and_fight',
  'training_extra-accept',
  'training_extra-reject',
  'unexpected_prospect-mentor',
]

const EXTRA_SITE = [
  'career-simulator/career-events/retirement.jpg',
  'career-simulator/pitch.svg',
  'career-simulator/goal.svg',
]

const EXTRA_CDN = ['minigames/career-simulator/header2.jpg']

function listTrophyUrls(catalog) {
  const urls = new Set()
  for (const key of ['global_club_trophies', 'global_national_trophies', 'domestic_cups']) {
    const obj = catalog[key]
    if (!obj || typeof obj !== 'object') continue
    for (const item of Object.values(obj)) {
      if (item?.trophy_url) urls.add(item.trophy_url)
    }
  }
  for (const rel of BUNDLE_TROPHIES) urls.add(`${CDN}/${rel}`)
  return [...urls]
}

function collectCatalogUrls(catalog) {
  const urls = new Set()
  for (const c of catalog.countries || []) {
    if (c.flag_url) urls.add(c.flag_url)
    if (c.logo_url) urls.add(c.logo_url)
  }
  for (const c of catalog.competitions || []) {
    if (c.logo_url) urls.add(c.logo_url)
  }
  for (const t of catalog.teams || []) {
    if (t.logo_url) urls.add(t.logo_url)
  }
  for (const rel of CONFED_LOGOS) urls.add(`${CDN}/${rel}`)
  for (const rel of EXTRA_CDN) urls.add(`${CDN}/${rel}`)
  return [...urls]
}

function localPathFromUrl(url) {
  if (url.startsWith(CDN + '/')) {
    return path.join(publicDir, 'media', url.slice(CDN.length + 1))
  }
  if (url.startsWith(SITE + '/')) {
    return path.join(publicDir, url.slice(SITE.length + 1))
  }
  if (url.startsWith('/')) {
    return path.join(publicDir, url.slice(1))
  }
  return null
}

function rewriteToLocal(url) {
  if (url.startsWith(CDN + '/')) return `/media/${url.slice(CDN.length + 1)}`
  if (url.startsWith(SITE + '/')) return url.slice(SITE.length)
  return url
}

async function download(url, dest) {
  if (fs.existsSync(dest)) {
    const st = fs.statSync(dest)
    if (st.size > 100) return { ok: true, skipped: true, bytes: st.size }
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'SimuladorMirror/1.0', Accept: 'image/*,*/*' },
      })
      if (!res.ok) return { ok: false, status: res.status }
      const ct = (res.headers.get('content-type') || '').toLowerCase()
      if (ct.includes('text/html')) return { ok: false, status: 'html-fallback' }
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 50) return { ok: false, status: 'too-small' }
      fs.writeFileSync(dest, buf)
      return { ok: true, bytes: buf.length }
    } catch (err) {
      if (attempt === 2) return { ok: false, status: String(err) }
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
    }
  }
  return { ok: false, status: 'unknown' }
}

async function runPool(items, concurrency, worker) {
  let i = 0
  const results = []
  async function loop() {
    while (i < items.length) {
      const idx = i
      i += 1
      results[idx] = await worker(items[idx], idx)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => loop()))
  return results
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
const jobs = []

for (const url of collectCatalogUrls(catalog)) {
  const dest = localPathFromUrl(url)
  if (dest) jobs.push({ url, dest, kind: 'catalog' })
}
for (const url of listTrophyUrls(catalog)) {
  const dest = localPathFromUrl(url)
  if (dest) jobs.push({ url, dest, kind: 'trophy' })
}
for (const key of EVENT_KEYS) {
  const url = `${SITE}/career-simulator/career-events/${key}.jpg`
  jobs.push({
    url,
    dest: path.join(publicDir, 'career-simulator', 'career-events', `${key}.jpg`),
    kind: 'event',
  })
}
for (const rel of EXTRA_SITE) {
  jobs.push({
    url: `${SITE}/${rel}`,
    dest: path.join(publicDir, rel),
    kind: 'extra',
  })
}

// de-dupe by dest
const seen = new Set()
const uniqueJobs = []
for (const j of jobs) {
  if (seen.has(j.dest)) continue
  seen.add(j.dest)
  uniqueJobs.push(j)
}

console.log(`Downloading ${uniqueJobs.length} assets…`)
const manifest = { ok: [], fail: [], skipped: 0 }

await runPool(uniqueJobs, 12, async (job, idx) => {
  const result = await download(job.url, job.dest)
  if (result.ok) {
    if (result.skipped) manifest.skipped += 1
    else manifest.ok.push({ url: job.url, dest: path.relative(root, job.dest), bytes: result.bytes })
  } else {
    manifest.fail.push({ url: job.url, status: result.status, kind: job.kind })
  }
  if ((idx + 1) % 50 === 0 || idx + 1 === uniqueJobs.length) {
    console.log(`  ${idx + 1}/${uniqueJobs.length} (ok=${manifest.ok.length} skip=${manifest.skipped} fail=${manifest.fail.length})`)
  }
  return result
})

function rewriteDeep(value) {
  if (typeof value === 'string') {
    if (value.startsWith(CDN + '/') || value.startsWith(SITE + '/')) return rewriteToLocal(value)
    return value
  }
  if (Array.isArray(value)) return value.map(rewriteDeep)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = rewriteDeep(v)
    return out
  }
  return value
}

const rewritten = rewriteDeep(catalog)
fs.writeFileSync(catalogPath, JSON.stringify(rewritten))
fs.mkdirSync(path.join(publicDir, 'media'), { recursive: true })
fs.writeFileSync(
  path.join(publicDir, 'media', 'manifest.json'),
  JSON.stringify(
    {
      downloadedAt: new Date().toISOString(),
      ok: manifest.ok.length,
      skipped: manifest.skipped,
      fail: manifest.fail.length,
      failures: manifest.fail,
    },
    null,
    2,
  ),
)

console.log(`Done. ok=${manifest.ok.length} skipped=${manifest.skipped} fail=${manifest.fail.length}`)
if (manifest.fail.length) {
  console.log('Failures:')
  for (const f of manifest.fail.slice(0, 40)) console.log(' ', f.status, f.url)
}
