import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { login, loginDemo, loginDemoParent, error, clearError, isLoading } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })

  const handleDemo = () => {
    localStorage.setItem('demo-mode', 'true')
    loginDemo()
    navigate('/dashboard')
  }

  const handleDemoParent = () => {
    localStorage.setItem('demo-mode', 'true')
    loginDemoParent()
    navigate('/dashboard')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await login(form)
      navigate('/dashboard')
    } catch {
      // error is set in store
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1E1B4B] dark:text-white">Mentivara</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1d2e] rounded-xl shadow-sm border border-slate-200 dark:border-[#232536] p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] dark:text-white dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] dark:text-white dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#7C3AED] hover:underline font-medium">
              Sign up
            </Link>
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-[#232536]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-[#1a1d2e] px-2 text-slate-400">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemo}
            className="w-full border-2 border-dashed border-[#7C3AED]/30 hover:border-[#7C3AED] text-[#7C3AED] font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Demo as Student
          </button>

          <button
            type="button"
            onClick={handleDemoParent}
            className="w-full border-2 border-dashed border-amber-400/30 hover:border-amber-400 text-amber-600 dark:text-amber-400 font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Demo as Parent
          </button>
        </form>
      </div>
    </div>
  )
}
