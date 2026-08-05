import { getCompetition } from '../../data/catalog'
import { roleLabel } from '../../engine/contract'
import {
  originChoicePreview,
  originClubChoices,
} from '../../engine/originStart'
import type { GameState } from '../../engine/types'
import { PlayerShell } from '../ui/PlayerShell'

export function OriginPhase({
  state,
  onConfirmClub,
  onBack,
}: {
  state: GameState
  onConfirmClub: (teamId: string) => void
  onBack: () => void
}) {
  const choices = originClubChoices(state)

  const left = (
    <div className="space-y-3">
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">
              Primera decisión profesional
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-white">Elegí entre tres caminos</h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/55">
              Las opciones dependen de tu nacionalidad y del potencial obtenido en el draft. Un club
              chico ofrece minutos; uno más fuerte ofrece exposición y títulos, pero también más banco.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-right">
            <div className="text-[9px] font-black uppercase tracking-wide text-white/35">Tu perfil</div>
            <div className="mt-1 text-sm font-black text-white">
              OVR {state.player?.overall ?? 0} · POT {state.player?.potential ?? 0}
            </div>
          </div>
        </div>

        {choices.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            No encontramos clubes disponibles para esta nacionalidad. Volvé y elegí otra selección.
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {choices.map((team, index) => {
              const preview = originChoicePreview(team)
              const competition = getCompetition(team.competition_id)
              const pathLabel =
                index === 0 ? 'Desarrollo' : index === 1 ? 'Equilibrio' : 'Ambición'
              return (
                <article
                  key={team.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-white/25 hover:bg-white/[0.06]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white p-2">
                      {team.logo_url ? (
                        <img src={team.logo_url} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-lg font-black text-black">{team.name.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-violet-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-violet-200">
                          {pathLabel}
                        </span>
                        <span className="text-[11px] text-white/40">
                          Reputación {team.international_reputation}/5
                        </span>
                      </div>
                      <h4 className="mt-2 truncate text-lg font-extrabold text-white">{team.name}</h4>
                      <p className="text-xs text-white/45">
                        {competition?.name ?? team.country_fifa_code} · Rol probable: {roleLabel(preview.role)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
                    <div className="rounded-xl border border-white/8 bg-white/[0.035] p-2.5">
                      <div className="text-white/35">Minutos</div>
                      <div className="mt-1 font-bold text-white/80">{preview.minutes}</div>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-white/[0.035] p-2.5">
                      <div className="text-white/35">Crecimiento</div>
                      <div className="mt-1 font-bold text-white/80">{preview.growth}</div>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-white/[0.035] p-2.5">
                      <div className="text-white/35">Títulos</div>
                      <div className="mt-1 font-bold text-white/80">{preview.trophies}</div>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-white/[0.035] p-2.5">
                      <div className="text-white/35">Riesgo</div>
                      <div className="mt-1 font-bold text-white/80">{preview.risk}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onConfirmClub(team.id)}
                    className="mt-4 w-full rounded-full bg-white py-2.5 text-sm font-extrabold text-black transition hover:bg-white/90 active:scale-[0.99]"
                  >
                    Firmar con {team.name}
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-white/50 underline hover:text-white/80"
      >
        Volver al resultado del draft
      </button>
    </div>
  )

  return <PlayerShell state={state} choosingClub leftExtra={left} />
}
