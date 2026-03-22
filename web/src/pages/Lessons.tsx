import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar, Clock, ChevronLeft, ChevronRight, List, Grid3X3,
  Play, X, BookOpen,
} from 'lucide-react'
import Layout from '../components/Layout'

const LOCALE = navigator.language || LOCALE

// ── Tutor photos (same pattern as TutorDirectory) ──────────
const TUTOR_PHOTOS: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  3: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
  4: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
}

// ── Subject colour coding ──────────────────────────────────
const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string; darkBg: string; darkBorder: string; darkText: string; dot: string; leftBorder: string; darkLeftBorder: string }> = {
  Mathematics: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', darkBg: 'dark:bg-blue-900/20', darkBorder: 'dark:border-blue-800', darkText: 'dark:text-blue-300', dot: 'bg-blue-500', leftBorder: 'border-l-blue-500', darkLeftBorder: 'dark:border-l-blue-400' },
  English:     { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', darkBg: 'dark:bg-amber-900/20', darkBorder: 'dark:border-amber-800', darkText: 'dark:text-amber-300', dot: 'bg-amber-500', leftBorder: 'border-l-amber-500', darkLeftBorder: 'dark:border-l-amber-400' },
  Biology:     { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', darkBg: 'dark:bg-green-900/20', darkBorder: 'dark:border-green-800', darkText: 'dark:text-green-300', dot: 'bg-green-500', leftBorder: 'border-l-green-500', darkLeftBorder: 'dark:border-l-green-400' },
  Chemistry:   { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', darkBg: 'dark:bg-purple-900/20', darkBorder: 'dark:border-purple-800', darkText: 'dark:text-purple-300', dot: 'bg-purple-500', leftBorder: 'border-l-purple-500', darkLeftBorder: 'dark:border-l-purple-400' },
  Physics:     { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', darkBg: 'dark:bg-orange-900/20', darkBorder: 'dark:border-orange-800', darkText: 'dark:text-orange-300', dot: 'bg-orange-500', leftBorder: 'border-l-orange-500', darkLeftBorder: 'dark:border-l-orange-400' },
}

function getSubjectColor(subject: string) {
  return SUBJECT_COLORS[subject] ?? SUBJECT_COLORS['Mathematics']
}

// ── Demo lesson data ───────────────────────────────────────
interface DemoLesson {
  id: number
  subject: string
  tutorName: string
  tutorId: number
  date: Date
  durationMinutes: number
  status: 'scheduled' | 'completed' | 'in_progress'
  notes: string
}

function buildDemoLessons(): DemoLesson[] {
  const now = new Date()
  const monday = getMonday(now)

  const lessons: DemoLesson[] = [
    // ── This week ───────────────────────────────
    { id: 1, subject: 'Mathematics', tutorName: 'Dr Sarah Mitchell', tutorId: 1, date: setTime(addDays(monday, 0), 10, 0), durationMinutes: 60, status: 'scheduled', notes: 'Quadratic equations and graphing' },
    { id: 2, subject: 'Physics', tutorName: 'Dr Raj Patel', tutorId: 4, date: setTime(addDays(monday, 0), 14, 0), durationMinutes: 60, status: 'scheduled', notes: 'Newtons laws of motion' },
    { id: 3, subject: 'English', tutorName: 'Emma Richardson', tutorId: 3, date: setTime(addDays(monday, 2), 9, 30), durationMinutes: 60, status: 'scheduled', notes: 'Poetry analysis techniques' },
    { id: 4, subject: 'Biology', tutorName: 'James Chen', tutorId: 2, date: setTime(addDays(monday, 2), 15, 0), durationMinutes: 60, status: 'completed', notes: 'Cell division and mitosis' },
    { id: 5, subject: 'Mathematics', tutorName: 'Dr Sarah Mitchell', tutorId: 1, date: setTime(addDays(monday, 4), 11, 0), durationMinutes: 60, status: 'scheduled', notes: 'Trigonometry revision' },
    { id: 6, subject: 'Chemistry', tutorName: 'James Chen', tutorId: 2, date: setTime(addDays(monday, 5), 10, 0), durationMinutes: 90, status: 'scheduled', notes: 'Organic chemistry intro' },

    // ── Next week (upcoming) ─────────────────────
    { id: 13, subject: 'Mathematics', tutorName: 'Dr Sarah Mitchell', tutorId: 1, date: setTime(addDays(monday, 7), 10, 0), durationMinutes: 60, status: 'scheduled', notes: 'Completing the square' },
    { id: 14, subject: 'Physics', tutorName: 'Dr Raj Patel', tutorId: 4, date: setTime(addDays(monday, 7), 14, 0), durationMinutes: 60, status: 'scheduled', notes: 'Energy and work done' },
    { id: 15, subject: 'English', tutorName: 'Emma Richardson', tutorId: 3, date: setTime(addDays(monday, 9), 9, 30), durationMinutes: 60, status: 'scheduled', notes: 'Unseen poetry practice' },
    { id: 16, subject: 'Biology', tutorName: 'James Chen', tutorId: 2, date: setTime(addDays(monday, 9), 15, 0), durationMinutes: 60, status: 'scheduled', notes: 'Photosynthesis revision' },
    { id: 17, subject: 'Mathematics', tutorName: 'Dr Sarah Mitchell', tutorId: 1, date: setTime(addDays(monday, 11), 11, 0), durationMinutes: 60, status: 'scheduled', notes: 'Simultaneous equations' },
    { id: 18, subject: 'Chemistry', tutorName: 'James Chen', tutorId: 2, date: setTime(addDays(monday, 12), 10, 0), durationMinutes: 90, status: 'scheduled', notes: 'Rates of reaction' },

    // ── Last week (completed) ───────────────────
    { id: 7, subject: 'Mathematics', tutorName: 'Dr Sarah Mitchell', tutorId: 1, date: setTime(addDays(monday, -7), 10, 0), durationMinutes: 60, status: 'completed', notes: 'Linear equations' },
    { id: 8, subject: 'English', tutorName: 'Emma Richardson', tutorId: 3, date: setTime(addDays(monday, -5), 9, 30), durationMinutes: 60, status: 'completed', notes: 'Essay structure workshop' },
    { id: 9, subject: 'Physics', tutorName: 'Dr Raj Patel', tutorId: 4, date: setTime(addDays(monday, -7), 14, 0), durationMinutes: 60, status: 'completed', notes: 'Forces and vectors' },

    // ── Two weeks ago (completed) ───────────────
    { id: 10, subject: 'Biology', tutorName: 'James Chen', tutorId: 2, date: setTime(addDays(monday, -12), 15, 0), durationMinutes: 60, status: 'completed', notes: 'Genetics fundamentals' },
    { id: 11, subject: 'Mathematics', tutorName: 'Dr Sarah Mitchell', tutorId: 1, date: setTime(addDays(monday, -14), 10, 0), durationMinutes: 60, status: 'completed', notes: 'Algebraic fractions' },
    { id: 12, subject: 'Chemistry', tutorName: 'James Chen', tutorId: 2, date: setTime(addDays(monday, -9), 10, 0), durationMinutes: 90, status: 'completed', notes: 'Atomic structure and bonding' },
  ]

  return lessons.map((l) => {
    if (l.date < now && l.status === 'scheduled') {
      return { ...l, status: 'completed' as const }
    }
    return l
  })
}

// ── Date helpers ───────────────────────────────────────────
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function setTime(date: Date, hours: number, minutes: number): Date {
  const d = new Date(date)
  d.setHours(hours, minutes, 0, 0)
  return d
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

// ── Component ──────────────────────────────────────────────
export default function Lessons() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [listTab, setListTab] = useState<'upcoming' | 'past'>('upcoming')
  const [selectedLesson, setSelectedLesson] = useState<DemoLesson | null>(null)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const now = useMemo(() => new Date(), [])
  const [weekStart, setWeekStart] = useState(() => getMonday(now))
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => setConfirmingCancel(false), [selectedLesson])

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const lessons = useMemo(() => buildDemoLessons(), [])

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const weekLabel = `${weekStart.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })} — ${addDays(weekStart, 6).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })}`

  const weekLessons = useMemo(() =>
    lessons.filter((l) => {
      const weekEnd = addDays(weekStart, 7)
      return l.date >= weekStart && l.date < weekEnd
    }),
    [lessons, weekStart]
  )

  const nextLesson = useMemo(() => {
    const upcoming = lessons
      .filter((l) => l.date > now && l.status === 'scheduled')
      .sort((a, b) => a.date.getTime() - b.date.getTime())
    return upcoming[0] ?? null
  }, [lessons, now])

  const countdown = useMemo(() => {
    if (!nextLesson) return null
    const diff = nextLesson.date.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }, [nextLesson, now])

  const prevWeek = () => setWeekStart(addDays(weekStart, -7))
  const nextWeek = () => setWeekStart(addDays(weekStart, 7))
  const goToday = () => setWeekStart(getMonday(now))

  const upcomingLessons = useMemo(() =>
    lessons.filter((l) => l.date >= now && l.status !== 'completed').sort((a, b) => a.date.getTime() - b.date.getTime()),
    [lessons, now]
  )

  const pastLessons = useMemo(() =>
    lessons.filter((l) => l.date < now || l.status === 'completed').sort((a, b) => b.date.getTime() - a.date.getTime()),
    [lessons, now]
  )

  const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

  // Determine what to show in sidebar
  const sidebarLesson = selectedLesson ?? nextLesson

  function canJoinLesson(lesson: DemoLesson): boolean {
    const lessonStart = lesson.date.getTime()
    const fifteenMinBefore = lessonStart - 15 * 60 * 1000
    const lessonEnd = lessonStart + lesson.durationMinutes * 60 * 1000
    const nowMs = currentTime.getTime()
    const isDemo = localStorage.getItem('demo-mode') === 'true'
    return isDemo || (nowMs >= fifteenMinBefore && nowMs <= lessonEnd)
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 h-[calc(100vh-64px)] flex flex-col overflow-hidden">
        {/* ── Top Bar ──────────────────────────────── */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h1 className="text-lg font-bold text-[#1E1B4B] dark:text-white">My Lessons</h1>
          <div className="flex items-center gap-3">
            {/* View toggle pills */}
            <div className="flex bg-slate-100 dark:bg-[#252839] rounded-lg p-0.5">
              <button
                onClick={() => setView('calendar')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  view === 'calendar'
                    ? 'bg-white dark:bg-[#1a1d2e] text-[#7C3AED] shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Grid3X3 className="w-3 h-3" />
                Calendar
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-white dark:bg-[#1a1d2e] text-[#7C3AED] shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <List className="w-3 h-3" />
                List
              </button>
            </div>
            {/* Week nav (calendar only) */}
            {view === 'calendar' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={prevWeek}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#252839] text-slate-500 dark:text-slate-400 transition-colors"
                  aria-label="Previous week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goToday}
                  className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-[#252839] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2d3048] transition-colors font-medium"
                >
                  Today
                </button>
                <button
                  onClick={nextWeek}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#252839] text-slate-500 dark:text-slate-400 transition-colors"
                  aria-label="Next week"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium ml-1">
                  {weekLabel}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Main content ─────────────────────────── */}
        <div className="flex gap-3 flex-1 min-h-0 overflow-hidden">
          {/* ── LEFT: Calendar / List ───────────────── */}
          <div className="flex-1 min-w-0">
            {view === 'calendar' ? (
              /* ── Weekly Agenda View ──────────────── */
              <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl h-full flex flex-col overflow-hidden">
                {/* Day columns grid */}
                <div className="grid grid-cols-7 flex-1 min-h-0">
                  {weekDays.map((day) => {
                    const dayIdx = (day.getDay() + 6) % 7
                    const isToday = isSameDay(day, now)
                    const dayLessons = weekLessons
                      .filter((l) => isSameDay(l.date, day))
                      .sort((a, b) => a.date.getTime() - b.date.getTime())

                    return (
                      <div
                        key={day.toISOString()}
                        className={`flex flex-col border-r last:border-r-0 border-slate-100 dark:border-[#232536] ${
                          isToday ? 'bg-[#7C3AED]/[0.02]' : ''
                        }`}
                      >
                        {/* Column header */}
                        <div className={`text-center py-2.5 border-b-2 shrink-0 ${
                          isToday
                            ? 'border-b-[#7C3AED] bg-[#7C3AED]/5'
                            : 'border-b-transparent border-b border-b-slate-100 dark:border-b-[#232536]'
                        }`}>
                          <div className={`text-[10px] font-semibold uppercase tracking-wider ${
                            isToday ? 'text-[#7C3AED]' : 'text-slate-400 dark:text-slate-500'
                          }`}>
                            {DAY_NAMES[dayIdx]}
                          </div>
                          <div className={`text-sm font-bold leading-tight ${
                            isToday ? 'text-[#7C3AED]' : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {day.getDate()}
                          </div>
                        </div>

                        {/* Lesson cards */}
                        <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto">
                          {dayLessons.length > 0 ? (
                            dayLessons.map((lesson) => {
                              const color = getSubjectColor(lesson.subject)
                              const isSelected = selectedLesson?.id === lesson.id
                              const isCompleted = lesson.status === 'completed'

                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => setSelectedLesson(isSelected ? null : lesson)}
                                  className={`w-full text-left rounded-lg border-l-4 px-2 py-1.5 transition-all cursor-pointer
                                    ${color.leftBorder} ${color.darkLeftBorder}
                                    ${isCompleted ? 'opacity-50' : ''}
                                    ${isSelected
                                      ? 'ring-2 ring-[#7C3AED] ring-offset-1 dark:ring-offset-[#1a1d2e] shadow-md bg-white dark:bg-[#252839]'
                                      : 'bg-slate-50 dark:bg-[#14161f] hover:shadow-md hover:scale-[1.02]'
                                    }
                                  `}
                                >
                                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                    {formatTime(lesson.date.getHours(), lesson.date.getMinutes())}
                                  </div>
                                  <div className={`text-xs font-semibold truncate ${color.text} ${color.darkText}`}>
                                    {lesson.subject}
                                  </div>
                                  <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                    {lesson.tutorName.split(' ')[0]}
                                  </div>
                                </button>
                              )
                            })
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-slate-200 dark:text-slate-700 text-sm">&mdash;</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* ── List View ──────────────────────── */
              <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl overflow-hidden h-full flex flex-col">
                {/* Tabs */}
                <div className="flex gap-1 p-2 border-b border-slate-100 dark:border-[#232536] shrink-0" role="tablist">
                  <button
                    onClick={() => setListTab('upcoming')}
                    role="tab"
                    aria-selected={listTab === 'upcoming'}
                    className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      listTab === 'upcoming'
                        ? 'bg-[#7C3AED] text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252839]'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setListTab('past')}
                    role="tab"
                    aria-selected={listTab === 'past'}
                    className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      listTab === 'past'
                        ? 'bg-[#7C3AED] text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252839]'
                    }`}
                  >
                    Past
                  </button>
                </div>

                {/* Compact list rows */}
                <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                  {(listTab === 'upcoming' ? upcomingLessons : pastLessons).map((lesson) => {
                    const color = getSubjectColor(lesson.subject)
                    const dateStr = lesson.date.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' })
                    const timeStr = formatTime(lesson.date.getHours(), lesson.date.getMinutes())
                    const isSelected = selectedLesson?.id === lesson.id

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(isSelected ? null : lesson)}
                        className={`w-full text-left flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-[#7C3AED]/5 dark:bg-[#7C3AED]/10 ring-1 ring-[#7C3AED]'
                            : 'hover:bg-slate-50 dark:hover:bg-[#252839]'
                        }`}
                      >
                        {/* Subject colour dot */}
                        <div className={`w-2 h-2 rounded-full ${color.dot} shrink-0`} />

                        {/* Time */}
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 w-10 shrink-0">{timeStr}</span>

                        {/* Subject */}
                        <span className={`text-xs font-semibold ${color.text} ${color.darkText} w-24 truncate shrink-0`}>{lesson.subject}</span>

                        {/* Tutor */}
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex-1 truncate">{lesson.tutorName}</span>

                        {/* Date */}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{dateStr}</span>

                        {/* Status badge */}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                          lesson.status === 'completed'
                            ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                          {lesson.status === 'completed' ? 'Done' : 'Scheduled'}
                        </span>
                      </button>
                    )
                  })}
                  {(listTab === 'upcoming' ? upcomingLessons : pastLessons).length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                      {listTab === 'upcoming' ? 'No upcoming lessons.' : 'No past lessons.'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Sidebar ─────────────────────── */}
          <div className="w-[260px] shrink-0 flex flex-col gap-2.5 overflow-y-auto">
            {selectedLesson ? (
              /* ── Selected Lesson Details ────────── */
              <div className="bg-white dark:bg-[#1a1d2e] border border-[#7C3AED]/40 rounded-xl p-3.5 shadow-sm shadow-[#7C3AED]/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Lesson Details</h3>
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#252839] text-slate-400 transition-colors"
                    aria-label="Close details"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tutor info */}
                <div className="flex items-center gap-2.5 mb-3">
                  {TUTOR_PHOTOS[selectedLesson.tutorId] ? (
                    <img src={TUTOR_PHOTOS[selectedLesson.tutorId]} alt="" className="w-11 h-11 rounded-xl object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] font-semibold text-base">
                      {selectedLesson.tutorName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{selectedLesson.tutorName}</p>
                    <p className={`text-xs font-medium ${getSubjectColor(selectedLesson.subject).text} ${getSubjectColor(selectedLesson.subject).darkText}`}>
                      {selectedLesson.subject}
                    </p>
                  </div>
                </div>

                {/* Details block */}
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 mb-3 bg-slate-50 dark:bg-[#14161f] rounded-lg p-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-[#7C3AED]" />
                    {selectedLesson.date.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'short' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#7C3AED]" />
                    {formatTime(selectedLesson.date.getHours(), selectedLesson.date.getMinutes())} — {selectedLesson.durationMinutes}min
                  </div>
                </div>

                {/* Notes */}
                {selectedLesson.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mb-3">
                    "{selectedLesson.notes}"
                  </p>
                )}

                {/* Actions */}
                <div className="space-y-1.5">
                  {selectedLesson.status === 'scheduled' && (
                    <>
                      {canJoinLesson(selectedLesson) ? (
                        <Link
                          to={`/classroom/${selectedLesson.id}`}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Join Classroom
                        </Link>
                      ) : (
                        <div className="w-full text-center px-3 py-2 bg-slate-100 dark:bg-[#252839] text-slate-400 dark:text-slate-500 rounded-lg text-[11px]">
                          Opens 15 min before lesson
                        </div>
                      )}
                      {confirmingCancel ? (
                        <div className="w-full flex items-center justify-center gap-1.5">
                          <span className="text-[11px] text-slate-600 dark:text-slate-300">Are you sure?</span>
                          <button
                            onClick={() => { setConfirmingCancel(false); setSelectedLesson(null) }}
                            className="px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800/30 transition-colors"
                          >
                            Yes, cancel
                          </button>
                          <button
                            onClick={() => setConfirmingCancel(false)}
                            className="px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#252839] rounded-md border border-slate-200 dark:border-[#232536] transition-colors"
                          >
                            No, keep it
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingCancel(true)}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-[11px] font-medium border border-red-200 dark:border-red-800/30 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Cancel Lesson
                        </button>
                      )}
                    </>
                  )}
                  {selectedLesson.status === 'completed' && (
                    <Link
                      to={`/lessons/${selectedLesson.id}/package`}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      View Package
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              /* ── Next Lesson (default sidebar) ──── */
              <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl p-3.5">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Next Lesson
                </h3>
                {nextLesson ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {TUTOR_PHOTOS[nextLesson.tutorId] ? (
                        <img src={TUTOR_PHOTOS[nextLesson.tutorId]} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] font-semibold text-[11px]">
                          {nextLesson.tutorName.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold ${getSubjectColor(nextLesson.subject).text} ${getSubjectColor(nextLesson.subject).darkText}`}>
                          {nextLesson.subject}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{nextLesson.tutorName}</p>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {nextLesson.date.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(nextLesson.date.getHours(), nextLesson.date.getMinutes())}
                      </div>
                    </div>
                    {countdown && (
                      <div className="mt-2 text-center">
                        <span className="text-base font-bold text-[#7C3AED]">{countdown}</span>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">until lesson</p>
                      </div>
                    )}
                    {canJoinLesson(nextLesson) ? (
                      <Link
                        to={`/classroom/${nextLesson.id}`}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Join Classroom
                      </Link>
                    ) : (
                      <div className="mt-2 w-full text-center px-3 py-2 bg-slate-100 dark:bg-[#252839] text-slate-400 dark:text-slate-500 rounded-lg text-[11px]">
                        Opens 15 min before
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500">No upcoming lessons</p>
                )}
              </div>
            )}

            {/* Book New Lesson - always visible */}
            <Link
              to="/tutors"
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Book New Lesson
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
