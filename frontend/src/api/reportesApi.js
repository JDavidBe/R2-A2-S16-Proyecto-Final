import api from './axios'
export const getResumen    = () => api.get('/api/reportes/resumen')
export const getTopRecursos = () => api.get('/api/reportes/top-recursos')
