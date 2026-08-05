import { useRef, useState } from 'react'
import type { EventOutcomePill } from '../../data/eventAssets'
import { eventChoiceVisual } from '../../data/eventAssets'

export type ChoiceSpinResult = {
  choiceId: string
  winningIndex: number
  outcomes: EventOutcomePill[]
  imageSrc?: string
}

type Props = {
  eventId: string
  title: string
  body: string
  choices: { id: string; label: string }[]
  impact?: string
  onPreview: (choiceId: string) => ChoiceSpinResult
  onCommit: (choiceId: string) => void
}

/** Intervalos crecientes para desacelerar la ruleta (ms entre ticks). */
function buildDecelDelays(totalMs: number, tickCount: number): number[] {
  const weights: number[] = []
  for (let i = 0; i < tickCount; i += 1) {
    // Curva suave: ticks rápidos al inicio, lentos al final
    weights.push(0.35 + (i / Math.max(1, tickCount - 1)) ** 1.6 * 1.8)
  }
  const sum = weights.reduce((a, b) => a + b, 0)
  return weights.map((w) => (w / sum) * totalMs)
}

export function EventChoiceCards({
  eventId,
  title,
  body,
  choices,
  impact,
  onPreview,
  onCommit,
}: Props) {
  const [spinning, setSpinning] = useState(false)
  const [highlightPill, setHighlightPill] = useState<number | null>(null)
  const [result, setResult] = useState<{
    choiceId: string
    label: string
    tone: EventOutcomePill['tone']
    winningIndex: number
    outcomes: EventOutcomePill[]
  } | null>(null)
  const [activeChoice, setActiveChoice] = useState<string | null>(null)
  const [exiting, setExiting] = useState(false)
  const committed = useRef(false)
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    for (const id of timers.current) window.clearTimeout(id)
    timers.current = []
  }

  const startSpin = (choiceId: string) => {
    if (spinning || result) return
    const visual = eventChoiceVisual(eventId, choiceId)
    const preview = onPreview(choiceId)
    const outcomes = preview.outcomes.length
      ? preview.outcomes
      : visual?.outcomes ?? [{ tone: 'neutral' as const, label: 'Continuar' }]
    const rouletteIdx = outcomes
      .map((o, i) => (o.tone === 'positive' || o.tone === 'negative' ? i : -1))
      .filter((i) => i >= 0)
    const hasRoulette = rouletteIdx.length >= 2

    setActiveChoice(choiceId)
    committed.current = false
    clearTimers()

    if (!hasRoulette) {
      const win = outcomes[preview.winningIndex] ?? outcomes[0]
      setResult({
        choiceId,
        label: win.label,
        tone: win.tone,
        winningIndex: preview.winningIndex,
        outcomes,
      })
      return
    }

    setSpinning(true)
    setHighlightPill(null)
    const duration = 2800 + Math.random() * 800
    // ~14–20 ticks para que se sienta aleatorio
    const tickCount = 14 + Math.floor(Math.random() * 7)
    const delays = buildDecelDelays(duration, tickCount)
    let elapsed = 0
    let tickIdx = 0

    for (let i = 0; i < tickCount; i += 1) {
      elapsed += delays[i]!
      const delay = elapsed
      const idx = i
      const tid = window.setTimeout(() => {
        setHighlightPill(rouletteIdx[tickIdx % rouletteIdx.length]!)
        tickIdx += 1
        if (idx === tickCount - 1) {
          // Último tick: aterrizar en la ganadora con un beat extra
          const landId = window.setTimeout(() => {
            setSpinning(false)
            setHighlightPill(null)
            const win = outcomes[preview.winningIndex] ?? outcomes[0]
            setResult({
              choiceId,
              label: win.label,
              tone: win.tone,
              winningIndex: preview.winningIndex,
              outcomes,
            })
          }, 280)
          timers.current.push(landId)
        }
      }, delay)
      timers.current.push(tid)
    }
  }

  const finish = () => {
    if (!result || committed.current || exiting) return
    committed.current = true
    setExiting(true)
    const id = result.choiceId
    window.setTimeout(() => {
      setResult(null)
      setActiveChoice(null)
      setExiting(false)
      onCommit(id)
    }, 220)
  }

  return (
    <div
      className={`glass-card space-y-3 rounded-2xl p-4 transition-opacity duration-300 ${
        exiting ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <h3 className="font-display text-lg font-extrabold">{title}</h3>
      <p className="text-sm text-white/60">{body}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {choices.map((c) => {
          const visual = eventChoiceVisual(eventId, c.id)
          if (!visual) {
            return (
              <button
                key={c.id}
                type="button"
                disabled={spinning || Boolean(result)}
                onClick={() => startSpin(c.id)}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${
                  impact === 'ruin' && (c.id === 'consume' || c.id === 'retire_medical')
                    ? 'bg-red-700 text-white'
                    : 'bg-white text-black'
                }`}
              >
                {c.label}
              </button>
            )
          }

          const showOutcomes = visual.outcomes
          const isActiveCard = activeChoice === c.id

          return (
            <button
              key={c.id}
              type="button"
              disabled={spinning || Boolean(result)}
              onClick={() => startSpin(c.id)}
              className={`group relative overflow-hidden rounded-2xl border bg-[#161616] text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:shadow-[0_12px_28px_rgba(0,0,0,0.45)] active:scale-[0.98] ${
                result?.choiceId === c.id
                  ? 'border-white/40 ring-1 ring-white/20'
                  : spinning && isActiveCard
                    ? 'border-amber-300/50 ring-1 ring-amber-200/30'
                    : 'border-white/10'
              }`}
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-black/40">
                <img
                  src={visual.imageSrc}
                  alt=""
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="space-y-2 p-3">
                <div className="text-sm font-semibold text-white">{c.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {showOutcomes.map((o, i) => {
                    const isWinner = result?.choiceId === c.id && result.winningIndex === i
                    const isLoser =
                      result?.choiceId === c.id &&
                      result.winningIndex !== i &&
                      showOutcomes.length > 1
                    const isSpinHighlight =
                      spinning && isActiveCard && highlightPill === i
                    return (
                      <span
                        key={i}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all duration-300 ${
                          isLoser
                            ? 'scale-95 bg-white/5 text-white/25 line-through opacity-50'
                            : isWinner
                              ? `outcome-overlay scale-125 ${
                                  o.tone === 'positive'
                                    ? 'bg-emerald-400 text-black ring-2 ring-emerald-100 shadow-[0_0_18px_rgba(52,211,153,0.55)]'
                                    : o.tone === 'negative'
                                      ? 'bg-rose-400 text-black ring-2 ring-rose-100 shadow-[0_0_18px_rgba(251,113,133,0.55)]'
                                      : 'bg-white text-black ring-2 ring-white/40'
                                }`
                              : isSpinHighlight
                                ? `roulette-spin scale-125 ${
                                    o.tone === 'positive'
                                      ? 'bg-emerald-400 text-black ring-2 ring-emerald-200 shadow-[0_0_14px_rgba(52,211,153,0.45)]'
                                      : o.tone === 'negative'
                                        ? 'bg-rose-400 text-black ring-2 ring-rose-200 shadow-[0_0_14px_rgba(251,113,133,0.45)]'
                                        : 'bg-white text-black'
                                  }`
                                : o.tone === 'positive'
                                  ? 'bg-emerald-500/25 text-emerald-200'
                                  : o.tone === 'negative'
                                    ? 'bg-rose-500/25 text-rose-200'
                                    : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {o.label}
                        {o.chance != null ? ` · ${o.chance}%` : ''}
                      </span>
                    )
                  })}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {result && (
        <div className="outcome-overlay flex flex-col items-center gap-2 pt-2">
          <p
            className={`font-display text-base font-extrabold tracking-wide ${
              result.tone === 'positive'
                ? 'text-emerald-300'
                : result.tone === 'negative'
                  ? 'text-rose-300'
                  : 'text-white/70'
            }`}
          >
            {result.label}
          </p>
          <button
            type="button"
            onClick={finish}
            className="rounded-full bg-white px-6 py-2.5 text-sm font-extrabold text-black transition hover:bg-white/90 active:scale-[0.98]"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  )
}
