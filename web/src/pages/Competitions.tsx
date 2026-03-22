import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Trophy, Clock, Users, Zap, ChevronDown, ChevronUp, Award, CheckCircle2, XCircle, Crown } from 'lucide-react'
import { COMPETITIONS, COMPETITION_LEADERBOARD } from '../services/demo-data'
import type { Competition, CompetitionLeaderboardEntry } from '../services/demo-data'

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const SUBJECT_COLORS: Record<string, string> = {
  Biology: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Maths: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Chemistry: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Physics: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

function formatCountdown(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return 'Ended'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${mins}m left`
  return `${mins}m left`
}

function getMedalEmoji(rank: number): string {
  if (rank === 1) return '\u{1F947}'
  if (rank === 2) return '\u{1F948}'
  if (rank === 3) return '\u{1F949}'
  return ''
}

// ── Active Competition Card ────────────────────────────────

function ActiveCompetitionCard({ comp }: { comp: Competition }) {
  const [expanded, setExpanded] = useState(false)
  const [answer, setAnswer] = useState('')
  const [mcqAnswer, setMcqAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ correct: boolean; xpEarned: number; explanation: string } | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  const handleSubmit = () => {
    const submittedAnswer = comp.type === 'mcq' ? mcqAnswer : answer
    if (!submittedAnswer.trim()) return

    // Check answer locally against demo data
    let correct = false
    if (comp.type === 'mcq') {
      correct = submittedAnswer.toLowerCase() === comp.correctAnswer.toLowerCase()
    } else {
      const normA = submittedAnswer.toLowerCase().replace(/\s+/g, '')
      const normC = comp.correctAnswer.toLowerCase().replace(/\s+/g, '')
      correct = normA.includes(normC) || normC.includes(normA)
    }

    setResult({
      correct,
      xpEarned: correct ? comp.xpReward : 0,
      explanation: comp.explanation,
    })
    setSubmitted(true)
    if (correct) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 2000)
    }
  }

  return (
    <div className="relative rounded-xl border border-[#7C3AED]/20 dark:border-[#7C3AED]/30 bg-white dark:bg-[#1a1d2e] overflow-hidden group transition-all hover:shadow-lg">
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(124,58,237,0.05) 50%, rgba(124,58,237,0.1) 100%)',
      }} />
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#7C3AED] via-purple-400 to-[#7C3AED] animate-pulse" />

      <div className="p-4 relative">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <img
              src={comp.tutorAvatar}
              alt={comp.tutorName}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#7C3AED]/20"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{comp.tutorName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${SUBJECT_COLORS[comp.subject] || 'bg-slate-100 text-slate-600'}`}>
                  {comp.subject}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[comp.difficulty]}`}>
                  {comp.difficulty}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full text-xs font-bold">
            <Zap className="w-3 h-3" />
            {comp.xpReward} XP
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">{comp.title}</h3>

        {/* Question */}
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line mb-3">{comp.question}</p>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatCountdown(comp.deadline)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {comp.submissions} submitted
          </span>
        </div>

        {/* Submit button / form */}
        {!expanded && !submitted && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full py-2.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium transition-colors"
          >
            Submit Answer
          </button>
        )}

        {expanded && !submitted && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {comp.type === 'mcq' && comp.options ? (
              <div className="space-y-2">
                {comp.options.map((option) => (
                  <label
                    key={option}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      mcqAnswer === option
                        ? 'border-[#7C3AED] bg-[#7C3AED]/5 dark:bg-[#7C3AED]/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-[#7C3AED]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`comp-${comp.id}`}
                      value={option}
                      checked={mcqAnswer === option}
                      onChange={() => setMcqAnswer(option)}
                      className="accent-[#7C3AED]"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] resize-none"
              />
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setExpanded(false)}
                className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={comp.type === 'mcq' ? !mcqAnswer : !answer.trim()}
                className="flex-1 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {submitted && result && (
          <div className="relative">
            {/* Celebration overlay */}
            {showCelebration && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="text-4xl animate-bounce">
                  {result.correct ? '\u{1F389}' : ''}
                </div>
              </div>
            )}
            <div className={`rounded-lg p-3 ${
              result.correct
                ? 'bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700'
                : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-700'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                {result.correct ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-sm font-semibold ${
                  result.correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                }`}>
                  {result.correct ? `Correct! +${result.xpEarned} XP earned` : 'Not quite right'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{result.explanation}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">Results will be announced when the competition ends</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Past Competition Card ──────────────────────────────────

function PastCompetitionCard({ comp }: { comp: Competition }) {
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#232536] bg-white/60 dark:bg-[#1a1d2e]/60 p-4 opacity-80">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <img
            src={comp.tutorAvatar}
            alt={comp.tutorName}
            className="w-8 h-8 rounded-full object-cover grayscale-[30%]"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{comp.title}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{comp.tutorName} &middot; {comp.subject}</p>
          </div>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[comp.difficulty]}`}>
          {comp.difficulty}
        </span>
      </div>

      {/* Winner */}
      {comp.winner && (
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/15 rounded-lg px-3 py-2 mb-2">
          <Crown className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Winner: {comp.winner.name} (+{comp.winner.xp} XP)
          </span>
        </div>
      )}

      {/* Your submission */}
      {comp.mySubmission && (
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 mb-2 ${
          comp.mySubmission.correct
            ? 'bg-emerald-50 dark:bg-emerald-900/15'
            : 'bg-red-50 dark:bg-red-900/15'
        }`}>
          {comp.mySubmission.correct ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-xs font-medium ${
            comp.mySubmission.correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
          }`}>
            Your answer: {comp.mySubmission.answer}
            {comp.mySubmission.correct && ` (Rank #${comp.mySubmission.rank})`}
          </span>
        </div>
      )}

      {/* Correct answer */}
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
        <span className="font-medium">Answer:</span> {comp.correctAnswer}
      </p>

      {/* Leaderboard toggle */}
      {comp.topEntries && comp.topEntries.length > 0 && (
        <div>
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="flex items-center gap-1 text-xs text-[#7C3AED] font-medium hover:underline"
          >
            {showLeaderboard ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showLeaderboard ? 'Hide' : 'Show'} Leaderboard
          </button>
          {showLeaderboard && (
            <div className="mt-2 space-y-1">
              {comp.topEntries.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${
                    entry.name === 'Alex Johnson'
                      ? 'bg-[#7C3AED]/10 dark:bg-[#7C3AED]/20'
                      : ''
                  }`}
                >
                  <span className="w-5 text-center font-bold text-slate-500 dark:text-slate-400">
                    {getMedalEmoji(entry.rank) || `#${entry.rank}`}
                  </span>
                  <span className={`flex-1 font-medium ${
                    entry.name === 'Alex Johnson' ? 'text-[#7C3AED]' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {entry.name}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">{entry.time}</span>
                  {entry.correct ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Global Leaderboard ─────────────────────────────────────

function LeaderboardView({ entries }: { entries: CompetitionLeaderboardEntry[] }) {
  return (
    <div className="space-y-1.5">
      {entries.map((entry) => {
        const isMe = entry.name === 'Alex Johnson'
        return (
          <div
            key={entry.rank}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              isMe
                ? 'bg-[#7C3AED]/10 border border-[#7C3AED]/20 dark:bg-[#7C3AED]/20 dark:border-[#7C3AED]/30'
                : 'bg-white dark:bg-[#1a1d2e] border border-slate-100 dark:border-[#232536]'
            }`}
          >
            {/* Rank */}
            <div className="w-8 text-center">
              {entry.rank <= 3 ? (
                <span className="text-lg">{getMedalEmoji(entry.rank)}</span>
              ) : (
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">#{entry.rank}</span>
              )}
            </div>

            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              isMe ? 'bg-[#7C3AED] text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              {entry.name.charAt(0)}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${
                isMe ? 'text-[#7C3AED]' : 'text-slate-900 dark:text-white'
              }`}>
                {entry.name} {isMe && '(You)'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{entry.won} won</p>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
              <Zap className="w-3.5 h-3.5" />
              {entry.xp}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────

export default function Competitions() {
  const [tab, setTab] = useState<'active' | 'leaderboard'>('active')
  const [pastExpanded, setPastExpanded] = useState(false)
  const [competitions] = useState<Competition[]>(() => [...COMPETITIONS])
  const [leaderboard] = useState<CompetitionLeaderboardEntry[]>(() => [...COMPETITION_LEADERBOARD])

  const activeComps = competitions.filter((c) => c.active)
  const pastComps = competitions.filter((c) => !c.active)

  // Find current user stats from leaderboard
  const myStats = leaderboard.find((e) => e.name === 'Alex Johnson')
  const myRank = myStats?.rank ?? '-'
  const myXp = myStats?.xp ?? 0
  const myWon = myStats?.won ?? 0

  return (
    <Layout>
      <div className="px-4 sm:px-6 py-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2.5 mb-1">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E1B4B] dark:text-white">Competitions</h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            <span className="flex items-center gap-1">
              <span className="text-base">{'\u{1F3C6}'}</span> {myWon} Won
            </span>
            <span className="flex items-center gap-1">
              <span className="text-base">{'\u2B50'}</span> {myXp} XP Earned
            </span>
            <span className="flex items-center gap-1">
              <span className="text-base">{'\u{1F4CA}'}</span> Rank #{myRank}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-[#232536] rounded-lg p-1 mb-4">
          <button
            onClick={() => setTab('active')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'active'
                ? 'bg-white dark:bg-[#1a1d2e] text-[#7C3AED] shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setTab('leaderboard')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'leaderboard'
                ? 'bg-white dark:bg-[#1a1d2e] text-[#7C3AED] shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Leaderboard
          </button>
        </div>

        {tab === 'active' ? (
          <>
            {/* Active competitions */}
            <div className="space-y-3 mb-6">
              {activeComps.length === 0 ? (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                  <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">No active competitions</p>
                  <p className="text-sm mt-1">Check back soon for new challenges!</p>
                </div>
              ) : (
                activeComps.map((comp) => (
                  <ActiveCompetitionCard key={comp.id} comp={comp} />
                ))
              )}
            </div>

            {/* Past competitions */}
            {pastComps.length > 0 && (
              <div>
                <button
                  onClick={() => setPastExpanded(!pastExpanded)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  {pastExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Past Competitions ({pastComps.length})
                </button>
                {pastExpanded && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {pastComps.map((comp) => (
                      <PastCompetitionCard key={comp.id} comp={comp} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Leaderboard tab */
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-[#7C3AED]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Top Students</h2>
            </div>
            <LeaderboardView entries={leaderboard} />
          </div>
        )}
      </div>
    </Layout>
  )
}
