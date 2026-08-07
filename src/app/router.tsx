import { Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom'
import App from '../App'
import { NotFoundPage } from '../components/pages/NotFoundPage'
import { HomePage } from '../pages/HomePage'
import { DEFAULT_LOCALE, I18nProvider, isSupportedLocale } from '../i18n/config'

function LocaleLayout() {
  const { locale } = useParams()

  if (!isSupportedLocale(locale)) return <NotFoundPage />

  return (
    <I18nProvider locale={locale}>
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
        <Route path="game" element={<App />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
