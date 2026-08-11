import { Link } from 'react-router-dom'
import { localizePath, useI18n } from '../../i18n/config'
import { LanguageSwitcher } from './LanguageSwitcher'

export function SiteHeader({
  playHref,
  showLanguageSwitcher = true,
}: {
  playHref?: string
  showLanguageSwitcher?: boolean
} = {}) {
  const { locale, t } = useI18n()
  const home = localizePath('/', locale)

  return (
    <header className="site-header">
      <div className="site-container site-header__inner">
        <Link className="brand-lockup" to={home} aria-label={t('common', 'brand')}>
          <img className="brand-mark" src="/favicon.svg" alt="" width="42" height="42" aria-hidden="true" />
          <span>Copero</span>
        </Link>

        <nav className="site-nav" aria-label={t('common', 'nav.primary')}>
          <a href={`${home}#how-to-play`}>{t('common', 'nav.howToPlay')}</a>
          <a href={`${home}#mechanics`}>{t('common', 'nav.mechanics')}</a>
          <a href={`${home}#faq`}>{t('common', 'nav.faq')}</a>
        </nav>

        <div className="site-header__actions">
          {showLanguageSwitcher && <LanguageSwitcher compact />}
          <a className="button button--primary button--small" href={playHref ?? `${home}#play`}>
            {t('common', 'nav.play')}
          </a>
        </div>
      </div>
    </header>
  )
}
