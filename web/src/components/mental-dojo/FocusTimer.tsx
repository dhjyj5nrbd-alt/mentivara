import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Check, Volume2, VolumeX } from 'lucide-react'
import { speakAsync, initVoices } from './voice'

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

// ── Ambient sound engine (Web Audio API synthesis) ──────────

class AmbientEngine {
  private ctx: AudioContext | null = null
  private nodes: AudioNode[] = []
  private intervalIds: ReturnType<typeof setInterval>[] = []
  private running = false

  start(themeId: string) {
    this.stop()
    try {
      this.ctx = new AudioContext()
      this.running = true
      if (themeId === 'rain') this.startRain()
      else if (themeId === 'forest') this.startForest()
      else if (themeId === 'waves') this.startWaves()
      // silence = no audio
    } catch { /* no audio support */ }
  }

  stop() {
    this.running = false
    this.intervalIds.forEach((id) => clearInterval(id))
    this.intervalIds = []
    this.nodes.forEach((n) => { try { n.disconnect() } catch {} })
    this.nodes = []
    if (this.ctx) { try { this.ctx.close() } catch {} }
    this.ctx = null
  }

  /** Create a noise buffer */
  private makeNoise(type: 'white' | 'pink' | 'brown'): AudioBufferSourceNode {
    const ctx = this.ctx!
    const bufferSize = 2 * ctx.sampleRate
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate)

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, lastOut = 0

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1

        if (type === 'white') {
          data[i] = white * 0.5
        } else if (type === 'pink') {
          b0 = 0.99886 * b0 + white * 0.0555179
          b1 = 0.99332 * b1 + white * 0.0750759
          b2 = 0.96900 * b2 + white * 0.1538520
          b3 = 0.86650 * b3 + white * 0.3104856
          b4 = 0.55000 * b4 + white * 0.5329522
          b5 = -0.7616 * b5 - white * 0.0168980
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
          b6 = white * 0.115926
        } else {
          data[i] = (lastOut + 0.02 * white) / 1.02
          lastOut = data[i]
          data[i] *= 3.5
        }
      }
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    return source
  }

  // ── RAIN ──────────────────────────────────────────────────
  private startRain() {
    if (!this.ctx) return
    const ctx = this.ctx

    // Layer 1: Steady rain — pink noise, highpass to remove rumble
    const rain = this.makeNoise('pink')
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 800
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 6000
    const rainGain = ctx.createGain()
    rainGain.gain.value = 0.18
    rain.connect(hp)
    hp.connect(lp)
    lp.connect(rainGain)
    rainGain.connect(ctx.destination)
    rain.start()
    this.nodes.push(rain, hp, lp, rainGain)

    // Layer 2: Higher rain shimmer
    const shimmer = this.makeNoise('white')
    const shimmerHp = ctx.createBiquadFilter()
    shimmerHp.type = 'highpass'
    shimmerHp.frequency.value = 4000
    const shimmerGain = ctx.createGain()
    shimmerGain.gain.value = 0.04
    shimmer.connect(shimmerHp)
    shimmerHp.connect(shimmerGain)
    shimmerGain.connect(ctx.destination)
    shimmer.start()
    this.nodes.push(shimmer, shimmerHp, shimmerGain)

    // Layer 3: Occasional heavier rain gusts (volume modulation)
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.08
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.04
    lfo.connect(lfoGain)
    lfoGain.connect(rainGain.gain)
    lfo.start()
    this.nodes.push(lfo, lfoGain)
  }

  // ── FOREST ────────────────────────────────────────────────
  private startForest() {
    if (!this.ctx) return
    const ctx = this.ctx

    // Layer 1: Gentle breeze — pink noise, bandpass around 2-4kHz (rustling leaves)
    const wind = this.makeNoise('pink')
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 3000
    bp.Q.value = 0.3
    const windGain = ctx.createGain()
    windGain.gain.value = 0.08
    wind.connect(bp)
    bp.connect(windGain)
    windGain.connect(ctx.destination)
    wind.start()
    this.nodes.push(wind, bp, windGain)

    // Breeze gusts — slow LFO on the wind volume
    const breezeLfo = ctx.createOscillator()
    breezeLfo.frequency.value = 0.05
    const breezeDepth = ctx.createGain()
    breezeDepth.gain.value = 0.04
    breezeLfo.connect(breezeDepth)
    breezeDepth.connect(windGain.gain)
    breezeLfo.start()
    this.nodes.push(breezeLfo, breezeDepth)

    // Layer 2: Low ambient hum (distant sounds)
    const hum = ctx.createOscillator()
    hum.type = 'sine'
    hum.frequency.value = 120
    const humGain = ctx.createGain()
    humGain.gain.value = 0.015
    hum.connect(humGain)
    humGain.connect(ctx.destination)
    hum.start()
    this.nodes.push(hum, humGain)

    // Bird chirps — multi-note, varied timing, louder
    const birdLoop = () => {
      if (!this.ctx || !this.running) return
      this.makeBirdChirp()
      const nextDelay = 1500 + Math.random() * 4000
      const id = setTimeout(() => birdLoop(), nextDelay) as unknown as ReturnType<typeof setInterval>
      this.intervalIds.push(id)
    }
    const startId = setTimeout(() => birdLoop(), 1000 + Math.random() * 2000) as unknown as ReturnType<typeof setInterval>
    this.intervalIds.push(startId)

    // Second bird with different timing
    const bird2Loop = () => {
      if (!this.ctx || !this.running) return
      this.makeBirdChirp(true)
      const nextDelay = 3000 + Math.random() * 6000
      const id = setTimeout(() => bird2Loop(), nextDelay) as unknown as ReturnType<typeof setInterval>
      this.intervalIds.push(id)
    }
    const start2Id = setTimeout(() => bird2Loop(), 3000 + Math.random() * 3000) as unknown as ReturnType<typeof setInterval>
    this.intervalIds.push(start2Id)
  }

  private makeBirdChirp(isSecondBird = false) {
    if (!this.ctx) return
    const ctx = this.ctx
    const now = ctx.currentTime

    // Each chirp is 2-4 short notes
    const noteCount = 2 + Math.floor(Math.random() * 3)
    const baseFreq = isSecondBird
      ? 3500 + Math.random() * 1500  // higher bird
      : 2200 + Math.random() * 1200  // lower bird

    for (let n = 0; n < noteCount; n++) {
      const noteStart = now + n * 0.12
      const freq = baseFreq + (Math.random() - 0.5) * 600
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.connect(g)
      g.connect(ctx.destination)
      osc.type = 'sine'

      // Each note slides up or down slightly
      osc.frequency.setValueAtTime(freq, noteStart)
      osc.frequency.linearRampToValueAtTime(
        freq * (0.9 + Math.random() * 0.3),
        noteStart + 0.08,
      )

      g.gain.setValueAtTime(0, noteStart)
      g.gain.linearRampToValueAtTime(0.06, noteStart + 0.01)
      g.gain.linearRampToValueAtTime(0.04, noteStart + 0.04)
      g.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.1)

      osc.start(noteStart)
      osc.stop(noteStart + 0.1)
    }
  }

  // ── WAVES ─────────────────────────────────────────────────
  private startWaves() {
    if (!this.ctx) return
    const ctx = this.ctx

    // Layer 1: Deep ocean — brown noise, lowpass
    const deep = this.makeNoise('brown')
    const deepLp = ctx.createBiquadFilter()
    deepLp.type = 'lowpass'
    deepLp.frequency.value = 400
    const deepGain = ctx.createGain()
    deepGain.gain.value = 0.12
    deep.connect(deepLp)
    deepLp.connect(deepGain)
    deepGain.connect(ctx.destination)
    deep.start()
    this.nodes.push(deep, deepLp, deepGain)

    // Deep wave cycle — slow LFO modulating volume
    const deepLfo = ctx.createOscillator()
    deepLfo.frequency.value = 0.1  // ~10 second wave cycle
    const deepLfoGain = ctx.createGain()
    deepLfoGain.gain.value = 0.06
    deepLfo.connect(deepLfoGain)
    deepLfoGain.connect(deepGain.gain)
    deepLfo.start()
    this.nodes.push(deepLfo, deepLfoGain)

    // Layer 2: Surf/foam — white noise, highpass, with faster LFO offset
    const surf = this.makeNoise('white')
    const surfHp = ctx.createBiquadFilter()
    surfHp.type = 'highpass'
    surfHp.frequency.value = 2000
    const surfLp = ctx.createBiquadFilter()
    surfLp.type = 'lowpass'
    surfLp.frequency.value = 8000
    const surfGain = ctx.createGain()
    surfGain.gain.value = 0.04
    surf.connect(surfHp)
    surfHp.connect(surfLp)
    surfLp.connect(surfGain)
    surfGain.connect(ctx.destination)
    surf.start()
    this.nodes.push(surf, surfHp, surfLp, surfGain)

    // Surf volume follows waves but slightly offset
    const surfLfo = ctx.createOscillator()
    surfLfo.frequency.value = 0.1
    const surfLfoGain = ctx.createGain()
    surfLfoGain.gain.value = 0.03
    surfLfo.connect(surfLfoGain)
    surfLfoGain.connect(surfGain.gain)
    surfLfo.start()
    this.nodes.push(surfLfo, surfLfoGain)

    // Layer 3: Occasional wave crash — pink noise burst
    const crashLoop = () => {
      if (!this.ctx || !this.running) return
      const crash = this.makeNoise('pink')
      const crashBp = ctx.createBiquadFilter()
      crashBp.type = 'bandpass'
      crashBp.frequency.value = 1500
      crashBp.Q.value = 0.5
      const crashGain = ctx.createGain()
      const now = ctx.currentTime
      crashGain.gain.setValueAtTime(0, now)
      crashGain.gain.linearRampToValueAtTime(0.08, now + 0.8)
      crashGain.gain.linearRampToValueAtTime(0.03, now + 2.0)
      crashGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5)
      crash.connect(crashBp)
      crashBp.connect(crashGain)
      crashGain.connect(ctx.destination)
      crash.start(now)
      crash.stop(now + 3.5)

      const nextDelay = 6000 + Math.random() * 8000
      const id = setTimeout(() => crashLoop(), nextDelay) as unknown as ReturnType<typeof setInterval>
      this.intervalIds.push(id)
    }
    const startId = setTimeout(() => crashLoop(), 2000 + Math.random() * 3000) as unknown as ReturnType<typeof setInterval>
    this.intervalIds.push(startId)
  }
}

// ── Component ───────────────────────────────────────────────

export default function FocusTimer({ onComplete }: Props) {
  const [duration, setDuration] = useState(DURATIONS[0].seconds)
  const [timeLeft, setTimeLeft] = useState(DURATIONS[0].seconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [theme, setTheme] = useState(AMBIENT_THEMES[0])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const soundEnabledRef = useRef(true)
  const hasSpokenHalfway = useRef(false)
  const hasSpokenOneMin = useRef(false)
  const ambientRef = useRef(new AmbientEngine())

  const progress = 1 - timeLeft / duration
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  useEffect(() => { soundEnabledRef.current = soundEnabled }, [soundEnabled])

  // Load voices
  useEffect(() => initVoices(), [])

  // Start/stop ambient sound based on running state
  useEffect(() => {
    if (isRunning && soundEnabled && theme.id !== 'silence') {
      ambientRef.current.start(theme.id)
    } else {
      ambientRef.current.stop()
    }
  }, [isRunning, soundEnabled, theme.id])

  // Cleanup
  useEffect(() => {
    return () => { speechSynthesis.cancel(); ambientRef.current.stop() }
  }, [])

  // Voice intro when starting
  const startWithVoice = async () => {
    setHasStarted(true)
    hasSpokenHalfway.current = false
    hasSpokenOneMin.current = false

    if (soundEnabled) {
      const mins = Math.round(duration / 60)
      await speakAsync(
        `Deep focus session. ${mins} minutes. Remove all distractions. Put your phone away. Focus only on your study material. Let us begin.`,
        { rate: 0.78, pitch: 0.88 },
      )
      await new Promise((r) => setTimeout(r, 500))
    }

    setIsRunning(true)
  }

  // Timer
  useEffect(() => {
    if (!isRunning || isComplete) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsComplete(true)
          setIsRunning(false)

          // Completion voice
          if (soundEnabledRef.current) {
            setTimeout(() => {
              playTone(528, 1.5, 0.12)
              setTimeout(() => {
                const mins = Math.round(duration / 60)
                speakAsync(
                  `Focus session complete. You stayed focused for ${mins} minutes. Well done. Take a moment to stretch before your next session.`,
                  { rate: 0.78, pitch: 0.88 },
                )
              }, 600)
            }, 300)
          }

          return 0
        }

        // Halfway encouragement
        const half = Math.round(duration / 2)
        if (prev === half && !hasSpokenHalfway.current) {
          hasSpokenHalfway.current = true
          if (soundEnabledRef.current) {
            speakAsync('Halfway there. You are doing great. Stay focused.', { rate: 0.78, pitch: 0.88 })
          }
        }

        // One minute warning
        if (prev === 60 && !hasSpokenOneMin.current && duration > 120) {
          hasSpokenOneMin.current = true
          if (soundEnabledRef.current) {
            speakAsync('One minute remaining. Finish strong.', { rate: 0.78, pitch: 0.88 })
          }
        }

        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, isComplete, duration])

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

      const cx = w / 2
      const cy = h / 2
      const radius = Math.min(w, h) * 0.35

      ctx.strokeStyle = '#ffffff10'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.stroke()

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

  const togglePause = () => {
    if (isRunning) {
      setIsRunning(false)
      speechSynthesis.cancel()
      ambientRef.current.stop()
    } else {
      setIsRunning(true)
    }
  }

  const reset = () => {
    setIsRunning(false)
    setIsComplete(false)
    setHasStarted(false)
    setTimeLeft(duration)
    hasSpokenHalfway.current = false
    hasSpokenOneMin.current = false
    speechSynthesis.cancel()
    ambientRef.current.stop()
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#1E1B4B] mb-1">Deep Focus Timer</h2>
      <p className="text-slate-500 text-sm mb-4">
        {isComplete ? 'Session complete — great focus!' : hasStarted ? `${theme.label} • ${Math.round(progress * 100)}%` : 'Choose your duration and ambient theme.'}
      </p>

      {/* Duration selector (only before starting) */}
      {!hasStarted && (
        <div className="flex gap-2 mb-3">
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
        <div className="flex gap-2 mb-4">
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
      <div className="relative mb-4 rounded-2xl overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="w-[280px] h-[280px] sm:w-[360px] sm:h-[360px]"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isComplete ? (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
              <span className="text-xl font-bold text-white">Focus Complete!</span>
              <span className="text-sm text-slate-400 mt-1">You stayed focused for {DURATIONS.find(d => d.seconds === duration)?.label}</span>
            </div>
          ) : (
            <>
              <span className="text-5xl sm:text-6xl font-mono font-bold text-white tabular-nums">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
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
        ) : !hasStarted ? (
          <button
            onClick={startWithVoice}
            className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            <Play className="w-5 h-5" /> Start Focus
          </button>
        ) : (
          <>
            <button
              onClick={togglePause}
              className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Pause' : 'Resume'}
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
      </div>
    </div>
  )
}
