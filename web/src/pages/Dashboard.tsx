import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const roleLabel = {
    admin: 'Administrator',
    tutor: 'Tutor',
    student: 'Student',
    parent: 'Parent',
  }

  const roleBadgeColor = {
    admin: 'bg-red-100 text-red-700',
    tutor: 'bg-blue-100 text-blue-700',
    student: 'bg-emerald-100 text-emerald-700',
    parent: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-[#1E1B4B]">Mentivara</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.name}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleBadgeColor[user?.role || 'student']}`}>
              {roleLabel[user?.role || 'student']}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-semibold text-[#1E1B4B] mb-6">
          Welcome back, {user?.name?.split(' ')[0]}
        </h2>

        {user?.role === 'tutor' && user?.status === 'pending' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl mb-6">
            <p className="font-medium">Your account is pending approval</p>
            <p className="text-sm mt-1">An admin will review your application shortly.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/lessons" className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-slate-900 mb-2">My Lessons</h3>
            <p className="text-slate-500 text-sm">View upcoming and past lessons</p>
          </Link>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-2">Recent Activity</h3>
            <p className="text-slate-500 text-sm">Nothing to show yet.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-2">Quick Actions</h3>
            <p className="text-slate-500 text-sm">Features coming soon.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
