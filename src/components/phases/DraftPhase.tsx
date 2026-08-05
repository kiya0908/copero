import { useEffect } from 'react'
import { legendById } from '../../data/legends'
import {
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ORDER,
  recommendedAttribute,
} from '../../engine/draft'
import type { AttributeKey, GameState } from '../../engine/types'

function valueText(key: AttributeKey, value: number): string {
  if (key === 'skillMoves' || key === 'weakFoot') return `${value}★`
  return String(value)
}

export function DraftPhase({
  state,
  onEnsureLegend,
  onTake,
  onSkip,
  onBack,
}: {
  state: GameState
  onEnsureLegend: () => void
  onTake: () => void
  onSkip: () => void
  onBack: () => void
}) {
  useEffect(() => {
    if (!state.draft.currentLegendId) onEnsureLegend()
  }, [state.draft.currentLegendId, onEnsureLegend])

  const legend = state.draft.currentLegendId
    ? legendById(state.draft.currentLegendId)
    : undefined
  const recommended = recommendedAttribute(state)
  const selected = new Set(state.draft.picks.map((pick) => pick.attribute))
  const isPurist = state.draftMode === 'purist'

  return (
    <section className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">
            Legend Attribute Draft
          </p>
          <h1 className="mt-1 text-3xl font-black text-white">
            Ronda {state.draft.picks.length + 1} de {ATTRIBUTE_ORDER.length}
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Cada leyenda puede aportar un solo atributo. Los atributos confirmados quedan bloqueados.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70">
          {isPurist ? 'PURIST · valores ocultos' : `CLASSIC · ${state.draft.skipsRemaining} cambios`}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-700/45 via-black to-blue-950 p-6 shadow-2xl">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
          {legend ? (
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">
                    {legend.country} · {legend.era}
                  </p>
                  <h2 className="mt-2 text-4xl font-black text-white">{legend.name}</h2>
                  <p className="mt-2 text-sm text-white/55">{legend.positions.join(' · ')}</p>
                </div>
                <div className="grid h-24 w-24 place-items-center rounded-3xl border border-white/15 bg-white/10 text-4xl font-black text-white shadow-xl">
                  {legend.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)}
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ATTRIBUTE_ORDER.map((key) => {
                  const locked = selected.has(key)
                  const highlighted = recommended === key
                  return (
                    <div
                      key={key}
                      className={`rounded-2xl border px-3 py-3 ${
                        locked
                          ? 'border-white/5 bg-black/35 opacity-35'
                          : highlighted && !isPurist
                            ? 'border-emerald-300/70 bg-emerald-400/15'
                            : 'border-white/10 bg-black/30'
                      }`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-wider text-white/45">
                        {ATTRIBUTE_LABELS[key].short}
                      </div>
                      <div className="mt-1 text-2xl font-black text-white">
                        {locked
                          ? 'LOCK'
                          : isPurist
                            ? '??'
                            : valueText(key, legend.attributes[key])}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/35 p-4">
                {isPurist ? (
                  <>
                    <div className="text-sm font-extrabold text-white">Confiá en tu conocimiento</div>
                    <p className="mt-1 text-xs leading-relaxed text-white/50">
                      El juego tomará el mejor atributo disponible de esta leyenda. El valor se revela después de confirmar.
                    </p>
                  </>
                ) : recommended ? (
                  <>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Mejor atributo disponible
                    </div>
                    <div className="mt-1 text-2xl font-black text-white">
                      {ATTRIBUTE_LABELS[recommended].short} · {valueText(recommended, legend.attributes[recommended])}
                    </div>
                  </>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onTake}
                  disabled={!recommended}
                  className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-black transition hover:bg-white/90 disabled:opacity-40"
                >
                  Confirmar atributo
                </button>
                {!isPurist && (
                  <button
                    type="button"
                    onClick={onSkip}
                    disabled={state.draft.skipsRemaining <= 0}
                    className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Cambiar leyenda · {state.draft.skipsRemaining}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid min-h-[420px] place-items-center text-sm text-white/50">Preparando la ronda…</div>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <h3 className="text-lg font-black text-white">Tu jugador</h3>
          <p className="mt-1 text-sm text-white/45">
            {state.player?.lastName} · {state.player?.position}
          </p>
          <div className="mt-5 space-y-2">
            {ATTRIBUTE_ORDER.map((key) => {
              const pick = state.draft.picks.find((item) => item.attribute === key)
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/25 px-4 py-3"
                >
                  <div className="w-11 text-xs font-black text-white/45">{ATTRIBUTE_LABELS[key].short}</div>
                  <div className="flex-1 truncate text-sm font-semibold text-white/75">
                    {pick ? pick.legendName : 'Sin elegir'}
                  </div>
                  <div className="text-lg font-black text-white">
                    {pick ? valueText(key, pick.value) : '—'}
                  </div>
                </div>
              )
            })}
          </div>
          <button
            type="button"
            onClick={onBack}
            className="mt-5 text-sm text-white/45 underline transition hover:text-white"
          >
            Volver a identidad y reiniciar draft
          </button>
        </div>
      </div>
    </section>
  )
}
