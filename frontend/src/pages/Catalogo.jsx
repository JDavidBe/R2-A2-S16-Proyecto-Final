import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { getRecursos, descargarRecurso } from '../api/recursosApi'
import { getValoracion, getResumen, valorarRecurso, getComentarios } from '../api/valoracionesApi'

const AREAS  = ['Todas','Matemáticas','Ciencias','Historia','Español','Inglés','Tecnología','Arte','Educación Física']
const GRADOS = ['Todos','Grado 1','Grado 2','Grado 3','Grado 4','Grado 5',
                'Grado 6','Grado 7','Grado 8','Grado 9','Grado 10','Grado 11']
const COLORES = {
  'Matemáticas':'#EEEDFE','Ciencias':'#E1F5EE','Historia':'#FAEEDA',
  'Español':'#FAECE7','Inglés':'#E6F1FB','Tecnología':'#EAF3DE',
  'Arte':'#FDE8F5','Educación Física':'#E8F4FD'
}
const TEXTOS = {
  'Matemáticas':'#3C3489','Ciencias':'#085041','Historia':'#633806',
  'Español':'#712B13','Inglés':'#0C447C','Tecnología':'#27500A',
  'Arte':'#6B134B','Educación Física':'#0C4A6E'
}
const EMOJIS = {
  'Matemáticas':'🔢','Ciencias':'🔬','Historia':'📜','Español':'📖',
  'Inglés':'🌐','Tecnología':'💻','Arte':'🎨','Educación Física':'⚽'
}

function Estrellas({ valor, onChange, size = '1.2rem', readonly = false }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display:'flex', gap:'2px' }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          style={{
            fontSize: size, cursor: readonly ? 'default' : 'pointer',
            color: n <= (hover || valor) ? '#F59E0B' : '#D4D3CF',
            transition:'color .1s'
          }}
          onClick={() => !readonly && onChange && onChange(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
        >★</span>
      ))}
    </div>
  )
}

function PanelValoracion({ recurso, onClose }) {
  const { usuario } = useAuth()
  const { show, ToastEl } = useToast()
  const [resumen,    setResumen]    = useState(null)
  const [miVal,      setMiVal]      = useState(null)
  const [comentarios,setComentarios]= useState([])
  const [puntuacion, setPuntuacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [saving,     setSaving]     = useState(false)
  const [tab,        setTab]        = useState('valorar') // 'valorar' | 'comentarios'

  useEffect(() => {
    Promise.all([
      getResumen(recurso.id).catch(()=>null),
      getValoracion(recurso.id).catch(()=>null),
      getComentarios(recurso.id).catch(()=>null)
    ]).then(([r,v,c]) => {
      if (r) setResumen(r.data)
      if (v?.data) { setMiVal(v.data); setPuntuacion(v.data.puntuacion); setComentario(v.data.comentario||'') }
      if (c) setComentarios(c.data || [])
    })
  }, [recurso.id])

  const handleValorar = async () => {
    if (!puntuacion) return show('Selecciona una puntuación','err')
    setSaving(true)
    try {
      await valorarRecurso(recurso.id, puntuacion, comentario)
      show('¡Valoración guardada! ⭐')
      const [r, c] = await Promise.all([getResumen(recurso.id), getComentarios(recurso.id)])
      setResumen(r.data); setComentarios(c.data || []); setMiVal({ puntuacion, comentario })
    } catch(e) { show('Error al guardar valoración','err') }
    finally { setSaving(false) }
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CO',{day:'2-digit',month:'short'}) : ''

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:1500, padding:'1rem' }}>
      {ToastEl}
      <div style={{ background:'#fff', borderRadius:'16px', padding:'1.75rem',
        width:'100%', maxWidth:'460px', maxHeight:'90vh', overflowY:'auto',
        boxShadow:'0 16px 48px rgba(0,0,0,.22)' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.25rem' }}>
          <div>
            <h3 style={{ fontWeight:700, fontSize:'1rem', marginBottom:'4px' }}>{recurso.titulo}</h3>
            {resumen && (
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <Estrellas valor={Math.round(resumen.promedio)} readonly size="0.95rem" />
                <span style={{ fontSize:'0.8rem', color:'var(--gray3)' }}>
                  {resumen.promedio?.toFixed(1)} ({resumen.total} valoracion{resumen.total!==1?'es':''})
                </span>
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none',
            fontSize:'1.2rem', color:'var(--gray3)', padding:'2px' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'2px solid var(--gray2)', marginBottom:'1.25rem' }}>
          {[['valorar','⭐ Valorar'],['comentarios',`💬 Comentarios (${comentarios.length})`]].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'8px 16px', background:'none', border:'none',
              borderBottom: tab===t ? '2px solid var(--purple)' : '2px solid transparent',
              color: tab===t ? 'var(--purple)' : 'var(--gray3)',
              fontWeight: tab===t ? 600 : 400, fontSize:'0.875rem', marginBottom:'-2px'
            }}>{l}</button>
          ))}
        </div>

        {tab === 'valorar' && (
          <div>
            {miVal && (
              <div style={{ background:'var(--purple-light)', borderRadius:'8px',
                padding:'10px 14px', marginBottom:'1rem', fontSize:'0.8rem', color:'var(--purple-dark)' }}>
                Ya has valorado este recurso. Puedes actualizar tu valoración.
              </div>
            )}
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ display:'block', fontSize:'0.875rem', fontWeight:500, marginBottom:'8px' }}>
                Tu puntuación *
              </label>
              <Estrellas valor={puntuacion} onChange={setPuntuacion} size="1.8rem" />
              {puntuacion > 0 && (
                <span style={{ fontSize:'0.8rem', color:'var(--gray3)', marginTop:'4px', display:'block' }}>
                  {['','Muy malo','Malo','Regular','Bueno','Excelente'][puntuacion]}
                </span>
              )}
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ display:'block', fontSize:'0.875rem', fontWeight:500, marginBottom:'6px' }}>
                Comentario (opcional)
              </label>
              <textarea rows={3} value={comentario} onChange={e=>setComentario(e.target.value)}
                placeholder="¿Qué te pareció este recurso?"
                style={{ width:'100%', padding:'9px 12px', border:'1.5px solid var(--gray2)',
                  borderRadius:'8px', fontSize:'0.875rem', resize:'vertical',
                  outline:'none', fontFamily:'inherit' }}
              />
            </div>
            <button onClick={handleValorar} disabled={saving || !puntuacion} style={{
              width:'100%', padding:'10px', background:'var(--purple)',
              color:'#fff', border:'none', borderRadius:'8px', fontWeight:600, fontSize:'0.875rem'
            }}>
              {saving ? '⏳ Guardando...' : (miVal ? '🔄 Actualizar valoración' : '⭐ Enviar valoración')}
            </button>
          </div>
        )}

        {tab === 'comentarios' && (
          <div>
            {comentarios.length === 0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:'var(--gray3)' }}>
                <div style={{ fontSize:'2rem', marginBottom:'8px' }}>💬</div>
                <p>No hay comentarios aún. ¡Sé el primero!</p>
              </div>
            ) : (
              comentarios.map((c,i) => (
                <div key={i} style={{ borderBottom: i<comentarios.length-1 ? '1px solid var(--gray2)' : 'none',
                  paddingBottom:'12px', marginBottom:'12px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <div style={{ width:'28px', height:'28px', borderRadius:'50%',
                        background:'var(--purple-light)', color:'var(--purple)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'0.75rem', fontWeight:700 }}>
                        {c.nombreUsuario?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontSize:'0.875rem', fontWeight:500 }}>{c.nombreUsuario}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <Estrellas valor={c.puntuacion} readonly size="0.85rem" />
                      <span style={{ fontSize:'0.75rem', color:'var(--gray3)' }}>{fmtDate(c.fechaCreacion)}</span>
                    </div>
                  </div>
                  {c.comentario && (
                    <p style={{ fontSize:'0.8rem', color:'var(--gray3)', paddingLeft:'36px' }}>{c.comentario}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Catalogo() {
  const { show, ToastEl } = useToast()
  const [recursos,    setRecursos]    = useState([])
  const [area,        setArea]        = useState('')
  const [grado,       setGrado]       = useState('')
  const [q,           setQ]           = useState('')
  const [loading,     setLoading]     = useState(true)
  const [descargando, setDescargando] = useState(null)
  const [visor,       setVisor]       = useState(null)
  const [cargandoPDF, setCargandoPDF] = useState(false)
  const [panelVal,    setPanelVal]    = useState(null) // recurso a valorar
  const [resumenes,   setResumenes]   = useState({})   // id -> resumen

  useEffect(() => { cargar() }, [area, grado])

  const cargar = async () => {
    setLoading(true)
    try {
      const params = {}
      if (area && area !== 'Todas') params.area = area
      if (grado && grado !== 'Todos') params.grado = grado
      if (q.trim()) params.q = q.trim()
      const { data } = await getRecursos(params)
      setRecursos(data)
      // Cargar resúmenes de valoraciones en paralelo
      const ids = data.map(r => r.id)
      ids.forEach(id => {
        getResumen(id).then(res => {
          setResumenes(prev => ({ ...prev, [id]: res.data }))
        }).catch(() => {})
      })
    } catch(e) { show('Error al cargar recursos','err') }
    finally { setLoading(false) }
  }

  const handleSearch = (e) => { e.preventDefault(); cargar() }

  const handleVerPDF = async (r) => {
    setCargandoPDF(true)
    try {
      const { data } = await descargarRecurso(r.id)
      const blob = new Blob([data], { type:'application/pdf' })
      setVisor({ url: URL.createObjectURL(blob), titulo: r.titulo, id: r.id, recurso: r })
    } catch(e) { show('Error al cargar el PDF','err') }
    finally { setCargandoPDF(false) }
  }

  const handleDescargar = async (r) => {
    setDescargando(r.id)
    try {
      const { data } = await descargarRecurso(r.id)
      const url = URL.createObjectURL(new Blob([data], { type:'application/pdf' }))
      const a = document.createElement('a')
      a.href = url; a.download = r.nombreArchivo || `${r.titulo}.pdf`
      a.click(); URL.revokeObjectURL(url)
      show('Descarga iniciada ✅')
    } catch(e) { show('Error al descargar','err') }
    finally { setDescargando(null) }
  }

  const cerrarVisor = () => {
    if (visor?.url) URL.revokeObjectURL(visor.url)
    setVisor(null)
  }

  const fmtSize = (b) => !b ? '' : b>1048576 ? `${(b/1048576).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`

  return (
    <div style={{ minHeight:'100vh', background:'#F5F4F3' }}>
      <Navbar />
      {ToastEl}

      {/* Valoración panel */}
      {panelVal && <PanelValoracion recurso={panelVal} onClose={() => setPanelVal(null)} />}

      {/* Cargando PDF */}
      {cargandoPDF && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)',
          zIndex:1999, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'2rem',
            textAlign:'center', boxShadow:'var(--shadow-lg)' }}>
            <div style={{ fontSize:'2rem', marginBottom:'10px' }}>⏳</div>
            <p style={{ fontWeight:500 }}>Cargando PDF...</p>
          </div>
        </div>
      )}

      {/* ── Visor PDF ── */}
      {visor && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)',
          zIndex:2000, display:'flex', flexDirection:'column' }}>
          <div style={{ background:'#1A1916', padding:'10px 16px',
            display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ fontSize:'1.1rem' }}>📄</span>
              <span style={{ color:'#fff', fontWeight:600, fontSize:'0.95rem',
                maxWidth:'50vw', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {visor.titulo}
              </span>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={() => { cerrarVisor(); setPanelVal(visor.recurso) }}
                style={{ padding:'6px 14px', background:'#F59E0B', color:'#1A1916',
                  border:'none', borderRadius:'6px', fontSize:'0.8rem', fontWeight:600 }}>
                ⭐ Valorar
              </button>
              <button onClick={() => handleDescargar({ id:visor.id, nombreArchivo:visor.titulo+'.pdf' })}
                style={{ padding:'6px 14px', background:'#534AB7', color:'#fff',
                  border:'none', borderRadius:'6px', fontSize:'0.8rem', fontWeight:500 }}>
                ⬇ Descargar
              </button>
              <button onClick={cerrarVisor}
                style={{ padding:'6px 14px', background:'#D85A30', color:'#fff',
                  border:'none', borderRadius:'6px', fontSize:'0.8rem', fontWeight:500 }}>
                ✕ Cerrar
              </button>
            </div>
          </div>
          <div style={{ flex:1, overflow:'hidden' }}>
            <iframe src={visor.url} title={visor.titulo} style={{ width:'100%', height:'100%', border:'none' }} />
          </div>
        </div>
      )}

      {/* Contenido */}
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'2rem 1rem' }}>
        <h2 style={{ fontSize:'1.4rem', fontWeight:700, marginBottom:'1.5rem', color:'#1A1916' }}>
          📚 Catálogo de recursos educativos
        </h2>

        {/* Buscador */}
        <form onSubmit={handleSearch} style={{ display:'flex', gap:'8px', marginBottom:'1.2rem', flexWrap:'wrap' }}>
          <input
            placeholder="🔍 Buscar por título..."
            value={q} onChange={e => setQ(e.target.value)}
            style={{ flex:1, minWidth:'200px', padding:'9px 12px',
              border:'1.5px solid #D4D3CF', borderRadius:'8px', fontSize:'0.875rem', background:'#fff' }}
          />
          <select value={grado} onChange={e => setGrado(e.target.value)}
            style={{ padding:'9px 12px', border:'1.5px solid #D4D3CF',
              borderRadius:'8px', fontSize:'0.875rem', background:'#fff' }}>
            {GRADOS.map(g => <option key={g}>{g}</option>)}
          </select>
          <button type="submit" style={{
            padding:'9px 20px', background:'#534AB7', color:'#fff',
            border:'none', borderRadius:'8px', fontWeight:600, fontSize:'0.875rem'
          }}>Buscar</button>
        </form>

        {/* Filtros área */}
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'1.5rem' }}>
          {AREAS.map(a => {
            const activo = area === a || (a==='Todas' && !area)
            return (
              <button key={a} onClick={() => setArea(a==='Todas' ? '' : a)} style={{
                padding:'5px 14px', borderRadius:'20px', border:'1.5px solid',
                fontSize:'0.8rem', fontWeight: activo ? 600 : 400, cursor:'pointer',
                borderColor: activo ? '#534AB7' : '#D4D3CF',
                background: activo ? '#EEEDFE' : '#fff',
                color: activo ? '#534AB7' : '#6B6966',
              }}>
                {EMOJIS[a] || '📚'} {a}
              </button>
            )
          })}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'3rem', color:'#6B6966' }}>
            ⏳ Cargando recursos...
          </div>
        ) : recursos.length === 0 ? (
          <div style={{ textAlign:'center', padding:'3rem' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📭</div>
            <p style={{ color:'#6B6966', fontWeight:500 }}>No se encontraron recursos.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1rem' }}>
            {recursos.map(r => {
              const resumen = resumenes[r.id]
              return (
                <div key={r.id} style={{ background:'#fff', borderRadius:'14px',
                  border:'1px solid #D4D3CF', boxShadow:'0 1px 4px rgba(0,0,0,.06)',
                  display:'flex', flexDirection:'column', overflow:'hidden',
                  transition:'box-shadow .2s, transform .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow='0 6px 20px rgba(83,74,183,.15)'; e.currentTarget.style.transform='translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.06)'; e.currentTarget.style.transform='none' }}
                >
                  {/* Cabecera */}
                  <div style={{ height:'76px', background: COLORES[r.area] || '#F5F4F3',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem' }}>
                    {EMOJIS[r.area] || '📄'}
                  </div>

                  {/* Contenido */}
                  <div style={{ padding:'12px 14px', flex:1, display:'flex', flexDirection:'column', gap:'6px' }}>
                    <p style={{ fontWeight:700, fontSize:'0.9rem', lineHeight:1.3, margin:0 }}>{r.titulo}</p>

                    {/* Área + Grado + Tamaño */}
                    <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
                      {r.area && (
                        <span style={{ fontSize:'0.72rem', padding:'2px 8px', borderRadius:'20px', fontWeight:500,
                          background: COLORES[r.area]||'#F5F4F3', color: TEXTOS[r.area]||'#6B6966' }}>
                          {r.area}
                        </span>
                      )}
                      {r.grado && (
                        <span style={{ fontSize:'0.72rem', padding:'2px 8px', borderRadius:'20px', background:'#F5F4F3', color:'#6B6966' }}>
                          {r.grado}
                        </span>
                      )}
                      {r.tamanoBytes && (
                        <span style={{ fontSize:'0.72rem', padding:'2px 8px', borderRadius:'20px', background:'#F5F4F3', color:'#6B6966' }}>
                          {fmtSize(r.tamanoBytes)}
                        </span>
                      )}
                    </div>

                    {/* Valoración */}
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      {resumen ? (
                        <>
                          <Estrellas valor={Math.round(resumen.promedio||0)} readonly size="0.9rem" />
                          <span style={{ fontSize:'0.72rem', color:'#6B6966' }}>
                            {resumen.promedio>0 ? resumen.promedio.toFixed(1) : ''} ({resumen.total})
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize:'0.72rem', color:'#6B6966' }}>Sin valoraciones</span>
                      )}
                    </div>

                    {r.descripcion && (
                      <p style={{ fontSize:'0.78rem', color:'#6B6966', lineHeight:1.4, margin:0,
                        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {r.descripcion}
                      </p>
                    )}

                    {/* Botones */}
                    <div style={{ display:'flex', gap:'5px', marginTop:'auto', paddingTop:'6px', flexWrap:'wrap' }}>
                      <button onClick={() => handleVerPDF(r)} style={{
                        flex:1, minWidth:'80px', padding:'7px 4px',
                        background:'#534AB7', color:'#fff', border:'none', borderRadius:'8px',
                        fontSize:'0.78rem', fontWeight:600, display:'flex', alignItems:'center',
                        justifyContent:'center', gap:'3px'
                      }}>
                        👁 Ver
                      </button>
                      <button onClick={() => handleDescargar(r)} disabled={descargando===r.id} style={{
                        flex:1, minWidth:'80px', padding:'7px 4px',
                        background:'#fff', color:'#534AB7', border:'1.5px solid #534AB7', borderRadius:'8px',
                        fontSize:'0.78rem', fontWeight:600, display:'flex', alignItems:'center',
                        justifyContent:'center', gap:'3px'
                      }}>
                        {descargando===r.id ? '⏳' : '⬇'} Descargar
                      </button>
                      <button onClick={() => setPanelVal(r)} style={{
                        flex:1, minWidth:'80px', padding:'7px 4px',
                        background:'#FFF9EC', color:'#D97706', border:'1.5px solid #F59E0B', borderRadius:'8px',
                        fontSize:'0.78rem', fontWeight:600, display:'flex', alignItems:'center',
                        justifyContent:'center', gap:'3px'
                      }}>
                        ⭐ Valorar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
