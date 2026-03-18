import { create } from 'zustand'
import { authService, type LoginPayload, type RegisterPayload } from '../services/auth'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'tutor' | 'student' | 'parent'
  status: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authService.login(payload)
      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed.'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authService.register(payload)
      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed.'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  logout: async () => {
    try {
      await authService.logout()
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  loadUser: async () => {
    const token = authService.restoreToken()
    if (!token) {
      set({ isLoading: false })
      return
    }
    try {
      const user = await authService.me()
      set({ user, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
