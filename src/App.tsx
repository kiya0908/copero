import { useCallback, useRef, useState } from 'react'
import { CareerPhase } from './components/phases/CareerPhase'
import { DraftPhase } from './components/phases/DraftPhase'
import { DraftResultPhase } from './components/phases/DraftResultPhase'
import { IdentityPhase } from './components/phases/IdentityPhase'
import { IntroPhase } from './components/phases/IntroPhase'
import { OriginPhase } from './components/phases/OriginPhase'
import { SummaryPhase } from './components/phases/SummaryPhase'
import type { ChoiceSpinResult } from './components/ui/EventChoiceCards'
import {
  acceptRecommendedDraftAttribute,
  continueFromDraftResult,
  createDraftState,
  initializeDraft,
  rerollDraftLegend,
} from './engine/draft'
import {
  acceptOffer,
  afterSeasonContinue,
  beginCareer,
  callAgentRerollOffers,
  chooseTraits,
  commitCareerChoiceResult,
  confirmIdentity,
  confirmOriginClub,
  dismissCelebration,
  dismissObjectiveBriefing,
  goToSummary,
  openNegotiation,
  previewCareerChoice,
  rejectOffers,
  respondNationalCallup,
  respondYouthLoanChoice,
  rollOriginClub,
  submitNegotiation,
} from './engine/game'
import { clearState, createInitialState, loadLatestState } from './engine/state'
import type {
  DraftMode,
  GameState,
  Position,
  PreferredFoot,
  TraitId,
} from './engine/types'

export default function App() {
  const [state, setState] = useState<GameState>(() => loadLatestState() ?? createInitialState('long'))
  const pendingChoice = useRef<ReturnType<typeof previewCareerChoice> | null>(null)

  const update = useCallback((fn: (s: GameState) => GameState) => {
    setState((prev) => fn(prev))
  }, [])

  let content: React.ReactNode

  if (state.phase === 'intro') {
    content = (
      <IntroPhase
        draftMode={state.draftMode}
        onDraftModeChange={(draftMode: DraftMode) =>
          setState((s) => ({ ...s, draftMode, draft: createDraftState(draftMode), mode: 'long' }))
        }
        onStart={() => update(beginCareer)}
      />
    )
  } else if (state.phase === 'identity') {
    content = (
      <IdentityPhase
        onBack={() => setState((s) => ({ ...s, phase: 'intro' }))}
        onSubmit={(input: {
          lastName: string
          preferredNumber: number
          preferredFoot: PreferredFoot
          position: Position
          nationalityFifa: string
          heritageNationalityFifa: string | null
        }) => update((s) => initializeDraft(confirmIdentity(s, input)))}
      />
    )
  } else if (state.phase === 'draft' && state.player) {
    content = (
      <DraftPhase
        state={state}
        onEnsureLegend={() => update(initializeDraft)}
        onTake={() => update(acceptRecommendedDraftAttribute)}
        onSkip={() => update(rerollDraftLegend)}
        onBack={() =>
          setState((s) => ({
            ...s,
            phase: 'identity',
            player: null,
            draft: createDraftState(s.draftMode),
          }))
        }
      />
    )
  } else if (state.phase === 'draft_result' && state.player) {
    content = <DraftResultPhase state={state} onContinue={() => update(continueFromDraftResult)} />
  } else if (state.phase === 'origin' && state.player) {
    content = (
      <OriginPhase
        state={state}
        onBack={() => setState((s) => ({ ...s, phase: 'draft_result' }))}
        onConfirmClub={(teamId) => update((s) => confirmOriginClub(s, teamId))}
        onRoll={() => {
          const rolled = rollOriginClub(state)
          setState(rolled.state)
          return rolled.teamId
        }}
      />
    )
  } else if (state.phase === 'summary' || state.currentEvent?.type === 'retire') {
    const summaryState = state.phase === 'summary' ? state : { ...state, phase: 'summary' as const }
    content = (
      <SummaryPhase
        state={summaryState}
        onReplay={() => {
          clearState(state.seed)
          setState(createInitialState('long', state.draftMode))
        }}
      />
    )
  } else {
    content = (
      <CareerPhase
        state={state}
        onAcceptOffer={(id) => update((s) => acceptOffer(s, id))}
        onRejectOffers={() => update(rejectOffers)}
        onNegotiate={(id) => update((s) => openNegotiation(s, id))}
        onSubmitNegotiation={(ask) => update((s) => submitNegotiation(s, ask))}
        onPreviewChoice={(id): ChoiceSpinResult => {
          const preview = previewCareerChoice(state, id)
          pendingChoice.current = preview
          return {
            choiceId: preview.choiceId,
            winningIndex: preview.winningIndex,
            outcomes: preview.outcomes,
          }
        }}
        onCommitChoice={() => {
          const preview = pendingChoice.current
          pendingChoice.current = null
          if (!preview) return
          setState(commitCareerChoiceResult(preview.resolved))
        }}
        onContinueSeason={() => update(afterSeasonContinue)}
        onDismissCelebration={() => update(dismissCelebration)}
        onDismissObjective={() => update(dismissObjectiveBriefing)}
        onRetire={() => update(goToSummary)}
        onCallAgent={() => update(callAgentRerollOffers)}
        onRespondCallup={(accept) => update((s) => respondNationalCallup(s, accept))}
        onRespondYouthLoan={(request) => update((s) => respondYouthLoanChoice(s, request))}
        onChooseTraits={(ids: TraitId[]) => update((s) => chooseTraits(s, ids))}
        onBackFromNegotiation={() =>
          update((s) => {
            if (s.currentEvent?.type !== 'negotiation') return s
            return {
              ...s,
              currentEvent: {
                type: 'offer',
                title: s.currentEvent.title,
                body: s.currentEvent.body,
                offers: s.pendingOffers,
                canReject: true,
                canNegotiate: true,
              },
            }
          })
        }
      />
    )
  }

  return <div className="min-h-screen">{content}</div>
}
