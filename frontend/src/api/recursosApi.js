import api from './axios'

export const getRecursos      = (params)    => api.get('/api/recursos', { params })
export const getRecurso       = (id)        => api.get(`/api/recursos/${id}`)
export const getMisRecursos   = ()          => api.get('/api/recursos/mis-recursos')

export const crearRecurso = (form) =>
  api.post('/api/recursos', form, { headers: { 'Content-Type': 'multipart/form-data' } })

// Editar: envía multipart (puede incluir nuevo archivo PDF opcional)
export const editarRecurso = (id, form) =>
  api.put(`/api/recursos/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })

export const eliminarRecurso  = (id)        => api.delete(`/api/recursos/${id}`)

export const descargarRecurso = (id) =>
  api.get(`/api/recursos/${id}/descargar`, { responseType: 'blob' })
