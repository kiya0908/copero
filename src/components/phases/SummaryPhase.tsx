import { formatMoney } from '../../engine/development'
import { stageLabel } from '../../engine/careerPath'
import { traitMeta } from '../../engine/objectives'
import type { GameState } from '../../engine/types'
import { t } from '../../i18n/es'
import { PlayerShell } from '../ui/PlayerShell'
import { TrophyIcon } from '../ui/TrophyIcon'

const MILESTONE_LABEL: Record<string, string> = {
  stage_regional: 'Escenario regional',
  stage_continental: 'Escenario continental',
  stage_elite: 'Escenario elite',
  national_debut: 'Debut en selección',
  first_trophy: 'Primer trofeo',
  trophy_cabinet: 'Vitrina llena (5+)',
  ovr_85: 'Overall 85+',
}

export function SummaryPhase({
  state,
  onReplay,
}: {
  state: GameState
  onReplay: () => void
}) {
  const player = state.player
  if (!player) return null

  const peakOvr = Math.max(player.overall, ...state.seasons.map((s) => s.overall), 0)
  const clubTrophies = state.seasons.flatMap((s) => s.trophies)
  const allTrophies = [...clubTrophies, ...(state.nationalTrophies ?? [])]
  const trophies = allTrophies.length
  const objectivesOk = (state.objectiveHistory ?? []).filter((o) => o.completed).length
  const text = [
    `${player.lastName} · Carrera`,
    `Edad ${player.age} · OVR máx ${peakOvr} · ${stageLabel(state.careerStage ?? 'local')}`,
    `PJ ${state.totals.appearances} · GLS ${state.totals.goals} · AST ${state.totals.assists}`,
    `Selección PJ ${state.nationalTotals?.appearances ?? 0}`,
    `Patrimonio ${formatMoney(player.wealth)} · Trofeos ${trophies}`,
    `Objetivos cumplidos ${objectivesOk}`,
    (state.traits ?? []).map((tr) => traitMeta(tr)?.label ?? tr).join(', '),
  ]
    .filter(Boolean)
    .join('\n')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      alert(t('summary.copied'))
    } catch {
      alert(text)
    }
  }

  const left = (
    <div
      className="glass-card relative overflow-hidden rounded-2xl p-6"
      style={{
        backgroundImage:
          'linear-gradient(180deg, rgba(10,10,10,.65), rgba(10,10,10,.94)), url(/media/minigames/career-simulator/header2.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <h2 className="text-2xl font-bold text-white">Tu carrera llegó a su fin</h2>
      <p className="mt-1 text-white/70">
        {state.currentEvent?.type === 'retire' ? state.currentEvent.body : t('retire.title')}
      </p>
      <p className="mt-3 text-sm italic text-white/50">{t('summary.legacy')}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-white/40">
        {stageLabel(state.careerStage ?? 'local')}
      </p>

      {allTrophies.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-white/45">{t('summary.vitrina')}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {allTrophies.slice(0, 24).map((tr, i) => (
              <TrophyIcon
                key={`${tr.id}-${i}`}
                src={tr.assetPath}
                name={tr.name}
                className="h-10 w-10"
              />
            ))}
          </div>
        </div>
      )}

      {(state.milestones?.length ?? 0) > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-white/45">{t('summary.milestones')}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {state.milestones.map((m) => (
              <span
                key={m}
                className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/70"
              >
                {MILESTONE_LABEL[m] ?? m}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
        >
          {t('summary.copy')}
        </button>
        <button
          type="button"
          onClick={onReplay}
          className="rounded-full border border-white/30 px-5 py-2.5 text-sm text-white"
        >
          {t('summary.replay')}
        </button>
      </div>
    </div>
  )

  return <PlayerShell state={state} leftExtra={left} />
}
