import { getCompetition } from '../../data/catalog'
import { originChoicePreview, originClubChoices } from '../../engine/originStart'
import type { GameState } from '../../engine/types'
import { roleText, useI18n } from '../../i18n/config'
import { Button, StatusPanel } from '../ui/primitives'
import { PlayerShell } from '../ui/PlayerShell'

function previewGroup(rep: number, tier?: number) {
  if (rep >= 4) return 'elite'
  if (rep >= 3 || tier === 1) return 'strong'
  if (rep <= 1 || (tier ?? 1) >= 2) return 'small'
  return 'mid'
}

export function OriginPhase({ state, onConfirmClub, onBack }: { state: GameState; onConfirmClub: (teamId: string) => void; onBack: () => void }) {
  const { t } = useI18n()
  const choices = originClubChoices(state)
  const left = <div className="space-y-3"><div className="glass-card rounded-2xl p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-[10px] font-black uppercase tracking-[.16em] text-[var(--accent)]">{t('game.origin.eyebrow')}</p><h3 className="mt-2 font-display text-xl font-black uppercase">{t('game.origin.title')}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">{t('game.origin.body')}</p></div><div className="rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2 text-right"><div className="font-mono text-[9px] font-black uppercase tracking-wide text-[var(--muted)]">{t('game.origin.profile')}</div><div className="mt-1 font-display text-sm font-black">OVR {state.player?.overall ?? 0} · POT {state.player?.potential ?? 0}</div></div></div>
    {choices.length === 0 ? <div className="mt-5"><StatusPanel kind="empty" title={t('game.origin.empty')} /></div> : <div className="mt-5 grid gap-3">{choices.map((team, index) => { const preview = originChoicePreview(team); const competition = getCompetition(team.competition_id); const group = previewGroup(team.international_reputation, competition?.tier); const pathKey = index === 0 ? 'development' : index === 1 ? 'balance' : 'ambition'; return <article key={team.id} className="rounded-2xl border border-[var(--border)] bg-black/20 p-4 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"><div className="flex items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2">{team.logo_url ? <img src={team.logo_url} alt="" className="h-full w-full object-contain" /> : <span className="font-display text-lg font-black text-black">{team.name.slice(0,2)}</span>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wide text-[var(--accent)]">{t(`game.origin.path.${pathKey}`)}</span><span className="text-[11px] text-[var(--muted)]">{t('game.origin.reputation', { value: team.international_reputation })}</span></div><h4 className="mt-2 truncate font-display text-lg font-black uppercase">{team.name}</h4><p className="text-xs text-[var(--muted)]">{competition?.name ?? team.country_fifa_code} · {t('game.origin.role', { role: roleText(preview.role, t) })}</p></div></div><div className="mt-4 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">{(['minutes','growth','trophies','risk'] as const).map((field) => <div key={field} className="rounded-xl border border-[var(--border)] bg-black/15 p-2.5"><div className="text-[var(--muted)]">{t(`game.origin.${field}`)}</div><div className="mt-1 font-bold">{t(`game.origin.preview.${group}.${field}`)}</div></div>)}</div><div className="mt-4"><Button className="w-full" onClick={() => onConfirmClub(team.id)}>{t('game.origin.sign', { team: team.name })}</Button></div></article> })}</div>}
  </div><button type="button" onClick={onBack} className="text-sm text-[var(--muted)] underline hover:text-[var(--fg)]">{t('game.origin.back')}</button></div>
  return <PlayerShell state={state} choosingClub leftExtra={left} />
}
