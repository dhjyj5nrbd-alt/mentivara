import { useState } from 'react'
import {
  Search, ChevronRight, ChevronLeft, BookOpen, Brain, FileText,
  StickyNote, TrendingUp, Clock, CheckCircle2, AlertCircle,
  CalendarPlus, HelpCircle, Star, MessageSquare, BarChart3,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

// ── Types ────────────────────────────────────────────────────
interface HomeworkSubmission {
  answer: string
  submittedDate: string
}

interface HomeworkReview {
  grade: string
  feedback: string
}

interface StudentHomework {
  id: number
  title: string
  dueDate: string
  status: 'submitted' | 'pending' | 'overdue'
  submission?: HomeworkSubmission
  review?: HomeworkReview
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
  masteryHistory: number[] // last 4 weeks
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

const INITIAL_STUDENTS: TutorStudent[] = [
  {
    id: 1, name: 'Alex Johnson', avatar: STUDENT_PHOTOS[0],
    subject: 'Mathematics', level: 'GCSE', nextLesson: 'Mon 10:00am',
    totalLessons: 24, mastery: 72, masteryHistory: [62, 65, 68, 72],
    knowledgeMapSummary: ['Algebra — Strong', 'Geometry — Moderate', 'Statistics — Weak', 'Trigonometry — Developing'],
    notes: 'Struggling with word problems. Responds well to visual examples. Prefers morning sessions.',
    lessonHistory: [
      { date: '18 Mar 2026', subject: 'Mathematics', topic: 'Quadratic equations', duration: 60 },
      { date: '14 Mar 2026', subject: 'Mathematics', topic: 'Linear graphs', duration: 60 },
      { date: '11 Mar 2026', subject: 'Mathematics', topic: 'Simultaneous equations', duration: 60 },
      { date: '7 Mar 2026', subject: 'Mathematics', topic: 'Algebraic fractions', duration: 60 },
    ],
    homework: [
      { id: 101, title: 'Quadratic equations worksheet', dueDate: '25 Mar 2026', status: 'pending' },
      { id: 102, title: 'Graph plotting exercises', dueDate: '20 Mar 2026', status: 'submitted', submission: { answer: 'Completed all 12 graph plotting exercises. Struggled with question 8 on inverse functions.', submittedDate: '19 Mar 2026' } },
      { id: 103, title: 'Simultaneous equations practice', dueDate: '14 Mar 2026', status: 'submitted', submission: { answer: 'All questions attempted. Used substitution method for most. Elimination method for Q5-Q7.', submittedDate: '13 Mar 2026' }, review: { grade: 'B', feedback: 'Good work overall. Pay attention to sign errors in elimination method.' } },
      { id: 104, title: 'Algebraic fractions quiz', dueDate: '10 Mar 2026', status: 'submitted', submission: { answer: 'Completed the quiz scoring 18/25. Missed simplification steps on complex fractions.', submittedDate: '9 Mar 2026' }, review: { grade: 'C', feedback: 'Need more practice with complex fraction simplification. Review common denominators.' } },
    ],
  },
  {
    id: 2, name: 'Priya Sharma', avatar: STUDENT_PHOTOS[4],
    subject: 'Physics', level: 'A-Level', nextLesson: 'Tue 2:00pm',
    totalLessons: 18, mastery: 85, masteryHistory: [78, 80, 82, 85],
    knowledgeMapSummary: ['Mechanics — Strong', 'Waves — Strong', 'Electricity — Moderate', 'Nuclear — Developing'],
    notes: 'Excelling in mechanics. Needs more practice with circuit diagrams. Very self-motivated.',
    lessonHistory: [
      { date: '17 Mar 2026', subject: 'Physics', topic: 'Electromagnetic induction', duration: 60 },
      { date: '13 Mar 2026', subject: 'Physics', topic: 'Capacitors', duration: 60 },
      { date: '10 Mar 2026', subject: 'Physics', topic: 'Electric fields', duration: 60 },
    ],
    homework: [
      { id: 201, title: 'Electromagnetic induction problems', dueDate: '24 Mar 2026', status: 'pending' },
      { id: 202, title: 'Capacitor calculations', dueDate: '17 Mar 2026', status: 'submitted', submission: { answer: 'All 10 problems completed. Used both series and parallel capacitor formulas correctly.', submittedDate: '16 Mar 2026' }, review: { grade: 'A', feedback: 'Excellent work. Clear methodology shown throughout.' } },
      { id: 203, title: 'Electric field diagrams', dueDate: '13 Mar 2026', status: 'submitted', submission: { answer: 'Drew field lines for point charges, parallel plates, and combined fields.', submittedDate: '12 Mar 2026' } },
      { id: 204, title: 'Coulombs law practice set', dueDate: '7 Mar 2026', status: 'submitted', submission: { answer: 'Completed all 8 questions with full working shown.', submittedDate: '6 Mar 2026' }, review: { grade: 'A', feedback: 'Perfect score. Excellent understanding of inverse square law.' } },
    ],
  },
  {
    id: 3, name: 'Marcus Williams', avatar: STUDENT_PHOTOS[1],
    subject: 'Chemistry', level: 'GCSE', nextLesson: 'Wed 11:00am',
    totalLessons: 31, mastery: 64, masteryHistory: [55, 58, 61, 64],
    knowledgeMapSummary: ['Atomic structure — Moderate', 'Bonding — Weak', 'Organic chemistry — Developing', 'Rates — Moderate'],
    notes: 'Finds bonding concepts difficult. Enjoys practical experiments. Benefits from repetition.',
    lessonHistory: [
      { date: '19 Mar 2026', subject: 'Chemistry', topic: 'Organic chemistry intro', duration: 90 },
      { date: '12 Mar 2026', subject: 'Chemistry', topic: 'Rates of reaction', duration: 60 },
      { date: '5 Mar 2026', subject: 'Chemistry', topic: 'Ionic bonding', duration: 60 },
    ],
    homework: [
      { id: 301, title: 'Organic naming exercises', dueDate: '26 Mar 2026', status: 'pending' },
      { id: 302, title: 'Rate calculations', dueDate: '19 Mar 2026', status: 'overdue' },
      { id: 303, title: 'Ionic bonding worksheet', dueDate: '12 Mar 2026', status: 'submitted', submission: { answer: 'Completed diagrams for NaCl, MgO, and CaF2. Struggled with dot-cross for MgCl2.', submittedDate: '11 Mar 2026' }, review: { grade: 'C', feedback: 'Good effort on simpler compounds. Review electron transfer for compounds with multiple bonds.' } },
      { id: 304, title: 'Atomic structure revision', dueDate: '5 Mar 2026', status: 'submitted', submission: { answer: 'Answered all 15 multiple choice questions and 3 extended response questions.', submittedDate: '4 Mar 2026' }, review: { grade: 'B', feedback: 'Solid understanding of electron configuration. Work on isotope calculations.' } },
    ],
  },
  {
    id: 4, name: 'Sophie Chen', avatar: STUDENT_PHOTOS[2],
    subject: 'Mathematics', level: 'A-Level', nextLesson: 'Thu 3:00pm',
    totalLessons: 42, mastery: 91, masteryHistory: [86, 88, 90, 91],
    knowledgeMapSummary: ['Pure maths — Strong', 'Statistics — Strong', 'Mechanics — Strong', 'Further maths — Developing'],
    notes: 'Top performer. Preparing for Oxbridge entrance. Working through STEP problems.',
    lessonHistory: [
      { date: '20 Mar 2026', subject: 'Mathematics', topic: 'STEP paper practice', duration: 90 },
      { date: '16 Mar 2026', subject: 'Mathematics', topic: 'Integration techniques', duration: 60 },
      { date: '13 Mar 2026', subject: 'Mathematics', topic: 'Differential equations', duration: 60 },
      { date: '9 Mar 2026', subject: 'Mathematics', topic: 'Complex numbers', duration: 60 },
    ],
    homework: [
      { id: 401, title: 'STEP II 2024 Q3-Q5', dueDate: '27 Mar 2026', status: 'pending' },
      { id: 402, title: 'Integration by parts exercises', dueDate: '20 Mar 2026', status: 'submitted', submission: { answer: 'All 15 integration problems completed. Used tabular method for repeated integration by parts.', submittedDate: '19 Mar 2026' } },
      { id: 403, title: 'Differential equations problem set', dueDate: '16 Mar 2026', status: 'submitted', submission: { answer: 'Solved all first and second order DEs. Applied boundary conditions correctly.', submittedDate: '15 Mar 2026' }, review: { grade: 'A', feedback: 'Outstanding work. Ready for STEP-level DE problems.' } },
      { id: 404, title: 'Complex number proofs', dueDate: '12 Mar 2026', status: 'submitted', submission: { answer: 'Completed proofs for De Moivre theorem applications and roots of unity.', submittedDate: '11 Mar 2026' }, review: { grade: 'A', feedback: 'Flawless proofs. Excellent use of mathematical notation.' } },
    ],
  },
  {
    id: 5, name: 'Oliver Brown', avatar: STUDENT_PHOTOS[3],
    subject: 'Biology', level: 'GCSE', nextLesson: null,
    totalLessons: 15, mastery: 58, masteryHistory: [52, 54, 56, 58],
    knowledgeMapSummary: ['Cells — Moderate', 'Genetics — Weak', 'Ecology — Moderate', 'Human biology — Developing'],
    notes: 'Missed several sessions recently. Needs support with genetics. Consider rescheduling to afternoons.',
    lessonHistory: [
      { date: '6 Mar 2026', subject: 'Biology', topic: 'Cell division', duration: 60 },
      { date: '27 Feb 2026', subject: 'Biology', topic: 'DNA structure', duration: 60 },
    ],
    homework: [
      { id: 501, title: 'Cell division worksheet', dueDate: '13 Mar 2026', status: 'overdue' },
      { id: 502, title: 'Genetics crossword', dueDate: '6 Mar 2026', status: 'overdue' },
      { id: 503, title: 'DNA structure labelling', dueDate: '2 Mar 2026', status: 'submitted', submission: { answer: 'Labelled all parts of the DNA double helix. Identified base pairs correctly.', submittedDate: '1 Mar 2026' }, review: { grade: 'B', feedback: 'Good diagram work. Remember the anti-parallel nature of the strands.' } },
      { id: 504, title: 'Cell organelles quiz', dueDate: '24 Feb 2026', status: 'submitted', submission: { answer: 'Completed quiz scoring 14/20. Mixed up smooth and rough ER functions.', submittedDate: '23 Feb 2026' }, review: { grade: 'C', feedback: 'Review the differences between smooth and rough ER. Also revise Golgi apparatus function.' } },
    ],
  },
  {
    id: 6, name: 'Emma Davis', avatar: STUDENT_PHOTOS[6],
    subject: 'English', level: 'GCSE', nextLesson: 'Fri 9:30am',
    totalLessons: 20, mastery: 76, masteryHistory: [68, 71, 74, 76],
    knowledgeMapSummary: ['Essay writing — Strong', 'Poetry analysis — Moderate', 'Shakespeare — Developing', 'Grammar — Strong'],
    notes: 'Confident writer but lacks analytical depth in poetry. Working on PEE paragraph structure.',
    lessonHistory: [
      { date: '21 Mar 2026', subject: 'English', topic: 'Unseen poetry', duration: 60 },
      { date: '14 Mar 2026', subject: 'English', topic: 'Macbeth Act 3', duration: 60 },
      { date: '7 Mar 2026', subject: 'English', topic: 'Essay structure', duration: 60 },
    ],
    homework: [
      { id: 601, title: 'Poetry comparison essay', dueDate: '28 Mar 2026', status: 'pending' },
      { id: 602, title: 'Macbeth character analysis', dueDate: '21 Mar 2026', status: 'submitted', submission: { answer: 'Wrote 800-word analysis of Lady Macbeth character arc across Acts 1-3.', submittedDate: '20 Mar 2026' } },
      { id: 603, title: 'PEE paragraph practice', dueDate: '14 Mar 2026', status: 'submitted', submission: { answer: 'Wrote 5 PEE paragraphs analyzing different poems from the anthology.', submittedDate: '13 Mar 2026' }, review: { grade: 'B', feedback: 'Good use of evidence. Explanations need more depth - connect to wider themes.' } },
      { id: 604, title: 'Grammar exercises set 4', dueDate: '7 Mar 2026', status: 'submitted', submission: { answer: 'Completed all grammar exercises including semicolons, colons, and apostrophes.', submittedDate: '6 Mar 2026' }, review: { grade: 'A', feedback: 'Perfect score on grammar exercises. Well done!' } },
    ],
  },
  {
    id: 7, name: 'James Taylor', avatar: STUDENT_PHOTOS[5],
    subject: 'Physics', level: 'GCSE', nextLesson: 'Mon 2:00pm',
    totalLessons: 12, mastery: 69, masteryHistory: [60, 63, 66, 69],
    knowledgeMapSummary: ['Forces — Moderate', 'Energy — Strong', 'Waves — Weak', 'Electricity — Developing'],
    notes: 'New student. Good intuition for physics but needs exam technique practice.',
    lessonHistory: [
      { date: '17 Mar 2026', subject: 'Physics', topic: 'Waves and sound', duration: 60 },
      { date: '10 Mar 2026', subject: 'Physics', topic: 'Energy transfers', duration: 60 },
    ],
    homework: [
      { id: 701, title: 'Wave equation problems', dueDate: '24 Mar 2026', status: 'pending' },
      { id: 702, title: 'Energy calculations worksheet', dueDate: '17 Mar 2026', status: 'submitted', submission: { answer: 'Completed all kinetic and potential energy calculations. Used correct units throughout.', submittedDate: '16 Mar 2026' }, review: { grade: 'B', feedback: 'Good calculations. Remember to show all working for full marks in exams.' } },
      { id: 703, title: 'Forces diagram practice', dueDate: '10 Mar 2026', status: 'submitted', submission: { answer: 'Drew free body diagrams for 8 different scenarios including friction and tension.', submittedDate: '9 Mar 2026' } },
      { id: 704, title: 'Physics key terms glossary', dueDate: '3 Mar 2026', status: 'submitted', submission: { answer: 'Defined 30 key physics terms with examples for each.', submittedDate: '2 Mar 2026' }, review: { grade: 'A', feedback: 'Thorough definitions with clear examples. Great reference material.' } },
    ],
  },
  {
    id: 8, name: 'Amara Okafor', avatar: STUDENT_PHOTOS[7],
    subject: 'Chemistry', level: 'A-Level', nextLesson: 'Wed 4:00pm',
    totalLessons: 28, mastery: 82, masteryHistory: [74, 77, 80, 82],
    knowledgeMapSummary: ['Physical chemistry — Strong', 'Organic — Moderate', 'Inorganic — Strong', 'Practical skills — Strong'],
    notes: 'Aiming for medicine. Strong practical skills. Working on organic reaction mechanisms.',
    lessonHistory: [
      { date: '19 Mar 2026', subject: 'Chemistry', topic: 'Nucleophilic substitution', duration: 60 },
      { date: '12 Mar 2026', subject: 'Chemistry', topic: 'Enthalpy calculations', duration: 60 },
      { date: '5 Mar 2026', subject: 'Chemistry', topic: 'Transition metals', duration: 60 },
    ],
    homework: [
      { id: 801, title: 'Mechanism drawing practice', dueDate: '26 Mar 2026', status: 'pending' },
      { id: 802, title: 'Enthalpy cycle problems', dueDate: '19 Mar 2026', status: 'submitted', submission: { answer: 'Completed Hess cycle calculations for 6 reactions. Used Born-Haber cycles for ionic compounds.', submittedDate: '18 Mar 2026' } },
      { id: 803, title: 'Transition metal compounds', dueDate: '12 Mar 2026', status: 'submitted', submission: { answer: 'Identified colours and oxidation states for 10 transition metal compounds.', submittedDate: '11 Mar 2026' }, review: { grade: 'A', feedback: 'Excellent understanding of d-block chemistry. Well prepared for practical exam.' } },
      { id: 804, title: 'Organic functional groups', dueDate: '5 Mar 2026', status: 'submitted', submission: { answer: 'Classified 20 molecules by functional group and predicted reaction types.', submittedDate: '4 Mar 2026' }, review: { grade: 'B', feedback: 'Good classification. Review carbonyl group reactions - nucleophilic addition needs work.' } },
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

const WEEK_LABELS = ['3 weeks ago', '2 weeks ago', 'Last week', 'This week']

const GRADE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F']

// ── Component ────────────────────────────────────────────────
export default function TutorStudents() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'homework'>('overview')
  const [students, setStudents] = useState<TutorStudent[]>(INITIAL_STUDENTS)

  // Editable notes state
  const [editingNotes, setEditingNotes] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)

  // Homework review state
  const [reviewingHwId, setReviewingHwId] = useState<number | null>(null)
  const [reviewGrade, setReviewGrade] = useState('B')
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [reviewSaved, setReviewSaved] = useState<number | null>(null)

  // Mastery tooltip state
  const [showMasteryInfo, setShowMasteryInfo] = useState(false)

  const navigate = useNavigate()

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.subject.toLowerCase().includes(search.toLowerCase()),
  )

  const selected = selectedId !== null ? students.find((s) => s.id === selectedId) ?? null : null

  function handleStartEditNotes() {
    if (!selected) return
    setEditingNotes(selected.notes)
    setIsEditingNotes(true)
    setNotesSaved(false)
  }

  function handleSaveNotes() {
    if (!selected) return
    setStudents((prev) =>
      prev.map((s) => (s.id === selected.id ? { ...s, notes: editingNotes } : s)),
    )
    setIsEditingNotes(false)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 3000)
  }

  function handleSubmitReview(hwId: number) {
    if (!selected) return
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== selected.id) return s
        return {
          ...s,
          homework: s.homework.map((hw) => {
            if (hw.id !== hwId) return hw
            return { ...hw, review: { grade: reviewGrade, feedback: reviewFeedback } }
          }),
        }
      }),
    )
    setReviewingHwId(null)
    setReviewGrade('B')
    setReviewFeedback('')
    setReviewSaved(hwId)
    setTimeout(() => setReviewSaved(null), 3000)
  }

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Students</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {students.length} students across {new Set(students.map((s) => s.subject)).size} subjects
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
              onClick={() => { setSelectedId(null); setActiveTab('overview'); setIsEditingNotes(false) }}
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
                {/* Schedule Lesson button */}
                <button
                  onClick={() => navigate('/tutor/availability')}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-colors shrink-0"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Schedule Lesson
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-[#232536]">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'overview'
                      ? 'border-[#7C3AED] text-[#7C3AED]'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('homework')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'homework'
                      ? 'border-[#7C3AED] text-[#7C3AED]'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Homework
                </button>
              </div>

              {activeTab === 'overview' ? (
                <>
                  {/* Progress Chart */}
                  <div className="mb-6">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      <BarChart3 className="w-4 h-4 text-[#7C3AED]" /> Progress Trend (Last 4 Weeks)
                    </h3>
                    <div className="flex items-end gap-3 h-32 bg-slate-50 dark:bg-[#1a1d2e] rounded-lg p-4">
                      {selected.masteryHistory.map((score, i) => {
                        const maxScore = Math.max(...selected.masteryHistory, 100)
                        const barHeight = Math.max((score / maxScore) * 96, 8)
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className={`text-xs font-semibold ${masteryColor(score)}`}>{score}%</span>
                            <div className="w-full flex justify-center">
                              <div
                                className={`w-full max-w-[40px] rounded-t-md ${masteryBg(score)} transition-all`}
                                style={{ height: `${barHeight}px` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 text-center">{WEEK_LABELS[i]}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Knowledge Map */}
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        <Brain className="w-4 h-4 text-[#7C3AED]" /> Knowledge Map
                        {/* Mastery info tooltip */}
                        <div className="relative inline-block">
                          <button
                            onMouseEnter={() => setShowMasteryInfo(true)}
                            onMouseLeave={() => setShowMasteryInfo(false)}
                            onClick={() => setShowMasteryInfo(!showMasteryInfo)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                          {showMasteryInfo && (
                            <div className="absolute left-0 top-full mt-1 z-10 px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg shadow-lg w-64">
                              Based on exam simulator results, lesson assessments, and homework performance.
                            </div>
                          )}
                        </div>
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

                    {/* Editable Notes */}
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        <StickyNote className="w-4 h-4 text-[#7C3AED]" /> Tutor Notes
                      </h3>
                      {isEditingNotes ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingNotes}
                            onChange={(e) => setEditingNotes(e.target.value)}
                            rows={4}
                            className="w-full text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#1a1d2e] rounded-lg p-3 border border-slate-200 dark:border-[#232536] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] resize-y"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveNotes}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-colors"
                            >
                              Save Notes
                            </button>
                            <button
                              onClick={() => setIsEditingNotes(false)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#1a1d2e] rounded-lg p-3">
                            {selected.notes}
                          </p>
                          <button
                            onClick={handleStartEditNotes}
                            className="mt-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            Edit Notes
                          </button>
                          {notesSaved && (
                            <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">
                              Notes saved successfully!
                            </span>
                          )}
                        </div>
                      )}
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

                    {/* Homework summary (quick view) */}
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        <FileText className="w-4 h-4 text-[#7C3AED]" /> Homework
                      </h3>
                      <div className="space-y-2">
                        {selected.homework.slice(0, 3).map((hw) => (
                          <div key={hw.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50 dark:bg-[#1a1d2e]">
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
                        {selected.homework.length > 3 && (
                          <button
                            onClick={() => setActiveTab('homework')}
                            className="text-xs text-[#7C3AED] hover:underline"
                          >
                            View all {selected.homework.length} homework items
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Homework tab */
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-4">
                    <FileText className="w-4 h-4 text-[#7C3AED]" /> All Homework ({selected.homework.length})
                  </h3>
                  <div className="space-y-3">
                    {selected.homework.map((hw) => (
                      <div key={hw.id} className="rounded-lg border border-slate-200 dark:border-[#232536] bg-slate-50 dark:bg-[#1a1d2e] p-4">
                        {/* Homework header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {hw.status === 'submitted' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : hw.status === 'overdue' ? (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-500" />
                            )}
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{hw.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Due: {hw.dueDate}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${statusBadge(hw.status)}`}>
                              {hw.status}
                            </span>
                          </div>
                        </div>

                        {/* Submission */}
                        {hw.submission && (
                          <div className="mt-3 pl-6">
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" /> Student Submission ({hw.submission.submittedDate})
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-[#161822] rounded-lg p-3 border border-slate-100 dark:border-[#232536]">
                              {hw.submission.answer}
                            </p>
                          </div>
                        )}

                        {/* Existing review */}
                        {hw.review && (
                          <div className="mt-3 pl-6">
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                              <Star className="w-3 h-3" /> Your Review
                            </div>
                            <div className="bg-white dark:bg-[#161822] rounded-lg p-3 border border-slate-100 dark:border-[#232536]">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-[#7C3AED]">Grade: {hw.review.grade}</span>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{hw.review.feedback}</p>
                            </div>
                            {reviewSaved === hw.id && (
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium mt-1 inline-block">
                                Review saved successfully!
                              </span>
                            )}
                          </div>
                        )}

                        {/* Review form for submitted but unreviewed homework */}
                        {hw.submission && !hw.review && (
                          <div className="mt-3 pl-6">
                            {reviewingHwId === hw.id ? (
                              <div className="bg-white dark:bg-[#161822] rounded-lg p-3 border border-slate-100 dark:border-[#232536] space-y-3">
                                <div className="flex items-center gap-3">
                                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Grade:</label>
                                  <select
                                    value={reviewGrade}
                                    onChange={(e) => setReviewGrade(e.target.value)}
                                    className="text-sm rounded-md bg-slate-50 dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-700 dark:text-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                                  >
                                    {GRADE_OPTIONS.map((g) => (
                                      <option key={g} value={g}>{g}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Feedback:</label>
                                  <textarea
                                    value={reviewFeedback}
                                    onChange={(e) => setReviewFeedback(e.target.value)}
                                    rows={3}
                                    placeholder="Write feedback for the student..."
                                    className="w-full text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#1a1d2e] rounded-md p-2 border border-slate-200 dark:border-[#232536] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 resize-y placeholder:text-slate-400"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSubmitReview(hw.id)}
                                    disabled={!reviewFeedback.trim()}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Submit Review
                                  </button>
                                  <button
                                    onClick={() => { setReviewingHwId(null); setReviewFeedback(''); setReviewGrade('B') }}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setReviewingHwId(hw.id); setReviewGrade('B'); setReviewFeedback('') }}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-colors"
                              >
                                Review & Grade
                              </button>
                            )}
                            {reviewSaved === hw.id && (
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium mt-1 inline-block">
                                Review saved successfully!
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
