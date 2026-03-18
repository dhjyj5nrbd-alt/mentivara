import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Home() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-5xl font-bold text-[#1E1B4B]">
          Mentivara
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-md mx-auto">
          AI-powered tutoring for ambitious students. Learn smarter. Grow stronger.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg font-semibold transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg font-semibold transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-white hover:bg-slate-50 text-[#1E1B4B] border border-slate-300 rounded-lg font-semibold transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
