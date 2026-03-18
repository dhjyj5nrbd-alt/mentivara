import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lessonService, type LessonItem } from '../services/lessons'
import { useAuthStore } from '../store/authStore'
import Layout from '../components/Layout'
import { Calendar, Clock, X } from 'lucide-react'

function LessonCard({ lesson, onCancel }: { lesson: LessonItem; onCancel?: (id: number) => void }) {
  const { user } = useAuthStore()
  const isStudent = user?.role === 'student'
  const otherPerson = isStudent ? lesson.tutor : lesson.student

  const date = new Date(lesson.scheduled_at)
  const dateStr = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-50 text-blue-700',
    in_progress: 'bg-emerald-50 text-emerald-700',
    completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-50 text-red-600',
  }

  const statusLabels: Record<string, string> = {
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED] font-semibold" aria-hidden="true">
            {otherPerson.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-slate-900">{otherPerson.name}</p>
            {lesson.subject && <p className="text-xs text-slate-500">{lesson.subject.name}</p>}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[lesson.status]}`}>
          {statusLabels[lesson.status] || lesson.status}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {dateStr}</span>
        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {timeStr}</span>
        <span>{lesson.duration_minutes} min</span>
      </div>
      {(lesson.status === 'scheduled' || lesson.status === 'in_progress') && (
        <div className="mt-3 flex items-center gap-3">
          <Link
            to={`/classroom/${lesson.id}`}
            className="text-sm px-4 py-2 bg-[#7C3AED] text-white rounded-lg font-medium hover:bg-[#6D28D9] transition-colors"
          >
            {lesson.status === 'in_progress' ? 'Rejoin Classroom' : 'Join Classroom'}
          </Link>
          {lesson.status === 'scheduled' && onCancel && (
            <button
              onClick={() => { if (window.confirm('Are you sure you want to cancel this lesson?')) onCancel(lesson.id) }}
              className="text-sm px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-colors"
              aria-label={`Cancel lesson with ${otherPerson.name}`}
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>
      )}
      {lesson.status === 'completed' && (
        <div className="mt-3">
          <Link
            to={`/lessons/${lesson.id}/package`}
            className="text-sm text-[#7C3AED] hover:underline font-medium"
          >
            View Lesson Package
          </Link>
        </div>
      )}
    </div>
  )
}

export default function Lessons() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const queryClient = useQueryClient()

  const { data: upcoming, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['lessons', 'upcoming'],
    queryFn: lessonService.upcoming,
    enabled: tab === 'upcoming',
  })

  const { data: past, isLoading: loadingPast } = useQuery({
    queryKey: ['lessons', 'past'],
    queryFn: lessonService.past,
    enabled: tab === 'past',
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => lessonService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
    },
  })

  const lessons = tab === 'upcoming' ? upcoming : past
  const isLoading = tab === 'upcoming' ? loadingUpcoming : loadingPast

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#1E1B4B] mb-6">My Lessons</h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'upcoming' ? 'bg-[#7C3AED] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setTab('past')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'past' ? 'bg-[#7C3AED] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            Past
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" />
          </div>
        ) : !lessons?.length ? (
          <div className="text-center py-12 text-slate-500">
            {tab === 'upcoming' ? 'No upcoming lessons.' : 'No past lessons.'}
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onCancel={tab === 'upcoming' ? (id) => cancelMutation.mutate(id) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
