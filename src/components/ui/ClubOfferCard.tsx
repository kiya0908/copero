import type { ReactNode } from 'react'
import { getCompetition, getTeam } from '../../data/catalog'
import { pathReasonLabel } from '../../engine/careerPath'
import { formatMoney } from '../../engine/development'
import { originOvrDelta, academyStartRole } from '../../engine/originStart'
import type { ClubOffer, Player, PlayingRole } from '../../engine/types'
import { roleLabel } from '../../engine/contract'
import { previewObjectiveForClub } from '../../engine/objectives'
import { shortClubName } from './positions'

const ROLE_RANK: Record<PlayingRole, number> = {
  bench: 0,
  rotation: 1,
  starter: 2,
  undisputed: 3,
}

function tierBorder(rep: number): string {
  if (rep >= 5) return 'border-amber-400/50 shadow-[0_0_20px_rgba(245,197,66,0.15)]'
  if (rep >= 4) return 'border-sky-400/40'
  if (rep >= 3) return 'border-white/25'
  return 'border-white/10'
}

function offerBadges(
  offer: ClubOffer,
  currentRep: number,
): { label: string; cls: string }[] {
  const team = getTeam(offer.teamId)
  const rep = team?.international_reputation ?? 1
  const badges: { label: string; cls: string }[] = []
  if (offer.kind === 'renewal') {
    badges.push({ label: 'RENOVACIÓN', cls: 'bg-emerald-500/90 text-black' })
  }
  if (offer.kind === 'loan') {
    badges.push({ label: 'PRÉSTAMO · 1 TEMP', cls: 'bg-sky-400 text-black ring-1 ring-sky-200/50' })
  }
  if (offer.kind === 'academy') {
    badges.push({ label: 'CANTERA', cls: 'bg-violet-500/90 text-white' })
  }
  if (offer.kind === 'transfer' && offer.pathReason === 'home_return') {
    badges.push({ label: 'VUELTA TRIUNFAL', cls: 'bg-amber-400 text-black' })
  }
  if (offer.pathReason === 'recovery') {
    badges.push({ label: 'RECUPERACIÓN', cls: 'bg-amber-500/90 text-black' })
  }
  if (
    offer.kind === 'transfer' &&
    rep >= currentRep + 2 &&
    offer.pathReason !== 'home_return' &&
    offer.pathReason !== 'recovery'
  ) {
    badges.push({ label: 'BOMBAZO', cls: 'bg-rose-500/95 text-white' })
  }
  const path = pathReasonLabel(offer.pathReason)
  if (
    path &&
    offer.pathReason !== 'home_return' &&
    offer.pathReason !== 'recovery' &&
    offer.kind !== 'renewal'
  ) {
    badges.push({ label: path.toUpperCase(), cls: 'bg-white/15 text-white/90' })
  }
  return badges
}

function minutesImpact(offerRole: PlayingRole, currentRole?: PlayingRole): string | null {
  if (!currentRole) return `Allá arrancás: ${roleLabel(offerRole)}`
  const delta = ROLE_RANK[offerRole] - ROLE_RANK[currentRole]
  if (delta > 0) return 'Vas a jugar MÁS'
  if (delta < 0) return 'Vas a jugar MENOS'
  return `Allá arrancás: ${roleLabel(offerRole)}`
}

const cardBase =
  'offer-card-potrero relative flex min-h-[200px] flex-col overflow-hidden rounded-2xl border bg-[#121212] p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'

export function ClubOfferCard({
  offer,
  onSign,
  stay,
  origin,
  selected,
  currentRole,
  currentRep = 1,
  seasonsAtClub = 0,
  playerOvr = 60,
  player,
}: {
  offer?: ClubOffer
  stay?: { teamId: string; onStay: () => void }
  origin?: { teamId: string; label?: string; onPick: () => void }
  onSign?: () => void
  selected?: boolean
  currentRole?: PlayingRole
  currentRep?: number
  seasonsAtClub?: number
  playerOvr?: number
  player?: Player | null
}) {
  const ring = selected ? 'ring-2 ring-[color:var(--color-ovr)] border-[color:var(--color-ovr)]' : ''

  if (origin) {
    const team = getTeam(origin.teamId)
    const comp = team ? getCompetition(team.competition_id) : undefined
    const name = shortClubName(team?.name ?? origin.teamId)
    const rep = team?.international_reputation ?? 1
    const tip =
      rep >= 3 ? 'Grande: pelearás minutos' : rep <= 1 ? 'Chico: titular y referente' : 'Equilibrio minutos/proyección'
    const previewRole = academyStartRole(team, 0.5)
    const ovr = originOvrDelta(team, previewRole)
    const ovrCls =
      ovr.delta > 0 ? 'text-emerald-300' : ovr.delta < 0 ? 'text-rose-300' : 'text-white/55'
    return (
      <button type="button" onClick={origin.onPick} className={`${cardBase} ${tierBorder(rep)} ${ring}`}>
        {team?.logo_url && (
          <img
            src={team.logo_url}
            alt=""
            className="pointer-events-none absolute -right-4 -top-2 h-36 w-36 object-contain opacity-[0.12]"
          />
        )}
        <div className="relative z-10 flex items-center gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/95 p-1.5 ring-1 ring-black/10">
            {team?.logo_url ? (
              <img src={team.logo_url} alt="" className="h-full w-full object-contain" />
            ) : (
              <span className="text-lg text-black/40">?</span>
            )}
          </span>
          <div className="font-display text-sm font-extrabold uppercase tracking-wide text-white">{name}</div>
        </div>
        <div className="relative z-10 mt-2 text-[11px] text-white/50">{tip}</div>
        <div className={`relative z-10 mt-1 text-[11px] font-semibold ${ovrCls}`}>
          {ovr.delta > 0 ? `+${ovr.delta}` : ovr.delta} OVR · {roleLabel(previewRole)}
        </div>
        <div className="relative z-10 mt-auto flex items-center gap-1.5 pt-4 text-[11px] text-white/45">
          {comp?.logo_url && <img src={comp.logo_url} alt="" className="h-4 w-4 object-contain" />}
          {comp?.name ?? 'Liga'}
        </div>
      </button>
    )
  }

  if (stay) {
    const team = getTeam(stay.teamId)
    const name = shortClubName(team?.name ?? stay.teamId)
    const rep = team?.international_reputation ?? 1
    const referente = Math.min(100, Math.round(seasonsAtClub * 18 + Math.max(0, playerOvr - 68) * 2.5))
    const stayMeta = previewObjectiveForClub(player, stay.teamId, currentRole ?? 'rotation')
    return (
      <button type="button" onClick={stay.onStay} className={`${cardBase} ${tierBorder(rep)} ${ring}`}>
        {team?.logo_url && (
          <img
            src={team.logo_url}
            alt=""
            className="pointer-events-none absolute -right-4 -top-2 h-36 w-36 object-contain opacity-[0.12]"
          />
        )}
        <div className="relative z-10 mb-1 flex flex-wrap gap-1">
          <span className="rounded-sm bg-emerald-500/90 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-black">
            RENOVACIÓN
          </span>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          {team?.logo_url ? (
            <img src={team.logo_url} alt="" className="h-10 w-10 object-contain" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">?</div>
          )}
          <div>
            <div className="font-display text-sm font-extrabold uppercase tracking-wide text-white">{name}</div>
            <div className="text-[11px] text-white/45">Quedarte en el club</div>
          </div>
        </div>
        <div className="relative z-10 mt-4">
          <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wide text-white/40">
            <span>Camino a Referente</span>
            <span>{referente}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${referente}%` }} />
          </div>
        </div>
        <div className="relative z-10 mt-3 rounded-lg border border-sky-400/20 bg-sky-500/10 px-2 py-1.5 text-[11px] text-sky-100/90">
          <span className="font-semibold text-sky-200/70">Meta ahí · </span>
          {stayMeta.label}
        </div>
      </button>
    )
  }

  if (!offer || !onSign) return null
  const team = getTeam(offer.teamId)
  const comp = team ? getCompetition(team.competition_id) : undefined
  const label = shortClubName(team?.name ?? offer.teamId)
  const rep = team?.international_reputation ?? 1
  const badges = offerBadges(offer, currentRep)
  const impact = minutesImpact(offer.role, currentRole)
  const monthly = Math.round(offer.annualWage / 12)
  const pathHint = pathReasonLabel(offer.pathReason)
  const meta = previewObjectiveForClub(player, offer.teamId, offer.role)

  return (
    <button
      type="button"
      onClick={onSign}
      className={`${cardBase} ${tierBorder(rep)} ${ring} ${
        offer.kind === 'loan' ? 'border-dashed border-sky-400/45 bg-[#0c1520]' : ''
      }`}
    >
      {team?.logo_url && (
        <img
          src={team.logo_url}
          alt=""
          className="pointer-events-none absolute -right-6 -top-4 h-40 w-40 object-contain opacity-[0.14]"
        />
      )}
      <div className="relative z-10 mb-2 flex flex-wrap gap-1">
        {badges.map((b) => (
          <span
            key={b.label}
            className={`skew-x-[-6deg] rounded-sm px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${b.cls}`}
          >
            <span className="inline-block skew-x-[6deg]">{b.label}</span>
          </span>
        ))}
      </div>
      <div className="relative z-10 flex items-center gap-2">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/95 p-1.5 ring-1 ring-black/10">
          {team?.logo_url ? (
            <img src={team.logo_url} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-lg text-black/40">?</span>
          )}
        </span>
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-extrabold uppercase tracking-wide text-white">
            {label}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-white/40">
            {comp?.logo_url && <img src={comp.logo_url} alt="" className="h-3.5 w-3.5 object-contain" />}
            <span className="truncate">{comp?.name ?? 'Liga'}</span>
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-3">
        <div className="money-neon font-display text-xl font-extrabold tabular-nums">
          {formatMoney(monthly)}
          <span className="text-sm font-semibold text-emerald-300/80">/mes</span>
        </div>
        <div className="text-xs text-white/40">
          {formatMoney(offer.annualWage)}/año · {offer.years} {offer.years === 1 ? 'año' : 'años'}
        </div>
      </div>
      {pathHint && offer.pathReason !== 'home_return' && offer.pathReason !== 'recovery' && (
        <div className="relative z-10 mt-2 text-[11px] text-sky-200/80">Por qué llega: {pathHint}</div>
      )}
      {offer.pathReason === 'home_return' && (
        <div className="relative z-10 mt-2 text-[11px] font-semibold text-amber-200">
          Tu club formador te llama a casa
        </div>
      )}
      {offer.pathReason === 'recovery' && (
        <div className="relative z-10 mt-2 text-[11px] font-semibold text-amber-200/90">
          Segunda oportunidad en un club menor
        </div>
      )}
      {offer.transferFee != null && offer.transferFee > 0 && (
        <div className="relative z-10 mt-1 text-[11px] text-white/45">
          Traspaso: {formatMoney(offer.transferFee)}
        </div>
      )}
      {impact && (
        <div className="relative z-10 mt-2 text-[11px] font-semibold text-white/65">{impact}</div>
      )}
      <div className="relative z-10 mt-2 rounded-lg border border-sky-400/20 bg-sky-500/10 px-2 py-1.5 text-[11px] text-sky-100/90">
        <span className="font-semibold text-sky-200/70">Meta ahí · </span>
        {meta.label}
      </div>
    </button>
  )
}

export function OfferGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
}

export function MarketHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <div className="mb-1">
      <h3 className="font-display text-lg font-extrabold uppercase tracking-[0.06em] text-white">
        {title ?? 'Mercado de pases'}
      </h3>
      <p className="text-sm text-white/50">{subtitle ?? '¿Gloria o billetera?'}</p>
    </div>
  )
}

export function RetireCard({ onRetire }: { onRetire: () => void }) {
  return (
    <button
      type="button"
      onClick={onRetire}
      className="offer-card-potrero relative mt-2 flex min-h-[88px] w-full overflow-hidden rounded-2xl border border-white/10 text-left"
    >
      <img
        src="/career-simulator/career-events/retirement.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div className="relative z-10 flex w-full flex-col justify-center bg-gradient-to-r from-black/80 to-black/30 px-4 py-3">
        <div className="font-display text-sm font-extrabold uppercase text-white">Retirarse</div>
        <div className="text-xs text-white/60">Finalizar tu carrera profesional</div>
      </div>
    </button>
  )
}
