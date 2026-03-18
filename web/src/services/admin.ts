import api from './api'

export interface DashboardStats {
  total_users: number
  total_students: number
  total_tutors: number
  total_parents: number
  pending_tutors: number
  total_lessons: number
  completed_lessons: number
  upcoming_lessons: number
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  status: string
  avatar: string | null
  created_at: string
  tutor_profile?: any
}

export const adminService = {
  async dashboard() {
    const { data } = await api.get<{ stats: DashboardStats }>('/admin/dashboard')
    return data.stats
  },

  async users(params: { role?: string; status?: string; search?: string; page?: number } = {}) {
    const { data } = await api.get('/admin/users', { params })
    return data
  },

  async getUser(id: number) {
    const { data } = await api.get<{ data: AdminUser }>(`/admin/users/${id}`)
    return data.data
  },

  async updateUserStatus(id: number, status: string) {
    const { data } = await api.patch(`/admin/users/${id}/status`, { status })
    return data
  },

  async deleteUser(id: number) {
    await api.delete(`/admin/users/${id}`)
  },

  async pendingTutors() {
    const { data } = await api.get<{ data: AdminUser[] }>('/admin/tutors/pending')
    return data.data
  },

  async approveTutor(id: number) {
    const { data } = await api.post(`/admin/tutors/${id}/approve`)
    return data
  },

  async rejectTutor(id: number) {
    const { data } = await api.post(`/admin/tutors/${id}/reject`)
    return data
  },
}
