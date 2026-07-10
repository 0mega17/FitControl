import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  profile: () => api.get('/auth/perfil'),
}

export const usersAPI = {
  getAll: () => api.get('/usuarios'),
  getByRole: (role) => api.get(`/usuarios/rol/${role}`),
  toggleActive: (id) => api.patch(`/usuarios/${id}/toggle-activo`),
  updateRole: (id, data) => api.put(`/usuarios/${id}/rol`, data),
  getTrainers: () => api.get('/usuarios/entrenadores'),
  getProfile: () => api.get('/auth/perfil'),
  updateProfile: (data) => api.put('/usuarios/perfil', data),
  deactivate: (id) => api.patch(`/usuarios/${id}/toggle-activo`),
  activate: (id) => api.patch(`/usuarios/${id}/toggle-activo`),
  updateUser: (id, data) => api.put(`/usuarios/${id}`, data),
}

export const membershipsAPI = {
  getSemaforo: () => api.get('/membresias/semaforo'),
  getPrices: () => api.get('/membresias/precios'),
  updatePrices: (data) => api.put('/membresias/precios', data),
  create: (data) => api.post('/membresias', data),
  renew: (id, data) => api.post(`/membresias/${id}/renovar`, data),
  cancel: (id) => api.post(`/membresias/${id}/cancelar`),
  getMy: () => api.get('/membresias/mi-membresia'),
  getMyPlan: () => api.get('/membresias/mi-plan'),
  getMyPlanEnhanced: () => api.get('/membresias/mi-plan'),
  changePlan: (data) => api.put('/membresias/cambiar-plan', data),
}

export const plansAPI = {
  getPublic: () => api.get('/planes/publicos'),
  getAll: () => api.get('/planes'),
  create: (data) => api.post('/planes', data),
  update: (id, data) => api.put(`/planes/${id}`, data),
  remove: (id) => api.delete(`/planes/${id}`),
}

export const routinesAPI = {
  getAll: () => api.get('/rutinas'),
  getById: (id) => api.get(`/rutinas/${id}`),
  create: (data) => api.post('/rutinas', data),
  update: (id, data) => api.put(`/rutinas/${id}`, data),
  remove: (id) => api.delete(`/rutinas/${id}`),
  assign: (id, data) => api.post(`/rutinas/${id}/asignar`, data),
  listClients: () => api.get('/rutinas/clientes'),
  getMyRoutine: () => api.get('/rutinas/mi-rutina'),
}

export const routineRequestsAPI = {
  create: (data) => api.post('/solicitudes-rutina', data),
  getMy: () => api.get('/solicitudes-rutina/mias'),
  getAll: () => api.get('/solicitudes-rutina'),
  respond: (id, data) => api.put(`/solicitudes-rutina/${id}/responder`, data),
  approve: (id) => api.put(`/solicitudes-rutina/${id}/aprobar`),
  reject: (id, motivo) => api.put(`/solicitudes-rutina/${id}/rechazar`, { motivo }),
  assignRoutine: (requestId, rutinaId) =>
    api.post(`/solicitudes-rutina/${requestId}/asignar-rutina`, { rutinaId }),
}

export const attendanceAPI = {
  getToday: () => api.get('/asistencia/hoy'),
  register: (data) => api.post('/asistencia', data),
  getByDate: (date) => api.get(`/asistencia/fecha/${date}`),
  getAll: (fecha) => api.get(`/asistencia/fecha/${fecha}`),
  getStats: () => api.get('/asistencia/estadisticas'),
  generateQR: () => api.get('/asistencia/generar-qr'),
  registerByQR: (qrData) => api.post('/asistencia/registrar-qr', { qrData }),
}

export const notificationsAPI = {
  getMy: () => api.get('/notificaciones'),
  markRead: (id) => api.patch(`/notificaciones/${id}/leida`),
  markAllRead: () => api.patch('/notificaciones/leidas-todas'),
  markAsRead: (id) => api.patch(`/notificaciones/${id}/leida`),
  markAllAsRead: () => api.patch('/notificaciones/leidas-todas'),
  getUnreadCount: () => api.get('/notificaciones/no-leidas'),
}

export const exercisesAPI = {
  getAll: () => api.get('/ejercicios'),
  getById: (id) => api.get(`/ejercicios/${id}`),
  getByMuscle: (muscle) => api.get(`/ejercicios/musculo/${muscle}`),
  getBodyParts: () => api.get('/ejercicios/body-parts'),
  getTargetMuscles: () => api.get('/ejercicios/target-muscles'),
  getEquipment: () => api.get('/ejercicios/equipment'),
}

export const calendarAPI = {
  getEvents: () => api.get('/eventos'),
  getAll: () => api.get('/eventos'),
  create: (data) => api.post('/eventos', data),
  remove: (id) => api.delete(`/eventos/${id}`),
}

export const reportsAPI = {
  getDashboard: () => api.get('/reportes/dashboard'),
  get: (params) => api.get('/reportes', { params }),
}

export const progressAPI = {
  getMy: () => api.get('/progreso/mi-progreso'),
  create: (data) => api.post('/progreso', data),
  getAll: () => api.get('/progreso'),
  remove: (id) => api.delete(`/progreso/${id}`),
  getLast: () => api.get('/progreso/ultimo'),
}

export default api
