import api from './api'

export interface ClassroomData {
  lesson: {
    id: number
    tutor_id: number
    student_id: number
    tutor_name: string
    student_name: string
    subject: string | null
    scheduled_at: string
    duration_minutes: number
    status: string
  }
  messages: ChatMessage[]
  strokes: WhiteboardStroke[]
  user_id: number
  role: 'tutor' | 'student'
  peer_id: number
}

export interface ChatMessage {
  id: number
  lesson_id: number
  user_id: number
  body: string
  type: string
  user?: { id: number; name: string; avatar: string | null }
  created_at: string
}

export interface WhiteboardStroke {
  id: number
  lesson_id: number
  user_id: number
  data: any
  created_at: string
}

export interface WebrtcSignal {
  id: number
  from_user_id: number
  to_user_id: number
  type: 'offer' | 'answer' | 'ice-candidate'
  payload: any
}

export const classroomService = {
  async join(lessonId: number): Promise<ClassroomData> {
    const { data } = await api.get<ClassroomData>(`/classroom/${lessonId}/join`)
    return data
  },

  async end(lessonId: number): Promise<void> {
    await api.post(`/classroom/${lessonId}/end`)
  },

  async sendMessage(lessonId: number, body: string): Promise<ChatMessage> {
    const { data } = await api.post<{ data: ChatMessage }>(`/classroom/${lessonId}/messages`, { body })
    return data.data
  },

  async pollMessages(lessonId: number, afterId: number): Promise<ChatMessage[]> {
    const { data } = await api.get<{ data: ChatMessage[] }>(`/classroom/${lessonId}/messages/poll?after=${afterId}`)
    return data.data
  },

  async addStroke(lessonId: number, strokeData: any): Promise<void> {
    await api.post(`/classroom/${lessonId}/whiteboard/strokes`, { data: strokeData })
  },

  async pollStrokes(lessonId: number, afterId: number): Promise<WhiteboardStroke[]> {
    const { data } = await api.get<{ data: WhiteboardStroke[] }>(`/classroom/${lessonId}/whiteboard/strokes/poll?after=${afterId}`)
    return data.data
  },

  async clearWhiteboard(lessonId: number): Promise<void> {
    await api.delete(`/classroom/${lessonId}/whiteboard`)
  },

  async sendSignal(lessonId: number, toUserId: number, type: string, payload: any): Promise<void> {
    await api.post(`/classroom/${lessonId}/signal`, { to_user_id: toUserId, type, payload })
  },

  async pollSignals(lessonId: number): Promise<WebrtcSignal[]> {
    const { data } = await api.get<{ data: WebrtcSignal[] }>(`/classroom/${lessonId}/signal/poll`)
    return data.data
  },
}
