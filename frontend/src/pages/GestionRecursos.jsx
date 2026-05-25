import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { getRecursos, getMisRecursos, crearRecurso, editarRecurso, eliminarRecurso } from '../api/recursosApi'

const AREAS  = ['Matemáticas','Ciencias','Historia','Español','Inglés','Tecnología','Arte','Educación Física']
const GRADOS = ['Grado 1','Grado 2','Grado 3','Grado 4','Grado 5','Grado 6',
                'Grado 7','Grado 8','Grado 9','Grado 10','Grado 11']

const FORM_INIT = { titulo:'', descripcion:'', area:'', grado:'', archivo:null }

const inputStyle = {
  width:'100%', padding:'9px 12px', border:'1.5px solid var(--gray2)',
  borderRadius:'8px', fontSize:'0.875rem', outline:'none', transition:'border .2s'
}

function Campo({ label, requerido, children }) {
  return (
    <div style={{ marginBottom:'1rem' }}>
      <label style={{ display:'block', fontSize:'0.875rem', fontWeight:500, marginBottom:'5px' }}>
        {label}{requerido && <span style={{ color:'var(--coral)' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

function ConfirmDialog({ titulo, msg, onConfirm, onCancel }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}>
      <div style={{ background:'#fff', borderRadius:'16px', padding:'2rem',
        maxWidth:'400px', width:'90%', boxShadow:'var(--shadow-lg)' }}>
        <div style={{ fontSize:'2.5rem', textAlign:'center', marginBottom:'12px' }}>⚠️</div>
        <h3 style={{ fontWeight:700, marginBottom:'8px', textAlign:'center' }}>{titulo}</h3>
        <p style={{ color:'var(--gray3)', fontSize:'0.875rem', textAlign:'center', marginBottom:'1.5rem' }}>{msg}</p>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={onCancel} style={{ flex:1, padding:'10px', border:'1.5px solid var(--gray2)',
            borderRadius:'8px', background:'#fff', fontWeight:500, fontSize:'0.875rem' }}>
            Cancelar
          </button>
          <button onClick={onConfirm} style={{ flex:1, padding:'10px', background:'var(--coral)',
            color:'#fff', border:'none', borderRadius:'8px', fontWeight:600, fontSize:'0.875rem' }}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GestionRecursos() {
  const { usuario, esAdmin } = useAuth()
  const { show, ToastEl } = useToast()

  const [recursos,  setRecursos]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)   // 'crear' | 'editar'
  const [form,      setForm]      = useState(FORM_INIT)
  const [editId,    setEditId]    = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [formErr,   setFormErr]   = useState('')
  const [confirm,   setConfirm]   = useState(null)   // { id, titulo }
  const [search,    setSearch]    = useState('')
  const [filterArea, setFilterArea] = useState('')
  const fileRef = useRef()

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      // Admin ve todo; docente/directivo ven sus propios recursos
      const { data } = esAdmin ? await getRecursos({}) : await getMisRecursos()
      setRecursos(Array.isArray(data) ? data : [])
    } catch(e) { show('Error al cargar recursos','err') }
    finally { setLoading(false) }
  }

  // ── Abrir modal crear ──
  const abrirCrear = () => {
    setForm(FORM_INIT); setFormErr(''); setEditId(null)
    if (fileRef.current) fileRef.current.value = ''
    setModal('crear')
  }

  // ── Abrir modal editar ──
  const abrirEditar = (r) => {
    setForm({ titulo: r.titulo, descripcion: r.descripcion || '', area: r.area || '', grado: r.grado || '', archivo: null })
    setFormErr(''); setEditId(r.id)
    if (fileRef.current) fileRef.current.value = ''
    setModal('editar')
  }

  const cerrarModal = () => { setModal(false); setFormErr('') }

  // ── Submit crear / editar ──
  const handleSubmit = async (e) => {
    e.preventDefault(); setFormErr('')

    if (modal === 'crear') {
      if (!form.archivo) return setFormErr('Selecciona un archivo PDF')
      if (form.archivo.type !== 'application/pdf') return setFormErr('Solo se permiten archivos PDF')
      if (form.archivo.size > 50 * 1024 * 1024) return setFormErr('El archivo supera 50 MB')
    }

    if (modal === 'editar' && form.archivo) {
      if (form.archivo.type !== 'application/pdf') return setFormErr('Solo se permiten archivos PDF')
      if (form.archivo.size > 50 * 1024 * 1024) return setFormErr('El archivo supera 50 MB')
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('titulo', form.titulo.trim())
      fd.append('descripcion', form.descripcion.trim())
      fd.append('area', form.area)
      fd.append('grado', form.grado)
      if (form.archivo) fd.append('archivo', form.archivo)

      if (modal === 'crear') {
        await crearRecurso(fd)
        show('Recurso subido correctamente ✅')
      } else {
        await editarRecurso(editId, fd)
        show('Recurso actualizado correctamente ✅')
      }
      cerrarModal(); cargar()
    } catch(err) {
      setFormErr(err.response?.data?.message || 'Error al guardar el recurso')
    } finally { setSaving(false) }
  }

  // ── Eliminar ──
  const pedirEliminar = (r) => setConfirm({ id: r.id, titulo: r.titulo })
  const confirmarEliminar = async () => {
    try {
      await eliminarRecurso(confirm.id)
      show('Recurso eliminado'); setConfirm(null); cargar()
    } catch(e) { show('Error al eliminar','err'); setConfirm(null) }
  }

  const fmtSize = (b) => !b ? '-' : b > 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}) : '-'

  // Filtro local
  const lista = recursos.filter(r => {
    const matchQ    = !search    || r.titulo?.toLowerCase().includes(search.toLowerCase())
    const matchArea = !filterArea || r.area === filterArea
    return matchQ && matchArea
  })

  const BADGE_COLOR = {
    'Matemáticas':'#EEEDFE', 'Ciencias':'#E1F5EE', 'Historia':'#FAEEDA',
    'Español':'#FAECE7', 'Inglés':'#E6F1FB', 'Tecnología':'#EAF3DE',
    'Arte':'#FDE8F5', 'Educación Física':'#E8F4FD'
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--gray1)' }}>
      <Navbar />
      {ToastEl}

      {/* Confirm dialog */}
      {confirm && (
        <ConfirmDialog
          titulo="¿Eliminar recurso?"
          msg={`Se eliminará "${confirm.titulo}" permanentemente. Esta acción no se puede deshacer.`}
          onConfirm={confirmarEliminar}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'2rem 1rem' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          flexWrap:'wrap', gap:'1rem', marginBottom:'1.5rem' }}>
          <div>
            <h2 style={{ fontSize:'1.4rem', fontWeight:700 }}>
              {esAdmin ? 'Gestión de recursos' : 'Mis recursos'}
            </h2>
            <p style={{ color:'var(--gray3)', fontSize:'0.875rem', marginTop:'2px' }}>
              {lista.length} recurso{lista.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={abrirCrear} style={{
            padding:'9px 20px', background:'var(--purple)', color:'#fff',
            border:'none', borderRadius:'8px', fontWeight:600, fontSize:'0.875rem',
            display:'flex', alignItems:'center', gap:'6px'
          }}>
            + Subir recurso
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'1.25rem' }}>
          <input
            placeholder="🔍 Buscar por título..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex:1, minWidth:'200px', padding:'9px 12px',
              border:'1.5px solid var(--gray2)', borderRadius:'8px', fontSize:'0.875rem', background:'#fff' }}
          />
          <select value={filterArea} onChange={e => setFilterArea(e.target.value)}
            style={{ padding:'9px 12px', border:'1.5px solid var(--gray2)',
              borderRadius:'8px', fontSize:'0.875rem', background:'#fff' }}>
            <option value="">Todas las áreas</option>
            {AREAS.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>

        {/* Tabla */}
        <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid var(--gray2)',
          overflow:'hidden', boxShadow:'var(--shadow)' }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:'3rem', color:'var(--gray3)' }}>
              ⏳ Cargando recursos...
            </div>
          ) : lista.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem' }}>
              <div style={{ fontSize:'3rem', marginBottom:'12px' }}>📁</div>
              <p style={{ fontWeight:600, marginBottom:'6px' }}>No hay recursos</p>
              <p style={{ color:'var(--gray3)', fontSize:'0.875rem' }}>
                {search || filterArea ? 'Prueba con otros filtros' : 'Sube el primer recurso con el botón de arriba'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
                <thead>
                  <tr style={{ background:'var(--gray1)' }}>
                    {['Título','Área','Grado','Tamaño','Subido por','Fecha','Acciones'].map(h => (
                      <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontWeight:600,
                        color:'var(--gray3)', borderBottom:'1px solid var(--gray2)', whiteSpace:'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lista.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom:'1px solid var(--gray2)',
                      background: i%2===0 ? '#fff' : 'var(--gray1)',
                      transition:'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#F0EFFF'}
                      onMouseLeave={e => e.currentTarget.style.background = i%2===0 ? '#fff' : 'var(--gray1)'}
                    >
                      <td style={{ padding:'11px 14px', fontWeight:600, maxWidth:'220px' }}>
                        <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}
                          title={r.titulo}>{r.titulo}</div>
                        {r.descripcion && (
                          <div style={{ fontSize:'0.75rem', color:'var(--gray3)', marginTop:'2px',
                            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {r.descripcion}
                          </div>
                        )}
                      </td>
                      <td style={{ padding:'11px 14px' }}>
                        {r.area ? (
                          <span style={{ fontSize:'0.75rem', padding:'3px 8px', borderRadius:'20px',
                            background: BADGE_COLOR[r.area] || 'var(--gray1)', fontWeight:500 }}>
                            {r.area}
                          </span>
                        ) : <span style={{ color:'var(--gray3)' }}>—</span>}
                      </td>
                      <td style={{ padding:'11px 14px', color:'var(--gray3)' }}>{r.grado || '—'}</td>
                      <td style={{ padding:'11px 14px', color:'var(--gray3)', whiteSpace:'nowrap' }}>
                        {fmtSize(r.tamanoBytes)}
                      </td>
                      <td style={{ padding:'11px 14px', color:'var(--gray3)' }}>
                        {r.subidoPorNombre || '—'}
                      </td>
                      <td style={{ padding:'11px 14px', color:'var(--gray3)', whiteSpace:'nowrap' }}>
                        {fmtDate(r.creadoEn)}
                      </td>
                      <td style={{ padding:'11px 14px' }}>
                        <div style={{ display:'flex', gap:'6px' }}>
                          {/* Editar */}
                          <button onClick={() => abrirEditar(r)} style={{
                            padding:'5px 12px', border:'1.5px solid var(--purple)',
                            borderRadius:'6px', background:'#fff', color:'var(--purple)',
                            fontSize:'0.8rem', fontWeight:500, whiteSpace:'nowrap'
                          }}>
                            ✏️ Editar
                          </button>
                          {/* Eliminar */}
                          <button onClick={() => pedirEliminar(r)} style={{
                            padding:'5px 12px', border:'1.5px solid var(--coral)',
                            borderRadius:'6px', background:'#fff', color:'var(--coral)',
                            fontSize:'0.8rem', fontWeight:500, whiteSpace:'nowrap'
                          }}>
                            🗑 Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal crear/editar ── */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem' }}>
          <div style={{ background:'#fff', borderRadius:'16px', padding:'2rem',
            width:'100%', maxWidth:'500px', maxHeight:'90vh', overflowY:'auto',
            boxShadow:'var(--shadow-lg)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h3 style={{ fontWeight:700, fontSize:'1.1rem' }}>
                {modal === 'crear' ? '📤 Subir nuevo recurso' : '✏️ Editar recurso'}
              </h3>
              <button onClick={cerrarModal} style={{ background:'none', border:'none',
                fontSize:'1.2rem', color:'var(--gray3)', padding:'4px' }}>✕</button>
            </div>

            {formErr && (
              <div style={{ background:'var(--coral-light)', color:'var(--coral)',
                padding:'10px 14px', borderRadius:'8px', marginBottom:'1rem', fontSize:'0.875rem' }}>
                ⚠️ {formErr}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Campo label="Título" requerido>
                <input type="text" required value={form.titulo}
                  onChange={e => setForm({...form, titulo:e.target.value})}
                  style={inputStyle} placeholder="Ej: Guía de Álgebra Grado 8"
                  onFocus={e=>e.target.style.borderColor='var(--purple)'}
                  onBlur={e=>e.target.style.borderColor='var(--gray2)'}
                />
              </Campo>

              <Campo label="Descripción">
                <textarea rows={2} value={form.descripcion}
                  onChange={e => setForm({...form, descripcion:e.target.value})}
                  style={{...inputStyle, resize:'vertical'}}
                  placeholder="Descripción corta del contenido..."
                  onFocus={e=>e.target.style.borderColor='var(--purple)'}
                  onBlur={e=>e.target.style.borderColor='var(--gray2)'}
                />
              </Campo>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <Campo label="Área">
                  <select value={form.area} onChange={e => setForm({...form, area:e.target.value})}
                    style={{...inputStyle, background:'#fff'}}>
                    <option value="">Seleccionar...</option>
                    {AREAS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </Campo>
                <Campo label="Grado">
                  <select value={form.grado} onChange={e => setForm({...form, grado:e.target.value})}
                    style={{...inputStyle, background:'#fff'}}>
                    <option value="">Seleccionar...</option>
                    {GRADOS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </Campo>
              </div>

              <Campo label={modal === 'crear' ? 'Archivo PDF' : 'Reemplazar PDF (opcional)'} requerido={modal === 'crear'}>
                <div style={{ border:'2px dashed var(--gray2)', borderRadius:'10px',
                  padding:'1rem', textAlign:'center', background:'var(--gray1)',
                  transition:'border .2s, background .2s',
                  cursor:'pointer' }}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor='var(--purple)'; e.currentTarget.style.background='var(--purple-light)' }}
                  onDragLeave={e => { e.currentTarget.style.borderColor='var(--gray2)'; e.currentTarget.style.background='var(--gray1)' }}
                  onDrop={e => {
                    e.preventDefault()
                    const f = e.dataTransfer.files[0]
                    if (f) setForm({...form, archivo:f})
                    e.currentTarget.style.borderColor='var(--gray2)'; e.currentTarget.style.background='var(--gray1)'
                  }}
                >
                  <input ref={fileRef} type="file" accept="application/pdf"
                    style={{ display:'none' }}
                    onChange={e => setForm({...form, archivo:e.target.files[0]})}
                  />
                  {form.archivo ? (
                    <div>
                      <div style={{ fontSize:'1.5rem', marginBottom:'4px' }}>📄</div>
                      <div style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--purple)' }}>
                        {form.archivo.name}
                      </div>
                      <div style={{ fontSize:'0.75rem', color:'var(--gray3)', marginTop:'2px' }}>
                        {(form.archivo.size/1024/1024).toFixed(2)} MB
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize:'1.5rem', marginBottom:'4px' }}>📂</div>
                      <div style={{ fontSize:'0.875rem', color:'var(--gray3)' }}>
                        {modal === 'editar'
                          ? 'Arrastra un nuevo PDF o haz clic para seleccionarlo (opcional)'
                          : 'Arrastra el PDF aquí o haz clic para seleccionarlo'}
                      </div>
                      <div style={{ fontSize:'0.75rem', color:'var(--gray3)', marginTop:'4px' }}>
                        Máximo 50 MB · Solo PDF
                      </div>
                    </div>
                  )}
                </div>
                {form.archivo && (
                  <button type="button" onClick={() => { setForm({...form,archivo:null}); if(fileRef.current) fileRef.current.value='' }}
                    style={{ marginTop:'6px', fontSize:'0.75rem', color:'var(--coral)', background:'none', border:'none', padding:0 }}>
                    ✕ Quitar archivo
                  </button>
                )}
              </Campo>

              <div style={{ display:'flex', gap:'10px', marginTop:'0.5rem' }}>
                <button type="button" onClick={cerrarModal} style={{
                  flex:1, padding:'10px', border:'1.5px solid var(--gray2)',
                  borderRadius:'8px', background:'#fff', fontWeight:500, fontSize:'0.875rem'
                }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{
                  flex:2, padding:'10px', background:'var(--purple)',
                  color:'#fff', border:'none', borderRadius:'8px', fontWeight:600, fontSize:'0.875rem'
                }}>
                  {saving
                    ? (modal === 'crear' ? '⏳ Subiendo...' : '⏳ Guardando...')
                    : (modal === 'crear' ? '📤 Subir recurso' : '💾 Guardar cambios')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
