export type EventOutcomePill = {
  tone: 'positive' | 'negative' | 'neutral'
  label: string
  chance?: number
}

export type EventChoiceVisual = {
  imageKey: string
  imageSrc: string
  outcomes: EventOutcomePill[]
}

/** Maps our eventId + choiceId → Copero career-events image key */
const IMAGE_KEY: Record<string, Record<string, string>> = {
  training_extra: {
    accept: 'training_extra-accept',
    reject: 'training_extra-reject',
  },
  rival_offer: {
    listen: 'rival_offer-accept',
    reject: 'rival_offer-reject',
  },
  club_crisis: {
    stay_and_fight: 'tax_trouble-stay_and_fight',
    request_exit: 'rival_offer-accept',
  },
  mysterious_substance: {
    consume: 'mysterious_substance-consume',
    reject: 'mysterious_substance-reject',
  },
  scout_discovery: {
    embrace: 'unexpected_prospect-mentor',
  },
  final_hattrick: {
    celebrate: 'position_competition-compete',
  },
  iron_genetics: {
    accept: 'honesty_test-accept',
    ignore: 'honesty_test-reject',
  },
  miracle_doctor: {
    accept: 'injury_at_peak-recover',
    reject: 'injury_at_peak-play_injured',
  },
  media_scandal: {
    deny: 'controversial_post-support_club',
    apologize: 'controversial_statement-apologize',
  },
  career_ending_injury: {
    fight: 'injury-continue',
    retire_medical: 'injury_at_peak-recover',
  },
  agent_scam: {
    sue: 'indecent_proposal-reject',
    accept_loss: 'indecent_proposal-proceed',
  },
  doping_temptation: {
    consume: 'mysterious_substance-consume',
    reject: 'mysterious_substance-reject',
  },
  personal_coach: {
    accept: 'personal_coach-nutrition_plan-accept',
    reject: 'personal_coach-nutrition_plan-reject',
  },
  position_change: {
    accept: 'position_change-accept',
    reject: 'position_change-reject',
  },
  ar_media_pressure: {
    face_cameras: 'controversial_statement-apologize',
    silence: 'controversial_post-support_club',
  },
  mx_food_poisoning: {
    rest: 'injury_at_peak-recover',
    play_through: 'injury_at_peak-play_injured',
  },
  mx_clasico_pressure: {
    embrace: 'position_competition-compete',
    hide: 'season_load-stay_calm',
  },
  ar_clasico_week: {
    ready: 'position_competition-compete',
    nervous: 'season_load-stay_calm',
  },
  ar_ascenso_opportunity: {
    seize: 'unexpected_prospect-mentor',
    pass: 'rival_offer-reject',
  },
  br_calendar_fatigue: {
    rotate: 'season_load-accept',
    push: 'injury-continue',
  },
  br_rival_serie_a: {
    listen: 'rival_offer-accept',
    reject: 'rival_offer-reject',
  },
  br_carnival_break: {
    rest: 'injury_at_peak-recover',
    party: 'giant_tattoo-accept',
  },
  eu_travel_fatigue: {
    recover: 'season_load-stay_calm',
    play: 'season_load-accept',
  },
  eu_adaptation: {
    integrate: 'finish_high_school-accept',
    isolate: 'finish_high_school-reject',
  },
  mena_exit_clause: {
    accept_money: 'indecent_proposal-proceed',
    keep_clause: 'indecent_proposal-reject',
  },
  mls_adaptation: {
    buy_in: 'personal_coach-accept',
    tourist: 'personal_coach-reject',
  },
  concacaf_heat: {
    hydrate: 'injury_at_peak-recover',
    ignore: 'injury_at_peak-play_injured',
  },
}

const OUTCOMES: Record<string, Record<string, EventOutcomePill[]>> = {
  training_extra: {
    accept: [
      { tone: 'positive', label: '+2 OVR', chance: 70 },
      { tone: 'negative', label: '-1 OVR', chance: 30 },
    ],
    reject: [{ tone: 'neutral', label: 'Sin cambios' }],
  },
  rival_offer: {
    listen: [{ tone: 'positive', label: 'Ver ofertas' }],
    reject: [{ tone: 'neutral', label: 'Quedarte' }],
  },
  club_crisis: {
    stay_and_fight: [{ tone: 'positive', label: 'Titularidad +1 OVR' }],
    request_exit: [{ tone: 'neutral', label: 'Ver ofertas' }],
  },
  mysterious_substance: {
    consume: [
      { tone: 'positive', label: '+2 OVR', chance: 45 },
      { tone: 'negative', label: 'Suspensión', chance: 55 },
    ],
    reject: [{ tone: 'positive', label: '+1 OVR' }],
  },
  scout_discovery: {
    embrace: [{ tone: 'positive', label: '+4 OVR · Club top' }],
  },
  final_hattrick: {
    celebrate: [{ tone: 'positive', label: 'Titularidad absoluta' }],
  },
  iron_genetics: {
    accept: [{ tone: 'positive', label: 'Inmunidad lesiones' }],
    ignore: [{ tone: 'neutral', label: 'Sin cambios' }],
  },
  miracle_doctor: {
    accept: [{ tone: 'positive', label: 'Carrera hasta 45' }],
    reject: [{ tone: 'neutral', label: 'Sin cambios' }],
  },
  media_scandal: {
    deny: [{ tone: 'negative', label: '-15 OVR · ruina' }],
    apologize: [
      { tone: 'neutral', label: '-6 OVR' },
      { tone: 'neutral', label: 'Banco 1 temp' },
    ],
  },
  career_ending_injury: {
    fight: [{ tone: 'negative', label: '-20 OVR' }],
    retire_medical: [{ tone: 'negative', label: 'Retiro médico' }],
  },
  agent_scam: {
    sue: [{ tone: 'negative', label: '-25% fortuna' }],
    accept_loss: [{ tone: 'negative', label: '-50% fortuna' }],
  },
  doping_temptation: {
    consume: [
      { tone: 'positive', label: '+3 OVR riesgoso', chance: 25 },
      { tone: 'negative', label: 'Suspensión + ruina', chance: 75 },
    ],
    reject: [{ tone: 'positive', label: '+1 OVR limpio' }],
  },
  personal_coach: {
    accept: [
      { tone: 'positive', label: '+3 OVR', chance: 60 },
      { tone: 'negative', label: '-2 OVR', chance: 40 },
    ],
    reject: [{ tone: 'neutral', label: 'Sin cambios' }],
  },
  position_change: {
    accept: [
      { tone: 'positive', label: 'Titular próximo período' },
      { tone: 'negative', label: '-2 OVR temporal' },
    ],
    reject: [{ tone: 'negative', label: 'Menos minutos' }],
  },
  ar_media_pressure: {
    face_cameras: [
      { tone: 'positive', label: '+1 OVR' },
      { tone: 'positive', label: '+$80k' },
    ],
    silence: [
      { tone: 'negative', label: '-1 OVR' },
      { tone: 'negative', label: 'Baja de forma' },
    ],
  },
  mx_food_poisoning: {
    rest: [{ tone: 'neutral', label: 'Recuperarte' }],
    play_through: [{ tone: 'negative', label: 'Riesgo lesión' }],
  },
  mx_clasico_pressure: {
    embrace: [{ tone: 'positive', label: 'Rendimiento' }],
    hide: [{ tone: 'negative', label: 'Críticas' }],
  },
  ar_clasico_week: {
    ready: [
      { tone: 'positive', label: '+2 OVR' },
      { tone: 'positive', label: 'Titularidad' },
    ],
    nervous: [{ tone: 'negative', label: '-1 OVR' }],
  },
  ar_ascenso_opportunity: {
    seize: [
      { tone: 'positive', label: '+3 OVR' },
      { tone: 'positive', label: 'Ascenso real' },
    ],
    pass: [{ tone: 'neutral', label: 'Sin cambios' }],
  },
  br_calendar_fatigue: {
    rotate: [{ tone: 'positive', label: '+1 OVR' }],
    push: [
      { tone: 'negative', label: '-2 OVR' },
      { tone: 'negative', label: 'Cuerpo de cristal' },
    ],
  },
  br_rival_serie_a: {
    listen: [{ tone: 'positive', label: 'Ver ofertas' }],
    reject: [{ tone: 'neutral', label: 'Quedarte' }],
  },
  br_carnival_break: {
    rest: [{ tone: 'positive', label: '+1 OVR' }],
    party: [
      { tone: 'positive', label: 'Suerte', chance: 40 },
      { tone: 'negative', label: 'Resaca', chance: 60 },
    ],
  },
  eu_travel_fatigue: {
    recover: [{ tone: 'positive', label: 'Fresco' }],
    play: [{ tone: 'negative', label: 'Fatiga' }],
  },
  eu_adaptation: {
    integrate: [{ tone: 'positive', label: 'Adaptación' }],
    isolate: [{ tone: 'negative', label: 'Aislamiento' }],
  },
  mena_exit_clause: {
    accept_money: [{ tone: 'positive', label: 'Bonus' }],
    keep_clause: [{ tone: 'neutral', label: 'Cláusula intacta' }],
  },
  mls_adaptation: {
    buy_in: [{ tone: 'positive', label: 'Proyecto' }],
    tourist: [{ tone: 'neutral', label: 'Pasar' }],
  },
  concacaf_heat: {
    hydrate: [{ tone: 'positive', label: 'Listo' }],
    ignore: [{ tone: 'negative', label: 'Calambres' }],
  },
}

export function eventChoiceVisual(eventId: string, choiceId: string): EventChoiceVisual | null {
  const key = IMAGE_KEY[eventId]?.[choiceId]
  if (!key) return null
  return {
    imageKey: key,
    imageSrc: `/career-simulator/career-events/${key}.jpg`,
    outcomes: OUTCOMES[eventId]?.[choiceId] ?? [{ tone: 'neutral', label: 'Continuar' }],
  }
}

export const RETIREMENT_IMAGE = '/career-simulator/career-events/retirement.jpg'
