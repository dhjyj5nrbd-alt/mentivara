import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Check, Volume2, VolumeX } from 'lucide-react'

interface Props {
  onComplete: () => void
}

const DURATIONS = [
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '25 min', seconds: 1500 },
]

const AMBIENT_THEMES = [
  { id: 'rain', label: '🌧️ Rain', color: '#0EA5E9' },
  { id: 'forest', label: '🌲 Forest', color: '#10B981' },
  { id: 'waves', label: '🌊 Waves', color: '#6366F1' },
  { id: 'silence', label: '🤫 Silence', color: '#64748B' },
]

export default function FocusTimer({ onComplete }: Props) {
  const [duration, setDuration] = useState(DURATIONS[0].seconds)
  const [timeLeft, setTimeLeft] = useState(DURATIONS[0].seconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [theme, setTheme] = useState(AMBIENT_THEMES[0])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  const progress = 1 - timeLeft / duration
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  // Timer
  useEffect(() => {
    if (!isRunning || isComplete) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsComplete(true)
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, isComplete])

  // Animated background canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number }> = []
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.3 - 0.1,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
      })
    }

    const draw = () => {
      ctx.fillStyle = '#0F172A'
      ctx.fillRect(0, 0, w, h)

      // Particles
      particles.forEach((p) => {
        if (isRunning) {
          p.x += p.vx
          p.y += p.vy
          if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w }
          if (p.x < -10) p.x = w + 10
          if (p.x > w + 10) p.x = -10
        }
        ctx.fillStyle = `${theme.color}${Math.round(p.opacity * 255).toString(16).padStart(2, '0')}`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Central progress ring
      const cx = w / 2
      const cy = h / 2
      const radius = Math.min(w, h) * 0.35

      // Background ring
      ctx.strokeStyle = '#ffffff10'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.stroke()

      // Progress ring
      if (hasStarted) {
        const grad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy)
        grad.addColorStop(0, theme.color)
        grad.addColorStop(1, `${theme.color}88`)
        ctx.strokeStyle = grad
        ctx.lineWidth = 6
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2)
        ctx.stroke()
      }

      // Pulsing glow when running
      if (isRunning) {
        const pulse = Math.sin(Date.now() / 1000) * 0.15 + 0.15
        const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 1.2)
        glowGrad.addColorStop(0, `${theme.color}${Math.round(pulse * 255).toString(16).padStart(2, '0')}`)
        glowGrad.addColorStop(1, `${theme.color}00`)
        ctx.fillStyle = glowGrad
        ctx.beginPath()
        ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2)
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [isRunning, progress, theme, hasStarted])

  const start = () => {
    setIsRunning(true)
    setHasStarted(true)
  }

  const reset = () => {
    setIsRunning(false)
    setIsComplete(false)
    setHasStarted(false)
    setTimeLeft(duration)
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#1E1B4B] mb-1">Deep Focus Timer</h2>
      <p className="text-slate-500 mb-6">
        {isComplete ? 'Session complete — great focus!' : 'Choose your duration and ambient theme.'}
      </p>

      {/* Duration selector (only before starting) */}
      {!hasStarted && (
        <div className="flex gap-2 mb-4">
          {DURATIONS.map((d) => (
            <button
              key={d.seconds}
              onClick={() => { setDuration(d.seconds); setTimeLeft(d.seconds) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${duration === d.seconds
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      {/* Ambient theme selector */}
      {!hasStarted && (
        <div className="flex gap-2 mb-8">
          {AMBIENT_THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all
                ${theme.id === t.id
                  ? 'ring-2 ring-offset-2 bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              style={theme.id === t.id ? { ringColor: t.color } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Canvas with timer */}
      <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isComplete ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <span className="text-xl font-bold text-white">Focus Complete!</span>
              <span className="text-sm text-slate-400 mt-1">You stayed focused for {DURATIONS.find(d => d.seconds === duration)?.label}</span>
            </div>
          ) : (
            <>
              <span className="text-5xl sm:text-6xl font-mono font-bold text-white tabular-nums">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              {hasStarted && (
                <span className="text-sm text-slate-400 mt-2">{theme.label} • {Math.round(progress * 100)}%</span>
              )}
              {!hasStarted && (
                <span className="text-sm text-slate-400 mt-2">Ready when you are</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {isComplete ? (
          <>
            <button onClick={reset} className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Again
            </button>
            <button onClick={onComplete} className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
              <Check className="w-4 h-4" /> Complete (+25 XP)
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => hasStarted ? setIsRunning(!isRunning) : start()}
              className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isRunning ? 'Pause' : hasStarted ? 'Resume' : 'Start Focus'}
            </button>
            {hasStarted && (
              <button onClick={reset} className="p-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
                <RotateCcw className="w-5 h-5 text-slate-500" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
