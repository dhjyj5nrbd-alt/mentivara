import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Layout from '../components/Layout'
import {
  Users, BookOpen, PoundSterling, Star, Video, Calendar,
  Upload, DollarSign, HelpCircle, UserCheck, Sparkles,
  Clock, ChevronRight, MessageSquare, FileText, CheckCircle,
  Bell, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'

// ── Demo data ────────────────────────────────────────────────

const TUTOR_STATS = {
  totalStudents: 24,
  lessonsThisMonth: 38,
  monthlyEarnings: 2840,
  averageRating: 4.9,
}

type LessonStatus = 'past' | 'current' | 'upcoming'

interface Lesson {
  id: number
  lessonId: string
  time: string
  endTime: string
  student: string
  subject: string
  duration: string
  status: LessonStatus
}

const SCHEDULE_DATA: Record<string, Lesson[]> = {
  today: [
    { id: 1, lessonId: 'les_today_001', time: '09:00', endTime: '10:00', student: 'Sarah Ahmed', subject: 'A-Level Maths', duration: '60 min', status: 'past' },
    { id: 2, lessonId: 'les_today_002', time: '10:30', endTime: '11:30', student: 'James Chen', subject: 'GCSE Physics', duration: '60 min', status: 'past' },
    { id: 3, lessonId: 'les_today_003', time: '14:00', endTime: '15:00', student: 'Emma Wilson', subject: 'A-Level Chemistry', duration: '60 min', status: 'current' },
    { id: 4, lessonId: 'les_today_004', time: '16:00', endTime: '17:00', student: 'Oliver Brown', subject: 'GCSE Maths', duration: '60 min', status: 'upcoming' },
    { id: 5, lessonId: 'les_today_005', time: '17:30', endTime: '18:30', student: 'Amira Khan', subject: 'A-Level Biology', duration: '60 min', status: 'upcoming' },
  ],
  tomorrow: [
    { id: 6, lessonId: 'les_tmrw_001', time: '09:00', endTime: '10:00', student: 'Sarah Ahmed', subject: 'A-Level Maths', duration: '60 min', status: 'upcoming' },
    { id: 7, lessonId: 'les_tmrw_002', time: '11:00', endTime: '12:00', student: 'Liam Patel', subject: 'GCSE Chemistry', duration: '60 min', status: 'upcoming' },
    { id: 8, lessonId: 'les_tmrw_003', time: '14:00', endTime: '15:00', student: 'Sophie Taylor', subject: 'A-Level Physics', duration: '60 min', status: 'upcoming' },
    { id: 9, lessonId: 'les_tmrw_004', time: '16:30', endTime: '17:30', student: 'Oliver Brown', subject: 'GCSE Maths', duration: '60 min', status: 'upcoming' },
  ],
  week: [
    { id: 10, lessonId: 'les_wk_001', time: 'Mon 09:00', endTime: '10:00', student: 'Sarah Ahmed', subject: 'A-Level Maths', duration: '60 min', status: 'past' },
    { id: 11, lessonId: 'les_wk_002', time: 'Mon 14:00', endTime: '15:00', student: 'Emma Wilson', subject: 'A-Level Chemistry', duration: '60 min', status: 'past' },
    { id: 12, lessonId: 'les_wk_003', time: 'Tue 10:00', endTime: '11:00', student: 'James Chen', subject: 'GCSE Physics', duration: '60 min', status: 'past' },
    { id: 13, lessonId: 'les_wk_004', time: 'Tue 15:00', endTime: '16:00', student: 'Amira Khan', subject: 'A-Level Biology', duration: '60 min', status: 'past' },
    { id: 14, lessonId: 'les_wk_005', time: 'Wed 09:00', endTime: '10:00', student: 'Oliver Brown', subject: 'GCSE Maths', duration: '60 min', status: 'current' },
    { id: 15, lessonId: 'les_wk_006', time: 'Wed 14:00', endTime: '15:00', student: 'Sophie Taylor', subject: 'A-Level Physics', duration: '60 min', status: 'upcoming' },
    { id: 16, lessonId: 'les_wk_007', time: 'Thu 10:00', endTime: '11:00', student: 'Liam Patel', subject: 'GCSE Chemistry', duration: '60 min', status: 'upcoming' },
    { id: 17, lessonId: 'les_wk_008', time: 'Thu 16:00', endTime: '17:00', student: 'Sarah Ahmed', subject: 'A-Level Maths', duration: '60 min', status: 'upcoming' },
    { id: 18, lessonId: 'les_wk_009', time: 'Fri 09:00', endTime: '10:00', student: 'James Chen', subject: 'GCSE Physics', duration: '60 min', status: 'upcoming' },
    { id: 19, lessonId: 'les_wk_010', time: 'Fri 11:00', endTime: '12:00', student: 'Emma Wilson', subject: 'A-Level Chemistry', duration: '60 min', status: 'upcoming' },
    { id: 20, lessonId: 'les_wk_011', time: 'Fri 14:00', endTime: '15:00', student: 'Amira Khan', subject: 'A-Level Biology', duration: '60 min', status: 'upcoming' },
  ],
}

const ACTIVITY_LINKS: Record<string, string | null> = {
  'submitted homework': '/tutor/students',
  'asked a doubt': '/messages/conversations',
  'completed quiz': '/tutor/students',
  'joined a study group': null,
}

const RECENT_ACTIVITY = [
  { id: 1, student: 'Sarah Ahmed', action: 'submitted homework', detail: 'Quadratic Equations Set 3', time: '2 hours ago', icon: FileText, color: 'text-blue-500' },
  { id: 2, student: 'James Chen', action: 'asked a doubt', detail: 'Newton\'s Third Law clarification', time: '3 hours ago', icon: HelpCircle, color: 'text-amber-500' },
  { id: 3, student: 'Emma Wilson', action: 'completed quiz', detail: 'Organic Chemistry — 92%', time: '5 hours ago', icon: CheckCircle, color: 'text-emerald-500' },
  { id: 4, student: 'Oliver Brown', action: 'joined a study group', detail: 'GCSE Maths Revision', time: '6 hours ago', icon: Users, color: 'text-purple-500' },
  { id: 5, student: 'Amira Khan', action: 'submitted homework', detail: 'Cell Division Worksheet', time: '1 day ago', icon: FileText, color: 'text-blue-500' },
]

const QUICK_ACTIONS = [
  { label: 'Set Availability', icon: Calendar, to: '/tutor/availability', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  { label: 'Upload Reel', icon: Upload, to: '/tutor/reels', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
  { label: 'View Earnings', icon: DollarSign, to: '/tutor/earnings', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { label: 'Question Bank', icon: HelpCircle, to: '/tutor/questions', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  { label: 'My Students', icon: UserCheck, to: '/tutor/students', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { label: 'AI Copilot', icon: Sparkles, to: '/lessons', color: 'bg-purple-100 text-[#7C3AED] dark:bg-purple-900/30 dark:text-purple-400' },
]

const EARNINGS_DATA = [
  { month: 'Oct', amount: 2100 },
  { month: 'Nov', amount: 2450 },
  { month: 'Dec', amount: 1980 },
  { month: 'Jan', amount: 2680 },
  { month: 'Feb', amount: 2920 },
  { month: 'Mar', amount: 2840 },
]

const MY_STUDENTS = [
  { id: 1, name: 'Sarah Ahmed', avatar: 'SA', subject: 'A-Level Maths', nextLesson: 'Tomorrow, 09:00', mastery: 78, lastMonthMastery: 72 },
  { id: 2, name: 'James Chen', avatar: 'JC', subject: 'GCSE Physics', nextLesson: 'Wed, 10:30', mastery: 65, lastMonthMastery: 68 },
  { id: 3, name: 'Emma Wilson', avatar: 'EW', subject: 'A-Level Chemistry', nextLesson: 'Today, 14:00', mastery: 82, lastMonthMastery: 75 },
  { id: 4, name: 'Oliver Brown', avatar: 'OB', subject: 'GCSE Maths', nextLesson: 'Today, 16:00', mastery: 54, lastMonthMastery: 58 },
  { id: 5, name: 'Amira Khan', avatar: 'AK', subject: 'A-Level Biology', nextLesson: 'Today, 17:30', mastery: 71, lastMonthMastery: 66 },
]

// ── Components ───────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, accent, trend }: {
  icon: React.ElementType; label: string; value: string; sub?: string; accent: string; trend?: { value: string; positive: boolean }
}) {
  return (
    <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
          {value}
          {sub && <span className="text-sm font-normal text-slate-400 dark:text-slate-500 ml-1">{sub}</span>}
        </p>
        {trend && (
          <p className={`text-[10px] font-medium flex items-center gap-0.5 mt-0.5 ${trend.positive ? 'text-emerald-500' : 'text-red-400'}`}>
            {trend.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.value} from last month
          </p>
        )}
      </div>
    </div>
  )
}

type ScheduleTab = 'today' | 'tomorrow' | 'week'

function ScheduleTimeline() {
  const [activeTab, setActiveTab] = useState<ScheduleTab>('today')

  const lessons = SCHEDULE_DATA[activeTab]

  const tabLabels: { key: ScheduleTab; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'week', label: 'This Week' },
  ]

  const statusStyles = {
    past: 'border-slate-200 dark:border-[#2a2d3e] bg-slate-50 dark:bg-[#161822] opacity-60',
    current: 'border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-200 dark:ring-emerald-800',
    upcoming: 'border-[#7C3AED]/30 dark:border-[#7C3AED]/40 bg-white dark:bg-[#1a1d2e]',
  }

  const dotStyles = {
    past: 'bg-slate-300 dark:bg-slate-600',
    current: 'bg-emerald-500 animate-pulse',
    upcoming: 'bg-[#7C3AED]',
  }

  return (
    <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#7C3AED]" />
          Schedule
        </h2>
        <span className="text-xs text-slate-400 dark:text-slate-500">{lessons.length} lessons</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-[#232536] rounded-lg p-0.5">
        {tabLabels.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white dark:bg-[#1a1d2e] text-[#7C3AED] shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {lessons.map((lesson, i) => (
          <div key={lesson.id} className="flex items-start gap-3">
            {/* Timeline dot + line */}
            <div className="flex flex-col items-center pt-3">
              <div className={`w-2.5 h-2.5 rounded-full ${dotStyles[lesson.status]}`} />
              {i < lessons.length - 1 && (
                <div className="w-px flex-1 min-h-[2.5rem] bg-slate-200 dark:bg-[#2a2d3e] mt-1" />
              )}
            </div>

            {/* Lesson card */}
            <div className={`flex-1 border rounded-lg p-3 ${statusStyles[lesson.status]}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{lesson.time} – {lesson.endTime}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                  {lesson.duration}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{lesson.student}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{lesson.subject}</p>
              {lesson.status === 'upcoming' && (
                <Link
                  to={`/classroom/${lesson.lessonId}`}
                  className="inline-block mt-2 px-3 py-1 text-xs font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg transition-colors"
                >
                  Join Lesson
                </Link>
              )}
              {lesson.status === 'current' && (
                <Link
                  to={`/classroom/${lesson.lessonId}`}
                  className="inline-block mt-2 px-3 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors animate-pulse"
                >
                  In Progress — Join
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentActivity() {
  return (
    <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
          Recent Student Activity
        </h2>
        <Link to="/lessons" className="text-xs text-[#7C3AED] hover:underline font-medium">View all</Link>
      </div>

      <div className="space-y-3">
        {RECENT_ACTIVITY.map((item) => {
          const linkTo = ACTIVITY_LINKS[item.action] ?? null

          const content = (
            <div className={`flex items-start gap-3 group ${linkTo ? 'cursor-pointer' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-[#232536] shrink-0 ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">{item.student}</span>{' '}
                  {item.action}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{item.detail}</p>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 pt-0.5">{item.time}</span>
              {linkTo && <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </div>
          )

          return linkTo ? (
            <Link key={item.id} to={linkTo} className="block rounded-lg hover:bg-slate-50 dark:hover:bg-[#232536] p-1 -m-1 transition-colors">
              {content}
            </Link>
          ) : (
            <div key={item.id} className="p-1 -m-1">
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function QuickActions() {
  return (
    <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl p-4">
      <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Quick Actions</h2>
      <div className="grid grid-cols-3 gap-2">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-[#232536] transition-colors group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function EarningsChart() {
  const maxAmount = Math.max(...EARNINGS_DATA.map((d) => d.amount))
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)

  return (
    <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PoundSterling className="w-4 h-4 text-[#7C3AED]" />
          Earnings Overview
        </h2>
        <Link to="/payments" className="text-xs text-[#7C3AED] hover:underline font-medium">Details</Link>
      </div>

      <div className="flex items-end justify-between gap-3 h-52">
        {EARNINGS_DATA.map((d) => {
          const heightPct = (d.amount / maxAmount) * 100
          const isLatest = d === EARNINGS_DATA[EARNINGS_DATA.length - 1]
          const isHovered = hoveredBar === d.month
          return (
            <div
              key={d.month}
              className="flex-1 flex flex-col items-center gap-1 relative"
              onMouseEnter={() => setHoveredBar(d.month)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Hover tooltip */}
              {isHovered && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white text-[11px] font-semibold px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-10">
                  {'\u00A3'}{d.amount.toLocaleString()}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
                </div>
              )}
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {'\u00A3'}{(d.amount / 1000).toFixed(1)}k
              </span>
              <div className="w-full max-w-[3.5rem] relative" style={{ height: `${heightPct}%` }}>
                <div
                  className={`absolute inset-0 rounded-t-md transition-all ${
                    isLatest
                      ? 'bg-[#7C3AED]'
                      : 'bg-[#EDE9FE] dark:bg-[#7C3AED]/20'
                  } ${isHovered ? 'opacity-80' : ''}`}
                />
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{d.month}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StudentsList() {
  return (
    <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-[#7C3AED]" />
          My Students
        </h2>
        <Link to="/tutor/students" className="text-xs text-[#7C3AED] hover:underline font-medium flex items-center gap-0.5">
          View All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {MY_STUDENTS.map((student) => {
          const masteryDiff = student.mastery - student.lastMonthMastery
          const trendUp = masteryDiff >= 0
          return (
            <div key={student.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#232536] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] text-xs font-bold shrink-0">
                {student.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{student.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{student.subject}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">{student.nextLesson}</p>
                <div className="flex items-center gap-1.5 justify-end mt-0.5">
                  <div className="w-12 h-1.5 bg-slate-100 dark:bg-[#232536] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#7C3AED]"
                      style={{ width: `${student.mastery}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{student.mastery}%</span>
                  <span className={`text-[10px] font-medium flex items-center ${trendUp ? 'text-emerald-500' : 'text-red-400'}`}>
                    {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────

export default function TutorDashboard() {
  const { user } = useAuthStore()
  const firstName = user?.name?.split(' ')[0]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const unreadCount = 3

  return (
    <Layout>
      <div className="px-4 sm:px-6 py-4 max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E1B4B] dark:text-white">{greeting}, {firstName}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Here's your teaching overview</p>
          </div>
          {/* Notification Bell */}
          <button className="relative mt-1 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#232536] transition-colors">
            <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard
            icon={Users}
            label="Total Students"
            value="24"
            accent="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            trend={{ value: '12%', positive: true }}
          />
          <StatCard
            icon={BookOpen}
            label="Lessons This Month"
            value="38"
            accent="bg-[#EDE9FE] text-[#7C3AED] dark:bg-purple-900/30 dark:text-purple-400"
            trend={{ value: '8%', positive: true }}
          />
          <StatCard
            icon={PoundSterling}
            label="Monthly Earnings"
            value={'\u00A32,840'}
            accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
            trend={{ value: '3%', positive: false }}
          />
          <StatCard
            icon={Star}
            label="Average Rating"
            value="4.9"
            sub="/5"
            accent="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            trend={{ value: '0.1', positive: true }}
          />
        </div>

        {/* Schedule + Activity — two columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          <ScheduleTimeline />
          <RecentActivity />
        </div>

        {/* Quick Actions */}
        <div className="mb-5">
          <QuickActions />
        </div>

        {/* Earnings + Students — two columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EarningsChart />
          <StudentsList />
        </div>
      </div>
    </Layout>
  )
}
