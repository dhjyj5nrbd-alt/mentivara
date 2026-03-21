import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { tutorService } from '../services/tutors'
import { lessonService, type AvailabilitySlot } from '../services/lessons'
import Layout from '../components/Layout'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getNextDateForDay(dayOfWeek: number): Date {
  const today = new Date()
  const diff = (dayOfWeek - today.getDay() + 7) % 7 || 7
  const next = new Date(today)
  next.setDate(today.getDate() + diff)
  return next
}

export default function BookLesson() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [recurring, setRecurring] = useState(false)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const { data: tutor } = useQuery({
    queryKey: ['tutor', id],
    queryFn: () => tutorService.get(Number(id)),
    enabled: !!id,
  })

  const { data: slots } = useQuery({
    queryKey: ['availability', id],
    queryFn: () => lessonService.getTutorAvailability(Number(id)),
    enabled: !!id,
  })

  const bookMutation = useMutation({
    mutationFn: lessonService.book,
    onSuccess: () => navigate('/lessons'),
    onError: (err: any) => setError(err.response?.data?.message || 'Booking failed.'),
  })

  const handleBook = () => {
    if (!selectedSlot || !selectedTime) return
    setError('')

    const date = getNextDateForDay(selectedSlot.day_of_week)
    const [hours, minutes] = selectedTime.split(':').map(Number)
    date.setHours(hours, minutes, 0, 0)

    bookMutation.mutate({
      tutor_profile_id: Number(id),
      scheduled_at: date.toISOString(),
      duration_minutes: duration,
      is_recurring: recurring,
      notes: notes || undefined,
    })
  }

  // Generate time options from a slot
  const getTimeOptions = (slot: AvailabilitySlot): string[] => {
    const times: string[] = []
    const [startH, startM] = slot.start_time.split(':').map(Number)
    const [endH, endM] = slot.end_time.split(':').map(Number)
    const startMin = startH * 60 + startM
    const endMin = endH * 60 + endM

    for (let m = startMin; m + duration <= endMin; m += 30) {
      const h = Math.floor(m / 60)
      const min = m % 60
      times.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
    }
    return times
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-4">
          <Link to={`/tutors/${id}`} className="text-sm text-slate-600">Back to profile</Link>
        </div>
        <h1 className="text-2xl font-bold text-[#1E1B4B] mb-2">Book a Lesson</h1>
        {tutor && <p className="text-slate-600 mb-6">with {tutor.user.name}</p>}

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
        )}

        {/* Duration */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
          <div className="flex gap-2">
            {[30, 45, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => { setDuration(d); setSelectedTime('') }}
                className={`px-4 py-2 rounded-lg text-sm ${duration === d ? 'bg-[#7C3AED] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        {/* Day selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Select a Day</label>
          {!slots?.length ? (
            <p className="text-slate-500 text-sm">No availability set by this tutor yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => { setSelectedSlot(slot); setSelectedTime('') }}
                  className={`p-3 rounded-lg border text-left ${selectedSlot?.id === slot.id ? 'border-[#7C3AED] bg-[#EDE9FE]' : 'border-slate-200 bg-white'}`}
                >
                  <div className="font-medium text-sm">{DAY_NAMES[slot.day_of_week]}</div>
                  <div className="text-xs text-slate-500">{slot.start_time} - {slot.end_time}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Time selection */}
        {selectedSlot && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select a Time</label>
            <div className="flex flex-wrap gap-2">
              {getTimeOptions(selectedSlot).map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-3 py-2 rounded-lg text-sm ${selectedTime === time ? 'bg-[#7C3AED] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recurring toggle */}
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">Make this a recurring weekly lesson</span>
          </label>
          {recurring && <p className="text-xs text-slate-500 mt-1">This will book 5 weekly lessons.</p>}
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            rows={3}
            placeholder="Any topics or questions for the lesson..."
          />
        </div>

        <button
          onClick={handleBook}
          disabled={!selectedSlot || !selectedTime || bookMutation.isPending}
          className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {bookMutation.isPending ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </Layout>
  )
}
