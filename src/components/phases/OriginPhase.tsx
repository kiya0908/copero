import { useMemo, useState } from 'react'
import {
  academyTeamsForCountry,
  competitionsForCountry,
  getCompetition,
  getTeam,
  teamsInCompetition,
} from '../../data/catalog'
import type { GameState, Team } from '../../engine/types'
import { ClubOfferCard, OfferGrid } from '../ui/ClubOfferCard'
import { DiceButton } from '../ui/DiceButton'
import { PlayerShell } from '../ui/PlayerShell'
import { shortClubName } from '../ui/positions'
import { t } from '../../i18n/es'

/** Ordena mezclando tiers (grandes y chicos intercalados). */
function mixOriginClubs(list: Team[]): Team[] {
  const byRep = new Map<number, Team[]>()
  for (const team of list) {
    const r = team.international_reputation ?? 1
    const bucket = byRep.get(r) ?? []
    bucket.push(team)
    byRep.set(r, bucket)
  }
  for (const bucket of byRep.values()) {
    bucket.sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }
  const reps = [...byRep.keys()].sort((a, b) => b - a)
  const out: Team[] = []
  let guard = 0
  const total = list.length
  while (out.length < total && guard < total * 2) {
    for (const r of reps) {
      const next = byRep.get(r)?.shift()
      if (next) out.push(next)
    }
    guard += 1
  }
  return out
}

export function OriginPhase({
  state,
  onConfirmClub,
  onRoll,
  onBack,
}: {
  state: GameState
  onConfirmClub: (teamId: string) => void
  onRoll: () => string | null
  onBack: () => void
}) {
  const player = state.player!
  const comps = useMemo(() => competitionsForCountry(player.nationalityFifa), [player.nationalityFifa])
  const [competitionId, setCompetitionId] = useState(() => comps[0]?.id ?? '')
  const [rolledId, setRolledId] = useState<string | null>(null)

  const clubs = useMemo(() => {
    const raw = competitionId
      ? teamsInCompetition(competitionId)
      : academyTeamsForCountry(player.nationalityFifa)
    return mixOriginClubs(raw)
  }, [competitionId, player.nationalityFifa])

  const handleDice = () => {
    const id = onRoll()
    if (!id) return
    setRolledId(id)
    const team = getTeam(id)
    if (team) setCompetitionId(team.competition_id)
  }

  const left = (
    <div className="space-y-3">
      <div className="glass-card rounded-2xl p-4">
        <h3 className="text-lg font-semibold text-white">Elegí tu origen</h3>
        <p className="mt-1 text-sm text-white/55">
          Categoría y club de arranque, o dejalo al azar. El OVR inicial cambia según el club.
        </p>
        <p className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] leading-relaxed text-white/60">
          {t('origin.tip')}
        </p>

        {comps.length > 0 && (
          <div className="mt-3 flex max-h-24 flex-wrap gap-2 overflow-y-auto">
            {comps.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCompetitionId(c.id)
                  setRolledId(null)
                }}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  competitionId === c.id ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {c.logo_url && <img src={c.logo_url} alt="" className="h-3.5 w-3.5 object-contain" />}
                {c.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <DiceButton onClick={handleDice} label="Dado" />
          {rolledId && (
            <span className="text-xs text-white/60">
              Salió <strong className="text-white">{shortClubName(getTeam(rolledId)?.name ?? '')}</strong>
              {getCompetition(getTeam(rolledId)?.competition_id ?? '') && (
                <> · {getCompetition(getTeam(rolledId)!.competition_id)?.name}</>
              )}
            </span>
          )}
        </div>

        {rolledId && (
          <button
            type="button"
            onClick={() => onConfirmClub(rolledId)}
            className="mt-3 w-full rounded-full bg-white py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-[0.99]"
          >
            Confirmar club sorteado
          </button>
        )}

        <div className="mt-3 max-h-[min(58vh,520px)] overflow-y-auto pr-1">
          <OfferGrid>
            {clubs.map((team) => (
              <ClubOfferCard
                key={team.id}
                selected={rolledId === team.id}
                origin={{
                  teamId: team.id,
                  onPick: () => onConfirmClub(team.id),
                }}
              />
            ))}
          </OfferGrid>
        </div>
      </div>
      <button type="button" onClick={onBack} className="text-sm text-white/50 underline hover:text-white/80">
        Volver
      </button>
    </div>
  )

  return <PlayerShell state={state} choosingClub leftExtra={left} />
}
