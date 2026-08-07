import type { ReactNode } from 'react'
import { getCountry, getTeam } from '../../data/catalog'
import { flagUrl } from '../../data/flags'
import { aggregateTrophies, collectCareerTrophies } from '../../data/trophies'
import type { GameState } from '../../engine/types'
import { formatMoney, objectiveText, positionText, stageText, traitText, useI18n } from '../../i18n/config'
import { AnimatedNumber } from './AnimatedNumber'
import { CareerTimeline } from './CareerTimeline'
import { OvrBadge } from './OvrBadge'
import { StatIcons } from './StatIcons'
import { TrophyIcon } from './TrophyIcon'

export function PlayerShell({ state, choosingClub, decidingCareer, leftExtra }: { state: GameState; choosingClub?: boolean; decidingCareer?: boolean; leftExtra?: ReactNode }) {
  const { locale, t } = useI18n()
  const player = state.player
  if (!player) return null
  const team = state.currentTeamId ? getTeam(state.currentTeamId) : undefined
  const country = getCountry(player.nationalityFifa)
  const trophies = aggregateTrophies(collectCareerTrophies(state.seasons))
  const objective = objectiveText(state.seasonObjective, t)
  const periods = state.nationalTeamPeriods ?? []
  const last = periods[periods.length - 1]
  const national = state.nationalTotals
  const hasCaps = (national?.appearances ?? 0) > 0 || periods.length > 0
  const recentCallup = Boolean(last && Math.abs(player.age - last.age) <= 1)
  return (
    <section className="site-container grid gap-4 py-5 lg:grid-cols-[minmax(300px,.95fr)_minmax(0,1.55fr)]">
      <div className="space-y-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex gap-3"><OvrBadge overall={player.overall} size="lg" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2">{country ? <img src={flagUrl(country.iso_alpha2)} alt="" className="h-4 w-6 rounded-sm" /> : null}<span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-bold text-[var(--accent)]">#{player.preferredNumber} {positionText(player.position, t, true)}</span><span className="inline-flex items-center gap-1.5 text-sm font-bold">{team?.logo_url ? <img src={team.logo_url} alt="" className="h-5 w-5 object-contain" /> : <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[10px]">?</span>}{team?.name ?? t('common.freeAgent')}</span></div><div className="mt-3 flex flex-wrap gap-5"><div><div className="font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">{t('hud.age')}</div><div className="font-display text-xl font-black"><AnimatedNumber value={player.age} /></div></div><div><div className="font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">{t('hud.value')}</div><div className="font-display text-xl font-black"><AnimatedNumber value={player.marketValue} format={(n) => formatMoney(Math.round(n), locale)} /></div></div></div><p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">{stageText(state.careerStage ?? 'local', t)}</p></div></div>
          {state.seasonObjective && !state.seasonObjective.completed && !state.seasonObjective.failed && state.currentEvent?.type !== 'national_callup' ? <div className="mt-3 rounded-xl border border-[color-mix(in_oklch,var(--accent)_25%,var(--border))] bg-[var(--accent-soft)] px-3 py-2"><div className="font-mono text-[10px] uppercase tracking-wide text-[var(--accent)]">{t('hud.objective')}</div><div className="text-sm font-bold">{objective}{state.seasonObjective.target > 1 ? <span className="text-[var(--muted)]"> · {state.seasonObjective.progress}/{state.seasonObjective.target}</span> : null}</div></div> : null}
          {state.traits.length > 0 ? <div className="mt-2 flex flex-wrap gap-1">{state.traits.map((trait) => <span key={trait} className="rounded-full border border-[var(--border)] bg-black/15 px-2 py-0.5 text-[10px] text-[var(--muted)]">{traitText(trait, t).label}</span>)}</div> : null}
          <div className="mt-4"><StatIcons appearances={state.totals.appearances} goals={state.totals.goals} assists={state.totals.assists} /></div>
          <div className={`mt-3 rounded-xl border px-3 py-2.5 ${hasCaps || recentCallup ? 'border-[color-mix(in_oklch,var(--accent)_32%,var(--border))] bg-[var(--accent-soft)]' : 'border-[var(--border)] bg-black/15'}`}><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2">{country ? <img src={flagUrl(country.iso_alpha2)} alt="" className="h-4 w-6 rounded-sm" /> : null}<span className="font-mono text-[10px] font-bold uppercase tracking-wide">{t('career.nationalTeam')}</span>{recentCallup ? <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 font-mono text-[9px] font-black uppercase text-[var(--accent-ink)]">{t('career.called')}</span> : null}</div>{hasCaps ? <StatIcons appearances={national.appearances} goals={national.goals} assists={national.assists} /> : null}</div><p className="mt-1.5 text-[11px] text-[var(--muted)]">{last ? t('career.lastCallup', { age: last.age, apps: last.stats.appearances, goals: last.stats.goals, assists: last.stats.assists }) : t('career.noCallups')}</p></div>
          <div className="mt-4 rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2">{trophies.length === 0 ? <div className="flex items-center gap-2 text-xs text-[var(--muted)]"><span aria-hidden>🏆</span><span>{t('career.trophyEmpty')}</span></div> : <div className="flex flex-wrap items-center gap-3">{trophies.map((tr) => <TrophyIcon key={`${tr.id}-${tr.assetPath}`} src={tr.assetPath} name={tr.name} count={tr.count} className="h-9 w-9" />)}</div>}</div>
          {state.modifiers.length > 0 ? <div className="mt-2 flex flex-wrap gap-1">{state.modifiers.map((modifier) => <span key={modifier} className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--muted)]">{t(`mod.${modifier}`)}</span>)}</div> : null}
        </div>
        {leftExtra}
      </div>
      <CareerTimeline state={state} choosingClub={choosingClub} decidingCareer={decidingCareer} />
    </section>
  )
}
