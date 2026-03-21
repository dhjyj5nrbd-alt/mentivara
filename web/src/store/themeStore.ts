import { create } from 'zustand'

interface ThemeState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('mentivara-theme') as 'light' | 'dark') || 'light',
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('mentivara-theme', next)
      return { theme: next }
    }),
  setTheme: (theme) => {
    localStorage.setItem('mentivara-theme', theme)
    set({ theme })
  },
}))
