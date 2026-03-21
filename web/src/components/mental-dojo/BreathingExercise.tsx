import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Check, Volume2, VolumeX } from 'lucide-react'

interface Props {
  title: string
  onComplete: () => void
}

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out'
type Stage = 'ready' | 'intro' | 'breathing' | 'complete'

const PHASES: { phase: Phase; label: string; cue: string; duration: number }[] = [
  { phase: 'inhale', label: 'Breathe In', cue: 'Breathe in', duration: 4 },
  { phase: 'hold-in', label: 'Hold', cue: 'Hold', duration: 4 },
  { phase: 'exhale', label: 'Breathe Out', cue: 'Breathe out', duration: 4 },
  { phase: 'hold-out', label: 'Hold', cue: 'And hold', duration: 4 },
]

const TOTAL_CYCLES = 4
const PHASE_COLORS: Record<Phase, string> = {
  'inhale': '#7C3AED',
  'hold-in': '#6D28D9',
  'exhale': '#0EA5E9',
  'hold-out': '#0284C7',
}

// ── Voice ───────────────────────────────────────────────────

function getVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices()
  const preferred = [
    'Samantha', 'Karen', 'Daniel', 'Moira', 'Tessa',
    'Google UK English Female', 'Google UK English Male',
    'Microsoft Hazel', 'Microsoft Susan', 'Microsoft George',
  ]
  for (const name of preferred) {
    const match = voices.find((v) => v.name.includes(name) && v.lang.startsWith('en'))
    if (match) return match
  }
  return voices.find((v) => v.lang.startsWith('en')) || null
}

function speakAsync(text: string, rate = 0.8, pitch = 0.9): Promise<void> {
  return new Promise((resolve) => {
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voice = getVoice()
    if (voice) utterance.voice = voice
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = 1
    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    speechSynthesis.speak(utterance)
  })
}

function playTone(freq: number, dur: number, vol = 0.1) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + dur)
  } catch { /* silent */ }
}

// ── Component ───────────────────────────────────────────────

export default function BreathingExercise({ title, onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('ready')
  const [isPaused, setIsPaused] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(4)
  const [cycle, setCycle] = useState(1)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  // Refs to avoid stale closures in setInterval
  const phaseIndexRef = useRef(0)
  const cycleRef = useRef(1)
  const soundEnabledRef = useRef(true)
  const stageRef = useRef<Stage>('ready')

  const currentPhase = PHASES[phaseIndex]
  const progress = 1 - secondsLeft / currentPhase.duration
  const isBreathing = stage === 'breathing'

  // Keep refs in sync
  useEffect(() => { phaseIndexRef.current = phaseIndex }, [phaseIndex])
  useEffect(() => { cycleRef.current = cycle }, [cycle])
  useEffect(() => { soundEnabledRef.current = soundEnabled }, [soundEnabled])
  useEffect(() => { stageRef.current = stage }, [stage])

  // Load voices
  useEffect(() => {
    const load = () => speechSynthesis.getVoices()
    load()
    speechSynthesis.addEventListener('voiceschanged', load)
    return () => speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  // Cleanup
  useEffect(() => {
    return () => { speechSynthesis.cancel() }
  }, [])

  // ── Intro narration ─────────────────────────────────────

  const startWithIntro = async () => {
    setStage('intro')

    if (soundEnabled) {
      await speakAsync(
        'This is box breathing. A simple but powerful technique used to calm your mind and body.',
        0.78, 0.88,
      )
      await new Promise((r) => setTimeout(r, 600))
      await speakAsync(
        'You will breathe in for four seconds, hold for four seconds, breathe out for four seconds, and hold for four seconds. We will repeat this four times.',
        0.78, 0.88,
      )
      await new Promise((r) => setTimeout(r, 600))
      await speakAsync(
        'Close your eyes if you feel comfortable. Let us begin.',
        0.78, 0.88,
      )
      await new Promise((r) => setTimeout(r, 1000))
    }

    // Start the breathing
    setPhaseIndex(0)
    phaseIndexRef.current = 0
    setCycle(1)
    cycleRef.current = 1
    setSecondsLeft(4)
    setStage('breathing')
  }

  // ── Voice cues during breathing ─────────────────────────

  useEffect(() => {
    if (stage !== 'breathing' || !soundEnabled) return

    const phase = PHASES[phaseIndex]

    // Speak the cue
    speakAsync(phase.cue, 0.75, 0.85)

    // Tone on inhale/exhale
    if (phase.phase === 'inhale') playTone(396, 0.8, 0.08)
    else if (phase.phase === 'exhale') playTone(528, 0.8, 0.08)
  }, [phaseIndex, stage, soundEnabled])

  // ── Timer ───────────────────────────────────────────────

  useEffect(() => {
    if (stage !== 'breathing' || isPaused) return

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const curPhase = phaseIndexRef.current
          const nextPhase = (curPhase + 1) % 4

          if (nextPhase === 0) {
            // Completed a full cycle
            const curCycle = cycleRef.current
            if (curCycle >= TOTAL_CYCLES) {
              // All done
              setStage('complete')
              stageRef.current = 'complete'

              // Completion voice
              if (soundEnabledRef.current) {
                setTimeout(() => {
                  playTone(528, 1.5, 0.12)
                  setTimeout(() => {
                    speakAsync(
                      'Well done. Four cycles complete. Your breathing is now calm and steady. Notice how you feel. You are ready.',
                      0.78, 0.88,
                    )
                  }, 600)
                }, 300)
              }

              return 0
            }
            // Next cycle
            const nextCycle = curCycle + 1
            setCycle(nextCycle)
            cycleRef.current = nextCycle
          }

          setPhaseIndex(nextPhase)
          phaseIndexRef.current = nextPhase
          return PHASES[nextPhase].duration
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [stage, isPaused])

  // ── Canvas animation ────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    const center = size / 2
    const maxRadius = size * 0.38
    const minRadius = size * 0.18

    const draw = () => {
      ctx.clearRect(0, 0, size, size)

      const phase = PHASES[phaseIndexRef.current]
      const curProgress = 1 - secondsLeft / phase.duration

      let breathProgress: number
      if (phase.phase === 'inhale') breathProgress = curProgress
      else if (phase.phase === 'hold-in') breathProgress = 1
      else if (phase.phase === 'exhale') breathProgress = 1 - curProgress
      else breathProgress = 0

      const radius = minRadius + (maxRadius - minRadius) * breathProgress
      const color = PHASE_COLORS[phase.phase]

      // Outer glow
      const gradient = ctx.createRadialGradient(center, center, radius * 0.5, center, center, radius * 1.4)
      gradient.addColorStop(0, `${color}30`)
      gradient.addColorStop(1, `${color}00`)
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(center, center, radius * 1.4, 0, Math.PI * 2)
      ctx.fill()

      // Main circle
      const mainGrad = ctx.createRadialGradient(center - radius * 0.2, center - radius * 0.2, 0, center, center, radius)
      mainGrad.addColorStop(0, `${color}DD`)
      mainGrad.addColorStop(1, `${color}88`)
      ctx.fillStyle = mainGrad
      ctx.beginPath()
      ctx.arc(center, center, radius, 0, Math.PI * 2)
      ctx.fill()

      // Inner highlight
      const innerGrad = ctx.createRadialGradient(center - radius * 0.15, center - radius * 0.15, 0, center, center, radius * 0.6)
      innerGrad.addColorStop(0, '#ffffff40')
      innerGrad.addColorStop(1, '#ffffff00')
      ctx.fillStyle = innerGrad
      ctx.beginPath()
      ctx.arc(center - radius * 0.1, center - radius * 0.1, radius * 0.6, 0, Math.PI * 2)
      ctx.fill()

      // Particles when breathing
      if (stageRef.current === 'breathing') {
        const time = Date.now() / 1000
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 + time * 0.3
          const particleRadius = radius + 12 + Math.sin(time * 2 + i) * 6
          const px = center + Math.cos(angle) * particleRadius
          const py = center + Math.sin(angle) * particleRadius
          const pSize = 2 + Math.sin(time * 3 + i * 0.5) * 1
          ctx.fillStyle = `${color}60`
          ctx.beginPath()
          ctx.arc(px, py, pSize, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Timer arc
      const arcRadius = maxRadius + 25
      ctx.strokeStyle = '#e2e8f020'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(center, center, arcRadius, -Math.PI / 2, Math.PI * 1.5)
      ctx.stroke()

      if (stageRef.current === 'breathing') {
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.arc(center, center, arcRadius, -Math.PI / 2, -Math.PI / 2 + curProgress * Math.PI * 2)
        ctx.stroke()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [secondsLeft])

  const reset = () => {
    setStage('ready')
    setIsPaused(false)
    setPhaseIndex(0)
    phaseIndexRef.current = 0
    setSecondsLeft(4)
    setCycle(1)
    cycleRef.current = 1
    speechSynthesis.cancel()
  }

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false)
    } else {
      setIsPaused(true)
      speechSynthesis.cancel()
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Header — compact */}
      <h2 className="text-2xl font-bold text-[#1E1B4B] mb-1">{title}</h2>

      {stage === 'ready' && (
        <p className="text-slate-500 text-sm text-center max-w-xs mb-3">
          Breathe in a square pattern: <strong>4s in → 4s hold → 4s out → 4s hold</strong>. 4 cycles, voice-guided.
        </p>
      )}
      {stage === 'intro' && <p className="text-slate-500 text-sm mb-3">Listen to the introduction...</p>}
      {stage === 'breathing' && <p className="text-slate-500 text-sm mb-3">Cycle {cycle} of {TOTAL_CYCLES}</p>}
      {stage === 'complete' && <p className="text-slate-500 text-sm mb-3">Exercise complete!</p>}

      {/* Canvas */}
      <div className="relative mb-4">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="w-[260px] h-[260px] sm:w-[320px] sm:h-[320px]"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {stage === 'complete' ? (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                <Check className="w-7 h-7 text-emerald-600" />
              </div>
              <span className="text-lg font-bold text-emerald-700">Well done!</span>
            </div>
          ) : stage === 'intro' ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-0.5 mb-2">
                <div className="w-1 h-3 bg-violet-400 rounded-full animate-pulse" />
                <div className="w-1 h-5 bg-violet-300 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                <div className="w-1 h-2 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                <div className="w-1 h-4 bg-violet-300 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-3 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.25s' }} />
              </div>
              <span className="text-sm font-medium text-violet-600">Listening...</span>
            </div>
          ) : stage === 'breathing' ? (
            <>
              <span className="text-3xl sm:text-4xl font-bold text-[#1E1B4B]">{secondsLeft}</span>
              <span className="text-sm font-semibold tracking-wider uppercase mt-1"
                style={{ color: PHASE_COLORS[currentPhase.phase] }}
              >
                {currentPhase.label}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Phase indicators (during breathing) */}
      {stage === 'breathing' && (
        <div className="flex items-center gap-1.5 mb-4">
          {PHASES.map((p, i) => (
            <div key={p.phase} className="flex items-center gap-1.5">
              <div className={`px-2 py-1 rounded-full text-[11px] font-medium transition-all
                ${i === phaseIndex
                  ? 'bg-[#1E1B4B] text-white'
                  : 'bg-slate-100 text-slate-400'
                }`}
              >
                {p.label}
              </div>
              {i < PHASES.length - 1 && (
                <div className="w-3 h-px bg-slate-200" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {stage === 'ready' && (
          <button
            onClick={startWithIntro}
            className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            <Play className="w-5 h-5" /> Start
          </button>
        )}
        {stage === 'complete' && (
          <>
            <button onClick={reset} className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Repeat
            </button>
            <button onClick={onComplete} className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
              <Check className="w-4 h-4" /> Complete (+25 XP)
            </button>
          </>
        )}
        {stage === 'breathing' && (
          <>
            <button
              onClick={togglePause}
              className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={reset} className="p-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors" title="Stop">
              <RotateCcw className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => { if (soundEnabled) speechSynthesis.cancel(); setSoundEnabled(!soundEnabled) }}
              className="p-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-slate-500" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </>
        )}
        {stage === 'intro' && (
          <span className="text-sm text-slate-400">Preparing...</span>
        )}
      </div>
    </div>
  )
}
