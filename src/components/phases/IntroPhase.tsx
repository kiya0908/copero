import type { DraftMode } from '../../engine/types'
import { useI18n } from '../../i18n/config'
import { Button, Eyebrow, SurfaceCard } from '../ui/primitives'

export function IntroPhase({ draftMode, onDraftModeChange, onStart }: { draftMode: DraftMode; onDraftModeChange: (mode: DraftMode) => void; onStart: () => void }) {
  const { t } = useI18n()
  return (
    <main className="site-container py-8 sm:py-12">
      <div className="grid gap-6 lg:grid-cols-[1fr_.92fr] lg:items-center">
        <div className="py-4 sm:py-8">
          <Eyebrow>{t('game.intro.eyebrow')}</Eyebrow>
          <h1 className="mt-4 max-w-[11ch] font-display text-[clamp(2.8rem,8vw,5.8rem)] font-black uppercase leading-[.9] tracking-[-.05em]">{t('game.intro.title')}</h1>
          <p className="mt-6 max-w-[58ch] text-base leading-7 text-[var(--muted)]">{t('game.intro.body')}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {(['classic', 'purist'] as DraftMode[]).map((mode) => {
              const active = draftMode === mode
              return <button key={mode} type="button" onClick={() => onDraftModeChange(mode)} aria-pressed={active} className={`surface-card min-h-32 p-5 text-left transition duration-150 ${active ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : 'hover:-translate-y-0.5 hover:border-[color-mix(in_oklch,var(--accent)_28%,var(--border))]'}`}>
                <span className={`font-mono text-xs font-bold uppercase tracking-[.12em] ${active ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>{mode}</span>
                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{t(mode === 'classic' ? 'game.intro.classicDesc' : 'game.intro.puristDesc')}</p>
              </button>
            })}
          </div>
          <div className="mt-7"><Button onClick={onStart}>{t('game.intro.start')} <span aria-hidden>→</span></Button></div>
        </div>
        <SurfaceCard gold className="relative min-h-[360px] overflow-hidden p-6 sm:min-h-[460px] sm:p-8">
          <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(var(--pitch-line) 1px, transparent 1px), linear-gradient(90deg, var(--pitch-line) 1px, transparent 1px)', backgroundSize: '100% 25%, 25% 100%' }} />
          <div className="relative flex h-full min-h-[310px] flex-col justify-between sm:min-h-[400px]">
            <div className="flex items-start justify-between gap-4"><Eyebrow gold>Legend Draft</Eyebrow><span className="rounded-full border border-[var(--gold-border)] bg-[var(--gold-soft)] px-3 py-1 font-mono text-xs text-[var(--gold)]">8 ROUNDS</span></div>
            <div>
              <div className="font-display text-[clamp(4rem,13vw,8rem)] font-black leading-none text-[var(--fg)]">PAC</div>
              <div className="mt-2 grid grid-cols-4 gap-2 font-mono text-[10px] text-[var(--muted)] sm:text-xs">{['PAC','SHO','PAS','DRI','DEF','PHY','SKL','WF'].map((key) => <span key={key} className="rounded-lg border border-[var(--border)] bg-black/20 px-2 py-2 text-center">{key}</span>)}</div>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">Classic / Purist · 8 attributes · career simulation</p>
          </div>
        </SurfaceCard>
      </div>
    </main>
  )
}
