import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const CONTENT_DIR = join(ROOT, 'src', 'data', 'simulador-carrera-futbol')

const CONFIG = {
  es: {
    locale: 'es',
    phrases: ['simulador de carrera de fútbol', 'simulador carrera fútbol', 'juego de carrera de fútbol'],
  },
  en: {
    locale: 'en',
    phrases: ['football player career simulator', 'online football career simulator', 'football career simulator', 'football career game'],
  },
  'zh-cn': {
    locale: 'zh-CN',
    phrases: ['足球球员生涯模拟器', '在线足球职业生涯游戏', '足球职业生涯模拟', '足球生涯模拟器'],
  },
  de: {
    locale: 'de',
    phrases: ['fußballspieler karriere simulator', 'fußball karriere simulator', 'fußball karriere simulation'],
  },
  it: {
    locale: 'it',
    phrases: ['simulatore di carriera calcistica', 'simulatore carriera calciatore', 'gioco carriera calciatore'],
  },
  'pt-br': {
    locale: 'pt-BR',
    phrases: ['simulador carreira jogador de futebol', 'simulador de carreira de futebol', 'jogo de carreira de futebol'],
  },
  ko: {
    locale: 'ko',
    phrases: ['온라인 축구 커리어 시뮬레이터', '축구 선수 커리어 시뮬레이터', '축구 커리어 시뮬레이터'],
  },
}

function collectStrings(value, excludedKeys = new Set(['seo'])) {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap((item) => collectStrings(item, excludedKeys))
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).flatMap(([key, item]) =>
    excludedKeys.has(key) ? [] : collectStrings(item, excludedKeys),
  )
}

function wordSegments(text, locale) {
  const segmenter = new Intl.Segmenter(locale, { granularity: 'word' })
  return [...segmenter.segment(text)].filter((part) => part.isWordLike)
}

function keywordCoverage(text, locale, phrases) {
  const lower = text.toLocaleLowerCase(locale)
  const spans = []
  const sortedPhrases = [...phrases].sort((a, b) => b.length - a.length)

  for (const phrase of sortedPhrases) {
    const needle = phrase.toLocaleLowerCase(locale)
    let start = 0
    while (start < lower.length) {
      const index = lower.indexOf(needle, start)
      if (index === -1) break
      const end = index + needle.length
      const overlaps = spans.some((span) => index < span.end && end > span.start)
      if (!overlaps) spans.push({ start: index, end })
      start = index + needle.length
    }
  }

  const segments = wordSegments(text, locale)
  const keywordWords = segments.filter((part) =>
    spans.some((span) => part.index >= span.start && part.index < span.end),
  ).length
  return {
    density: segments.length ? (keywordWords / segments.length) * 100 : 0,
    keywordWords,
    totalWords: segments.length,
  }
}

const failures = []

for (const [id, config] of Object.entries(CONFIG)) {
  const content = JSON.parse(await readFile(join(CONTENT_DIR, `${id}.json`), 'utf8'))
  const text = collectStrings(content).join(' ')
  const { density, keywordWords, totalWords } = keywordCoverage(text, config.locale, config.phrases)
  const densityRounded = Number(density.toFixed(2))

  console.log(`${id}: ${totalWords} words, ${keywordWords} keyword-family words, ${densityRounded}% coverage`)

  if (totalWords < 1200 || totalWords > 1800) {
    failures.push(`${id} word count ${totalWords} is outside 1200-1800`)
  }
  if (density < 3.5 || density > 5) {
    failures.push(`${id} keyword-family coverage ${densityRounded}% is outside 3.5-5%`)
  }
}

if (failures.length) {
  console.error(`Simulator content validation failed:\n- ${failures.join('\n- ')}`)
  process.exitCode = 1
} else {
  console.log('Simulator content validation passed for all seven locales.')
}
