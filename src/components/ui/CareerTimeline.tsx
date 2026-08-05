import { getCountry, getCompetition, getTeam } from '../../data/catalog'
import { flagUrl } from '../../data/flags'
import { aggregateTrophies } from '../../data/trophies'
import { hasModifier } from '../../engine/modifiers'
import type { GameState } from '../../engine/types'
import {
  BASE_RETIREMENT_AGE,
  LONGEVITY_RETIREMENT_AGE,
  MODE_CONFIG,
  START_AGE,
} from '../../engine/types'
import { OvrBadge } from './OvrBadge'
import { AssistsIcon, GoalsIcon, MatchesIcon, StatIcons } from './StatIcons'
import { TrophyIcon } from './TrophyIcon'

function contrastText(hex?: string): string {
  if (!hex || !/^#?[0-9a-fA-F]{6}$/.test(hex.replace('#', ''))) return '#fff'
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 140 ? '#111' : '#fff'
}

export function CareerTimeline({
  state,
  choosingClub,
  decidingCareer,
}: {
  state: GameState
  choosingClub?: boolean
  decidingCareer?: boolean
}) {
  const maxAge = hasModifier(state, 'iron_longevity') ? LONGEVITY_RETIREMENT_AGE : BASE_RETIREMENT_AGE
  const startAge = START_AGE
  const step = MODE_CONFIG[state.mode].periodLengthSeasons
  const currentAge = state.player?.age ?? startAge
  const lastSeason = state.seasons[state.seasons.length - 1]
  const retired =
    state.phase === 'summary' || state.currentEvent?.type === 'retire'

  // Solo hasta el último bucket con temporadas (evita fila vacía al retirar)
  const lastPlayedAge = lastSeason?.age ?? startAge
  const lastBucketWithData =
    startAge + Math.floor((lastPlayedAge - startAge) / step) * step
  const currentBucket = startAge + Math.floor((currentAge - startAge) / step) * step

  const ages: number[] = []
  if (state.seasons.length === 0 && !retired) {
    for (
      let a = startAge;
      a <= startAge + Math.floor((maxAge - startAge) / step) * step;
      a += step
    ) {
      ages.push(a)
    }
  } else {
    // Incluir bucket actual solo si aún no está retirado y hay actividad en curso
    const displayEnd = retired
      ? lastBucketWithData
      : Math.min(maxAge, Math.max(lastBucketWithData, currentBucket))
    for (let a = startAge; a <= displayEnd; a += step) ages.push(a)
    // Quitar última fila si no tiene temporadas y no es el bucket activo en carrera
    while (ages.length > 0) {
      const tail = ages[ages.length - 1]!
      const hasData = state.seasons.some(
        (s) => startAge + Math.floor((s.age - startAge) / step) * step === tail,
      )
      const isActiveCareer = !retired && tail === currentBucket
      if (hasData || isActiveCareer) break
      ages.pop()
    }
  }

  const byAge = new Map<number, (typeof state.seasons)[number][]>()
  for (const s of state.seasons) {
    const bucket = startAge + Math.floor((s.age - startAge) / step) * step
    const list = byAge.get(bucket) ?? []
    list.push(s)
    byAge.set(bucket, list)
  }

  const country = state.player ? getCountry(state.player.nationalityFifa) : undefined
  const national = state.nationalTotals ?? {
    appearances: 0,
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    goalsConceded: 0,
  }

  return (
    <div className="glass-card flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl">
      <div className="grid grid-cols-[52px_1fr_52px_minmax(0,1.2fr)] gap-2 border-b border-white/10 px-3 py-2 text-[10px] uppercase tracking-wider text-white/40">
        <span>Edad</span>
        <span>Club</span>
        <span>OVR</span>
        <span className="flex items-center gap-2.5">
          <MatchesIcon className="h-3.5 w-3.5 text-emerald-400/80" />
          <GoalsIcon className="h-3.5 w-3.5 text-white/70" />
          <AssistsIcon className="h-3.5 w-3.5 text-sky-300/80" />
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {ages.map((age) => {
          const seasons = byAge.get(age) ?? []
          const isCurrent = currentAge >= age && currentAge < age + step
          const first = seasons[0]
          const last = seasons[seasons.length - 1]
          const loanSeason = [...seasons].reverse().find((s) => s.loan)
          const displaySeason = loanSeason ?? last
          const team = displaySeason ? getTeam(displaySeason.teamId) : undefined
          const competitionId =
            displaySeason?.competitionId ??
            (team && displaySeason
              ? (state.teamCompetitionOverrides?.[displaySeason.teamId] ?? team.competition_id)
              : undefined)
          const competition = competitionId ? getCompetition(competitionId) : undefined
          const displayTier = competition?.tier
          const hadRelegation = seasons.some((s) => s.struggle === 'relegated')
          const hadPromotion = seasons.some((s) => s.struggle === 'promoted')
          const hadSuspension = seasons.some((s) => s.suspended)
          const hadInjury = seasons.some((s) => s.injured)
          const hadLoan = Boolean(loanSeason)
          const loanParentId =
            loanSeason?.loanParentTeamId ??
            (hadLoan ? state.formativeTeamId ?? undefined : undefined)
          const parentTeam = loanParentId ? getTeam(loanParentId) : undefined
          const firstTeam =
            first && last && first.teamId !== last.teamId && !hadLoan
              ? getTeam(first.teamId)
              : undefined
          const fromTeam =
            hadLoan && parentTeam && parentTeam.id !== displaySeason?.teamId
              ? parentTeam
              : firstTeam
          const trophies = seasons.flatMap((s) => s.trophies)
          const aggregated =
            seasons.length === 0 || !displaySeason
              ? null
              : {
                  teamId: displaySeason.teamId,
                  overall: Math.max(...seasons.map((s) => s.overall)),
                  appearances: seasons.reduce((n, s) => n + s.stats.appearances, 0),
                  goals: seasons.reduce((n, s) => n + s.stats.goals, 0),
                  assists: seasons.reduce((n, s) => n + s.stats.assists, 0),
                }

          const badgeBg = aggregated ? team?.primary_color : undefined
          const badgeStyle = badgeBg
            ? { background: badgeBg, color: contrastText(badgeBg) }
            : undefined
          const shortName = (name: string, max = 12) =>
            name.length > max ? `${name.slice(0, max - 1)}…` : name

          return (
            <div
              key={age}
              className={`mb-1 grid grid-cols-[52px_1fr_52px_minmax(0,1.2fr)] items-center gap-2 rounded-xl px-2 py-2 ${
                isCurrent ? 'bg-white/8 ring-1 ring-white/15' : ''
              }`}
            >
              <span
                className={`inline-flex h-8 w-10 items-center justify-center rounded-lg text-sm font-bold ${
                  badgeBg ? 'text-white' : 'bg-white/10 text-white/55'
                }`}
                style={badgeStyle}
              >
                {age}
              </span>
              <div className="min-w-0">
                {aggregated ? (
                  <div className="flex min-w-0 items-center gap-2 text-sm">
                    {fromTeam && (
                      <>
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/95 p-0.5 shadow-sm ring-1 ring-black/10"
                          title={fromTeam.name}
                        >
                          {fromTeam.logo_url ? (
                            <img
                              src={fromTeam.logo_url}
                              alt=""
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-[9px] font-bold text-black/40">?</span>
                          )}
                        </span>
                        <span
                          className="shrink-0 text-white/45"
                          title={hadLoan ? 'Préstamo' : 'Cambio de club'}
                        >
                          →
                        </span>
                      </>
                    )}
                    {hadLoan && !fromTeam && (
                      <span className="text-white/45" title="Préstamo">
                        ↳
                      </span>
                    )}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/95 p-1 shadow-sm ring-1 ring-black/10">
                      {team?.logo_url ? (
                        <img src={team.logo_url} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-[10px] font-bold text-black/40">?</span>
                      )}
                    </span>
                    <span className="min-w-0 truncate font-medium">
                      {fromTeam
                        ? `${shortName(fromTeam.name)} → ${shortName(team?.name ?? aggregated.teamId)}`
                        : (team?.name ?? aggregated.teamId)}
                    </span>
                    {trophies.slice(0, 3).map((tr, i) => (
                      <TrophyIcon
                        key={`${tr.id}-${i}`}
                        src={tr.assetPath}
                        name={tr.name}
                        className="h-5 w-5"
                      />
                    ))}
                  </div>
                ) : isCurrent && choosingClub ? (
                  <span className="pulse-pick text-sm text-white/70">Eligiendo club…</span>
                ) : isCurrent && decidingCareer ? (
                  <span className="pulse-pick text-sm text-white/70">Decisión de carrera…</span>
                ) : (
                  <span className="text-sm text-white/15">—</span>
                )}
                {aggregated && (
                  <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1">
                    {competition && (
                      <span
                        className="inline-flex max-w-full items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/70"
                        title={competition.name}
                      >
                        {competition.logo_url && (
                          <img
                            src={competition.logo_url}
                            alt=""
                            className="h-3 w-3 shrink-0 object-contain"
                          />
                        )}
                        <span className="truncate">
                          {displayTier === 1
                            ? '1ª'
                            : displayTier != null && displayTier >= 2
                              ? '2ª'
                              : competition.name.length > 14
                                ? `${competition.name.slice(0, 12)}…`
                                : competition.name}
                        </span>
                      </span>
                    )}
                    {hadLoan && (
                      <span className="rounded-md bg-sky-500/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-sky-100">
                        Préstamo
                      </span>
                    )}
                    {hadPromotion && (
                      <span className="rounded-md bg-emerald-500/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-100">
                        Ascenso
                      </span>
                    )}
                    {hadRelegation && (
                      <span className="rounded-md bg-rose-500/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-200">
                        Descenso
                      </span>
                    )}
                    {hadInjury && (
                      <span className="rounded-md bg-orange-500/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-orange-100">
                        Lesión
                      </span>
                    )}
                    {hadSuspension && (
                      <span className="rounded-md bg-amber-500/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-100">
                        Suspendido
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div>
                {aggregated ? (
                  <OvrBadge overall={aggregated.overall} size="sm" />
                ) : isCurrent && state.player ? (
                  <OvrBadge overall={state.player.overall} size="sm" />
                ) : null}
              </div>
              <div className="min-w-0">
                {aggregated ? (
                  <StatIcons
                    appearances={aggregated.appearances}
                    goals={aggregated.goals}
                    assists={aggregated.assists}
                    animate={false}
                    compact
                  />
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex flex-col gap-2 border-t border-sky-400/25 bg-gradient-to-r from-sky-500/15 to-black/40 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            {country && <img src={flagUrl(country.iso_alpha2)} alt="" className="h-5 w-7 rounded-sm" />}
            {country?.logo_url && (
              <img src={country.logo_url} alt="" className="h-6 w-6 object-contain" />
            )}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-sky-200/90">Selección</div>
              <span className="font-semibold text-white">{country?.name_es ?? 'Selección'}</span>
            </div>
            {(state.nationalTrophies ?? []).length > 0 && (
              <div className="ml-1 flex items-center gap-1">
                {aggregateTrophies(state.nationalTrophies ?? []).map((tr) => (
                  <TrophyIcon
                    key={tr.id}
                    src={tr.assetPath}
                    name={`${tr.name}${tr.count > 1 ? ` ×${tr.count}` : ''}`}
                    className="h-5 w-5"
                    count={tr.count}
                  />
                ))}
              </div>
            )}
          </div>
          <StatIcons
            appearances={national.appearances}
            goals={national.goals}
            assists={national.assists}
          />
        </div>
        {(() => {
          const periods = state.nationalTeamPeriods ?? []
          const last = periods[periods.length - 1]
          if (!last) {
            return (
              <div className="text-[11px] font-medium text-white/55">Sin convocatorias todavía</div>
            )
          }
          return (
            <div className="text-[11px] font-medium text-sky-100/90">
              Última convocatoria · {last.age} años · {last.stats.appearances} PJ · {last.stats.goals}{' '}
              GLS · {last.stats.assists} AST
            </div>
          )
        })()}
      </div>
    </div>
  )
}
