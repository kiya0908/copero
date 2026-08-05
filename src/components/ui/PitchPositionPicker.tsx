import type { Position } from '../../engine/types'
import { PITCH_LAYOUT } from './positions'

export function PitchPositionPicker({
  value,
  onChange,
}: {
  value: Position | null
  onChange: (p: Position) => void
}) {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--color-pitch)]">
      <div className="absolute inset-3">
        <img
          src="/career-simulator/pitch.svg"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-25"
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-xl border border-[color:var(--color-pitch-line)]"
          style={{
            backgroundImage:
              'linear-gradient(transparent 49.5%, rgba(255,255,255,.15) 49.5%, rgba(255,255,255,.15) 50.5%, transparent 50.5%), radial-gradient(circle at 50% 50%, transparent 11%, rgba(255,255,255,.12) 11.5%, transparent 12.5%)',
          }}
        />
        {PITCH_LAYOUT.map((slot) => {
          const selected = value === slot.id
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onChange(slot.id)}
              style={{ top: slot.top, left: slot.left }}
              className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-[11px] font-bold transition duration-200 ${
                selected
                  ? 'z-20 scale-110 bg-white text-black shadow-[0_0_18px_rgba(255,255,255,.6)]'
                  : 'bg-black/60 text-white ring-1 ring-white/25 hover:scale-105 hover:bg-black/80'
              }`}
            >
              {slot.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
