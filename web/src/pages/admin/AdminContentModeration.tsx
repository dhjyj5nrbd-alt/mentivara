import { useState } from 'react'
import Layout from '../../components/Layout'
import {
  Flag, AlertTriangle, MessageSquare, Clapperboard, Mail,
  Check, X, Shield, Eye, Trash2, UserX, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight,
} from 'lucide-react'

// ── Demo Data ──────────────────────────────────────────────
interface ReportedItem {
  id: number
  type: 'forum_post' | 'reel' | 'message'
  contentPreview: string
  author: string
  authorAvatar: string
  reportedBy: string
  reason: string
  date: string
  status: 'pending' | 'dismissed' | 'removed' | 'warned' | 'suspended'
}

const INITIAL_REPORTS: ReportedItem[] = [
  {
    id: 1, type: 'forum_post',
    contentPreview: 'This post contains misleading study advice about skipping revision and using only past papers...',
    author: 'Jake Morrison', authorAvatar: 'JM', reportedBy: 'Emma Williams',
    reason: 'Misleading information', date: '2026-03-23', status: 'pending',
  },
  {
    id: 2, type: 'reel',
    contentPreview: 'Reel titled "FASTEST way to pass A-Levels" with clickbait content and unverified claims...',
    author: 'Unknown Tutor', authorAvatar: 'UT', reportedBy: 'Dr Sarah Mitchell',
    reason: 'Spam / Clickbait', date: '2026-03-23', status: 'pending',
  },
  {
    id: 3, type: 'message',
    contentPreview: 'Direct message containing external tutoring service advertisement with links...',
    author: 'Richard Lee', authorAvatar: 'RL', reportedBy: 'Alex Johnson',
    reason: 'External advertising', date: '2026-03-22', status: 'pending',
  },
  {
    id: 4, type: 'forum_post',
    contentPreview: 'Aggressive response to a student asking for help with trigonometry, including personal attacks...',
    author: 'Mike Chen', authorAvatar: 'MC', reportedBy: 'Oliver Brown',
    reason: 'Harassment / Bullying', date: '2026-03-22', status: 'pending',
  },
  {
    id: 5, type: 'reel',
    contentPreview: 'Reel containing copyrighted exam material from AQA without permission...',
    author: 'Sarah Blake', authorAvatar: 'SB', reportedBy: 'System (Auto-detected)',
    reason: 'Copyright violation', date: '2026-03-21', status: 'pending',
  },
  {
    id: 6, type: 'forum_post',
    contentPreview: 'Post sharing leaked exam questions claiming they are from the upcoming June 2026 session...',
    author: 'Anonymous_123', authorAvatar: 'A1', reportedBy: 'Multiple users',
    reason: 'Exam malpractice', date: '2026-03-21', status: 'pending',
  },
  {
    id: 7, type: 'message',
    contentPreview: 'Repeated unsolicited messages to multiple students offering paid essay writing services...',
    author: 'Dave Roberts', authorAvatar: 'DR', reportedBy: 'Mia Patel',
    reason: 'Academic dishonesty', date: '2026-03-20', status: 'pending',
  },
  {
    id: 8, type: 'reel',
    contentPreview: 'Biology reel with incorrect diagram labelling that could mislead students studying for exams...',
    author: 'Tom K.', authorAvatar: 'TK', reportedBy: 'James Chen',
    reason: 'Inaccurate content', date: '2026-03-20', status: 'pending',
  },
  {
    id: 9, type: 'forum_post',
    contentPreview: 'Posting personal contact details and social media handles soliciting off-platform tutoring...',
    author: 'Nina Patel', authorAvatar: 'NP', reportedBy: 'System (Auto-detected)',
    reason: 'Off-platform solicitation', date: '2026-03-19', status: 'pending',
  },
  {
    id: 10, type: 'message',
    contentPreview: 'Message with inappropriate language and threats directed at another student...',
    author: 'Chris Taylor', authorAvatar: 'CT', reportedBy: 'Sophia Davis',
    reason: 'Threats / Inappropriate language', date: '2026-03-19', status: 'pending',
  },
]

const TYPE_ICONS: Record<string, typeof Flag> = {
  forum_post: MessageSquare,
  reel: Clapperboard,
  message: Mail,
}

const TYPE_LABELS: Record<string, string> = {
  forum_post: 'Forum Post',
  reel: 'Reel',
  message: 'Message',
}

export default function AdminContentModeration() {
  const [reports, setReports] = useState(INITIAL_REPORTS)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [aiFilterEnabled, setAiFilterEnabled] = useState(true)
  const [profanityFilterEnabled, setProfanityFilterEnabled] = useState(true)
  const [spamFilterEnabled, setSpamFilterEnabled] = useState(true)

  const updateStatus = (id: number, status: ReportedItem['status']) => {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
  }

  const pendingCount = reports.filter((r) => r.status === 'pending').length

  const filtered = reports.filter((r) => {
    const matchType = typeFilter === 'all' || r.type === typeFilter
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchType && matchStatus
  })

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      dismissed: 'bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400',
      removed: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      warned: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    }
    return colors[s] || 'bg-slate-100 text-slate-600'
  }

  const typeBadge = (t: string) => {
    const colors: Record<string, string> = {
      forum_post: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      reel: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      message: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    }
    return colors[t] || 'bg-slate-100 text-slate-600'
  }

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1E1B4B] dark:text-white flex items-center gap-2">
              Content Moderation
              {pendingCount > 0 && (
                <span className="text-sm bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2.5 py-0.5 rounded-full font-medium">
                  {pendingCount} pending
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review reported content and manage moderation settings</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Stats */}
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Flag className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Report Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Pending</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">{reports.filter((r) => r.status === 'pending').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Dismissed</span>
                <span className="font-medium text-slate-600 dark:text-slate-400">{reports.filter((r) => r.status === 'dismissed').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Content Removed</span>
                <span className="font-medium text-red-600 dark:text-red-400">{reports.filter((r) => r.status === 'removed').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Users Warned</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">{reports.filter((r) => r.status === 'warned').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Users Suspended</span>
                <span className="font-medium text-red-700 dark:text-red-400">{reports.filter((r) => r.status === 'suspended').length}</span>
              </div>
            </div>
          </div>

          {/* Auto-moderation Settings */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-[#7C3AED]" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Auto-Moderation Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">AI Content Filtering</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Automatically flag content using AI analysis</p>
                </div>
                <button onClick={() => setAiFilterEnabled(!aiFilterEnabled)} className="text-[#7C3AED]">
                  {aiFilterEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Profanity Filter</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Block messages containing profanity</p>
                </div>
                <button onClick={() => setProfanityFilterEnabled(!profanityFilterEnabled)} className="text-[#7C3AED]">
                  {profanityFilterEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Spam Detection</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Auto-flag repetitive or promotional content</p>
                </div>
                <button onClick={() => setSpamFilterEnabled(!spamFilterEnabled)} className="text-[#7C3AED]">
                  {spamFilterEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-[#2d3048] rounded-lg text-sm bg-white dark:bg-[#252839] dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="forum_post">Forum Posts</option>
            <option value="reel">Reels</option>
            <option value="message">Messages</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-[#2d3048] rounded-lg text-sm bg-white dark:bg-[#252839] dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="dismissed">Dismissed</option>
            <option value="removed">Removed</option>
            <option value="warned">Warned</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Reports List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536]">
            <Check className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No reports in this category. All clear!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((report) => {
              const TypeIcon = TYPE_ICONS[report.type] || Flag
              return (
                <div key={report.id} className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] text-xs font-semibold shrink-0">
                        {report.authorAvatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium text-slate-900 dark:text-white">{report.author}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadge(report.type)}`}>
                            <TypeIcon className="w-3 h-3 inline mr-0.5" />
                            {TYPE_LABELS[report.type]}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusBadge(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">{report.contentPreview}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                          <span>Reported by: {report.reportedBy}</span>
                          <span>Reason: <strong className="text-slate-600 dark:text-slate-400">{report.reason}</strong></span>
                          <span>{new Date(report.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252839] text-slate-400 transition-colors shrink-0"
                      >
                        {expandedId === report.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Expanded view */}
                    {expandedId === report.id && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#232536]">
                        <div className="bg-slate-50 dark:bg-[#252839] rounded-lg p-4 mb-4">
                          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Full Content</h4>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{report.contentPreview}</p>
                        </div>
                      </div>
                    )}

                    {/* Actions for pending reports */}
                    {report.status === 'pending' && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-[#232536]">
                        <button
                          onClick={() => updateStatus(report.id, 'dismissed')}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-300 dark:border-[#2d3048] text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors"
                        >
                          <Eye className="w-3 h-3" /> Dismiss Report
                        </button>
                        <button
                          onClick={() => updateStatus(report.id, 'removed')}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Remove Content
                        </button>
                        <button
                          onClick={() => updateStatus(report.id, 'warned')}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                        >
                          <AlertTriangle className="w-3 h-3" /> Warn User
                        </button>
                        <button
                          onClick={() => updateStatus(report.id, 'suspended')}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                        >
                          <UserX className="w-3 h-3" /> Suspend User
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
