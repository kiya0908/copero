import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const bundlePath = process.env.CAREER_BUNDLE || process.argv[2]
if (!bundlePath) {
  console.error(
    'Usage: CAREER_BUNDLE=/path/to/CareerSimulatorPage.js npm run extract\n' +
      '   or: npm run extract -- /path/to/CareerSimulatorPage.js',
  )
  process.exit(1)
}
const outDir = path.join(root, 'src', 'data')

function extractQuotedJson(source, varName, quoteChar) {
  const token = `${varName}=JSON.parse(${quoteChar}`
  const start = source.indexOf(token)
  if (start < 0) throw new Error(`No se encontró ${token}`)
  let i = start + token.length
  if (quoteChar === '`') {
    const end = source.indexOf('`)', i)
    if (end < 0) throw new Error(`No se cerró template de ${varName}`)
    return JSON.parse(source.slice(i, end))
  }
  let out = ''
  while (i < source.length) {
    const ch = source[i]
    if (ch === '\\') {
      out += source[i + 1]
      i += 2
      continue
    }
    if (ch === "'") break
    out += ch
    i += 1
  }
  return JSON.parse(out)
}

function extractObjectLiteral(source, varName) {
  const token = `${varName}=`
  const start = source.indexOf(token)
  if (start < 0) throw new Error(`No se encontró ${token}`)
  let i = start + token.length
  while (source[i] === ' ') i += 1
  if (source[i] !== '{' && source[i] !== '[') {
    throw new Error(`${varName} no empieza con objeto/array`)
  }
  const open = source[i]
  const close = open === '{' ? '}' : ']'
  let depth = 0
  let inStr = null
  let escape = false
  const begin = i
  for (; i < source.length; i += 1) {
    const ch = source[i]
    if (inStr) {
      if (escape) {
        escape = false
        continue
      }
      if (ch === '\\') {
        escape = true
        continue
      }
      if (ch === inStr) inStr = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch
      continue
    }
    if (ch === open) depth += 1
    if (ch === close) {
      depth -= 1
      if (depth === 0) {
        const literal = source.slice(begin, i + 1)
        // Convert bare keys / single quotes to JSON-ish via Function
        // eslint-disable-next-line no-new-func
        return new Function(`return (${literal})`)()
      }
    }
  }
  throw new Error(`No se cerró literal de ${varName}`)
}

const js = fs.readFileSync(bundlePath, 'utf8')
const countries = extractQuotedJson(js, 'Fr', "'")
const competitions = extractQuotedJson(js, 'Nr', '`')
const confederations = extractObjectLiteral(js, 'Ar')
const globalNationalTrophies = extractObjectLiteral(js, 'kr')
const globalClubTrophies = extractObjectLiteral(js, 'Er')
const domesticCups = extractObjectLiteral(js, 'Lr')

const teams = competitions.flatMap((c) =>
  (c.teams ?? []).map((t) => ({
    ...t,
    competition_id: c.id,
    country_fifa_code: c.country_fifa_code,
    confederation: c.confederation ?? countries.find((x) => x.fifa_code === c.country_fifa_code)?.confederation,
  })),
)

fs.mkdirSync(outDir, { recursive: true })
const catalog = {
  countries,
  competitions: competitions.map(({ teams: _t, ...rest }) => rest),
  teams,
  confederations,
  global_national_trophies: globalNationalTrophies,
  global_club_trophies: globalClubTrophies,
  domestic_cups: domesticCups,
}

fs.writeFileSync(path.join(outDir, 'catalog.json'), JSON.stringify(catalog))
fs.writeFileSync(
  path.join(outDir, 'meta.json'),
  JSON.stringify(
    {
      extractedAt: new Date().toISOString(),
      countries: countries.length,
      competitions: competitions.length,
      teams: teams.length,
      source: bundlePath,
    },
    null,
    2,
  ),
)

console.log(
  `OK: ${countries.length} países, ${competitions.length} ligas, ${teams.length} clubes → src/data/catalog.json`,
)
