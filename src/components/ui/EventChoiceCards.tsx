import { useRef, useState } from 'react'
import type { EventOutcomePill } from '../../data/eventAssets'
import { eventChoiceVisual } from '../../data/eventAssets'
import { useI18n, type Translator } from '../../i18n/config'

export type ChoiceSpinResult = { choiceId: string; winningIndex: number; outcomes: EventOutcomePill[]; imageSrc?: string }
type Props = { eventId: string; title: string; body: string; choices: { id: string; label: string }[]; impact?: string; onPreview: (choiceId: string) => ChoiceSpinResult; onCommit: (choiceId: string) => void }

function buildDecelDelays(totalMs: number, tickCount: number): number[] { const weights = Array.from({ length: tickCount }, (_, i) => .35 + (i / Math.max(1, tickCount - 1)) ** 1.6 * 1.8); const sum = weights.reduce((a,b) => a+b,0); return weights.map((w) => (w / sum) * totalMs) }

function outcomeLabel(label: string, t: Translator): string {
  const exact: Record<string, string> = {
    'Sin cambios': t('outcome.noChange'), 'Ver ofertas': t('outcome.seeOffers'), 'Quedarte': t('outcome.stay'), 'Suspensión': t('outcome.suspension'), 'Titularidad absoluta': t('outcome.undisputed'), 'Inmunidad lesiones': t('outcome.injuryImmunity'), 'Carrera hasta 45': t('outcome.career45'), 'Banco 1 temp': t('outcome.benchSeason'), 'Retiro médico': t('outcome.medicalRetirement'), '-25% fortuna': t('outcome.wealth25'), '-50% fortuna': t('outcome.wealth50'), 'Menos minutos': t('outcome.lessMinutes'), 'Baja de forma': t('outcome.formDip'), 'Recuperarte': t('outcome.recover'), 'Riesgo lesión': t('outcome.injuryRisk'), 'Rendimiento': t('outcome.performance'), 'Críticas': t('outcome.criticism'), 'Ascenso real': t('outcome.promotion'), 'Cuerpo de cristal': t('outcome.glassBody'), 'Suerte': t('outcome.luck'), 'Resaca': t('outcome.hangover'), 'Fresco': t('outcome.fresh'), 'Fatiga': t('outcome.fatigue'), 'Adaptación': t('outcome.adaptation'), 'Aislamiento': t('outcome.isolation'), 'Bonus': t('outcome.bonus'), 'Cláusula intacta': t('outcome.clause'), 'Proyecto': t('outcome.project'), 'Pasar': t('outcome.pass'), 'Listo': t('outcome.ready'), 'Calambres': t('outcome.cramps'),
  }
  if (exact[label]) return exact[label]
  return label
    .replace('Titularidad', t('outcome.starting'))
    .replace('Club top', t('outcome.topClub'))
    .replace('ruina', t('outcome.ruin'))
    .replace('Suspensión', t('outcome.suspension'))
    .replace('riesgoso', t('outcome.risky'))
    .replace('limpio', t('outcome.clean'))
    .replace('Titular próximo período', t('outcome.nextStarter'))
    .replace('temporal', t('outcome.temporary'))
}

export function EventChoiceCards({ eventId, title, body, choices, impact, onPreview, onCommit }: Props) {
  const { t } = useI18n()
  const [spinning, setSpinning] = useState(false)
  const [highlightPill, setHighlightPill] = useState<number | null>(null)
  const [result, setResult] = useState<{ choiceId: string; label: string; tone: EventOutcomePill['tone']; winningIndex: number; outcomes: EventOutcomePill[] } | null>(null)
  const [activeChoice, setActiveChoice] = useState<string | null>(null)
  const [exiting, setExiting] = useState(false)
  const committed = useRef(false)
  const timers = useRef<number[]>([])
  const clearTimers = () => { for (const id of timers.current) window.clearTimeout(id); timers.current = [] }
  const startSpin = (choiceId: string) => {
    if (spinning || result) return
    const visual = eventChoiceVisual(eventId, choiceId)
    const preview = onPreview(choiceId)
    const outcomes = preview.outcomes.length ? preview.outcomes : visual?.outcomes ?? [{ tone: 'neutral' as const, label: t('outcome.continue') }]
    const rouletteIdx = outcomes.map((o,i) => o.tone === 'positive' || o.tone === 'negative' ? i : -1).filter((i) => i >= 0)
    setActiveChoice(choiceId); committed.current = false; clearTimers()
    if (rouletteIdx.length < 2) { const win = outcomes[preview.winningIndex] ?? outcomes[0]!; setResult({ choiceId, label: outcomeLabel(win.label,t), tone: win.tone, winningIndex: preview.winningIndex, outcomes }); return }
    setSpinning(true); setHighlightPill(null)
    const tickCount = 14 + Math.floor(Math.random() * 7); const delays = buildDecelDelays(2800 + Math.random() * 800, tickCount); let elapsed = 0; let tickIdx = 0
    for (let i=0;i<tickCount;i+=1) { elapsed += delays[i]!; const idx=i; const tid=window.setTimeout(() => { setHighlightPill(rouletteIdx[tickIdx % rouletteIdx.length]!); tickIdx += 1; if (idx === tickCount - 1) { const landId=window.setTimeout(() => { setSpinning(false); setHighlightPill(null); const win=outcomes[preview.winningIndex] ?? outcomes[0]!; setResult({ choiceId, label: outcomeLabel(win.label,t), tone: win.tone, winningIndex: preview.winningIndex, outcomes }) },280); timers.current.push(landId) } },elapsed); timers.current.push(tid) }
  }
  const finish = () => { if (!result || committed.current || exiting) return; committed.current = true; setExiting(true); const id=result.choiceId; window.setTimeout(() => { setResult(null); setActiveChoice(null); setExiting(false); onCommit(id) },220) }
  return <div className={`glass-card space-y-3 rounded-2xl p-4 transition-opacity duration-300 ${exiting ? 'opacity-40' : 'opacity-100'}`}><h3 className="font-display text-lg font-black uppercase">{title}</h3><p className="text-sm leading-6 text-[var(--muted)]">{body}</p><div className="grid gap-3 sm:grid-cols-2">{choices.map((choice) => { const visual=eventChoiceVisual(eventId,choice.id); if (!visual) return <button key={choice.id} type="button" disabled={spinning || Boolean(result)} onClick={() => startSpin(choice.id)} className={`rounded-2xl px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5 ${impact === 'ruin' && (choice.id === 'consume' || choice.id === 'retire_medical') ? 'bg-rose-700 text-white' : 'bg-[var(--accent)] text-[var(--accent-ink)]'}`}>{choice.label}</button>; const isActive=activeChoice === choice.id; return <button key={choice.id} type="button" disabled={spinning || Boolean(result)} onClick={() => startSpin(choice.id)} className={`group overflow-hidden rounded-2xl border bg-black/25 text-left transition hover:-translate-y-0.5 ${result?.choiceId === choice.id ? 'border-[var(--accent)]' : spinning && isActive ? 'border-[var(--gold)]' : 'border-[var(--border)]'}`}><div className="aspect-[16/10] overflow-hidden bg-black/40"><img src={visual.imageSrc} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /></div><div className="space-y-2 p-3"><div className="text-sm font-bold">{choice.label}</div><div className="flex flex-wrap gap-1.5">{visual.outcomes.map((outcome,i) => { const winner=result?.choiceId === choice.id && result.winningIndex === i; const loser=result?.choiceId === choice.id && result.winningIndex !== i && visual.outcomes.length > 1; const spin=spinning && isActive && highlightPill === i; return <span key={i} className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${loser ? 'opacity-35 line-through' : winner ? outcome.tone === 'positive' ? 'scale-110 bg-[var(--accent)] text-[var(--accent-ink)]' : outcome.tone === 'negative' ? 'scale-110 bg-rose-400 text-black' : 'bg-white text-black' : spin ? 'scale-110 bg-[var(--gold)] text-black' : outcome.tone === 'positive' ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : outcome.tone === 'negative' ? 'bg-rose-500/20 text-rose-200' : 'bg-white/10 text-[var(--muted)]'}`}>{outcomeLabel(outcome.label,t)}{outcome.chance != null ? ` · ${outcome.chance}%` : ''}</span> })}</div></div></button> })}</div>{result ? <div className="outcome-overlay flex flex-col items-center gap-2 pt-2"><p className={`font-display text-base font-black ${result.tone === 'positive' ? 'text-[var(--accent)]' : result.tone === 'negative' ? 'text-rose-300' : 'text-[var(--muted)]'}`}>{result.label}</p><button type="button" onClick={finish} className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-black text-[var(--accent-ink)]">{t('common.continue')}</button></div> : null}</div>
}
