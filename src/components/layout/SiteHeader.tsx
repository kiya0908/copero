import { useState } from 'react'
import { Link } from 'react-router-dom'
import { localizePath, useI18n, type Locale } from '../../i18n/config'
import { LanguageSwitcher } from './LanguageSwitcher'

const BUILD_CAREER_PATH = '/copero-build-your-own-football-career'
const BUILD_CAREER_LABEL: Record<Locale, string> = {
  es: 'Crea tu carrera',
  en: 'Build your career',
  'zh-cn': '创建你的足球生涯',
  de: 'Erstelle deine Karriere',
  it: 'Crea la tua carriera',
  'pt-br': 'Crie sua carreira',
  ko: '나만의 커리어 만들기',
}

export function SiteHeader({
  playHref,
  showLanguageSwitcher = true,
}: {
  playHref?: string
  showLanguageSwitcher?: boolean
} = {}) {
  const { locale, t } = useI18n()
  const home = localizePath('/', locale)
  const buildCareer = localizePath(BUILD_CAREER_PATH, locale)
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="site-container site-header__inner">
        <Link className="brand-lockup" to={home} aria-label={t('common', 'brand')}>
          <img className="brand-mark" src="/favicon.svg" alt="" width="42" height="42" aria-hidden="true" />
          <span>Copero</span>
        </Link>

        <nav
          className="site-nav"
          id="site-navigation"
          aria-label={t('common', 'nav.primary')}
          data-open={menuOpen}
        >
          <Link to={buildCareer} onClick={closeMenu}>{BUILD_CAREER_LABEL[locale]}</Link>
          <a href={`${home}#how-to-play`} onClick={closeMenu}>
            {t('common', 'nav.howToPlay')}
          </a>
          <a href={`${home}#mechanics`} onClick={closeMenu}>
            {t('common', 'nav.mechanics')}
          </a>
          <a href={`${home}#faq`} onClick={closeMenu}>
            {t('common', 'nav.faq')}
          </a>
          <a
            className="site-nav__mobile-play"
            href={playHref ?? `${home}#play`}
            onClick={closeMenu}
          >
            {t('common', 'nav.play')}
          </a>
        </nav>

        <div className="site-header__actions">
          {showLanguageSwitcher && <LanguageSwitcher compact />}
          <button
            className="site-nav-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            aria-label={t('common', 'nav.primary')}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" />
          </button>
          <a className="button button--primary button--small" href={playHref ?? `${home}#play`}>
            {t('common', 'nav.play')}
          </a>
        </div>
      </div>
    </header>
  )
}
