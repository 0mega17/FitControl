import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
  login: (data) => api.post('/auth/iniciar-sesion', data),
  register: (data) => api.post('/auth/registro', data),
  profile: () => api.get('/users/perfil'),
}

export const usersAPI = {
  getAll: (params) => api.get('/users/lista', { params }),
  getByRole: (role) => api.get('/users/lista', { params: { rol: role } }),
  toggleActive: (id) => api.put(`/users/${id}/desactivar`),
  updateRole: (id, data) => api.put(`/users/${id}/rol`, data),
  getTrainers: () => api.get('/users/lista', { params: { rol: 'Entrenador' } }),
  getProfile: () => api.get('/users/perfil'),
  updateProfile: (data) => api.put('/users/perfil', data),
  deactivate: (id) => api.put(`/users/${id}/desactivar`),
  activate: (id) => api.put(`/users/${id}/activar`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
}

export const membershipsAPI = {
  getSemaforo: () => api.get('/memberships/semaforo'),
  getPrices: () => api.get('/memberships/prices'),
  updatePrices: (data) => api.put('/memberships/prices', data),
  create: (data) => api.post('/memberships', data),
  renew: (id, data) => api.put(`/memberships/${id}/renew`, data),
  cancel: (id) => api.put(`/memberships/${id}/cancel`),
  getMy: () => api.get('/memberships/my'),
  getMyPlan: () => api.get('/memberships/my-plan'),
  getMyPlanEnhanced: () => api.get('/memberships/my-plan-enhanced'),
  changePlan: (data) => api.put('/memberships/change-plan', data),
}

export const plansAPI = {
  getPublic: () => api.get('/public/plans'),
  getAll: () => api.get('/plans'),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  remove: (id) => api.delete(`/plans/${id}`),
}

export const routinesAPI = {
  getAll: () => api.get('/routines'),
  getById: (id) => api.get(`/routines/${id}`),
  create: (data) => api.post('/routines', data),
  update: (id, data) => api.put(`/routines/${id}`, data),
  remove: (id) => api.delete(`/routines/${id}`),
  assign: (id, data) => api.post(`/routines/${id}/assign`, data),
  listClients: () => api.get('/routines/clientes/lista'),
  getMyRoutine: () => api.get('/routines/mi-rutina'),
}

export const routineRequestsAPI = {
  create: (data) => api.post('/routine-requests', data),
  getMy: () => api.get('/routine-requests/mis'),
  getAll: () => api.get('/routine-requests'),
  respond: (id, data) => api.put(`/routine-requests/${id}/responder`, data),
  approve: (id) => api.put(`/routine-requests/${id}/approve`),
  reject: (id, motivo) => api.put(`/routine-requests/${id}/reject`, { motivo }),
  assignRoutine: (requestId, rutinaId) =>
    api.post(`/routine-requests/${requestId}/assign-routine`, { rutinaId }),
}

export const attendanceAPI = {
  getToday: () => api.get('/attendance', { params: { fecha: new Date().toISOString().slice(0, 10) } }),
  register: (data) => api.post('/attendance/qr', data),
  getByDate: (date) => api.get('/attendance', { params: { fecha: date } }),
  getAll: (fecha) => api.get('/attendance', { params: { fecha } }),
  getStats: () => api.get('/attendance'),
  generateQR: () => api.get('/attendance/qr'),
  registerByQR: (qrData) => api.post('/attendance/qr', { qrData }),
}

export const notificationsAPI = {
  getMy: () => api.get('/notifications/my'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
}

export const exercisesAPI = {
  getAll: (params) => api.get('/exercises', { params }),
  getById: (id) => api.get(`/exercises/${id}`),
  getByMuscle: (muscle) => api.get('/exercises', { params: { targetMuscle: muscle } }),
  getBodyParts: () => api.get('/exercises/body-parts'),
  getTargetMuscles: () => api.get('/exercises/target-muscles'),
  getEquipment: () => api.get('/exercises/equipment'),
}

export const calendarAPI = {
  getEvents: (params) => api.get('/calendar', { params }),
  getAll: (params) => api.get('/calendar', { params }),
  create: (data) => api.post('/calendar', data),
  remove: (id) => api.delete(`/calendar/${id}`),
}

export const reportsAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  get: (params) => api.get('/reports', { params }),
}

export const progressAPI = {
  getMy: () => api.get('/progress'),
  create: (data) => api.post('/progress', data),
  getAll: () => api.get('/progress'),
  remove: (id) => api.delete(`/progress/${id}`),
  getLast: () => api.get('/progress/last'),
}

export default api
