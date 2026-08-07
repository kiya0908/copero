import { Link } from 'react-router-dom'
import { useI18n, localePath } from '../../i18n/config'
import { LanguageSwitcher } from './LanguageSwitcher'

export function AppHeader() {
  const { locale, t } = useI18n()
  return (
    <header className="app-header">
      <div className="site-container flex min-h-16 items-center justify-between gap-3 py-2">
        <Link to={localePath(locale)} className="brand-lockup" aria-label="Copero home">
          <span className="brand-mark" aria-hidden="true">C</span>
          <span className="font-display text-lg font-black uppercase tracking-[-0.035em] text-[var(--fg)]">Copero</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex" aria-label="Primary">
          <Link className="nav-link" to={localePath(locale)}>{t('nav.home')}</Link>
          <Link className="nav-link" to={`${localePath(locale)}#how-to-play`}>{t('nav.how')}</Link>
          <Link className="nav-link" to={`${localePath(locale)}#mechanics`}>{t('nav.mechanics')}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <Link className="header-play hidden sm:inline-flex" to={localePath(locale, 'game')}>{t('nav.play')}</Link>
        </div>
      </div>
    </header>
  )
}
