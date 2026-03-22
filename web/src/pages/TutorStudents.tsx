import { useState } from 'react'
import {
  Search, ChevronRight, ChevronLeft, BookOpen, Brain, FileText,
  StickyNote, TrendingUp, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react'
import Layout from '../components/Layout'

// ── Types ────────────────────────────────────────────────────
interface StudentHomework {
  title: string
  dueDate: string
  status: 'submitted' | 'pending' | 'overdue'
}

interface LessonRecord {
  date: string
  subject: string
  topic: string
  duration: number
}

interface TutorStudent {
  id: number
  name: string
  avatar: string
  subject: string
  level: string
  nextLesson: string | null
  totalLessons: number
  mastery: number
  knowledgeMapSummary: string[]
  notes: string
  lessonHistory: LessonRecord[]
  homework: StudentHomework[]
}

// ── Demo data ────────────────────────────────────────────────
const STUDENT_PHOTOS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face',
]

const DEMO_STUDENTS: TutorStudent[] = [
  {
    id: 1, name: 'Alex Johnson', avatar: STUDENT_PHOTOS[0],
    subject: 'Mathematics', level: 'GCSE', nextLesson: 'Mon 10:00am',
    totalLessons: 24, mastery: 72,
    knowledgeMapSummary: ['Algebra — Strong', 'Geometry — Moderate', 'Statistics — Weak', 'Trigonometry — Developing'],
    notes: 'Struggling with word problems. Responds well to visual examples. Prefers morning sessions.',
    lessonHistory: [
      { date: '18 Mar 2026', subject: 'Mathematics', topic: 'Quadratic equations', duration: 60 },
      { date: '14 Mar 2026', subject: 'Mathematics', topic: 'Linear graphs', duration: 60 },
      { date: '11 Mar 2026', subject: 'Mathematics', topic: 'Simultaneous equations', duration: 60 },
      { date: '7 Mar 2026', subject: 'Mathematics', topic: 'Algebraic fractions', duration: 60 },
    ],
    homework: [
      { title: 'Quadratic equations worksheet', dueDate: '25 Mar 2026', status: 'pending' },
      { title: 'Graph plotting exercises', dueDate: '20 Mar 2026', status: 'submitted' },
      { title: 'Simultaneous equations practice', dueDate: '14 Mar 2026', status: 'submitted' },
    ],
  },
  {
    id: 2, name: 'Priya Sharma', avatar: STUDENT_PHOTOS[4],
    subject: 'Physics', level: 'A-Level', nextLesson: 'Tue 2:00pm',
    totalLessons: 18, mastery: 85,
    knowledgeMapSummary: ['Mechanics — Strong', 'Waves — Strong', 'Electricity — Moderate', 'Nuclear — Developing'],
    notes: 'Excelling in mechanics. Needs more practice with circuit diagrams. Very self-motivated.',
    lessonHistory: [
      { date: '17 Mar 2026', subject: 'Physics', topic: 'Electromagnetic induction', duration: 60 },
      { date: '13 Mar 2026', subject: 'Physics', topic: 'Capacitors', duration: 60 },
      { date: '10 Mar 2026', subject: 'Physics', topic: 'Electric fields', duration: 60 },
    ],
    homework: [
      { title: 'Electromagnetic induction problems', dueDate: '24 Mar 2026', status: 'pending' },
      { title: 'Capacitor calculations', dueDate: '17 Mar 2026', status: 'submitted' },
    ],
  },
  {
    id: 3, name: 'Marcus Williams', avatar: STUDENT_PHOTOS[1],
    subject: 'Chemistry', level: 'GCSE', nextLesson: 'Wed 11:00am',
    totalLessons: 31, mastery: 64,
    knowledgeMapSummary: ['Atomic structure — Moderate', 'Bonding — Weak', 'Organic chemistry — Developing', 'Rates — Moderate'],
    notes: 'Finds bonding concepts difficult. Enjoys practical experiments. Benefits from repetition.',
    lessonHistory: [
      { date: '19 Mar 2026', subject: 'Chemistry', topic: 'Organic chemistry intro', duration: 90 },
      { date: '12 Mar 2026', subject: 'Chemistry', topic: 'Rates of reaction', duration: 60 },
      { date: '5 Mar 2026', subject: 'Chemistry', topic: 'Ionic bonding', duration: 60 },
    ],
    homework: [
      { title: 'Organic naming exercises', dueDate: '26 Mar 2026', status: 'pending' },
      { title: 'Rate calculations', dueDate: '19 Mar 2026', status: 'overdue' },
    ],
  },
  {
    id: 4, name: 'Sophie Chen', avatar: STUDENT_PHOTOS[2],
    subject: 'Mathematics', level: 'A-Level', nextLesson: 'Thu 3:00pm',
    totalLessons: 42, mastery: 91,
    knowledgeMapSummary: ['Pure maths — Strong', 'Statistics — Strong', 'Mechanics — Strong', 'Further maths — Developing'],
    notes: 'Top performer. Preparing for Oxbridge entrance. Working through STEP problems.',
    lessonHistory: [
      { date: '20 Mar 2026', subject: 'Mathematics', topic: 'STEP paper practice', duration: 90 },
      { date: '16 Mar 2026', subject: 'Mathematics', topic: 'Integration techniques', duration: 60 },
      { date: '13 Mar 2026', subject: 'Mathematics', topic: 'Differential equations', duration: 60 },
      { date: '9 Mar 2026', subject: 'Mathematics', topic: 'Complex numbers', duration: 60 },
    ],
    homework: [
      { title: 'STEP II 2024 Q3-Q5', dueDate: '27 Mar 2026', status: 'pending' },
      { title: 'Integration by parts exercises', dueDate: '20 Mar 2026', status: 'submitted' },
    ],
  },
  {
    id: 5, name: 'Oliver Brown', avatar: STUDENT_PHOTOS[3],
    subject: 'Biology', level: 'GCSE', nextLesson: null,
    totalLessons: 15, mastery: 58,
    knowledgeMapSummary: ['Cells — Moderate', 'Genetics — Weak', 'Ecology — Moderate', 'Human biology — Developing'],
    notes: 'Missed several sessions recently. Needs support with genetics. Consider rescheduling to afternoons.',
    lessonHistory: [
      { date: '6 Mar 2026', subject: 'Biology', topic: 'Cell division', duration: 60 },
      { date: '27 Feb 2026', subject: 'Biology', topic: 'DNA structure', duration: 60 },
    ],
    homework: [
      { title: 'Cell division worksheet', dueDate: '13 Mar 2026', status: 'overdue' },
      { title: 'Genetics crossword', dueDate: '6 Mar 2026', status: 'overdue' },
    ],
  },
  {
    id: 6, name: 'Emma Davis', avatar: STUDENT_PHOTOS[6],
    subject: 'English', level: 'GCSE', nextLesson: 'Fri 9:30am',
    totalLessons: 20, mastery: 76,
    knowledgeMapSummary: ['Essay writing — Strong', 'Poetry analysis — Moderate', 'Shakespeare — Developing', 'Grammar — Strong'],
    notes: 'Confident writer but lacks analytical depth in poetry. Working on PEE paragraph structure.',
    lessonHistory: [
      { date: '21 Mar 2026', subject: 'English', topic: 'Unseen poetry', duration: 60 },
      { date: '14 Mar 2026', subject: 'English', topic: 'Macbeth Act 3', duration: 60 },
      { date: '7 Mar 2026', subject: 'English', topic: 'Essay structure', duration: 60 },
    ],
    homework: [
      { title: 'Poetry comparison essay', dueDate: '28 Mar 2026', status: 'pending' },
      { title: 'Macbeth character analysis', dueDate: '21 Mar 2026', status: 'submitted' },
    ],
  },
  {
    id: 7, name: 'James Taylor', avatar: STUDENT_PHOTOS[5],
    subject: 'Physics', level: 'GCSE', nextLesson: 'Mon 2:00pm',
    totalLessons: 12, mastery: 69,
    knowledgeMapSummary: ['Forces — Moderate', 'Energy — Strong', 'Waves — Weak', 'Electricity — Developing'],
    notes: 'New student. Good intuition for physics but needs exam technique practice.',
    lessonHistory: [
      { date: '17 Mar 2026', subject: 'Physics', topic: 'Waves and sound', duration: 60 },
      { date: '10 Mar 2026', subject: 'Physics', topic: 'Energy transfers', duration: 60 },
    ],
    homework: [
      { title: 'Wave equation problems', dueDate: '24 Mar 2026', status: 'pending' },
    ],
  },
  {
    id: 8, name: 'Amara Okafor', avatar: STUDENT_PHOTOS[7],
    subject: 'Chemistry', level: 'A-Level', nextLesson: 'Wed 4:00pm',
    totalLessons: 28, mastery: 82,
    knowledgeMapSummary: ['Physical chemistry — Strong', 'Organic — Moderate', 'Inorganic — Strong', 'Practical skills — Strong'],
    notes: 'Aiming for medicine. Strong practical skills. Working on organic reaction mechanisms.',
    lessonHistory: [
      { date: '19 Mar 2026', subject: 'Chemistry', topic: 'Nucleophilic substitution', duration: 60 },
      { date: '12 Mar 2026', subject: 'Chemistry', topic: 'Enthalpy calculations', duration: 60 },
      { date: '5 Mar 2026', subject: 'Chemistry', topic: 'Transition metals', duration: 60 },
    ],
    homework: [
      { title: 'Mechanism drawing practice', dueDate: '26 Mar 2026', status: 'pending' },
      { title: 'Enthalpy cycle problems', dueDate: '19 Mar 2026', status: 'submitted' },
    ],
  },
]

// ── Mastery colour helpers ───────────────────────────────────
function masteryColor(m: number) {
  if (m >= 80) return 'text-green-600 dark:text-green-400'
  if (m >= 60) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function masteryBg(m: number) {
  if (m >= 80) return 'bg-green-500'
  if (m >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

function statusBadge(status: string) {
  switch (status) {
    case 'submitted':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'pending':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'overdue':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

// ── Component ────────────────────────────────────────────────
export default function TutorStudents() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const filtered = DEMO_STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.subject.toLowerCase().includes(search.toLowerCase()),
  )

  const selected = selectedId !== null ? DEMO_STUDENTS.find((s) => s.id === selectedId) ?? null : null

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Students</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {DEMO_STUDENTS.length} students across {new Set(DEMO_STUDENTS.map((s) => s.subject)).size} subjects
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
          />
        </div>

        {/* Detail panel vs grid */}
        {selected ? (
          <div>
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-1.5 text-sm text-[#7C3AED] hover:underline mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to all students
            </button>

            {/* Student detail */}
            <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <img src={selected.avatar} alt={selected.name} className="w-16 h-16 rounded-full object-cover" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selected.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {selected.subject} &middot; {selected.level} &middot; {selected.totalLessons} lessons
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full max-w-[200px]">
                      <div className={`h-full rounded-full ${masteryBg(selected.mastery)}`} style={{ width: `${selected.mastery}%` }} />
                    </div>
                    <span className={`text-sm font-semibold ${masteryColor(selected.mastery)}`}>{selected.mastery}%</span>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Knowledge Map */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    <Brain className="w-4 h-4 text-[#7C3AED]" /> Knowledge Map
                  </h3>
                  <div className="space-y-2">
                    {selected.knowledgeMapSummary.map((item, i) => {
                      const [topic, level] = item.split(' — ')
                      const levelColor =
                        level === 'Strong' ? 'text-green-600 dark:text-green-400'
                          : level === 'Moderate' ? 'text-amber-600 dark:text-amber-400'
                          : level === 'Weak' ? 'text-red-600 dark:text-red-400'
                          : 'text-blue-600 dark:text-blue-400'
                      return (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-slate-700 dark:text-slate-300">{topic}</span>
                          <span className={`font-medium ${levelColor}`}>{level}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    <StickyNote className="w-4 h-4 text-[#7C3AED]" /> Tutor Notes
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#1a1d2e] rounded-lg p-3">
                    {selected.notes}
                  </p>
                </div>

                {/* Lesson History */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    <BookOpen className="w-4 h-4 text-[#7C3AED]" /> Lesson History
                  </h3>
                  <div className="space-y-2">
                    {selected.lessonHistory.map((l, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50 dark:bg-[#1a1d2e]">
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{l.topic}</span>
                          <span className="text-slate-400 ml-2 text-xs">{l.date}</span>
                        </div>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{l.duration}m
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Homework */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    <FileText className="w-4 h-4 text-[#7C3AED]" /> Homework
                  </h3>
                  <div className="space-y-2">
                    {selected.homework.map((hw, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50 dark:bg-[#1a1d2e]">
                        <div className="flex items-center gap-2">
                          {hw.status === 'submitted' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : hw.status === 'overdue' ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-500" />
                          )}
                          <span className="text-slate-700 dark:text-slate-300">{hw.title}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${statusBadge(hw.status)}`}>
                          {hw.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Student grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedId(student.id)}
                className="text-left bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] p-4 hover:border-[#7C3AED] dark:hover:border-[#7C3AED] transition-colors group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{student.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{student.subject} &middot; {student.level}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[#7C3AED] transition-colors shrink-0" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Mastery</span>
                    <span className={`font-semibold ${masteryColor(student.mastery)}`}>{student.mastery}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <div className={`h-full rounded-full ${masteryBg(student.mastery)}`} style={{ width: `${student.mastery}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {student.totalLessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {student.nextLesson ?? 'No upcoming'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400 dark:text-slate-500">
                No students match your search.
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
