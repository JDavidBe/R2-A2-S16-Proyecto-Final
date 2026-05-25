import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Error no controlado en la interfaz:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="fatal-error">
          <section className="fatal-error__card">
            <p className="eyebrow">Árbol de Saberes</p>
            <h1>La aplicación encontró un problema al cargar.</h1>
            <p>
              Ya no se muestra una pantalla en blanco. Recarga la página y, si el problema continúa,
              revisa la consola o el estado del backend.
            </p>
            <pre>{this.state.error?.message || 'Error desconocido'}</pre>
            <button onClick={() => window.location.reload()}>Recargar aplicación</button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
