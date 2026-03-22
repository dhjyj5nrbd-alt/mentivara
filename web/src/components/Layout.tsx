import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import {
  BookOpen, GraduationCap, CreditCard, Search, Brain, HelpCircle,
  LayoutDashboard, MessageSquare, Users, Dumbbell, Clapperboard, Target,
  LogOut, Shield, Menu, X, MoreHorizontal, Sun, Moon,
} from 'lucide-react'

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const studentNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/missions', icon: Target, label: 'Missions' },
    { to: '/lessons', icon: BookOpen, label: 'My Lessons' },
    { to: '/curriculum', icon: BookOpen, label: 'My Syllabus' },
    { to: '/tutors', icon: Search, label: 'Find Tutors' },
    { to: '/exam', icon: GraduationCap, label: 'Exams' },
    { to: '/knowledge-map', icon: Brain, label: 'Knowledge' },
    { to: '/doubts', icon: HelpCircle, label: 'AI Help' },
    { to: '/reels', icon: Clapperboard, label: 'Reels' },
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

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    tutor: 'bg-blue-100 text-blue-700',
    student: 'bg-emerald-100 text-emerald-700',
    parent: 'bg-amber-100 text-amber-700',
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Mobile bottom nav: show first 4 items + More button
  const mobileNavItems = navItems.slice(0, 4)
  const mobileOverflowItems = navItems.slice(4)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] flex">
      {/* Sidebar — hidden on mobile, shown on md+ */}
      <aside className="hidden md:flex flex-col w-56 bg-white dark:bg-[#161822] border-r border-slate-200 dark:border-[#232536] fixed h-full z-10">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-[#232536]">
          <Link to="/dashboard" className="text-lg font-bold text-[#1E1B4B] dark:text-white">Mentivara</Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] transition-colors ${
                isActive(item.to)
                  ? 'bg-[#EDE9FE] text-[#7C3AED] dark:bg-[#7C3AED]/20 dark:text-[#A78BFA] font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-slate-100 dark:border-[#232536]">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED] font-semibold text-xs" aria-hidden="true">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize ${roleColors[user?.role || 'student'] || 'bg-slate-100 text-slate-600'}`}>
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors shrink-0"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-[#0f1117] border-b border-slate-200 dark:border-[#232536] z-20 flex items-center justify-between px-4 h-14">
        <Link to="/dashboard" className="text-lg font-bold text-[#1E1B4B] dark:text-white">Mentivara</Link>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED] font-semibold text-xs" aria-hidden="true">
            {user?.name?.charAt(0) || '?'}
          </div>
          <button
            onClick={toggleTheme}
            className="text-slate-400 dark:text-slate-400 hover:text-[#7C3AED] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile bottom nav — show first 4 + More */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0f1117] border-t border-slate-200 dark:border-[#232536] z-20 flex" aria-label="Mobile navigation">
        {mobileNavItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex-1 flex flex-col items-center py-2.5 text-[11px] ${
              isActive(item.to) ? 'text-[#7C3AED]' : 'text-slate-400'
            }`}
          >
            <item.icon className="w-5 h-5 mb-0.5" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
        {mobileOverflowItems.length > 0 && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex-1 flex flex-col items-center py-2.5 text-[11px] ${
              mobileMenuOpen || mobileOverflowItems.some((i) => isActive(i.to)) ? 'text-[#7C3AED]' : 'text-slate-400'
            }`}
            aria-label="More navigation options"
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" aria-hidden="true" />
            More
          </button>
        )}
      </nav>

      {/* Mobile overflow menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white dark:bg-[#1a1d2e] border-t border-slate-200 dark:border-[#232536] z-20 px-4 py-3 shadow-lg">
          {mobileOverflowItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(item.to)
                  ? 'bg-[#EDE9FE] text-[#7C3AED] font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <item.icon className="w-4 h-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-56 pt-14 md:pt-0 pb-20 md:pb-0 min-w-0 overflow-x-hidden">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-[#7C3AED] text-white px-4 py-2 rounded-lg z-50">
          Skip to content
        </a>

        {/* Desktop theme toggle — floating top-right */}
        <div className="hidden md:block fixed top-3 right-4 z-30">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all bg-white dark:bg-[#1a1d2e] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252839] border border-slate-200 dark:border-[#232536] shadow-sm"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        <div id="main-content" className="max-w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
