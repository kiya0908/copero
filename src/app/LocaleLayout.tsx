import { Navigate, Outlet, useParams } from 'react-router-dom'
import { I18nProvider, isLocale } from '../i18n/config'
import { AppHeader } from '../components/layout/AppHeader'

export function LocaleLayout() {
  const { locale } = useParams()
  if (!isLocale(locale)) return <Navigate to="/es/" replace />
  return (
    <I18nProvider locale={locale}>
      <div className="min-h-screen">
        <AppHeader />
        <Outlet />
      </div>
    </I18nProvider>
  )
}
