import { ATTRIBUTE_LABELS, ATTRIBUTE_ORDER } from '../../engine/draft'
import type { AttributeKey, GameState } from '../../engine/types'

function valueText(key: AttributeKey, value: number): string {
  if (key === 'skillMoves' || key === 'weakFoot') return `${value}★`
  return String(value)
}

export function DraftResultPhase({
  state,
  onContinue,
}: {
  state: GameState
  onContinue: () => void
}) {
  const player = state.player
  if (!player) return null

  return (
    <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-6 px-4 py-10 lg:grid-cols-[.9fr_1.1fr]">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">Draft complete</p>
        <h1 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">
          Tu futuro ya tiene forma
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/55">
          El potencial se calcula según la posición y los ocho atributos elegidos. Es el techo de crecimiento de tu jugador durante la carrera.
        </p>
        <div className="mt-6 grid max-w-xl grid-cols-2 gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-white/40">OVR inicial</div>
            <div className="mt-1 text-4xl font-black text-white">{player.overall}</div>
          </div>
          <div className="rounded-3xl border border-emerald-300/25 bg-emerald-400/10 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-200/70">Potencial</div>
            <div className="mt-1 text-4xl font-black text-emerald-200">{player.potential}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="mt-7 rounded-full bg-white px-8 py-3 font-extrabold text-black transition hover:bg-white/90"
        >
          Elegir club de origen
        </button>
      </div>

      <div className="relative overflow-hidden rounded-[2.25rem] border border-white/15 bg-gradient-to-br from-amber-400 via-yellow-600 to-stone-950 p-1 shadow-2xl">
        <div className="rounded-[2rem] bg-black/85 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-5xl font-black text-white">{player.potential}</div>
              <div className="mt-1 text-xl font-black text-white">{player.position}</div>
              <div className="mt-3 text-xs font-bold uppercase tracking-widest text-white/45">{player.nationalityFifa}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black uppercase text-white">{player.lastName}</div>
              <div className="mt-1 text-sm text-white/45">#{player.preferredNumber} · {player.preferredFoot === 'left' ? 'Zurdo' : 'Diestro'}</div>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ATTRIBUTE_ORDER.map((key) => (
              <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center">
                <div className="text-[10px] font-black uppercase tracking-wider text-white/40">
                  {ATTRIBUTE_LABELS[key].short}
                </div>
                <div className="mt-1 text-2xl font-black text-white">
                  {valueText(key, player.attributes[key])}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-white/35">Construido con</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {player.draftPicks.map((pick) => (
                <span key={`${pick.legendId}-${pick.attribute}`} className="rounded-full bg-white/8 px-3 py-1 text-[11px] text-white/65">
                  {ATTRIBUTE_LABELS[pick.attribute].short} · {pick.legendName}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
