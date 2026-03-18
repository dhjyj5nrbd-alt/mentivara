export type UserRole = 'admin' | 'tutor' | 'student' | 'parent'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  avatar?: string
  created_at: string
}

export interface TutorProfile {
  id: number
  user_id: number
  bio: string
  qualifications: string
  intro_video_url?: string
  verified: boolean
  onboarding_complete: boolean
  user?: User
}

export interface Student {
  id: number
  user_id: number
  year_group?: string
  target_grades?: string
  user?: User
}

export interface Parent {
  id: number
  user_id: number
  students?: Student[]
  user?: User
}
