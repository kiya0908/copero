import { getTeam } from '../data/catalog'
import { nextRng, pickOne } from './rng'
import type { GameState, PlayingRole, Position, SeasonObjective, SeasonObjectiveKind, SeasonRecord, TraitId } from './types'

const TRAIT_POOL: { id: TraitId; label: string; desc: string }[] = [
  { id: 'ambitious', label: 'trait.ambitious', desc: 'trait.ambitious.desc' },
  { id: 'loyal', label: 'trait.loyal', desc: 'trait.loyal.desc' },
  { id: 'party_risk', label: 'trait.party_risk', desc: 'trait.party_risk.desc' },
  { id: 'professional', label: 'trait.professional', desc: 'trait.professional.desc' },
  { id: 'media_magnet', label: 'trait.media_magnet', desc: 'trait.media_magnet.desc' },
]

export function traitMeta(id: TraitId) { return TRAIT_POOL.find((t) => t.id === id) }
export function allTraitOptions() { return TRAIT_POOL }
export function pickTraitOptions(state: GameState, count = 3): { state: GameState; options: typeof TRAIT_POOL } { let s=state.rngState; const pool=[...TRAIT_POOL]; const options:typeof TRAIT_POOL=[]; for(let i=0;i<count&&pool.length;i+=1){const pick=pickOne(s,pool);s=pick.state;options.push(pick.item);const idx=pool.findIndex((t)=>t.id===pick.item.id);if(idx>=0)pool.splice(idx,1)} return {state:{...state,rngState:s},options} }

function objective(kind: SeasonObjectiveKind, target: number): SeasonObjective { return { kind, label: `objective.${kind}`, target, progress: 0 } }

export function generateSeasonObjective(state: GameState): { state: GameState; objective: SeasonObjective } {
  if (!state.player || !state.currentTeamId || !state.contract) return { state, objective: { ...objective('starter_minutes',20), briefed:false } }
  let s=state.rngState
  const team=getTeam(state.currentTeamId); const rep=team?.international_reputation ?? 1; const role=state.contract.role; const pos=state.player.position
  const attack=['ST','LW','RW','CAM'].includes(pos)||['LM','RM','CM'].includes(pos)
  type Cand={item:SeasonObjective;weight:number}; const candidates:Cand[]=[]
  candidates.push({ item: objective('starter_minutes', role === 'bench' || role === 'rotation' ? 18 : 28), weight: role === 'bench' || role === 'rotation' ? 28 : 18 })
  candidates.push({ item: objective('goal_contrib', attack ? (pos === 'ST' ? 12 : 8) : 4), weight: attack ? 24 : 12 })
  if(rep<=2)candidates.push({item:objective('avoid_relegation',1),weight:22})
  if(rep>=2)candidates.push({item:objective('win_trophy',1),weight:rep>=4?16:10})
  if(state.player.overall>=68&&state.player.age>=18)candidates.push({item:objective('national_callup',1),weight:14})
  const total=candidates.reduce((n,c)=>n+c.weight,0); const roll=nextRng(s); s=roll.state; let acc=0; let chosen=candidates[0]!.item; const r=roll.value*total; for(const c of candidates){acc+=c.weight;if(r<=acc){chosen=c.item;break}}
  return {state:{...state,rngState:s},objective:chosen}
}

export function previewObjectiveForClub(player: { position: Position; overall: number; age: number } | null | undefined, teamId: string, role: PlayingRole): { kind: SeasonObjectiveKind; label: string; target: number } {
  const team=getTeam(teamId); const rep=team?.international_reputation ?? 1; const pos=player?.position ?? 'CM'; const overall=player?.overall ?? 70; const age=player?.age ?? 20; const attack=['ST','LW','RW','CAM'].includes(pos)||['LM','RM','CM'].includes(pos)
  if(rep<=2)return {kind:'avoid_relegation',label:'objective.avoid_relegation',target:1}
  if(role==='bench'||role==='rotation')return {kind:'starter_minutes',label:'objective.starter_minutes',target:18}
  if(attack){const target=pos==='ST'?12:8;return {kind:'goal_contrib',label:'objective.goal_contrib',target}}
  if(rep>=3)return {kind:'win_trophy',label:'objective.win_trophy',target:1}
  if(overall>=68&&age>=18)return {kind:'national_callup',label:'objective.national_callup',target:1}
  return {kind:'starter_minutes',label:'objective.starter_minutes',target:28}
}

export function evaluateSeasonObjective(state: GameState, season: SeasonRecord): SeasonObjective | null {
  const obj=state.seasonObjective; if(!obj)return null; const next:SeasonObjective={...obj}
  switch(obj.kind){case 'starter_minutes':next.progress=season.stats.appearances;next.completed=season.stats.appearances>=obj.target;next.failed=!next.completed;break;case 'goal_contrib':next.progress=season.stats.goals+season.stats.assists;next.completed=next.progress>=obj.target;next.failed=!next.completed;break;case 'avoid_relegation':next.progress=season.struggle==='relegated'?0:1;next.completed=season.struggle!=='relegated';next.failed=season.struggle==='relegated';break;case 'win_trophy':next.progress=season.trophies.length;next.completed=season.trophies.length>=obj.target;next.failed=!next.completed;break;case 'national_callup':next.progress=state.pendingNationalCallup?1:0;next.completed=Boolean(state.pendingNationalCallup)||state.nationalTeamPeriods.some((p)=>p.age===season.age);next.failed=!next.completed;break}
  return next
}
