import type { DraftMode } from '../../engine/types'
import { PITCH_LAYOUT } from '../ui/positions'

const MODES: { id: DraftMode; title: string; desc: string }[] = [
  {
    id: 'classic',
    title: 'Classic',
    desc: 'Ves todos los valores y podés cambiar de leyenda hasta 5 veces.',
  },
  {
    id: 'purist',
    title: 'Purist',
    desc: 'Los valores están ocultos y no hay cambios. Solo cuenta tu conocimiento futbolero.',
  },
]

export function IntroPhase({
  draftMode,
  onDraftModeChange,
  onStart,
}: {
  draftMode: DraftMode
  onDraftModeChange: (mode: DraftMode) => void
  onStart: () => void
}) {
  return (
    <main>
      <section className="mx-auto grid min-h-[88vh] max-w-6xl items-center gap-12 px-4 py-12 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/10 bg-black">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 30% 20%, #7c3aed 0%, transparent 42%), radial-gradient(circle at 75% 75%, #172554 0%, #050505 68%)',
            }}
          />
          <div className="absolute inset-8 rounded-2xl border border-white/15 bg-[color:var(--color-pitch)]/85 shadow-2xl">
            {PITCH_LAYOUT.filter((p) => ['ST', 'CAM', 'LM', 'CM', 'RM'].includes(p.id)).map((slot) => (
              <span
                key={slot.id}
                style={{ top: slot.top, left: slot.left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-black shadow"
              >
                {slot.label}
              </span>
            ))}
            <div className="absolute left-1/2 top-1/2 w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-amber-200/50 bg-gradient-to-br from-amber-300 via-yellow-600 to-black p-1 shadow-2xl rotate-[-5deg]">
              <div className="rounded-[1.8rem] bg-black/90 p-5">
                <div className="text-5xl font-black text-white">97</div>
                <div className="mt-1 text-xl font-black text-white">ST</div>
                <div className="mt-12 text-center text-2xl font-black uppercase text-white">TU LEYENDA</div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-black text-white/80">
                  <span>95 PAC</span><span>96 SHO</span><span>91 PAS</span>
                  <span>96 DRI</span><span>88 PHY</span><span>5★ WF</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-5 left-5 rounded-full bg-black/55 px-3 py-1 text-xs text-white/70 backdrop-blur">
            Draft de atributos + simulador de carrera
          </div>
        </div>

        <div className="space-y-7">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-violet-300">
            Copero Football Career Simulator
          </p>
          <h1 className="max-w-xl text-4xl font-black leading-[1.05] text-white sm:text-6xl">
            Creá tu jugador, armá sus atributos y convertite en leyenda
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/60">
            Jugá Copero online: elegí una posición, completá ocho rondas con leyendas del fútbol y viví una carrera llena de contratos, transferencias, lesiones, títulos y decisiones.
          </p>

          <div>
            <div className="flex flex-wrap gap-2">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onDraftModeChange(mode.id)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                    draftMode === mode.id
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  {mode.title}
                </button>
              ))}
            </div>
            <p className="mt-3 max-w-lg text-sm text-white/45">
              {MODES.find((mode) => mode.id === draftMode)?.desc}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onStart}
              className="rounded-full bg-white px-8 py-3 font-extrabold text-black transition hover:bg-white/90"
            >
              Jugar Copero gratis
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('how-to')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full border border-white/25 px-8 py-3 font-semibold text-white transition hover:bg-white/5"
            >
              Cómo se juega
            </button>
          </div>
          <p className="text-xs leading-relaxed text-white/35">
            Proyecto independiente inspirado en los simuladores de carrera futbolística. No es un producto oficial de Copero ni está afiliado a clubes o jugadores.
          </p>
        </div>
      </section>

      <section id="how-to" className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">Cómo jugar Copero</p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            Ocho atributos deciden el techo de toda tu carrera
          </h2>
          <p className="mt-4 leading-relaxed text-white/55">
            En cada ronda aparece una leyenda. El juego busca su mejor atributo que todavía no hayas usado y te permite sumarlo a tu jugador. Cuando completás PAC, SHO, PAS, DRI, DEF, PHY, SKL y WF, la posición elegida determina tu potencial final.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['1', 'Creá tu jugador', 'Elegí nombre, número, pierna hábil, país y posición.'],
            ['2', 'Completá el draft', 'Tomá un atributo distinto de ocho leyendas y construí tu carta.'],
            ['3', 'Viví la carrera', 'Firmá contratos, cambiá de club, ganá títulos y buscá una calificación S.'],
          ].map(([number, title, body]) => (
            <article key={number} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="text-4xl font-black text-white/15">{number}</div>
              <h3 className="mt-4 text-xl font-black text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 sm:p-10">
          <h2 className="text-3xl font-black text-white">Copero game FAQ</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-extrabold text-white">¿Copero es gratis?</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">Sí. El juego funciona directamente en el navegador y no requiere registro.</p>
            </div>
            <div>
              <h3 className="font-extrabold text-white">¿Qué diferencia hay entre Classic y Purist?</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">Classic muestra los valores y permite cinco cambios. Purist oculta las cifras y no permite cambiar la leyenda.</p>
            </div>
            <div>
              <h3 className="font-extrabold text-white">¿Cómo se calcula el potencial?</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">Cada posición asigna pesos distintos. Un delantero depende más de tiro y velocidad; un central, de defensa y físico.</p>
            </div>
            <div>
              <h3 className="font-extrabold text-white">¿La carrera se guarda?</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">Sí. El progreso se guarda localmente y se recupera automáticamente cuando volvés desde el mismo navegador.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 copero.top · Simulador independiente de carrera futbolística.</p>
          <a
            href="mailto:support@copero.top"
            className="font-semibold text-white/60 transition hover:text-white"
          >
            support@copero.top
          </a>
        </div>
      </footer>
    </main>
  )
}
