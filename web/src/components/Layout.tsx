import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  BookOpen, GraduationCap, CreditCard, Search, Brain, HelpCircle,
  LayoutDashboard, MessageSquare, Users, Dumbbell,
  LogOut, Shield,
} from 'lucide-react'

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const studentNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/lessons', icon: BookOpen, label: 'My Lessons' },
    { to: '/tutors', icon: Search, label: 'Find Tutors' },
    { to: '/exam', icon: GraduationCap, label: 'Exams' },
    { to: '/knowledge-map', icon: Brain, label: 'Knowledge' },
    { to: '/doubts', icon: HelpCircle, label: 'AI Help' },
    { to: '/mental-dojo', icon: Dumbbell, label: 'Mental Dojo' },
    { to: '/messages/conversations', icon: MessageSquare, label: 'Messages' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
  ]

  const tutorNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/lessons', icon: BookOpen, label: 'My Lessons' },
    { to: '/payments', icon: CreditCard, label: 'Earnings' },
    { to: '/messages/conversations', icon: MessageSquare, label: 'Messages' },
  ]

  const adminNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin', icon: Shield, label: 'Admin Panel' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/tutors-pending', icon: GraduationCap, label: 'Pending' },
    { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  ]

  const parentNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/lessons', icon: BookOpen, label: 'Lessons' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
  ]

  const navItems = user?.role === 'admin' ? adminNav
    : user?.role === 'tutor' ? tutorNav
    : user?.role === 'parent' ? parentNav
    : studentNav

  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    tutor: 'bg-blue-100 text-blue-700',
    student: 'bg-emerald-100 text-emerald-700',
    parent: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar — hidden on mobile, shown on md+ */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-slate-200 fixed h-full z-10">
        <div className="p-4 border-b border-slate-100">
          <Link to="/dashboard" className="text-xl font-bold text-[#1E1B4B]">Mentivara</Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors ${
                isActive(item.to)
                  ? 'bg-[#EDE9FE] text-[#7C3AED] font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED] font-semibold text-sm">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleColors[user?.role || 'student']}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={() => { logout(); window.location.href = '/login' }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-1"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-20 flex" aria-label="Mobile navigation">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex-1 flex flex-col items-center py-2 text-[10px] ${
              isActive(item.to) ? 'text-[#7C3AED]' : 'text-slate-400'
            }`}
          >
            <item.icon className="w-5 h-5 mb-0.5" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 md:ml-56 pb-20 md:pb-0">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-[#7C3AED] text-white px-4 py-2 rounded-lg z-50">
          Skip to content
        </a>
        <div id="main-content">
          {children}
        </div>
      </main>
    </div>
  )
}
