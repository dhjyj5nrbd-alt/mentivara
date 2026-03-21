import { useState, useEffect, useRef } from 'react'
import { Check, ChevronRight, Sparkles, Star, Zap } from 'lucide-react'

interface Props {
  onComplete: () => void
}

interface Affirmation {
  negative: string
  positive: string
  explanation: string
}

const AFFIRMATIONS: Affirmation[] = [
  {
    negative: "I'm not smart enough for this subject.",
    positive: "I'm building understanding every time I study.",
    explanation: 'Intelligence is not fixed. Every hour of study creates new neural connections. You are literally getting smarter.',
  },
  {
    negative: "Everyone else finds this easy.",
    positive: "Everyone struggles — most just don't show it.",
    explanation: 'Social comparison is misleading. The students who seem confident often have the same doubts you do.',
  },
  {
    negative: "I'm going to fail this exam.",
    positive: "I'm preparing, and preparation leads to results.",
    explanation: 'Catastrophic thinking is your anxiety talking, not reality. Focus on the process, not the imagined outcome.',
  },
  {
    negative: "I'll never understand this topic.",
    positive: "I haven't understood it yet — but I will.",
    explanation: 'The word "yet" is powerful. It acknowledges where you are while keeping the door open for growth.',
  },
  {
    negative: "I don't belong here.",
    positive: "I earned my place, and I deserve to be here.",
    explanation: 'Imposter syndrome affects high achievers the most. Your presence is proof of your capability.',
  },
]

export default function ConfidenceBuilder({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<'negative' | 'transform' | 'positive'>('negative')
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isComplete, setIsComplete] = useState(false)
  const [selectedStrength, setSelectedStrength] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  const current = AFFIRMATIONS[step]

  const STRENGTHS = [
    'Persistence', 'Curiosity', 'Creativity', 'Discipline',
    'Empathy', 'Problem-solving', 'Resilience', 'Adaptability',
  ]

  // Particle animation for transformation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; hue: number; life: number }> = []

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      if (phase === 'transform') {
        // Spawn particles
        for (let i = 0; i < 3; i++) {
          particles.push({
            x: w / 2 + (Math.random() - 0.5) * 100,
            y: h / 2 + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4 - 2,
            size: Math.random() * 4 + 2,
            hue: Math.random() * 60 + 260, // violet to rose range
            life: 1,
          })
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.02
        p.size *= 0.99

        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.life})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Central glow based on phase
      if (phase === 'positive' || isComplete) {
        const time = Date.now() / 1000
        const glowSize = 60 + Math.sin(time * 2) * 10
        const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, glowSize)
        grad.addColorStop(0, '#7C3AED20')
        grad.addColorStop(1, '#7C3AED00')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(w / 2, h / 2, glowSize, 0, Math.PI * 2)
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [phase, isComplete])

  const handleTransform = () => {
    setPhase('transform')
    setTimeout(() => setPhase('positive'), 1500)
  }

  const handleNext = () => {
    setCompletedSteps((s) => new Set([...s, step]))
    if (step >= AFFIRMATIONS.length - 1) {
      setIsComplete(true)
    } else {
      setStep((s) => s + 1)
      setPhase('negative')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-rose-100 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-1">Confidence Builder</h2>
        <p className="text-slate-500">Transform self-doubt into self-belief, one thought at a time.</p>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {AFFIRMATIONS.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all duration-500
              ${completedSteps.has(i) ? 'bg-emerald-400' : i === step ? 'bg-[#7C3AED]' : 'bg-slate-200'}`}
          />
        ))}
      </div>

      {!isComplete ? (
        <div className="relative">
          {/* Canvas for particle effects */}
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="absolute inset-0 w-full h-[200px] pointer-events-none z-10"
          />

          {/* Affirmation card */}
          <div className={`rounded-2xl border-2 p-8 text-center transition-all duration-500
            ${phase === 'negative'
              ? 'bg-red-50 border-red-200'
              : phase === 'transform'
                ? 'bg-slate-50 border-violet-300 scale-95'
                : 'bg-emerald-50 border-emerald-200 shadow-lg'
            }`}
          >
            <span className="text-xs font-semibold uppercase tracking-wider mb-4 block"
              style={{ color: phase === 'negative' ? '#DC2626' : phase === 'transform' ? '#7C3AED' : '#059669' }}
            >
              {phase === 'negative' ? '❌ Self-doubt says...' : phase === 'transform' ? '✨ Transforming...' : '✅ Truth is...'}
            </span>

            <p className={`text-xl sm:text-2xl font-bold leading-snug mb-4 transition-all
              ${phase === 'negative' ? 'text-red-800' : phase === 'transform' ? 'text-violet-700 opacity-50' : 'text-emerald-800'}`}
            >
              "{phase === 'positive' ? current.positive : current.negative}"
            </p>

            {phase === 'positive' && (
              <p className="text-emerald-700 text-sm max-w-md mx-auto leading-relaxed mb-6 animate-fade-in">
                {current.explanation}
              </p>
            )}

            {phase === 'negative' && (
              <button
                onClick={handleTransform}
                className="mt-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
              >
                <Zap className="w-4 h-4" /> Transform this thought
              </button>
            )}

            {phase === 'positive' && (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 mx-auto"
              >
                {step >= AFFIRMATIONS.length - 1 ? 'Finish' : 'Next thought'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Strength picker */}
          <div className="bg-gradient-to-br from-violet-50 to-amber-50 rounded-2xl border border-violet-100 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
            <h3 className="text-xl font-bold text-[#1E1B4B] mb-2">All thoughts transformed!</h3>
            <p className="text-slate-600 mb-6">Before you go, pick the strength you want to carry into your next study session:</p>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {STRENGTHS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStrength(s)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all
                    ${selectedStrength === s
                      ? 'border-[#7C3AED] bg-[#7C3AED] text-white scale-105'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={onComplete}
              disabled={!selectedStrength}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 mx-auto disabled:opacity-40"
            >
              <Check className="w-4 h-4" /> Complete (+25 XP)
            </button>
          </div>
        </>
      )}
    </div>
  )
}
