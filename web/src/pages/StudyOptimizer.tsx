import { useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import {
  Clock, Sparkles, Sun, Sunset, Moon, Shuffle,
  FileText, BookOpen, GraduationCap, Lightbulb,
  TrendingUp, Calendar, Share2, Printer, RotateCcw,
  Play, ChevronRight, CheckCircle2, Timer,
} from 'lucide-react'
import type { StudyScheduleData, StudyBlock } from '../services/demo-data'

// ── Constants ───────────────────────────────────────────────

const HOUR_OPTIONS = [1, 2, 3, 4, 5]
const DAY_PRESETS = [7, 14, 30, 60]
const AVAILABLE_SUBJECTS = ['Biology', 'Mathematics', 'Chemistry', 'Physics', 'English']
const PRIORITY_TOPICS = [
  'Microscopy', 'Membrane Transport', 'Enzyme Kinetics',
  'Cell Structure', 'Genetics Basics', 'Photosynthesis',
]
const PREFERRED_TIMES = [
  { value: 'Morning', icon: Sun, label: 'Morning' },
  { value: 'Afternoon', icon: Sunset, label: 'Afternoon' },
  { value: 'Evening', icon: Moon, label: 'Evening' },
  { value: 'Flexible', icon: Shuffle, label: 'Flexible' },
] as const

const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string; bg: string; darkBg: string; border: string }> = {
  practice: { icon: '📝', label: 'Practice Questions', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' },
  review: { icon: '📖', label: 'Review Notes', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50', darkBg: 'dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800' },
  exam: { icon: '🎯', label: 'Mock Exam', color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50', darkBg: 'dark:bg-orange-900/30', border: 'border-orange-200 dark:border-orange-800' },
  flashcards: { icon: '💡', label: 'Flashcards', color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50', darkBg: 'dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800' },
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ── Component ───────────────────────────────────────────────

export default function StudyOptimizer() {
  // Configuration state
  const [hoursPerDay, setHoursPerDay] = useState(2)
  const [daysUntilExam, setDaysUntilExam] = useState(14)
  const [subjects, setSubjects] = useState<string[]>(['Biology'])
  const [priorityTopics, setPriorityTopics] = useState<string[]>([
    'Microscopy', 'Membrane Transport', 'Enzyme Kinetics',
  ])
  const [preferredTime, setPreferredTime] = useState('Afternoon')

  // Schedule state
  const [schedule, setSchedule] = useState<StudyScheduleData | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'configure' | 'schedule'>('configure')

  const toggleSubject = (s: string) => {
    setSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  const toggleTopic = (t: string) => {
    setPriorityTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    )
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await api.post('/study-optimizer/generate', {
        hoursPerDay,
        daysUntilExam,
        subjects,
        priorityTopics,
        preferredTime,
      })
      setSchedule(res.data.data ?? res.data)
      setStep('schedule')
    } catch {
      // fallback
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = () => {
    setSchedule(null)
    setStep('configure')
  }

  const handlePrint = () => {
    window.print()
  }

  // Determine which day is "today" in the schedule
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const todaySchedule = schedule?.days.find((d) => d.day === todayName)

  return (
    <Layout>
      <div className="px-4 sm:px-6 py-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1E1B4B] dark:text-white">
                Study Time Optimizer
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                AI-powered study schedules tailored to your goals
              </p>
            </div>
          </div>
        </div>

        {step === 'configure' && (
          <ConfigureStep
            hoursPerDay={hoursPerDay}
            setHoursPerDay={setHoursPerDay}
            daysUntilExam={daysUntilExam}
            setDaysUntilExam={setDaysUntilExam}
            subjects={subjects}
            toggleSubject={toggleSubject}
            priorityTopics={priorityTopics}
            toggleTopic={toggleTopic}
            preferredTime={preferredTime}
            setPreferredTime={setPreferredTime}
            onGenerate={handleGenerate}
            loading={loading}
          />
        )}

        {step === 'schedule' && schedule && (
          <ScheduleView
            schedule={schedule}
            todaySchedule={todaySchedule}
            todayName={todayName}
            onRegenerate={handleRegenerate}
            onPrint={handlePrint}
          />
        )}
      </div>
    </Layout>
  )
}

// ── Configure Step ──────────────────────────────────────────

interface ConfigureProps {
  hoursPerDay: number
  setHoursPerDay: (v: number) => void
  daysUntilExam: number
  setDaysUntilExam: (v: number) => void
  subjects: string[]
  toggleSubject: (s: string) => void
  priorityTopics: string[]
  toggleTopic: (t: string) => void
  preferredTime: string
  setPreferredTime: (v: string) => void
  onGenerate: () => void
  loading: boolean
}

function ConfigureStep({
  hoursPerDay, setHoursPerDay,
  daysUntilExam, setDaysUntilExam,
  subjects, toggleSubject,
  priorityTopics, toggleTopic,
  preferredTime, setPreferredTime,
  onGenerate, loading,
}: ConfigureProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Hours per day */}
      <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
        <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-3">
          Available hours per day
        </label>
        <div className="flex gap-2 flex-wrap">
          {HOUR_OPTIONS.map((h) => (
            <button
              key={h}
              onClick={() => setHoursPerDay(h)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                hoursPerDay === h
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25'
                  : 'bg-slate-100 dark:bg-[#232536] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2a2d42]'
              }`}
            >
              {h === 5 ? '5+' : h}h
            </button>
          ))}
        </div>
      </div>

      {/* Days until exam */}
      <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
        <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-3">
          Days until exam
        </label>
        <div className="flex gap-2 flex-wrap">
          {DAY_PRESETS.map((d) => (
            <button
              key={d}
              onClick={() => setDaysUntilExam(d)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                daysUntilExam === d
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25'
                  : 'bg-slate-100 dark:bg-[#232536] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2a2d42]'
              }`}
            >
              {d} days
            </button>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={365}
              value={daysUntilExam}
              onChange={(e) => setDaysUntilExam(Number(e.target.value) || 14)}
              className="w-20 px-3 py-2.5 rounded-lg text-sm border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#232536] text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50"
            />
            <span className="text-xs text-slate-400">custom</span>
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
        <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-3">
          Subjects
        </label>
        <div className="flex gap-2 flex-wrap">
          {AVAILABLE_SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => toggleSubject(s)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                subjects.includes(s)
                  ? 'bg-[#EDE9FE] dark:bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA] border border-[#7C3AED]/30'
                  : 'bg-slate-100 dark:bg-[#232536] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2a2d42] border border-transparent'
              }`}
            >
              {subjects.includes(s) && <CheckCircle2 className="w-3.5 h-3.5" />}
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Priority topics */}
      <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
        <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-1">
          Priority topics
        </label>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
          Auto-suggested from your weak areas
        </p>
        <div className="flex gap-2 flex-wrap">
          {PRIORITY_TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => toggleTopic(t)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                priorityTopics.includes(t)
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-[#232536] text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2a2d42] border border-transparent'
              }`}
            >
              {priorityTopics.includes(t) && <CheckCircle2 className="w-3.5 h-3.5" />}
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred study time */}
      <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
        <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-3">
          Preferred study time
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PREFERRED_TIMES.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setPreferredTime(value)}
              className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                preferredTime === value
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25'
                  : 'bg-slate-100 dark:bg-[#232536] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2a2d42]'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={loading || subjects.length === 0}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-base transition-all shadow-lg shadow-[#7C3AED]/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating your schedule...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Schedule
          </>
        )}
      </button>
    </div>
  )
}

// ── Schedule View ───────────────────────────────────────────

interface ScheduleViewProps {
  schedule: StudyScheduleData
  todaySchedule: StudyScheduleData['days'][0] | undefined
  todayName: string
  onRegenerate: () => void
  onPrint: () => void
}

function ScheduleView({ schedule, todaySchedule, todayName, onRegenerate, onPrint }: ScheduleViewProps) {
  return (
    <div className="space-y-6">
      {/* Today's Schedule Card */}
      {todaySchedule && todaySchedule.blocks.length > 0 && (
        <TodayCard day={todaySchedule} />
      )}

      {/* Main grid: schedule + insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly timetable */}
        <div className="lg:col-span-2">
          <WeeklyTimetable days={schedule.days} todayName={todayName} />
        </div>

        {/* Insights sidebar */}
        <div className="space-y-4">
          <InsightsPanel insights={schedule.insights} />
          <TipsPanel />
          <ExportPanel onRegenerate={onRegenerate} onPrint={onPrint} />
        </div>
      </div>
    </div>
  )
}

// ── Today's Schedule Card ───────────────────────────────────

function TodayCard({ day }: { day: StudyScheduleData['days'][0] }) {
  const nextBlock = day.blocks[0]
  const cfg = TYPE_CONFIG[nextBlock?.type || 'practice']

  return (
    <div className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] rounded-xl p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-white/80" />
          <h2 className="font-bold text-lg">Today's Study Plan</h2>
        </div>
        <span className="text-sm text-white/70">{day.day}, {day.date}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {day.blocks.map((block, i) => {
          const bc = TYPE_CONFIG[block.type]
          return (
            <div
              key={i}
              className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{bc.icon}</span>
                <span className="text-xs text-white/70">{block.time} ({block.duration})</span>
              </div>
              <p className="font-semibold text-sm">{block.topic}</p>
              <p className="text-xs text-white/60">{bc.label}</p>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#7C3AED] rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors">
          <Play className="w-4 h-4" />
          Start Studying
        </button>
        <div className="flex items-center gap-1.5 text-sm text-white/70">
          <Timer className="w-4 h-4" />
          <span>Next: {nextBlock?.time}</span>
        </div>
      </div>
    </div>
  )
}

// ── Weekly Timetable ────────────────────────────────────────

function WeeklyTimetable({ days, todayName }: { days: StudyScheduleData['days']; todayName: string }) {
  return (
    <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 dark:border-[#232536]">
        <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#7C3AED]" />
          Weekly Schedule
        </h2>
      </div>

      {/* Desktop: horizontal grid */}
      <div className="hidden md:grid grid-cols-7 divide-x divide-slate-100 dark:divide-[#232536]">
        {days.map((day) => {
          const isToday = day.day === todayName
          return (
            <div
              key={day.day}
              className={`min-h-[220px] ${isToday ? 'bg-[#7C3AED]/5 dark:bg-[#7C3AED]/10' : ''}`}
            >
              {/* Day header */}
              <div className={`px-2 py-2 text-center border-b border-slate-100 dark:border-[#232536] ${
                isToday ? 'bg-[#7C3AED] text-white' : ''
              }`}>
                <p className={`text-xs font-bold ${isToday ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                  {DAY_LABELS[days.indexOf(day)]}
                </p>
                <p className={`text-[10px] ${isToday ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                  {day.date}
                </p>
              </div>

              {/* Blocks */}
              <div className="p-1.5 space-y-1.5">
                {day.blocks.map((block, i) => (
                  <BlockCard key={i} block={block} compact />
                ))}
                {day.blocks.length === 0 && (
                  <p className="text-[10px] text-slate-400 text-center py-4">Rest day</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical stack */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-[#232536]">
        {days.map((day) => {
          const isToday = day.day === todayName
          return (
            <div
              key={day.day}
              className={`p-3 ${isToday ? 'bg-[#7C3AED]/5 dark:bg-[#7C3AED]/10' : ''}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-bold ${isToday ? 'text-[#7C3AED]' : 'text-slate-700 dark:text-slate-300'}`}>
                  {day.day}
                </span>
                <span className="text-xs text-slate-400">{day.date}</span>
                {isToday && (
                  <span className="text-[10px] bg-[#7C3AED] text-white px-2 py-0.5 rounded-full font-medium">
                    Today
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {day.blocks.map((block, i) => (
                  <BlockCard key={i} block={block} compact={false} />
                ))}
                {day.blocks.length === 0 && (
                  <p className="text-xs text-slate-400">Rest day</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Block Card ──────────────────────────────────────────────

function BlockCard({ block, compact }: { block: StudyBlock; compact: boolean }) {
  const cfg = TYPE_CONFIG[block.type]

  if (compact) {
    return (
      <div className={`rounded-md p-1.5 border ${cfg.bg} ${cfg.darkBg} ${cfg.border}`}>
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-xs">{cfg.icon}</span>
          <span className={`text-[9px] font-medium ${cfg.color}`}>{block.duration}</span>
        </div>
        <p className={`text-[10px] font-semibold leading-tight ${cfg.color}`}>
          {block.topic}
        </p>
        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{block.time}</p>
      </div>
    )
  }

  return (
    <div className={`rounded-lg p-3 border ${cfg.bg} ${cfg.darkBg} ${cfg.border} flex items-start gap-3`}>
      <span className="text-xl mt-0.5">{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${cfg.color}`}>{block.topic}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{cfg.label}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{block.time}</p>
        <p className="text-[10px] text-slate-400">{block.duration}</p>
      </div>
    </div>
  )
}

// ── Insights Panel ──────────────────────────────────────────

function InsightsPanel({ insights }: { insights: StudyScheduleData['insights'] }) {
  const bars = [
    { label: 'Practice Questions', pct: insights.practiceQuestions, color: 'bg-blue-500' },
    { label: 'Review & Notes', pct: insights.reviewNotes, color: 'bg-emerald-500' },
    { label: 'Mock Exams', pct: insights.mockExams, color: 'bg-orange-500' },
    { label: 'Flashcards', pct: insights.flashcards, color: 'bg-purple-500' },
  ]

  return (
    <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
      <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-[#7C3AED]" />
        Schedule Breakdown
      </h3>

      {/* Horizontal bars */}
      <div className="space-y-3 mb-5">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-400">{b.label}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{b.pct}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-[#232536] rounded-full overflow-hidden">
              <div
                className={`h-full ${b.color} rounded-full transition-all duration-700`}
                style={{ width: `${b.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Grade improvement */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
            Estimated grade improvement
          </span>
        </div>
        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
          +{insights.estimatedImprovement}
        </p>
      </div>

      {/* Approach */}
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
        <span className="font-medium text-slate-600 dark:text-slate-300">Your approach:</span>{' '}
        {insights.approach}
      </p>
    </div>
  )
}

// ── Tips Panel ──────────────────────────────────────────────

function TipsPanel() {
  const tips = [
    { icon: Timer, text: 'Take a 5-minute break every 25 minutes (Pomodoro)' },
    { icon: Lightbulb, text: 'Review flashcards before bed for better retention' },
    { icon: GraduationCap, text: 'Do mock exams under timed conditions' },
  ]

  return (
    <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
      <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        Study Tips
      </h3>
      <div className="space-y-3">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <tip.icon className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{tip.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Export Panel ─────────────────────────────────────────────

function ExportPanel({ onRegenerate, onPrint }: { onRegenerate: () => void; onPrint: () => void }) {
  return (
    <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
      <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3">Actions</h3>
      <div className="space-y-2">
        <button
          onClick={() => {/* placeholder for .ics download */}}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#232536] hover:bg-slate-100 dark:hover:bg-[#2a2d42] transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Add to Calendar
        </button>
        <button
          onClick={() => {/* placeholder */}}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#232536] hover:bg-slate-100 dark:hover:bg-[#2a2d42] transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share with Tutor
        </button>
        <button
          onClick={onPrint}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#232536] hover:bg-slate-100 dark:hover:bg-[#2a2d42] transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Schedule
        </button>
        <button
          onClick={onRegenerate}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#7C3AED] bg-[#EDE9FE] dark:bg-[#7C3AED]/20 hover:bg-[#DDD6FE] dark:hover:bg-[#7C3AED]/30 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Regenerate Schedule
        </button>
      </div>
    </div>
  )
}
