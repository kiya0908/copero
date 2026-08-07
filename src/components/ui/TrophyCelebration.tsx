import type { TrophyWin } from '../../data/trophies'
import { useI18n } from '../../i18n/config'
import { Button } from './primitives'
import { TrophyIcon } from './TrophyIcon'

export function TrophyCelebration({ message, trophies, onDismiss }: { message: string; trophies: TrophyWin[]; onDismiss: () => void }) {
  const { t } = useI18n()
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={message}><div className="brand-result-card w-full max-w-md space-y-4 p-6"><div className="flex flex-wrap items-center justify-center gap-4">{trophies.map((tr) => <TrophyIcon key={tr.id + tr.name} src={tr.assetPath} name={tr.name} className="trophy-float h-20 w-20" />)}</div><p className="text-center font-display text-lg font-black uppercase">{message}</p><p className="text-center text-sm text-[var(--muted)]">{trophies.map((tr) => tr.name).join(' · ')}</p><div className="flex justify-center"><Button onClick={onDismiss}>{t('celebration.dismiss')}</Button></div></div></div>
}
