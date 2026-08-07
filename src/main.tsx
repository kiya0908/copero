import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import App from './App.tsx'
import { LocaleLayout } from './app/LocaleLayout.tsx'
import { NotFoundPage } from './components/pages/NotFoundPage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { initAnalytics } from './lib/analytics.ts'
import './index.css'

initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/es/" replace />} />
        <Route path="/:locale" element={<LocaleLayout />}>
          <Route index element={<HomePage />} />
          <Route path="game" element={<App />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/es/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
