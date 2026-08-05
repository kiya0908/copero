import { getTeam } from '../../data/catalog'
import { stageLabel } from '../../engine/careerPath'
import { formatMoney } from '../../engine/development'
import { ATTRIBUTE_LABELS, ATTRIBUTE_ORDER } from '../../engine/draft'
import { traitMeta } from '../../engine/objectives'
import { calculateCareerRating } from '../../engine/rating'
import { buildCareerTimeline, timelineHeadline } from '../../engine/timeline'
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

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 500)
}

async function svgToPng(svg: string, width: number, height: number): Promise<Blob | null> {
  const source = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(source)
  try {
    const image = new Image()
    image.decoding = 'async'
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('No se pudo renderizar la tarjeta'))
    })
    image.src = url
    await loaded

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return null
    context.drawImage(image, 0, 0, width, height)
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.94))
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
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

  const peakOvr = Math.max(
    player.peakOverall ?? player.overall,
    player.overall,
    ...state.seasons.map((s) => s.overall),
    0,
  )
  const clubTrophies = state.seasons.flatMap((s) => s.trophies)
  const allTrophies = [...clubTrophies, ...(state.nationalTrophies ?? [])]
  const trophies = allTrophies.length
  const objectivesOk = (state.objectiveHistory ?? []).filter((o) => o.completed).length
  const rating = calculateCareerRating(state)
  const timeline = buildCareerTimeline(state)
  const defensivePosition = ['GK', 'CB', 'LB', 'RB', 'CDM'].includes(player.position)
  const fileBase = player.lastName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'copero'

  const text = [
    `${player.lastName} · Copero Career`,
    `${rating.grade} · ${rating.label} · ${rating.score} pts`,
    `OVR máx ${peakOvr} · Potencial ${player.potential} · ${stageLabel(state.careerStage ?? 'local')}`,
    `PJ ${state.totals.appearances} · GLS ${state.totals.goals} · AST ${state.totals.assists}`,
    defensivePosition ? `Vallas invictas ${state.totals.cleanSheets}` : '',
    `Selección PJ ${state.nationalTotals?.appearances ?? 0}`,
    `Patrimonio ${formatMoney(player.wealth)} · Trofeos ${trophies}`,
    `Clubes ${timeline.length} · Objetivos cumplidos ${objectivesOk}`,
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

  const buildCardSvg = () => {
    const attrRows = ATTRIBUTE_ORDER.map((key, index) => {
      const column = index % 2
      const row = Math.floor(index / 2)
      const x = column === 0 ? 86 : 382
      const y = 390 + row * 58
      return `<text x="${x}" y="${y}" fill="#a1a1aa" font-size="18" font-family="Arial" font-weight="700">${ATTRIBUTE_LABELS[key].short}</text><text x="${x + 76}" y="${y}" fill="#ffffff" font-size="28" font-family="Arial" font-weight="900">${escapeXml(valueText(key, player.attributes[key]))}</text>`
    }).join('')

    const timelineRows = timeline.slice(0, 5).map((spell, index) => {
      const y = 790 + index * 48
      const name = spell.teamName.length > 27 ? `${spell.teamName.slice(0, 25)}…` : spell.teamName
      const age = spell.startAge === spell.endAge ? `${spell.startAge}` : `${spell.startAge}-${spell.endAge}`
      return `<circle cx="93" cy="${y - 7}" r="6" fill="#8b5cf6"/><text x="118" y="${y}" fill="#ffffff" font-size="20" font-family="Arial" font-weight="700">${escapeXml(name)}</text><text x="505" y="${y}" fill="#a1a1aa" font-size="17" font-family="Arial" text-anchor="end">${age} años</text><text x="642" y="${y}" fill="#a1a1aa" font-size="17" font-family="Arial" text-anchor="end">${spell.appearances} PJ</text>`
    }).join('')

    return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1160" viewBox="0 0 720 1160"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7c3aed"/><stop offset="0.48" stop-color="#111827"/><stop offset="1" stop-color="#020617"/></linearGradient></defs><rect width="720" height="1160" rx="48" fill="url(#bg)"/><rect x="42" y="42" width="636" height="1076" rx="38" fill="#050505" fill-opacity="0.84" stroke="#ffffff" stroke-opacity="0.15"/><text x="78" y="105" fill="#c4b5fd" font-size="18" font-family="Arial" font-weight="700" letter-spacing="4">COPERO CAREER</text><text x="78" y="188" fill="#ffffff" font-size="60" font-family="Arial" font-weight="900">${escapeXml(player.lastName.toUpperCase())}</text><text x="78" y="235" fill="#a1a1aa" font-size="24" font-family="Arial">${escapeXml(`${player.nationalityFifa} · ${player.position} · #${player.preferredNumber}`)}</text><text x="78" y="325" fill="#ffffff" font-size="80" font-family="Arial" font-weight="900">${peakOvr}</text><text x="250" y="300" fill="#a1a1aa" font-size="18" font-family="Arial" font-weight="700">POTENCIAL</text><text x="250" y="337" fill="#86efac" font-size="38" font-family="Arial" font-weight="900">${player.potential}</text>${attrRows}<line x1="78" y1="650" x2="642" y2="650" stroke="#ffffff" stroke-opacity="0.12"/><text x="78" y="704" fill="#a1a1aa" font-size="18" font-family="Arial">PJ ${state.totals.appearances}   GLS ${state.totals.goals}   AST ${state.totals.assists}</text><text x="78" y="744" fill="#a1a1aa" font-size="18" font-family="Arial">TROFEOS ${trophies}   SELECCIÓN ${state.nationalTotals?.appearances ?? 0} PJ${defensivePosition ? `   CS ${state.totals.cleanSheets}` : ''}</text><text x="78" y="790" fill="#c4b5fd" font-size="15" font-family="Arial" font-weight="700" letter-spacing="2">TRAYECTORIA</text>${timelineRows}<line x1="78" y1="1040" x2="642" y2="1040" stroke="#ffffff" stroke-opacity="0.12"/><text x="78" y="1110" fill="#ffffff" font-size="72" font-family="Arial" font-weight="900">${rating.grade}</text><text x="205" y="1085" fill="#ffffff" font-size="28" font-family="Arial" font-weight="900">${escapeXml(rating.label)}</text><text x="205" y="1120" fill="#a1a1aa" font-size="21" font-family="Arial">${rating.score} puntos de carrera</text></svg>`
  }

  const createPng = () => svgToPng(buildCardSvg(), 720, 1160)

  const downloadCard = async () => {
    const png = await createPng()
    if (png) {
      downloadBlob(png, `${fileBase}-career-card.png`)
      return
    }
    downloadBlob(
      new Blob([buildCardSvg()], { type: 'image/svg+xml;charset=utf-8' }),
      `${fileBase}-career-card.svg`,
    )
  }

  const share = async () => {
    if (navigator.share) {
      const png = await createPng()
      if (png) {
        const file = new File([png], `${fileBase}-career-card.png`, { type: 'image/png' })
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `${player.lastName} · Copero`,
              text,
              files: [file],
            })
            return
          } catch {
            // El usuario puede cerrar la hoja nativa de compartir.
          }
        }
      }
      try {
        await navigator.share({ title: `${player.lastName} · Copero`, text })
        return
      } catch {
        // Fallback al portapapeles.
      }
    }
    await copy()
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

      <div className="mt-5 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-black/30 p-2.5">
          <div className="text-[9px] font-black text-white/35">PARTIDOS</div>
          <div className="mt-1 text-lg font-black text-white">{state.totals.appearances}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-2.5">
          <div className="text-[9px] font-black text-white/35">GOLES</div>
          <div className="mt-1 text-lg font-black text-white">{state.totals.goals}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-2.5">
          <div className="text-[9px] font-black text-white/35">ASISTENCIAS</div>
          <div className="mt-1 text-lg font-black text-white">{state.totals.assists}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-2.5">
          <div className="text-[9px] font-black text-white/35">
            {defensivePosition ? 'VALLAS INVICTAS' : 'TROFEOS'}
          </div>
          <div className="mt-1 text-lg font-black text-white">
            {defensivePosition ? state.totals.cleanSheets : trophies}
          </div>
        </div>
      </div>

      {timeline.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wide text-white/45">Trayectoria</h3>
          <div className="mt-3 space-y-2">
            {timeline.map((spell, index) => {
              const team = getTeam(spell.teamId)
              return (
                <div key={spell.key} className="relative flex gap-3 rounded-2xl border border-white/10 bg-black/30 p-3">
                  <div className="relative flex w-8 shrink-0 justify-center">
                    <span className="mt-1.5 h-3 w-3 rounded-full bg-violet-400" />
                    {index < timeline.length - 1 && (
                      <span className="absolute left-1/2 top-5 h-[calc(100%+10px)] w-px -translate-x-1/2 bg-white/10" />
                    )}
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1.5">
                    {team?.logo_url ? (
                      <img src={team.logo_url} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-xs font-black text-black">{spell.teamName.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="truncate font-extrabold text-white">
                        {spell.teamName}{spell.loan ? ' · Cesión' : ''}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-white/35">
                        {timelineHeadline(spell)}
                      </div>
                    </div>
                    <div className="mt-1 text-[11px] text-white/50">
                      {spell.appearances} PJ · {spell.goals} GLS · {spell.assists} AST · OVR máx {spell.peakOverall}
                      {spell.trophies > 0 ? ` · ${spell.trophies} títulos` : ''}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
          onClick={downloadCard}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
        >
          Descargar PNG
        </button>
        <button
          type="button"
          onClick={share}
          className="rounded-full border border-white/30 px-5 py-2.5 text-sm text-white"
        >
          Compartir
        </button>
        <button
          type="button"
          onClick={onReplay}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/70"
        >
          {t('summary.replay')}
        </button>
      </div>
    </div>
  )

  return <PlayerShell state={state} leftExtra={left} />
}
