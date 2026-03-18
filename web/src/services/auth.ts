import api from './api'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: 'student' | 'parent' | 'tutor'
}

export interface AuthResponse {
  user: {
    id: number
    name: string
    email: string
    role: 'admin' | 'tutor' | 'student' | 'parent'
    status: string
  }
  token: string
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/login', payload)
    localStorage.setItem('token', data.token)
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    return data
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/register', payload)
    localStorage.setItem('token', data.token)
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    return data
  },

  async me(): Promise<AuthResponse['user']> {
    const { data } = await api.get<{ user: AuthResponse['user'] }>('/me')
    return data.user
  },

  async logout(): Promise<void> {
    await api.post('/logout')
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  },

  restoreToken(): string | null {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    return token
  },
}
