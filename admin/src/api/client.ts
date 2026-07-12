import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  adminLogin: (identifier: string, password: string) =>
    api.post('/auth/admin/login', { identifier, password }),
}

export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
  getRevenue: (from: string, to: string) => api.get(`/dashboard/revenue?from=${from}&to=${to}`),
  getPopularServices: () => api.get('/dashboard/popular-services'),
  getAppointmentsChart: (days = 7) => api.get(`/dashboard/appointments-chart?days=${days}`),
}

export const appointmentsApi = {
  getAll: (params?: any) => api.get('/appointments', { params }),
  updateStatus: (id: string, status: string, reason?: string) =>
    api.patch(`/appointments/${id}/status`, { status, reason }),
}

export const servicesApi = {
  getAll: () => api.get('/services'),
  getCategories: () => api.get('/services/categories'),
  create: (data: any) => api.post('/services', data),
  update: (id: string, data: any) => api.put(`/services/${id}`, data),
  remove: (id: string) => api.delete(`/services/${id}`),
  createCategory: (data: any) => api.post('/services/categories', data),
}

export const staffApi = {
  getAll: () => api.get('/staff'),
  create: (data: any) => api.post('/staff', data),
  update: (id: string, data: any) => api.put(`/staff/${id}`, data),
  remove: (id: string) => api.delete(`/staff/${id}`),
}

export const clientsApi = {
  getAll: (search?: string) => api.get('/users', { params: { search } }),
  toggleActive: (id: string) => api.put(`/users/${id}/toggle-active`),
}

export const settingsApi = {
  getAll: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
}
