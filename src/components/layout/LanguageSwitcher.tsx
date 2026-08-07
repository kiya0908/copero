import { Link, useLocation } from 'react-router-dom'
import { localeMeta, SUPPORTED_LOCALES, type Locale } from '../../i18n/resources'
import { replaceLocaleInPath } from '../../i18n/config'

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const location = useLocation()
  return (
    <div className="language-switcher" aria-label="Language">
      {SUPPORTED_LOCALES.map((target) => (
        <Link
          key={target}
          to={{ pathname: replaceLocaleInPath(location.pathname, target), search: location.search, hash: location.hash }}
          aria-current={target === locale ? 'page' : undefined}
          className={`language-chip ${target === locale ? 'is-active' : ''}`}
        >
          {localeMeta[target].label}
        </Link>
      ))}
    </div>
  )
}
