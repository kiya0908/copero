import { useEffect, useState } from 'react'
import { pickRoleForAsk, roleLabel } from '../../engine/contract'
import { formatMoney } from '../../engine/development'
import { stageLabel } from '../../engine/careerPath'
import type { ClubOffer, GameState, PlayingRole, TraitId } from '../../engine/types'
import { t } from '../../i18n/es'
import { ClubOfferCard, MarketHeader, OfferGrid, RetireCard } from '../ui/ClubOfferCard'
import { EventChoiceCards, type ChoiceSpinResult } from '../ui/EventChoiceCards'
import { PlayerShell } from '../ui/PlayerShell'
import { SeasonResultCard } from '../ui/SeasonResultCard'
import { StatIcons } from '../ui/StatIcons'
import { TrophyCelebration } from '../ui/TrophyCelebration'
import { flagUrl } from '../../data/flags'
import { getCountry, getTeam } from '../../data/catalog'

export function CareerPhase({
  state,
  onAcceptOffer,
  onRejectOffers,
  onNegotiate,
  onSubmitNegotiation,
  onPreviewChoice,
  onCommitChoice,
  onContinueSeason,
  onDismissCelebration,
  onDismissObjective,
  onBackFromNegotiation,
  onRetire,
  onCallAgent,
  onRespondCallup,
  onChooseTraits,
  onRespondYouthLoan,
}: {
  state: GameState
  onAcceptOffer: (id: string) => void
  onRejectOffers: () => void
  onNegotiate: (id: string) => void
  onSubmitNegotiation: (
    ask: Partial<Pick<ClubOffer, 'annualWage' | 'years' | 'releaseClause' | 'role' | 'signingBonus'>>,
  ) => void
  onPreviewChoice: (id: string) => ChoiceSpinResult
  onCommitChoice: (id: string) => void
  onContinueSeason: () => void
  onDismissCelebration: () => void
  onDismissObjective: () => void
  onBackFromNegotiation: () => void
  onRetire: () => void
  onCallAgent: () => void
  onRespondCallup: (accept: boolean) => void
  onChooseTraits: (ids: TraitId[]) => void
  onRespondYouthLoan: (requestLoan: boolean) => void
}) {
  const event = state.currentEvent

  // Saves viejos: salir del interstitial de objetivo sin UI
  useEffect(() => {
    if (state.currentEvent?.type === 'objective_briefing') {
      onDismissObjective()
    }
  }, [state.currentEvent, onDismissObjective])

  const choosingClub = event?.type === 'offer' || event?.type === 'negotiation'
  const decidingCareer =
    event?.type === 'career_choice' ||
    event?.type === 'national_callup' ||
    event?.type === 'trait_pick' ||
    event?.type === 'youth_loan_choice'
  const showRetire =
    event?.type === 'offer' &&
    (event.title.toLowerCase().includes('fin') || event.title.toLowerCase().includes('contrato')) &&
    Boolean(state.player && state.player.age >= 32)

  const currentTeam = state.currentTeamId ? getTeam(state.currentTeamId) : undefined
  const currentRep = currentTeam?.international_reputation ?? 1
  const seasonsAtClub = state.currentTeamId
    ? state.seasons.filter((s) => s.teamId === state.currentTeamId).length
    : 0

  const left = (
    <div className="space-y-3">
      {event?.type === 'trait_pick' && (
        <TraitPickPanel
          title={event.title}
          body={event.body}
          options={event.options}
          onConfirm={onChooseTraits}
        />
      )}

      {event?.type === 'youth_loan_choice' && (
        <div className="glass-card space-y-3 rounded-2xl p-4">
          <h3 className="font-display text-lg font-extrabold text-white">{event.title}</h3>
          <p className="text-sm text-white/60">{event.body}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onRespondYouthLoan(false)}
              className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
            >
              <div className="text-sm font-extrabold text-white/85">{t('youthLoan.stay')}</div>
              <div className="mt-1 text-[11px] text-white/45">Pelear minutos en el plantel</div>
            </button>
            <button
              type="button"
              onClick={() => onRespondYouthLoan(true)}
              className="rounded-2xl border border-sky-400/40 bg-sky-500/15 px-4 py-3 text-left transition hover:bg-sky-500/25"
            >
              <div className="text-sm font-extrabold text-sky-100">{t('youthLoan.request')}</div>
              <div className="mt-1 text-[11px] text-white/50">Cesión a un club menor</div>
            </button>
          </div>
        </div>
      )}

      {event?.type === 'offer' && (
        <div className="glass-card space-y-3 rounded-2xl p-4">
          <MarketHeader
            title={event.title.toLowerCase().includes('cantera') || event.title.toLowerCase().includes('academia')
              ? 'Cantera'
              : 'Mercado de pases'}
            subtitle={
              event.body?.trim()
                ? event.body
                : '¿Gloria o billetera?'
            }
          />
          <OfferGrid>
            {event.offers.map((offer) => (
              <ClubOfferCard
                key={offer.id}
                offer={offer}
                onSign={() => onAcceptOffer(offer.id)}
                currentRole={state.contract?.role}
                currentRep={currentRep}
                player={state.player}
              />
            ))}
            {event.canReject && state.currentTeamId && (
              <ClubOfferCard
                stay={{ teamId: state.currentTeamId, onStay: onRejectOffers }}
                seasonsAtClub={seasonsAtClub}
                playerOvr={state.player?.overall ?? 60}
                player={state.player}
                currentRole={state.contract?.role}
              />
            )}
          </OfferGrid>
          {showRetire && <RetireCard onRetire={onRetire} />}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {event.canNegotiate && event.offers[0] && (
              <button
                type="button"
                className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:border-white/40 hover:text-white"
                onClick={() => onNegotiate(event.offers[0].id)}
              >
                Negociar contrato
              </button>
            )}
            {!state.agentRerollUsed && state.currentTeamId && event.offers.some((o) => o.kind === 'transfer') && (
              <button
                type="button"
                className="rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-emerald-300 hover:bg-emerald-500/30"
                onClick={onCallAgent}
              >
                Llamar al representante · 1×
              </button>
            )}
          </div>
        </div>
      )}

      {event?.type === 'negotiation' && (
        <NegotiationPanel
          offer={event.offer}
          title={event.title}
          body={event.body}
          pendingOffers={state.pendingOffers}
          onSubmit={onSubmitNegotiation}
          onBack={onBackFromNegotiation}
          onNegotiateOther={onNegotiate}
        />
      )}

      {event?.type === 'career_choice' && (
        <div className="space-y-2">
          <EventChoiceCards
            eventId={event.eventId}
            title={event.title}
            body={event.body}
            choices={event.choices}
            impact={event.impact}
            onPreview={onPreviewChoice}
            onCommit={onCommitChoice}
          />
        </div>
      )}

      {event?.type === 'season_result' && (
        <SeasonResultCard
          title={event.title}
          season={event.season}
          playerAge={state.player?.age ?? event.season.age}
          onContinue={onContinueSeason}
          objectiveLabel={state.seasonObjective?.label ?? event.season.objectiveResult?.label}
          objectiveCompleted={
            state.seasonObjective?.completed ?? event.season.objectiveResult?.completed
          }
          objectiveFailed={state.seasonObjective?.failed ?? event.season.objectiveResult?.failed}
          stageLabelText={stageLabel(state.careerStage ?? 'local')}
        />
      )}

      {event?.type === 'national_callup' && (
        <div className="glass-card space-y-3 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            {(() => {
              const country = getCountry(event.countryFifa)
              return (
                <>
                  {country && (
                    <img src={flagUrl(country.iso_alpha2)} alt="" className="h-6 w-9 rounded-sm" />
                  )}
                  {country?.logo_url && (
                    <img src={country.logo_url} alt="" className="h-10 w-10 object-contain" />
                  )}
                  <div>
                    <h3 className="font-display text-lg font-extrabold">{event.title}</h3>
                    <p className="text-sm text-white/55">{country?.name_es}</p>
                  </div>
                </>
              )
            })()}
          </div>
          <p className="text-sm text-white/65">{event.body}</p>
          {event.viaHeritage && (
            <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/90">
              Convocatoria habilitada por la nacionalidad de tu familiar directo
            </div>
          )}
          <StatIcons
            appearances={event.projected.appearances}
            goals={event.projected.goals}
            assists={event.projected.assists}
            animate={false}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onRespondCallup(true)}
              className="rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3 text-left transition hover:bg-emerald-500/25"
            >
              <div className="text-sm font-extrabold text-emerald-200">Aceptar convocatoria</div>
              <div className="mt-1 text-[11px] text-white/50">Sumás caps con la selección</div>
            </button>
            <button
              type="button"
              onClick={() => onRespondCallup(false)}
              className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
            >
              <div className="text-sm font-extrabold text-white/80">Rechazar</div>
              <div className="mt-1 text-[11px] text-white/45">No pasa nada · sin caps</div>
            </button>
          </div>
        </div>
      )}

      {!event && !state.celebration && (
        <div className="glass-card space-y-3 rounded-2xl p-4">
          <button
            type="button"
            onClick={onContinueSeason}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black"
          >
            Simular
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {state.celebration?.kind === 'trophy' && state.celebration.trophies?.length ? (
        <TrophyCelebration
          message={state.celebration.message}
          trophies={state.celebration.trophies}
          onDismiss={onDismissCelebration}
        />
      ) : null}

      <PlayerShell
        state={state}
        choosingClub={choosingClub}
        decidingCareer={decidingCareer}
        leftExtra={left}
      />
    </>
  )
}

function TraitPickPanel({
  title,
  body,
  options,
  onConfirm,
}: {
  title: string
  body: string
  options: { id: TraitId; label: string; desc: string }[]
  onConfirm: (ids: TraitId[]) => void
}) {
  const [selected, setSelected] = useState<TraitId[]>([])

  const toggle = (id: TraitId) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return [prev[1]!, id]
      return [...prev, id]
    })
  }

  return (
    <div className="glass-card space-y-4 rounded-2xl p-4">
      <div>
        <h3 className="font-display text-lg font-extrabold text-white">{title}</h3>
        <p className="mt-1 text-sm text-white/55">{body}</p>
        <p className="mt-1 text-[11px] text-white/40">{t('traits.pickHint')}</p>
      </div>
      <div className="grid gap-2">
        {options.map((o) => {
          const active = selected.includes(o.id)
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => toggle(o.id)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? 'border-white bg-white/10'
                  : 'border-white/10 bg-black/30 hover:border-white/25'
              }`}
            >
              <div className="text-sm font-extrabold text-white">{o.label}</div>
              <div className="mt-1 text-[12px] text-white/50">{o.desc}</div>
            </button>
          )
        })}
      </div>
      <button
        type="button"
        disabled={selected.length === 0}
        onClick={() => onConfirm(selected)}
        className={`rounded-full px-5 py-2.5 text-sm font-semibold ${
          selected.length
            ? 'bg-white text-black hover:bg-white/90'
            : 'cursor-not-allowed bg-white/20 text-white/40'
        }`}
      >
        {t('traits.confirm')}
      </button>
    </div>
  )
}

function NegotiationPanel({
  offer,
  title,
  body,
  pendingOffers,
  onSubmit,
  onBack,
  onNegotiateOther,
}: {
  offer: ClubOffer
  title: string
  body: string
  pendingOffers: ClubOffer[]
  onSubmit: (
    ask: Partial<Pick<ClubOffer, 'annualWage' | 'years' | 'releaseClause' | 'role' | 'signingBonus'>>,
  ) => void
  onBack: () => void
  onNegotiateOther: (id: string) => void
}) {
  const team = getTeam(offer.teamId)
  const [wage, setWage] = useState(Math.round(offer.annualWage * 1.15))
  const [years, setYears] = useState(Math.min(5, offer.years + 1))
  const [role, setRole] = useState<PlayingRole>(pickRoleForAsk(offer.role))
  const [clause, setClause] = useState(Math.round(offer.releaseClause * 1.2))
  const [pressureId, setPressureId] = useState<string | null>(null)

  const otherOffers = pendingOffers.filter((o) => o.id !== offer.id)
  const pressure = pressureId ? otherOffers.find((o) => o.id === pressureId) : null

  const applyPreset = (kind: 'p10' | 'p20' | 'starter' | 'y1') => {
    if (kind === 'p10') setWage(Math.round(offer.annualWage * 1.1))
    if (kind === 'p20') setWage(Math.round(offer.annualWage * 1.2))
    if (kind === 'starter') setRole('starter')
    if (kind === 'y1') setYears(Math.min(5, offer.years + 1))
  }

  const effectiveWage = pressure
    ? Math.max(wage, Math.round(pressure.annualWage * 1.05))
    : wage

  return (
    <div className="glass-card relative space-y-3 overflow-hidden rounded-2xl p-4">
      {team?.logo_url && (
        <img
          src={team.logo_url}
          alt=""
          className="pointer-events-none absolute -right-6 -top-4 h-40 w-40 object-contain opacity-[0.12]"
        />
      )}
      <div className="relative z-10 flex items-center gap-3">
        {team?.logo_url ? (
          <img src={team.logo_url} alt="" className="h-12 w-12 object-contain" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">?</div>
        )}
        <div>
          <h3 className="font-display text-lg font-extrabold uppercase tracking-wide">{title}</h3>
          <p className="text-sm text-white/55">{body}</p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-white/40">Ofrecen</div>
          <div className="text-sm text-white/70">{formatMoney(offer.annualWage)}/año</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-white/40">Pedís</div>
          <div className="money-neon font-display text-lg font-extrabold">{formatMoney(effectiveWage)}/año</div>
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap gap-2">
        {(
          [
            ['p10', '+10%'],
            ['p20', '+20%'],
            ['starter', 'Titular'],
            ['y1', '+1 año'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => applyPreset(k)}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white/80 hover:border-emerald-400/40 hover:text-emerald-300"
          >
            {label}
          </button>
        ))}
      </div>

      {otherOffers.length >= 1 && (
        <div className="relative z-10 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wide text-white/40">
            Usar otra oferta como presión
          </div>
          <div className="flex flex-wrap gap-2">
            {otherOffers.map((o) => {
              const ot = getTeam(o.teamId)
              const active = pressureId === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setPressureId(active ? null : o.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${
                    active
                      ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200'
                      : 'border-white/15 text-white/60 hover:border-white/30'
                  }`}
                >
                  {ot?.logo_url && <img src={ot.logo_url} alt="" className="h-4 w-4 object-contain" />}
                  {formatMoney(o.annualWage)}
                </button>
              )
            })}
          </div>
          {pressure && (
            <button
              type="button"
              className="text-[11px] text-white/40 underline"
              onClick={() => onNegotiateOther(pressure.id)}
            >
              Cambiar a negociar esa oferta
            </button>
          )}
        </div>
      )}

      <div className="relative z-10 grid gap-2 sm:grid-cols-2">
        <label className="text-xs text-white/50">
          {t('negotiate.askWage')}
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={wage}
            onChange={(e) => setWage(Number(e.target.value) || wage)}
          />
        </label>
        <label className="text-xs text-white/50">
          {t('negotiate.askYears')}
          <input
            type="number"
            min={1}
            max={5}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={years}
            onChange={(e) => setYears(Number(e.target.value) || years)}
          />
        </label>
        <label className="text-xs text-white/50">
          {t('negotiate.askRole')}
          <select
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={role}
            onChange={(e) => setRole(e.target.value as PlayingRole)}
          >
            {(['bench', 'rotation', 'starter', 'undisputed'] as const).map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-white/50">
          {t('negotiate.askClause')}
          <div className="mt-1 flex items-center gap-2">
            <input
              type="number"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              value={clause}
              onChange={(e) => setClause(Number(e.target.value) || clause)}
            />
            <span className="whitespace-nowrap text-xs font-semibold text-white/70">
              {formatMoney(clause)}
            </span>
          </div>
        </label>
      </div>
      <div className="relative z-10 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-black"
          onClick={() =>
            onSubmit({
              annualWage: effectiveWage,
              years,
              role,
              releaseClause: clause,
              signingBonus: Math.round(effectiveWage * 0.4),
            })
          }
        >
          {t('negotiate.submit')}
        </button>
        <button type="button" className="rounded-full border border-white/25 px-4 py-2 text-sm" onClick={onBack}>
          {t('negotiate.back')}
        </button>
      </div>
    </div>
  )
}
