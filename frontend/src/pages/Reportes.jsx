import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { getResumen, getTopRecursos } from '../api/reportesApi'

export default function Reportes() {
  const [resumen, setResumen]     = useState(null)
  const [top, setTop]             = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([getResumen(), getTopRecursos()]).then(([r, t]) => {
      setResumen(r.data); setTop(t.data)
    }).finally(() => setLoading(false))
  }, [])

  const stats = resumen ? [
    { label:'Descargas totales', value: resumen.totalDescargas, color:'var(--purple)', bg:'var(--purple-light)' },
    { label:'Usuarios activos',  value: resumen.totalUsuariosActivos, color:'var(--teal)', bg:'var(--teal-light)' },
    { label:'Recursos disponibles', value: resumen.totalRecursos, color:'var(--amber)', bg:'var(--amber-light)' },
  ] : []

  const maxDesc = top.length > 0 ? Math.max(...top.map(t=>t.totalDescargas)) : 1

  return (
    <div style={{minHeight:'100vh',background:'var(--gray1)'}}>
      <Navbar />
      <div style={{maxWidth:'900px',margin:'0 auto',padding:'2rem 1rem'}}>
        <h2 style={{fontSize:'1.4rem',fontWeight:700,marginBottom:'1.5rem'}}>Panel de reportes</h2>

        {loading ? (
          <div style={{textAlign:'center',padding:'3rem',color:'var(--gray3)'}}>Cargando estadísticas...</div>
        ) : (
          <>
            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
              {stats.map(s=>(
                <div key={s.label} style={{background:'#fff',borderRadius:'12px',border:'1px solid var(--gray2)',padding:'1.25rem',boxShadow:'var(--shadow)'}}>
                  <div style={{fontSize:'2rem',fontWeight:700,color:s.color,marginBottom:'4px'}}>{s.value}</div>
                  <div style={{fontSize:'0.875rem',color:'var(--gray3)'}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Top recursos */}
            <div style={{background:'#fff',borderRadius:'12px',border:'1px solid var(--gray2)',padding:'1.5rem',boxShadow:'var(--shadow)'}}>
              <h3 style={{fontSize:'1rem',fontWeight:700,marginBottom:'1.25rem'}}>Top 5 recursos más descargados</h3>
              {top.length === 0 ? (
                <p style={{color:'var(--gray3)',fontSize:'0.875rem'}}>Aún no hay descargas registradas.</p>
              ) : (
                top.map((r, i) => (
                  <div key={r.id} style={{marginBottom:'14px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px',fontSize:'0.875rem'}}>
                      <span style={{fontWeight:500}}>{i+1}. {r.titulo}</span>
                      <span style={{color:'var(--purple)',fontWeight:600}}>{r.totalDescargas} descargas</span>
                    </div>
                    <div style={{height:'8px',background:'var(--gray1)',borderRadius:'4px',overflow:'hidden'}}>
                      <div style={{height:'8px',borderRadius:'4px',background:'var(--purple)',width:`${(r.totalDescargas/maxDesc)*100}%`,transition:'width .4s'}} />
                    </div>
                    {r.area && <span style={{fontSize:'0.75rem',color:'var(--gray3)'}}>{r.area}</span>}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
