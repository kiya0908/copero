import { getCompetition } from '../data/catalog'
import type { PlayingRole, Team } from './types'

/** Delta de OVR al firmar en un club de origen (+/- según tier y rol). */
export function originOvrDelta(
  team: Team | undefined,
  role: PlayingRole,
): { delta: number; reason: string } {
  const rep = team?.international_reputation ?? 1
  const comp = team ? getCompetition(team.competition_id) : undefined
  const secondDiv = (comp?.tier ?? 1) >= 2

  let delta = 0
  let reason = 'Arranque neutro'

  if (rep >= 5) {
    delta = -2
    reason = 'Grande absoluto: menos minutos de entrada'
  } else if (rep >= 4) {
    delta = -1
    reason = 'Grande: pelearás el puesto'
  } else if (rep >= 3) {
    delta = 0
    reason = 'Escaparate: proyección alta, minutos a ganar'
  } else if (secondDiv || rep <= 1) {
    delta = 2
    reason = 'Ascenso / club chico: titular y referente'
  } else {
    delta = 1
    reason = 'Club mediano: buenos minutos'
  }

  if (role === 'starter' || role === 'undisputed') delta += 1
  else if (role === 'bench') delta -= 1

  delta = Math.max(-3, Math.min(3, delta))
  if (delta > 0) reason = `${reason} · +${delta} OVR`
  else if (delta < 0) reason = `${reason} · ${delta} OVR`
  return { delta, reason }
}

/** Rol inicial de cantera según reputación del club. */
export function academyStartRole(team: Team | undefined, rng: number): PlayingRole {
  const rep = team?.international_reputation ?? 1
  if (rep >= 5) return rng > 0.55 ? 'bench' : 'rotation'
  if (rep >= 4) return rng > 0.45 ? 'rotation' : 'bench'
  if (rep >= 3) return rng > 0.5 ? 'rotation' : 'starter'
  return 'starter'
}
