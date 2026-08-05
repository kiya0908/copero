import { stageLabel } from '../../engine/careerPath'
import { formatMoney } from '../../engine/development'
import { ATTRIBUTE_LABELS, ATTRIBUTE_ORDER } from '../../engine/draft'
import { traitMeta } from '../../engine/objectives'
import { calculateCareerRating } from '../../engine/rating'
import type { AttributeKey, GameState } from '../../engine/types'
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

function valueText(key: AttributeKey, value: number): string {
  if (key === 'skillMoves' || key === 'weakFoot') return `${value}★`
  return String(value)
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, (char) => {
    const replacements: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&apos;',
      '"': '&quot;',
    }
    return replacements[char] ?? char
  })
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

  const peakOvr = Math.max(player.peakOverall ?? player.overall, player.overall, ...state.seasons.map((s) => s.overall), 0)
  const clubTrophies = state.seasons.flatMap((s) => s.trophies)
  const allTrophies = [...clubTrophies, ...(state.nationalTrophies ?? [])]
  const trophies = allTrophies.length
  const objectivesOk = (state.objectiveHistory ?? []).filter((o) => o.completed).length
  const rating = calculateCareerRating(state)
  const text = [
    `${player.lastName} · Copero Career`,
    `${rating.grade} · ${rating.label} · ${rating.score} pts`,
    `OVR máx ${peakOvr} · Potencial ${player.potential} · ${stageLabel(state.careerStage ?? 'local')}`,
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

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${player.lastName} · Copero`, text })
        return
      } catch {
        // The user may cancel the native share sheet.
      }
    }
    await copy()
  }

  const downloadCard = () => {
    const attrRows = ATTRIBUTE_ORDER.map((key, index) => {
      const column = index % 2
      const row = Math.floor(index / 2)
      const x = column === 0 ? 86 : 350
      const y = 390 + row * 62
      return `<text x="${x}" y="${y}" fill="#a1a1aa" font-size="18" font-family="Arial" font-weight="700">${ATTRIBUTE_LABELS[key].short}</text><text x="${x + 76}" y="${y}" fill="#ffffff" font-size="28" font-family="Arial" font-weight="900">${escapeXml(valueText(key, player.attributes[key]))}</text>`
    }).join('')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7c3aed"/><stop offset="0.5" stop-color="#111827"/><stop offset="1" stop-color="#020617"/></linearGradient></defs><rect width="720" height="960" rx="48" fill="url(#bg)"/><rect x="42" y="42" width="636" height="876" rx="38" fill="#050505" fill-opacity="0.82" stroke="#ffffff" stroke-opacity="0.15"/><text x="78" y="105" fill="#c4b5fd" font-size="18" font-family="Arial" font-weight="700" letter-spacing="4">COPERO CAREER</text><text x="78" y="188" fill="#ffffff" font-size="60" font-family="Arial" font-weight="900">${escapeXml(player.lastName.toUpperCase())}</text><text x="78" y="235" fill="#a1a1aa" font-size="24" font-family="Arial">${escapeXml(`${player.nationalityFifa} · ${player.position} · #${player.preferredNumber}`)}</text><text x="78" y="325" fill="#ffffff" font-size="80" font-family="Arial" font-weight="900">${peakOvr}</text><text x="250" y="300" fill="#a1a1aa" font-size="18" font-family="Arial" font-weight="700">POTENCIAL</text><text x="250" y="337" fill="#86efac" font-size="38" font-family="Arial" font-weight="900">${player.potential}</text>${attrRows}<line x1="78" y1="660" x2="642" y2="660" stroke="#ffffff" stroke-opacity="0.12"/><text x="78" y="718" fill="#a1a1aa" font-size="18" font-family="Arial">PJ ${state.totals.appearances}   GLS ${state.totals.goals}   AST ${state.totals.assists}</text><text x="78" y="760" fill="#a1a1aa" font-size="18" font-family="Arial">TROFEOS ${trophies}   SELECCIÓN ${state.nationalTotals?.appearances ?? 0} PJ</text><text x="78" y="850" fill="#ffffff" font-size="92" font-family="Arial" font-weight="900">${rating.grade}</text><text x="205" y="820" fill="#ffffff" font-size="30" font-family="Arial" font-weight="900">${escapeXml(rating.label)}</text><text x="205" y="858" fill="#a1a1aa" font-size="22" font-family="Arial">${rating.score} puntos de carrera</text></svg>`
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${player.lastName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'copero'}-career-card.svg`
    anchor.click()
    URL.revokeObjectURL(url)
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
      <div className="flex items-start justify-between gap-5">
        <div>
          <h2 className="text-2xl font-bold text-white">Tu carrera llegó a su fin</h2>
          <p className="mt-1 text-white/70">
            {state.currentEvent?.type === 'retire' ? state.currentEvent.body : t('retire.title')}
          </p>
        </div>
        <div className="text-right">
          <div className="text-6xl font-black text-white">{rating.grade}</div>
          <div className="text-xs font-bold uppercase tracking-wide text-emerald-300">{rating.score} pts</div>
        </div>
      </div>
      <p className="mt-3 text-sm font-bold text-white/75">{rating.label}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-white/40">
        OVR máx {peakOvr} · Potencial {player.potential} · {stageLabel(state.careerStage ?? 'local')}
      </p>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {ATTRIBUTE_ORDER.map((key) => (
          <div key={key} className="rounded-xl border border-white/10 bg-black/30 px-2 py-2 text-center">
            <div className="text-[9px] font-black text-white/35">{ATTRIBUTE_LABELS[key].short}</div>
            <div className="mt-1 text-base font-black text-white">{valueText(key, player.attributes[key])}</div>
          </div>
        ))}
      </div>

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
        <button type="button" onClick={downloadCard} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
          Descargar tarjeta
        </button>
        <button type="button" onClick={share} className="rounded-full border border-white/30 px-5 py-2.5 text-sm text-white">
          Compartir
        </button>
        <button type="button" onClick={onReplay} className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/70">
          {t('summary.replay')}
        </button>
      </div>
    </div>
  )

  return <PlayerShell state={state} leftExtra={left} />
}
