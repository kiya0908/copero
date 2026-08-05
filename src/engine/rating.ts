import type { GameState } from './types'

export type CareerGrade = 'D' | 'C' | 'B' | 'A' | 'S'

export type CareerRating = {
  score: number
  grade: CareerGrade
  label: string
}

export function calculateCareerRating(state: GameState): CareerRating {
  const player = state.player
  if (!player) return { score: 0, grade: 'D', label: 'Carrera incompleta' }

  const peakOverall = Math.max(
    player.peakOverall ?? player.overall,
    player.overall,
    ...state.seasons.map((season) => season.overall),
  )
  const clubTrophies = state.seasons.reduce((total, season) => total + season.trophies.length, 0)
  const nationalTrophies = state.nationalTrophies?.length ?? 0
  const awards = state.seasons.reduce((total, season) => total + season.awards.length, 0)
  const score = Math.round(
    peakOverall * 4 +
      state.totals.goals * 0.7 +
      state.totals.assists * 0.55 +
      clubTrophies * 14 +
      nationalTrophies * 25 +
      awards * 20,
  )

  if (score >= 720) return { score, grade: 'S', label: 'Leyenda del fútbol' }
  if (score >= 590) return { score, grade: 'A', label: 'Estrella mundial' }
  if (score >= 460) return { score, grade: 'B', label: 'Figura internacional' }
  if (score >= 330) return { score, grade: 'C', label: 'Profesional consolidado' }
  return { score, grade: 'D', label: 'Carrera de lucha' }
}
