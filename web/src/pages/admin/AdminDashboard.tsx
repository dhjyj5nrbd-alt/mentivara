import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '../../services/admin'
import { useAuthStore } from '../../store/authStore'
import { Users, GraduationCap, BookOpen, Clock, AlertCircle } from 'lucide-react'

export default function AdminDashboard() {
  const { user, logout } = useAuthStore()
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminService.dashboard,
  })

  const cards = stats ? [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Students', value: stats.total_students, icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Tutors', value: stats.total_tutors, icon: BookOpen, color: 'text-violet-600 bg-violet-50' },
    { label: 'Pending Tutors', value: stats.pending_tutors, icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
    { label: 'Total Lessons', value: stats.total_lessons, icon: BookOpen, color: 'text-slate-600 bg-slate-100' },
    { label: 'Upcoming', value: stats.upcoming_lessons, icon: Clock, color: 'text-sky-600 bg-sky-50' },
  ] : []

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1E1B4B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg">Mentivara Admin</span>
            <nav className="flex gap-4 text-sm">
              <Link to="/admin" className="text-white/90 hover:text-white">Dashboard</Link>
              <Link to="/admin/users" className="text-white/60 hover:text-white">Users</Link>
              <Link to="/admin/tutors-pending" className="text-white/60 hover:text-white">
                Pending Tutors {stats?.pending_tutors ? `(${stats.pending_tutors})` : ''}
              </Link>
              <Link to="/admin/payments" className="text-white/60 hover:text-white">Payments</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/60">{user?.name}</span>
            <button onClick={() => logout()} className="text-white/60 hover:text-white">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#1E1B4B] mb-6">Dashboard</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                  <card.icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-500 mt-1">{card.label}</p>
              </div>
            ))}
          </div>
        )}

        {stats && stats.pending_tutors > 0 && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 font-medium">
              {stats.pending_tutors} tutor{stats.pending_tutors > 1 ? 's' : ''} awaiting approval
            </p>
            <Link to="/admin/tutors-pending" className="text-sm text-amber-700 hover:underline mt-1 inline-block">
              Review applications
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
