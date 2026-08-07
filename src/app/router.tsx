import { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { NotFoundPage } from '../components/pages/NotFoundPage'
import { PageSeo } from '../components/seo/PageSeo'
import { HomePage } from '../pages/HomePage'
import { GamePage } from '../pages/GamePage'
import { DEFAULT_LOCALE, I18nProvider, isSupportedLocale } from '../i18n/config'

function LocaleSeo() {
  const { pathname } = useLocation()
  return <PageSeo page={pathname.endsWith('/game') ? 'game' : 'home'} />
}

function LocaleLayout() {
  const { locale } = useParams()

  if (!isSupportedLocale(locale)) return <NotFoundPage />

  return (
    <I18nProvider locale={locale}>
      <LocaleSeo />
      <Outlet />
    </I18nProvider>
  )
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${DEFAULT_LOCALE}/`} replace />} />
      <Route path="/game" element={<Navigate to={`/${DEFAULT_LOCALE}/game`} replace />} />
      <Route path="/:locale" element={<LocaleLayout />}>
        <Route index element={<HomePage />} />
        <Route path="game" element={<GamePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
