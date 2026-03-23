import { useState } from 'react'
import Layout from '../../components/Layout'
import {
  Check, X, Clock, ChevronDown, ChevronUp, Mail, ExternalLink,
  FileText, GraduationCap, MessageSquare, Filter,
} from 'lucide-react'

// ── Demo Data ──────────────────────────────────────────────
interface TutorApplication {
  id: number
  name: string
  email: string
  avatar: string
  subjects: string[]
  qualifications: string
  bio: string
  appliedDate: string
  introVideoUrl: string
  documentsCount: number
  experience: string
  status: 'pending' | 'approved' | 'rejected' | 'info_requested'
  rejectionReason?: string
}

const INITIAL_APPLICATIONS: TutorApplication[] = [
  {
    id: 1, name: 'Dr Mark Thompson', email: 'mark.t@example.com', avatar: 'MT',
    subjects: ['Mathematics', 'Further Mathematics'],
    qualifications: 'PhD Mathematics (Imperial College), PGCE, 10 years teaching experience',
    bio: 'Experienced mathematics lecturer passionate about helping students achieve top grades. I specialise in A-Level and Further Maths with a track record of 95% A*-A rate.',
    appliedDate: '2026-03-20', introVideoUrl: 'https://example.com/intro-mark', documentsCount: 4,
    experience: '10 years university lecturing, 3 years private tutoring', status: 'pending',
  },
  {
    id: 2, name: 'Anna Kowalski', email: 'anna.k@example.com', avatar: 'AK',
    subjects: ['Chemistry', 'Biology'],
    qualifications: 'MSc Biochemistry (UCL), QTS, Enhanced DBS',
    bio: 'Science teacher with a passion for making complex topics accessible. I use hands-on experiments and visual aids to help students understand challenging concepts.',
    appliedDate: '2026-03-19', introVideoUrl: 'https://example.com/intro-anna', documentsCount: 3,
    experience: '5 years secondary school, 2 years tutoring', status: 'pending',
  },
  {
    id: 3, name: 'Samuel Okafor', email: 'samuel.o@example.com', avatar: 'SO',
    subjects: ['Physics', 'Mathematics'],
    qualifications: 'MEng Engineering (Cambridge), PGCE Physics',
    bio: 'Engineering background with a gift for explaining physics through real-world applications. Keen to help aspiring engineers and scientists.',
    appliedDate: '2026-03-18', introVideoUrl: 'https://example.com/intro-samuel', documentsCount: 5,
    experience: '4 years engineering, 3 years tutoring', status: 'pending',
  },
  {
    id: 4, name: 'Priya Sharma', email: 'priya.s@example.com', avatar: 'PS',
    subjects: ['English Literature', 'English Language'],
    qualifications: 'BA English (Oxford), MA Creative Writing, Published Author',
    bio: 'Published author and English specialist. I help students develop critical thinking and essay-writing skills that go beyond exam preparation.',
    appliedDate: '2026-03-17', introVideoUrl: '', documentsCount: 2,
    experience: '6 years teaching, 4 years tutoring', status: 'pending',
  },
  {
    id: 5, name: 'Tom Andrews', email: 'tom.a@example.com', avatar: 'TA',
    subjects: ['Computer Science'],
    qualifications: 'BSc Computer Science (Edinburgh), AWS Certified',
    bio: 'Software developer turned educator. I teach programming, algorithms, and computer science theory using practical coding examples.',
    appliedDate: '2026-03-15', introVideoUrl: 'https://example.com/intro-tom', documentsCount: 3,
    experience: '8 years software development, 1 year tutoring', status: 'pending',
  },
  {
    id: 6, name: 'Claire Dubois', email: 'claire.d@example.com', avatar: 'CD',
    subjects: ['French', 'Spanish'],
    qualifications: 'BA Modern Languages (Durham), CELTA, Native French Speaker',
    bio: 'Native French speaker with fluency in Spanish. I focus on conversational skills and cultural understanding alongside exam preparation.',
    appliedDate: '2026-03-14', introVideoUrl: 'https://example.com/intro-claire', documentsCount: 4,
    experience: '7 years language teaching', status: 'pending',
  },
]

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected', 'info_requested'] as const

export default function PendingTutors() {
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [rejectReasonId, setRejectReasonId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [infoRequestId, setInfoRequestId] = useState<number | null>(null)
  const [infoMessage, setInfoMessage] = useState('')

  const approve = (id: number) => {
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: 'approved' as const } : a))
    setExpandedId(null)
  }

  const reject = (id: number) => {
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: 'rejected' as const, rejectionReason: rejectReason } : a))
    setRejectReasonId(null)
    setRejectReason('')
  }

  const requestInfo = (id: number) => {
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: 'info_requested' as const } : a))
    setInfoRequestId(null)
    setInfoMessage('')
  }

  const filtered = statusFilter === 'all' ? applications : applications.filter((a) => a.status === statusFilter)

  const pendingCount = applications.filter((a) => a.status === 'pending').length

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info_requested: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  }

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1E1B4B] dark:text-white">Tutor Applications</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {pendingCount} pending application{pendingCount !== 1 ? 's' : ''} to review
            </p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-[#252839] p-1 rounded-lg w-fit">
          {STATUS_FILTERS.map((f) => {
            const count = f === 'all' ? applications.length : applications.filter((a) => a.status === f).length
            const label = f === 'info_requested' ? 'Info Requested' : f
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${
                  statusFilter === f
                    ? 'bg-white dark:bg-[#1a1d2e] text-[#7C3AED] font-medium shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                {label} {count > 0 && <span className="text-xs opacity-60">({count})</span>}
              </button>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536]">
            <GraduationCap className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No applications in this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((app) => (
              <div key={app.id} className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] overflow-hidden">
                {/* Header */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] font-bold text-sm shrink-0">
                      {app.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{app.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[app.status]}`}>
                          {app.status === 'info_requested' ? 'Info Requested' : app.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{app.email}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {app.subjects.map((s) => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                            {s}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">{app.bio}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400 dark:text-slate-500">Applied</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(app.appliedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                      <button
                        onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                        className="mt-2 text-xs text-[#7C3AED] hover:underline flex items-center gap-0.5"
                      >
                        {expandedId === app.id ? 'Less' : 'More'}
                        {expandedId === app.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Review Panel */}
                  {expandedId === app.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#232536]">
                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Qualifications</h4>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{app.qualifications}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Experience</h4>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{app.experience}</p>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Full Bio</h4>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{app.bio}</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Documents & Media</h4>
                          {app.introVideoUrl ? (
                            <a href={app.introVideoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#7C3AED] hover:underline flex items-center gap-1">
                              <ExternalLink className="w-3.5 h-3.5" /> Watch Intro Video
                            </a>
                          ) : (
                            <p className="text-sm text-slate-400 dark:text-slate-500 italic">No intro video provided</p>
                          )}
                          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" /> {app.documentsCount} qualification document{app.documentsCount !== 1 ? 's' : ''} uploaded
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {app.status === 'pending' && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-[#232536]">
                      <button
                        onClick={() => approve(app.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => { setRejectReasonId(app.id); setRejectReason('') }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                      <button
                        onClick={() => { setInfoRequestId(app.id); setInfoMessage('') }}
                        className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 dark:border-[#2d3048] text-slate-700 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" /> Request More Info
                      </button>
                    </div>
                  )}

                  {app.status === 'approved' && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#232536]">
                      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                        <Check className="w-4 h-4" /> Approved — Welcome email sent
                      </div>
                    </div>
                  )}

                  {app.status === 'rejected' && app.rejectionReason && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#232536]">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        <strong>Rejection reason:</strong> {app.rejectionReason}
                      </p>
                    </div>
                  )}

                  {app.status === 'info_requested' && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#232536]">
                      <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                        <Mail className="w-4 h-4" /> Additional information requested — awaiting response
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectReasonId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Reject Application</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Please provide a reason for rejecting {applications.find((a) => a.id === rejectReasonId)?.name}'s application.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-[#2d3048] rounded-lg text-sm bg-white dark:bg-[#252839] dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none"
            />
            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => setRejectReasonId(null)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252839] rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={() => reject(rejectReasonId)}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Info Modal */}
      {infoRequestId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Request More Information</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              What additional information do you need from {applications.find((a) => a.id === infoRequestId)?.name}?
            </p>
            <textarea
              value={infoMessage}
              onChange={(e) => setInfoMessage(e.target.value)}
              placeholder="e.g., Please provide DBS certificate, teaching references..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-[#2d3048] rounded-lg text-sm bg-white dark:bg-[#252839] dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none"
            />
            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => setInfoRequestId(null)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252839] rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={() => requestInfo(infoRequestId)}
                disabled={!infoMessage.trim()}
                className="px-4 py-2 text-sm bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-colors disabled:opacity-50"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
