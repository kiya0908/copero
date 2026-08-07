import { getCompetition, getCountry, getTeam } from '../../data/catalog'
import { flagUrl } from '../../data/flags'
import { aggregateTrophies } from '../../data/trophies'
import type { GameState } from '../../engine/types'
import { countryName, useI18n } from '../../i18n/config'
import { OvrBadge } from './OvrBadge'
import { AssistsIcon, GoalsIcon, MatchesIcon, StatIcons } from './StatIcons'
import { TrophyIcon } from './TrophyIcon'

export function CareerTimeline({ state, choosingClub, decidingCareer }: { state: GameState; choosingClub?: boolean; decidingCareer?: boolean }) {
  const { locale, t } = useI18n()
  const player = state.player
  const country = player ? getCountry(player.nationalityFifa) : undefined
  const rows = state.seasons.map((season) => ({ season, team: getTeam(season.teamId), competition: getCompetition(season.competitionId ?? getTeam(season.teamId)?.competition_id ?? '') }))
  return (
    <div className="glass-card flex min-h-[520px] flex-col overflow-hidden rounded-2xl">
      <div className="grid grid-cols-[48px_minmax(0,1fr)_48px_minmax(112px,.9fr)] gap-2 border-b border-[var(--border)] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]"><span>{t('career.timeline.age')}</span><span>{t('career.timeline.club')}</span><span>OVR</span><span className="flex items-center gap-3"><MatchesIcon className="h-3.5 w-3.5 text-[var(--accent)]" /><GoalsIcon className="h-3.5 w-3.5" /><AssistsIcon className="h-3.5 w-3.5" /></span></div>
      <div className="flex-1 overflow-y-auto p-2">
        {rows.map(({ season, team, competition }, index) => {
          const parent = season.loan && season.loanParentTeamId ? getTeam(season.loanParentTeamId) : undefined
          return <div key={`${season.index}-${season.teamId}-${index}`} className="mb-1 grid grid-cols-[48px_minmax(0,1fr)_48px_minmax(112px,.9fr)] items-center gap-2 rounded-xl px-2 py-2 hover:bg-white/[.035]">
            <span className="grid h-8 w-10 place-items-center rounded-lg bg-white/8 font-mono text-sm font-bold">{season.age}</span>
            <div className="min-w-0"><div className="flex min-w-0 items-center gap-2">{parent ? <><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white p-1">{parent.logo_url ? <img src={parent.logo_url} alt="" className="h-full w-full object-contain" /> : '?'}</span><span className="text-[var(--muted)]">→</span></> : null}<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white p-1">{team?.logo_url ? <img src={team.logo_url} alt="" className="h-full w-full object-contain" /> : <span className="text-black/50">?</span>}</span><span className="truncate text-sm font-bold">{team?.name ?? season.teamId}</span>{season.trophies.slice(0,2).map((tr, i) => <TrophyIcon key={`${tr.id}-${i}`} src={tr.assetPath} name={tr.name} className="h-5 w-5" />)}</div><div className="mt-1 flex min-w-0 flex-wrap gap-1">{competition ? <span className="max-w-[150px] truncate rounded-md bg-white/8 px-1.5 py-0.5 font-mono text-[9px] text-[var(--muted)]">{competition.name}</span> : null}{season.loan ? <Tag>{t('career.loan')}</Tag> : null}{season.struggle === 'promoted' ? <Tag>{t('career.promotion')}</Tag> : null}{season.struggle === 'relegated' ? <Tag>{t('career.relegation')}</Tag> : null}{season.injured ? <Tag>{t('career.injury')}</Tag> : null}{season.suspended ? <Tag>{t('career.suspended')}</Tag> : null}</div></div>
            <OvrBadge overall={season.overall} size="sm" />
            <StatIcons appearances={season.stats.appearances} goals={season.stats.goals} assists={season.stats.assists} animate={false} compact />
          </div>
        })}
        {state.phase !== 'summary' && state.currentEvent?.type !== 'retire' ? <div className="grid grid-cols-[48px_minmax(0,1fr)_48px_minmax(112px,.9fr)] items-center gap-2 rounded-xl bg-white/[.03] px-2 py-2"><span className="grid h-8 w-10 place-items-center rounded-lg border border-[var(--border)] font-mono text-sm text-[var(--muted)]">{player?.age ?? '—'}</span><span className="pulse-pick truncate text-sm text-[var(--muted)]">{choosingClub ? t('career.timeline.choosing') : decidingCareer ? t('career.timeline.decision') : player ? (getTeam(state.currentTeamId ?? '')?.name ?? t('common.freeAgent')) : '—'}</span>{player ? <OvrBadge overall={player.overall} size="sm" /> : <span />}</div> : null}
      </div>
      <div className="border-t border-[var(--border)] bg-[var(--accent-soft)] px-4 py-3"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2">{country ? <img src={flagUrl(country.iso_alpha2)} alt="" className="h-5 w-7 rounded-sm" /> : null}{country?.logo_url ? <img src={country.logo_url} alt="" className="h-6 w-6 object-contain" /> : null}<div><div className="font-mono text-[10px] font-bold uppercase tracking-wide text-[var(--accent)]">{t('career.nationalTeam')}</div><span className="text-sm font-bold">{country ? countryName(country, locale) : t('career.nationalTeam')}</span></div>{aggregateTrophies(state.nationalTrophies ?? []).map((tr) => <TrophyIcon key={tr.id} src={tr.assetPath} name={tr.name} className="h-5 w-5" count={tr.count} />)}</div><StatIcons appearances={state.nationalTotals.appearances} goals={state.nationalTotals.goals} assists={state.nationalTotals.assists} /></div><div className="mt-2 text-[11px] text-[var(--muted)]">{state.nationalTeamPeriods.length ? (() => { const last = state.nationalTeamPeriods[state.nationalTeamPeriods.length - 1]!; return t('career.lastCallup', { age: last.age, apps: last.stats.appearances, goals: last.stats.goals, assists: last.stats.assists }) })() : t('career.noCallups')}</div></div>
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded-md border border-[var(--border)] bg-black/15 px-1.5 py-0.5 font-mono text-[9px] uppercase text-[var(--muted)]">{children}</span> }
