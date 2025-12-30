import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/theme.css'
import './app/global.css'
import './app/ui.css'
import { App } from './app/App'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
