import axios from 'axios'
import { isDemoMode, handleDemoRequest } from './demo-interceptor'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
})

// Request interceptor: attach token and use custom adapter for demo mode
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // In demo mode, replace the adapter so the request never hits the network
  if (isDemoMode()) {
    config.adapter = async (cfg) => {
      const mock = await handleDemoRequest(cfg)
      if (mock) {
        return {
          data: mock.data,
          status: mock.status,
          statusText: 'OK',
          headers: {},
          config: cfg,
        } as any
      }
      // Fallback: return empty success
      return { data: null, status: 200, statusText: 'OK', headers: {}, config: cfg } as any
    }
  }

  return config
})

// Response interceptor: handle 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
