import { useState, useEffect, useRef } from 'react'
import { Play, RotateCcw, Check, Volume2, VolumeX } from 'lucide-react'
import { speakAsync as speak, speakFire as speakFireVoice, initVoices } from './voice'

interface Props {
  title: string
  onComplete: () => void
}

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out'
type Stage = 'ready' | 'intro' | 'breathing' | 'complete'

const TOTAL_CYCLES = 4
const PHASE_SECONDS = 4

const PHASE_COLORS: Record<Phase, string> = {
  'inhale': '#7C3AED',
  'hold-in': '#6D28D9',
  'exhale': '#0EA5E9',
  'hold-out': '#0284C7',
}

// ── Audio ───────────────────────────────────────────────────

function playTone(freq: number, dur: number, vol = 0.06) {
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

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// ── Component ───────────────────────────────────────────────

export default function BreathingExercise({ title, onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('ready')
  const [phase, setPhase] = useState<Phase>('inhale')
  const [label, setLabel] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(PHASE_SECONDS)
  const [cycle, setCycle] = useState(1)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const cancelledRef = useRef(false)

  // Refs read by the canvas animation loop (60fps)
  const phaseRef = useRef<Phase>('inhale')
  const phaseStartRef = useRef(0)

  // Load voices
  useEffect(() => initVoices(), [])

  // Cleanup
  useEffect(() => {
    return () => { speechSynthesis.cancel(); cancelledRef.current = true }
  }, [])

  // Helper: set phase and sync the ref + timestamp for canvas
  const enterPhase = (p: Phase, lbl: string) => {
    setPhase(p)
    setLabel(lbl)
    phaseRef.current = p
    phaseStartRef.current = Date.now()
  }

  // ── Single async loop ───────────────────────────────────

  const runBreathing = async () => {
    cancelledRef.current = false
    setStage('intro')

    if (soundEnabled) {
      await speak('This is box breathing. A powerful technique to calm your mind and body.')
      if (cancelledRef.current) return
      await wait(600)
      await speak('You will breathe in for four seconds. Hold for four seconds. Breathe out for four seconds. And hold for four seconds. We will do this four times.')
      if (cancelledRef.current) return
      await wait(600)
      await speak('The circle will grow as you breathe in and shrink as you breathe out. Close your eyes if you wish. Let us begin.')
      if (cancelledRef.current) return
      await wait(1000)
    }

    setStage('breathing')

    for (let c = 1; c <= TOTAL_CYCLES; c++) {
      if (cancelledRef.current) return
      setCycle(c)

      // Helper: run one phase — say the cue, THEN start the 4s timer + animation together
      const runPhase = async (p: Phase, lbl: string, cue: string, tone: number, toneVol: number) => {
        if (cancelledRef.current) return
        // Show the label immediately so user sees what's coming
        setPhase(p)
        setLabel(lbl)
        setSecondsLeft(PHASE_SECONDS)

        // Say the voice cue FIRST — wait for it to finish
        if (soundEnabled) {
          await speak(cue, { rate: 0.72, pitch: 0.85 })
          if (cancelledRef.current) return
        }

        // NOW start the timer and animation together
        phaseRef.current = p
        phaseStartRef.current = Date.now()
        if (soundEnabled) {
          playTone(tone, p.includes('hold') ? 3.0 : 1.5, toneVol)
        }

        // Count down exactly PHASE_SECONDS seconds
        for (let s = PHASE_SECONDS - 1; s >= 0; s--) {
          if (cancelledRef.current) return
          await wait(1000)
          if (cancelledRef.current) return
          setSecondsLeft(s)
        }
      }

      await runPhase('inhale', 'Breathe In', 'Breathe in', 396, 0.06)
      await runPhase('hold-in', 'Hold', 'Hold', 440, 0.04)
      await runPhase('exhale', 'Breathe Out', 'Breathe out', 528, 0.06)
      await runPhase('hold-out', 'Hold', 'And hold', 330, 0.04)
    }

    // ── COMPLETE ──
    if (cancelledRef.current) return
    setStage('complete')
    if (soundEnabled) {
      await wait(300)
      playTone(528, 1.5, 0.10)
      await wait(600)
      await speak('Well done. Four cycles complete. Your breathing is now calm and steady. You are ready.')
    }
  }

  // ── Canvas animation: circle synced exactly to phase timer ──

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    const center = size / 2
    const maxRadius = size * 0.40
    const minRadius = size * 0.10
    const phaseDurationMs = PHASE_SECONDS * 1000

    const draw = () => {
      ctx.clearRect(0, 0, size, size)

      const currentPhase = phaseRef.current
      const elapsed = Date.now() - phaseStartRef.current
      // Clamp progress 0→1 over exactly PHASE_SECONDS
      const t = phaseStartRef.current > 0 ? Math.min(elapsed / phaseDurationMs, 1) : 0

      // Circle size exactly follows the timer:
      let breathSize: number
      if (currentPhase === 'inhale') breathSize = t           // 0→1 over 4s
      else if (currentPhase === 'hold-in') breathSize = 1     // stays full
      else if (currentPhase === 'exhale') breathSize = 1 - t  // 1→0 over 4s
      else breathSize = 0                                      // stays empty

      const radius = Math.max(minRadius + (maxRadius - minRadius) * breathSize, 2)
      const color = PHASE_COLORS[currentPhase]

      // Background glow
      const bgGlow = ctx.createRadialGradient(center, center, 0, center, center, size * 0.48)
      bgGlow.addColorStop(0, `${color}08`)
      bgGlow.addColorStop(1, `${color}00`)
      ctx.fillStyle = bgGlow
      ctx.beginPath()
      ctx.arc(center, center, size * 0.48, 0, Math.PI * 2)
      ctx.fill()

      // Outer glow ring
      const outerGlow = ctx.createRadialGradient(center, center, radius * 0.7, center, center, radius * 1.5)
      outerGlow.addColorStop(0, `${color}20`)
      outerGlow.addColorStop(1, `${color}00`)
      ctx.fillStyle = outerGlow
      ctx.beginPath()
      ctx.arc(center, center, radius * 1.5, 0, Math.PI * 2)
      ctx.fill()

      // Main breathing circle
      const mainGrad = ctx.createRadialGradient(
        center - radius * 0.15, center - radius * 0.15, 0,
        center, center, Math.max(radius, 1),
      )
      mainGrad.addColorStop(0, `${color}EE`)
      mainGrad.addColorStop(0.7, `${color}AA`)
      mainGrad.addColorStop(1, `${color}66`)
      ctx.fillStyle = mainGrad
      ctx.beginPath()
      ctx.arc(center, center, radius, 0, Math.PI * 2)
      ctx.fill()

      // Inner light spot
      if (radius > 8) {
        const spotGrad = ctx.createRadialGradient(
          center - radius * 0.2, center - radius * 0.2, 0,
          center, center, radius * 0.5,
        )
        spotGrad.addColorStop(0, '#ffffff30')
        spotGrad.addColorStop(1, '#ffffff00')
        ctx.fillStyle = spotGrad
        ctx.beginPath()
        ctx.arc(center - radius * 0.15, center - radius * 0.15, radius * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }

      // Floating particles
      const time = Date.now() / 1000
      for (let i = 0; i < 14; i++) {
        const angle = (i / 14) * Math.PI * 2 + time * 0.15
        const dist = radius + 12 + Math.sin(time * 1.2 + i * 0.7) * 6
        const px = center + Math.cos(angle) * dist
        const py = center + Math.sin(angle) * dist
        const pSize = 1.5 + Math.sin(time * 1.5 + i) * 0.7
        const pOpacity = 0.25 + Math.sin(time * 1.3 + i * 0.4) * 0.15
        ctx.fillStyle = `${color}${Math.round(pOpacity * 255).toString(16).padStart(2, '0')}`
        ctx.beginPath()
        ctx.arc(px, py, pSize, 0, Math.PI * 2)
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const reset = () => {
    cancelledRef.current = true
    speechSynthesis.cancel()
    setStage('ready')
    enterPhase('inhale', '')
    phaseStartRef.current = 0
    setSecondsLeft(PHASE_SECONDS)
    setCycle(1)
  }

  return (
    <div className="flex flex-col items-center">
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
              <span className="text-4xl sm:text-5xl font-bold text-[#1E1B4B]">{secondsLeft}</span>
              <span className="text-sm font-semibold tracking-wider uppercase mt-1"
                style={{ color: PHASE_COLORS[phase] }}
              >
                {label}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Phase indicators */}
      {stage === 'breathing' && (
        <div className="flex items-center gap-1.5 mb-4">
          {(['inhale', 'hold-in', 'exhale', 'hold-out'] as Phase[]).map((p) => {
            const labels: Record<Phase, string> = { 'inhale': 'In', 'hold-in': 'Hold', 'exhale': 'Out', 'hold-out': 'Hold' }
            return (
              <div key={p} className="flex items-center gap-1.5">
                <div className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all
                  ${p === phase ? 'bg-[#1E1B4B] text-white' : 'bg-slate-100 text-slate-400'}`}
                >
                  {labels[p]}
                </div>
                {p !== 'hold-out' && <div className="w-2 h-px bg-slate-200" />}
              </div>
            )
          })}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {stage === 'ready' && (
          <button
            onClick={runBreathing}
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
        {(stage === 'breathing' || stage === 'intro') && (
          <>
            <button onClick={reset} className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Stop
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
      </div>
    </div>
  )
}
