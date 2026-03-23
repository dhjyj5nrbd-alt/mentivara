import { useState } from 'react'
import Layout from '../../components/Layout'
import {
  TrendingUp, Users, BookOpen, Clock, BarChart3, Calendar,
} from 'lucide-react'

// ── Demo Data ──────────────────────────────────────────────
const USER_GROWTH = [
  { month: 'Oct', students: 820, tutors: 62 },
  { month: 'Nov', students: 935, tutors: 68 },
  { month: 'Dec', students: 980, tutors: 71 },
  { month: 'Jan', students: 1085, tutors: 76 },
  { month: 'Feb', students: 1170, tutors: 83 },
  { month: 'Mar', students: 1247, tutors: 89 },
]

const LESSON_METRICS = {
  totalLessons: 4862,
  avgDuration: 52,
  completionRate: 94.2,
  cancelRate: 5.8,
  avgRating: 4.7,
}

const SUBJECT_POPULARITY = [
  { subject: 'Mathematics', lessons: 1420 },
  { subject: 'Physics', lessons: 890 },
  { subject: 'Biology', lessons: 780 },
  { subject: 'English', lessons: 720 },
  { subject: 'Chemistry', lessons: 650 },
  { subject: 'Computer Science', lessons: 210 },
  { subject: 'French', lessons: 120 },
  { subject: 'Spanish', lessons: 72 },
]

const REVENUE_PER_SUBJECT = [
  { subject: 'Mathematics', revenue: 71000, lessons: 1420, avgRate: 50 },
  { subject: 'Physics', revenue: 48950, lessons: 890, avgRate: 55 },
  { subject: 'Biology', revenue: 39000, lessons: 780, avgRate: 50 },
  { subject: 'English', revenue: 32400, lessons: 720, avgRate: 45 },
  { subject: 'Chemistry', revenue: 32500, lessons: 650, avgRate: 50 },
  { subject: 'Computer Science', revenue: 12600, lessons: 210, avgRate: 60 },
]

const RETENTION = {
  percentage: 87,
  trend: '+3%',
  description: 'Students returning after first month',
}

// Peak usage: hours (rows) x days (columns)
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm']

// Generate realistic heatmap data (higher on weekday evenings)
const HEATMAP: number[][] = HOURS.map((_, hourIdx) => {
  return DAYS.map((_, dayIdx) => {
    const isWeekday = dayIdx < 5
    const isEvening = hourIdx >= 8 // 4pm+
    const isAfternoon = hourIdx >= 4 && hourIdx < 8 // 12-4pm
    const isMorning = hourIdx < 4 // 8-12

    if (isWeekday && isEvening) return 60 + Math.floor(Math.random() * 40) // 60-100
    if (isWeekday && isAfternoon) return 30 + Math.floor(Math.random() * 30) // 30-60
    if (isWeekday && isMorning) return 10 + Math.floor(Math.random() * 20) // 10-30
    if (!isWeekday && isAfternoon) return 40 + Math.floor(Math.random() * 30) // 40-70
    if (!isWeekday && isMorning) return 20 + Math.floor(Math.random() * 25) // 20-45
    return 15 + Math.floor(Math.random() * 25) // 15-40
  })
})

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('6m')

  const maxStudents = Math.max(...USER_GROWTH.map((d) => d.students))
  const maxLessons = Math.max(...SUBJECT_POPULARITY.map((d) => d.lessons))

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1E1B4B] dark:text-white">Analytics</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform performance and user insights</p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-[#2d3048] rounded-lg text-sm bg-white dark:bg-[#252839] dark:text-white"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
        </div>

        {/* Lesson Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-4">
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 mb-2">
              <BookOpen className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{LESSON_METRICS.totalLessons.toLocaleString()}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Lessons</p>
          </div>
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{LESSON_METRICS.avgDuration} min</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Avg Duration</p>
          </div>
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mb-2">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{LESSON_METRICS.completionRate}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Completion Rate</p>
          </div>
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 mb-2">
              <BarChart3 className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{LESSON_METRICS.cancelRate}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cancel Rate</p>
          </div>
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-4">
            <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-2">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{RETENTION.percentage}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Student Retention <span className="text-emerald-600">{RETENTION.trend}</span></p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">User Growth</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Students and tutors over time</p>
            <div className="flex items-end gap-4 h-48">
              {USER_GROWTH.map((d) => {
                const studentHeight = (d.students / maxStudents) * 100
                const tutorHeight = (d.tutors / maxStudents) * 100
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex items-end gap-1 w-full" style={{ height: '90%' }}>
                      <div className="flex-1 relative" style={{ height: `${studentHeight}%` }}>
                        <div className="absolute inset-0 bg-[#7C3AED] rounded-t opacity-80" />
                      </div>
                      <div className="flex-1 relative" style={{ height: `${tutorHeight}%` }}>
                        <div className="absolute inset-0 bg-emerald-500 rounded-t opacity-80" />
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{d.month}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-4 mt-4 justify-center">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="w-3 h-3 rounded bg-[#7C3AED] opacity-80" /> Students
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="w-3 h-3 rounded bg-emerald-500 opacity-80" /> Tutors
              </div>
            </div>
          </div>

          {/* Subject Popularity */}
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Subject Popularity</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Total lessons per subject</p>
            <div className="space-y-3">
              {SUBJECT_POPULARITY.map((item) => {
                const pct = (item.lessons / maxLessons) * 100
                return (
                  <div key={item.subject}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 dark:text-slate-300">{item.subject}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.lessons.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                      <div
                        className="bg-[#7C3AED] h-2.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Per Subject */}
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Revenue per Subject</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-100 dark:border-[#232536]">
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Subject</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Revenue</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Lessons</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Avg Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-[#232536]">
                  {REVENUE_PER_SUBJECT.map((item) => (
                    <tr key={item.subject}>
                      <td className="py-3 font-medium text-slate-900 dark:text-white">{item.subject}</td>
                      <td className="py-3 text-slate-700 dark:text-slate-300">£{(item.revenue).toLocaleString()}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{item.lessons.toLocaleString()}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">£{item.avgRate}/hr</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 dark:border-[#232536]">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">Total</td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      £{REVENUE_PER_SUBJECT.reduce((s, r) => s + r.revenue, 0).toLocaleString()}
                    </td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {REVENUE_PER_SUBJECT.reduce((s, r) => s + r.lessons, 0).toLocaleString()}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">—</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Peak Usage Heatmap */}
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Peak Usage Hours</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Active sessions by time and day</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="w-12" />
                    {DAYS.map((d) => (
                      <th key={d} className="text-xs font-medium text-slate-500 dark:text-slate-400 pb-1 text-center">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map((hour, hIdx) => (
                    <tr key={hour}>
                      <td className="text-xs text-slate-500 dark:text-slate-400 pr-2 text-right py-0.5">{hour}</td>
                      {DAYS.map((day, dIdx) => {
                        const val = HEATMAP[hIdx][dIdx]
                        const opacity = Math.max(0.1, val / 100)
                        return (
                          <td key={day} className="p-0.5">
                            <div
                              className="w-full h-5 rounded-sm"
                              style={{ backgroundColor: `rgba(124, 58, 237, ${opacity})` }}
                              title={`${day} ${hour}: ${val} sessions`}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-2 mt-3 justify-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">Low</span>
              <div className="flex gap-0.5">
                {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map((o) => (
                  <div key={o} className="w-4 h-3 rounded-sm" style={{ backgroundColor: `rgba(124, 58, 237, ${o})` }} />
                ))}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">High</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
