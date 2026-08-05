import type { TrophyWin } from '../../data/trophies'
import { t } from '../../i18n/es'
import { TrophyIcon } from './TrophyIcon'

/** Celebración de trofeo en modal fullscreen. */
export function TrophyCelebration({
  message,
  trophies,
  onDismiss,
}: {
  message: string
  trophies: TrophyWin[]
  onDismiss: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-[trophy-fade-in_0.25s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-label={message}
    >
      <div className="glass-card w-full max-w-md space-y-4 rounded-2xl border border-amber-400/40 bg-[#121212]/95 p-6 shadow-[0_0_40px_rgba(245,197,66,0.2)]">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {trophies.map((tr) => (
            <TrophyIcon
              key={tr.id + tr.name}
              src={tr.assetPath}
              name={tr.name}
              className="h-20 w-20 animate-[trophy-float_2s_ease-in-out_infinite]"
            />
          ))}
        </div>
        <p className="text-center font-display text-lg font-extrabold text-white">{message}</p>
        <p className="text-center text-sm text-white/60">{trophies.map((tr) => tr.name).join(' · ')}</p>
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full bg-white px-8 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            {t('celebration.dismiss')}
          </button>
        </div>
      </div>
    </div>
  )
}
