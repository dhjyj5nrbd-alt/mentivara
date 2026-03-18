import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { aiService, type ExamQuestion } from '../services/ai'
import { tutorService, type RefData } from '../services/tutors'
import { CheckCircle, XCircle, Trophy } from 'lucide-react'

export default function ExamSimulator() {
  const [phase, setPhase] = useState<'setup' | 'exam' | 'results'>('setup')
  const [subjectId, setSubjectId] = useState<number>(0)
  const [levelId, setLevelId] = useState<number>(0)
  const [sessionId, setSessionId] = useState<number>(0)
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, { answer: string; correct: boolean; explanation: string }>>({})
  const [results, setResults] = useState<any>(null)

  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: tutorService.getSubjects })
  const { data: levels } = useQuery({ queryKey: ['levels'], queryFn: tutorService.getLevels })

  const startMutation = useMutation({
    mutationFn: () => aiService.startExam(subjectId, levelId, 'Practice Exam', 10),
    onSuccess: (data) => {
      setSessionId(data.session.id)
      setQuestions(data.questions)
      setPhase('exam')
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

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-xl mx-auto px-4 flex items-center justify-between h-16">
            <Link to="/dashboard" className="text-xl font-bold text-[#1E1B4B]">Mentivara</Link>
          </div>
        </header>
        <main className="max-w-xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-[#1E1B4B] mb-6">Exam Simulator</h1>
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <select value={subjectId} onChange={(e) => setSubjectId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                <option value={0}>Select subject</option>
                {subjects?.map((s: RefData) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
              <select value={levelId} onChange={(e) => setLevelId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                <option value={0}>Select level</option>
                {levels?.map((l: RefData) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <button onClick={() => startMutation.mutate()} disabled={!subjectId || !levelId || startMutation.isPending}
              className="w-full py-3 bg-[#7C3AED] text-white rounded-lg font-semibold disabled:opacity-50">
              {startMutation.isPending ? 'Starting...' : 'Start Exam'}
            </button>
            {startMutation.isError && <p className="text-red-600 text-sm">Not enough questions available for this selection.</p>}
          </div>
        </main>
      </div>
    )
  }

  if (phase === 'results' && results) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-xl mx-auto px-4 flex items-center h-16">
            <span className="text-xl font-bold text-[#1E1B4B]">Mentivara</span>
          </div>
        </header>
        <main className="max-w-xl mx-auto px-4 py-8 text-center">
          <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[#1E1B4B] mb-2">Exam Complete</h1>
          <p className="text-6xl font-bold text-[#7C3AED] my-6">{results.score}%</p>
          <p className="text-lg text-slate-600 mb-2">{results.correct}/{results.total} correct</p>
          <p className="text-lg font-medium">Predicted Grade: <span className="text-[#7C3AED]">{results.grade_prediction}</span></p>
          <div className="mt-8 flex gap-3 justify-center">
            <button onClick={() => { setPhase('setup'); setAnswers({}); setCurrentIdx(0) }}
              className="px-6 py-3 bg-[#7C3AED] text-white rounded-lg font-semibold">Try Again</button>
            <Link to="/dashboard" className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold">Dashboard</Link>
          </div>
        </main>
      </div>
    )
  }

  // Exam phase
  const currentQ = questions[currentIdx]
  const currentAnswer = answers[currentQ?.id]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-xl mx-auto px-4 flex items-center justify-between h-16">
          <span className="text-xl font-bold text-[#1E1B4B]">Mentivara</span>
          <span className="text-sm text-slate-500">Q {currentIdx + 1}/{questions.length}</span>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
          <div className="bg-[#7C3AED] h-2 rounded-full transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-xs text-slate-400 mb-2 uppercase">{currentQ?.difficulty} | {currentQ?.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}</p>
          <p className="text-lg font-medium text-slate-900 mb-6">{currentQ?.content}</p>

          {currentQ?.type === 'mcq' && currentQ.options ? (
            <div className="space-y-2">
              {currentQ.options.map((opt, i) => (
                <button key={i} onClick={() => !currentAnswer && handleAnswer(opt)} disabled={!!currentAnswer}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    currentAnswer?.answer === opt
                      ? currentAnswer.correct ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'
                      : 'border-slate-200 hover:border-[#7C3AED]'
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
            <input placeholder="Type your answer..." onKeyDown={(e) => {
              if (e.key === 'Enter' && !currentAnswer) handleAnswer((e.target as HTMLInputElement).value)
            }} disabled={!!currentAnswer}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" />
          )}

          {currentAnswer && (
            <div className={`mt-4 p-4 rounded-lg ${currentAnswer.correct ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <p className={`font-medium ${currentAnswer.correct ? 'text-emerald-700' : 'text-red-700'}`}>
                {currentAnswer.correct ? 'Correct!' : 'Incorrect'}
              </p>
              {currentAnswer.explanation && <p className="text-sm text-slate-600 mt-1">{currentAnswer.explanation}</p>}
            </div>
          )}

          {currentAnswer && (
            <button onClick={nextQuestion} className="w-full mt-4 py-3 bg-[#7C3AED] text-white rounded-lg font-semibold">
              {currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Exam'}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
