import api from './api'

// Lesson Package
export interface LessonPackage {
  id: number
  lesson_id: number
  summary: string | null
  key_notes: string[] | null
  flashcards: { front: string; back: string }[] | null
  practice_questions: { question: string; hint: string }[] | null
  homework: string | null
  status: 'pending' | 'generating' | 'completed' | 'failed'
}

// Doubt
export interface DoubtItem {
  id: number
  student_id: number
  tutor_id: number | null
  question_text: string
  image_url: string | null
  ai_answer: string | null
  tutor_answer: string | null
  status: string
  student?: { id: number; name: string }
  tutor?: { id: number; name: string }
  created_at: string
}

// Exam
export interface ExamQuestion {
  id: number
  type: string
  content: string
  options: string[] | null
  difficulty: string
}

export interface ExamSessionData {
  session: any
  questions: ExamQuestion[]
}

// Knowledge Map
export interface KnowledgeEntry {
  topic_id: number
  topic_name: string
  subject: string
  level: string
  mastery_pct: number
  questions_attempted: number
  questions_correct: number
}

export const aiService = {
  // Lesson packages
  async generatePackage(lessonId: number): Promise<LessonPackage> {
    const { data } = await api.post<{ data: LessonPackage }>(`/lessons/${lessonId}/package/generate`)
    return data.data
  },
  async getPackage(lessonId: number): Promise<LessonPackage> {
    const { data } = await api.get<{ data: LessonPackage }>(`/lessons/${lessonId}/package`)
    return data.data
  },

  // AI Copilot
  async copilot(lessonId: number, action: string, topic: string, context?: string) {
    const { data } = await api.post<{ data: { action: string; topic: string; response: string } }>(
      `/classroom/${lessonId}/copilot`, { action, topic, context }
    )
    return data.data
  },

  // Doubts
  async askDoubt(questionText: string, subjectId?: number) {
    const { data } = await api.post<{ data: DoubtItem }>('/doubts', { question_text: questionText, subject_id: subjectId })
    return data.data
  },
  async listDoubts() {
    const { data } = await api.get('/doubts')
    return data
  },
  async escalateDoubt(id: number, tutorId: number) {
    const { data } = await api.post<{ data: DoubtItem }>(`/doubts/${id}/escalate`, { tutor_id: tutorId })
    return data.data
  },

  // Exams
  async startExam(subjectId: number, levelId: number, title: string, questionCount = 10) {
    const { data } = await api.post<{ data: ExamSessionData }>('/exams/start', {
      subject_id: subjectId, level_id: levelId, title, question_count: questionCount,
    })
    return data.data
  },
  async submitAnswer(sessionId: number, questionId: number, answer: string) {
    const { data } = await api.post(`/exams/${sessionId}/answer`, { question_id: questionId, answer })
    return data.data
  },
  async completeExam(sessionId: number) {
    const { data } = await api.post(`/exams/${sessionId}/complete`)
    return data.data
  },
  async examHistory() {
    const { data } = await api.get('/exams/history')
    return data
  },

  // Knowledge Map
  async getKnowledgeMap() {
    const { data } = await api.get<{ data: Record<string, KnowledgeEntry[]> }>('/knowledge-map')
    return data.data
  },
  async getWeakTopics() {
    const { data } = await api.get('/knowledge-map/weak-topics')
    return data.data
  },

  // Topics
  async getTopics(subjectId?: number, levelId?: number) {
    const params = new URLSearchParams()
    if (subjectId) params.set('subject_id', String(subjectId))
    if (levelId) params.set('level_id', String(levelId))
    const { data } = await api.get(`/topics?${params}`)
    return data
  },
}
