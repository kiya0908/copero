import { useLocation, useNavigate } from 'react-router-dom'
import {
  LOCALE_META,
  SUPPORTED_LOCALES,
  localizePath,
  useI18n,
  type Locale,
} from '../../i18n/config'

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, t } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()

  const changeLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return
    navigate(`${localizePath(location.pathname, nextLocale)}${location.search}${location.hash}`)
  }

  return (
    <div
      className="language-switcher"
      role="group"
      aria-label={t('common', 'language.label')}
    >
      {SUPPORTED_LOCALES.map((option) => {
        const active = option === locale
        return (
          <button
            key={option}
            type="button"
            className="language-switcher__item"
            aria-current={active ? 'page' : undefined}
            aria-pressed={active}
            onClick={() => changeLocale(option)}
          >
            {compact ? LOCALE_META[option].short : LOCALE_META[option].label}
          </button>
        )
      })}
    </div>
  )
}
