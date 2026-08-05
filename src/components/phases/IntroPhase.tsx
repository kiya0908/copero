import type { GameMode } from '../../engine/types'
import { t } from '../../i18n/es'
import { PITCH_LAYOUT } from '../ui/positions'

const MODES: { id: GameMode; title: string; desc: string }[] = [
  { id: 'long', title: t('intro.long'), desc: t('intro.longDesc') },
  { id: 'normal', title: t('intro.normal'), desc: t('intro.normalDesc') },
  { id: 'express', title: t('intro.express'), desc: t('intro.expressDesc') },
]

export function IntroPhase({
  mode,
  onModeChange,
  onStart,
}: {
  mode: GameMode
  onModeChange: (m: GameMode) => void
  onStart: () => void
}) {
  return (
    <section className="mx-auto grid min-h-[85vh] max-w-6xl items-center gap-12 px-4 py-12 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/10 bg-black">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 30% 20%, #6d28d9 0%, transparent 42%), radial-gradient(circle at 75% 75%, #1e3a8a 0%, #050505 68%)',
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
          <span className="absolute left-[22%] top-[55%] -translate-x-1/2 text-4xl font-black text-white/15 blur-[1px]">
            9
          </span>
          <span className="absolute right-[18%] top-[40%] text-3xl font-black text-white/10 blur-[1px]">26</span>
        </div>
        <div className="absolute bottom-5 left-5 rounded-full bg-black/55 px-3 py-1 text-xs text-white/70 backdrop-blur">
          Vista previa del simulador
        </div>
      </div>

      <div className="space-y-7">
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Carrera futbolística</p>
        <h1 className="max-w-lg text-4xl font-bold leading-[1.1] text-white sm:text-5xl">
          {t('app.title')}
        </h1>
        <p className="max-w-md text-base leading-relaxed text-white/60">{t('app.subtitle')}</p>

        <div className="flex flex-wrap gap-2">
          {(['ES', 'EN', 'PT'] as const).map((lang) => (
            <span
              key={lang}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                lang === 'ES' ? 'bg-white text-black' : 'bg-white/10 text-white/70'
              }`}
            >
              {lang}
            </span>
          ))}
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onModeChange(m.id)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  mode === m.id ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {m.title}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-white/45">{MODES.find((m) => m.id === mode)?.desc}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onStart}
            className="rounded-full bg-white px-8 py-3 font-semibold text-black transition hover:bg-white/90"
          >
            {t('intro.start')}
          </button>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('how-to')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="rounded-full border border-white/25 px-8 py-3 font-semibold text-white transition hover:bg-white/5"
          >
            Cómo se juega
          </button>
        </div>
        <p id="how-to" className="max-w-md text-sm leading-relaxed text-white/40">
          {t('intro.howto')}
        </p>
      </div>
    </section>
  )
}
