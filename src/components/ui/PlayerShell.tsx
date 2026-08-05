import type { ReactNode } from 'react'
import { getCountry, getTeam } from '../../data/catalog'
import { flagUrl } from '../../data/flags'
import { aggregateTrophies, collectCareerTrophies } from '../../data/trophies'
import { stageLabel } from '../../engine/careerPath'
import { formatMoney } from '../../engine/development'
import { traitMeta } from '../../engine/objectives'
import type { GameState } from '../../engine/types'
import { t } from '../../i18n/es'
import { AnimatedNumber } from './AnimatedNumber'
import { CareerTimeline } from './CareerTimeline'
import { OvrBadge } from './OvrBadge'
import { StatIcons } from './StatIcons'
import { TrophyIcon } from './TrophyIcon'
import { positionLabel } from './positions'

export function PlayerShell({
  state,
  choosingClub,
  decidingCareer,
  leftExtra,
}: {
  state: GameState
  choosingClub?: boolean
  decidingCareer?: boolean
  leftExtra?: ReactNode
}) {
  const player = state.player
  if (!player) return null
  const team = state.currentTeamId ? getTeam(state.currentTeamId) : undefined
  const country = getCountry(player.nationalityFifa)
  const trophies = aggregateTrophies(collectCareerTrophies(state.seasons))

  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[minmax(300px,0.95fr)_minmax(0,1.55fr)]">
      <div className="space-y-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex gap-3">
            <OvrBadge overall={player.overall} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {country && (
                  <img src={flagUrl(country.iso_alpha2)} alt="" className="h-4 w-6 rounded-sm" />
                )}
                <span className="rounded-full bg-violet-700/90 px-2.5 py-0.5 text-xs font-semibold text-white">
                  #{player.preferredNumber} {positionLabel(player.position)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
                  {team?.logo_url ? (
                    <img src={team.logo_url} alt="" className="h-5 w-5 object-contain" />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px]">
                      ?
                    </span>
                  )}
                  {team?.name ?? 'Libre'}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-5">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-white/40">{t('hud.age')}</div>
                  <div className="text-xl font-bold">
                    <AnimatedNumber value={player.age} />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-white/40">{t('hud.value')}</div>
                  <div className="text-xl font-bold">
                    <AnimatedNumber value={player.marketValue} format={(n) => formatMoney(Math.round(n))} />
                  </div>
                </div>
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-wide text-white/40">
                {stageLabel(state.careerStage ?? 'local')}
              </p>
            </div>
          </div>
          {state.seasonObjective &&
            !state.seasonObjective.completed &&
            !state.seasonObjective.failed &&
            state.currentEvent?.type !== 'national_callup' && (
            <div className="mt-3 rounded-xl border border-sky-400/25 bg-sky-500/10 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide text-sky-200/70">{t('hud.objective')}</div>
              <div className="text-sm font-medium text-white">
                {state.seasonObjective.completed
                  ? `✓ ${state.seasonObjective.label}`
                  : state.seasonObjective.failed
                    ? `✗ ${state.seasonObjective.label}`
                    : t('objective.pending', { label: state.seasonObjective.label })}
                {!state.seasonObjective.completed &&
                  !state.seasonObjective.failed &&
                  state.seasonObjective.target > 1 && (
                    <span className="text-white/50">
                      {' '}
                      · {state.seasonObjective.progress}/{state.seasonObjective.target}
                    </span>
                  )}
              </div>
            </div>
          )}
          {(state.traits?.length ?? 0) > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {state.traits.map((tr) => (
                <span
                  key={tr}
                  className="rounded-full border border-sky-400/30 bg-sky-500/15 px-2 py-0.5 text-[10px] text-sky-100"
                >
                  {traitMeta(tr)?.label ?? tr}
                </span>
              ))}
            </div>
          )}
          <div className="mt-4">
            <StatIcons
              appearances={state.totals.appearances}
              goals={state.totals.goals}
              assists={state.totals.assists}
            />
          </div>
          {(() => {
            const national = state.nationalTotals
            const periods = state.nationalTeamPeriods ?? []
            const last = periods[periods.length - 1]
            const hasCaps = (national?.appearances ?? 0) > 0 || periods.length > 0
            const recentCallup = last && Math.abs((player.age ?? 0) - last.age) <= 1
            return (
              <div
                className={`mt-3 rounded-xl border px-3 py-2.5 ${
                  hasCaps || recentCallup
                    ? 'border-sky-400/40 bg-gradient-to-r from-sky-500/20 to-sky-500/5'
                    : 'border-white/15 bg-white/5'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {country && (
                      <img src={flagUrl(country.iso_alpha2)} alt="" className="h-4 w-6 rounded-sm" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wide text-sky-100">
                      Selección
                    </span>
                    {recentCallup && (
                      <span className="rounded-full bg-sky-400 px-2 py-0.5 text-[9px] font-extrabold uppercase text-black">
                        Convocado
                      </span>
                    )}
                  </div>
                  {hasCaps && (
                    <StatIcons
                      appearances={national.appearances}
                      goals={national.goals}
                      assists={national.assists}
                    />
                  )}
                </div>
                <p className={`mt-1.5 text-[11px] ${hasCaps ? 'text-white/75' : 'text-white/55'}`}>
                  {last
                    ? `Última convocatoria · ${last.age} años · ${last.stats.appearances} PJ · ${last.stats.goals} GLS · ${last.stats.assists} AST`
                    : 'Sin convocatorias todavía'}
                </p>
              </div>
            )
          })()}
          <div className="mt-4 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            {trophies.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-white/45">
                <span aria-hidden>🏆</span>
                <span>VITRINA VACÍA</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                {trophies.map((tr) => (
                  <TrophyIcon
                    key={`${tr.id}-${tr.assetPath}`}
                    src={tr.assetPath}
                    name={tr.name}
                    count={tr.count}
                    className="h-9 w-9"
                  />
                ))}
              </div>
            )}
          </div>
          {state.modifiers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {state.modifiers.map((m) => (
                <span
                  key={m}
                  className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/70"
                >
                  {t(`mod.${m}`)}
                </span>
              ))}
            </div>
          )}
        </div>
        {leftExtra}
      </div>
      <CareerTimeline state={state} choosingClub={choosingClub} decidingCareer={decidingCareer} />
    </section>
  )
}
