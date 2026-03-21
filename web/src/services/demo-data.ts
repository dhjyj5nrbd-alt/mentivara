/**
 * Demo mode mock data for all student-facing pages.
 * Activated via the "Demo as Student" button on the login page.
 */

export const DEMO_USER = {
  id: 1,
  name: 'Alex Johnson',
  email: 'alex@demo.mentivara.com',
  role: 'student' as const,
  status: 'active',
}

export const DEMO_TOKEN = 'demo-token-mentivara-student'

// ── Reference data ──────────────────────────────────────────

export const SUBJECTS = [
  { id: 1, name: 'Mathematics', slug: 'maths' },
  { id: 2, name: 'English', slug: 'english' },
  { id: 3, name: 'Biology', slug: 'biology' },
  { id: 4, name: 'Chemistry', slug: 'chemistry' },
  { id: 5, name: 'Physics', slug: 'physics' },
]

export const LEVELS = [
  { id: 1, name: 'GCSE', slug: 'gcse' },
  { id: 2, name: 'IGCSE', slug: 'igcse' },
  { id: 3, name: 'AS Level', slug: 'as' },
  { id: 4, name: 'A-Level', slug: 'a-level' },
]

// ── Tutors ──────────────────────────────────────────────────

export const TUTORS = [
  {
    id: 1,
    user_id: 10,
    bio: 'Cambridge Mathematics graduate with 8 years of tutoring experience. I specialise in making complex concepts intuitive through real-world examples and visual learning.',
    qualifications: 'BA Mathematics (Cambridge), PGCE, QTS',
    intro_video_url: null,
    verified: true,
    user: { id: 10, name: 'Dr Sarah Mitchell', email: 'sarah@mentivara.com', avatar: null },
    subjects: [
      { id: 1, subject: SUBJECTS[0], level: LEVELS[0], exam_board: null },
      { id: 2, subject: SUBJECTS[0], level: LEVELS[3], exam_board: null },
    ],
  },
  {
    id: 2,
    user_id: 11,
    bio: 'Passionate science educator with a PhD in Biochemistry. I help students build deep understanding rather than just memorising facts.',
    qualifications: 'PhD Biochemistry (Imperial), MSc Molecular Biology',
    intro_video_url: null,
    verified: true,
    user: { id: 11, name: 'James Chen', email: 'james@mentivara.com', avatar: null },
    subjects: [
      { id: 3, subject: SUBJECTS[2], level: LEVELS[0], exam_board: null },
      { id: 4, subject: SUBJECTS[2], level: LEVELS[3], exam_board: null },
      { id: 5, subject: SUBJECTS[3], level: LEVELS[0], exam_board: null },
    ],
  },
  {
    id: 3,
    user_id: 12,
    bio: 'English Literature enthusiast and published author. I help students develop critical analysis skills and confident essay writing.',
    qualifications: 'MA English Literature (Oxford), Published Author',
    intro_video_url: null,
    verified: true,
    user: { id: 12, name: 'Emma Richardson', email: 'emma@mentivara.com', avatar: null },
    subjects: [
      { id: 6, subject: SUBJECTS[1], level: LEVELS[0], exam_board: null },
      { id: 7, subject: SUBJECTS[1], level: LEVELS[3], exam_board: null },
    ],
  },
  {
    id: 4,
    user_id: 13,
    bio: 'Former physics researcher turned educator. I make abstract physics concepts concrete through experiments and problem-solving.',
    qualifications: 'MSc Physics (UCL), PGCE Secondary Science',
    intro_video_url: null,
    verified: true,
    user: { id: 13, name: 'Dr Raj Patel', email: 'raj@mentivara.com', avatar: null },
    subjects: [
      { id: 8, subject: SUBJECTS[4], level: LEVELS[0], exam_board: null },
      { id: 9, subject: SUBJECTS[4], level: LEVELS[3], exam_board: null },
    ],
  },
]

const TUTOR_LIST = TUTORS.map((t) => ({
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

// ── Lessons ─────────────────────────────────────────────────

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
tomorrow.setHours(10, 0, 0, 0)

const nextWeek = new Date()
nextWeek.setDate(nextWeek.getDate() + 7)
nextWeek.setHours(14, 0, 0, 0)

const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)
yesterday.setHours(15, 0, 0, 0)

const lastWeek = new Date()
lastWeek.setDate(lastWeek.getDate() - 7)
lastWeek.setHours(11, 0, 0, 0)

export const UPCOMING_LESSONS = [
  {
    id: 1,
    tutor: { id: 10, name: 'Dr Sarah Mitchell', avatar: null },
    student: { id: 1, name: 'Alex Johnson', avatar: null },
    subject: { id: 1, name: 'Mathematics' },
    scheduled_at: tomorrow.toISOString(),
    duration_minutes: 60,
    status: 'scheduled',
    is_recurring: true,
    notes: 'Continue with quadratic equations',
    recording_url: null,
  },
  {
    id: 2,
    tutor: { id: 11, name: 'James Chen', avatar: null },
    student: { id: 1, name: 'Alex Johnson', avatar: null },
    subject: { id: 3, name: 'Biology' },
    scheduled_at: nextWeek.toISOString(),
    duration_minutes: 45,
    status: 'scheduled',
    is_recurring: false,
    notes: 'Cell division recap before mock',
    recording_url: null,
  },
]

export const PAST_LESSONS = [
  {
    id: 3,
    tutor: { id: 10, name: 'Dr Sarah Mitchell', avatar: null },
    student: { id: 1, name: 'Alex Johnson', avatar: null },
    subject: { id: 1, name: 'Mathematics' },
    scheduled_at: yesterday.toISOString(),
    duration_minutes: 60,
    status: 'completed',
    is_recurring: true,
    notes: 'Linear equations and graphing',
    recording_url: null,
  },
  {
    id: 4,
    tutor: { id: 12, name: 'Emma Richardson', avatar: null },
    student: { id: 1, name: 'Alex Johnson', avatar: null },
    subject: { id: 2, name: 'English' },
    scheduled_at: lastWeek.toISOString(),
    duration_minutes: 60,
    status: 'completed',
    is_recurring: false,
    notes: 'Essay writing techniques',
    recording_url: null,
  },
]

// ── Knowledge Map ───────────────────────────────────────────

export const KNOWLEDGE_MAP: Record<string, Array<{
  topic_id: number
  topic_name: string
  subject: string
  level: string
  mastery_pct: number
  questions_attempted: number
  questions_correct: number
}>> = {
  Mathematics: [
    { topic_id: 1, topic_name: 'Algebra', subject: 'Mathematics', level: 'GCSE', mastery_pct: 82, questions_attempted: 45, questions_correct: 37 },
    { topic_id: 2, topic_name: 'Trigonometry', subject: 'Mathematics', level: 'GCSE', mastery_pct: 45, questions_attempted: 20, questions_correct: 9 },
    { topic_id: 3, topic_name: 'Geometry', subject: 'Mathematics', level: 'GCSE', mastery_pct: 70, questions_attempted: 30, questions_correct: 21 },
    { topic_id: 4, topic_name: 'Statistics', subject: 'Mathematics', level: 'GCSE', mastery_pct: 90, questions_attempted: 25, questions_correct: 23 },
    { topic_id: 5, topic_name: 'Number', subject: 'Mathematics', level: 'GCSE', mastery_pct: 95, questions_attempted: 50, questions_correct: 48 },
  ],
  Biology: [
    { topic_id: 6, topic_name: 'Cell Biology', subject: 'Biology', level: 'GCSE', mastery_pct: 60, questions_attempted: 15, questions_correct: 9 },
    { topic_id: 7, topic_name: 'Organisation', subject: 'Biology', level: 'GCSE', mastery_pct: 35, questions_attempted: 10, questions_correct: 4 },
    { topic_id: 8, topic_name: 'Infection & Response', subject: 'Biology', level: 'GCSE', mastery_pct: 50, questions_attempted: 12, questions_correct: 6 },
  ],
  English: [
    { topic_id: 9, topic_name: 'Creative Writing', subject: 'English', level: 'GCSE', mastery_pct: 75, questions_attempted: 8, questions_correct: 6 },
    { topic_id: 10, topic_name: 'Reading Comprehension', subject: 'English', level: 'GCSE', mastery_pct: 88, questions_attempted: 16, questions_correct: 14 },
  ],
}

// ── Exam questions ──────────────────────────────────────────

export const EXAM_QUESTIONS = [
  { id: 1, type: 'mcq', content: 'Solve: 2x + 5 = 13', options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'], difficulty: 'easy' },
  { id: 2, type: 'mcq', content: 'What is the gradient of y = 3x − 7?', options: ['3', '-7', '7', '-3'], difficulty: 'easy' },
  { id: 3, type: 'mcq', content: 'Factorise: x² + 5x + 6', options: ['(x+2)(x+3)', '(x+1)(x+6)', '(x-2)(x-3)', '(x+5)(x+1)'], difficulty: 'medium' },
  { id: 4, type: 'short-answer', content: 'Calculate the area of a circle with radius 5cm. Give your answer to 1 decimal place.', options: null, difficulty: 'medium' },
  { id: 5, type: 'mcq', content: 'Which is the correct expansion of (2x + 3)²?', options: ['4x² + 12x + 9', '4x² + 6x + 9', '2x² + 12x + 9', '4x² + 9'], difficulty: 'hard' },
]

export const EXAM_ANSWERS: Record<number, { is_correct: boolean; explanation: string }> = {
  1: { is_correct: true, explanation: '2x + 5 = 13 → 2x = 8 → x = 4. Correct!' },
  2: { is_correct: true, explanation: 'The gradient (slope) is the coefficient of x, which is 3.' },
  3: { is_correct: true, explanation: 'We need two numbers that multiply to 6 and add to 5: 2 and 3.' },
  4: { is_correct: true, explanation: 'Area = πr² = π × 25 = 78.5 cm².' },
  5: { is_correct: true, explanation: '(2x+3)² = 4x² + 12x + 9 using the expansion (a+b)² = a² + 2ab + b².' },
}

// ── Doubts ───────────────────────────────────────────────────

export const DOUBTS = [
  {
    id: 1,
    student_id: 1,
    tutor_id: null,
    question_text: 'How do I find the turning point of a quadratic graph?',
    image_url: null,
    ai_answer: 'To find the turning point of y = ax² + bx + c:\n\n1. The x-coordinate is x = -b/(2a)\n2. Substitute this x value back into the equation to find the y-coordinate\n3. The turning point is a minimum when a > 0, and a maximum when a < 0\n\nFor example, y = 2x² - 8x + 3: x = 8/4 = 2, y = 2(4) - 16 + 3 = -5. Turning point: (2, -5)',
    tutor_answer: null,
    status: 'ai_answered',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 2,
    student_id: 1,
    tutor_id: 10,
    question_text: 'What is the difference between mitosis and meiosis?',
    image_url: null,
    ai_answer: 'Mitosis produces 2 identical diploid cells for growth/repair. Meiosis produces 4 genetically unique haploid cells for reproduction.',
    tutor_answer: 'Great question! The AI summary is correct. Remember the key differences: mitosis = 1 division, meiosis = 2 divisions. Mitosis keeps 46 chromosomes, meiosis halves them to 23. This will definitely come up in your GCSE exam!',
    status: 'tutor_answered',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
]

// ── Payments ────────────────────────────────────────────────

export const PAYMENTS = [
  {
    id: 1, student_id: 1, tutor_id: 10, lesson_id: 3,
    amount: 4500, currency: 'GBP', status: 'completed' as const,
    description: 'Mathematics lesson with Dr Sarah Mitchell',
    student: { id: 1, name: 'Alex Johnson' },
    tutor: { id: 10, name: 'Dr Sarah Mitchell' },
    created_at: yesterday.toISOString(),
  },
  {
    id: 2, student_id: 1, tutor_id: 12, lesson_id: 4,
    amount: 4000, currency: 'GBP', status: 'completed' as const,
    description: 'English lesson with Emma Richardson',
    student: { id: 1, name: 'Alex Johnson' },
    tutor: { id: 12, name: 'Emma Richardson' },
    created_at: lastWeek.toISOString(),
  },
  {
    id: 3, student_id: 1, tutor_id: 10, lesson_id: 1,
    amount: 4500, currency: 'GBP', status: 'pending' as const,
    description: 'Upcoming Mathematics lesson',
    student: { id: 1, name: 'Alex Johnson' },
    tutor: { id: 10, name: 'Dr Sarah Mitchell' },
    created_at: new Date().toISOString(),
  },
]

// ── Lesson Package ──────────────────────────────────────────

export const LESSON_PACKAGE = {
  id: 1,
  lesson_id: 3,
  summary: 'We covered linear equations, plotting straight-line graphs, and finding the equation of a line given two points. Alex demonstrated strong understanding of gradient calculations but needs more practice with y-intercept identification from graph plots.',
  key_notes: [
    'y = mx + c where m is the gradient and c is the y-intercept',
    'Gradient = rise / run = (y₂ - y₁) / (x₂ - x₁)',
    'Parallel lines have the same gradient',
    'Perpendicular lines have gradients that multiply to -1',
  ],
  flashcards: [
    { front: 'What does m represent in y = mx + c?', back: 'The gradient (slope) of the line' },
    { front: 'How do you find the gradient between two points?', back: '(y₂ - y₁) / (x₂ - x₁)' },
    { front: 'What does the y-intercept tell us?', back: 'Where the line crosses the y-axis (when x = 0)' },
    { front: 'When are two lines parallel?', back: 'When they have the same gradient (m₁ = m₂)' },
  ],
  practice_questions: [
    { question: 'Find the equation of a line passing through (2, 5) and (4, 9)', hint: 'First find the gradient, then use y - y₁ = m(x - x₁)' },
    { question: 'Are the lines y = 3x + 1 and y = 3x - 4 parallel?', hint: 'Compare their gradients' },
    { question: 'Find the y-intercept of the line 2y - 6x = 10', hint: 'Rearrange to y = mx + c form' },
  ],
  homework: 'Complete exercises 4.3 and 4.4 from the textbook. Focus on finding equations of lines from two given points. Try at least 5 problems involving perpendicular lines.',
  status: 'completed',
}

// ── Tutor availability ──────────────────────────────────────

export const AVAILABILITY = [
  { id: 1, tutor_profile_id: 1, day_of_week: 1, start_time: '09:00', end_time: '12:00', is_recurring: true, specific_date: null },
  { id: 2, tutor_profile_id: 1, day_of_week: 1, start_time: '14:00', end_time: '17:00', is_recurring: true, specific_date: null },
  { id: 3, tutor_profile_id: 1, day_of_week: 3, start_time: '10:00', end_time: '16:00', is_recurring: true, specific_date: null },
  { id: 4, tutor_profile_id: 1, day_of_week: 5, start_time: '09:00', end_time: '13:00', is_recurring: true, specific_date: null },
]

// ── Messages / conversations ────────────────────────────────

export const CONVERSATIONS = [
  {
    user: { id: 10, name: 'Dr Sarah Mitchell', avatar: null, role: 'tutor' },
    last_message: 'See you tomorrow for our lesson!',
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    unread_count: 1,
  },
  {
    user: { id: 11, name: 'James Chen', avatar: null, role: 'tutor' },
    last_message: 'Great work on the cell biology quiz!',
    last_message_at: new Date(Date.now() - 86400000).toISOString(),
    unread_count: 0,
  },
]

export const MESSAGES = [
  { id: 1, sender_id: 1, receiver_id: 10, body: 'Hi Dr Mitchell, I had a question about the homework', read_at: new Date().toISOString(), created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 2, sender_id: 10, receiver_id: 1, body: 'Of course Alex, what are you stuck on?', read_at: new Date().toISOString(), created_at: new Date(Date.now() - 5400000).toISOString() },
  { id: 3, sender_id: 1, receiver_id: 10, body: 'I can\'t figure out question 3 about perpendicular lines', read_at: new Date().toISOString(), created_at: new Date(Date.now() - 4800000).toISOString() },
  { id: 4, sender_id: 10, receiver_id: 1, body: 'Remember: perpendicular gradients multiply to -1. So if one line has gradient 2, the perpendicular has gradient -1/2. We\'ll go through it tomorrow!', read_at: null, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 5, sender_id: 10, receiver_id: 1, body: 'See you tomorrow for our lesson!', read_at: null, created_at: new Date(Date.now() - 3600000).toISOString() },
]

// ── Leaderboard ─────────────────────────────────────────────

export const LEADERBOARD = [
  { rank: 1, user: { id: 5, name: 'Priya Sharma' }, xp: 2450, streak: 14 },
  { rank: 2, user: { id: 1, name: 'Alex Johnson' }, xp: 1820, streak: 7 },
  { rank: 3, user: { id: 6, name: 'Oliver Williams' }, xp: 1650, streak: 5 },
  { rank: 4, user: { id: 7, name: 'Sophie Brown' }, xp: 1400, streak: 3 },
  { rank: 5, user: { id: 8, name: 'Mohammed Ali' }, xp: 1280, streak: 9 },
]

// ── Mental Dojo ─────────────────────────────────────────────

export const MENTAL_DOJO_COURSES = [
  {
    id: 1, title: 'Exam Calmness', slug: 'exam-calmness', description: 'Techniques to stay calm and focused during exams',
    category: 'calmness', order: 1,
    modules: [
      { id: 1, title: 'Understanding Exam Anxiety', content: 'Learn what causes exam anxiety and how to recognise it.', type: 'lesson', order: 1, duration_minutes: 10 },
      { id: 2, title: 'Box Breathing', content: 'A simple 4-4-4-4 breathing technique to calm your nervous system before an exam.', type: 'exercise', order: 2, duration_minutes: 5 },
    ],
  },
  {
    id: 2, title: 'Focus Training', slug: 'focus-training', description: 'Build deep focus for productive study sessions',
    category: 'focus', order: 2,
    modules: [
      { id: 3, title: 'The Pomodoro Method', content: 'Learn to study in focused 25-minute blocks with short breaks.', type: 'lesson', order: 1, duration_minutes: 8 },
      { id: 4, title: 'Single-Task Challenge', content: 'Practice focusing on one subject without distractions for 15 minutes.', type: 'exercise', order: 2, duration_minutes: 15 },
    ],
  },
  {
    id: 3, title: 'Confidence Building', slug: 'confidence-building', description: 'Build academic self-belief and resilience',
    category: 'confidence', order: 3,
    modules: [
      { id: 5, title: 'Growth Mindset', content: 'Understand how effort, not talent, drives academic success.', type: 'lesson', order: 1, duration_minutes: 12 },
      { id: 6, title: 'Positive Self-Talk', content: 'Replace "I can\'t do this" with "I\'m learning how to do this".', type: 'exercise', order: 2, duration_minutes: 8 },
    ],
  },
]

// ── Tutor Reels ───────────────────────────────────────────

export interface TutorReel {
  id: number
  tutorName: string
  tutorInitial: string
  tutorPhoto: string
  subject: string
  level: string
  title: string
  description: string
  duration: string
  likes: number
  comments: number
  isLiked: boolean
  isSaved: boolean
  isCompetition: boolean
  competitionAnswer?: string
  xpReward?: number
  gradientFrom: string
  gradientTo: string
  gradientVia?: string
}

export const TUTOR_REELS: TutorReel[] = [
  {
    id: 1,
    tutorName: 'Dr. Sarah Chen',
    tutorInitial: 'S',
    tutorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    subject: 'Maths',
    level: 'GCSE',
    title: '3 Quick Tricks for Quadratic Equations',
    description: 'Learn how to factorise any quadratic in under 30 seconds using these simple tricks.',
    duration: '2:45',
    likes: 342,
    comments: 47,
    isLiked: false,
    isSaved: false,
    isCompetition: false,
    gradientFrom: '#3B82F6',
    gradientTo: '#1D4ED8',
    gradientVia: '#2563EB',
  },
  {
    id: 2,
    tutorName: 'Prof. James Wilson',
    tutorInitial: 'J',
    tutorPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    subject: 'English',
    level: 'A-Level',
    title: 'How to Structure a Perfect Essay',
    description: 'The PEEL method will transform your essay writing. Point, Evidence, Explain, Link.',
    duration: '3:10',
    likes: 518,
    comments: 63,
    isLiked: true,
    isSaved: false,
    isCompetition: false,
    gradientFrom: '#F59E0B',
    gradientTo: '#D97706',
    gradientVia: '#FBBF24',
  },
  {
    id: 3,
    tutorName: 'Dr. Emily Brooks',
    tutorInitial: 'E',
    tutorPhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    subject: 'Biology',
    level: 'GCSE',
    title: 'Photosynthesis in 60 Seconds',
    description: 'Carbon dioxide + water + light energy = glucose + oxygen. Here is how it all works.',
    duration: '1:00',
    likes: 891,
    comments: 112,
    isLiked: false,
    isSaved: true,
    isCompetition: false,
    gradientFrom: '#10B981',
    gradientTo: '#059669',
    gradientVia: '#34D399',
  },
  {
    id: 4,
    tutorName: 'Mark Thompson',
    tutorInitial: 'M',
    tutorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    subject: 'Physics',
    level: 'A-Level',
    title: "Newton's Laws Made Simple",
    description: 'Every action has an equal and opposite reaction. But what does that really mean?',
    duration: '2:30',
    likes: 267,
    comments: 34,
    isLiked: false,
    isSaved: false,
    isCompetition: false,
    gradientFrom: '#F97316',
    gradientTo: '#EA580C',
    gradientVia: '#FB923C',
  },
  {
    id: 5,
    tutorName: 'Dr. Sarah Chen',
    tutorInitial: 'S',
    tutorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    subject: 'Exam Tips',
    level: 'All Levels',
    title: 'Exam Day Checklist',
    description: 'The 5 things every student must do before walking into the exam hall.',
    duration: '3:45',
    likes: 1203,
    comments: 189,
    isLiked: false,
    isSaved: false,
    isCompetition: false,
    gradientFrom: '#8B5CF6',
    gradientTo: '#6D28D9',
    gradientVia: '#A78BFA',
  },
  {
    id: 6,
    tutorName: 'Dr. Sarah Chen',
    tutorInitial: 'S',
    tutorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    subject: 'Maths',
    level: 'GCSE',
    title: 'Can you solve this? x\u00B2 + 5x + 6 = 0',
    description: 'Drop your answer below! First correct answer wins 50 XP.',
    duration: '1:30',
    likes: 756,
    comments: 234,
    isLiked: false,
    isSaved: false,
    isCompetition: true,
    competitionAnswer: '(-2,-3)',
    xpReward: 50,
    gradientFrom: '#3B82F6',
    gradientTo: '#7C3AED',
    gradientVia: '#6366F1',
  },
  {
    id: 7,
    tutorName: 'Dr. Emily Brooks',
    tutorInitial: 'E',
    tutorPhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    subject: 'Chemistry',
    level: 'GCSE',
    title: 'Balancing Chemical Equations',
    description: 'The atom-counting method that makes balancing equations easy every time.',
    duration: '2:15',
    likes: 445,
    comments: 56,
    isLiked: false,
    isSaved: false,
    isCompetition: false,
    gradientFrom: '#A855F7',
    gradientTo: '#7C3AED',
    gradientVia: '#C084FC',
  },
  {
    id: 8,
    tutorName: 'Prof. James Wilson',
    tutorInitial: 'J',
    tutorPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    subject: 'English',
    level: 'GCSE',
    title: '5 Common Grammar Mistakes',
    description: "Their, there, they're — and 4 other mistakes that cost you marks every exam.",
    duration: '2:00',
    likes: 623,
    comments: 78,
    isLiked: false,
    isSaved: false,
    isCompetition: false,
    gradientFrom: '#F59E0B',
    gradientTo: '#B45309',
    gradientVia: '#D97706',
  },
]
