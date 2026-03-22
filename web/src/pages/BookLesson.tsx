import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  CheckCircle,
  Star,
  Plus,
  AlertCircle,
  Repeat,
} from 'lucide-react'
import Layout from '../components/Layout'
import { useCurrencyStore, formatPrice } from '../store/currencyStore'
import { TUTORS } from '../services/demo-data'

// ── Tutor photos (same as TutorDirectory) ──────────────────
const TUTOR_PHOTOS: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  3: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
  4: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
}

const TUTOR_STATS: Record<number, { rating: number; reviews: number; rate: number }> = {
  1: { rating: 4.9, reviews: 127, rate: 45 },
  2: { rating: 4.8, reviews: 89, rate: 50 },
  3: { rating: 4.7, reviews: 156, rate: 40 },
  4: { rating: 4.9, reviews: 73, rate: 55 },
}

// ── Mock availability & existing bookings ──────────────────
// Day 0=Sun, 1=Mon, ..., 6=Sat
const TUTOR_AVAILABILITY: Record<number, { start: number; end: number }> = {
  1: { start: 9, end: 17 },  // Mon
  2: { start: 14, end: 20 }, // Tue
  3: { start: 9, end: 17 },  // Wed
  4: { start: 14, end: 20 }, // Thu
  5: { start: 9, end: 17 },  // Fri
}

interface ExistingLesson {
  dayOfWeek: number
  hour: number
  minute: number
  subject: string
  tutorName: string
}

const STUDENT_LESSONS: ExistingLesson[] = [
  { dayOfWeek: 1, hour: 10, minute: 0, subject: 'Maths', tutorName: 'Dr Sarah Mitchell' },
  { dayOfWeek: 3, hour: 15, minute: 0, subject: 'English', tutorName: 'Emma Richardson' },
]

// ── Helpers ────────────────────────────────────────────────
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

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function formatDateShort(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return `${days[date.getDay()]} ${date.getDate()}`
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

interface SlotInfo {
  hour: number
  minute: number
  type: 'available' | 'booked' | 'unavailable'
  label?: string
}

// ── Component ──────────────────────────────────────────────
export default function BookLesson() {
  const { id } = useParams<{ id: string }>()
  const tutorId = Number(id) || 1
  const currency = useCurrencyStore((s) => s.currency)

  const tutor = TUTORS.find((t) => t.id === tutorId) || TUTORS[0]
  const photo = TUTOR_PHOTOS[tutor.id]
  const stats = TUTOR_STATS[tutor.id] || { rating: 4.5, reviews: 0, rate: 45 }
  const subjectNames = [...new Set(tutor.subjects.map((s) => s.subject.name))]

  const today = useMemo(() => new Date(), [])
  const [weekStart, setWeekStart] = useState(() => getMonday(today))
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour: number; minute: number } | null>(null)
  const [duration, setDuration] = useState(60)
  const [recurring, setRecurring] = useState(false)
  const [notes, setNotes] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)

  // Build week days array (Mon-Sun)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  // Build slots for a given day
  function getSlotsForDay(date: Date): SlotInfo[] {
    const dow = date.getDay()
    const avail = TUTOR_AVAILABILITY[dow]
    const slots: SlotInfo[] = []

    // Calendar runs 9:00 - 20:00
    for (let h = 9; h < 20; h++) {
      for (let m = 0; m < 60; m += 30) {
        const timeVal = h + m / 60

        // Check if student has a booking at this time on this day of week
        const existing = STUDENT_LESSONS.find(
          (l) => l.dayOfWeek === dow && l.hour === h && l.minute === m
        )
        if (existing) {
          slots.push({ hour: h, minute: m, type: 'booked', label: `${existing.subject}` })
          continue
        }

        // Check if within tutor availability
        if (avail && timeVal >= avail.start && timeVal < avail.end) {
          slots.push({ hour: h, minute: m, type: 'available' })
        } else {
          slots.push({ hour: h, minute: m, type: 'unavailable' })
        }
      }
    }
    return slots
  }

  const prevWeek = () => setWeekStart(addDays(weekStart, -7))
  const nextWeek = () => setWeekStart(addDays(weekStart, 7))
  const goToday = () => setWeekStart(getMonday(today))

  const isSelected = (date: Date, hour: number, minute: number) =>
    selectedSlot && isSameDay(selectedSlot.date, date) && selectedSlot.hour === hour && selectedSlot.minute === minute

  const price = Math.round(stats.rate * (duration / 60))

  // Recurring dates preview
  const recurringDates = useMemo(() => {
    if (!selectedSlot || !recurring) return []
    return Array.from({ length: 4 }, (_, i) => addDays(selectedSlot.date, (i + 1) * 7))
  }, [selectedSlot, recurring])

  // Existing bookings this week
  const weekBookings = useMemo(() => {
    return STUDENT_LESSONS.map((l) => {
      const dayDate = weekDays.find((d) => d.getDay() === l.dayOfWeek)
      return { ...l, date: dayDate }
    }).filter((l) => l.date)
  }, [weekDays])

  const handleConfirm = () => {
    setConfirmed(true)
    setTimeout(() => setConfirmed(false), 3000)
  }

  // Week label
  const weekLabel = `${weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — ${addDays(weekStart, 6).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
        {/* Back link */}
        <Link
          to={`/tutors/${tutor.id}`}
          className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-[#7C3AED] mb-2 transition-colors"
        >
          <ChevronLeft className="w-3 h-3" />
          Back to profile
        </Link>

        {/* ── Tutor Info Strip ────────────────────────────── */}
        <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl px-4 py-3 mb-3 flex items-center gap-4 flex-wrap">
          {/* Photo */}
          {photo ? (
            <img src={photo} alt={tutor.user.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] font-bold text-lg shrink-0">
              {tutor.user.name.charAt(0)}
            </div>
          )}

          {/* Name + verified */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base text-slate-900 dark:text-white truncate">{tutor.user.name}</h1>
              {tutor.verified && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
            </div>
            <div className="flex items-center gap-2 text-xs mt-0.5">
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">{stats.rating}</span>
                <span className="text-slate-400">({stats.reviews})</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="font-bold text-[#7C3AED]">{formatPrice(stats.rate, currency)}/hr</span>
            </div>
          </div>

          {/* Subject tags */}
          <div className="flex flex-wrap gap-1 ml-auto">
            {subjectNames.map((name) => (
              <span
                key={name}
                className="text-[10px] px-2.5 py-1 bg-[#EDE9FE] dark:bg-[#7C3AED]/20 text-[#7C3AED] rounded-full font-medium"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* ── Main content: Calendar + Summary ────────────── */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* ── Calendar Panel ──────────────────────────────── */}
          <div className="flex-1 min-w-0 bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl overflow-hidden">
            {/* Calendar header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-[#232536]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7C3AED]" />
                <h2 className="font-semibold text-sm text-slate-900 dark:text-white">Select a Time</h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={goToday}
                  className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-[#252839] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2d3048] transition-colors mr-1"
                >
                  Today
                </button>
                <button
                  onClick={prevWeek}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#252839] text-slate-500 dark:text-slate-400 transition-colors"
                  aria-label="Previous week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium min-w-[140px] text-center">
                  {weekLabel}
                </span>
                <button
                  onClick={nextWeek}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#252839] text-slate-500 dark:text-slate-400 transition-colors"
                  aria-label="Next week"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-4 py-1.5 border-b border-slate-50 dark:border-[#232536] text-[10px]">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700" />
                <span className="text-slate-500 dark:text-slate-400">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700" />
                <span className="text-slate-500 dark:text-slate-400">Your booking</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-[#252839] border border-slate-200 dark:border-[#2d3048]" />
                <span className="text-slate-500 dark:text-slate-400">Unavailable</span>
              </div>
            </div>

            {/* Day columns */}
            <div className="grid grid-cols-7 divide-x divide-slate-100 dark:divide-[#232536]">
              {weekDays.map((date) => {
                const isToday = isSameDay(date, today)
                const slots = getSlotsForDay(date)

                return (
                  <div key={date.toISOString()} className="min-w-0">
                    {/* Day header */}
                    <div
                      className={`text-center py-1.5 border-b border-slate-100 dark:border-[#232536] ${
                        isToday ? 'bg-[#7C3AED]/5' : ''
                      }`}
                    >
                      <div
                        className={`text-[11px] font-semibold ${
                          isToday ? 'text-[#7C3AED]' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {formatDateShort(date)}
                      </div>
                      {isToday && (
                        <div className="w-1 h-1 rounded-full bg-[#7C3AED] mx-auto mt-0.5" />
                      )}
                    </div>

                    {/* Time slots */}
                    <div className="p-0.5 space-y-px" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                      {slots.map((slot) => {
                        const key = `${date.toISOString()}-${slot.hour}-${slot.minute}`
                        const selected = isSelected(date, slot.hour, slot.minute)
                        const hovered = hoveredSlot === key

                        if (slot.type === 'unavailable') {
                          return (
                            <div
                              key={key}
                              className="h-6 rounded bg-slate-50 dark:bg-[#14161f] border border-transparent"
                            />
                          )
                        }

                        if (slot.type === 'booked') {
                          return (
                            <div
                              key={key}
                              className="h-6 rounded bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 flex items-center justify-center overflow-hidden"
                              title={`Booked: ${slot.label} at ${formatTime(slot.hour, slot.minute)}`}
                            >
                              <span className="text-[8px] font-medium text-purple-700 dark:text-purple-300 truncate px-0.5">
                                {slot.label}
                              </span>
                            </div>
                          )
                        }

                        // Available slot
                        return (
                          <button
                            key={key}
                            onClick={() => setSelectedSlot({ date, hour: slot.hour, minute: slot.minute })}
                            onMouseEnter={() => setHoveredSlot(key)}
                            onMouseLeave={() => setHoveredSlot(null)}
                            title={formatTime(slot.hour, slot.minute)}
                            className={`w-full h-6 rounded border text-[9px] font-medium transition-all relative group/slot ${
                              selected
                                ? 'bg-[#7C3AED] border-[#7C3AED] text-white animate-pulse-border'
                                : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 hover:border-[#7C3AED] hover:bg-[#EDE9FE] dark:hover:bg-[#7C3AED]/20'
                            }`}
                          >
                            {selected ? (
                              formatTime(slot.hour, slot.minute)
                            ) : hovered ? (
                              <span className="flex items-center justify-center gap-0.5">
                                <Plus className="w-2.5 h-2.5" />
                                <span>{formatTime(slot.hour, slot.minute)}</span>
                              </span>
                            ) : (
                              <span className="opacity-60">{formatTime(slot.hour, slot.minute)}</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Right Sidebar ──────────────────────────────── */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-3">
            {/* Your lessons this week */}
            <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl p-3">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#7C3AED]" />
                Your lessons this week
              </h3>
              {weekBookings.length === 0 ? (
                <p className="text-xs text-slate-400">No lessons this week</p>
              ) : (
                <div className="space-y-1.5">
                  {weekBookings.map((l, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs bg-purple-50 dark:bg-purple-900/20 rounded-lg px-2.5 py-1.5"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] shrink-0" />
                      <div className="min-w-0">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {l.date ? formatDateShort(l.date) : ''} {formatTime(l.hour, l.minute)}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400"> — {l.subject}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div
              className={`bg-white dark:bg-[#1a1d2e] border rounded-xl p-3 transition-all ${
                selectedSlot
                  ? 'border-[#7C3AED] shadow-sm shadow-[#7C3AED]/10'
                  : 'border-slate-200 dark:border-[#232536]'
              }`}
            >
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#7C3AED]" />
                Booking Summary
              </h3>

              {!selectedSlot ? (
                <div className="flex flex-col items-center py-4 text-center">
                  <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400">Select a time slot on the calendar to begin booking</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {formatDateLong(selectedSlot.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {formatTime(selectedSlot.hour, selectedSlot.minute)}
                    </span>
                  </div>

                  {/* Duration selector */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mb-1">
                      Duration
                    </label>
                    <div className="flex gap-1">
                      {[30, 45, 60, 90].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDuration(d)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            duration === d
                              ? 'bg-[#7C3AED] text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-[#252839] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2d3048]'
                          }`}
                        >
                          {d}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between py-2 border-t border-b border-slate-100 dark:border-[#232536]">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Total</span>
                    <span className="text-lg font-bold text-[#7C3AED]">
                      {formatPrice(price, currency)}
                    </span>
                  </div>

                  {/* Recurring toggle */}
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div
                      className={`relative w-8 h-4.5 rounded-full transition-colors ${
                        recurring ? 'bg-[#7C3AED]' : 'bg-slate-200 dark:bg-[#252839]'
                      }`}
                      onClick={() => setRecurring(!recurring)}
                    >
                      <div
                        className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${
                          recurring ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300">
                      <Repeat className="w-3 h-3" />
                      <span>Repeat weekly</span>
                    </div>
                  </label>

                  {/* Recurring preview */}
                  {recurring && recurringDates.length > 0 && (
                    <div className="bg-slate-50 dark:bg-[#14161f] rounded-lg p-2">
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Next 4 sessions:
                      </p>
                      <div className="space-y-0.5">
                        {recurringDates.map((d, i) => (
                          <div key={i} className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-[#7C3AED]" />
                            {d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                            {' '}at {formatTime(selectedSlot.hour, selectedSlot.minute)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label
                      htmlFor="booking-notes"
                      className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mb-1"
                    >
                      Notes
                    </label>
                    <textarea
                      id="booking-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={1}
                      placeholder="Topics, questions, or requests..."
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] resize-y transition-colors"
                    />
                  </div>

                  {/* Confirm button */}
                  <button
                    onClick={handleConfirm}
                    disabled={confirmed}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      confirmed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-sm hover:shadow-md active:scale-[0.98]'
                    }`}
                  >
                    {confirmed ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        Booking Confirmed!
                      </span>
                    ) : (
                      `Confirm Booking — ${formatPrice(price, currency)}`
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pulsing border animation */}
      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4); }
          50% { box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15); }
        }
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
      `}</style>
    </Layout>
  )
}
