import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FlaskConical, Clock, Flag, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, AlertTriangle, Trophy, RotateCcw,
  BookOpen, ChevronDown, ChevronUp, Bookmark,
} from 'lucide-react'
import Layout from '../components/Layout'
import api from '../services/api'

// ── Types ────────────────────────────────────────────────────

interface BankQuestion {
  id: number
  content: string
  type: 'mcq' | 'structured' | 'extended'
  marks: number
  difficulty: number
  topic_id: string
  subtopic: string
  options?: string[] | null
}

interface AnswerFeedback {
  is_correct: boolean
  marks_awarded: number
  marks_available: number
  mark_scheme: string[]
  explanation: string
}

interface TopicBreakdown {
  topic: string
  marks_got: number
  marks_available: number
  percentage: number
}

interface ExamResults {
  score: number
  total_marks: number
  percentage: number
  grade: string
  time_taken: number
  topic_breakdown: TopicBreakdown[]
  weak_topics: string[]
}

type Phase = 'setup' | 'exam' | 'review' | 'results'
type ExamMode = 'practice' | 'exam'
type Difficulty = 'all' | 'foundation' | 'standard' | 'challenging'

// ── Syllabus & Topic Config ──────────────────────────────────

const SYLLABI = [
  { id: 'cie-alevel-bio-9700', label: 'CIE AS & A-Level Biology (9700)' },
  { id: 'cie-igcse-bio-0610', label: 'CIE IGCSE Biology (0610)' },
  { id: 'edx-int-chem', label: 'Edexcel International AS/A2 Chemistry' },
  { id: 'edx-int-bus', label: 'Edexcel International AS/A2 Business Studies' },
  { id: 'cie-alevel-psych-9990', label: 'CIE AS & A-Level Psychology (9990)' },
]

const TOPICS_BY_SYLLABUS: Record<string, { id: string; label: string; available: boolean }[]> = {
  'cie-alevel-bio-9700': [
    { id: 'all', label: 'All Topics', available: true },
    { id: '1.1', label: '1.1 The microscope in cell studies', available: true },
    { id: '1.2', label: '1.2 Cells as the basic units of living organisms', available: true },
    { id: '2.1', label: '2.1 Testing for biological molecules', available: false },
    { id: '2.2', label: '2.2 Carbohydrates and lipids', available: false },
    { id: '3.1', label: '3.1 Enzymes', available: false },
  ],
  'cie-igcse-bio-0610': [
    { id: 'all', label: 'All Topics', available: false },
  ],
  'edx-int-chem': [
    { id: 'all', label: 'All Topics', available: false },
  ],
  'edx-int-bus': [
    { id: 'all', label: 'All Topics', available: false },
  ],
  'cie-alevel-psych-9990': [
    { id: 'all', label: 'All Topics', available: false },
  ],
}

const QUESTION_COUNTS = [5, 10, 15, 20, 25] as const
const TIME_LIMITS = [
  { value: 0, label: 'Off' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
]
const QUESTION_TYPES: ('mcq' | 'structured' | 'extended')[] = ['mcq', 'structured', 'extended']

// ── Helpers ──────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function difficultyStars(d: number, max = 5): string {
  return '\u25CF'.repeat(Math.min(d, max)) + '\u25CB'.repeat(max - Math.min(d, max))
}

function getGradeColor(grade: string): string {
  if (grade === 'A' || grade === 'A*') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  if (grade === 'B') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  if (grade === 'C') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}

function barColor(pct: number): string {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

function resultBadge(awarded: number, available: number) {
  const pct = available > 0 ? awarded / available : 0
  if (pct === 1) return { icon: CheckCircle, text: `${awarded}/${available}`, cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', sym: '\u2713' }
  if (pct === 0) return { icon: XCircle, text: `${awarded}/${available}`, cls: 'text-red-600 bg-red-50 dark:bg-red-900/20', sym: '\u2717' }
  return { icon: AlertTriangle, text: `${awarded}/${available}`, cls: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', sym: '\u25B3' }
}

// ── Component ────────────────────────────────────────────────

export default function ExamSimulator() {
  // Phase
  const [phase, setPhase] = useState<Phase>('setup')

  // Setup state
  const [syllabus, setSyllabus] = useState(SYLLABI[0].id)
  const [topicId, setTopicId] = useState('all')
  const [questionCount, setQuestionCount] = useState<number>(10)
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false)
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30)
  const [difficulty, setDifficulty] = useState<Difficulty>('all')
  const [examMode, setExamMode] = useState<ExamMode>('practice')
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(['mcq', 'structured', 'extended']))
  const [startError, setStartError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)

  // Exam state
  const [sessionId, setSessionId] = useState(0)
  const [questions, setQuestions] = useState<BankQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({}) // user answers
  const [feedback, setFeedback] = useState<Record<number, AnswerFeedback>>({}) // practice feedback
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(0) // seconds
  const [examStartTime, setExamStartTime] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Results state
  const [results, setResults] = useState<ExamResults | null>(null)
  const [expandedReview, setExpandedReview] = useState<Set<number>>(new Set())

  // ── Derived values ─────────────────────────────────────────

  const topics = TOPICS_BY_SYLLABUS[syllabus] ?? []
  const selectedTopic = topics.find((t) => t.id === topicId)
  const totalMarks = useMemo(() => questions.reduce((s, q) => s + q.marks, 0), [questions])
  const answeredCount = Object.keys(answers).length
  const earnedMarks = useMemo(() => {
    let sum = 0
    for (const [qId, fb] of Object.entries(feedback)) {
      sum += fb.marks_awarded
    }
    return sum
  }, [feedback])

  const summaryText = useMemo(() => {
    const parts: string[] = []
    parts.push(`${questionCount} questions`)
    if (timeLimitEnabled) parts.push(`${timeLimitMinutes} minutes`)
    else parts.push('Untimed')
    const t = selectedTopic?.label?.replace(/^\d+\.\d+\s*/, '') || 'All Topics'
    parts.push(t)
    if (difficulty === 'all') parts.push('Mixed difficulty')
    else parts.push(`${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`)
    return parts.join(' \u2022 ')
  }, [questionCount, timeLimitEnabled, timeLimitMinutes, selectedTopic, difficulty])

  // ── Timer ──────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'exam' || !timeLimitEnabled) return
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          timerRef.current = null
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, timeLimitEnabled])

  const handleTimeUp = useCallback(() => {
    alert("Time's up! Your exam will be submitted automatically.")
    submitExam()
  }, [])

  // ── API Calls ──────────────────────────────────────────────

  const startExam = async () => {
    setIsStarting(true)
    setStartError(null)
    try {
      const difficultyMap: Record<Difficulty, number | undefined> = {
        all: undefined,
        foundation: 1,
        standard: 2,
        challenging: 4,
      }
      const topicIds = topicId === 'all' ? undefined : [topicId]
      const { data } = await api.post('/exams/start', {
        syllabus_id: syllabus,
        topic_ids: topicIds,
        question_count: questionCount,
        time_limit: timeLimitEnabled ? timeLimitMinutes : 0,
        difficulty: difficultyMap[difficulty],
        question_types: Array.from(selectedTypes),
        mode: examMode,
      })
      const exam = data.data ?? data
      setSessionId(exam.id)
      setQuestions(exam.questions ?? [])
      setAnswers({})
      setFeedback({})
      setFlagged(new Set())
      setCurrentIdx(0)
      setExpandedReview(new Set())
      setResults(null)
      setExamStartTime(Date.now())
      if (timeLimitEnabled) setTimeRemaining(timeLimitMinutes * 60)
      setPhase('exam')
    } catch (e: any) {
      setStartError(e?.response?.data?.message || 'Failed to start exam. Please try again.')
    } finally {
      setIsStarting(false)
    }
  }

  const checkAnswer = async (questionId: number, answer: string | string[]) => {
    setIsChecking(true)
    try {
      const answerStr = Array.isArray(answer) ? answer.join('\n') : answer
      const { data } = await api.post(`/exams/${sessionId}/answer`, {
        question_id: questionId,
        answer: answerStr,
      })
      const fb = data.data ?? data
      setFeedback((prev) => ({ ...prev, [questionId]: fb }))
    } catch {
      // silently fail in demo
    } finally {
      setIsChecking(false)
    }
  }

  const submitExam = async () => {
    setIsSubmitting(true)
    try {
      const elapsed = Math.round((Date.now() - examStartTime) / 1000)
      const answerList = questions.map((q) => ({
        question_id: q.id,
        answer: Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).join('\n') : (answers[q.id] ?? ''),
      }))

      // In exam mode, submit each answer to get feedback first
      if (examMode === 'exam') {
        for (const a of answerList) {
          if (a.answer) {
            try {
              const { data } = await api.post(`/exams/${sessionId}/answer`, {
                question_id: a.question_id,
                answer: a.answer,
              })
              const fb = data.data ?? data
              setFeedback((prev) => ({ ...prev, [a.question_id]: fb }))
            } catch { /* continue */ }
          }
        }
      }

      const { data } = await api.post(`/exams/${sessionId}/complete`, {
        answers: answerList,
        time_taken: elapsed,
      })
      const res = data.data ?? data
      setResults(res)
      setPhase('results')
    } catch {
      alert('Failed to submit exam. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Event handlers ─────────────────────────────────────────

  const toggleType = (t: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(t)) {
        if (next.size > 1) next.delete(t)
      } else {
        next.add(t)
      }
      return next
    })
  }

  const toggleFlag = (qId: number) => {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(qId)) next.delete(qId)
      else next.add(qId)
      return next
    })
  }

  const setMcqAnswer = (qId: number, letter: string) => {
    if (feedback[qId]) return // already checked
    setAnswers((prev) => ({ ...prev, [qId]: letter }))
    if (examMode === 'practice') {
      checkAnswer(qId, letter)
    }
  }

  const setStructuredAnswer = (qId: number, idx: number, value: string, total: number) => {
    if (feedback[qId]) return
    setAnswers((prev) => {
      const existing = (prev[qId] as string[]) || Array(total).fill('')
      const updated = [...existing]
      updated[idx] = value
      return { ...prev, [qId]: updated }
    })
  }

  const setExtendedAnswer = (qId: number, value: string) => {
    if (feedback[qId]) return
    setAnswers((prev) => ({ ...prev, [qId]: value }))
  }

  const retryExam = () => {
    setAnswers({})
    setFeedback({})
    setFlagged(new Set())
    setCurrentIdx(0)
    setExpandedReview(new Set())
    setResults(null)
    setExamStartTime(Date.now())
    if (timeLimitEnabled) setTimeRemaining(timeLimitMinutes * 60)
    setPhase('exam')
  }

  const newExam = () => {
    setPhase('setup')
    setQuestions([])
    setAnswers({})
    setFeedback({})
    setFlagged(new Set())
    setCurrentIdx(0)
    setExpandedReview(new Set())
    setResults(null)
  }

  // ──────────────────────────────────────────────────────────
  // PHASE: SETUP
  // ──────────────────────────────────────────────────────────

  if (phase === 'setup') {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1E1B4B] dark:text-white">Exam Simulator</h1>
          </div>

          {/* Configuration panel */}
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5 space-y-4">

            {/* Row 1: Syllabus & Topic */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Syllabus</label>
                <select
                  value={syllabus}
                  onChange={(e) => { setSyllabus(e.target.value); setTopicId('all') }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] dark:text-white"
                >
                  {SYLLABI.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Topic</label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] dark:text-white"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id} disabled={!t.available}>
                      {t.label}{!t.available ? ' (Coming soon)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Questions & Time Limit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Questions</label>
                <div className="flex gap-1">
                  {QUESTION_COUNTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setQuestionCount(c)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        questionCount === c
                          ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                          : 'border-slate-300 dark:border-[#2d3048] text-slate-600 dark:text-slate-400 hover:border-[#7C3AED]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Time Limit</label>
                  <button
                    onClick={() => setTimeLimitEnabled(!timeLimitEnabled)}
                    className={`relative w-8 h-[18px] rounded-full transition-colors ${timeLimitEnabled ? 'bg-[#7C3AED]' : 'bg-slate-300 dark:bg-[#2d3048]'}`}
                  >
                    <span className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform ${timeLimitEnabled ? 'left-[16px]' : 'left-[2px]'}`} />
                  </button>
                </div>
                <select
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                  disabled={!timeLimitEnabled}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] dark:text-white disabled:opacity-40"
                >
                  {TIME_LIMITS.filter((t) => t.value > 0).map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Difficulty & Mode */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Difficulty</label>
                <div className="flex gap-1">
                  {(['all', 'foundation', 'standard', 'challenging'] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors border capitalize ${
                        difficulty === d
                          ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                          : 'border-slate-300 dark:border-[#2d3048] text-slate-600 dark:text-slate-400 hover:border-[#7C3AED]'
                      }`}
                    >
                      {d === 'all' ? 'All' : d.slice(0, 5)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Mode</label>
                <div className="flex rounded-lg border border-slate-300 dark:border-[#2d3048] overflow-hidden">
                  <button
                    onClick={() => setExamMode('practice')}
                    className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                      examMode === 'practice'
                        ? 'bg-[#7C3AED] text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#252839]'
                    }`}
                  >
                    Practice
                  </button>
                  <button
                    onClick={() => setExamMode('exam')}
                    className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                      examMode === 'exam'
                        ? 'bg-[#7C3AED] text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#252839]'
                    }`}
                  >
                    Exam
                  </button>
                </div>
              </div>
            </div>

            {/* Row 4: Question Types */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Question Types</label>
              <div className="flex gap-2">
                {QUESTION_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      selectedTypes.has(t)
                        ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                        : 'border-slate-300 dark:border-[#2d3048] text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {selectedTypes.has(t) ? '\u2611 ' : ''}{t === 'mcq' ? 'MCQ' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary card */}
            <div className="border-2 border-[#7C3AED]/30 bg-[#EDE9FE]/30 dark:bg-[#7C3AED]/10 rounded-lg px-4 py-2.5">
              <p className="text-sm text-[#7C3AED] dark:text-[#A78BFA] font-medium">{summaryText}</p>
            </div>

            {/* Start button */}
            <button
              onClick={startExam}
              disabled={isStarting}
              className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold text-base transition-colors disabled:opacity-50"
            >
              {isStarting ? 'Preparing Exam...' : 'Start Exam'}
            </button>

            {startError && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-rose-700 dark:text-rose-300 text-sm">{startError}</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    )
  }

  // ──────────────────────────────────────────────────────────
  // PHASE: REVIEW (exam mode only)
  // ──────────────────────────────────────────────────────────

  if (phase === 'review') {
    const flaggedCount = flagged.size
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h2 className="text-xl font-bold text-[#1E1B4B] dark:text-white mb-4">Review Your Answers</h2>

          {/* Grid of question boxes */}
          <div className="grid grid-cols-10 gap-2 mb-6">
            {questions.map((q, idx) => {
              const hasAnswer = !!answers[q.id]
              const isFlagged = flagged.has(q.id)
              return (
                <button
                  key={q.id}
                  onClick={() => { setCurrentIdx(idx); setPhase('exam') }}
                  className={`w-full aspect-square rounded-lg text-sm font-medium flex items-center justify-center transition-colors border-2 ${
                    hasAnswer
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-transparent'
                      : 'bg-slate-100 dark:bg-[#252839] text-slate-500 dark:text-slate-400 border-transparent'
                  } ${isFlagged ? '!border-orange-400' : ''}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-4 mb-4">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              You have answered <span className="font-semibold">{answeredCount} of {questions.length}</span> questions.
              {flaggedCount > 0 && <span className="text-orange-600 dark:text-orange-400"> {flaggedCount} flagged for review.</span>}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setPhase('exam')}
              className="flex-1 py-3 border border-slate-300 dark:border-[#2d3048] rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 inline mr-1" />
              Back to Exam
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure? You cannot change answers after submitting.')) {
                  submitExam()
                }
              }}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  // ──────────────────────────────────────────────────────────
  // PHASE: RESULTS
  // ──────────────────────────────────────────────────────────

  if (phase === 'results' && results) {
    const circumference = 2 * Math.PI * 54
    const offset = circumference - (results.percentage / 100) * circumference

    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-6">

          {/* Score card */}
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6 text-center mb-6">
            <div className="relative inline-block mb-4">
              <svg width="128" height="128" className="-rotate-90">
                <circle cx="64" cy="64" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-[#2d3048]" />
                <circle cx="64" cy="64" r="54" fill="none" stroke="#7C3AED" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[#7C3AED]">{results.percentage}%</span>
              </div>
            </div>
            <p className="text-lg text-slate-700 dark:text-slate-300 mb-1">{results.score} / {results.total_marks} marks</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${getGradeColor(results.grade)}`}>
              Grade {results.grade}
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-400">Time taken: {formatTime(results.time_taken)}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Based on CIE AS Biology grade boundaries</p>
          </div>

          {/* Topic breakdown */}
          {results.topic_breakdown.length > 0 && (
            <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5 mb-6">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Topic Breakdown</h3>
              <div className="space-y-3">
                {results.topic_breakdown.map((t, i) => {
                  const isWeakest = results.weak_topics.includes(t.topic)
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={`${isWeakest ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                          {t.topic}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">{t.marks_got}/{t.marks_available} ({t.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-[#252839] rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${barColor(t.percentage)}`} style={{ width: `${t.percentage}%` }} />
                      </div>
                      {isWeakest && (
                        <Link
                          to="/curriculum"
                          className="inline-block text-xs text-[#7C3AED] hover:underline mt-1"
                        >
                          Practice this topic &rarr;
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Answer review accordion */}
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5 mb-6">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Answer Review</h3>
            <div className="space-y-2">
              {questions.map((q, idx) => {
                const fb = feedback[q.id]
                const awarded = fb?.marks_awarded ?? 0
                const available = q.marks
                const badge = resultBadge(awarded, available)
                const isExpanded = expandedReview.has(q.id)
                const userAns = answers[q.id]

                return (
                  <div key={q.id} className="border border-slate-200 dark:border-[#232536] rounded-lg overflow-hidden">
                    <button
                      onClick={() => {
                        setExpandedReview((prev) => {
                          const next = new Set(prev)
                          if (next.has(q.id)) next.delete(q.id)
                          else next.add(q.id)
                          return next
                        })
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-medium text-slate-400">Q{idx + 1}</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{q.content}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                          {badge.sym} {badge.text}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-[#232536] space-y-2">
                        <p className="text-sm text-slate-800 dark:text-slate-200">{q.content}</p>
                        <div className="text-sm">
                          <span className="text-slate-500 dark:text-slate-400">Your answer: </span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {q.type === 'mcq' && q.options && userAns
                              ? (() => { const idx = 'ABCD'.indexOf(userAns as string); return `${userAns}) ${idx >= 0 ? q.options[idx] : userAns}` })()
                              : Array.isArray(userAns) ? userAns.filter(Boolean).join('; ') : (userAns || 'No answer')}
                          </span>
                        </div>
                        {q.type === 'mcq' && q.options && fb && (() => {
                          const correctLetter = fb.mark_scheme[0]?.charAt(0) ?? ''
                          const correctIdx = 'ABCD'.indexOf(correctLetter)
                          const correctText = correctIdx >= 0 ? correctLetter + ') ' + (q.options?.[correctIdx] ?? '') : ''
                          return (
                            <div className="text-sm">
                              <span className="text-slate-500 dark:text-slate-400">Correct answer: </span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{correctText}</span>
                            </div>
                          )
                        })()}
                        {fb && (
                          <>
                            <div className="bg-slate-50 dark:bg-[#252839] rounded-lg p-3 space-y-1">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Mark Scheme</p>
                              {fb.mark_scheme.map((point, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-sm">
                                  <span className={`shrink-0 ${awarded >= i + 1 ? 'text-emerald-500' : 'text-red-400'}`}>
                                    {awarded >= i + 1 ? '\u2713' : '\u2717'}
                                  </span>
                                  <span className="text-slate-600 dark:text-slate-400">{point}</span>
                                </div>
                              ))}
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Explanation</p>
                              <p className="text-sm text-blue-800 dark:text-blue-300">{fb.explanation}</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button onClick={retryExam} className="flex-1 py-3 border border-slate-300 dark:border-[#2d3048] rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Retry Same Exam
            </button>
            <button onClick={newExam} className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold transition-colors">
              New Exam
            </button>
          </div>
          <Link
            to={`/curriculum?syllabus=${syllabus}`}
            className="block text-center text-sm text-[#7C3AED] hover:underline mt-3"
          >
            Practice Weak Topics &rarr;
          </Link>
        </div>
      </Layout>
    )
  }

  // ──────────────────────────────────────────────────────────
  // PHASE: EXAM
  // ──────────────────────────────────────────────────────────

  const currentQ = questions[currentIdx]
  if (!currentQ) return null

  const currentFeedback = feedback[currentQ.id]
  const currentAnswer = answers[currentQ.id]
  const isLowTime = timeLimitEnabled && timeRemaining < 300
  const isCriticalTime = timeLimitEnabled && timeRemaining < 60

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-2">

        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-slate-50 dark:bg-[#0f1117] pt-2 pb-2 -mx-4 px-4 border-b border-slate-200 dark:border-[#232536]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${isLowTime ? 'text-red-500' : 'text-slate-400'}`} />
              <span className={`font-mono text-sm font-semibold ${isCriticalTime ? 'text-red-500 animate-pulse' : isLowTime ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                {timeLimitEnabled ? formatTime(timeRemaining) : 'Untimed'}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {examMode === 'practice'
                ? `${earnedMarks}/${totalMarks} marks`
                : `${answeredCount} of ${questions.length} answered`}
            </span>
          </div>
        </div>

        {/* Question navigator */}
        <div className="flex gap-1.5 py-3 overflow-x-auto">
          {questions.map((q, idx) => {
            const hasAnswer = !!answers[q.id]
            const hasFeedback = !!feedback[q.id]
            const isFlagged = flagged.has(q.id)
            const isCurrent = idx === currentIdx

            let bgClass = 'bg-slate-200 dark:bg-[#2d3048] text-slate-500 dark:text-slate-400'
            if (examMode === 'practice' && hasFeedback) {
              bgClass = feedback[q.id].is_correct
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
            } else if (examMode === 'exam' && hasAnswer) {
              bgClass = 'bg-blue-500 text-white'
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-7 h-7 rounded-full text-xs font-medium shrink-0 transition-all ${bgClass} ${
                  isCurrent ? 'ring-2 ring-[#7C3AED] ring-offset-1 dark:ring-offset-[#0f1117]' : ''
                } ${isFlagged ? 'ring-2 ring-orange-400 ring-offset-1 dark:ring-offset-[#0f1117]' : ''}`}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>

        {/* Question card */}
        <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
          {/* Question header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-white">Question {currentIdx + 1}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 text-[#7C3AED] font-medium">{currentQ.marks} {currentQ.marks === 1 ? 'mark' : 'marks'}</span>
              <span className="text-xs text-amber-500 tracking-wider">{difficultyStars(currentQ.difficulty)}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#252839] text-slate-500 dark:text-slate-400 font-medium uppercase">{currentQ.type}</span>
            </div>
            <button
              onClick={() => toggleFlag(currentQ.id)}
              className={`p-1.5 rounded-lg transition-colors ${flagged.has(currentQ.id) ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'text-slate-400 hover:text-orange-400'}`}
              aria-label={flagged.has(currentQ.id) ? 'Unflag question' : 'Flag question'}
            >
              <Bookmark className="w-4 h-4" fill={flagged.has(currentQ.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Question text */}
          <p className="text-base text-slate-900 dark:text-white leading-relaxed mb-5">{currentQ.content}</p>

          {/* MCQ */}
          {currentQ.type === 'mcq' && currentQ.options && (
            <div className="space-y-2">
              {currentQ.options.map((opt, i) => {
                const letter = 'ABCD'[i]
                const isSelected = currentAnswer === letter
                const hasChecked = !!currentFeedback

                let optClass = 'border-slate-200 dark:border-[#232536] hover:border-[#7C3AED]'
                if (hasChecked && examMode === 'practice') {
                  if (isSelected && currentFeedback.is_correct) optClass = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                  else if (isSelected && !currentFeedback.is_correct) optClass = 'border-red-400 bg-red-50 dark:bg-red-900/20'
                  // Show correct answer
                  const correctLetter = currentFeedback.mark_scheme?.[0]?.charAt(0)
                  if (!isSelected && letter === correctLetter) optClass = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                } else if (isSelected) {
                  optClass = 'border-[#7C3AED] bg-[#EDE9FE] dark:bg-[#7C3AED]/20'
                }

                return (
                  <button
                    key={i}
                    onClick={() => setMcqAnswer(currentQ.id, letter)}
                    disabled={hasChecked && examMode === 'practice'}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors flex items-center gap-3 ${optClass} ${hasChecked ? 'cursor-default' : ''}`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      isSelected ? 'bg-[#7C3AED] text-white' : 'bg-slate-100 dark:bg-[#252839] text-slate-600 dark:text-slate-400'
                    }`}>
                      {letter}
                    </span>
                    <span className="text-sm text-slate-800 dark:text-slate-200">{opt}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Structured */}
          {currentQ.type === 'structured' && (
            <div className="space-y-3">
              {Array.from({ length: currentQ.marks }, (_, i) => (
                <div key={i}>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Point {i + 1} [1 mark]
                  </label>
                  <input
                    type="text"
                    value={(currentAnswer as string[] | undefined)?.[i] ?? ''}
                    onChange={(e) => setStructuredAnswer(currentQ.id, i, e.target.value, currentQ.marks)}
                    disabled={!!currentFeedback}
                    placeholder="Enter your answer..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] dark:text-white disabled:opacity-60"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Extended */}
          {currentQ.type === 'extended' && (
            <div>
              <textarea
                value={(currentAnswer as string | undefined) ?? ''}
                onChange={(e) => setExtendedAnswer(currentQ.id, e.target.value)}
                disabled={!!currentFeedback}
                placeholder="Write your answer here..."
                rows={6}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] dark:text-white resize-y disabled:opacity-60"
              />
              <p className="text-xs text-slate-400 mt-1">Aim for {Math.max(4, currentQ.marks - 2)}-{currentQ.marks} key points</p>
            </div>
          )}

          {/* Practice mode feedback */}
          {examMode === 'practice' && currentFeedback && (
            <div className={`mt-4 p-4 rounded-lg border-2 ${
              currentFeedback.is_correct
                ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800'
                : currentFeedback.marks_awarded > 0
                  ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800'
                  : 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {currentFeedback.is_correct
                  ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                  : currentFeedback.marks_awarded > 0
                    ? <AlertTriangle className="w-5 h-5 text-amber-600" />
                    : <XCircle className="w-5 h-5 text-red-600" />}
                <span className="text-sm font-semibold">
                  {currentFeedback.marks_awarded}/{currentFeedback.marks_available} marks
                </span>
              </div>
              {currentFeedback.mark_scheme.length > 0 && (
                <div className="space-y-1 mb-2">
                  {currentFeedback.mark_scheme.map((p, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-sm">
                      <span className={`shrink-0 ${currentFeedback.marks_awarded >= i + 1 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {currentFeedback.marks_awarded >= i + 1 ? '\u2713' : '\u2717'}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">{p}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-sm text-slate-600 dark:text-slate-400">{currentFeedback.explanation}</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4 pb-4">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="flex-1 py-2.5 border border-slate-300 dark:border-[#2d3048] rounded-xl font-medium text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors disabled:opacity-30 flex items-center justify-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {examMode === 'practice' && !currentFeedback && currentAnswer && (
            <button
              onClick={() => checkAnswer(currentQ.id, Array.isArray(currentAnswer) ? currentAnswer.join('\n') : currentAnswer)}
              disabled={isChecking}
              className="flex-1 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {isChecking ? 'Checking...' : 'Check Answer'}
            </button>
          )}

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((i) => i + 1)}
              className="flex-1 py-2.5 border border-slate-300 dark:border-[#2d3048] rounded-xl font-medium text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors flex items-center justify-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : examMode === 'exam' ? (
            <button
              onClick={() => setPhase('review')}
              className="flex-1 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Review Answers
            </button>
          ) : (
            <button
              onClick={submitExam}
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Finishing...' : 'Finish Exam'}
            </button>
          )}
        </div>
      </div>
    </Layout>
  )
}
