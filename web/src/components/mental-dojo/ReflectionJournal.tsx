import { useState } from 'react'
import { Check, Lightbulb, PenLine, Sparkles } from 'lucide-react'

interface Props {
  title: string
  onComplete: () => void
}

const PROMPTS: Record<string, string[]> = {
  'Focus Journal': [
    'What helped me stay focused today?',
    'What distracted me, and how can I prevent it next time?',
    'How long did I sustain deep focus before my mind wandered?',
    'What environment works best for my concentration?',
  ],
  'Learning Gratitude Journal': [
    'What new thing did I learn recently that I\'m proud of?',
    'Who has helped me on my learning journey, and how?',
    'What skill have I improved this month compared to last?',
    'What about learning am I grateful for today?',
  ],
  'Setback Recovery Journal': [
    'What happened — describe the setback without judgement.',
    'What can I learn from this experience?',
    'What is one small step I can take tomorrow to move forward?',
    'How will I look back on this moment in 6 months?',
  ],
}

const MOOD_EMOJIS = [
  { emoji: '😔', label: 'Low', color: 'border-red-300 bg-red-50' },
  { emoji: '😐', label: 'Neutral', color: 'border-amber-300 bg-amber-50' },
  { emoji: '🙂', label: 'Good', color: 'border-emerald-300 bg-emerald-50' },
  { emoji: '😊', label: 'Great', color: 'border-sky-300 bg-sky-50' },
  { emoji: '🔥', label: 'On fire', color: 'border-violet-300 bg-violet-50' },
]

export default function ReflectionJournal({ title, onComplete }: Props) {
  const prompts = PROMPTS[title] || PROMPTS['Focus Journal']
  const [answers, setAnswers] = useState<string[]>(prompts.map(() => ''))
  const [currentPrompt, setCurrentPrompt] = useState(0)
  const [mood, setMood] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  const progress = answers.filter((a) => a.trim().length > 0).length
  const canComplete = progress >= 2 && mood !== null

  const handleComplete = () => {
    setIsComplete(true)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
          <PenLine className="w-6 h-6 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-1">{title}</h2>
        <p className="text-slate-500">Take a few minutes to reflect honestly. There are no wrong answers.</p>
      </div>

      {!isComplete ? (
        <>
          {/* Mood selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">How are you feeling right now?</h3>
            <div className="flex items-center justify-center gap-3">
              {MOOD_EMOJIS.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setMood(i)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all
                    ${mood === i
                      ? `${m.color} scale-110 shadow-md`
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-medium text-slate-500">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt navigation */}
          <div className="flex gap-2 mb-4">
            {prompts.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPrompt(i)}
                className={`flex-1 h-1.5 rounded-full transition-all
                  ${i === currentPrompt
                    ? 'bg-[#7C3AED]'
                    : answers[i].trim()
                      ? 'bg-emerald-400'
                      : 'bg-slate-200'
                  }`}
              />
            ))}
          </div>

          {/* Current prompt */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-violet-600" />
              </div>
              <p className="text-slate-800 font-medium leading-relaxed">{prompts[currentPrompt]}</p>
            </div>
            <textarea
              value={answers[currentPrompt]}
              onChange={(e) => {
                const updated = [...answers]
                updated[currentPrompt] = e.target.value
                setAnswers(updated)
              }}
              placeholder="Write your thoughts here..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent text-slate-700 placeholder-slate-300"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-400">
                {answers[currentPrompt].length > 0 ? `${answers[currentPrompt].split(/\s+/).filter(Boolean).length} words` : 'Start typing...'}
              </span>
              <div className="flex gap-2">
                {currentPrompt > 0 && (
                  <button
                    onClick={() => setCurrentPrompt((p) => p - 1)}
                    className="text-xs px-3 py-1.5 text-slate-500 hover:text-slate-700"
                  >
                    ← Previous
                  </button>
                )}
                {currentPrompt < prompts.length - 1 && (
                  <button
                    onClick={() => setCurrentPrompt((p) => p + 1)}
                    className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Progress & submit */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{progress}/{prompts.length} prompts answered</span>
            <button
              onClick={handleComplete}
              disabled={!canComplete}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" /> Save Reflection
            </button>
          </div>
        </>
      ) : (
        <div className="bg-gradient-to-br from-violet-50 to-rose-50 rounded-2xl border border-violet-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-[#1E1B4B] mb-2">Reflection Saved</h3>
          <p className="text-slate-600 mb-6 max-w-sm mx-auto">
            Taking time to reflect builds self-awareness and helps you improve. Great work.
          </p>
          <button
            onClick={onComplete}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
          >
            <Check className="w-4 h-4" /> Complete (+25 XP)
          </button>
        </div>
      )}
    </div>
  )
}
