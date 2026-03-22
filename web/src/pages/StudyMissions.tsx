import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { DAILY_MISSIONS, STREAK_DATA } from '../services/demo-data'
import {
  Flame, Lock, Check, Clock, Zap, Target,
  BookOpen, Brain, Play, Dumbbell, HelpCircle,
  ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight,
  RotateCcw,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────

interface QuizQuestion {
  q: string
  options: string[]
  correct: number
}

interface Mission {
  id: number
  type: 'flashcard' | 'quiz' | 'practice' | 'reel' | 'focus' | 'doubt'
  title: string
  description: string
  subject: string
  topic: string
  xp: number
  estimatedMinutes: number
  completed: boolean
  questions?: QuizQuestion[]
}

// ── Flashcard data ─────────────────────────────────────────

interface Flashcard {
  front: string
  back: string
}

const DEMO_FLASHCARDS: Flashcard[] = [
  { front: 'What is the function of mitochondria?', back: 'Site of aerobic respiration; produces ATP' },
  { front: 'What is the role of the rough endoplasmic reticulum?', back: 'Protein synthesis and transport; has ribosomes attached' },
  { front: 'What is the function of the Golgi apparatus?', back: 'Modifies, packages, and distributes proteins and lipids' },
  { front: 'What is the difference between prokaryotic and eukaryotic cells?', back: 'Prokaryotes lack a membrane-bound nucleus and organelles; eukaryotes have both' },
  { front: 'What is the role of lysosomes?', back: 'Contain digestive enzymes to break down waste materials and cellular debris' },
]

// ── Practice question data ─────────────────────────────────

const PRACTICE_QUESTION = {
  question: 'Explain why electron microscopes have better resolution than light microscopes. [3 marks]',
  markScheme: [
    'Electrons have a shorter wavelength than light ;',
    'Resolution is the ability to distinguish between two points close together ;',
    'Shorter wavelength means higher resolution / can distinguish between two points that are closer together ;',
  ],
  totalMarks: 3,
}

// ── Score structured answer (same logic as demo-interceptor) ──

function scoreStructured(answer: string, markScheme: string[]): number {
  const normalised = answer.toLowerCase()
  let hits = 0
  const stopWords = new Set(['the', 'and', 'that', 'with', 'for', 'are', 'from', 'this', 'into', 'each', 'been', 'have', 'has', 'does', 'not', 'can', 'will', 'they', 'then', 'than', 'when', 'which', 'there', 'their', 'what', 'about', 'would', 'make', 'been', 'more', 'some', 'could', 'them', 'other', 'number'])
  for (const point of markScheme) {
    const cleaned = point.replace(/;$/, '').toLowerCase()
    const words = cleaned.split(/[\s\/,]+/).filter((w) => w.length > 3 && !stopWords.has(w))
    if (words.length === 0) continue
    const matched = words.filter((w) => normalised.includes(w)).length
    const threshold = Math.max(1, Math.ceil(words.length * 0.4))
    if (matched >= threshold) {
      hits++
    }
  }
  return hits
}

// ── Level system ───────────────────────────────────────────

const LEVELS = [
  { xp: 0, name: 'Beginner' },
  { xp: 500, name: 'Learner' },
  { xp: 1500, name: 'Scholar' },
  { xp: 3000, name: 'Achiever' },
  { xp: 5000, name: 'Expert' },
  { xp: 8000, name: 'Master' },
  { xp: 12000, name: 'Grandmaster' },
]

function getLevel(totalXp: number) {
  let current = LEVELS[0]
  let next = LEVELS[1]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].xp) {
      current = LEVELS[i]
      next = LEVELS[i + 1] ?? LEVELS[i]
      break
    }
  }
  const levelNum = LEVELS.indexOf(current) + 1
  const progress = next === current ? 100 : ((totalXp - current.xp) / (next.xp - current.xp)) * 100
  return { levelNum, name: current.name, progress: Math.min(100, progress), nextXp: next.xp }
}

// ── Mission icon mapping ───────────────────────────────────

const MISSION_ICONS: Record<Mission['type'], React.ElementType> = {
  flashcard: BookOpen,
  quiz: Brain,
  practice: Target,
  reel: Play,
  focus: Dumbbell,
  doubt: HelpCircle,
}

const MISSION_COLORS: Record<Mission['type'], { bg: string; text: string; border: string }> = {
  flashcard: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
  quiz: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  practice: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  reel: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800' },
  focus: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  doubt: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800' },
}

// ── XP Ring component ──────────────────────────────────────

function XpRing({ current, goal }: { current: number; goal: number }) {
  const pct = Math.min(100, (current / goal) * 100)
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="relative w-[72px] h-[72px] flex-shrink-0">
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor"
          className="text-slate-200 dark:text-slate-700" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="url(#xpGrad)"
          strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-all duration-700" />
        <defs>
          <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-slate-800 dark:text-white leading-none">{current}</span>
        <span className="text-[9px] text-slate-400 dark:text-slate-500">/{goal} XP</span>
      </div>
    </div>
  )
}

// ── Confetti animation ─────────────────────────────────────

function Confetti({ show }: { show: boolean }) {
  if (!show) return null
  const colors = ['#7C3AED', '#A78BFA', '#F59E0B', '#10B981', '#EF4444', '#3B82F6']
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 40 }).map((_, i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 0.5
        const dur = 1.5 + Math.random()
        const color = colors[i % colors.length]
        const size = 6 + Math.random() * 6
        return (
          <div key={i} className="absolute animate-confetti-fall"
            style={{
              left: `${left}%`, top: '-10px',
              width: size, height: size,
              backgroundColor: color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
            }}
          />
        )
      })}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-fall {
          animation: confetti-fall 2s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

// ── XP fly animation ───────────────────────────────────────

function XpFlyUp({ amount, show }: { amount: number; show: boolean }) {
  if (!show) return null
  return (
    <div className="fixed top-20 right-8 z-50 animate-xp-fly pointer-events-none">
      <span className="text-2xl font-bold text-[#7C3AED] drop-shadow-lg">+{amount} XP</span>
      <style>{`
        @keyframes xp-fly {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-40px) scale(1.3); opacity: 1; }
          100% { transform: translateY(-80px) scale(0.8); opacity: 0; }
        }
        .animate-xp-fly { animation: xp-fly 1.2s ease-out forwards; }
      `}</style>
    </div>
  )
}

// ── Quick Quiz component ───────────────────────────────────

function QuickQuiz({ questions, onComplete }: { questions: QuizQuestion[]; onComplete: (score: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const score = questions.reduce((s, q, i) => s + (answers[i] === q.correct ? 1 : 0), 0)
  const allAnswered = Object.keys(answers).length === questions.length

  const submit = () => {
    setSubmitted(true)
    onComplete(score)
  }

  return (
    <div className="mt-3 space-y-3">
      {questions.map((q, qi) => (
        <div key={qi} className="bg-slate-50 dark:bg-[#0f1117] rounded-lg p-3">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            {qi + 1}. {q.q}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi
              const isCorrect = submitted && oi === q.correct
              const isWrong = submitted && selected && oi !== q.correct
              return (
                <button key={oi} disabled={submitted}
                  onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                  className={`text-left text-xs px-3 py-2 rounded-md border transition-all ${
                    isCorrect ? 'bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-600 dark:text-emerald-300'
                    : isWrong ? 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900/40 dark:border-red-600 dark:text-red-300'
                    : selected ? 'bg-[#EDE9FE] border-[#7C3AED] text-[#7C3AED] dark:bg-[#7C3AED]/20 dark:border-[#7C3AED] dark:text-[#A78BFA]'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-[#1a1d2e] dark:border-[#232536] dark:text-slate-400 dark:hover:border-slate-500'
                  }`}
                >
                  <span className="font-medium mr-1.5">{String.fromCharCode(65 + oi)}.</span>{opt}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {!submitted && (
        <button onClick={submit} disabled={!allAnswered}
          className="w-full py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#7C3AED] text-white hover:bg-[#6D28D9]">
          Submit Answers
        </button>
      )}
      {submitted && (
        <div className="text-center py-2">
          <p className="text-lg font-bold text-slate-800 dark:text-white">
            {score}/{questions.length} correct
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {score === questions.length ? 'Perfect score!' : score >= 3 ? 'Good effort!' : 'Keep practising!'}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Flashcard Review component ─────────────────────────────

function FlashcardReview({ onComplete }: { onComplete: (knewCount: number) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState<Record<number, boolean>>({})
  const [finished, setFinished] = useState(false)

  const card = DEMO_FLASHCARDS[currentIndex]
  const total = DEMO_FLASHCARDS.length
  const knewCount = Object.values(results).filter(Boolean).length

  const recordResult = (knew: boolean) => {
    const newResults = { ...results, [currentIndex]: knew }
    setResults(newResults)
    setFlipped(false)

    if (currentIndex < total - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 200)
    } else {
      const finalKnew = Object.values(newResults).filter(Boolean).length
      setFinished(true)
      setTimeout(() => onComplete(finalKnew), 1500)
    }
  }

  if (finished) {
    return (
      <div className="mt-3 text-center py-6">
        <div className="text-4xl mb-2">{knewCount === total ? '🎉' : knewCount >= 3 ? '👏' : '💪'}</div>
        <p className="text-lg font-bold text-slate-800 dark:text-white">
          You knew {knewCount}/{total} cards!
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {knewCount === total ? 'Perfect recall!' : knewCount >= 3 ? 'Great memory!' : 'Keep reviewing!'}
        </p>
      </div>
    )
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Card counter */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Card {currentIndex + 1} of {total}
        </span>
        <div className="flex gap-1">
          {DEMO_FLASHCARDS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? 'bg-[#7C3AED] scale-125'
              : results[i] === true ? 'bg-emerald-400'
              : results[i] === false ? 'bg-red-400'
              : 'bg-slate-200 dark:bg-slate-700'
            }`} />
          ))}
        </div>
      </div>

      {/* Flashcard with flip */}
      <button
        onClick={() => setFlipped(!flipped)}
        className="w-full min-h-[140px] rounded-xl border-2 border-dashed border-slate-200 dark:border-[#232536] bg-slate-50 dark:bg-[#0f1117] p-5 text-center transition-all hover:border-[#7C3AED]/40 hover:shadow-sm relative"
        style={{ perspective: '1000px' }}
      >
        <div className="absolute top-2 right-2">
          <RotateCcw className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        </div>
        {!flipped ? (
          <div>
            <span className="text-[10px] font-medium text-[#7C3AED] dark:text-[#A78BFA] uppercase tracking-wider mb-2 block">Question</span>
            <p className="text-sm font-medium text-slate-800 dark:text-white">{card.front}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3">Click to reveal answer</p>
          </div>
        ) : (
          <div>
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 block">Answer</span>
            <p className="text-sm font-medium text-slate-800 dark:text-white">{card.back}</p>
          </div>
        )}
      </button>

      {/* Navigation + response buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setFlipped(false); setCurrentIndex(Math.max(0, currentIndex - 1)) }}
          disabled={currentIndex === 0}
          className="p-2 rounded-lg border border-slate-200 dark:border-[#232536] text-slate-500 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-[#232536] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {flipped ? (
          <>
            <button
              onClick={() => recordResult(false)}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
            >
              Need to review
            </button>
            <button
              onClick={() => recordResult(true)}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors"
            >
              I knew this
            </button>
          </>
        ) : (
          <div className="flex-1 text-center text-xs text-slate-400 dark:text-slate-500">
            Flip the card to respond
          </div>
        )}

        <button
          onClick={() => { setFlipped(false); setCurrentIndex(Math.min(total - 1, currentIndex + 1)) }}
          disabled={currentIndex === total - 1 || results[currentIndex] === undefined}
          className="p-2 rounded-lg border border-slate-200 dark:border-[#232536] text-slate-500 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-[#232536] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── Practice Question component ────────────────────────────

function PracticeQuestion({ totalXp, onComplete }: { totalXp: number; onComplete: (earnedXp: number) => void }) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [marksAwarded, setMarksAwarded] = useState(0)
  const [pointHits, setPointHits] = useState<boolean[]>([])

  const submit = () => {
    const marks = scoreStructured(answer, PRACTICE_QUESTION.markScheme)
    const capped = Math.min(marks, PRACTICE_QUESTION.totalMarks)
    setMarksAwarded(capped)

    // Determine which individual mark-scheme points were hit
    const normalised = answer.toLowerCase()
    const stopWords = new Set(['the', 'and', 'that', 'with', 'for', 'are', 'from', 'this', 'into', 'each', 'been', 'have', 'has', 'does', 'not', 'can', 'will', 'they', 'then', 'than', 'when', 'which', 'there', 'their', 'what', 'about', 'would', 'make', 'been', 'more', 'some', 'could', 'them', 'other', 'number'])
    const hits = PRACTICE_QUESTION.markScheme.map((point) => {
      const cleaned = point.replace(/;$/, '').toLowerCase()
      const words = cleaned.split(/[\s\/,]+/).filter((w) => w.length > 3 && !stopWords.has(w))
      if (words.length === 0) return false
      const matched = words.filter((w) => normalised.includes(w)).length
      const threshold = Math.max(1, Math.ceil(words.length * 0.4))
      return matched >= threshold
    })
    setPointHits(hits)
    setSubmitted(true)

    const earnedXp = Math.round((capped / PRACTICE_QUESTION.totalMarks) * totalXp)
    setTimeout(() => onComplete(earnedXp), 1500)
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Question */}
      <div className="bg-slate-50 dark:bg-[#0f1117] rounded-lg p-4">
        <p className="text-sm font-medium text-slate-800 dark:text-white">
          {PRACTICE_QUESTION.question}
        </p>
      </div>

      {/* Answer textarea */}
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={submitted}
        placeholder="Type your answer here..."
        rows={4}
        className="w-full rounded-lg border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#1a1d2e] px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-60 resize-none transition-all"
      />

      {!submitted && (
        <button
          onClick={submit}
          disabled={answer.trim().length < 10}
          className="w-full py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
        >
          Check Answer
        </button>
      )}

      {/* Mark scheme feedback */}
      {submitted && (
        <div className="space-y-2">
          <div className="text-center mb-3">
            <p className="text-lg font-bold text-slate-800 dark:text-white">
              {marksAwarded}/{PRACTICE_QUESTION.totalMarks} marks
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {marksAwarded === PRACTICE_QUESTION.totalMarks ? 'Full marks! Excellent!' : marksAwarded >= 2 ? 'Good answer!' : 'Review the mark scheme below.'}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-[#0f1117] rounded-lg p-3 space-y-2">
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mark Scheme</p>
            {PRACTICE_QUESTION.markScheme.map((point, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  pointHits[i]
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {pointHits[i]
                    ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    : <X className="w-3 h-3 text-red-500 dark:text-red-400" />
                  }
                </div>
                <p className={`text-xs ${pointHits[i] ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────

export default function StudyMissions() {
  const navigate = useNavigate()
  const [missions, setMissions] = useState<Mission[]>(
    () => DAILY_MISSIONS.map((m) => ({ ...m })) as Mission[]
  )
  const [streak] = useState(() => ({ ...STREAK_DATA }))
  const [todayXp, setTodayXp] = useState(STREAK_DATA.todayXp)
  const [totalXp, setTotalXp] = useState(STREAK_DATA.totalXp)
  const [expandedMission, setExpandedMission] = useState<number | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [flyXp, setFlyXp] = useState<{ amount: number; show: boolean }>({ amount: 0, show: false })
  const [xpHistoryOpen, setXpHistoryOpen] = useState(false)

  const completedCount = missions.filter((m) => m.completed).length
  const level = getLevel(totalXp)

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  // Determine which missions are unlocked: first 3 always, rest unlock sequentially after previous is complete
  const isUnlocked = useCallback((index: number) => {
    if (index < 3) return true
    return missions[index - 1]?.completed === true
  }, [missions])

  const completeMission = useCallback((id: number, xpReward: number) => {
    setMissions((prev) => prev.map((m) => m.id === id ? { ...m, completed: true } : m))
    setTodayXp((x) => x + xpReward)
    setTotalXp((x) => x + xpReward)
    setFlyXp({ amount: xpReward, show: true })
    setTimeout(() => setFlyXp((f) => ({ ...f, show: false })), 1300)
  }, [])

  const triggerCelebration = useCallback(() => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2500)
  }, [])

  const handleMissionClick = (mission: Mission, index: number) => {
    if (mission.completed || !isUnlocked(index)) return

    // Missions that expand inline
    if (mission.type === 'flashcard' || mission.type === 'quiz' || mission.type === 'practice') {
      setExpandedMission(expandedMission === mission.id ? null : mission.id)
      return
    }

    // Navigate-away missions
    if (mission.type === 'reel') {
      navigate('/reels')
      completeMission(mission.id, mission.xp)
      return
    }
    if (mission.type === 'focus') {
      navigate('/mental-dojo')
      completeMission(mission.id, mission.xp)
      return
    }
    if (mission.type === 'doubt') {
      navigate('/doubts')
      completeMission(mission.id, mission.xp)
      return
    }
  }

  const handleQuizComplete = (missionId: number, score: number) => {
    const mission = missions.find((m) => m.id === missionId)
    if (!mission) return
    const earnedXp = Math.round((score / (mission.questions?.length ?? 5)) * mission.xp)
    completeMission(missionId, earnedXp)
    triggerCelebration()
  }

  const handleFlashcardComplete = (missionId: number, knewCount: number) => {
    const mission = missions.find((m) => m.id === missionId)
    if (!mission) return
    const earnedXp = Math.round((knewCount / DEMO_FLASHCARDS.length) * mission.xp)
    completeMission(missionId, earnedXp)
    triggerCelebration()
  }

  const handlePracticeComplete = (missionId: number, earnedXp: number) => {
    completeMission(missionId, earnedXp)
    triggerCelebration()
  }

  // Check for all-complete celebration
  useEffect(() => {
    if (completedCount === missions.length && completedCount > 0) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [completedCount, missions.length])

  return (
    <Layout>
      <Confetti show={showConfetti} />
      <XpFlyUp amount={flyXp.amount} show={flyXp.show} />

      <div className="px-4 sm:px-6 py-4 max-w-4xl mx-auto">

        {/* ── Header ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E1B4B] dark:text-white">
              Today's Missions
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{dateStr}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Streak */}
            <div className="flex items-center gap-1.5">
              <Flame className={`w-5 h-5 ${streak.currentStreak > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-300'}`} />
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                {streak.currentStreak} Day Streak
              </span>
            </div>
            {/* XP Ring */}
            <XpRing current={todayXp} goal={streak.dailyGoal} />
          </div>
        </div>

        {/* ── Level bar ─────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] px-4 py-2.5 mb-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] font-bold text-sm">
            {level.levelNum}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-800 dark:text-white">
                Level {level.levelNum} &mdash; {level.name}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {totalXp.toLocaleString()} / {level.nextXp.toLocaleString()} XP
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full transition-all duration-700"
                style={{ width: `${level.progress}%` }} />
            </div>
          </div>
        </div>

        {/* ── Progress bar ──────────────────────────────── */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / missions.length) * 100}%` }} />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
            {completedCount}/{missions.length} complete
          </span>
        </div>

        {/* ── Mission grid ──────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-5">
          {missions.map((mission, idx) => {
            const unlocked = isUnlocked(idx)
            const Icon = MISSION_ICONS[mission.type]
            const color = MISSION_COLORS[mission.type]
            const isExpanded = expandedMission === mission.id && !mission.completed
            const expandable = mission.type === 'flashcard' || mission.type === 'quiz' || mission.type === 'practice'

            return (
              <div key={mission.id}
                className={`rounded-xl border transition-all duration-300 ${
                  mission.completed
                    ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 dark:from-emerald-900/20 dark:to-green-900/20 dark:border-emerald-800'
                    : !unlocked
                    ? 'bg-slate-50 border-slate-200 opacity-50 dark:bg-[#161822] dark:border-[#232536]'
                    : `bg-white border-slate-200 hover:shadow-md hover:-translate-y-0.5 dark:bg-[#1a1d2e] dark:border-[#232536] dark:hover:border-[#7C3AED]/30`
                } ${isExpanded ? 'sm:col-span-2 lg:col-span-3' : ''}`}
              >
                <div className="relative">
                  <button
                    onClick={() => handleMissionClick(mission, idx)}
                    disabled={mission.completed || !unlocked}
                    className="w-full text-left p-3"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color.bg} ${color.text}`}>
                        {mission.completed ? <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          : !unlocked ? <Lock className="w-4 h-4 text-slate-400" />
                          : <Icon className="w-5 h-5" />}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className={`text-sm font-semibold truncate ${
                            mission.completed ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-slate-800 dark:text-white'
                          }`}>
                            {mission.title}
                          </h3>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${color.bg} ${color.text}`}>
                            {mission.subject}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{mission.description}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                            <Zap className="w-3 h-3" />{mission.xp} XP
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                            <Clock className="w-3 h-3" />~{mission.estimatedMinutes} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Close button for expanded missions */}
                  {isExpanded && expandable && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedMission(null) }}
                      className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-[#232536] transition-colors z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Expanded content area with smooth animation */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-slate-100 dark:border-[#232536]">
                      {/* Flashcard mission */}
                      {mission.type === 'flashcard' && (
                        <FlashcardReview
                          onComplete={(knewCount) => handleFlashcardComplete(mission.id, knewCount)}
                        />
                      )}

                      {/* Quiz mission */}
                      {mission.type === 'quiz' && mission.questions && (
                        <QuickQuiz
                          questions={mission.questions}
                          onComplete={(score) => handleQuizComplete(mission.id, score)}
                        />
                      )}

                      {/* Practice question mission */}
                      {mission.type === 'practice' && (
                        <PracticeQuestion
                          totalXp={mission.xp}
                          onComplete={(earnedXp) => handlePracticeComplete(mission.id, earnedXp)}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Streaks section ───────────────────────────── */}
        <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-4 mb-4">
          <h2 className="text-sm font-bold text-[#1E1B4B] dark:text-white mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" /> Weekly Activity
          </h2>
          <div className="flex items-center justify-between gap-1 mb-3">
            {streak.weekHistory.map((day, i) => {
              const isToday = i === new Date().getDay() - 1 // Mon=0
              return (
                <div key={day.day} className="flex flex-col items-center gap-1 flex-1">
                  <span className={`text-[10px] font-medium ${isToday ? 'text-[#7C3AED]' : 'text-slate-400 dark:text-slate-500'}`}>
                    {day.day}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    day.completed
                      ? 'bg-emerald-100 border-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-600'
                      : isToday
                      ? 'bg-[#EDE9FE] border-[#7C3AED] dark:bg-[#7C3AED]/20 dark:border-[#7C3AED]'
                      : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                  }`}>
                    {day.completed ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : isToday ? (
                      <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                    ) : null}
                  </div>
                  {day.xp > 0 && (
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">{day.xp}</span>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Best Streak: <strong className="text-slate-700 dark:text-white">{streak.bestStreak} days</strong>
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {streak.currentStreak >= 10
                ? 'Incredible consistency! Keep it up!'
                : streak.currentStreak >= 5
                ? 'Great momentum! Stay on track.'
                : streak.currentStreak >= 1
                ? 'Good start! Build your streak.'
                : 'Start your streak today!'}
            </span>
          </div>
        </div>

        {/* ── XP History (collapsible) ──────────────────── */}
        <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] overflow-hidden mb-4">
          <button
            onClick={() => setXpHistoryOpen(!xpHistoryOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-[#1E1B4B] dark:text-white hover:bg-slate-50 dark:hover:bg-[#232536] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Recent XP
            </span>
            {xpHistoryOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {xpHistoryOpen && (
            <div className="px-4 pb-4">
              <div className="space-y-2">
                {streak.weekHistory.map((day) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 w-8">{day.day}</span>
                    <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full transition-all duration-500"
                        style={{ width: `${(day.xp / streak.dailyGoal) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 w-12 text-right">
                      {day.xp} XP
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">
                Total this week: {streak.weekHistory.reduce((s, d) => s + d.xp, 0)} XP
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
