import { useEffect } from 'react'
import { legendById } from '../../data/legends'
import { ATTRIBUTE_LABELS, ATTRIBUTE_ORDER, recommendedAttribute } from '../../engine/draft'
import type { AttributeKey, GameState } from '../../engine/types'
import { attributeText, positionText, useI18n } from '../../i18n/config'
import { Button, StatusPanel } from '../ui/primitives'

function valueText(key: AttributeKey, value: number): string { return key === 'skillMoves' || key === 'weakFoot' ? `${value}★` : String(value) }

export function DraftPhase({ state, onEnsureLegend, onTake, onSkip, onBack }: { state: GameState; onEnsureLegend: () => void; onTake: () => void; onSkip: () => void; onBack: () => void }) {
  const { t } = useI18n()
  useEffect(() => { if (!state.draft.currentLegendId) onEnsureLegend() }, [state.draft.currentLegendId, onEnsureLegend])
  const legend = state.draft.currentLegendId ? legendById(state.draft.currentLegendId) : undefined
  const recommended = recommendedAttribute(state)
  const selected = new Set(state.draft.picks.map((pick) => pick.attribute))
  const isPurist = state.draftMode === 'purist'
  return (
    <section className="site-container py-6 sm:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-xs font-bold uppercase tracking-[.16em] text-[var(--accent)]">{t('game.draft.eyebrow')}</p><h1 className="mt-2 font-display text-3xl font-black uppercase">{t('game.draft.round', { round: state.draft.picks.length + 1, total: ATTRIBUTE_ORDER.length })}</h1><p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{t('game.draft.help')}</p></div><span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 font-mono text-xs font-bold text-[var(--muted)]">{t(isPurist ? 'game.draft.purist' : 'game.draft.classic', { count: state.draft.skipsRemaining })}</span></div>
      <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <div className="brand-result-card min-h-[470px] p-5 sm:p-7">
          {legend ? <div><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[.12em] text-[var(--muted)]">{legend.country} · {legend.era}</p><h2 className="mt-2 font-display text-4xl font-black uppercase">{legend.name}</h2><p className="mt-2 text-sm text-[var(--muted)]">{legend.positions.join(' · ')}</p></div><div className="grid h-20 w-20 place-items-center rounded-2xl border border-[var(--gold-border)] bg-[var(--gold-soft)] font-display text-2xl font-black text-[var(--gold)]">{legend.name.split(' ').map((p) => p[0]).join('').slice(0,2)}</div></div>
            <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">{ATTRIBUTE_ORDER.map((key) => { const locked = selected.has(key); const highlighted = recommended === key; return <div key={key} title={attributeText(key, t)} className={`rounded-2xl border px-3 py-3 ${locked ? 'border-[var(--border)] bg-black/25 opacity-40' : highlighted && !isPurist ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] bg-black/20'}`}><div className="font-mono text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">{ATTRIBUTE_LABELS[key].short}</div><div className="mt-1 font-display text-2xl font-black">{locked ? 'LOCK' : isPurist ? '??' : valueText(key, legend.attributes[key])}</div></div> })}</div>
            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-black/20 p-4">{isPurist ? <><div className="font-bold">{t('game.draft.trust')}</div><p className="mt-1 text-xs leading-6 text-[var(--muted)]">{t('game.draft.trustBody')}</p></> : recommended ? <><div className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">{t('game.draft.best')}</div><div className="mt-1 font-display text-2xl font-black">{ATTRIBUTE_LABELS[recommended].short} · {valueText(recommended, legend.attributes[recommended])}</div></> : null}</div>
            <div className="mt-5 flex flex-wrap gap-3"><Button onClick={onTake} disabled={!recommended}>{t('game.draft.confirm')}</Button>{!isPurist ? <Button tone="secondary" onClick={onSkip} disabled={state.draft.skipsRemaining <= 0}>{t('game.draft.change', { count: state.draft.skipsRemaining })}</Button> : null}</div>
          </div> : <StatusPanel kind="loading" title={t('game.draft.preparing')} />}
        </div>
        <div className="surface-card p-5"><h3 className="font-display text-lg font-black uppercase">{t('game.draft.player')}</h3><p className="mt-1 text-sm text-[var(--muted)]">{state.player?.lastName || '—'} · {state.player ? positionText(state.player.position, t, true) : '—'}</p><div className="mt-5 space-y-2">{ATTRIBUTE_ORDER.map((key) => { const pick = state.draft.picks.find((item) => item.attribute === key); return <div key={key} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-black/15 px-4 py-3"><div className="w-11 font-mono text-xs font-black text-[var(--muted)]">{ATTRIBUTE_LABELS[key].short}</div><div className="flex-1 truncate text-sm font-semibold">{pick ? pick.legendName : t('game.draft.unpicked')}</div><div className="font-display text-lg font-black">{pick ? valueText(key, pick.value) : '—'}</div></div> })}</div><button type="button" onClick={onBack} className="mt-5 text-sm text-[var(--muted)] underline hover:text-[var(--fg)]">{t('game.draft.back')}</button></div>
      </div>
    </section>
  )
}
