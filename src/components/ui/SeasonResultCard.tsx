import { getTeam } from '../../data/catalog'
import { roleLabel } from '../../engine/contract'
import { formatMoney } from '../../engine/development'
import type { SeasonRecord } from '../../engine/types'
import { OvrBadge } from './OvrBadge'
import { StatIcons } from './StatIcons'
import { TrophyIcon } from './TrophyIcon'

function seasonForm(season: SeasonRecord): { label: string; cls: string } {
  const apps = Math.max(1, season.stats.appearances)
  const contrib = (season.stats.goals + season.stats.assists) / apps
  if (season.injured || season.suspended) return { label: 'Mala', cls: 'bg-rose-500/25 text-rose-200' }
  if (season.role === 'bench' && apps < 15) return { label: 'Mala', cls: 'bg-rose-500/25 text-rose-200' }
  if (contrib >= 0.45 || (season.role === 'undisputed' && apps >= 28))
    return { label: 'Excelente', cls: 'bg-emerald-500/25 text-emerald-200' }
  if (contrib >= 0.22 || season.role === 'starter')
    return { label: 'Buena', cls: 'bg-sky-500/25 text-sky-200' }
  if (contrib >= 0.1) return { label: 'Regular', cls: 'bg-amber-500/20 text-amber-200' }
  return { label: 'Mala', cls: 'bg-rose-500/25 text-rose-200' }
}

export function SeasonResultCard({
  title,
  season,
  playerAge,
  onContinue,
  objectiveLabel,
  objectiveCompleted,
  objectiveFailed,
  stageLabelText,
}: {
  title: string
  season: SeasonRecord
  playerAge: number
  onContinue: () => void
  objectiveLabel?: string
  objectiveCompleted?: boolean
  objectiveFailed?: boolean
  stageLabelText?: string
}) {
  const team = getTeam(season.teamId)
  const parentTeam = season.loan
    ? getTeam(season.loanParentTeamId ?? '')
    : undefined
  const form = seasonForm(season)

  return (
    <div className="glass-card space-y-4 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {parentTeam && (
            <>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/95 p-1.5 ring-1 ring-black/10">
                {parentTeam.logo_url ? (
                  <img src={parentTeam.logo_url} alt="" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-black/40">?</span>
                )}
              </span>
              <span className="text-white/40">→</span>
            </>
          )}
          {team?.logo_url ? (
            <img src={team.logo_url} alt="" className="h-14 w-14 object-contain" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">?</div>
          )}
          <div className="min-w-0">
            <h3 className="font-display text-lg font-extrabold text-white">{title}</h3>
            <p className="truncate text-sm text-white/55">{team?.name ?? season.teamId}</p>
            {season.loan && parentTeam && (
              <p className="mt-0.5 text-[11px] text-sky-200/80">
                Cedido por {parentTeam.name}
              </p>
            )}
            {season.loan && !parentTeam && (
              <p className="mt-0.5 text-[11px] text-sky-200/80">A préstamo</p>
            )}
            {stageLabelText && (
              <p className="mt-0.5 text-[11px] uppercase tracking-wide text-white/40">{stageLabelText}</p>
            )}
          </div>
        </div>
        <OvrBadge overall={season.overall} size="md" />
      </div>

      {objectiveLabel && (
        <div
          className={`rounded-xl border px-3 py-2 text-sm ${
            objectiveCompleted
              ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100'
              : objectiveFailed
                ? 'border-rose-400/40 bg-rose-500/15 text-rose-100'
                : 'border-white/10 bg-white/5 text-white/70'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wide opacity-70">Objetivo · </span>
          {objectiveCompleted ? '✓ ' : objectiveFailed ? '✗ ' : ''}
          {objectiveLabel}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-white/40">Edad</div>
          <div className="text-lg font-bold tabular-nums">{playerAge}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-white/40">Valor</div>
          <div className="money-neon text-lg font-extrabold tabular-nums">{formatMoney(season.marketValue)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-white/40">Salario</div>
          <div className="text-lg font-bold tabular-nums text-white">{formatMoney(season.wage)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-white/40">Forma</div>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${form.cls}`}>
            {form.label}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/70">
          {roleLabel(season.role)}
        </span>
        {season.loan && (
          <span className="rounded-full border border-dashed border-sky-400/50 bg-sky-500/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-200">
            Préstamo
          </span>
        )}
        {season.injured && (
          <span className="rounded-full bg-rose-500/20 px-2.5 py-1 text-[11px] text-rose-200">Lesionado</span>
        )}
        {season.suspended && (
          <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-[11px] text-amber-200">Suspendido</span>
        )}
        {season.struggle === 'promoted' && (
          <span className="rounded-md bg-emerald-500/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-100">
            Ascenso
          </span>
        )}
        {season.struggle === 'relegated' && (
          <span className="rounded-full bg-rose-600/30 px-2.5 py-1 text-[11px] font-bold text-rose-100">
            Descenso
          </span>
        )}
        {season.struggle === 'relegation_battle' && (
          <span className="rounded-full bg-orange-500/25 px-2.5 py-1 text-[11px] text-orange-100">
            Pelea de descenso
          </span>
        )}
      </div>

      <StatIcons
        appearances={season.stats.appearances}
        goals={season.stats.goals}
        assists={season.stats.assists}
      />

      {season.trophies.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-white/10 pt-3">
          {season.trophies.map((tr, i) => (
            <TrophyIcon
              key={`${tr.id}-${i}`}
              src={tr.assetPath}
              name={tr.name}
              className="h-12 w-12"
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onContinue}
        className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-[0.99]"
      >
        Continuar
      </button>
    </div>
  )
}
