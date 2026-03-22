import { useState, useMemo } from 'react'
import { Save, Copy, Trash2, Check } from 'lucide-react'
import Layout from '../components/Layout'

// ── Types ────────────────────────────────────────────────────
type SlotStatus = 'available' | 'unavailable' | 'booked'

interface TimeSlot {
  day: number // 0=Mon … 6=Sun
  hour: number // 8–20 (8am–8pm, slot covers hour → hour+1)
  status: SlotStatus
}

// ── Constants ────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8–20

function formatHour(h: number): string {
  if (h === 0 || h === 24) return '12am'
  if (h === 12) return '12pm'
  return h < 12 ? `${h}am` : `${h - 12}pm`
}

// ── Demo data ────────────────────────────────────────────────
function buildInitialSlots(): TimeSlot[] {
  const slots: TimeSlot[] = []
  for (let day = 0; day < 7; day++) {
    for (const hour of HOURS) {
      let status: SlotStatus = 'unavailable'

      // Pre-fill: weekday mornings & some afternoons available
      if (day < 5) {
        if (hour >= 9 && hour <= 12) status = 'available'
        if (hour >= 14 && hour <= 16) status = 'available'
      }
      // Saturday morning
      if (day === 5 && hour >= 10 && hour <= 13) status = 'available'

      // Booked lessons (overlay)
      if (day === 0 && hour === 10) status = 'booked'
      if (day === 0 && hour === 14) status = 'booked'
      if (day === 2 && hour === 9) status = 'booked'
      if (day === 2 && hour === 15) status = 'booked'
      if (day === 4 && hour === 11) status = 'booked'

      slots.push({ day, hour, status })
    }
  }
  return slots
}

// ── Component ────────────────────────────────────────────────
export default function TutorAvailability() {
  const [slots, setSlots] = useState<TimeSlot[]>(buildInitialSlots)
  const [saved, setSaved] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragTarget, setDragTarget] = useState<SlotStatus | null>(null)

  const getSlot = (day: number, hour: number) =>
    slots.find((s) => s.day === day && s.hour === hour)!

  const toggleSlot = (day: number, hour: number) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.day !== day || s.hour !== hour || s.status === 'booked') return s
        const next: SlotStatus = s.status === 'available' ? 'unavailable' : 'available'
        return { ...s, status: next }
      }),
    )
    setSaved(false)
  }

  const startDrag = (day: number, hour: number) => {
    const slot = getSlot(day, hour)
    if (slot.status === 'booked') return
    setIsDragging(true)
    const next: SlotStatus = slot.status === 'available' ? 'unavailable' : 'available'
    setDragTarget(next)
    setSlots((prev) =>
      prev.map((s) => (s.day === day && s.hour === hour ? { ...s, status: next } : s)),
    )
    setSaved(false)
  }

  const continueDrag = (day: number, hour: number) => {
    if (!isDragging || dragTarget === null) return
    const slot = getSlot(day, hour)
    if (slot.status === 'booked') return
    setSlots((prev) =>
      prev.map((s) => (s.day === day && s.hour === hour ? { ...s, status: dragTarget } : s)),
    )
    setSaved(false)
  }

  const stopDrag = () => {
    setIsDragging(false)
    setDragTarget(null)
  }

  // ── Bulk actions ─────────────────────────────────────────
  const copyMondayToWeekdays = () => {
    const mondaySlots = slots.filter((s) => s.day === 0)
    setSlots((prev) =>
      prev.map((s) => {
        if (s.day === 0 || s.day >= 5 || s.status === 'booked') return s
        const mondaySlot = mondaySlots.find((m) => m.hour === s.hour)
        if (!mondaySlot || mondaySlot.status === 'booked') return s
        return { ...s, status: mondaySlot.status }
      }),
    )
    setSaved(false)
  }

  const clearAll = () => {
    setSlots((prev) =>
      prev.map((s) => (s.status === 'booked' ? s : { ...s, status: 'unavailable' })),
    )
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // ── Stats ────────────────────────────────────────────────
  const stats = useMemo(() => {
    const available = slots.filter((s) => s.status === 'available').length
    const booked = slots.filter((s) => s.status === 'booked').length
    return { available, booked }
  }, [slots])

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto" onMouseUp={stopDrag} onMouseLeave={stopDrag}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Weekly Availability</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Click or drag to set your available hours. Booked lessons are shown in green.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{stats.available} available</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">{stats.booked} booked</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="w-3 h-3 rounded bg-slate-300 dark:bg-slate-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Unavailable</span>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={copyMondayToWeekdays}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Monday to weekdays
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all
          </button>
        </div>

        {/* Grid */}
        <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] overflow-x-auto select-none">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr>
                <th className="text-xs font-medium text-slate-400 dark:text-slate-500 p-2 text-left w-16" />
                {DAYS.map((d, i) => (
                  <th key={i} className="text-xs font-medium text-slate-600 dark:text-slate-400 p-2 text-center">
                    <span className="hidden sm:inline">{d}</span>
                    <span className="sm:hidden">{DAYS_SHORT[i]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour}>
                  <td className="text-[11px] text-slate-400 dark:text-slate-500 pr-2 text-right whitespace-nowrap py-0.5">
                    {formatHour(hour)}
                  </td>
                  {DAYS.map((_, day) => {
                    const slot = getSlot(day, hour)
                    const bg =
                      slot.status === 'booked'
                        ? 'bg-green-400 dark:bg-green-600 cursor-not-allowed'
                        : slot.status === 'available'
                        ? 'bg-purple-400 dark:bg-purple-600 hover:bg-purple-500 dark:hover:bg-purple-500 cursor-pointer'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer'
                    return (
                      <td key={day} className="p-0.5">
                        <div
                          className={`h-7 rounded ${bg} transition-colors relative`}
                          onMouseDown={() => startDrag(day, hour)}
                          onMouseEnter={() => continueDrag(day, hour)}
                          onClick={() => {
                            if (!isDragging) toggleSlot(day, hour)
                          }}
                          title={
                            slot.status === 'booked'
                              ? `${DAYS_SHORT[day]} ${formatHour(hour)} — Booked lesson`
                              : `${DAYS_SHORT[day]} ${formatHour(hour)} — ${slot.status === 'available' ? 'Available' : 'Unavailable'}`
                          }
                        >
                          {slot.status === 'booked' && (
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium text-white">
                              Booked
                            </span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Save button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
            }`}
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Availability'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
