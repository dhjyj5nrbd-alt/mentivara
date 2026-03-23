import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  Users, GraduationCap, BookOpen, DollarSign, MessageSquare, Clock,
  CheckCircle, AlertTriangle, Activity, Star, TrendingUp, Zap,
  UserPlus, Flag, FileText, ArrowRight,
} from 'lucide-react'

// ── Demo Data ──────────────────────────────────────────────
const STATS = {
  totalStudents: 1247,
  totalTutors: 89,
  activeLessonsToday: 34,
  monthlyRevenue: 28450,
  pendingApplications: 6,
  totalForumPosts: 3842,
}

const REVENUE_DATA = [
  { month: 'Oct', amount: 18200 },
  { month: 'Nov', amount: 21500 },
  { month: 'Dec', amount: 19800 },
  { month: 'Jan', amount: 24100 },
  { month: 'Feb', amount: 26300 },
  { month: 'Mar', amount: 28450 },
]

const RECENT_ACTIVITY = [
  { id: 1, type: 'student', message: 'New student registered: Emma Williams', time: '5 mins ago', icon: UserPlus, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
  { id: 2, type: 'tutor', message: 'Tutor application received: Dr. Mark Thompson', time: '12 mins ago', icon: GraduationCap, color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/30' },
  { id: 3, type: 'report', message: 'Forum post reported: Inappropriate content', time: '28 mins ago', icon: Flag, color: 'text-red-600 bg-red-50 dark:bg-red-900/30' },
  { id: 4, type: 'lesson', message: 'Lesson completed: Sarah Mitchell with Alex J.', time: '45 mins ago', icon: CheckCircle, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
  { id: 5, type: 'student', message: 'New student registered: Oliver Brown', time: '1 hour ago', icon: UserPlus, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
  { id: 6, type: 'lesson', message: 'Lesson completed: James Chen with Mia P.', time: '1.5 hours ago', icon: CheckCircle, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
  { id: 7, type: 'tutor', message: 'Tutor application received: Anna Kowalski', time: '2 hours ago', icon: GraduationCap, color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/30' },
  { id: 8, type: 'report', message: 'Reel flagged: Spam content detected', time: '3 hours ago', icon: Flag, color: 'text-red-600 bg-red-50 dark:bg-red-900/30' },
]

const TOP_TUTORS = [
  { name: 'Dr Sarah Mitchell', subject: 'Mathematics', rating: 4.9, lessons: 342, avatar: 'SM' },
  { name: 'James Chen', subject: 'Biology', rating: 4.8, lessons: 287, avatar: 'JC' },
  { name: 'Emma Richardson', subject: 'English', rating: 4.8, lessons: 256, avatar: 'ER' },
  { name: 'Dr Raj Patel', subject: 'Physics', rating: 4.7, lessons: 198, avatar: 'RP' },
  { name: 'Lisa Wang', subject: 'Chemistry', rating: 4.7, lessons: 175, avatar: 'LW' },
]

const PLATFORM_HEALTH = {
  uptime: 99.97,
  activeSessions: 156,
  apiResponseTime: 45,
  errorRate: 0.02,
}

export default function AdminDashboard() {
  const [activityFilter, setActivityFilter] = useState<string>('all')

  const maxRevenue = Math.max(...REVENUE_DATA.map((d) => d.amount))

  const statCards = [
    { label: 'Total Students', value: STATS.totalStudents.toLocaleString(), icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30', change: '+12%' },
    { label: 'Total Tutors', value: STATS.totalTutors.toString(), icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30', change: '+5%' },
    { label: 'Active Lessons Today', value: STATS.activeLessonsToday.toString(), icon: BookOpen, color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/30', change: '+8%' },
    { label: 'Monthly Revenue', value: `£${STATS.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600 bg-green-50 dark:bg-green-900/30', change: '+15%' },
    { label: 'Pending Applications', value: STATS.pendingApplications.toString(), icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30', change: '' },
    { label: 'Total Forum Posts', value: STATS.totalForumPosts.toLocaleString(), icon: MessageSquare, color: 'text-sky-600 bg-sky-50 dark:bg-sky-900/30', change: '+22%' },
  ]

  const filteredActivity = activityFilter === 'all'
    ? RECENT_ACTIVITY
    : RECENT_ACTIVITY.filter((a) => a.type === activityFilter)

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1E1B4B] dark:text-white">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform overview and management</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{card.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.label}</p>
              {card.change && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> {card.change}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Pending Banner */}
        {STATS.pendingApplications > 0 && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-amber-800 dark:text-amber-200 font-medium">
                {STATS.pendingApplications} tutor application{STATS.pendingApplications > 1 ? 's' : ''} awaiting review
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">Review and approve to onboard new tutors</p>
            </div>
            <Link to="/admin/tutors-pending" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1">
              Review <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Revenue — Last 6 Months</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Monthly platform revenue in GBP</p>
            <div className="flex items-end gap-3 h-48">
              {REVENUE_DATA.map((d) => {
                const height = (d.amount / maxRevenue) * 100
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">£{(d.amount / 1000).toFixed(1)}k</span>
                    <div className="w-full relative" style={{ height: `${height}%` }}>
                      <div className="absolute inset-0 bg-[#7C3AED] rounded-t-lg opacity-80 hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{d.month}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Platform Health */}
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#7C3AED]" /> Platform Health
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Uptime</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{PLATFORM_HEALTH.uptime}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${PLATFORM_HEALTH.uptime}%` }} />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Active Sessions</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{PLATFORM_HEALTH.activeSessions}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">API Response Time</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{PLATFORM_HEALTH.apiResponseTime}ms</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Error Rate</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{PLATFORM_HEALTH.errorRate}%</span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#232536]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#7C3AED]" /> Quick Actions
            </h2>
            <div className="space-y-2">
              <Link to="/admin/tutors-pending" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                  <GraduationCap className="w-4 h-4" />
                </div>
                Approve Tutors
                <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">{STATS.pendingApplications}</span>
              </Link>
              <Link to="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                  <Users className="w-4 h-4" />
                </div>
                Manage Users
              </Link>
              <Link to="/admin/analytics" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
                  <FileText className="w-4 h-4" />
                </div>
                View Reports
              </Link>
              <Link to="/admin/moderation" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                  <Flag className="w-4 h-4" />
                </div>
                Content Moderation
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#7C3AED]" /> Recent Activity
              </h2>
              <div className="flex gap-1">
                {['all', 'student', 'tutor', 'lesson', 'report'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActivityFilter(f)}
                    className={`px-2.5 py-1 text-xs rounded-full transition-colors capitalize ${
                      activityFilter === f
                        ? 'bg-[#7C3AED] text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252839]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {filteredActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{item.message}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Tutors */}
        <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#7C3AED]" /> Top Performing Tutors
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-100 dark:border-[#232536]">
                  <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Rank</th>
                  <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Tutor</th>
                  <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Subject</th>
                  <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Rating</th>
                  <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Lessons</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-[#232536]">
                {TOP_TUTORS.map((tutor, i) => (
                  <tr key={tutor.name}>
                    <td className="py-3 text-slate-500 dark:text-slate-400 font-medium">#{i + 1}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] text-xs font-semibold">
                          {tutor.avatar}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{tutor.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{tutor.subject}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-medium text-slate-900 dark:text-white">{tutor.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{tutor.lessons}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
