import { formatMoney } from '../engine/development'
import { roleLabel } from '../engine/contract'
import { stageLabel } from '../engine/careerPath'
import { traitMeta } from '../engine/objectives'
import { getCountry, getTeam } from '../data/catalog'
import type { GameState } from '../engine/types'
import { t } from '../i18n/es'

const MOD_LABEL: Record<string, string> = {
  injury_immunity: t('mod.injury_immunity'),
  iron_longevity: t('mod.iron_longevity'),
  glass_body: t('mod.glass_body'),
  golden_boy: t('mod.golden_boy'),
  career_ruined: t('mod.career_ruined'),
  banned: t('mod.banned'),
  form_boost: t('mod.form_boost'),
  form_dip: t('mod.form_dip'),
  homesick: t('mod.homesick'),
}

export function CareerHud({ state }: { state: GameState }) {
  const player = state.player
  if (!player) return null
  const team = state.currentTeamId ? getTeam(state.currentTeamId) : undefined
  const country = getCountry(player.nationalityFifa)
  const objective = state.seasonObjective

  return (
    <header className="mb-6 rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur">
      <div className="flex flex-wrap items-center gap-4">
        {country?.flag_url && (
          <img src={country.flag_url} alt="" className="h-8 w-12 rounded object-cover" />
        )}
        {team?.logo_url && (
          <img src={team.logo_url} alt="" className="h-10 w-10 object-contain" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl text-white">
            {player.lastName}{' '}
            <span className="text-gold">#{player.preferredNumber}</span>
          </p>
          <p className="text-sm text-white/70">
            {player.position} · {country?.name_es} · {team?.name ?? t('hud.club')}
            {state.contract ? ` · ${roleLabel(state.contract.role)}` : ''}
          </p>
          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-white/40">
            {stageLabel(state.careerStage ?? 'local')}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Stat label={t('hud.age')} value={String(player.age)} />
        <Stat label={t('hud.ovr')} value={String(player.overall)} />
        <Stat
          label={t('hud.wage')}
          value={state.contract ? formatMoney(state.contract.annualWage) : '—'}
        />
        <Stat label={t('hud.wealth')} value={formatMoney(player.wealth)} />
        <Stat label={t('hud.value')} value={formatMoney(player.marketValue)} />
      </div>
      {objective && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-white/45">{t('hud.objective')}</p>
          <p className="text-sm font-medium text-white">
            {objective.completed
              ? `✓ ${objective.label}`
              : objective.failed
                ? `✗ ${objective.label}`
                : t('objective.pending', { label: objective.label })}
            {!objective.completed && !objective.failed && objective.target > 1
              ? ` · ${objective.progress}/${objective.target}`
              : ''}
          </p>
        </div>
      )}
      {(state.traits?.length ?? 0) > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {state.traits.map((tr) => (
            <span
              key={tr}
              className="rounded-full border border-sky-400/30 bg-sky-500/15 px-2.5 py-1 text-xs text-sky-100"
            >
              {traitMeta(tr)?.label ?? tr}
            </span>
          ))}
        </div>
      )}
      {state.modifiers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {state.modifiers.map((m) => (
            <span
              key={m}
              className="rounded-full bg-pitch-light/40 px-2.5 py-1 text-xs text-gold"
            >
              {MOD_LABEL[m] ?? m}
            </span>
          ))}
        </div>
      )}
    </header>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-white/50">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  )
}
