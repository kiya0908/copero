import type { Position } from '../../engine/types'
import { positionText, useI18n } from '../../i18n/config'
import { PITCH_LAYOUT } from './positions'

export function PitchPositionPicker({ value, onChange }: { value: Position | null; onChange: (p: Position) => void }) {
  const { t } = useI18n()
  return <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklch,var(--surface)_75%,black)]"><div className="absolute inset-3"><img src="/career-simulator/pitch.svg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-25" /><div className="pointer-events-none absolute inset-0 rounded-xl border border-[var(--pitch-line)]" />{PITCH_LAYOUT.map((slot) => { const selected = value === slot.id; return <button key={slot.id} type="button" onClick={() => onChange(slot.id)} title={positionText(slot.id,t)} style={{ top: slot.top, left: slot.left }} className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-1 font-mono text-[10px] font-bold transition ${selected ? 'z-20 scale-110 bg-[var(--accent)] text-[var(--accent-ink)] shadow-[var(--shadow-accent)]' : 'bg-black/70 text-[var(--fg)] ring-1 ring-[var(--border)] hover:scale-105'}`}>{positionText(slot.id,t,true)}</button> })}</div></div>
}
