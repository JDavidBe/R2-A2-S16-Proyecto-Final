import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import Login          from './pages/Login'
import Catalogo       from './pages/Catalogo'
import GestionRecursos from './pages/GestionRecursos'
import AdminUsuarios  from './pages/AdminUsuarios'
import Reportes       from './pages/Reportes'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Todos los autenticados */}
          <Route path="/catalogo" element={
            <ProtectedRoute><Catalogo /></ProtectedRoute>
          } />

          {/* Admin + Docente + Directivo pueden gestionar recursos */}
          <Route path="/recursos" element={
            <ProtectedRoute roles={['ADMIN','DOCENTE','DIRECTIVO']}>
              <GestionRecursos />
            </ProtectedRoute>
          } />

          {/* Solo Admin gestiona usuarios */}
          <Route path="/admin/usuarios" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminUsuarios />
            </ProtectedRoute>
          } />

          {/* Admin + Directivo ven reportes */}
          <Route path="/reportes" element={
            <ProtectedRoute roles={['ADMIN','DIRECTIVO']}>
              <Reportes />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/catalogo" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
