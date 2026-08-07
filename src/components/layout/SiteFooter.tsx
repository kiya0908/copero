import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n/config'

const FOOTER_LINKS = ['about', 'contact', 'privacy', 'terms'] as const

export function SiteFooter() {
  const { locale, t } = useI18n()

  return (
    <footer className="site-footer">
      <div className="site-container site-footer__inner site-footer__inner--links">
        <div className="site-footer__copy">
          <p>© 2026 copero.top · {t('common', 'footer.independent')}</p>
          <p>{t('common', 'footer.disclaimer')}</p>
        </div>
        <nav className="site-footer__nav" aria-label={t('common', 'footer.navigation')}>
          {FOOTER_LINKS.map((page) => (
            <Link key={page} to={`/${locale}/${page}`}>
              {t('common', `footer.${page}`)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
