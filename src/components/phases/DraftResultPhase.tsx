import { getCountry } from '../../data/catalog'
import { ATTRIBUTE_LABELS, ATTRIBUTE_ORDER } from '../../engine/draft'
import type { AttributeKey, GameState } from '../../engine/types'
import { countryName, positionText, useI18n } from '../../i18n/config'
import { Button, Eyebrow, SurfaceCard } from '../ui/primitives'

function valueText(key: AttributeKey, value: number): string { return key === 'skillMoves' || key === 'weakFoot' ? `${value}★` : String(value) }

export function DraftResultPhase({ state, onContinue }: { state: GameState; onContinue: () => void }) {
  const { locale, t } = useI18n()
  const player = state.player
  if (!player) return null
  const country = getCountry(player.nationalityFifa)
  return (
    <section className="site-container grid gap-7 py-8 sm:py-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
      <div><Eyebrow>{t('game.draftResult.eyebrow')}</Eyebrow><h1 className="mt-3 max-w-[12ch] font-display text-[clamp(2.8rem,7vw,5rem)] font-black uppercase leading-[.92] tracking-[-.045em]">{t('game.draftResult.title')}</h1><p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">{t('game.draftResult.body')}</p><div className="mt-7 grid max-w-xl grid-cols-2 gap-3"><SurfaceCard className="p-5"><div className="font-mono text-xs uppercase tracking-wider text-[var(--muted)]">{t('game.draftResult.initial')}</div><div className="mt-1 font-display text-4xl font-black">{player.overall}</div></SurfaceCard><SurfaceCard gold className="p-5"><div className="font-mono text-xs uppercase tracking-wider text-[var(--gold)]">{t('game.draftResult.potential')}</div><div className="mt-1 font-display text-4xl font-black text-[var(--gold)]">{player.potential}</div></SurfaceCard></div><div className="mt-7"><Button onClick={onContinue}>{t('game.draftResult.continue')} <span aria-hidden>→</span></Button></div></div>
      <SurfaceCard gold className="p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><div className="font-display text-5xl font-black">{player.potential}</div><div className="mt-1 font-display text-xl font-black">{positionText(player.position, t, true)}</div><div className="mt-3 font-mono text-xs uppercase tracking-widest text-[var(--muted)]">{country ? countryName(country, locale) : player.nationalityFifa}</div></div><div className="text-right"><div className="font-display text-3xl font-black uppercase">{player.lastName || '—'}</div><div className="mt-1 text-sm text-[var(--muted)]">#{player.preferredNumber} · {t(player.preferredFoot === 'left' ? 'identity.left' : 'identity.right')}</div></div></div><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{ATTRIBUTE_ORDER.map((key) => <div key={key} className="rounded-2xl border border-[var(--border)] bg-black/15 px-3 py-4 text-center"><div className="font-mono text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">{ATTRIBUTE_LABELS[key].short}</div><div className="mt-1 font-display text-2xl font-black">{valueText(key, player.attributes[key])}</div></div>)}</div><div className="mt-6 border-t border-[var(--border)] pt-5"><div className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--muted)]">{t('game.draftResult.built')}</div><div className="mt-3 flex flex-wrap gap-2">{player.draftPicks.map((pick) => <span key={`${pick.legendId}-${pick.attribute}`} className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] text-[var(--muted)]">{ATTRIBUTE_LABELS[pick.attribute].short} · {pick.legendName}</span>)}</div></div></SurfaceCard>
    </section>
  )
}
