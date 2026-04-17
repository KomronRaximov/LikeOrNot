import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post('/api/auth/token/refresh/', { refresh })
          localStorage.setItem('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  me: () => api.get('/auth/me/'),
  updateMe: (data) => api.patch('/auth/me/', data),
}

export const profilesAPI = {
  list: () => api.get('/profiles/'),
  create: (data) => api.post('/profiles/', data),
  get: (id) => api.get(`/profiles/${id}/`),
  update: (id, data) => api.patch(`/profiles/${id}/`, data),
  delete: (id) => api.delete(`/profiles/${id}/`),
  search: (username) => api.get(`/profiles/search/?username=${username}`),
  createFromUsername: (data) => api.post('/profiles/create-from-username/', data),
}

export const categoriesAPI = {
  list: () => api.get('/categories/'),
  create: (data) => api.post('/categories/', data),
}

export const preferencesAPI = {
  list: (params = {}) => api.get('/preferences/', { params }),
  create: (data) => {
    const form = new FormData()
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') form.append(k, v)
    })
    return api.post('/preferences/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  get: (id) => api.get(`/preferences/${id}/`),
  update: (id, data) => {
    const form = new FormData()
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') form.append(k, v)
    })
    return api.patch(`/preferences/${id}/`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  delete: (id) => api.delete(`/preferences/${id}/`),
}

export const statsAPI = {
  overview: () => api.get('/stats/overview/'),
  profile: (id) => api.get(`/stats/profile/${id}/`),
}

export default api
