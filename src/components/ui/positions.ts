import type { Position } from '../../engine/types'

export const POSITION_LABELS: Record<Position, string> = {
  GK: 'POR',
  CB: 'DFC',
  LB: 'LI',
  RB: 'LD',
  CDM: 'MCD',
  CM: 'MC',
  CAM: 'MCO',
  LM: 'MI',
  RM: 'MD',
  LW: 'EI',
  RW: 'ED',
  ST: 'DC',
}

/** Pitch layout: coords relative to inset pitch area (top = attack) */
export const PITCH_LAYOUT: { id: Position; label: string; top: string; left: string }[] = [
  { id: 'LW', label: 'EI', top: '14%', left: '22%' },
  { id: 'ST', label: 'DC', top: '12%', left: '50%' },
  { id: 'RW', label: 'ED', top: '14%', left: '78%' },
  { id: 'LM', label: 'MI', top: '32%', left: '22%' },
  { id: 'CAM', label: 'MCO', top: '32%', left: '50%' },
  { id: 'RM', label: 'MD', top: '32%', left: '78%' },
  { id: 'CM', label: 'MC', top: '48%', left: '50%' },
  { id: 'CDM', label: 'MCD', top: '60%', left: '50%' },
  { id: 'LB', label: 'LI', top: '74%', left: '22%' },
  { id: 'CB', label: 'DFC', top: '74%', left: '50%' },
  { id: 'RB', label: 'LD', top: '74%', left: '78%' },
  { id: 'GK', label: 'POR', top: '88%', left: '50%' },
]

export function positionLabel(pos: Position): string {
  return POSITION_LABELS[pos] ?? pos
}

export function shortClubName(name: string): string {
  if (name.length <= 18) return name
  return name
    .replace(/^Club Atlético /i, '')
    .replace(/^Club Deportivo /i, '')
    .replace(/^Asociación Atlética /i, '')
    .slice(0, 18)
}
