import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { getUsuarios, toggleUsuario, registrarUsuario } from '../api/usuariosApi'

const ROLES = ['ESTUDIANTE','DOCENTE','ADMIN','DIRECTIVO']
const COL_ROL = { ADMIN:'#EEEDFE', DOCENTE:'#E1F5EE', ESTUDIANTE:'#E6F1FB', DIRECTIVO:'#FAEEDA' }
const TXT_ROL = { ADMIN:'#3C3489', DOCENTE:'#085041', ESTUDIANTE:'#0C447C', DIRECTIVO:'#633806' }

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState({ nombre:'', correo:'', password:'', rol:'ESTUDIANTE' })
  const [error, setError]       = useState('')
  const [ok, setOk]             = useState('')
  const [loading, setLoading]   = useState(false)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    const { data } = await getUsuarios()
    setUsuarios(data)
  }

  const handleRegistrar = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await registrarUsuario(form)
      setOk('Usuario registrado correctamente'); setModal(false)
      setForm({ nombre:'', correo:'', password:'', rol:'ESTUDIANTE' })
      cargar(); setTimeout(()=>setOk(''), 3000)
    } catch(err) { setError(err.response?.data?.message || 'Error al registrar usuario') }
    finally { setLoading(false) }
  }

  const handleToggle = async (id) => {
    await toggleUsuario(id); cargar()
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--gray1)'}}>
      <Navbar />
      <div style={{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
          <h2 style={{fontSize:'1.4rem',fontWeight:700}}>Gestión de usuarios</h2>
          <button onClick={()=>{setModal(true);setError('')}}
            style={{padding:'9px 18px',background:'var(--purple)',color:'#fff',border:'none',borderRadius:'8px',fontWeight:600,fontSize:'0.875rem'}}>
            + Nuevo usuario
          </button>
        </div>

        {ok && <div style={{background:'var(--teal-light)',color:'var(--teal)',padding:'10px 14px',borderRadius:'8px',marginBottom:'1rem',fontSize:'0.875rem'}}>{ok}</div>}

        <div style={{background:'#fff',borderRadius:'12px',border:'1px solid var(--gray2)',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.875rem'}}>
            <thead>
              <tr style={{background:'var(--gray1)'}}>
                {['Nombre','Correo','Rol','Estado','Acción'].map(h=>(
                  <th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:600,color:'var(--gray3)',borderBottom:'1px solid var(--gray2)'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u,i)=>(
                <tr key={u.id} style={{borderBottom:'1px solid var(--gray2)',background:i%2===0?'#fff':'var(--gray1)'}}>
                  <td style={{padding:'10px 14px',fontWeight:500}}>{u.nombre}</td>
                  <td style={{padding:'10px 14px',color:'var(--gray3)'}}>{u.correo}</td>
                  <td style={{padding:'10px 14px'}}>
                    <span style={{fontSize:'0.75rem',padding:'3px 9px',borderRadius:'20px',fontWeight:500,background:COL_ROL[u.rol]||'var(--gray1)',color:TXT_ROL[u.rol]||'var(--gray3)'}}>{u.rol}</span>
                  </td>
                  <td style={{padding:'10px 14px'}}>
                    <span style={{fontSize:'0.75rem',padding:'3px 9px',borderRadius:'20px',fontWeight:500,background:u.activo?'var(--teal-light)':'var(--coral-light)',color:u.activo?'var(--teal)':'var(--coral)'}}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{padding:'10px 14px'}}>
                    <button onClick={()=>handleToggle(u.id)}
                      style={{padding:'5px 10px',border:'1px solid var(--gray2)',borderRadius:'6px',background:'#fff',fontSize:'0.8rem',cursor:'pointer'}}>
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {modal && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
            <div style={{background:'#fff',borderRadius:'16px',padding:'2rem',width:'100%',maxWidth:'440px'}}>
              <h3 style={{marginBottom:'1.5rem',fontWeight:700}}>Nuevo usuario</h3>
              {error && <div style={{background:'var(--coral-light)',color:'var(--coral)',padding:'10px',borderRadius:'8px',marginBottom:'1rem',fontSize:'0.875rem'}}>{error}</div>}
              <form onSubmit={handleRegistrar}>
                {[['Nombre completo','nombre','text'],['Correo electrónico','correo','email'],['Contraseña','password','password']].map(([lbl,key,type])=>(
                  <div key={key} style={{marginBottom:'1rem'}}>
                    <label style={{display:'block',fontSize:'0.875rem',fontWeight:500,marginBottom:'5px'}}>{lbl} *</label>
                    <input type={type} required value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
                      style={{width:'100%',padding:'9px 12px',border:'1.5px solid var(--gray2)',borderRadius:'8px',fontSize:'0.875rem'}} />
                  </div>
                ))}
                <div style={{marginBottom:'1.5rem'}}>
                  <label style={{display:'block',fontSize:'0.875rem',fontWeight:500,marginBottom:'5px'}}>Rol *</label>
                  <select value={form.rol} onChange={e=>setForm({...form,rol:e.target.value})}
                    style={{width:'100%',padding:'9px 12px',border:'1.5px solid var(--gray2)',borderRadius:'8px',fontSize:'0.875rem',background:'#fff'}}>
                    {ROLES.map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
                <div style={{display:'flex',gap:'10px'}}>
                  <button type="button" onClick={()=>setModal(false)}
                    style={{flex:1,padding:'10px',border:'1.5px solid var(--gray2)',borderRadius:'8px',background:'#fff',fontWeight:500,fontSize:'0.875rem'}}>Cancelar</button>
                  <button type="submit" disabled={loading}
                    style={{flex:1,padding:'10px',background:'var(--purple)',color:'#fff',border:'none',borderRadius:'8px',fontWeight:600,fontSize:'0.875rem'}}>
                    {loading?'Guardando...':'Registrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
