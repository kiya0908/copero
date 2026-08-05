import { nextRng } from './rng'
import { hasModifier, overallCeil, overallFloor } from './modifiers'
import type {
  GameState,
  PlayerAttributes,
  PlayingRole,
  Position,
  SeasonStats,
} from './types'

const ROLE_MINUTES: Record<PlayingRole, number> = {
  bench: 0.22,
  rotation: 0.5,
  starter: 0.82,
  undisputed: 0.95,
}

const DEFAULT_ATTRIBUTES: PlayerAttributes = {
  pace: 70,
  shooting: 70,
  passing: 70,
  dribbling: 70,
  defending: 70,
  physical: 70,
  skillMoves: 3,
  weakFoot: 3,
}

export function emptyStats(): SeasonStats {
  return { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, goalsConceded: 0 }
}

export function clampOverall(state: GameState, overall: number): number {
  const potential = state.player?.potential
  const ceiling = potential && potential > 0
    ? Math.min(overallCeil(state), potential)
    : overallCeil(state)
  return Math.max(overallFloor(state), Math.min(ceiling, Math.round(overall)))
}

export function estimateMarketValue(overall: number, age: number, reputation: number): number {
  const ageFactor = age <= 24 ? 1.25 : age <= 28 ? 1.1 : age <= 32 ? 0.85 : age <= 36 ? 0.55 : 0.3
  const repFactor = 0.6 + reputation * 0.25
  const raw = Math.pow(Math.max(40, overall) / 50, 4.2) * 2_500_000 * ageFactor * repFactor
  if (raw >= 10_000_000) return Math.round(raw / 1_000_000) * 1_000_000
  if (raw >= 1_000_000) return Math.round(raw / 100_000) * 100_000
  return Math.round(raw / 10_000) * 10_000
}

export function startingOverall(position: Position, rngState: number) {
  const base = position === 'GK' ? 52 : 55
  const r = nextRng(rngState)
  const overall = base + Math.floor(r.value * 8)
  return { state: r.state, overall }
}

/** Edad efectiva más lenta con longevidad */
function agingAge(state: GameState, age: number): number {
  if (hasModifier(state, 'iron_longevity') && age >= 32) return age - 2
  return age
}

export function developOverall(
  state: GameState,
  current: number,
  age: number,
  role: PlayingRole,
  injured: boolean,
  rngState: number,
) {
  let s = rngState
  const r1 = nextRng(s)
  s = r1.state
  const a = agingAge(state, age)

  let delta = 0
  if (a <= 19) delta = 1 + Math.floor(r1.value * 2)
  else if (a <= 22) delta = 1 + Math.floor(r1.value * 2)
  else if (a <= 25) delta = Math.floor(r1.value * 2)
  else if (a <= 29) delta = Math.floor(r1.value * 1.5)
  else if (a <= 32) delta = Math.floor(r1.value * 1.2) - 1
  else if (a <= 35) delta = -1 - Math.floor(r1.value * 2)
  else delta = -2 - Math.floor(r1.value * 3)

  if (role === 'undisputed') delta += 0.5
  if (role === 'starter') delta += 0.25
  if (role === 'bench') delta -= 1.5
  if (injured) delta -= 2
  if (hasModifier(state, 'golden_boy') && a <= 26) delta += 0.5
  if (hasModifier(state, 'career_ruined')) delta -= 2
  if (state.traits?.includes('professional')) delta += 0.35
  if (hasModifier(state, 'form_boost')) delta += 0.75
  if (hasModifier(state, 'form_dip')) delta -= 0.75
  if (hasModifier(state, 'homesick') && a <= 24) delta -= 0.5

  const growthRoom = (state.player?.potential ?? 99) - current
  if (delta > 0 && growthRoom <= 0) delta = 0
  else if (delta > 0 && growthRoom <= 2) delta *= 0.2
  else if (delta > 0 && growthRoom <= 5) delta *= 0.5

  if (delta > 0 && current >= 88) delta = Math.min(1, delta * 0.25)
  else if (delta > 0 && current >= 80) delta *= 0.5

  return { state: s, overall: clampOverall(state, current + Math.round(delta)) }
}

/** Ajusta el rol real según OVR vs reputación del club */
export function effectiveRole(
  contracted: PlayingRole,
  overall: number,
  clubRep: number,
  undisputedSeasons: number,
): PlayingRole {
  if (undisputedSeasons > 0) return 'undisputed'
  const expected = 52 + clubRep * 7
  const gap = overall - expected
  if (gap <= -10) return 'bench'
  if (gap <= -4) return contracted === 'undisputed' ? 'rotation' : contracted === 'starter' ? 'rotation' : 'bench'
  if (gap >= 8 && (contracted === 'rotation' || contracted === 'bench')) return 'starter'
  if (gap >= 14) return contracted === 'undisputed' ? 'undisputed' : 'starter'
  return contracted
}

export function simulateSeasonStats(
  position: Position,
  overall: number,
  role: PlayingRole,
  suspended: boolean,
  injured: boolean,
  rngState: number,
  clubRep = 2,
  attributes: PlayerAttributes = DEFAULT_ATTRIBUTES,
) {
  let s = rngState
  if (suspended) return { state: s, stats: emptyStats() }

  let minutesFactor = ROLE_MINUTES[role]
  if (injured) minutesFactor *= 0.45
  if (clubRep >= 4 && role === 'rotation') minutesFactor *= 0.85
  if (clubRep <= 2 && role === 'starter') minutesFactor = Math.min(0.95, minutesFactor + 0.08)

  const rApps = nextRng(s)
  s = rApps.state
  const appearances = Math.max(0, Math.round((16 + rApps.value * 30) * minutesFactor))

  const isGk = position === 'GK'
  const attackingPosition = ['ST', 'LW', 'RW', 'CAM', 'LM', 'RM'].includes(position)
  const midfieldPosition = ['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(position)
  const finishing =
    attributes.shooting * 0.5 +
    attributes.pace * 0.18 +
    attributes.dribbling * 0.2 +
    attributes.weakFoot * 2.4
  const creativity =
    attributes.passing * 0.52 +
    attributes.dribbling * 0.25 +
    attributes.pace * 0.08 +
    attributes.skillMoves * 2.2
  const defensiveQuality =
    attributes.defending * 0.58 + attributes.physical * 0.27 + attributes.passing * 0.08

  const rGoals = nextRng(s)
  s = rGoals.state
  const goalBias = position === 'ST' ? 1.35 : attackingPosition ? 0.95 : midfieldPosition ? 0.48 : 0.16
  const goals = isGk
    ? 0
    : Math.max(
        0,
        Math.round(
          appearances *
            ((overall - 42) / 100) *
            (finishing / 100) *
            0.44 *
            goalBias *
            (0.72 + rGoals.value * 0.58),
        ),
      )

  const rAssists = nextRng(s)
  s = rAssists.state
  const assistBias = position === 'CAM' ? 1.25 : ['CM', 'LM', 'RM', 'LW', 'RW'].includes(position) ? 1 : 0.52
  const assists = isGk
    ? 0
    : Math.max(
        0,
        Math.round(
          appearances *
            ((overall - 42) / 105) *
            (creativity / 100) *
            0.35 *
            assistBias *
            (0.7 + rAssists.value * 0.6),
        ),
      )

  const rCs = nextRng(s)
  s = rCs.state
  const cleanSheets = isGk
    ? Math.round(
        appearances *
          (0.11 + defensiveQuality / 520) *
          (0.72 + rCs.value * 0.48),
      )
    : 0

  const rGc = nextRng(s)
  s = rGc.state
  const goalsConceded = isGk
    ? Math.max(
        0,
        Math.round(
          appearances *
            (1.55 - defensiveQuality / 125) *
            (0.82 + rGc.value * 0.36),
        ),
      )
    : 0

  return { state: s, stats: { appearances, goals, assists, cleanSheets, goalsConceded } }
}

export function formatMoney(value: number): string {
  const v = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (v >= 1_000_000_000) return `${sign}$${(v / 1_000_000_000).toFixed(v >= 10_000_000_000 ? 0 : 1)}B`
  if (v >= 1_000_000) return `${sign}$${(v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1)}M`
  if (v >= 1_000) return `${sign}$${Math.round(v / 1_000)}K`
  return `${sign}$${Math.round(v)}`
}

export function nationalCallupChance(overall: number, age: number, clubRep: number): number {
  if (age < 18 || age > 36) return 0
  let c = 0
  if (overall >= 86) c = 0.55
  else if (overall >= 82) c = 0.35
  else if (overall >= 78) c = 0.18
  else if (overall >= 74) c = 0.08
  else return 0
  if (clubRep >= 4) c += 0.08
  if (age >= 22 && age <= 30) c += 0.05
  return Math.min(0.75, c)
}
