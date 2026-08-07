import { useEffect, useMemo, useState } from 'react'
import { getCountry, getTeam } from '../../data/catalog'
import { flagUrl } from '../../data/flags'
import { stageLabel } from '../../engine/careerPath'
import { pickRoleForAsk, roleLabel } from '../../engine/contract'
import type { ClubOffer, DisplayText, GameState, PlayingRole, TraitId } from '../../engine/types'
import { useI18n } from '../../i18n/config'
import {
  countryDisplayName,
  formatMoneyForLocale,
  resolveGameText,
  type GameTranslate,
} from '../../i18n/game'
import { ClubOfferCard, MarketHeader, OfferGrid, RetireCard } from '../ui/ClubOfferCard'
import { EventChoiceCards, type ChoiceSpinResult } from '../ui/EventChoiceCards'
import { PlayerShell } from '../ui/PlayerShell'
import { SeasonResultCard } from '../ui/SeasonResultCard'
import { StatIcons } from '../ui/StatIcons'
import { TrophyCelebration } from '../ui/TrophyCelebration'

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
  const { locale, t } = useI18n()
  const gameT: GameTranslate = (key, params) => t('game', key, params)
  const event = state.currentEvent

  useEffect(() => {
    if (state.currentEvent?.type === 'objective_briefing') onDismissObjective()
  }, [state.currentEvent, onDismissObjective])

  const choosingClub = event?.type === 'offer' || event?.type === 'negotiation'
  const decidingCareer =
    event?.type === 'career_choice' ||
    event?.type === 'national_callup' ||
    event?.type === 'trait_pick' ||
    event?.type === 'youth_loan_choice'
  const showRetire =
    event?.type === 'offer' &&
    Boolean(state.player && state.player.age >= 32) &&
    ((state.contract?.yearsRemaining ?? 1) <= 0 || event.offers.some((offer) => offer.kind === 'renewal'))

  const currentTeam = state.currentTeamId ? getTeam(state.currentTeamId) : undefined
  const currentRep = currentTeam?.international_reputation ?? 1
  const seasonsAtClub = state.currentTeamId
    ? state.seasons.filter((season) => season.teamId === state.currentTeamId).length
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
          <h3 className="font-display text-lg font-extrabold text-white">
            {resolveGameText(gameT, event.title)}
          </h3>
          <p className="text-sm text-white/60">{resolveGameText(gameT, event.body)}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onRespondYouthLoan(false)}
              className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
            >
              <div className="text-sm font-extrabold text-white/85">{gameT('youthLoan.stay')}</div>
              <div className="mt-1 text-[11px] text-white/45">{gameT('youthLoan.stayHint')}</div>
            </button>
            <button
              type="button"
              onClick={() => onRespondYouthLoan(true)}
              className="rounded-2xl border border-sky-400/40 bg-sky-500/15 px-4 py-3 text-left transition hover:bg-sky-500/25"
            >
              <div className="text-sm font-extrabold text-sky-100">{gameT('youthLoan.request')}</div>
              <div className="mt-1 text-[11px] text-white/50">{gameT('youthLoan.requestHint')}</div>
            </button>
          </div>
        </div>
      )}

      {event?.type === 'offer' && (
        <div className="glass-card space-y-3 rounded-2xl p-4">
          <MarketHeader
            title={resolveGameText(gameT, event.title)}
            subtitle={resolveGameText(gameT, event.body) || gameT('offer.marketSubtitle')}
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
                {gameT('offer.negotiate')}
              </button>
            )}
            {!state.agentRerollUsed &&
              state.currentTeamId &&
              event.offers.some((offer) => offer.kind === 'transfer') && (
                <button
                  type="button"
                  className="rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-emerald-300 hover:bg-emerald-500/30"
                  onClick={onCallAgent}
                >
                  {gameT('offer.agent')}
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
            title={resolveGameText(gameT, event.title)}
            body={resolveGameText(gameT, event.body)}
            choices={event.choices.map((choice) => ({
              id: choice.id,
              label: resolveGameText(gameT, choice.label),
            }))}
            impact={event.impact}
            onPreview={onPreviewChoice}
            onCommit={onCommitChoice}
          />
        </div>
      )}

      {event?.type === 'season_result' && (
        <SeasonResultCard
          title={resolveGameText(gameT, event.title)}
          season={event.season}
          playerAge={state.player?.age ?? event.season.age}
          onContinue={onContinueSeason}
          objectiveLabel={resolveGameText(
            gameT,
            state.seasonObjective?.label ?? event.season.objectiveResult?.label,
          )}
          objectiveCompleted={state.seasonObjective?.completed ?? event.season.objectiveResult?.completed}
          objectiveFailed={state.seasonObjective?.failed ?? event.season.objectiveResult?.failed}
          stageLabelText={gameT(stageLabel(state.careerStage ?? 'local'))}
        />
      )}

      {event?.type === 'national_callup' && (
        <NationalCallupPanel
          event={event}
          onRespond={onRespondCallup}
        />
      )}

      {!event && !state.celebration && (
        <div className="glass-card space-y-3 rounded-2xl p-4">
          <button
            type="button"
            onClick={onContinueSeason}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black"
          >
            {gameT('season.simulate')}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {state.celebration?.kind === 'trophy' && state.celebration.trophies?.length ? (
        <TrophyCelebration
          message={resolveGameText(gameT, state.celebration.message)}
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

function NationalCallupPanel({
  event,
  onRespond,
}: {
  event: Extract<NonNullable<GameState['currentEvent']>, { type: 'national_callup' }>
  onRespond: (accept: boolean) => void
}) {
  const { locale, t } = useI18n()
  const gameT: GameTranslate = (key, params) => t('game', key, params)
  const country = getCountry(event.countryFifa)
  const countryName = countryDisplayName(locale, country) || event.countryFifa
  const body = gameT('national.callupBody', {
    country: countryName,
    apps: event.projected.appearances,
    goals: event.projected.goals,
    assists: event.projected.assists,
    cup:
      typeof event.body === 'object' && typeof event.body.params?.cup === 'string'
        ? event.body.params.cup
        : '',
  })

  return (
    <div className="glass-card space-y-3 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        {country && <img src={flagUrl(country.iso_alpha2)} alt="" className="h-6 w-9 rounded-sm" />}
        {country?.logo_url && <img src={country.logo_url} alt="" className="h-10 w-10 object-contain" />}
        <div>
          <h3 className="font-display text-lg font-extrabold">{resolveGameText(gameT, event.title)}</h3>
          <p className="text-sm text-white/55">{countryName}</p>
        </div>
      </div>
      <p className="text-sm text-white/65">{body}</p>
      {event.viaHeritage && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/90">
          {gameT('national.heritageNote')}
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
          onClick={() => onRespond(true)}
          className="rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3 text-left transition hover:bg-emerald-500/25"
        >
          <div className="text-sm font-extrabold text-emerald-200">{gameT('national.accept')}</div>
          <div className="mt-1 text-[11px] text-white/50">{gameT('national.acceptHint')}</div>
        </button>
        <button
          type="button"
          onClick={() => onRespond(false)}
          className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
        >
          <div className="text-sm font-extrabold text-white/80">{gameT('national.reject')}</div>
          <div className="mt-1 text-[11px] text-white/45">{gameT('national.rejectHint')}</div>
        </button>
      </div>
    </div>
  )
}

function TraitPickPanel({
  title,
  body,
  options,
  onConfirm,
}: {
  title: DisplayText
  body: DisplayText
  options: { id: TraitId; label: DisplayText; desc: DisplayText }[]
  onConfirm: (ids: TraitId[]) => void
}) {
  const { t } = useI18n()
  const gameT: GameTranslate = (key, params) => t('game', key, params)
  const [selected, setSelected] = useState<TraitId[]>([])

  const toggle = (id: TraitId) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id)
      if (prev.length >= 2) return [prev[1]!, id]
      return [...prev, id]
    })
  }

  return (
    <div className="glass-card space-y-4 rounded-2xl p-4">
      <div>
        <h3 className="font-display text-lg font-extrabold text-white">{resolveGameText(gameT, title)}</h3>
        <p className="mt-1 text-sm text-white/55">{resolveGameText(gameT, body)}</p>
        <p className="mt-1 text-[11px] text-white/40">{gameT('traits.pickHint')}</p>
      </div>
      <div className="grid gap-2">
        {options.map((option) => {
          const active = selected.includes(option.id)
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? 'border-white bg-white/10'
                  : 'border-white/10 bg-black/30 hover:border-white/25'
              }`}
            >
              <div className="text-sm font-extrabold text-white">{resolveGameText(gameT, option.label)}</div>
              <div className="mt-1 text-[12px] text-white/50">{resolveGameText(gameT, option.desc)}</div>
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
        {gameT('traits.confirm')}
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
  title: DisplayText
  body: DisplayText
  pendingOffers: ClubOffer[]
  onSubmit: (
    ask: Partial<Pick<ClubOffer, 'annualWage' | 'years' | 'releaseClause' | 'role' | 'signingBonus'>>,
  ) => void
  onBack: () => void
  onNegotiateOther: (id: string) => void
}) {
  const { locale, t } = useI18n()
  const gameT: GameTranslate = (key, params) => t('game', key, params)
  const team = getTeam(offer.teamId)
  const [wage, setWage] = useState(Math.round(offer.annualWage * 1.15))
  const [years, setYears] = useState(Math.min(5, offer.years + 1))
  const [role, setRole] = useState<PlayingRole>(pickRoleForAsk(offer.role))
  const [clause, setClause] = useState(Math.round(offer.releaseClause * 1.2))
  const [pressureId, setPressureId] = useState<string | null>(null)

  const otherOffers = pendingOffers.filter((candidate) => candidate.id !== offer.id)
  const pressure = pressureId ? otherOffers.find((candidate) => candidate.id === pressureId) : null

  const effectiveWage = useMemo(
    () => (pressure ? Math.max(wage, Math.round(pressure.annualWage * 1.05)) : wage),
    [pressure, wage],
  )

  const applyPreset = (kind: 'p10' | 'p20' | 'starter' | 'y1') => {
    if (kind === 'p10') setWage(Math.round(offer.annualWage * 1.1))
    if (kind === 'p20') setWage(Math.round(offer.annualWage * 1.2))
    if (kind === 'starter') setRole('starter')
    if (kind === 'y1') setYears(Math.min(5, offer.years + 1))
  }

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
          <h3 className="font-display text-lg font-extrabold uppercase tracking-wide">
            {resolveGameText(gameT, title)}
          </h3>
          <p className="text-sm text-white/55">{resolveGameText(gameT, body)}</p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-white/40">{gameT('negotiate.offered')}</div>
          <div className="text-sm text-white/70">{formatMoneyForLocale(locale, offer.annualWage)}{gameT('offer.year')}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-white/40">{gameT('negotiate.asking')}</div>
          <div className="money-neon font-display text-lg font-extrabold">
            {formatMoneyForLocale(locale, effectiveWage)}{gameT('offer.year')}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap gap-2">
        {(
          [
            ['p10', '+10%'],
            ['p20', '+20%'],
            ['starter', gameT('negotiate.presetStarter')],
            ['y1', gameT('negotiate.presetYear')],
          ] as const
        ).map(([kind, label]) => (
          <button
            key={kind}
            type="button"
            onClick={() => applyPreset(kind)}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white/80 hover:border-emerald-400/40 hover:text-emerald-300"
          >
            {label}
          </button>
        ))}
      </div>

      {otherOffers.length >= 1 && (
        <div className="relative z-10 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wide text-white/40">
            {gameT('negotiate.usePressure')}
          </div>
          <div className="flex flex-wrap gap-2">
            {otherOffers.map((candidate) => {
              const otherTeam = getTeam(candidate.teamId)
              const active = pressureId === candidate.id
              return (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => setPressureId(active ? null : candidate.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${
                    active
                      ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200'
                      : 'border-white/15 text-white/60 hover:border-white/30'
                  }`}
                >
                  {otherTeam?.logo_url && <img src={otherTeam.logo_url} alt="" className="h-4 w-4 object-contain" />}
                  {formatMoneyForLocale(locale, candidate.annualWage)}
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
              {gameT('negotiate.switchOffer')}
            </button>
          )}
        </div>
      )}

      <div className="relative z-10 grid gap-2 sm:grid-cols-2">
        <label className="text-xs text-white/50">
          {gameT('negotiate.wage')}
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={wage}
            onChange={(e) => setWage(Number(e.target.value) || wage)}
          />
        </label>
        <label className="text-xs text-white/50">
          {gameT('negotiate.years')}
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
          {gameT('negotiate.role')}
          <select
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={role}
            onChange={(e) => setRole(e.target.value as PlayingRole)}
          >
            {(['bench', 'rotation', 'starter', 'undisputed'] as const).map((candidateRole) => (
              <option key={candidateRole} value={candidateRole}>
                {gameT(roleLabel(candidateRole))}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-white/50">
          {gameT('negotiate.clause')}
          <div className="mt-1 flex items-center gap-2">
            <input
              type="number"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              value={clause}
              onChange={(e) => setClause(Number(e.target.value) || clause)}
            />
            <span className="whitespace-nowrap text-xs font-semibold text-white/70">
              {formatMoneyForLocale(locale, clause)}
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
          {gameT('negotiate.submit')}
        </button>
        <button
          type="button"
          className="rounded-full border border-white/25 px-4 py-2 text-sm"
          onClick={onBack}
        >
          {gameT('negotiate.back')}
        </button>
      </div>
    </div>
  )
}
