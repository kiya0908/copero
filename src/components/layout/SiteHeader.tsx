import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n/config'
import { LanguageSwitcher } from './LanguageSwitcher'

export function SiteHeader() {
  const { locale, t } = useI18n()
  const home = `/${locale}/`

  return (
    <header className="site-header">
      <div className="site-container site-header__inner">
        <Link className="brand-lockup" to={home} aria-label={t('common', 'brand')}>
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M12 3l6 4v10l-6 4-6-4V7l6-4Z" />
              <path d="M9 10.5l3-2 3 2v3l-3 2-3-2v-3Z" />
            </svg>
          </span>
          <span>Copero</span>
        </Link>

        <nav className="site-nav" aria-label={t('common', 'nav.primary')}>
          <a href={`${home}#how-to-play`}>{t('common', 'nav.howToPlay')}</a>
          <a href={`${home}#mechanics`}>{t('common', 'nav.mechanics')}</a>
          <a href={`${home}#faq`}>{t('common', 'nav.faq')}</a>
        </nav>

        <div className="site-header__actions">
          <LanguageSwitcher compact />
          <a className="button button--primary button--small" href={`${home}#play`}>
            {t('common', 'nav.play')}
          </a>
        </div>
      </div>
    </header>
  )
}
