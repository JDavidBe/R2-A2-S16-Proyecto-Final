import api from './axios'

export const getValoracion    = (recursoId) => api.get(`/api/valoraciones/${recursoId}/mi-valoracion`)
export const getResumen       = (recursoId) => api.get(`/api/valoraciones/${recursoId}/resumen`)
export const valorarRecurso   = (recursoId, puntuacion, comentario) =>
  api.post(`/api/valoraciones/${recursoId}`, { puntuacion, comentario })
export const getComentarios   = (recursoId) => api.get(`/api/valoraciones/${recursoId}/comentarios`)
export const getMisDescargas  = ()           => api.get('/api/valoraciones/mis-descargas')
