import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import {
  STUDY_COACH_DATA,
  type StudyCoachRecommendation,
  type StudyCoachSubject,
} from '../services/demo-data'
import {
  Brain, ArrowUpRight, CheckCircle2, Circle, Send,
  Clock, BarChart3, Zap, TrendingUp, ChevronRight,
  Sparkles,
} from 'lucide-react'

/* ── Sparkline SVG ──────────────────────────────────────────── */
function Sparkline({ data, color = '#7C3AED' }: { data: number[]; color?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 100
  const h = 32
  const pad = 2
  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2)
      const y = h - pad - ((v - min) / range) * (h - pad * 2)
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2)
        const y = h - pad - ((v - min) / range) * (h - pad * 2)
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
      })}
    </svg>
  )
}

/* ── Circular Progress Ring ─────────────────────────────────── */
function ProgressRing({ percent, size = 120 }: { percent: number; size?: number }) {
  const stroke = 10
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
        strokeWidth={stroke} className="text-slate-100 dark:text-[#232536]" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ringGrad)"
        strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        className="transition-all duration-1000" />
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ── Priority badge ─────────────────────────────────────────── */
const priorityConfig = {
  high: { label: 'HIGH', dot: 'bg-red-500', border: 'border-l-red-500', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400' },
  medium: { label: 'MEDIUM', dot: 'bg-amber-500', border: 'border-l-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400' },
  low: { label: 'LOW', dot: 'bg-emerald-500', border: 'border-l-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400' },
}

/* ── Recommendation Card ────────────────────────────────────── */
function RecommendationCard({ rec }: { rec: StudyCoachRecommendation }) {
  const cfg = priorityConfig[rec.priority]
  return (
    <div className={`rounded-xl border-l-4 ${cfg.border} bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] p-4 flex flex-col gap-2`}>
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-auto flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />{rec.impact}
        </span>
      </div>
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{rec.title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{rec.explanation}</p>
      <Link to={rec.linkTo}
        className="inline-flex items-center gap-1 text-xs font-medium text-[#7C3AED] hover:text-[#6D28D9] mt-1 self-start">
        {rec.linkLabel} <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  )
}

/* ── Subject Card ───────────────────────────────────────────── */
function SubjectCard({ subject }: { subject: StudyCoachSubject }) {
  return (
    <div className="rounded-xl bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{subject.icon}</span>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{subject.name}</h4>
        <span className="ml-auto text-xs font-bold text-[#7C3AED]">{subject.mastery}%</span>
      </div>
      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#232536] mb-3">
        <div className="h-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] transition-all"
          style={{ width: `${subject.mastery}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">Strongest:</span>
          <span className="font-medium text-slate-800 dark:text-white truncate">{subject.strongest.topic} ({subject.strongest.score}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">Weakest:</span>
          <span className="font-medium text-slate-800 dark:text-white truncate">{subject.weakest.topic} ({subject.weakest.score}%)</span>
        </div>
      </div>
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1 font-medium">Focus this week</p>
          <ul className="space-y-0.5">
            {subject.focusTopics.map((t) => (
              <li key={t} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500 shrink-0" />{t}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-24 shrink-0">
          <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1 font-medium text-right">4-week trend</p>
          <Sparkline data={subject.weeklyTrend} />
        </div>
      </div>
    </div>
  )
}

/* ── Chat with Coach ────────────────────────────────────────── */
interface ChatMessage {
  role: 'coach' | 'user'
  text: string
}

const CANNED_RESPONSE = "Great question! Based on your exam history, here's what I suggest: Start with 10 flashcards on magnification formulas, then attempt 5 past paper questions. This should take about 30 minutes and could improve your score by 5-8%."

function CoachChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'coach',
      text: "Hi Alex! Based on your recent performance, I'd recommend focusing on microscopy calculations this week. Would you like me to create a study plan?",
    },
  ])
  const [input, setInput] = useState('')

  const send = () => {
    const text = input.trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      { role: 'user', text },
      { role: 'coach', text: CANNED_RESPONSE },
    ])
    setInput('')
  }

  return (
    <div className="rounded-xl bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-[#232536] flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Chat with your Coach</h3>
      </div>
      <div className="p-4 space-y-3 max-h-52 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
              m.role === 'user'
                ? 'bg-[#7C3AED] text-white'
                : 'bg-slate-100 dark:bg-[#232536] text-slate-700 dark:text-slate-300'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4 pt-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask your study coach..."
          className="flex-1 text-xs rounded-lg border border-slate-200 dark:border-[#232536] bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50"
        />
        <button onClick={send}
          className="w-8 h-8 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center transition-colors shrink-0">
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function StudyCoach() {
  const d = STUDY_COACH_DATA
  const [goals, setGoals] = useState(d.weeklyGoals)
  const completedGoals = goals.filter((g) => g.completed).length

  const toggleGoal = (id: number) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)))
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 py-4 max-w-5xl mx-auto">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-start gap-4 mb-6">
          {/* AI Avatar */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center animate-pulse">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E1B4B] dark:text-white flex items-center gap-2">
              AI Study Coach
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Your personalised learning recommendations powered by AI</p>
          </div>
        </div>

        {/* ── Top row: Performance + Study Habits ─────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Overall Performance */}
          <div className="rounded-xl bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] p-5 flex items-center gap-6">
            <div className="relative shrink-0">
              <ProgressRing percent={d.overallScore} size={100} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{d.overallScore}%</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Overall</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                Predicted Grade: <span className="text-[#7C3AED] text-lg">{d.predictedGrade}</span>
              </p>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-3">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {d.monthlyImprovement}% improvement this month
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Strength</span>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400 truncate">{d.subjects[0]?.strongest.topic}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Weakness</span>
                  <p className="font-medium text-red-500 dark:text-red-400 truncate">{d.subjects[0]?.weakest.topic}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Study Habits */}
          <div className="rounded-xl bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#7C3AED]" /> Your Study Patterns
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <span className="text-slate-400 dark:text-slate-500">Daily average</span>
                <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#7C3AED]" />{d.studyHabits.avgDailyMinutes} min
                </p>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500">Best time</span>
                <p className="font-semibold text-slate-900 dark:text-white">{d.studyHabits.mostProductiveTime}</p>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500">Consistency</span>
                <p className="font-semibold text-slate-900 dark:text-white">{d.studyHabits.consistencyScore}%</p>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500">Top style</span>
                <p className="font-semibold text-slate-900 dark:text-white">Practice Qs ({d.studyHabits.learningStyle.practiceQuestions}%)</p>
              </div>
            </div>
            {/* Learning style bar */}
            <div className="flex h-2 rounded-full overflow-hidden">
              <div className="bg-[#7C3AED]" style={{ width: `${d.studyHabits.learningStyle.practiceQuestions}%` }} title="Practice questions" />
              <div className="bg-[#A78BFA]" style={{ width: `${d.studyHabits.learningStyle.flashcards}%` }} title="Flashcards" />
              <div className="bg-[#DDD6FE]" style={{ width: `${d.studyHabits.learningStyle.videos}%` }} title="Videos" />
            </div>
            <div className="flex gap-3 mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#7C3AED]" />Practice Qs</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#A78BFA]" />Flashcards</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#DDD6FE]" />Videos</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed italic">
              You learn best through practice questions. We've prioritised exam-style tasks in your daily missions.
            </p>
          </div>
        </div>

        {/* ── Recommendations ────────────────────────────────── */}
        <div className="mb-4">
          <h2 className="text-base font-bold text-[#1E1B4B] dark:text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7C3AED]" /> Personalised Recommendations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {d.recommendations.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        </div>

        {/* ── Subject Breakdown + Weekly Goals ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <h2 className="text-base font-bold text-[#1E1B4B] dark:text-white mb-3">Subject Breakdown</h2>
            <div className="space-y-3">
              {d.subjects.map((s) => (
                <SubjectCard key={s.name} subject={s} />
              ))}
            </div>
          </div>

          {/* Weekly Goals */}
          <div>
            <h2 className="text-base font-bold text-[#1E1B4B] dark:text-white mb-3">Weekly Goals</h2>
            <div className="rounded-xl bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">{completedGoals} of {goals.length} completed</span>
                <span className="text-xs font-bold text-[#7C3AED]">{Math.round((completedGoals / goals.length) * 100)}%</span>
              </div>
              {/* Mini progress */}
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-[#232536] mb-4">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] transition-all"
                  style={{ width: `${(completedGoals / goals.length) * 100}%` }} />
              </div>
              <ul className="space-y-2">
                {goals.map((g) => (
                  <li key={g.id}>
                    <button onClick={() => toggleGoal(g.id)}
                      className="flex items-start gap-2 text-left w-full group">
                      {g.completed
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 mt-0.5 shrink-0 group-hover:text-[#7C3AED] transition-colors" />
                      }
                      <span className={`text-xs leading-relaxed ${g.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                        {g.text}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Chat with Coach ────────────────────────────────── */}
        <CoachChat />
      </div>
    </Layout>
  )
}
