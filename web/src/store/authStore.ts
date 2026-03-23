import { create } from 'zustand'
import { authService, type LoginPayload, type RegisterPayload } from '../services/auth'
import { DEMO_USER, DEMO_PARENT_USER, DEMO_TUTOR_USER, DEMO_ADMIN_USER } from '../services/demo-data'
import { enableDemoMode, disableDemoMode, isDemoMode, getDemoRole } from '../services/demo-interceptor'

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
  loginDemo: () => void
  loginDemoParent: () => void
  loginDemoTutor: () => void
  loginDemoAdmin: () => void
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

  loginDemo: () => {
    enableDemoMode('student')
    set({ user: DEMO_USER, isAuthenticated: true, isLoading: false, error: null })
  },

  loginDemoParent: () => {
    enableDemoMode('parent')
    set({ user: DEMO_PARENT_USER as User, isAuthenticated: true, isLoading: false, error: null })
  },

  loginDemoTutor: () => {
    enableDemoMode('tutor')
    set({ user: DEMO_TUTOR_USER as User, isAuthenticated: true, isLoading: false, error: null })
  },

  loginDemoAdmin: () => {
    enableDemoMode('admin')
    set({ user: DEMO_ADMIN_USER as User, isAuthenticated: true, isLoading: false, error: null })
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
      if (!isDemoMode()) {
        await authService.logout()
      }
    } finally {
      disableDemoMode()
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  loadUser: async () => {
    // Demo mode: restore user from local mock data
    if (isDemoMode()) {
      const demoRole = getDemoRole()
      const demoUser = demoRole === 'parent' ? DEMO_PARENT_USER as User : demoRole === 'tutor' ? DEMO_TUTOR_USER as User : demoRole === 'admin' ? DEMO_ADMIN_USER as User : DEMO_USER
      set({ user: demoUser, isAuthenticated: true, isLoading: false })
      return
    }

    if (!authService.hasToken()) {
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
