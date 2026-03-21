/**
 * Axios interceptor that returns mock data when demo mode is active.
 * Intercepts requests BEFORE they hit the network and returns fake responses.
 */
import type { InternalAxiosRequestConfig } from 'axios'
import {
  DEMO_USER, SUBJECTS, LEVELS, TUTORS,
  UPCOMING_LESSONS, PAST_LESSONS, KNOWLEDGE_MAP,
  EXAM_QUESTIONS, EXAM_ANSWERS, DOUBTS, PAYMENTS,
  LESSON_PACKAGE, AVAILABILITY, CONVERSATIONS, MESSAGES,
  LEADERBOARD, MENTAL_DOJO_COURSES,
} from './demo-data'

// Re-export TUTOR_LIST for the interceptor since it's computed in demo-data
// Actually we need to compute it here since demo-data doesn't export it
const TUTOR_LIST_ITEMS = TUTORS.map((t) => ({
  id: t.id,
  name: t.user.name,
  avatar: t.user.avatar,
  bio: t.bio,
  verified: t.verified,
  subjects: t.subjects.map((s) => ({
    name: s.subject?.name ?? '',
    levels: [s.level?.name ?? ''],
  })),
}))

export function isDemoMode(): boolean {
  return localStorage.getItem('demo') === 'true'
}

export function enableDemoMode(): void {
  localStorage.setItem('demo', 'true')
  localStorage.setItem('token', 'demo-token-mentivara-student')
}

export function disableDemoMode(): void {
  localStorage.removeItem('demo')
  localStorage.removeItem('token')
}

/** Tiny helper – wraps value in { data: value } like Laravel API Resources */
function ok<T>(data: T) {
  return { data }
}

/** Simulates a short network delay */
function delay(ms = 200): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Attempts to match the request to a mock handler.
 * Returns the mock response data, or null if no match (should not happen in demo mode).
 */
export async function handleDemoRequest(
  config: InternalAxiosRequestConfig
): Promise<{ data: unknown; status: number } | null> {
  // Strip trailing ? and query params for cleaner matching
  const rawUrl = config.url ?? ''
  const url = rawUrl.split('?')[0]
  const method = (config.method ?? 'get').toLowerCase()

  await delay(150 + Math.random() * 200)

  // ── Auth ────────────────────────────────────────────────
  if (url === '/me' && method === 'get') {
    return { data: { user: DEMO_USER }, status: 200 }
  }
  if (url === '/login' && method === 'post') {
    return { data: { user: DEMO_USER, token: 'demo-token' }, status: 200 }
  }
  if (url === '/logout' && method === 'post') {
    return { data: { message: 'Logged out' }, status: 200 }
  }

  // ── Reference data ──────────────────────────────────────
  if (url === '/subjects' && method === 'get') {
    return { data: SUBJECTS, status: 200 }
  }
  if (url === '/levels' && method === 'get') {
    return { data: LEVELS, status: 200 }
  }

  // ── Tutors ──────────────────────────────────────────────
  if (url === '/tutors' && method === 'get') {
    return {
      data: {
        data: TUTOR_LIST_ITEMS,
        meta: { current_page: 1, last_page: 1, per_page: 15, total: TUTOR_LIST_ITEMS.length },
      },
      status: 200,
    }
  }
  const tutorMatch = url.match(/^\/tutors\/(\d+)$/)
  if (tutorMatch && method === 'get') {
    const tutor = TUTORS.find((t) => t.id === Number(tutorMatch[1]))
    return { data: ok(tutor ?? TUTORS[0]), status: 200 }
  }
  const availMatch = url.match(/^\/tutors\/(\d+)\/availability$/)
  if (availMatch && method === 'get') {
    return { data: ok(AVAILABILITY), status: 200 }
  }

  // ── Booking ─────────────────────────────────────────────
  if (url === '/student/book' && method === 'post') {
    return {
      data: ok({
        id: 99,
        ...UPCOMING_LESSONS[0],
        notes: 'Demo booking',
        status: 'scheduled',
      }),
      status: 201,
    }
  }

  // ── Lessons ─────────────────────────────────────────────
  if (url === '/lessons/upcoming' && method === 'get') {
    return { data: ok(UPCOMING_LESSONS), status: 200 }
  }
  if (url === '/lessons/past' && method === 'get') {
    return { data: ok(PAST_LESSONS), status: 200 }
  }
  const cancelMatch = url.match(/^\/lessons\/(\d+)\/cancel$/)
  if (cancelMatch && method === 'post') {
    return { data: ok({ message: 'Lesson cancelled' }), status: 200 }
  }
  const packageMatch = url.match(/^\/lessons\/(\d+)\/package/)
  if (packageMatch) {
    return { data: ok(LESSON_PACKAGE), status: 200 }
  }

  // ── Classroom (return minimal data for demo) ────────────
  const classroomJoin = url.match(/^\/classroom\/(\d+)\/join$/)
  if (classroomJoin && method === 'get') {
    return {
      data: {
        lesson: {
          id: Number(classroomJoin[1]),
          tutor_id: 10,
          student_id: 1,
          tutor_name: 'Dr Sarah Mitchell',
          student_name: 'Alex Johnson',
          subject: 'Mathematics',
          scheduled_at: new Date().toISOString(),
          duration_minutes: 60,
          status: 'in_progress',
        },
        messages: [],
        strokes: [],
        user_id: 1,
        role: 'student',
        peer_id: 10,
      },
      status: 200,
    }
  }
  if (url.includes('/classroom/') && url.includes('/messages') && method === 'get') {
    return { data: ok([]), status: 200 }
  }
  if (url.includes('/classroom/') && url.includes('/messages') && method === 'post') {
    return {
      data: ok({
        id: Date.now(),
        lesson_id: 1,
        user_id: 1,
        body: JSON.parse(config.data ?? '{}').body ?? '',
        type: 'text',
        user: { id: 1, name: 'Alex Johnson', avatar: null },
        created_at: new Date().toISOString(),
      }),
      status: 201,
    }
  }
  if (url.includes('/whiteboard/') || url.includes('/signal/')) {
    return { data: ok([]), status: 200 }
  }
  if (url.includes('/classroom/') && url.includes('/end') && method === 'post') {
    return { data: ok({ message: 'Lesson ended' }), status: 200 }
  }

  // ── Exam Simulator ──────────────────────────────────────
  if (url === '/exams/start' && method === 'post') {
    return {
      data: ok({
        id: 1,
        questions: EXAM_QUESTIONS,
        title: 'Demo Exam',
        started_at: new Date().toISOString(),
      }),
      status: 201,
    }
  }
  const answerMatch = url.match(/^\/exams\/(\d+)\/answer$/)
  if (answerMatch && method === 'post') {
    const body = JSON.parse(config.data ?? '{}')
    const answer = EXAM_ANSWERS[body.question_id] ?? { is_correct: false, explanation: 'Incorrect.' }
    return { data: answer, status: 200 }
  }
  const completeMatch = url.match(/^\/exams\/(\d+)\/complete$/)
  if (completeMatch && method === 'post') {
    return { data: { score: 72, correct: 4, total: 5, grade_prediction: 'Grade 7' }, status: 200 }
  }

  // ── Knowledge Map ───────────────────────────────────────
  if (url === '/knowledge-map' && method === 'get') {
    return { data: ok(KNOWLEDGE_MAP), status: 200 }
  }

  // ── Doubt Solver ────────────────────────────────────────
  if (url === '/doubts' && method === 'get') {
    return { data: ok(DOUBTS), status: 200 }
  }
  if (url === '/doubts' && method === 'post') {
    const body = JSON.parse(config.data ?? '{}')
    const newDoubt = {
      id: Date.now(),
      student_id: 1,
      tutor_id: null,
      question_text: body.question_text ?? 'Demo question',
      image_url: null,
      ai_answer: 'This is a demo AI response. In production, the AI will generate a detailed explanation based on your question and subject area.',
      tutor_answer: null,
      status: 'ai_answered',
      created_at: new Date().toISOString(),
    }
    return { data: ok(newDoubt), status: 201 }
  }

  // ── Payments ────────────────────────────────────────────
  if (url === '/payments' && method === 'get') {
    return { data: ok(PAYMENTS), status: 200 }
  }

  // ── Messages ────────────────────────────────────────────
  if (url === '/messages/conversations' && method === 'get') {
    return { data: ok(CONVERSATIONS), status: 200 }
  }
  const msgMatch = url.match(/^\/messages\/(\d+)$/)
  if (msgMatch && method === 'get') {
    return { data: ok(MESSAGES), status: 200 }
  }
  if (url.startsWith('/messages') && method === 'post') {
    return {
      data: ok({
        id: Date.now(),
        sender_id: 1,
        receiver_id: 10,
        body: JSON.parse(config.data ?? '{}').body ?? 'Demo message',
        read_at: null,
        created_at: new Date().toISOString(),
      }),
      status: 201,
    }
  }

  // ── Leaderboard ─────────────────────────────────────────
  if (url === '/leaderboard' && method === 'get') {
    return { data: ok(LEADERBOARD), status: 200 }
  }

  // ── Mental Dojo ─────────────────────────────────────────
  if (url === '/mental-dojo/courses' && method === 'get') {
    return { data: ok(MENTAL_DOJO_COURSES), status: 200 }
  }
  const courseMatch = url.match(/^\/mental-dojo\/courses\/(.+)$/)
  if (courseMatch && method === 'get') {
    const course = MENTAL_DOJO_COURSES.find((c) => c.slug === courseMatch[1] || c.id === Number(courseMatch[1]))
    return { data: ok(course ?? MENTAL_DOJO_COURSES[0]), status: 200 }
  }
  if (url.includes('/mental-dojo/') && url.includes('/progress') && method === 'post') {
    return { data: ok({ message: 'Progress saved' }), status: 200 }
  }

  // ── Study coach / missions ──────────────────────────────
  if (url === '/study-coach/recommendations' && method === 'get') {
    return {
      data: ok([
        { type: 'weak_topic', message: 'Trigonometry is your weakest area at 45%. Try 10 practice questions today.' },
        { type: 'streak', message: 'You\'re on a 7-day streak! Keep it going.' },
        { type: 'revision', message: 'Your Biology exam is in 2 weeks. Start revising Cell Biology.' },
      ]),
      status: 200,
    }
  }
  if (url === '/study-missions/today' && method === 'get') {
    return {
      data: ok({
        id: 1,
        user_id: 1,
        date: new Date().toISOString().split('T')[0],
        tasks: [
          { type: 'flashcards', subject: 'Mathematics', count: 10, completed: false },
          { type: 'quiz', subject: 'Biology', count: 5, completed: false },
          { type: 'exercise', subject: 'Mental Dojo', activity: 'Box Breathing', completed: true },
        ],
        completed: false,
      }),
      status: 200,
    }
  }

  // ── Catch-all: return empty success ─────────────────────
  console.warn(`[Demo] Unhandled: ${method.toUpperCase()} ${url}`)
  return { data: ok(null), status: 200 }
}
