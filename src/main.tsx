import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

if (import.meta.env.PROD) {
  const w = window as Window & { va?: (...args: unknown[]) => void; vaq?: unknown[] }
  w.va = w.va || function vaQueue() { (w.vaq = w.vaq || []).push(arguments) }
  const script = document.createElement('script')
  script.defer = true
  script.src = '/_vercel/insights/script.js'
  document.head.appendChild(script)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
