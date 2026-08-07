import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './app/router.tsx'
import { initAnalytics } from './lib/analytics.ts'
import './index.css'
import './styles/tokens.css'
import './styles/marketing.css'
import './styles/game-shell.css'

initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </StrictMode>,
)
