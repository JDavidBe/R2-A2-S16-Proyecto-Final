import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ correo:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(form.correo, form.password)
      navigate('/catalogo')
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas')
    } finally { setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#534AB7 0%,#3C3489 100%)'}}>
      <div style={{background:'#fff',borderRadius:'16px',padding:'2.5rem',width:'100%',maxWidth:'400px',boxShadow:'0 8px 32px rgba(0,0,0,.18)'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{width:'64px',height:'64px',background:'var(--purple-light)',borderRadius:'16px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem',fontSize:'2rem'}}>📚</div>
          <h1 style={{fontSize:'1.5rem',fontWeight:700,color:'var(--text)',marginBottom:'4px'}}>Árbol de Saberes</h1>
          <p style={{color:'var(--gray3)',fontSize:'0.875rem'}}>Biblioteca Digital Offline · Sardinas</p>
        </div>

        {error && (
          <div style={{background:'var(--coral-light)',color:'var(--coral)',padding:'10px 14px',borderRadius:'8px',marginBottom:'1rem',fontSize:'0.875rem'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block',fontSize:'0.875rem',fontWeight:500,marginBottom:'6px',color:'var(--text)'}}>Correo electrónico</label>
            <input type="email" required placeholder="usuario@sardinas.edu.co"
              value={form.correo} onChange={e=>setForm({...form,correo:e.target.value})}
              style={{width:'100%',padding:'10px 12px',border:'1.5px solid var(--gray2)',borderRadius:'8px',fontSize:'0.9rem',outline:'none',transition:'border .2s'}}
              onFocus={e=>e.target.style.borderColor='var(--purple)'}
              onBlur={e=>e.target.style.borderColor='var(--gray2)'}
            />
          </div>
          <div style={{marginBottom:'1.5rem'}}>
            <label style={{display:'block',fontSize:'0.875rem',fontWeight:500,marginBottom:'6px',color:'var(--text)'}}>Contraseña</label>
            <input type="password" required placeholder="••••••••"
              value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
              style={{width:'100%',padding:'10px 12px',border:'1.5px solid var(--gray2)',borderRadius:'8px',fontSize:'0.9rem',outline:'none',transition:'border .2s'}}
              onFocus={e=>e.target.style.borderColor='var(--purple)'}
              onBlur={e=>e.target.style.borderColor='var(--gray2)'}
            />
          </div>
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:'11px',background:'var(--purple)',color:'#fff',border:'none',borderRadius:'8px',fontWeight:600,fontSize:'0.95rem',cursor:loading?'not-allowed':'pointer',opacity: loading ? .7 : 1}}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div style={{marginTop:'1.5rem',padding:'12px',background:'var(--gray1)',borderRadius:'8px',fontSize:'0.8rem',color:'var(--gray3)'}}>
          <strong>Usuarios demo (password: admin1234)</strong><br/>
          admin@sardinas.edu.co · estudiante@sardinas.edu.co<br/>
          docente@sardinas.edu.co · director@sardinas.edu.co
        </div>
      </div>
    </div>
  )
}
