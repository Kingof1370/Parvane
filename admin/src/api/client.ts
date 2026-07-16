import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://parvane-backend.onrender.com/api/v1'

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
      // رفتن به صفحه لاگین پنل ادمین
      window.location.href = '/admin/login'
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
  getOne: (id: string) => api.get(`/staff/${id}`),
  create: (data: any) => api.post('/staff', data),
  update: (id: string, data: any) => api.put(`/staff/${id}`, data),
  remove: (id: string) => api.delete(`/staff/${id}`),
  getPortfolioAdmin: (staffId: string) => api.get(`/staff/${staffId}/portfolio/admin`),
  addPortfolioItem: (staffId: string, data: any) => api.post(`/staff/${staffId}/portfolio`, data),
  updatePortfolioItem: (itemId: string, data: any) => api.put(`/staff/portfolio/${itemId}`, data),
  removePortfolioItem: (itemId: string) => api.delete(`/staff/portfolio/${itemId}`),
  updatePermissions: (staffId: string, permissions: string[]) =>
    api.patch(`/staff/${staffId}/permissions`, { permissions }),
  linkUserAccount: (staffId: string, userId: string) =>
    api.patch(`/staff/${staffId}/link-user`, { userId }),
}

export const clientsApi = {
  getAll: (search?: string) => api.get('/users', { params: { search } }),
  getById: (id: string) => api.get(`/users/${id}`),
  toggleActive: (id: string) => api.put(`/users/${id}/toggle-active`),
  changeRole: (id: string, role: string, staffSection?: string) =>
    api.patch(`/users/${id}/role`, { role, staffSection }),
  resetPassword: (id: string, newPassword: string) =>
    api.patch(`/users/${id}/reset-password`, { newPassword }),
  createStaff: (data: any) => api.post('/users/staff', data),
}

export const settingsApi = {
  getAll: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
}

export const galleryApi = {
  getAll: () => api.get('/gallery/admin'),
  getPublic: (params?: any) => api.get('/gallery', { params }),
  create: (data: any) => api.post('/gallery', data),
  update: (id: string, data: any) => api.put(`/gallery/${id}`, data),
  remove: (id: string) => api.delete(`/gallery/${id}`),
  // کامنت‌ها
  getComments: (id: string) => api.get(`/gallery/${id}/comments/admin`),
  deleteComment: (commentId: string) => api.delete(`/gallery/comments/${commentId}`),
  toggleCommentVisibility: (commentId: string) => api.patch(`/gallery/comments/${commentId}/visibility`),
}

export const loyaltyApi = {
  getAllUsers: () => api.get('/loyalty/all-users'),
  getUserTransactions: (userId: string) => api.get(`/loyalty/user/${userId}`),
  adminAdjust: (userId: string, points: number, description: string) =>
    api.post(`/loyalty/admin/adjust/${userId}`, { points, description }),
}

export const chatApi = {
  getAllRooms: () => api.get('/chat/rooms/all'),
  getRoomMessages: (roomId: string) => api.get(`/chat/rooms/${roomId}/messages`),
  sendMessage: (roomId: string, content: string, imageUrl?: string) =>
    api.post(`/chat/rooms/${roomId}/messages`, { content, imageUrl }),
  assignStaff: (roomId: string, staffId: string) =>
    api.patch(`/chat/rooms/${roomId}/assign`, { staffId }),
  closeRoom: (roomId: string) => api.patch(`/chat/rooms/${roomId}/close`),
}

export const notificationsAdminApi = {
  sendToUser: (userId: string, title: string, body: string, type: string) =>
    api.post('/notifications/admin/send', { userId, title, body, type }),
}
