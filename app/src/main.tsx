import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { instalarEsmaecerRolagem } from './lib/esmaecer-rolagem'
import { instalarTituloAutomatico } from './lib/titulo-automatico'
import App from './App'

instalarEsmaecerRolagem()
instalarTituloAutomatico()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
