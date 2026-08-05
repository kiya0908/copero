import { emptyStats, startingOverall } from './development'
import { createSeed, seedToState } from './rng'
import type {
  GameMode,
  GameState,
  Player,
  Position,
  PreferredFoot,
} from './types'
import { START_AGE } from './types'

const STORAGE_PREFIX = 'simulador:career:play:v1:'

export function createInitialState(mode: GameMode = 'normal'): GameState {
  const seed = createSeed()
  return {
    phase: 'intro',
    mode,
    seed,
    rngState: seedToState(seed),
    step: 0,
    player: null,
    contract: null,
    currentTeamId: null,
    modifiers: [],
    traits: [],
    careerStage: 'local',
    seasonObjective: null,
    objectiveHistory: [],
    milestones: [],
    banSeasonsRemaining: 0,
    undisputedSeasonsRemaining: 0,
    seasons: [],
    nationalTeamPeriods: [],
    nationalTotals: emptyStats(),
    totals: emptyStats(),
    wealthEarned: 0,
    log: [],
    currentEvent: null,
    pendingOffers: [],
    celebration: null,
    activeLoanReturnTeamId: null,
    nationalTrophies: [],
    agentRerollUsed: false,
    pendingNationalCallup: null,
    traitsChosen: false,
    youthLoanOffered: false,
    formativeTeamId: null,
    ruinedAtSeasonIndex: null,
    teamCompetitionOverrides: {},
  }
}

export function startIdentity(state: GameState): GameState {
  return { ...state, phase: 'identity' }
}

export function createPlayer(
  state: GameState,
  input: {
    lastName: string
    preferredNumber: number
    preferredFoot: PreferredFoot
    position: Position
    nationalityFifa: string
    heritageNationalityFifa?: string | null
  },
): GameState {
  const started = startingOverall(input.position, state.rngState)
  const heritage =
    input.heritageNationalityFifa &&
    input.heritageNationalityFifa !== input.nationalityFifa
      ? input.heritageNationalityFifa
      : null
  const player: Player = {
    lastName: input.lastName.trim() || 'Jugador',
    preferredNumber: input.preferredNumber,
    preferredFoot: input.preferredFoot,
    position: input.position,
    nationalityFifa: input.nationalityFifa,
    heritageNationalityFifa: heritage,
    age: START_AGE,
    overall: started.overall,
    marketValue: 250_000,
    wealth: 0,
  }
  return {
    ...state,
    rngState: started.state,
    phase: 'origin',
    player,
    step: state.step + 1,
  }
}

export function saveState(state: GameState) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${state.seed}`, JSON.stringify(state))
  } catch {
    // ignore quota
  }
}

export function loadState(seed: string): GameState | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${seed}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GameState
    return {
      ...createInitialState(parsed.mode ?? 'normal'),
      ...parsed,
      traits: parsed.traits ?? [],
      careerStage: parsed.careerStage ?? 'local',
      seasonObjective: parsed.seasonObjective ?? null,
      objectiveHistory: parsed.objectiveHistory ?? [],
      milestones: parsed.milestones ?? [],
      traitsChosen: parsed.traitsChosen ?? (parsed.traits?.length ?? 0) > 0,
      youthLoanOffered: parsed.youthLoanOffered ?? false,
      formativeTeamId: parsed.formativeTeamId ?? parsed.seasons?.[0]?.teamId ?? null,
      ruinedAtSeasonIndex: parsed.ruinedAtSeasonIndex ?? null,
      teamCompetitionOverrides: parsed.teamCompetitionOverrides ?? {},
      player: parsed.player
        ? {
            ...parsed.player,
            heritageNationalityFifa: parsed.player.heritageNationalityFifa ?? null,
          }
        : null,
    }
  } catch {
    return null
  }
}

export function clearState(seed: string) {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${seed}`)
  } catch {
    // ignore
  }
}
