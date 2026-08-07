import { getEventDef } from '../events/catalog'
import type { GameState } from './types'

/**
 * Keep presentation text out of persisted state where the event has a stable ID.
 * This is deliberately a display-only normalization pass: it does not touch RNG,
 * stats, offers, probabilities, season simulation or any other gameplay value.
 */
export function normalizeDisplayState(state: GameState): GameState {
  let currentEvent = state.currentEvent

  if (currentEvent?.type === 'career_choice') {
    const def = getEventDef(currentEvent.eventId)
    if (def) {
      currentEvent = {
        ...currentEvent,
        title: def.titleKey,
        body: def.bodyKey,
        choices: def.choices.map((choice) => ({ id: choice.id, label: choice.labelKey })),
      }
    }
  } else if (currentEvent?.type === 'trait_pick') {
    currentEvent = {
      ...currentEvent,
      title: 'traits.title',
      body: 'traits.body',
      options: currentEvent.options.map((option) => ({
        ...option,
        label: `trait.${option.id}`,
        desc: `trait.${option.id}.desc`,
      })),
    }
  } else if (currentEvent?.type === 'retire') {
    currentEvent = {
      ...currentEvent,
      title: 'retire.title',
      body: `retire.${currentEvent.reason}`,
    }
  } else if (currentEvent?.type === 'youth_loan_choice') {
    currentEvent = {
      ...currentEvent,
      title: 'youthLoan.title',
      body: 'youthLoan.body',
    }
  }

  return currentEvent === state.currentEvent ? state : { ...state, currentEvent }
}
