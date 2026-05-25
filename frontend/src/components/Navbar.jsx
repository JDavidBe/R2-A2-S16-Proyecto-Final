import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { usuario, logout, puedeSubir, puedeAdmin, puedeReporte } = useAuth()
  const navigate  = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => { logout(); navigate('/login') }

  const active = (path) => pathname === path

  const linkStyle = (path) => ({
    color: active(path) ? '#fff' : 'rgba(255,255,255,.75)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: active(path) ? 600 : 400,
    background: active(path) ? 'rgba(255,255,255,.18)' : 'transparent',
    transition: 'background .15s, color .15s',
    display: 'flex', alignItems: 'center', gap: '5px'
  })

  const ROL_LABEL = { ADMIN:'Admin', DOCENTE:'Docente', ESTUDIANTE:'Estudiante', DIRECTIVO:'Directivo' }
  const ROL_COLOR = { ADMIN:'#A09AE8', DOCENTE:'#7ECDB8', ESTUDIANTE:'#7DB8E8', DIRECTIVO:'#E8C87D' }

  return (
    <nav style={{
      background:'var(--purple)', padding:'0 1.5rem',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      height:'58px', boxShadow:'0 2px 12px rgba(83,74,183,.4)',
      position:'sticky', top:0, zIndex:100
    }}>
      {/* Logo */}
      <Link to="/catalogo" style={{ color:'#fff', fontWeight:700, fontSize:'1.05rem',
        display:'flex', alignItems:'center', gap:'8px', letterSpacing:'-0.02em' }}>
        🌳 Árbol de Saberes
      </Link>

      {/* Links */}
      <div style={{ display:'flex', alignItems:'center', gap:'2px' }}>
        <Link to="/catalogo" style={linkStyle('/catalogo')}>📚 Catálogo</Link>

        {puedeSubir && (
          <Link to="/recursos" style={linkStyle('/recursos')}>📁 Mis Recursos</Link>
        )}
        {puedeAdmin && (
          <Link to="/admin/usuarios" style={linkStyle('/admin/usuarios')}>👥 Usuarios</Link>
        )}
        {puedeReporte && (
          <Link to="/reportes" style={linkStyle('/reportes')}>📊 Reportes</Link>
        )}
      </div>

      {/* User */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <span style={{ color:'rgba(255,255,255,.8)', fontSize:'0.875rem',
          maxWidth:'150px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {usuario?.nombre}
        </span>
        <span style={{
          fontSize:'0.72rem', padding:'2px 9px', borderRadius:'20px', fontWeight:600,
          background: ROL_COLOR[usuario?.rol] || 'rgba(255,255,255,.2)',
          color: '#1A1916'
        }}>
          {ROL_LABEL[usuario?.rol] || usuario?.rol}
        </span>
        <button onClick={handleLogout} style={{
          background:'rgba(255,255,255,.12)', color:'#fff', border:'1px solid rgba(255,255,255,.2)',
          padding:'5px 12px', borderRadius:'6px', fontSize:'0.8rem', fontWeight:500
        }}>
          Salir
        </button>
      </div>
    </nav>
  )
}
