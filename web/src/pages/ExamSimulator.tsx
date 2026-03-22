import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { aiService, type ExamQuestion } from '../services/ai'
import { tutorService, type RefData } from '../services/tutors'
import { CheckCircle, XCircle, Trophy, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Layout from '../components/Layout'

interface ExamResults {
  score: number
  total: number
  percentage: number
  grade_prediction: string
  weak_topics: string[]
}

const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20] as const

export default function ExamSimulator() {
  const [phase, setPhase] = useState<'setup' | 'exam' | 'results'>('setup')
  const [subjectId, setSubjectId] = useState<number>(0)
  const [levelId, setLevelId] = useState<number>(0)
  const [questionCount, setQuestionCount] = useState<number>(10)
  const [sessionId, setSessionId] = useState<number>(0)
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, { answer: string; correct: boolean; explanation: string }>>({})
  const [results, setResults] = useState<ExamResults | null>(null)
  const [expandedReview, setExpandedReview] = useState<Record<number, boolean>>({})

  const { data: subjects, isError: isSubjectsError, refetch: refetchSubjects } = useQuery({ queryKey: ['subjects'], queryFn: tutorService.getSubjects })
  const { data: levels, isError: isLevelsError, refetch: refetchLevels } = useQuery({ queryKey: ['levels'], queryFn: tutorService.getLevels })
  const [startError, setStartError] = useState<string | null>(null)

  const startMutation = useMutation({
    mutationFn: () => aiService.startExam(subjectId, levelId, 'Practice Exam', questionCount),
    onSuccess: (data) => {
      setStartError(null)
      setSessionId(data.session.id)
      setQuestions(data.questions)
      setPhase('exam')
    },
    onError: (error: any) => {
      if (error?.response?.status === 422) {
        setStartError('Not enough questions available for this subject and level combination. Please try a different selection.')
      } else if (error?.response?.status === 500) {
        setStartError('A server error occurred. Please try again later.')
      } else {
        setStartError('A network error occurred. Please check your connection and try again.')
      }
    },
  })

  const answerMutation = useMutation({
    mutationFn: ({ qId, answer }: { qId: number; answer: string }) => aiService.submitAnswer(sessionId, qId, answer),
    onSuccess: (data, variables) => {
      setAnswers((prev) => ({ ...prev, [variables.qId]: { answer: variables.answer, correct: data.is_correct, explanation: data.explanation || '' } }))
    },
  })

  const completeMutation = useMutation({
    mutationFn: () => aiService.completeExam(sessionId),
    onSuccess: (data) => { setResults(data); setPhase('results') },
  })

  const handleAnswer = (answer: string) => {
    const q = questions[currentIdx]
    answerMutation.mutate({ qId: q.id, answer })
  }

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx((i) => i + 1)
    else completeMutation.mutate()
  }

  const toggleReview = (qId: number) => {
    setExpandedReview((prev) => ({ ...prev, [qId]: !prev[qId] }))
  }

  if ((isSubjectsError || isLevelsError) && phase === 'setup') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-rose-50 dark:bg-rose-900/20 rounded-2xl max-w-md">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-rose-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Something went wrong</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Failed to load subjects and levels. Please try again.</p>
            <button onClick={() => { refetchSubjects(); refetchLevels() }} className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-colors">
              Try again
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  if (phase === 'setup') {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-[#1E1B4B] dark:text-white mb-6">Exam Simulator</h1>
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
              <select value={subjectId} onChange={(e) => setSubjectId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] dark:text-white">
                <option value={0}>Select subject</option>
                {subjects?.map((s: RefData) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Level</label>
              <select value={levelId} onChange={(e) => setLevelId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] dark:text-white">
                <option value={0}>Select level</option>
                {levels?.map((l: RefData) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Number of Questions</label>
              <div className="flex gap-2">
                {QUESTION_COUNT_OPTIONS.map((count) => (
                  <button key={count} onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      questionCount === count
                        ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                        : 'border-slate-300 dark:border-[#2d3048] text-slate-700 dark:text-slate-300 hover:border-[#7C3AED]'
                    }`}>
                    {count}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => startMutation.mutate()} disabled={!subjectId || !levelId || startMutation.isPending}
              className="w-full py-3 bg-[#7C3AED] text-white rounded-lg font-semibold disabled:opacity-50">
              {startMutation.isPending ? 'Starting...' : 'Start Exam'}
            </button>
            {startError && (
              <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-rose-700 dark:text-rose-300 text-sm">{startError}</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    )
  }

  if (phase === 'results' && results) {
    const correctCount = Object.values(answers).filter((a) => a.correct).length

    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-8 text-center">
          <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[#1E1B4B] dark:text-white mb-2">Exam Complete</h1>
          <p className="text-6xl font-bold text-[#7C3AED] my-6">{results.percentage ?? results.score}%</p>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">{correctCount}/{results.total} correct</p>
          <p className="text-lg font-medium">Predicted Grade: <span className="text-[#7C3AED]">{results.grade_prediction}</span></p>

          {results.weak_topics && results.weak_topics.length > 0 && (
            <div className="mt-4 text-left bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">Topics to review:</p>
              <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-400 space-y-1">
                {results.weak_topics.map((topic, i) => <li key={i}>{topic}</li>)}
              </ul>
            </div>
          )}

          <div className="mt-8 flex gap-3 justify-center">
            <button onClick={() => { setPhase('setup'); setAnswers({}); setCurrentIdx(0); setExpandedReview({}) }}
              className="px-6 py-3 bg-[#7C3AED] text-white rounded-lg font-semibold">Try Again</button>
            <Link to="/dashboard" className="px-6 py-3 bg-white dark:bg-[#1a1d2e] border border-slate-300 dark:border-[#2d3048] text-slate-700 dark:text-slate-300 rounded-lg font-semibold">Dashboard</Link>
          </div>

          {/* Answer Review */}
          <div className="mt-10 text-left max-w-xl mx-auto space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Answer Review</h2>
            {questions.map((q, idx) => {
              const a = answers[q.id]
              const isExpanded = expandedReview[q.id] ?? false
              return (
                <div key={q.id} className={`border rounded-lg overflow-hidden ${a?.correct ? 'border-emerald-200' : 'border-red-200'}`}>
                  <button
                    onClick={() => toggleReview(q.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left ${a?.correct ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}
                  >
                    <div className="flex items-center gap-2">
                      {a?.correct
                        ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                      <span className="text-sm font-medium text-slate-900 dark:text-white">Q{idx + 1}. {q.content}</span>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                  {isExpanded && (
                    <div className="px-4 py-3 bg-white dark:bg-[#1a1d2e] space-y-2">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Your answer: <span className={`font-medium ${a?.correct ? 'text-emerald-700' : 'text-red-700'}`}>{a?.answer ?? 'No answer'}</span>
                      </p>
                      {!a?.correct && q.options && (
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          Correct answer: <span className="font-medium text-emerald-700">{q.options.find((_, i) => i === 0) ?? 'N/A'}</span>
                        </p>
                      )}
                      {a?.explanation && (
                        <div className="mt-2 p-3 bg-slate-50 dark:bg-[#252839] rounded-lg">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Explanation</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{a.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </Layout>
    )
  }

  // Exam phase
  const currentQ = questions[currentIdx]
  const currentAnswer = answers[currentQ?.id]

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => { if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) { setPhase('setup'); setAnswers({}); setCurrentIdx(0) } }}
            className="text-sm text-red-500 hover:text-red-700 hover:underline"
          >
            Exit Exam
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">Q {currentIdx + 1}/{questions.length}</span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-[#252839] rounded-full h-2 mb-6" role="progressbar"
          aria-valuenow={currentIdx + 1} aria-valuemin={0} aria-valuemax={questions.length} aria-label={`Question ${currentIdx + 1} of ${questions.length}`}>
          <div className="bg-[#7C3AED] h-2 rounded-full transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6">
          <p className="text-xs text-slate-400 mb-2 uppercase">{currentQ?.difficulty} | {currentQ?.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}</p>
          <p className="text-lg font-medium text-slate-900 dark:text-white mb-6">{currentQ?.content}</p>

          {currentQ?.type === 'mcq' && currentQ.options ? (
            <div className="space-y-2">
              {currentQ.options.map((opt, i) => (
                <button key={i} onClick={() => !currentAnswer && handleAnswer(opt)} disabled={!!currentAnswer}
                  role="radio" aria-checked={currentAnswer?.answer === opt} aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    currentAnswer?.answer === opt
                      ? currentAnswer.correct ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'
                      : 'border-slate-200 dark:border-[#232536] hover:border-[#7C3AED]'
                  } ${currentAnswer ? 'cursor-default' : ''}`}>
                  {opt}
                  {currentAnswer?.answer === opt && (currentAnswer.correct
                    ? <CheckCircle className="w-4 h-4 text-emerald-500 inline ml-2" />
                    : <XCircle className="w-4 h-4 text-red-500 inline ml-2" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <label htmlFor="short-answer-input" className="sr-only">Your answer</label>
              <input id="short-answer-input" placeholder="Type your answer..." onKeyDown={(e) => {
                if (e.key === 'Enter' && !currentAnswer) handleAnswer((e.target as HTMLInputElement).value)
              }} disabled={!!currentAnswer}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] dark:text-white dark:placeholder-slate-400" />
            </div>
          )}

          {currentAnswer && (
            <div className={`mt-4 p-4 rounded-lg ${currentAnswer.correct ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <p className={`font-medium ${currentAnswer.correct ? 'text-emerald-700' : 'text-red-700'}`}>
                {currentAnswer.correct ? 'Correct!' : 'Incorrect'}
              </p>
              {currentAnswer.explanation && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{currentAnswer.explanation}</p>}
            </div>
          )}

          {currentAnswer && (
            <button onClick={nextQuestion} className="w-full mt-4 py-3 bg-[#7C3AED] text-white rounded-lg font-semibold">
              {currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Exam'}
            </button>
          )}
        </div>
      </div>
    </Layout>
  )
}
