import api from './axios'
export const getUsuarios   = () => api.get('/api/usuarios')
export const toggleUsuario = (id) => api.patch(`/api/usuarios/${id}/toggle`)
export const registrarUsuario = (data) => api.post('/api/auth/registro', data)
