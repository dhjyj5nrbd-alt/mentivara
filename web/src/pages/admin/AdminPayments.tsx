import { useState } from 'react'
import Layout from '../../components/Layout'
import {
  DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight,
  Search, Filter, ChevronDown,
} from 'lucide-react'

// ── Demo Data ──────────────────────────────────────────────
interface Transaction {
  id: number
  date: string
  student: string
  tutor: string
  subject: string
  amount: number
  platformFee: number
  status: 'completed' | 'pending' | 'refunded'
}

const TRANSACTIONS: Transaction[] = [
  { id: 1, date: '2026-03-23', student: 'Alex Johnson', tutor: 'Dr Sarah Mitchell', subject: 'Mathematics', amount: 50, platformFee: 15, status: 'completed' },
  { id: 2, date: '2026-03-23', student: 'Emma Williams', tutor: 'James Chen', subject: 'Biology', amount: 50, platformFee: 15, status: 'completed' },
  { id: 3, date: '2026-03-23', student: 'Mia Patel', tutor: 'Emma Richardson', subject: 'English', amount: 45, platformFee: 13.50, status: 'pending' },
  { id: 4, date: '2026-03-22', student: 'Oliver Brown', tutor: 'Dr Raj Patel', subject: 'Physics', amount: 55, platformFee: 16.50, status: 'completed' },
  { id: 5, date: '2026-03-22', student: 'Liam Wilson', tutor: 'Dr Sarah Mitchell', subject: 'Mathematics', amount: 50, platformFee: 15, status: 'completed' },
  { id: 6, date: '2026-03-22', student: 'Alex Johnson', tutor: 'James Chen', subject: 'Chemistry', amount: 50, platformFee: 15, status: 'refunded' },
  { id: 7, date: '2026-03-21', student: 'Sophia Davis', tutor: 'Emma Richardson', subject: 'English', amount: 45, platformFee: 13.50, status: 'completed' },
  { id: 8, date: '2026-03-21', student: 'Emma Williams', tutor: 'Dr Raj Patel', subject: 'Physics', amount: 55, platformFee: 16.50, status: 'completed' },
  { id: 9, date: '2026-03-21', student: 'Mia Patel', tutor: 'Dr Sarah Mitchell', subject: 'Mathematics', amount: 50, platformFee: 15, status: 'pending' },
  { id: 10, date: '2026-03-20', student: 'Oliver Brown', tutor: 'James Chen', subject: 'Biology', amount: 50, platformFee: 15, status: 'completed' },
  { id: 11, date: '2026-03-20', student: 'Liam Wilson', tutor: 'Emma Richardson', subject: 'English', amount: 45, platformFee: 13.50, status: 'completed' },
  { id: 12, date: '2026-03-20', student: 'Alex Johnson', tutor: 'Dr Raj Patel', subject: 'Physics', amount: 55, platformFee: 16.50, status: 'completed' },
  { id: 13, date: '2026-03-19', student: 'Emma Williams', tutor: 'Dr Sarah Mitchell', subject: 'Mathematics', amount: 50, platformFee: 15, status: 'completed' },
  { id: 14, date: '2026-03-19', student: 'Sophia Davis', tutor: 'James Chen', subject: 'Chemistry', amount: 50, platformFee: 15, status: 'pending' },
  { id: 15, date: '2026-03-19', student: 'Mia Patel', tutor: 'Dr Raj Patel', subject: 'Physics', amount: 55, platformFee: 16.50, status: 'completed' },
  { id: 16, date: '2026-03-18', student: 'Oliver Brown', tutor: 'Emma Richardson', subject: 'English', amount: 45, platformFee: 13.50, status: 'completed' },
  { id: 17, date: '2026-03-18', student: 'Liam Wilson', tutor: 'Dr Sarah Mitchell', subject: 'Mathematics', amount: 50, platformFee: 15, status: 'refunded' },
  { id: 18, date: '2026-03-18', student: 'Alex Johnson', tutor: 'James Chen', subject: 'Biology', amount: 50, platformFee: 15, status: 'completed' },
  { id: 19, date: '2026-03-17', student: 'Emma Williams', tutor: 'Dr Raj Patel', subject: 'Physics', amount: 55, platformFee: 16.50, status: 'completed' },
  { id: 20, date: '2026-03-17', student: 'Mia Patel', tutor: 'Emma Richardson', subject: 'English', amount: 45, platformFee: 13.50, status: 'completed' },
  { id: 21, date: '2026-03-16', student: 'Oliver Brown', tutor: 'Dr Sarah Mitchell', subject: 'Mathematics', amount: 50, platformFee: 15, status: 'completed' },
  { id: 22, date: '2026-03-16', student: 'Sophia Davis', tutor: 'James Chen', subject: 'Chemistry', amount: 50, platformFee: 15, status: 'pending' },
  { id: 23, date: '2026-03-15', student: 'Liam Wilson', tutor: 'Dr Raj Patel', subject: 'Physics', amount: 55, platformFee: 16.50, status: 'completed' },
  { id: 24, date: '2026-03-15', student: 'Alex Johnson', tutor: 'Emma Richardson', subject: 'English', amount: 45, platformFee: 13.50, status: 'completed' },
  { id: 25, date: '2026-03-14', student: 'Emma Williams', tutor: 'Dr Sarah Mitchell', subject: 'Mathematics', amount: 50, platformFee: 15, status: 'completed' },
  { id: 26, date: '2026-03-14', student: 'Mia Patel', tutor: 'James Chen', subject: 'Biology', amount: 50, platformFee: 15, status: 'completed' },
  { id: 27, date: '2026-03-13', student: 'Oliver Brown', tutor: 'Dr Raj Patel', subject: 'Physics', amount: 55, platformFee: 16.50, status: 'completed' },
  { id: 28, date: '2026-03-13', student: 'Sophia Davis', tutor: 'Dr Sarah Mitchell', subject: 'Mathematics', amount: 50, platformFee: 15, status: 'completed' },
]

interface TutorPayout {
  name: string
  avatar: string
  pendingAmount: number
  lessonsCount: number
  lastPayout: string
}

const TUTOR_PAYOUTS: TutorPayout[] = [
  { name: 'Dr Sarah Mitchell', avatar: 'SM', pendingAmount: 385, lessonsCount: 11, lastPayout: '2026-03-08' },
  { name: 'James Chen', avatar: 'JC', pendingAmount: 280, lessonsCount: 8, lastPayout: '2026-03-08' },
  { name: 'Dr Raj Patel', avatar: 'RP', pendingAmount: 346.50, lessonsCount: 9, lastPayout: '2026-03-08' },
  { name: 'Emma Richardson', avatar: 'ER', pendingAmount: 220.50, lessonsCount: 7, lastPayout: '2026-03-08' },
]

const REVENUE_BY_SUBJECT = [
  { subject: 'Mathematics', revenue: 850, lessons: 17 },
  { subject: 'Physics', revenue: 715, lessons: 13 },
  { subject: 'Biology', revenue: 400, lessons: 8 },
  { subject: 'English', revenue: 405, lessons: 9 },
  { subject: 'Chemistry', revenue: 300, lessons: 6 },
]

export default function AdminPayments() {
  const [transactions, setTransactions] = useState(TRANSACTIONS)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [payoutProcessed, setPayoutProcessed] = useState<Set<string>>(new Set())

  const totalRevenue = transactions.filter((t) => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
  const totalCommission = transactions.filter((t) => t.status === 'completed').reduce((sum, t) => sum + t.platformFee, 0)
  const totalPayouts = totalRevenue - totalCommission
  const pendingPayouts = TUTOR_PAYOUTS.reduce((sum, t) => sum + t.pendingAmount, 0)

  const filtered = transactions.filter((t) => {
    const matchStatus = !statusFilter || t.status === statusFilter
    const matchSearch = !searchInput ||
      t.student.toLowerCase().includes(searchInput.toLowerCase()) ||
      t.tutor.toLowerCase().includes(searchInput.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchInput.toLowerCase())
    return matchStatus && matchSearch
  })

  const processPayout = (name: string) => {
    setPayoutProcessed((prev) => new Set([...prev, name]))
  }

  const refund = (id: number) => {
    setTransactions((prev) => prev.map((t) => t.id === id ? { ...t, status: 'refunded' as const } : t))
  }

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      refunded: 'bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400',
    }
    return colors[s] || 'bg-slate-100 text-slate-600'
  }

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1E1B4B] dark:text-white">Payments</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Financial overview and transaction management</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> +15%</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">£{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Revenue</p>
          </div>
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">£{totalCommission.toFixed(2)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Platform Commission</p>
          </div>
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">£{totalPayouts.toFixed(2)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tutor Payouts</p>
          </div>
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">£{pendingPayouts.toFixed(2)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pending Payouts</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Payout Management */}
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Pending Payouts</h2>
            <div className="space-y-3">
              {TUTOR_PAYOUTS.map((tutor) => (
                <div key={tutor.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] text-xs font-semibold shrink-0">
                    {tutor.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{tutor.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{tutor.lessonsCount} lessons</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">£{tutor.pendingAmount.toFixed(2)}</p>
                    {payoutProcessed.has(tutor.name) ? (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">Processed</span>
                    ) : (
                      <button
                        onClick={() => processPayout(tutor.name)}
                        className="text-xs text-[#7C3AED] hover:underline"
                      >
                        Process
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Subject */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Revenue by Subject</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-100 dark:border-[#232536]">
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Subject</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Revenue</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Lessons</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Avg/Lesson</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400 w-32">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-[#232536]">
                  {REVENUE_BY_SUBJECT.map((item) => {
                    const maxRev = Math.max(...REVENUE_BY_SUBJECT.map((r) => r.revenue))
                    const pct = (item.revenue / maxRev) * 100
                    return (
                      <tr key={item.subject}>
                        <td className="py-3 font-medium text-slate-900 dark:text-white">{item.subject}</td>
                        <td className="py-3 text-slate-700 dark:text-slate-300">£{item.revenue.toLocaleString()}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">{item.lessons}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">£{(item.revenue / item.lessons).toFixed(2)}</td>
                        <td className="py-3">
                          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                            <div className="bg-[#7C3AED] h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-[#232536] flex flex-wrap gap-3 items-center">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Transactions</h2>
            <div className="flex-1" />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-4 py-1.5 border border-slate-300 dark:border-[#2d3048] rounded-lg text-sm bg-white dark:bg-[#252839] dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 dark:border-[#2d3048] rounded-lg text-sm bg-white dark:bg-[#252839] dark:text-white"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#252839] text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Date</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Student</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Tutor</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400 hidden sm:table-cell">Subject</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Amount</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400 hidden md:table-cell">Fee</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#232536]">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors">
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{t.student}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.tutor}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 hidden sm:table-cell">{t.subject}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">£{t.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">£{t.platformFee.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {t.status === 'completed' && (
                        <button
                          onClick={() => { if (confirm('Refund this payment?')) refund(t.id) }}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 dark:bg-[#252839] text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-[#232536]">
            Showing {filtered.length} of {transactions.length} transactions
          </div>
        </div>
      </div>
    </Layout>
  )
}
