import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar, Clock, ChevronLeft, ChevronRight, List, Grid3X3,
  Play, X, BookOpen,
} from 'lucide-react'
import Layout from '../components/Layout'

// ── Tutor photos (same pattern as TutorDirectory) ──────────
const TUTOR_PHOTOS: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  3: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
  4: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
}

// ── Subject colour coding ──────────────────────────────────
const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string; darkBg: string; darkBorder: string; darkText: string; dot: string }> = {
  Mathematics: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', darkBg: 'dark:bg-blue-900/30', darkBorder: 'dark:border-blue-700', darkText: 'dark:text-blue-300', dot: 'bg-blue-500' },
  English:     { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', darkBg: 'dark:bg-amber-900/30', darkBorder: 'dark:border-amber-700', darkText: 'dark:text-amber-300', dot: 'bg-amber-500' },
  Biology:     { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', darkBg: 'dark:bg-green-900/30', darkBorder: 'dark:border-green-700', darkText: 'dark:text-green-300', dot: 'bg-green-500' },
  Chemistry:   { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800', darkBg: 'dark:bg-purple-900/30', darkBorder: 'dark:border-purple-700', darkText: 'dark:text-purple-300', dot: 'bg-purple-500' },
  Physics:     { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800', darkBg: 'dark:bg-orange-900/30', darkBorder: 'dark:border-orange-700', darkText: 'dark:text-orange-300', dot: 'bg-orange-500' },
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
  // Get current week's Monday
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

  // Mark past lessons as completed, future as scheduled
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
  const now = useMemo(() => new Date(), [])
  const [weekStart, setWeekStart] = useState(() => getMonday(now))
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute for the red line
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const lessons = useMemo(() => buildDemoLessons(), [])

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const weekLabel = `${weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — ${addDays(weekStart, 6).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`

  // Lessons for the current week view
  const weekLessons = useMemo(() =>
    lessons.filter((l) => {
      const weekEnd = addDays(weekStart, 7)
      return l.date >= weekStart && l.date < weekEnd
    }),
    [lessons, weekStart]
  )

  // Stats for sidebar
  const thisWeekCurrent = useMemo(() => {
    const currentMonday = getMonday(now)
    const currentSunday = addDays(currentMonday, 7)
    return lessons.filter((l) => l.date >= currentMonday && l.date < currentSunday)
  }, [lessons, now])

  const totalHoursThisWeek = useMemo(() =>
    thisWeekCurrent.reduce((sum, l) => sum + l.durationMinutes / 60, 0),
    [thisWeekCurrent]
  )

  // Next upcoming lesson
  const nextLesson = useMemo(() => {
    const upcoming = lessons
      .filter((l) => l.date > now && l.status === 'scheduled')
      .sort((a, b) => a.date.getTime() - b.date.getTime())
    return upcoming[0] ?? null
  }, [lessons, now])

  // Countdown to next lesson
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

  // Calendar hours: 09:00 - 20:00
  const hours = Array.from({ length: 12 }, (_, i) => i + 9)

  // Get lesson block position and height for calendar
  function getLessonStyle(lesson: DemoLesson) {
    const startHour = lesson.date.getHours()
    const startMinute = lesson.date.getMinutes()
    const topOffset = (startHour - 9) * 28 + (startMinute / 60) * 28
    const height = (lesson.durationMinutes / 60) * 28
    return { top: `${topOffset}px`, height: `${Math.max(height, 14)}px` }
  }

  // Current time line position
  const currentTimeTop = useMemo(() => {
    const h = currentTime.getHours()
    const m = currentTime.getMinutes()
    if (h < 9 || h >= 20) return null
    return (h - 9) * 28 + (m / 60) * 28
  }, [currentTime])

  // Check if current time line should show for a given day column
  const isCurrentTimeDay = (day: Date) => isSameDay(day, currentTime)

  // List view data
  const upcomingLessons = useMemo(() =>
    lessons.filter((l) => l.date >= now && l.status !== 'completed').sort((a, b) => a.date.getTime() - b.date.getTime()),
    [lessons, now]
  )

  const pastLessons = useMemo(() =>
    lessons.filter((l) => l.date < now || l.status === 'completed').sort((a, b) => b.date.getTime() - a.date.getTime()),
    [lessons, now]
  )

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 h-[calc(100vh-64px)] flex flex-col overflow-hidden">
        {/* ── Top Bar ──────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h1 className="text-xl font-bold text-[#1E1B4B] dark:text-white">My Lessons</h1>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex bg-slate-100 dark:bg-[#252839] rounded-lg p-0.5">
              <button
                onClick={() => setView('calendar')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  view === 'calendar'
                    ? 'bg-white dark:bg-[#1a1d2e] text-[#7C3AED] shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                Calendar
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-white dark:bg-[#1a1d2e] text-[#7C3AED] shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
            </div>
            {/* Week navigation (calendar only) */}
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
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium ml-1 min-w-[150px]">
                  {weekLabel}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Main content area ────────────────────────────── */}
        <div className="flex gap-3 flex-1 min-h-0 overflow-hidden">
          {/* ── Calendar / List View ───────────────────────── */}
          <div className="flex-1 min-w-0">
            {view === 'calendar' ? (
              /* ── Calendar View ──────────────────────────── */
              <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl overflow-hidden h-full flex flex-col">
                {/* Day headers */}
                <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-slate-100 dark:border-[#232536] shrink-0">
                  <div className="py-1.5 px-1" />
                  {weekDays.map((day) => {
                    const isToday = isSameDay(day, now)
                    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    const dayIdx = (day.getDay() + 6) % 7
                    return (
                      <div
                        key={day.toISOString()}
                        className={`text-center py-1.5 border-l border-slate-100 dark:border-[#232536] ${
                          isToday ? 'bg-[#7C3AED]/5' : ''
                        }`}
                      >
                        <div className={`text-[10px] font-medium uppercase tracking-wider ${
                          isToday ? 'text-[#7C3AED]' : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {dayNames[dayIdx]}
                        </div>
                        <div className={`text-sm font-semibold ${
                          isToday ? 'text-[#7C3AED]' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {day.getDate()}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Time grid */}
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-[48px_repeat(7,1fr)] relative" style={{ minHeight: `${hours.length * 28}px` }}>
                    {/* Time labels column */}
                    <div className="relative">
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="h-[28px] flex items-start justify-end pr-2 -mt-[5px]"
                          style={{ marginTop: hour === 9 ? '0' : undefined }}
                        >
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                            {formatTime(hour, 0)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Day columns */}
                    {weekDays.map((day) => {
                      const dayLessons = weekLessons.filter((l) => isSameDay(l.date, day))
                      const isToday = isSameDay(day, now)

                      return (
                        <div
                          key={day.toISOString()}
                          className={`relative border-l border-slate-100 dark:border-[#232536] ${
                            isToday ? 'bg-[#7C3AED]/[0.02]' : ''
                          }`}
                        >
                          {/* Hour grid lines */}
                          {hours.map((hour) => (
                            <div
                              key={hour}
                              className="h-[28px] border-b border-slate-50 dark:border-[#1e2030]"
                            />
                          ))}

                          {/* Lesson blocks */}
                          {dayLessons.map((lesson) => {
                            const style = getLessonStyle(lesson)
                            const color = getSubjectColor(lesson.subject)
                            const isCompleted = lesson.status === 'completed'
                            const isSelected = selectedLesson?.id === lesson.id

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setSelectedLesson(isSelected ? null : lesson)}
                                className={`absolute left-0.5 right-0.5 rounded px-1 overflow-hidden cursor-pointer transition-all text-left
                                  ${color.bg} ${color.darkBg} border ${isCompleted ? 'border-slate-300 dark:border-slate-600 opacity-60' : `${color.border} ${color.darkBorder}`}
                                  ${isSelected ? 'ring-2 ring-[#7C3AED] ring-offset-1 dark:ring-offset-[#1a1d2e] z-20' : 'z-10 hover:z-20 hover:shadow-sm'}
                                `}
                                style={style}
                                title={`${lesson.subject} with ${lesson.tutorName}`}
                              >
                                <div className={`text-[8px] font-semibold truncate leading-tight mt-px ${color.text} ${color.darkText}`}>
                                  {lesson.subject}
                                </div>
                                {lesson.durationMinutes >= 45 && (
                                  <div className={`text-[7px] truncate ${color.text} ${color.darkText} opacity-70`}>
                                    {lesson.tutorName}
                                  </div>
                                )}
                              </button>
                            )
                          })}

                          {/* Current time line */}
                          {isToday && isCurrentTimeDay(day) && currentTimeTop !== null && (
                            <div
                              className="absolute left-0 right-0 z-30 flex items-center"
                              style={{ top: `${currentTimeTop}px` }}
                            >
                              <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
                              <div className="flex-1 h-[2px] bg-red-500" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* ── List View ──────────────────────────────── */
              <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl overflow-hidden h-full flex flex-col">
                {/* Tabs */}
                <div className="flex gap-1 p-2 border-b border-slate-100 dark:border-[#232536] shrink-0">
                  <button
                    onClick={() => setListTab('upcoming')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      listTab === 'upcoming'
                        ? 'bg-[#7C3AED] text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252839]'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setListTab('past')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      listTab === 'past'
                        ? 'bg-[#7C3AED] text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252839]'
                    }`}
                  >
                    Past
                  </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                  {(listTab === 'upcoming' ? upcomingLessons : pastLessons).map((lesson) => {
                    const color = getSubjectColor(lesson.subject)
                    const photo = TUTOR_PHOTOS[lesson.tutorId]
                    const dateStr = lesson.date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
                    const timeStr = formatTime(lesson.date.getHours(), lesson.date.getMinutes())
                    const isSelected = selectedLesson?.id === lesson.id

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(isSelected ? null : lesson)}
                        className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-[#7C3AED] bg-[#7C3AED]/5 dark:bg-[#7C3AED]/10'
                            : 'border-slate-100 dark:border-[#232536] hover:border-slate-200 dark:hover:border-[#2d3048]'
                        }`}
                      >
                        {/* Subject dot */}
                        <div className={`w-1.5 h-8 rounded-full ${color.dot} shrink-0`} />

                        {/* Tutor photo */}
                        {photo ? (
                          <img src={photo} alt={lesson.tutorName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] font-semibold text-xs shrink-0">
                            {lesson.tutorName.charAt(0)}
                          </div>
                        )}

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold ${color.text} ${color.darkText}`}>{lesson.subject}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">with {lesson.tutorName}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {dateStr}</span>
                            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {timeStr}</span>
                            <span>{lesson.durationMinutes}min</span>
                          </div>
                        </div>

                        {/* Status */}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                          lesson.status === 'completed'
                            ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                          {lesson.status === 'completed' ? 'Completed' : 'Scheduled'}
                        </span>
                      </button>
                    )
                  })}
                  {(listTab === 'upcoming' ? upcomingLessons : pastLessons).length === 0 && (
                    <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-500">
                      {listTab === 'upcoming' ? 'No upcoming lessons.' : 'No past lessons.'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Sidebar ───────────────────────────────── */}
          <div className="w-[200px] shrink-0 flex flex-col gap-2.5">
            {/* Next Lesson card */}
            <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl p-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Next Lesson
              </h3>
              {nextLesson ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {TUTOR_PHOTOS[nextLesson.tutorId] ? (
                      <img src={TUTOR_PHOTOS[nextLesson.tutorId]} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] font-semibold text-[10px]">
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
                      {nextLesson.date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(nextLesson.date.getHours(), nextLesson.date.getMinutes())}
                    </div>
                  </div>
                  {countdown && (
                    <div className="mt-2 text-center">
                      <span className="text-lg font-bold text-[#7C3AED]">{countdown}</span>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">until lesson</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500">No upcoming lessons</p>
              )}
            </div>

            {/* Show lesson details when selected, otherwise show summary */}
            {selectedLesson ? (
              <div className="bg-white dark:bg-[#1a1d2e] border border-[#7C3AED] rounded-xl p-4 shadow-sm shadow-[#7C3AED]/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Lesson Details</h3>
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#252839] text-slate-400 transition-colors"
                    aria-label="Close details"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Tutor info */}
                <div className="flex items-center gap-3 mb-3">
                  {TUTOR_PHOTOS[selectedLesson.tutorId] ? (
                    <img src={TUTOR_PHOTOS[selectedLesson.tutorId]} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] font-semibold text-lg">
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

                {/* Time details */}
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 mb-3 bg-slate-50 dark:bg-[#14161f] rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#7C3AED]" />
                    {selectedLesson.date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#7C3AED]" />
                    {formatTime(selectedLesson.date.getHours(), selectedLesson.date.getMinutes())} — {selectedLesson.durationMinutes} minutes
                  </div>
                </div>

                {/* Notes */}
                {selectedLesson.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-3">
                    "{selectedLesson.notes}"
                  </p>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {selectedLesson.status === 'scheduled' && (
                    <>
                      <Link
                        to={`/classroom/${selectedLesson.id}`}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Join Classroom
                      </Link>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this lesson?')) {
                            setSelectedLesson(null)
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-medium border border-red-200 dark:border-red-800/30 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel Lesson
                      </button>
                    </>
                  )}
                  {selectedLesson.status === 'completed' && (
                    <Link
                      to={`/lessons/${selectedLesson.id}/package`}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      View Lesson Package
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* This Week summary */}
                <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl p-3">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    This Week
                  </h3>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Lessons</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{thisWeekCurrent.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Total hours</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{totalHoursThisWeek.toFixed(1)}h</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#232536] space-y-1">
                    {Object.entries(
                      thisWeekCurrent.reduce<Record<string, number>>((acc, l) => {
                        acc[l.subject] = (acc[l.subject] || 0) + 1
                        return acc
                      }, {})
                    ).map(([subject, count]) => {
                      const color = getSubjectColor(subject)
                      return (
                        <div key={subject} className="flex items-center gap-1.5 text-[10px]">
                          <div className={`w-2 h-2 rounded-full ${color.dot}`} />
                          <span className="text-slate-600 dark:text-slate-400 flex-1">{subject}</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Book New Lesson */}
                <Link
                  to="/tutors"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Book New Lesson
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
