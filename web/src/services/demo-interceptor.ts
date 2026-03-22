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
  LEADERBOARD, MENTAL_DOJO_COURSES, TUTOR_REELS,
  QUESTION_BANK, DAILY_MISSIONS, STREAK_DATA,
  FORUM_CATEGORIES, FORUM_THREADS, FORUM_REPLIES,
} from './demo-data'
import type { BankQuestion, ForumThread, ForumReply } from './demo-data'

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
  return localStorage.getItem('demo') === 'true' || localStorage.getItem('demo-mode') === 'true'
}

export function enableDemoMode(): void {
  localStorage.setItem('demo', 'true')
  localStorage.setItem('demo-mode', 'true')
  localStorage.setItem('token', 'demo-token-mentivara-student')
}

export function disableDemoMode(): void {
  localStorage.removeItem('demo')
  localStorage.removeItem('token')
}

// ── Exam session state ──────────────────────────────────────
interface ExamSession {
  id: number
  questions: BankQuestion[]
  answers: Record<number, { marks_awarded: number; marks_available: number }>
  started_at: string
}
const examSessions: Record<number, ExamSession> = {}
let nextExamId = 1

/** Shuffle array in place (Fisher-Yates) and return it */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Simple keyword match: how many mark-scheme points does the answer hit? */
function scoreStructured(answer: string, markScheme: string[]): number {
  const normalised = answer.toLowerCase()
  let hits = 0
  // Stop words to ignore when matching
  const stopWords = new Set(['the', 'and', 'that', 'with', 'for', 'are', 'from', 'this', 'into', 'each', 'been', 'have', 'has', 'does', 'not', 'can', 'will', 'they', 'then', 'than', 'when', 'which', 'there', 'their', 'what', 'about', 'would', 'make', 'been', 'more', 'some', 'could', 'them', 'other', 'number'])
  for (const point of markScheme) {
    const cleaned = point.replace(/;$/, '').toLowerCase()
    // Extract meaningful words (length > 3, not stop words)
    const words = cleaned.split(/[\s\/,]+/).filter((w) => w.length > 3 && !stopWords.has(w))
    if (words.length === 0) continue
    // Count how many key words appear in the answer
    const matched = words.filter((w) => normalised.includes(w)).length
    // Award the mark if at least 40% of key words match
    const threshold = Math.max(1, Math.ceil(words.length * 0.4))
    if (matched >= threshold) {
      hits++
    }
  }
  return hits
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
  // Strip base URL prefix, trailing ? and query params for cleaner matching
  const rawUrl = config.url ?? ''
  const url = rawUrl.replace(/^\/api\/v\d+/, '').split('?')[0]
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
    const body = JSON.parse(config.data ?? '{}')
    const {
      syllabus_id,
      topic_ids,
      question_count = 10,
      difficulty,
      question_types,
    } = body as {
      syllabus_id?: string
      topic_ids?: string[]
      question_count?: number
      difficulty?: number
      question_types?: string[]
    }

    // Filter the question bank
    let pool: BankQuestion[] = [...QUESTION_BANK]
    if (syllabus_id) pool = pool.filter((q) => q.syllabus_id === syllabus_id)
    if (topic_ids && topic_ids.length > 0) pool = pool.filter((q) => topic_ids.includes(q.topic_id))
    if (difficulty) pool = pool.filter((q) => q.difficulty <= difficulty)
    if (question_types && question_types.length > 0) pool = pool.filter((q) => question_types.includes(q.type))

    // Randomly select the requested count
    const selected = shuffle(pool).slice(0, question_count)

    const examId = nextExamId++
    examSessions[examId] = {
      id: examId,
      questions: selected,
      answers: {},
      started_at: new Date().toISOString(),
    }

    return {
      data: ok({
        id: examId,
        questions: selected.map((q) => ({
          id: q.id,
          type: q.type,
          content: q.content,
          options: q.options ?? null,
          marks: q.marks,
          difficulty: q.difficulty,
          topic_id: q.topic_id,
          subtopic: q.subtopic,
        })),
        title: `CIE AS Biology — Topic ${topic_ids?.[0] ?? '1.1'}`,
        started_at: examSessions[examId].started_at,
      }),
      status: 201,
    }
  }
  const answerMatch = url.match(/^\/exams\/(\d+)\/answer$/)
  if (answerMatch && method === 'post') {
    const examId = Number(answerMatch[1])
    const session = examSessions[examId]
    const body = JSON.parse(config.data ?? '{}')
    const { question_id, answer } = body as { question_id: number; answer: string }
    const question = (session?.questions ?? QUESTION_BANK).find((q) => q.id === question_id)
    if (!question) {
      return { data: { is_correct: false, marks_awarded: 0, marks_available: 1, mark_scheme: [], explanation: 'Question not found.' }, status: 200 }
    }

    let marksAwarded = 0
    let isCorrect = false

    if (question.type === 'mcq') {
      const ans = answer.trim().toUpperCase()
      const ca = question.correct_answer.trim()
      // Support both letter answers ('A','B','C','D') and full-text answers
      if (ca.length === 1 && 'ABCD'.includes(ca)) {
        // correct_answer is a letter
        isCorrect = ans === ca
      } else if (ans.length === 1 && 'ABCD'.includes(ans) && question.options) {
        // answer is a letter, correct_answer is full text — match by index
        const selectedIdx = 'ABCD'.indexOf(ans)
        isCorrect = question.options[selectedIdx]?.trim().toLowerCase() === ca.toLowerCase()
      } else {
        isCorrect = ans.toLowerCase() === ca.toLowerCase()
      }
      marksAwarded = isCorrect ? question.marks : 0
    } else {
      // structured / extended — keyword matching against mark scheme
      marksAwarded = scoreStructured(answer, question.mark_scheme)
      marksAwarded = Math.min(marksAwarded, question.marks)
      isCorrect = marksAwarded === question.marks
    }

    // Track in session
    if (session) {
      session.answers[question_id] = { marks_awarded: marksAwarded, marks_available: question.marks }
    }

    return {
      data: {
        is_correct: isCorrect,
        marks_awarded: marksAwarded,
        marks_available: question.marks,
        mark_scheme: question.mark_scheme,
        explanation: question.explanation,
      },
      status: 200,
    }
  }
  const completeMatch = url.match(/^\/exams\/(\d+)\/complete$/)
  if (completeMatch && method === 'post') {
    const examId = Number(completeMatch[1])
    const session = examSessions[examId]

    if (!session) {
      return { data: { score: 0, total_marks: 0, percentage: 0, grade: 'U', time_taken: 0, topic_breakdown: [], weak_topics: [] }, status: 200 }
    }

    const timeTaken = Math.round((Date.now() - new Date(session.started_at).getTime()) / 1000)
    let totalAwarded = 0
    let totalAvailable = 0

    // Per-subtopic aggregation
    const subtopicMap: Record<string, { marks_got: number; marks_available: number }> = {}

    for (const q of session.questions) {
      const result = session.answers[q.id] ?? { marks_awarded: 0, marks_available: q.marks }
      totalAwarded += result.marks_awarded
      totalAvailable += result.marks_available

      if (!subtopicMap[q.subtopic]) {
        subtopicMap[q.subtopic] = { marks_got: 0, marks_available: 0 }
      }
      subtopicMap[q.subtopic].marks_got += result.marks_awarded
      subtopicMap[q.subtopic].marks_available += result.marks_available
    }

    const percentage = totalAvailable > 0 ? Math.round((totalAwarded / totalAvailable) * 100) : 0
    let grade: string
    if (percentage >= 80) grade = 'A'
    else if (percentage >= 70) grade = 'B'
    else if (percentage >= 60) grade = 'C'
    else if (percentage >= 50) grade = 'D'
    else if (percentage >= 40) grade = 'E'
    else grade = 'U'

    const topicBreakdown = Object.entries(subtopicMap).map(([topic, data]) => ({
      topic,
      marks_got: data.marks_got,
      marks_available: data.marks_available,
      percentage: data.marks_available > 0 ? Math.round((data.marks_got / data.marks_available) * 100) : 0,
    }))

    const weakTopics = topicBreakdown.filter((t) => t.percentage < 50).map((t) => t.topic)

    // Clean up the session
    delete examSessions[examId]

    return {
      data: {
        score: totalAwarded,
        total_marks: totalAvailable,
        percentage,
        grade,
        time_taken: timeTaken,
        topic_breakdown: topicBreakdown,
        weak_topics: weakTopics,
      },
      status: 200,
    }
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

  // ── Tutor Reels ───────────────────────────────────────────
  if (url === '/reels' && method === 'get') {
    const params = new URLSearchParams(rawUrl.split('?')[1] ?? '')
    const subject = params.get('subject')
    const filtered = subject && subject !== 'All'
      ? TUTOR_REELS.filter((r) => r.subject === subject)
      : TUTOR_REELS
    return { data: ok(filtered), status: 200 }
  }
  const reelLikeMatch = url.match(/^\/reels\/(\d+)\/like$/)
  if (reelLikeMatch && method === 'post') {
    const reelId = Number(reelLikeMatch[1])
    const reel = TUTOR_REELS.find((r) => r.id === reelId)
    if (reel) {
      reel.isLiked = !reel.isLiked
      reel.likes += reel.isLiked ? 1 : -1
    }
    return { data: ok({ isLiked: reel?.isLiked, likes: reel?.likes }), status: 200 }
  }
  const reelSaveMatch = url.match(/^\/reels\/(\d+)\/save$/)
  if (reelSaveMatch && method === 'post') {
    const reelId = Number(reelSaveMatch[1])
    const reel = TUTOR_REELS.find((r) => r.id === reelId)
    if (reel) reel.isSaved = !reel.isSaved
    return { data: ok({ isSaved: reel?.isSaved }), status: 200 }
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
        missions: DAILY_MISSIONS,
        streak: STREAK_DATA,
      }),
      status: 200,
    }
  }
  const missionCompleteMatch = url.match(/^\/study-missions\/(\d+)\/complete$/)
  if (missionCompleteMatch && method === 'post') {
    const missionId = Number(missionCompleteMatch[1])
    const mission = DAILY_MISSIONS.find((m) => m.id === missionId)
    if (mission) {
      mission.completed = true
      STREAK_DATA.todayXp += mission.xp
      STREAK_DATA.totalXp += mission.xp
    }
    return {
      data: ok({
        mission_id: missionId,
        completed: true,
        xp_earned: mission?.xp ?? 0,
        today_xp: STREAK_DATA.todayXp,
        total_xp: STREAK_DATA.totalXp,
      }),
      status: 200,
    }
  }

  // ── Forum ─────────────────────────────────────────────────
  if (url === '/forum/categories' && method === 'get') {
    return { data: ok(FORUM_CATEGORIES), status: 200 }
  }
  const forumCategoryThreads = url.match(/^\/forum\/categories\/(\d+)\/threads$/)
  if (forumCategoryThreads && method === 'get') {
    const categoryId = Number(forumCategoryThreads[1])
    const params = new URLSearchParams(rawUrl.split('?')[1] ?? '')
    const sort = params.get('sort') ?? 'latest'
    let threads = FORUM_THREADS.filter((t) => t.categoryId === categoryId)
    if (sort === 'popular') threads = [...threads].sort((a, b) => b.likes - a.likes)
    else if (sort === 'unanswered') threads = threads.filter((t) => t.replyCount === 0)
    // Pinned first
    threads = [...threads.filter((t) => t.pinned), ...threads.filter((t) => !t.pinned)]
    return { data: ok(threads), status: 200 }
  }
  const forumThreadDetail = url.match(/^\/forum\/threads\/(\d+)$/)
  if (forumThreadDetail && method === 'get') {
    const threadId = Number(forumThreadDetail[1])
    const thread = FORUM_THREADS.find((t) => t.id === threadId)
    const replies = FORUM_REPLIES.filter((r) => r.threadId === threadId)
    return { data: ok({ thread, replies }), status: 200 }
  }
  if (url === '/forum/threads' && method === 'post') {
    const body = JSON.parse(config.data ?? '{}')
    const newThread: ForumThread = {
      id: Date.now(),
      categoryId: body.categoryId ?? 1,
      title: body.title ?? 'New Thread',
      author: { name: DEMO_USER.name, avatar: null },
      content: body.content ?? '',
      createdAt: 'Just now',
      likes: 0,
      replyCount: 0,
      tags: body.tags ?? [],
      pinned: false,
      solved: false,
    }
    FORUM_THREADS.unshift(newThread)
    const cat = FORUM_CATEGORIES.find((c) => c.id === newThread.categoryId)
    if (cat) cat.threadCount++
    return { data: ok(newThread), status: 201 }
  }
  const forumReplyPost = url.match(/^\/forum\/threads\/(\d+)\/reply$/)
  if (forumReplyPost && method === 'post') {
    const threadId = Number(forumReplyPost[1])
    const body = JSON.parse(config.data ?? '{}')
    const newReply: ForumReply = {
      id: Date.now(),
      threadId,
      author: { name: DEMO_USER.name, avatar: null },
      content: body.content ?? '',
      createdAt: 'Just now',
      likes: 0,
      isBestAnswer: false,
      parentReplyId: body.parentReplyId ?? null,
    }
    FORUM_REPLIES.push(newReply)
    const thread = FORUM_THREADS.find((t) => t.id === threadId)
    if (thread) thread.replyCount++
    return { data: ok(newReply), status: 201 }
  }
  const forumLike = url.match(/^\/forum\/threads\/(\d+)\/like$/)
  if (forumLike && method === 'post') {
    const threadId = Number(forumLike[1])
    const thread = FORUM_THREADS.find((t) => t.id === threadId)
    if (thread) thread.likes++
    return { data: ok({ likes: thread?.likes }), status: 200 }
  }

  // ── Catch-all: return empty success ─────────────────────
  console.warn(`[Demo] Unhandled: ${method.toUpperCase()} ${url}`)
  return { data: ok(null), status: 200 }
}
