import { createContext, useContext, useState } from 'react'
import { loginApi } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem('usuario')) } catch { return null }
  })

  const login = async (correo, password) => {
    const { data } = await loginApi({ correo, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    setUsuario(data.usuario)
    return data.usuario
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  // Helpers de rol
  const esAdmin      = usuario?.rol === 'ADMIN'
  const esDocente    = usuario?.rol === 'DOCENTE'
  const esDirectivo  = usuario?.rol === 'DIRECTIVO'
  const puedeSubir   = ['ADMIN','DOCENTE','DIRECTIVO'].includes(usuario?.rol)
  const puedeAdmin   = usuario?.rol === 'ADMIN'
  const puedeReporte = ['ADMIN','DIRECTIVO'].includes(usuario?.rol)

  return (
    <AuthContext.Provider value={{ usuario, login, logout, esAdmin, esDocente, esDirectivo, puedeSubir, puedeAdmin, puedeReporte }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
