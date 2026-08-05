import { getTeam } from '../data/catalog'
import { nextRng, pickOne } from './rng'
import type {
  GameState,
  PlayingRole,
  Position,
  SeasonObjective,
  SeasonObjectiveKind,
  SeasonRecord,
  TraitId,
} from './types'

const TRAIT_POOL: { id: TraitId; label: string; desc: string }[] = [
  {
    id: 'ambitious',
    label: 'Ambicioso',
    desc: 'Más ofertas de salto; menos paciencia en clubes chicos.',
  },
  {
    id: 'loyal',
    label: 'Leal',
    desc: 'Más renovaciones y peso local; menos fuga temprana.',
  },
  {
    id: 'party_risk',
    label: 'Vida nocturna',
    desc: 'Más eventos de riesgo y escándalos; a veces rachas creativas.',
  },
  {
    id: 'professional',
    label: 'Profesional',
    desc: 'Mejor desarrollo y menos lesiones por descuido.',
  },
  {
    id: 'media_magnet',
    label: 'Magneto mediático',
    desc: 'Más foco de prensa: oportunidades y presión.',
  },
]

export function traitMeta(id: TraitId) {
  return TRAIT_POOL.find((t) => t.id === id)
}

export function allTraitOptions() {
  return TRAIT_POOL
}

export function pickTraitOptions(state: GameState, count = 3): { state: GameState; options: typeof TRAIT_POOL } {
  let s = state.rngState
  const pool = [...TRAIT_POOL]
  const options: typeof TRAIT_POOL = []
  for (let i = 0; i < count && pool.length; i += 1) {
    const pick = pickOne(s, pool)
    s = pick.state
    options.push(pick.item)
    const idx = pool.findIndex((t) => t.id === pick.item.id)
    if (idx >= 0) pool.splice(idx, 1)
  }
  return { state: { ...state, rngState: s }, options }
}

export function generateSeasonObjective(state: GameState): { state: GameState; objective: SeasonObjective } {
  if (!state.player || !state.currentTeamId || !state.contract) {
    return {
      state,
      objective: {
        kind: 'starter_minutes',
        label: 'Jugar 20 partidos',
        target: 20,
        progress: 0,
        briefed: false,
      },
    }
  }

  let s = state.rngState
  const team = getTeam(state.currentTeamId)
  const rep = team?.international_reputation ?? 1
  const role = state.contract.role
  const pos = state.player.position
  const attack = ['ST', 'LW', 'RW', 'CAM'].includes(pos) || ['LM', 'RM', 'CM'].includes(pos)

  type Cand = { item: SeasonObjective; weight: number }
  const candidates: Cand[] = []

  if (role === 'bench' || role === 'rotation') {
    candidates.push({
      item: {
        kind: 'starter_minutes',
        label: 'Conseguir 18 partidos',
        target: 18,
        progress: 0,
      },
      weight: 28,
    })
  } else {
    candidates.push({
      item: {
        kind: 'starter_minutes',
        label: 'Jugar al menos 28 partidos',
        target: 28,
        progress: 0,
      },
      weight: 18,
    })
  }

  if (attack) {
    const target = pos === 'ST' ? 12 : 8
    candidates.push({
      item: {
        kind: 'goal_contrib',
        label: `Sumar ${target} goles o asistencias`,
        target,
        progress: 0,
      },
      weight: 24,
    })
  } else {
    candidates.push({
      item: {
        kind: 'goal_contrib',
        label: 'Aportar 4 goles o asistencias',
        target: 4,
        progress: 0,
      },
      weight: 12,
    })
  }

  if (rep <= 2) {
    candidates.push({
      item: {
        kind: 'avoid_relegation',
        label: 'Evitar el descenso',
        target: 1,
        progress: 0,
      },
      weight: 22,
    })
  }

  if (rep >= 2) {
    candidates.push({
      item: {
        kind: 'win_trophy',
        label: 'Levantar un trofeo',
        target: 1,
        progress: 0,
      },
      weight: rep >= 4 ? 16 : 10,
    })
  }

  if (state.player.overall >= 68 && state.player.age >= 18) {
    candidates.push({
      item: {
        kind: 'national_callup',
        label: 'Ser convocado a la selección',
        target: 1,
        progress: 0,
      },
      weight: 14,
    })
  }

  const total = candidates.reduce((n, c) => n + c.weight, 0)
  const roll = nextRng(s)
  s = roll.state
  let acc = 0
  let chosen = candidates[0]!.item
  const r = roll.value * total
  for (const c of candidates) {
    acc += c.weight
    if (r <= acc) {
      chosen = c.item
      break
    }
  }

  return { state: { ...state, rngState: s }, objective: chosen }
}

/** Meta probable si fichás en ese club (determinística, no toca el RNG de carrera). */
export function previewObjectiveForClub(
  player: { position: Position; overall: number; age: number } | null | undefined,
  teamId: string,
  role: PlayingRole,
): { kind: SeasonObjectiveKind; label: string } {
  const team = getTeam(teamId)
  const rep = team?.international_reputation ?? 1
  const pos = player?.position ?? 'CM'
  const overall = player?.overall ?? 70
  const age = player?.age ?? 20
  const attack = ['ST', 'LW', 'RW', 'CAM'].includes(pos) || ['LM', 'RM', 'CM'].includes(pos)

  // Prioridad canchera: club chico → descenso; banco → minutos; resto → goles/trofeo
  if (rep <= 2) {
    return { kind: 'avoid_relegation', label: 'Evitar el descenso' }
  }
  if (role === 'bench' || role === 'rotation') {
    return { kind: 'starter_minutes', label: 'Conseguir 18 partidos' }
  }
  if (attack) {
    const target = pos === 'ST' ? 12 : 8
    return { kind: 'goal_contrib', label: `Sumar ${target} goles o asistencias` }
  }
  if (rep >= 3) {
    return { kind: 'win_trophy', label: 'Levantar un trofeo' }
  }
  if (overall >= 68 && age >= 18) {
    return { kind: 'national_callup', label: 'Ser convocado a la selección' }
  }
  return { kind: 'starter_minutes', label: 'Jugar al menos 28 partidos' }
}

export function evaluateSeasonObjective(
  state: GameState,
  season: SeasonRecord,
): SeasonObjective | null {
  const obj = state.seasonObjective
  if (!obj) return null

  const next: SeasonObjective = { ...obj }
  switch (obj.kind) {
    case 'starter_minutes':
      next.progress = season.stats.appearances
      next.completed = season.stats.appearances >= obj.target
      next.failed = !next.completed
      break
    case 'goal_contrib':
      next.progress = season.stats.goals + season.stats.assists
      next.completed = next.progress >= obj.target
      next.failed = !next.completed
      break
    case 'avoid_relegation':
      next.progress = season.struggle === 'relegated' ? 0 : 1
      next.completed = season.struggle !== 'relegated'
      next.failed = season.struggle === 'relegated'
      break
    case 'win_trophy':
      next.progress = season.trophies.length
      next.completed = season.trophies.length >= obj.target
      next.failed = !next.completed
      break
    case 'national_callup':
      next.progress = state.pendingNationalCallup ? 1 : 0
      next.completed = Boolean(state.pendingNationalCallup) || state.nationalTeamPeriods.some((p) => p.age === season.age)
      next.failed = !next.completed
      break
  }
  return next
}
