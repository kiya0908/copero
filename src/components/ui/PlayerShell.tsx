import type { ReactNode } from 'react'
import { getCountry, getTeam } from '../../data/catalog'
import { flagUrl } from '../../data/flags'
import { aggregateTrophies, collectCareerTrophies } from '../../data/trophies'
import { stageLabel } from '../../engine/careerPath'
import { traitMeta } from '../../engine/objectives'
import type { GameState } from '../../engine/types'
import { useI18n } from '../../i18n/config'
import {
  countryDisplayName,
  formatMoneyForLocale,
  objectiveLabel,
  type GameTranslate,
} from '../../i18n/game'
import { AnimatedNumber } from './AnimatedNumber'
import { CareerTimeline } from './CareerTimeline'
import { OvrBadge } from './OvrBadge'
import { StatIcons } from './StatIcons'
import { TrophyIcon } from './TrophyIcon'

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
  const { locale, t } = useI18n()
  const gameT: GameTranslate = (key, params) => t('game', key, params)
  const player = state.player
  if (!player) return null
  const team = state.currentTeamId ? getTeam(state.currentTeamId) : undefined
  const country = getCountry(player.nationalityFifa)
  const trophies = aggregateTrophies(collectCareerTrophies(state.seasons))
  const currentObjective = state.seasonObjective
  const currentObjectiveLabel = objectiveLabel(gameT, currentObjective)

  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[minmax(300px,0.95fr)_minmax(0,1.55fr)]">
      <div className="space-y-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex gap-3">
            <OvrBadge overall={player.overall} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {country && <img src={flagUrl(country.iso_alpha2)} alt="" className="h-4 w-6 rounded-sm" />}
                <span className="rounded-full bg-violet-700/90 px-2.5 py-0.5 text-xs font-semibold text-white">
                  #{player.preferredNumber} {gameT(`position.${player.position}`)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
                  {team?.logo_url ? (
                    <img src={team.logo_url} alt="" className="h-5 w-5 object-contain" />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px]">?</span>
                  )}
                  {team?.name ?? gameT('offer.freeAgent')}
                </span>
              </div>
              <div className="mt-1 text-xs text-white/45">{countryDisplayName(locale, country)}</div>
              <div className="mt-3 flex flex-wrap gap-5">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-white/40">{gameT('hud.age')}</div>
                  <div className="text-xl font-bold"><AnimatedNumber value={player.age} /></div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-white/40">{gameT('hud.value')}</div>
                  <div className="text-xl font-bold">
                    <AnimatedNumber
                      value={player.marketValue}
                      format={(value) => formatMoneyForLocale(locale, Math.round(value))}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-wide text-white/40">
                {gameT(stageLabel(state.careerStage ?? 'local'))}
              </p>
            </div>
          </div>

          {currentObjective &&
            !currentObjective.completed &&
            !currentObjective.failed &&
            state.currentEvent?.type !== 'national_callup' && (
              <div className="mt-3 rounded-xl border border-sky-400/25 bg-sky-500/10 px-3 py-2">
                <div className="text-[10px] uppercase tracking-wide text-sky-200/70">{gameT('hud.objective')}</div>
                <div className="text-sm font-medium text-white">
                  {gameT('objective.pending', { label: currentObjectiveLabel })}
                  {currentObjective.target > 1 && (
                    <span className="text-white/50"> · {currentObjective.progress}/{currentObjective.target}</span>
                  )}
                </div>
              </div>
            )}

          {(state.traits?.length ?? 0) > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {state.traits.map((trait) => {
                const meta = traitMeta(trait)
                return (
                  <span
                    key={trait}
                    className="rounded-full border border-sky-400/30 bg-sky-500/15 px-2 py-0.5 text-[10px] text-sky-100"
                  >
                    {meta ? gameT(meta.labelKey) : trait}
                  </span>
                )
              })}
            </div>
          )}

          <div className="mt-4">
            <StatIcons
              appearances={state.totals.appearances}
              goals={state.totals.goals}
              assists={state.totals.assists}
            />
          </div>

          <NationalSummary state={state} />

          <div className="mt-4 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            {trophies.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-white/45">
                <span aria-hidden>🏆</span>
                <span>{gameT('timeline.emptyTrophies')}</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                {trophies.map((trophy) => (
                  <TrophyIcon
                    key={`${trophy.id}-${trophy.assetPath}`}
                    src={trophy.assetPath}
                    name={trophy.name}
                    count={trophy.count}
                    className="h-9 w-9"
                  />
                ))}
              </div>
            )}
          </div>

          {state.modifiers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {state.modifiers.map((modifier) => (
                <span
                  key={modifier}
                  className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/70"
                >
                  {gameT(`mod.${modifier}`)}
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

function NationalSummary({ state }: { state: GameState }) {
  const { locale, t } = useI18n()
  const gameT: GameTranslate = (key, params) => t('game', key, params)
  const player = state.player
  if (!player) return null
  const country = getCountry(player.nationalityFifa)
  const national = state.nationalTotals
  const periods = state.nationalTeamPeriods ?? []
  const last = periods[periods.length - 1]
  const hasCaps = (national?.appearances ?? 0) > 0 || periods.length > 0
  const recentCallup = Boolean(last && Math.abs(player.age - last.age) <= 1)

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
          {country && <img src={flagUrl(country.iso_alpha2)} alt="" className="h-4 w-6 rounded-sm" />}
          <span className="text-[10px] font-bold uppercase tracking-wide text-sky-100">
            {gameT('national.title')} · {countryDisplayName(locale, country)}
          </span>
          {recentCallup && (
            <span className="rounded-full bg-sky-400 px-2 py-0.5 text-[9px] font-extrabold uppercase text-black">
              {gameT('national.called')}
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
          ? gameT('national.last', {
              age: last.age,
              apps: last.stats.appearances,
              goals: last.stats.goals,
              assists: last.stats.assists,
            })
          : gameT('national.none')}
      </p>
    </div>
  )
}
