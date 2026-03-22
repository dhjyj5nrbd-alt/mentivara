import { useState, useMemo } from 'react'
import {
  DollarSign, TrendingUp, Clock, Filter, CreditCard, Info,
} from 'lucide-react'
import Layout from '../components/Layout'

// ── Types ────────────────────────────────────────────────────
interface Transaction {
  id: number
  date: string
  month: string // e.g. '2026-03'
  studentName: string
  subject: string
  durationMinutes: number
  amount: number
  status: 'paid' | 'pending' | 'processing'
}

// ── Demo data ────────────────────────────────────────────────
const DEMO_TRANSACTIONS: Transaction[] = [
  // March 2026
  { id: 1, date: '21 Mar 2026', month: '2026-03', studentName: 'Alex Johnson', subject: 'Mathematics', durationMinutes: 60, amount: 45, status: 'pending' },
  { id: 2, date: '20 Mar 2026', month: '2026-03', studentName: 'Sophie Chen', subject: 'Mathematics', durationMinutes: 90, amount: 67.5, status: 'pending' },
  { id: 3, date: '19 Mar 2026', month: '2026-03', studentName: 'Amara Okafor', subject: 'Chemistry', durationMinutes: 60, amount: 50, status: 'pending' },
  { id: 4, date: '17 Mar 2026', month: '2026-03', studentName: 'Priya Sharma', subject: 'Physics', durationMinutes: 60, amount: 50, status: 'processing' },
  { id: 5, date: '14 Mar 2026', month: '2026-03', studentName: 'Emma Davis', subject: 'English', durationMinutes: 60, amount: 40, status: 'paid' },
  { id: 6, date: '12 Mar 2026', month: '2026-03', studentName: 'Marcus Williams', subject: 'Chemistry', durationMinutes: 90, amount: 75, status: 'paid' },
  { id: 7, date: '10 Mar 2026', month: '2026-03', studentName: 'James Taylor', subject: 'Physics', durationMinutes: 60, amount: 50, status: 'paid' },
  // February 2026
  { id: 8, date: '28 Feb 2026', month: '2026-02', studentName: 'Alex Johnson', subject: 'Mathematics', durationMinutes: 60, amount: 45, status: 'paid' },
  { id: 9, date: '24 Feb 2026', month: '2026-02', studentName: 'Sophie Chen', subject: 'Mathematics', durationMinutes: 60, amount: 45, status: 'paid' },
  { id: 10, date: '20 Feb 2026', month: '2026-02', studentName: 'Priya Sharma', subject: 'Physics', durationMinutes: 60, amount: 50, status: 'paid' },
  { id: 11, date: '17 Feb 2026', month: '2026-02', studentName: 'Marcus Williams', subject: 'Chemistry', durationMinutes: 60, amount: 50, status: 'paid' },
  // January 2026
  { id: 12, date: '30 Jan 2026', month: '2026-01', studentName: 'Emma Davis', subject: 'English', durationMinutes: 60, amount: 40, status: 'paid' },
  { id: 13, date: '23 Jan 2026', month: '2026-01', studentName: 'Alex Johnson', subject: 'Mathematics', durationMinutes: 60, amount: 45, status: 'paid' },
  { id: 14, date: '16 Jan 2026', month: '2026-01', studentName: 'Amara Okafor', subject: 'Chemistry', durationMinutes: 90, amount: 75, status: 'paid' },
  // December 2025
  { id: 15, date: '18 Dec 2025', month: '2025-12', studentName: 'Sophie Chen', subject: 'Mathematics', durationMinutes: 60, amount: 45, status: 'paid' },
  { id: 16, date: '12 Dec 2025', month: '2025-12', studentName: 'Priya Sharma', subject: 'Physics', durationMinutes: 60, amount: 50, status: 'paid' },
  // November 2025
  { id: 17, date: '25 Nov 2025', month: '2025-11', studentName: 'Marcus Williams', subject: 'Chemistry', durationMinutes: 60, amount: 50, status: 'paid' },
  { id: 18, date: '18 Nov 2025', month: '2025-11', studentName: 'Alex Johnson', subject: 'Mathematics', durationMinutes: 60, amount: 45, status: 'paid' },
  // October 2025
  { id: 19, date: '28 Oct 2025', month: '2025-10', studentName: 'Emma Davis', subject: 'English', durationMinutes: 60, amount: 40, status: 'paid' },
  { id: 20, date: '14 Oct 2025', month: '2025-10', studentName: 'James Taylor', subject: 'Physics', durationMinutes: 60, amount: 50, status: 'paid' },
]

// ── Month helpers ────────────────────────────────────────────
const MONTH_LABELS: Record<string, string> = {
  '2026-03': 'Mar 2026',
  '2026-02': 'Feb 2026',
  '2026-01': 'Jan 2026',
  '2025-12': 'Dec 2025',
  '2025-11': 'Nov 2025',
  '2025-10': 'Oct 2025',
}

const CHART_MONTHS = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03']

function statusBadge(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'pending':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'processing':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

// ── Component ────────────────────────────────────────────────
export default function TutorEarnings() {
  const [filterMonth, setFilterMonth] = useState('all')
  const [showTooltip, setShowTooltip] = useState(false)

  const totalEarnings = DEMO_TRANSACTIONS.reduce((a, t) => a + t.amount, 0)
  const thisMonthEarnings = DEMO_TRANSACTIONS
    .filter((t) => t.month === '2026-03')
    .reduce((a, t) => a + t.amount, 0)
  const pendingPayout = DEMO_TRANSACTIONS
    .filter((t) => t.status === 'pending' || t.status === 'processing')
    .reduce((a, t) => a + t.amount, 0)

  // Chart data
  const chartData = useMemo(() => {
    const data = CHART_MONTHS.map((month) => {
      const total = DEMO_TRANSACTIONS
        .filter((t) => t.month === month)
        .reduce((a, t) => a + t.amount, 0)
      return { month, label: MONTH_LABELS[month], total }
    })
    return data
  }, [])

  const maxChart = Math.max(...chartData.map((d) => d.total), 1)

  // Filtered transactions
  const filteredTransactions = filterMonth === 'all'
    ? DEMO_TRANSACTIONS
    : DEMO_TRANSACTIONS.filter((t) => t.month === filterMonth)

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Earnings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your tutoring income and payouts</p>
        </div>

        {/* Stat cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">Total Earnings</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">&pound;{totalEarnings.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">This Month</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">&pound;{thisMonthEarnings.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">Pending Payout</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">&pound;{pendingPayout.toFixed(2)}</p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] p-5 mb-8">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Last 6 Months</h2>
          <div className="flex items-end gap-3 h-48">
            {chartData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  &pound;{d.total.toFixed(0)}
                </span>
                <div className="w-full flex justify-center">
                  <div
                    className="w-full max-w-[48px] rounded-t-lg bg-[#7C3AED] transition-all"
                    style={{ height: `${Math.max((d.total / maxChart) * 160, 4)}px` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Transactions</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-700 dark:text-slate-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
              >
                <option value="all">All months</option>
                {CHART_MONTHS.slice().reverse().map((m) => (
                  <option key={m} value={m}>{MONTH_LABELS[m]}</option>
                ))}
              </select>
            </div>

            {/* Payout button */}
            <div className="relative">
              <button
                disabled
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Request Payout
              </button>
              {showTooltip && (
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
                  <Info className="w-3 h-3 inline mr-1" />
                  Payouts are disabled in demo mode
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction table */}
        <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#232536]">
                <th className="text-left text-xs font-medium text-slate-400 dark:text-slate-500 px-4 py-3">Date</th>
                <th className="text-left text-xs font-medium text-slate-400 dark:text-slate-500 px-4 py-3">Student</th>
                <th className="text-left text-xs font-medium text-slate-400 dark:text-slate-500 px-4 py-3">Subject</th>
                <th className="text-left text-xs font-medium text-slate-400 dark:text-slate-500 px-4 py-3">Duration</th>
                <th className="text-right text-xs font-medium text-slate-400 dark:text-slate-500 px-4 py-3">Amount</th>
                <th className="text-right text-xs font-medium text-slate-400 dark:text-slate-500 px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 dark:border-[#1a1d2e] last:border-0 hover:bg-slate-50 dark:hover:bg-[#1a1d2e] transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{t.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{t.studentName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{t.subject}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{t.durationMinutes}min</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white text-right">&pound;{t.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${statusBadge(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
              No transactions for this period.
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
