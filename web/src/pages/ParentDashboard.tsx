import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { PARENT_DASHBOARD_DATA } from '../services/demo-data'
import {
  BookOpen, CheckCircle, XCircle, Calendar, Clock, ChevronDown, ChevronUp,
  MessageSquare, TrendingUp, TrendingDown, Minus, AlertTriangle,
  BarChart3, Send, Eye, ArrowUpRight,
} from 'lucide-react'

type LessonStatus = 'attended' | 'missed' | 'upcoming'
type HomeworkStatus = 'completed' | 'in_progress' | 'not_started'
type Trend = 'improving' | 'stable' | 'declining'

const data = PARENT_DASHBOARD_DATA

function StatusBadge({ status }: { status: LessonStatus }) {
  switch (status) {
    case 'attended':
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Attended</span>
    case 'missed':
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> Missed</span>
    case 'upcoming':
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full"><Calendar className="w-3 h-3" /> Upcoming</span>
  }
}

function HomeworkStatusBadge({ status }: { status: HomeworkStatus }) {
  switch (status) {
    case 'completed':
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"><CheckCircle className="w-3.5 h-3.5" /> Completed</span>
    case 'in_progress':
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400"><Clock className="w-3.5 h-3.5" /> In Progress</span>
    case 'not_started':
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-400"><XCircle className="w-3.5 h-3.5" /> Not Started</span>
  }
}

function TrendIcon({ trend }: { trend: Trend }) {
  switch (trend) {
    case 'improving':
      return <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><TrendingUp className="w-3.5 h-3.5" /> Improving</span>
    case 'stable':
      return <span className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-500 dark:text-slate-400"><Minus className="w-3.5 h-3.5" /> Stable</span>
    case 'declining':
      return <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600 dark:text-red-400"><TrendingDown className="w-3.5 h-3.5" /> Declining</span>
  }
}

function ProgressRing({ percent, size = 48, stroke = 4 }: { percent: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-slate-200 dark:text-slate-700" />
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-[#7C3AED] transition-all duration-700" />
    </svg>
  )
}

function ProgressBar({ percent, color = 'bg-[#7C3AED]' }: { percent: number; color?: string }) {
  return (
    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.min(100, percent)}%` }} />
    </div>
  )
}

function StudyChart({ data: activityData }: { data: typeof data.studyActivity }) {
  const maxHours = Math.max(...activityData.map((d) => d.hours), 2)
  const avgHours = activityData.reduce((sum, d) => sum + d.hours, 0) / activityData.length

  return (
    <div>
      <div className="flex items-end gap-2 h-32 mb-2">
        {activityData.map((d) => {
          const heightPercent = maxHours > 0 ? (d.hours / maxHours) * 100 : 0
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{d.hours}h</span>
              <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                <div
                  className={`w-full max-w-[32px] rounded-t-md transition-all duration-500 ${d.hours === 0 ? 'bg-slate-200 dark:bg-slate-700' : 'bg-[#7C3AED]'}`}
                  style={{ height: `${Math.max(heightPercent, 4)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{d.day}</span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
        <span>Average: <strong className="text-slate-700 dark:text-slate-300">{avgHours.toFixed(1)}h/day</strong></span>
        <span>Recommended: <strong className="text-[#7C3AED]">2h/day</strong></span>
      </div>
    </div>
  )
}

export default function ParentDashboard() {
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null)
  const attendancePercent = Math.round((data.stats.lessonsAttended / data.stats.lessonsTotal) * 100)

  return (
    <Layout>
      <div className="px-4 sm:px-6 py-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E1B4B] dark:text-white">Parent Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Viewing: <strong className="text-slate-700 dark:text-slate-300">{data.child.name}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#1a1d2e] px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            {data.child.name.split(' ')[0]} last active: {data.child.lastActive}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {/* Lessons This Week */}
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Lessons This Week</span>
              <div className="relative w-12 h-12 flex items-center justify-center">
                <ProgressRing percent={attendancePercent} />
                <span className="absolute text-[10px] font-bold text-slate-700 dark:text-slate-300">{attendancePercent}%</span>
              </div>
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-white">{data.stats.lessonsAttended} of {data.stats.lessonsTotal}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">attended</p>
          </div>

          {/* Homework Completion */}
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-4">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Homework</span>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2">{data.stats.homeworkCompletion}%</p>
            <ProgressBar percent={data.stats.homeworkCompletion} color="bg-emerald-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">completion rate</p>
          </div>

          {/* Study Streak */}
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-4">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Study Streak</span>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
              <span className="mr-1" role="img" aria-label="fire">&#128293;</span>
              {data.stats.streak} days
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">consecutive study days</p>
          </div>

          {/* Overall Progress */}
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-4">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Overall Progress</span>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2">{data.stats.overallProgress}%</p>
            <ProgressBar percent={data.stats.overallProgress} />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Grade {data.stats.predictedGrade} predicted</p>
          </div>
        </div>

        {/* Recent Lessons */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-[#7C3AED]" />
            <h2 className="text-base font-bold text-[#1E1B4B] dark:text-white">Recent Lessons</h2>
          </div>
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] divide-y divide-slate-100 dark:divide-[#232536]">
            {data.recentLessons.map((lesson) => {
              const isExpanded = expandedLesson === lesson.id
              const canExpand = lesson.status === 'attended'
              return (
                <div key={lesson.id}>
                  <button
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors"
                    onClick={() => canExpand && setExpandedLesson(isExpanded ? null : lesson.id)}
                    disabled={!canExpand}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-800 dark:text-white">{lesson.subject}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">with {lesson.tutorName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <span>{lesson.date}, {lesson.time}</span>
                        <span>&#183;</span>
                        <span>{lesson.duration}</span>
                      </div>
                    </div>
                    <StatusBadge status={lesson.status} />
                    {canExpand && (
                      isExpanded
                        ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isExpanded && lesson.status === 'attended' && (
                    <div className="px-4 pb-4 bg-slate-50 dark:bg-[#151724] border-t border-slate-100 dark:border-[#232536]">
                      <div className="pt-3 space-y-3">
                        {/* AI Summary */}
                        <div>
                          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Lesson Summary</h4>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{lesson.summary}</p>
                        </div>
                        {/* Topics */}
                        {lesson.topicsCovered.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Topics Covered</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {lesson.topicsCovered.map((topic) => (
                                <span key={topic} className="text-xs bg-[#EDE9FE] dark:bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA] px-2 py-0.5 rounded-full">{topic}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Homework */}
                        {lesson.homeworkAssigned && (
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Homework Assigned</h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{lesson.homeworkAssigned}</p>
                          </div>
                        )}
                        {/* Tutor Notes */}
                        {lesson.tutorNotes && (
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Tutor Feedback</h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 italic">&ldquo;{lesson.tutorNotes}&rdquo;</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Missed reason */}
                  {lesson.status === 'missed' && 'missedReason' in lesson && (lesson as any).missedReason && (
                    <div className="px-4 pb-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Reason: {(lesson as any).missedReason}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Homework Tracker */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-[#7C3AED]" />
            <h2 className="text-base font-bold text-[#1E1B4B] dark:text-white">Homework Tracker</h2>
          </div>
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-5 gap-2 px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-[#232536]">
              <span>Subject</span>
              <span>Assignment</span>
              <span>Due Date</span>
              <span>Status</span>
              <span>Score</span>
            </div>
            {data.homework.map((hw) => {
              const rowBg = hw.status === 'completed'
                ? 'border-l-4 border-l-emerald-500'
                : hw.status === 'in_progress'
                  ? 'border-l-4 border-l-amber-500'
                  : 'border-l-4 border-l-red-500'
              return (
                <div key={hw.id} className={`${rowBg} px-4 py-3 sm:grid sm:grid-cols-5 sm:gap-2 sm:items-center border-b border-slate-50 dark:border-[#232536] last:border-b-0`}>
                  <span className="text-sm font-medium text-slate-800 dark:text-white">{hw.subject}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">{hw.assignment}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{hw.dueDate}</span>
                  <HomeworkStatusBadge status={hw.status} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{hw.score ?? '—'}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Progress & Performance */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-[#7C3AED]" />
            <h2 className="text-base font-bold text-[#1E1B4B] dark:text-white">Progress & Performance</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.subjects.map((subject) => {
              const gradeColor = subject.predictedGrade === 'B'
                ? 'text-emerald-600 dark:text-emerald-400'
                : subject.predictedGrade === 'C'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
              const barColor = subject.predictedGrade === 'B'
                ? 'bg-emerald-500'
                : subject.predictedGrade === 'C'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              return (
                <div key={subject.name} className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{subject.name}</h3>
                    <span className={`text-lg font-bold ${gradeColor}`}>Grade {subject.predictedGrade}</span>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>Mastery</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{subject.mastery}%</span>
                    </div>
                    <ProgressBar percent={subject.mastery} color={barColor} />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <TrendIcon trend={subject.trend} />
                  </div>
                  {subject.weakTopics.length > 0 && (
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1">Needs work</p>
                      <div className="flex flex-wrap gap-1">
                        {subject.weakTopics.map((t) => (
                          <span key={t} className="text-[10px] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Two-column: Tutor Communications + Study Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
          {/* Tutor Communications */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
              <h2 className="text-base font-bold text-[#1E1B4B] dark:text-white">Tutor Communications</h2>
            </div>
            <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] divide-y divide-slate-100 dark:divide-[#232536]">
              {data.tutorMessages.map((msg) => (
                <div key={msg.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] text-xs font-bold">
                      {msg.tutorName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{msg.tutorName}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{msg.timestamp}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{msg.message}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Study Activity */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-[#7C3AED]" />
              <h2 className="text-base font-bold text-[#1E1B4B] dark:text-white">Study Activity (Past 7 Days)</h2>
            </div>
            <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-4">
              <StudyChart data={data.studyActivity} />
            </div>
          </section>
        </div>

        {/* Quick Actions */}
        <section className="mb-6">
          <h2 className="text-base font-bold text-[#1E1B4B] dark:text-white mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/messages/conversations"
              className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              Message Tutor
            </Link>
            <Link
              to="/knowledge-map"
              className="inline-flex items-center gap-2 bg-white dark:bg-[#1a1d2e] hover:bg-slate-50 dark:hover:bg-[#252839] text-slate-700 dark:text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-lg border border-slate-200 dark:border-[#232536] transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Full Progress Report
            </Link>
            <Link
              to="/tutors"
              className="inline-flex items-center gap-2 bg-white dark:bg-[#1a1d2e] hover:bg-slate-50 dark:hover:bg-[#252839] text-slate-700 dark:text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-lg border border-slate-200 dark:border-[#232536] transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
              Book Additional Lessons
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  )
}
