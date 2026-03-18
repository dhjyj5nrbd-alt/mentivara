import api from './api'

export interface LessonItem {
  id: number
  tutor: { id: number; name: string; avatar: string | null }
  student: { id: number; name: string; avatar: string | null }
  subject: { id: number; name: string } | null
  scheduled_at: string
  duration_minutes: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  is_recurring: boolean
  notes: string | null
  recording_url: string | null
}

export interface AvailabilitySlot {
  id: number
  tutor_profile_id: number
  day_of_week: number
  start_time: string
  end_time: string
  is_recurring: boolean
  specific_date: string | null
}

export interface BookingPayload {
  tutor_profile_id: number
  subject_id?: number
  scheduled_at: string
  duration_minutes: number
  is_recurring?: boolean
  notes?: string
}

export const lessonService = {
  async upcoming() {
    const { data } = await api.get<{ data: LessonItem[] }>('/lessons/upcoming')
    return data.data
  },

  async past() {
    const { data } = await api.get<{ data: LessonItem[] }>('/lessons/past')
    return data.data
  },

  async calendar(from: string, to: string) {
    const { data } = await api.get<{ data: LessonItem[] }>(`/lessons/calendar?from=${from}&to=${to}`)
    return data.data
  },

  async get(id: number) {
    const { data } = await api.get<{ data: LessonItem }>(`/lessons/${id}`)
    return data.data
  },

  async cancel(id: number, reason?: string) {
    await api.post(`/lessons/${id}/cancel`, { reason })
  },

  async book(payload: BookingPayload) {
    const { data } = await api.post<{ data: LessonItem }>('/student/book', payload)
    return data.data
  },

  async getTutorAvailability(tutorProfileId: number) {
    const { data } = await api.get<{ data: AvailabilitySlot[] }>(`/tutors/${tutorProfileId}/availability`)
    return data.data
  },
}
