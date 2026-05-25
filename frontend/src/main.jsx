import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './app/ErrorBoundary'
import './index.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('No se encontró el contenedor #root. Verifica frontend/index.html.')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
