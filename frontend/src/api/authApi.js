import api from './axios'
export const loginApi = (data) => api.post('/api/auth/login', data)
export const registroApi = (data) => api.post('/api/auth/registro', data)
