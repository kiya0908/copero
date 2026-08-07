import type { ReactNode } from 'react'
import { getCompetition, getTeam } from '../../data/catalog'
import { originOvrDelta, academyStartRole } from '../../engine/originStart'
import type { ClubOffer, Player, PlayingRole } from '../../engine/types'
import { previewObjectiveForClub } from '../../engine/objectives'
import { formatMoney, objectiveText, pathReasonText, roleText, useI18n } from '../../i18n/config'
import { shortClubName } from './positions'

const ROLE_RANK: Record<PlayingRole, number> = { bench: 0, rotation: 1, starter: 2, undisputed: 3 }

function tierBorder(rep: number): string {
  if (rep >= 5) return 'border-[var(--gold-border)] shadow-[0_0_20px_color-mix(in_oklch,var(--gold)_15%,transparent)]'
  if (rep >= 4) return 'border-[color-mix(in_oklch,var(--accent)_35%,var(--border))]'
  if (rep >= 3) return 'border-white/25'
  return 'border-[var(--border)]'
}

const cardBase = 'offer-card-potrero relative flex min-h-[200px] flex-col overflow-hidden rounded-2xl border bg-[color-mix(in_oklch,var(--surface)_82%,black)] p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]'

export function ClubOfferCard({ offer, onSign, stay, origin, selected, currentRole, currentRep = 1, seasonsAtClub = 0, playerOvr = 60, player }: { offer?: ClubOffer; stay?: { teamId: string; onStay: () => void }; origin?: { teamId: string; label?: string; onPick: () => void }; onSign?: () => void; selected?: boolean; currentRole?: PlayingRole; currentRep?: number; seasonsAtClub?: number; playerOvr?: number; player?: Player | null }) {
  const { locale, t } = useI18n()
  const ring = selected ? 'ring-2 ring-[var(--gold)] border-[var(--gold)]' : ''

  if (origin) {
    const team = getTeam(origin.teamId)
    const comp = team ? getCompetition(team.competition_id) : undefined
    const name = shortClubName(team?.name ?? origin.teamId)
    const rep = team?.international_reputation ?? 1
    const previewRole = academyStartRole(team, 0.5)
    const ovr = originOvrDelta(team, previewRole)
    return <button type="button" onClick={origin.onPick} className={`${cardBase} ${tierBorder(rep)} ${ring}`}>
      {team?.logo_url ? <img src={team.logo_url} alt="" className="pointer-events-none absolute -right-4 -top-2 h-36 w-36 object-contain opacity-[.1]" /> : null}
      <div className="relative z-10 flex items-center gap-2"><span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white p-1.5">{team?.logo_url ? <img src={team.logo_url} alt="" className="h-full w-full object-contain" /> : <span className="text-black/50">?</span>}</span><div className="font-display text-sm font-black uppercase">{name}</div></div>
      <div className="relative z-10 mt-3 text-xs text-[var(--muted)]">{t(rep >= 3 ? 'game.origin.preview.strong.risk' : rep <= 1 ? 'game.origin.preview.small.minutes' : 'game.origin.preview.mid.growth')}</div>
      <div className={`relative z-10 mt-2 text-xs font-bold ${ovr.delta > 0 ? 'text-[var(--accent)]' : ovr.delta < 0 ? 'text-rose-300' : 'text-[var(--muted)]'}`}>{ovr.delta > 0 ? `+${ovr.delta}` : ovr.delta} OVR · {roleText(previewRole, t)}</div>
      <div className="relative z-10 mt-auto flex items-center gap-1.5 pt-4 text-[11px] text-[var(--muted)]">{comp?.logo_url ? <img src={comp.logo_url} alt="" className="h-4 w-4 object-contain" /> : null}{comp?.name ?? team?.country_fifa_code ?? '—'}</div>
    </button>
  }

  if (stay) {
    const team = getTeam(stay.teamId)
    const name = shortClubName(team?.name ?? stay.teamId)
    const rep = team?.international_reputation ?? 1
    const referente = Math.min(100, Math.round(seasonsAtClub * 18 + Math.max(0, playerOvr - 68) * 2.5))
    const stayMeta = previewObjectiveForClub(player, stay.teamId, currentRole ?? 'rotation')
    return <button type="button" onClick={stay.onStay} className={`${cardBase} ${tierBorder(rep)} ${ring}`}>
      {team?.logo_url ? <img src={team.logo_url} alt="" className="pointer-events-none absolute -right-4 -top-2 h-36 w-36 object-contain opacity-[.1]" /> : null}
      <div className="relative z-10 mb-2"><span className="rounded-sm bg-[var(--accent)] px-1.5 py-0.5 font-mono text-[9px] font-black uppercase text-[var(--accent-ink)]">{t('career.offer.renewal')}</span></div>
      <div className="relative z-10 flex items-center gap-2">{team?.logo_url ? <img src={team.logo_url} alt="" className="h-10 w-10 object-contain" /> : <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10">?</div>}<div><div className="font-display text-sm font-black uppercase">{name}</div><div className="text-[11px] text-[var(--muted)]">{t('career.offer.stay')}</div></div></div>
      <div className="relative z-10 mt-4"><div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]"><span>{t('career.offer.reference')}</span><span>{referente}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${referente}%` }} /></div></div>
      <div className="relative z-10 mt-3 rounded-lg border border-[color-mix(in_oklch,var(--accent)_25%,var(--border))] bg-[var(--accent-soft)] px-2 py-1.5 text-[11px]"><span className="font-bold text-[var(--accent)]">{t('career.offer.goal')}</span>{objectiveText(stayMeta, t)}</div>
    </button>
  }

  if (!offer || !onSign) return null
  const team = getTeam(offer.teamId)
  const comp = team ? getCompetition(team.competition_id) : undefined
  const label = shortClubName(team?.name ?? offer.teamId)
  const rep = team?.international_reputation ?? 1
  const monthly = Math.round(offer.annualWage / 12)
  const meta = previewObjectiveForClub(player, offer.teamId, offer.role)
  const badges: string[] = []
  if (offer.kind === 'renewal') badges.push(t('career.offer.renewal'))
  if (offer.kind === 'loan') badges.push(t('career.offer.loan'))
  if (offer.kind === 'academy') badges.push(t('career.offer.academy'))
  if (offer.pathReason === 'home_return') badges.push(t('career.offer.home'))
  if (offer.pathReason === 'recovery') badges.push(t('career.offer.recovery'))
  if (offer.kind === 'transfer' && rep >= currentRep + 2 && offer.pathReason !== 'home_return' && offer.pathReason !== 'recovery') badges.push(t('career.offer.bomb'))
  const path = pathReasonText(offer.pathReason, t)
  if (path && offer.pathReason !== 'home_return' && offer.pathReason !== 'recovery' && offer.kind !== 'renewal') badges.push(path.toUpperCase())
  const impact = !currentRole ? t('career.offer.startsAs', { role: roleText(offer.role, t) }) : ROLE_RANK[offer.role] > ROLE_RANK[currentRole] ? t('career.offer.moreMinutes') : ROLE_RANK[offer.role] < ROLE_RANK[currentRole] ? t('career.offer.lessMinutes') : t('career.offer.startsAs', { role: roleText(offer.role, t) })

  return <button type="button" onClick={onSign} className={`${cardBase} ${tierBorder(rep)} ${ring} ${offer.kind === 'loan' ? 'border-dashed' : ''}`}>
    {team?.logo_url ? <img src={team.logo_url} alt="" className="pointer-events-none absolute -right-6 -top-4 h-40 w-40 object-contain opacity-[.12]" /> : null}
    <div className="relative z-10 mb-2 flex flex-wrap gap-1">{badges.map((badge) => <span key={badge} className="rounded-sm bg-white/10 px-1.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-wide">{badge}</span>)}</div>
    <div className="relative z-10 flex items-center gap-2"><span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white p-1.5">{team?.logo_url ? <img src={team.logo_url} alt="" className="h-full w-full object-contain" /> : <span className="text-black/50">?</span>}</span><div className="min-w-0"><div className="truncate font-display text-sm font-black uppercase">{label}</div><div className="flex items-center gap-1 text-[11px] text-[var(--muted)]">{comp?.logo_url ? <img src={comp.logo_url} alt="" className="h-3.5 w-3.5 object-contain" /> : null}<span className="truncate">{comp?.name ?? team?.country_fifa_code ?? '—'}</span></div></div></div>
    <div className="relative z-10 mt-3"><div className="money-neon font-display text-xl font-black tabular-nums">{formatMoney(monthly, locale)}<span className="text-sm font-bold">{t('career.offer.month')}</span></div><div className="text-xs text-[var(--muted)]">{formatMoney(offer.annualWage, locale)}{t('career.offer.year')} · {t(offer.years === 1 ? 'career.offer.oneYear' : 'career.offer.years', { count: offer.years })}</div></div>
    {path && offer.pathReason !== 'home_return' && offer.pathReason !== 'recovery' ? <div className="relative z-10 mt-2 text-[11px] text-[var(--accent)]">{t('career.offer.why', { reason: path })}</div> : null}
    {offer.pathReason === 'home_return' ? <div className="relative z-10 mt-2 text-[11px] font-bold text-[var(--gold)]">{t('career.offer.homeBody')}</div> : null}
    {offer.pathReason === 'recovery' ? <div className="relative z-10 mt-2 text-[11px] font-bold text-[var(--gold)]">{t('career.offer.recoveryBody')}</div> : null}
    {offer.transferFee != null && offer.transferFee > 0 ? <div className="relative z-10 mt-1 text-[11px] text-[var(--muted)]">{t('career.offer.fee', { value: formatMoney(offer.transferFee, locale) })}</div> : null}
    <div className="relative z-10 mt-2 text-[11px] font-bold text-[var(--muted)]">{impact}</div>
    <div className="relative z-10 mt-2 rounded-lg border border-[color-mix(in_oklch,var(--accent)_25%,var(--border))] bg-[var(--accent-soft)] px-2 py-1.5 text-[11px]"><span className="font-bold text-[var(--accent)]">{t('career.offer.goal')}</span>{objectiveText(meta, t)}</div>
  </button>
}

export function OfferGrid({ children }: { children: ReactNode }) { return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div> }
export function MarketHeader({ title, subtitle }: { title?: string; subtitle?: string }) { return <div className="mb-1"><h3 className="font-display text-lg font-black uppercase tracking-[.06em]">{title}</h3>{subtitle ? <p className="text-sm text-[var(--muted)]">{subtitle}</p> : null}</div> }
export function RetireCard({ onRetire }: { onRetire: () => void }) { const { t } = useI18n(); return <button type="button" onClick={onRetire} className="offer-card-potrero relative mt-2 flex min-h-[88px] w-full overflow-hidden rounded-2xl border border-[var(--border)] text-left"><img src="/career-simulator/career-events/retirement.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" /><div className="relative z-10 flex w-full flex-col justify-center bg-gradient-to-r from-black/85 to-black/30 px-4 py-3"><div className="font-display text-sm font-black uppercase">{t('career.retire')}</div><div className="text-xs text-[var(--muted)]">{t('career.retireBody')}</div></div></button> }
