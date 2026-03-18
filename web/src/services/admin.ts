import api from './api'
import type { PaginatedResponse } from './types'

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
  async dashboard(): Promise<DashboardStats> {
    const { data } = await api.get<{ stats: DashboardStats }>('/admin/dashboard')
    return data.stats
  },

  async users(params: { role?: string; status?: string; search?: string; page?: number } = {}): Promise<PaginatedResponse<AdminUser>> {
    const { data } = await api.get<PaginatedResponse<AdminUser>>('/admin/users', { params })
    return data
  },

  async getUser(id: number): Promise<AdminUser> {
    const { data } = await api.get<{ data: AdminUser }>(`/admin/users/${id}`)
    return data.data
  },

  async updateUserStatus(id: number, status: string): Promise<{ message: string; data: AdminUser }> {
    const { data } = await api.patch<{ message: string; data: AdminUser }>(`/admin/users/${id}/status`, { status })
    return data
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`)
  },

  async pendingTutors(): Promise<AdminUser[]> {
    const { data } = await api.get<{ data: AdminUser[] }>('/admin/tutors/pending')
    return data.data
  },

  async approveTutor(id: number): Promise<{ message: string; data: AdminUser }> {
    const { data } = await api.post<{ message: string; data: AdminUser }>(`/admin/tutors/${id}/approve`)
    return data
  },

  async rejectTutor(id: number): Promise<{ message: string; data: AdminUser }> {
    const { data } = await api.post<{ message: string; data: AdminUser }>(`/admin/tutors/${id}/reject`)
    return data
  },
}
