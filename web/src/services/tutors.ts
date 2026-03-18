import api from './api'

export interface TutorSubjectEntry {
  name: string
  levels: string[]
}

export interface TutorListItem {
  id: number
  name: string
  avatar: string | null
  bio: string | null
  verified: boolean
  subjects: TutorSubjectEntry[]
}

export interface TutorDetail {
  id: number
  user_id: number
  bio: string | null
  qualifications: string | null
  intro_video_url: string | null
  verified: boolean
  user: { id: number; name: string; email: string; avatar: string | null }
  subjects: {
    id: number
    subject: { id: number; name: string; slug: string } | null
    level: { id: number; name: string; slug: string } | null
    exam_board: { id: number; name: string; slug: string } | null
  }[]
}

export interface RefData {
  id: number
  name: string
  slug: string
}

export interface TutorFilters {
  subject?: string
  level?: string
  exam_board?: string
  search?: string
  page?: number
}

export const tutorService = {
  async list(filters: TutorFilters = {}) {
    const params = new URLSearchParams()
    if (filters.subject) params.set('subject', filters.subject)
    if (filters.level) params.set('level', filters.level)
    if (filters.exam_board) params.set('exam_board', filters.exam_board)
    if (filters.search) params.set('search', filters.search)
    if (filters.page) params.set('page', String(filters.page))

    const { data } = await api.get<{ data: TutorListItem[]; meta: any }>(`/tutors?${params}`)
    return data
  },

  async get(id: number) {
    const { data } = await api.get<{ data: TutorDetail }>(`/tutors/${id}`)
    return data.data
  },

  async getSubjects() {
    const { data } = await api.get<RefData[]>('/subjects')
    return data
  },

  async getLevels() {
    const { data } = await api.get<RefData[]>('/levels')
    return data
  },

  async getExamBoards() {
    const { data } = await api.get<RefData[]>('/exam-boards')
    return data
  },
}
