import { useEffect } from 'react'
import { getCountry, getTeam } from '../../data/catalog'
import { stageLabel } from '../../engine/careerPath'
import { ATTRIBUTE_LABELS, ATTRIBUTE_ORDER } from '../../engine/draft'
import { traitMeta } from '../../engine/objectives'
import { calculateCareerRating } from '../../engine/rating'
import { buildCareerTimeline } from '../../engine/timeline'
import type { AttributeKey, GameState } from '../../engine/types'
import { useI18n } from '../../i18n/config'
import {
  countryDisplayName,
  formatMoneyForLocale,
  resolveGameText,
  type GameTranslate,
} from '../../i18n/game'
import { trackGameEvent, trackGameEventOnce } from '../../lib/analytics'
import { PlayerShell } from '../ui/PlayerShell'
import { TrophyIcon } from '../ui/TrophyIcon'

const MILESTONE_KEYS: Record<string, string> = {
  stage_regional: 'milestone.stage_regional',
  stage_continental: 'milestone.stage_continental',
  stage_elite: 'milestone.stage_elite',
  national_debut: 'milestone.national_debut',
  first_trophy: 'milestone.first_trophy',
  trophy_cabinet: 'milestone.trophy_cabinet',
  ovr_85: 'milestone.ovr_85',
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
      image.onerror = () => reject(new Error('Card render failed'))
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

export function SummaryPhase({ state, onReplay }: { state: GameState; onReplay: () => void }) {
  const { locale, t } = useI18n()
  const gameT: GameTranslate = (key, params) => t('game', key, params)
  const player = state.player
  const careerRating = player ? calculateCareerRating(state) : null

  useEffect(() => {
    if (!player || !careerRating) return
    const peakOverall = Math.max(
      player.peakOverall ?? player.overall,
      player.overall,
      ...state.seasons.map((season) => season.overall),
      0,
    )
    const trophyCount =
      state.seasons.reduce((total, season) => total + season.trophies.length, 0) +
      (state.nationalTrophies?.length ?? 0)

    trackGameEventOnce(`career_finished:${state.seed}`, 'career_finished', {
      grade: careerRating.grade,
      score: careerRating.score,
      position: player.position,
      seasons: state.seasons.length,
      peak_overall: peakOverall,
      potential: player.potential,
      trophies: trophyCount,
    })
  }, [careerRating, player, state.nationalTrophies, state.seed, state.seasons])

  if (!player || !careerRating) return null

  const peakOvr = Math.max(
    player.peakOverall ?? player.overall,
    player.overall,
    ...state.seasons.map((season) => season.overall),
    0,
  )
  const clubTrophies = state.seasons.flatMap((season) => season.trophies)
  const allTrophies = [...clubTrophies, ...(state.nationalTrophies ?? [])]
  const trophies = allTrophies.length
  const objectivesOk = (state.objectiveHistory ?? []).filter((objective) => objective.completed).length
  const rating = careerRating
  const ratingLabel = gameT(rating.label)
  const timeline = buildCareerTimeline(state)
  const defensivePosition = ['GK', 'CB', 'LB', 'RB', 'CDM'].includes(player.position)
  const fileBase = player.lastName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'copero'
  const country = getCountry(player.nationalityFifa)
  const countryName = countryDisplayName(locale, country) || player.nationalityFifa
  const playerName = player.lastName || gameT('common.playerFallback')
  const traitLabels = (state.traits ?? []).map((trait) => {
    const meta = traitMeta(trait)
    return meta ? gameT(meta.labelKey) : trait
  })

  const text = [
    `${playerName} · Copero Career`,
    `${rating.grade} · ${ratingLabel} · ${gameT('summary.points', { points: rating.score })}`,
    `${gameT('summary.maxOvr')} ${peakOvr} · ${gameT('summary.potential')} ${player.potential} · ${gameT(stageLabel(state.careerStage ?? 'local'))}`,
    `${gameT('summary.matches')} ${state.totals.appearances} · ${gameT('summary.goals')} ${state.totals.goals} · ${gameT('summary.assists')} ${state.totals.assists}`,
    defensivePosition ? `${gameT('summary.cleanSheets')} ${state.totals.cleanSheets}` : '',
    `${gameT('summary.national')} ${state.nationalTotals?.appearances ?? 0}`,
    `${gameT('summary.wealth')} ${formatMoneyForLocale(locale, player.wealth)} · ${gameT('summary.trophies')} ${trophies}`,
    `${gameT('summary.clubs')} ${timeline.length} · ${gameT('summary.objectives')} ${objectivesOk}`,
    traitLabels.join(', '),
  ]
    .filter(Boolean)
    .join('\n')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      alert(gameT('summary.copied'))
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
      return `<text x="${x}" y="${y}" fill="#a1a1aa" font-size="18" font-family="Arial, sans-serif" font-weight="700">${ATTRIBUTE_LABELS[key].short}</text><text x="${x + 76}" y="${y}" fill="#ffffff" font-size="28" font-family="Arial, sans-serif" font-weight="900">${escapeXml(valueText(key, player.attributes[key]))}</text>`
    }).join('')

    const timelineRows = timeline.slice(0, 5).map((spell, index) => {
      const y = 790 + index * 48
      const name = spell.teamName.length > 27 ? `${spell.teamName.slice(0, 25)}…` : spell.teamName
      const age = gameT('summary.years', { start: spell.startAge, end: spell.endAge })
      return `<circle cx="93" cy="${y - 7}" r="6" fill="#8b5cf6"/><text x="118" y="${y}" fill="#ffffff" font-size="20" font-family="Arial, sans-serif" font-weight="700">${escapeXml(name)}</text><text x="505" y="${y}" fill="#a1a1aa" font-size="17" font-family="Arial, sans-serif" text-anchor="end">${escapeXml(age)}</text><text x="642" y="${y}" fill="#a1a1aa" font-size="17" font-family="Arial, sans-serif" text-anchor="end">${spell.appearances}</text>`
    }).join('')

    const statsLine = `${gameT('summary.matches')} ${state.totals.appearances}   ${gameT('summary.goals')} ${state.totals.goals}   ${gameT('summary.assists')} ${state.totals.assists}`
    const trophyLine = `${gameT('summary.trophies')} ${trophies}   ${gameT('summary.national')} ${state.nationalTotals?.appearances ?? 0}${defensivePosition ? `   ${gameT('summary.cleanSheets')} ${state.totals.cleanSheets}` : ''}`

    return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1160" viewBox="0 0 720 1160"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7c3aed"/><stop offset="0.48" stop-color="#111827"/><stop offset="1" stop-color="#020617"/></linearGradient></defs><rect width="720" height="1160" rx="48" fill="url(#bg)"/><rect x="42" y="42" width="636" height="1076" rx="38" fill="#050505" fill-opacity="0.84" stroke="#ffffff" stroke-opacity="0.15"/><text x="78" y="105" fill="#c4b5fd" font-size="18" font-family="Arial, sans-serif" font-weight="700" letter-spacing="4">${escapeXml(gameT('summary.cardTitle'))}</text><text x="78" y="188" fill="#ffffff" font-size="60" font-family="Arial, sans-serif" font-weight="900">${escapeXml(playerName.toUpperCase())}</text><text x="78" y="235" fill="#a1a1aa" font-size="24" font-family="Arial, sans-serif">${escapeXml(`${countryName} · ${gameT(`position.${player.position}`)} · #${player.preferredNumber}`)}</text><text x="78" y="325" fill="#ffffff" font-size="80" font-family="Arial, sans-serif" font-weight="900">${peakOvr}</text><text x="250" y="300" fill="#a1a1aa" font-size="18" font-family="Arial, sans-serif" font-weight="700">${escapeXml(gameT('summary.potential'))}</text><text x="250" y="337" fill="#86efac" font-size="38" font-family="Arial, sans-serif" font-weight="900">${player.potential}</text>${attrRows}<line x1="78" y1="650" x2="642" y2="650" stroke="#ffffff" stroke-opacity="0.12"/><text x="78" y="704" fill="#a1a1aa" font-size="18" font-family="Arial, sans-serif">${escapeXml(statsLine)}</text><text x="78" y="744" fill="#a1a1aa" font-size="18" font-family="Arial, sans-serif">${escapeXml(trophyLine)}</text><text x="78" y="790" fill="#c4b5fd" font-size="15" font-family="Arial, sans-serif" font-weight="700" letter-spacing="2">${escapeXml(gameT('summary.trajectory'))}</text>${timelineRows}<line x1="78" y1="1040" x2="642" y2="1040" stroke="#ffffff" stroke-opacity="0.12"/><text x="78" y="1110" fill="#ffffff" font-size="72" font-family="Arial, sans-serif" font-weight="900">${rating.grade}</text><text x="205" y="1085" fill="#ffffff" font-size="28" font-family="Arial, sans-serif" font-weight="900">${escapeXml(ratingLabel)}</text><text x="205" y="1120" fill="#a1a1aa" font-size="21" font-family="Arial, sans-serif">${escapeXml(gameT('summary.points', { points: rating.score }))}</text></svg>`
  }

  const createPng = () => svgToPng(buildCardSvg(), 720, 1160)

  const downloadCard = async () => {
    const png = await createPng()
    if (png) {
      downloadBlob(png, `${fileBase}-career-card.png`)
      trackGameEvent('result_card_downloaded', {
        format: 'png',
        grade: rating.grade,
        position: player.position,
      })
      return
    }
    downloadBlob(
      new Blob([buildCardSvg()], { type: 'image/svg+xml;charset=utf-8' }),
      `${fileBase}-career-card.svg`,
    )
    trackGameEvent('result_card_downloaded', {
      format: 'svg_fallback',
      grade: rating.grade,
      position: player.position,
    })
  }

  const share = async () => {
    const shareTitle = gameT('summary.shareTitle', { name: playerName })
    if (navigator.share) {
      const png = await createPng()
      if (png) {
        const file = new File([png], `${fileBase}-career-card.png`, { type: 'image/png' })
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ title: shareTitle, text, files: [file] })
            trackGameEvent('result_shared', {
              method: 'native_file',
              grade: rating.grade,
              position: player.position,
            })
            return
          } catch {
            // The native share sheet may be dismissed by the user.
          }
        }
      }
      try {
        await navigator.share({ title: shareTitle, text })
        trackGameEvent('result_shared', {
          method: 'native_text',
          grade: rating.grade,
          position: player.position,
        })
        return
      } catch {
        // Fall back to the clipboard.
      }
    }
    await copy()
    trackGameEvent('result_shared', {
      method: 'clipboard',
      grade: rating.grade,
      position: player.position,
    })
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
          <h2 className="text-2xl font-bold text-white">{gameT('summary.endTitle')}</h2>
          <p className="mt-1 text-white/70">
            {state.currentEvent?.type === 'retire'
              ? resolveGameText(gameT, state.currentEvent.body)
              : gameT('retire.title')}
          </p>
        </div>
        <div className="text-right">
          <div className="text-6xl font-black text-white">{rating.grade}</div>
          <div className="text-xs font-bold uppercase tracking-wide text-emerald-300">
            {gameT('summary.points', { points: rating.score })}
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm font-bold text-white/75">{ratingLabel}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-white/40">
        {gameT('summary.maxOvr')} {peakOvr} · {gameT('summary.potential')} {player.potential} ·{' '}
        {gameT(stageLabel(state.careerStage ?? 'local'))}
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
        <SummaryStat label={gameT('summary.matches')} value={state.totals.appearances} />
        <SummaryStat label={gameT('summary.goals')} value={state.totals.goals} />
        <SummaryStat label={gameT('summary.assists')} value={state.totals.assists} />
        <SummaryStat
          label={gameT(defensivePosition ? 'summary.cleanSheets' : 'summary.trophies')}
          value={defensivePosition ? state.totals.cleanSheets : trophies}
        />
      </div>

      {timeline.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wide text-white/45">{gameT('summary.trajectory')}</h3>
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
                        {spell.teamName}{spell.loan ? ` · ${gameT('season.loan')}` : ''}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-white/35">
                        {gameT('summary.years', { start: spell.startAge, end: spell.endAge })} ·{' '}
                        {gameT('summary.seasons', { count: spell.seasons })}
                      </div>
                    </div>
                    <div className="mt-1 text-[11px] text-white/50">
                      {gameT('summary.matches')} {spell.appearances} · {gameT('summary.goals')} {spell.goals} ·{' '}
                      {gameT('summary.assists')} {spell.assists} · {gameT('summary.maxOvr')} {spell.peakOverall}
                      {spell.trophies > 0 ? ` · ${gameT('summary.titleCount', { count: spell.trophies })}` : ''}
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
          <h3 className="text-xs font-bold uppercase tracking-wide text-white/45">{gameT('summary.trophies')}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {allTrophies.slice(0, 24).map((trophy, index) => (
              <TrophyIcon
                key={`${trophy.id}-${index}`}
                src={trophy.assetPath}
                name={trophy.name}
                className="h-10 w-10"
              />
            ))}
          </div>
        </div>
      )}

      {(state.milestones?.length ?? 0) > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-white/45">{gameT('summary.milestones')}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {state.milestones.map((milestone) => (
              <span
                key={milestone}
                className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/70"
              >
                {gameT(MILESTONE_KEYS[milestone] ?? milestone)}
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
          {gameT('summary.download')}
        </button>
        <button
          type="button"
          onClick={share}
          className="rounded-full border border-white/30 px-5 py-2.5 text-sm text-white"
        >
          {gameT('summary.share')}
        </button>
        <button
          type="button"
          onClick={onReplay}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/70"
        >
          {gameT('summary.newCareer')}
        </button>
      </div>
    </div>
  )

  return <PlayerShell state={state} leftExtra={left} />
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-2.5">
      <div className="text-[9px] font-black text-white/35">{label}</div>
      <div className="mt-1 text-lg font-black text-white">{value}</div>
    </div>
  )
}
