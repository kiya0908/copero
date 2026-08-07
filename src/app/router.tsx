import { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { AnalyticsRouteTracker } from '../components/analytics/AnalyticsRouteTracker'
import { NotFoundPage } from '../components/pages/NotFoundPage'
import { PageSeo, type SeoPage } from '../components/seo/PageSeo'
import { HomePage } from '../pages/HomePage'
import { GamePage } from '../pages/GamePage'
import { InfoPage, type InfoPageKind } from '../pages/InfoPage'
import { DEFAULT_LOCALE, I18nProvider, isSupportedLocale } from '../i18n/config'

const INFO_PAGES = ['about', 'contact', 'privacy', 'terms'] as const satisfies readonly InfoPageKind[]

function seoPageFromPath(pathname: string): SeoPage {
  const segment = pathname.split('/').filter(Boolean)[1]
  if (segment === 'game') return 'game'
  if (INFO_PAGES.includes(segment as InfoPageKind)) return segment as InfoPageKind
  return 'home'
}

function LocaleSeo() {
  const { pathname } = useLocation()
  return <PageSeo page={seoPageFromPath(pathname)} />
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
    <>
      <AnalyticsRouteTracker />
      <Routes>
        <Route path="/" element={<Navigate to={`/${DEFAULT_LOCALE}/`} replace />} />
        <Route path="/game" element={<Navigate to={`/${DEFAULT_LOCALE}/game`} replace />} />
        <Route path="/:locale" element={<LocaleLayout />}>
          <Route index element={<HomePage />} />
          <Route path="game" element={<GamePage />} />
          <Route path="about" element={<InfoPage page="about" />} />
          <Route path="contact" element={<InfoPage page="contact" />} />
          <Route path="privacy" element={<InfoPage page="privacy" />} />
          <Route path="terms" element={<InfoPage page="terms" />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
