import { getTeam } from '../../data/catalog'
import type { SeasonRecord } from '../../engine/types'
import { formatMoney, objectiveText, roleText, useI18n } from '../../i18n/config'
import { Button } from './primitives'
import { OvrBadge } from './OvrBadge'
import { StatIcons } from './StatIcons'
import { TrophyIcon } from './TrophyIcon'

function seasonForm(season: SeasonRecord): 'bad' | 'regular' | 'good' | 'excellent' {
  const apps = Math.max(1, season.stats.appearances)
  const contrib = (season.stats.goals + season.stats.assists) / apps
  if (season.injured || season.suspended || (season.role === 'bench' && apps < 15)) return 'bad'
  if (contrib >= .45 || (season.role === 'undisputed' && apps >= 28)) return 'excellent'
  if (contrib >= .22 || season.role === 'starter') return 'good'
  if (contrib >= .1) return 'regular'
  return 'bad'
}

export function SeasonResultCard({ title, season, playerAge, onContinue, objectiveLabel, objectiveCompleted, objectiveFailed, stageLabelText }: { title: string; season: SeasonRecord; playerAge: number; onContinue: () => void; objectiveLabel?: string; objectiveCompleted?: boolean; objectiveFailed?: boolean; stageLabelText?: string }) {
  const { locale, t } = useI18n()
  const team = getTeam(season.teamId)
  const parentTeam = season.loan ? getTeam(season.loanParentTeamId ?? '') : undefined
  const form = seasonForm(season)
  const storedObjective = objectiveLabel ? t(objectiveLabel, { target: season.objectiveResult?.label ?? '' }) : ''
  return <div className="glass-card space-y-4 rounded-2xl p-4">
    <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3">{parentTeam ? <><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white p-1.5">{parentTeam.logo_url ? <img src={parentTeam.logo_url} alt="" className="h-full w-full object-contain" /> : '?'}</span><span className="text-[var(--muted)]">→</span></> : null}{team?.logo_url ? <img src={team.logo_url} alt="" className="h-14 w-14 object-contain" /> : <div className="grid h-14 w-14 place-items-center rounded-full bg-white/10">?</div>}<div className="min-w-0"><h3 className="font-display text-lg font-black uppercase">{title}</h3><p className="truncate text-sm text-[var(--muted)]">{team?.name ?? season.teamId}</p>{season.loan ? <p className="mt-0.5 text-[11px] text-[var(--accent)]">{parentTeam ? t('career.season.loanedBy', { team: parentTeam.name }) : t('career.season.onLoan')}</p> : null}{stageLabelText ? <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">{stageLabelText}</p> : null}</div></div><OvrBadge overall={season.overall} size="md" /></div>
    {objectiveLabel ? <div className={`rounded-xl border px-3 py-2 text-sm ${objectiveCompleted ? 'border-[color-mix(in_oklch,var(--accent)_35%,var(--border))] bg-[var(--accent-soft)]' : objectiveFailed ? 'border-rose-400/35 bg-rose-500/10' : 'border-[var(--border)] bg-black/15'}`}><span className="font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">{t('objective.label')} · </span>{objectiveCompleted ? '✓ ' : objectiveFailed ? '✗ ' : ''}{storedObjective}</div> : null}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><StatBox label={t('hud.age')} value={String(playerAge)} /><StatBox label={t('hud.value')} value={formatMoney(season.marketValue, locale)} accent /><StatBox label={t('offer.wage')} value={formatMoney(season.wage, locale)} /><StatBox label={t('career.season.form')} value={t(`career.season.form.${form}`)} /></div>
    <div className="flex flex-wrap gap-2"><Tag>{roleText(season.role, t)}</Tag>{season.loan ? <Tag>{t('career.loan')}</Tag> : null}{season.injured ? <Tag>{t('career.injury')}</Tag> : null}{season.suspended ? <Tag>{t('career.suspended')}</Tag> : null}{season.struggle === 'promoted' ? <Tag>{t('career.promotion')}</Tag> : null}{season.struggle === 'relegated' ? <Tag>{t('career.relegation')}</Tag> : null}{season.struggle === 'relegation_battle' ? <Tag>{t('career.season.relegationBattle')}</Tag> : null}</div>
    <StatIcons appearances={season.stats.appearances} goals={season.stats.goals} assists={season.stats.assists} />
    {season.trophies.length ? <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">{season.trophies.map((tr,i) => <TrophyIcon key={`${tr.id}-${i}`} src={tr.assetPath} name={tr.name} className="h-12 w-12" />)}</div> : null}
    <Button onClick={onContinue}>{t('season.continue')}</Button>
  </div>
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) { return <div className="rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2"><div className="font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">{label}</div><div className={`mt-1 font-display text-lg font-black tabular-nums ${accent ? 'money-neon' : ''}`}>{value}</div></div> }
function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)]">{children}</span> }
