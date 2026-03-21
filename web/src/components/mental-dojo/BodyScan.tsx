import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Check, Volume2, VolumeX } from 'lucide-react'
import { speakFire, initVoices } from './voice'

interface Props {
  onComplete: () => void
}

interface BodyPart {
  name: string
  instruction: string
  y: number // percentage position on the body silhouette
  duration: number
}

const BODY_PARTS: BodyPart[] = [
  { name: 'Head', instruction: 'Release tension in your forehead, jaw, and temples. Let your face soften.', y: 8, duration: 8 },
  { name: 'Neck & Shoulders', instruction: 'Drop your shoulders away from your ears. Let the weight melt away.', y: 20, duration: 8 },
  { name: 'Arms & Hands', instruction: 'Relax your arms. Unclench your fists. Let your fingers go limp.', y: 38, duration: 8 },
  { name: 'Chest', instruction: 'Breathe deeply. Feel your chest rise and fall. Release any tightness.', y: 32, duration: 8 },
  { name: 'Stomach', instruction: 'Let your stomach relax. Release the urge to hold it in. Breathe into it.', y: 48, duration: 8 },
  { name: 'Legs', instruction: 'Relax your thighs, knees, and calves. Let them feel heavy and warm.', y: 65, duration: 8 },
  { name: 'Feet', instruction: 'Release tension in your feet and toes. Feel grounded and connected to the earth.', y: 88, duration: 8 },
]

function speakText(text: string) {
  speakFire(text, { rate: 0.82, pitch: 1.05 })
}

export default function BodyScan({ onComplete }: Props) {
  const [hasStarted, setHasStarted] = useState(false)
  const [partIndex, setPartIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [scannedParts, setScannedParts] = useState<Set<number>>(new Set())
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  const currentPart = BODY_PARTS[partIndex]

  // Speak each body part instruction
  useEffect(() => {
    if (!hasStarted || isComplete || !voiceEnabled) return
    speakText(`${currentPart.name}. ${currentPart.instruction}`)
  }, [partIndex, hasStarted, isComplete, voiceEnabled])

  // Speak completion
  useEffect(() => {
    if (isComplete && voiceEnabled) {
      speakText('Body scan complete. Your body is relaxed and ready.')
    }
  }, [isComplete, voiceEnabled])

  // Init voices & cleanup
  useEffect(() => {
    const cleanup = initVoices()
    return () => { cleanup(); speechSynthesis.cancel() }
  }, [])

  // Timer
  useEffect(() => {
    if (!hasStarted || isComplete) return
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setScannedParts((s) => new Set([...s, partIndex]))
          if (partIndex >= BODY_PARTS.length - 1) {
            setIsComplete(true)
            return 0
          }
          setPartIndex((i) => i + 1)
          return BODY_PARTS[partIndex + 1].duration
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [hasStarted, isComplete, partIndex])

  // Body silhouette canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      // Background
      ctx.fillStyle = '#F8FAFC'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const time = Date.now() / 1000

      // Draw body silhouette
      ctx.fillStyle = '#E2E8F0'
      ctx.strokeStyle = '#CBD5E1'
      ctx.lineWidth = 2

      // Head
      ctx.beginPath()
      ctx.arc(cx, h * 0.1, 22, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Neck
      ctx.fillRect(cx - 6, h * 0.13, 12, 14)

      // Body (torso)
      ctx.beginPath()
      ctx.moveTo(cx - 30, h * 0.19)
      ctx.quadraticCurveTo(cx - 35, h * 0.35, cx - 25, h * 0.55)
      ctx.lineTo(cx + 25, h * 0.55)
      ctx.quadraticCurveTo(cx + 35, h * 0.35, cx + 30, h * 0.19)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Arms
      ctx.lineWidth = 10
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#E2E8F0'
      // Left arm
      ctx.beginPath()
      ctx.moveTo(cx - 30, h * 0.22)
      ctx.quadraticCurveTo(cx - 50, h * 0.35, cx - 45, h * 0.48)
      ctx.stroke()
      // Right arm
      ctx.beginPath()
      ctx.moveTo(cx + 30, h * 0.22)
      ctx.quadraticCurveTo(cx + 50, h * 0.35, cx + 45, h * 0.48)
      ctx.stroke()

      // Legs
      ctx.strokeStyle = '#E2E8F0'
      ctx.lineWidth = 12
      // Left leg
      ctx.beginPath()
      ctx.moveTo(cx - 15, h * 0.55)
      ctx.quadraticCurveTo(cx - 20, h * 0.7, cx - 18, h * 0.85)
      ctx.stroke()
      // Right leg
      ctx.beginPath()
      ctx.moveTo(cx + 15, h * 0.55)
      ctx.quadraticCurveTo(cx + 20, h * 0.7, cx + 18, h * 0.85)
      ctx.stroke()

      // Highlight current body part and scanned parts
      BODY_PARTS.forEach((part, i) => {
        const py = h * (part.y / 100)
        const isActive = hasStarted && i === partIndex && !isComplete
        const isDone = scannedParts.has(i) || (isComplete && true)

        if (isDone) {
          // Green glow for completed
          const grad = ctx.createRadialGradient(cx, py, 0, cx, py, 35)
          grad.addColorStop(0, '#10B98140')
          grad.addColorStop(1, '#10B98100')
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(cx, py, 35, 0, Math.PI * 2)
          ctx.fill()
        }

        if (isActive) {
          // Pulsing violet glow for active
          const pulseSize = 40 + Math.sin(time * 3) * 8
          const grad = ctx.createRadialGradient(cx, py, 0, cx, py, pulseSize)
          grad.addColorStop(0, '#7C3AED50')
          grad.addColorStop(0.6, '#7C3AED20')
          grad.addColorStop(1, '#7C3AED00')
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(cx, py, pulseSize, 0, Math.PI * 2)
          ctx.fill()

          // Scan line effect
          const scanY = py - 15 + ((time * 30) % 30)
          ctx.strokeStyle = '#7C3AED30'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(cx - 40, scanY)
          ctx.lineTo(cx + 40, scanY)
          ctx.stroke()
        }
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [hasStarted, partIndex, scannedParts, isComplete])

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#1E1B4B] mb-1">Pre-Exam Body Scan</h2>
      <p className="text-slate-500 mb-6">
        {isComplete ? 'Your body is relaxed and ready.' : 'Systematically release tension from head to toe.'}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
        {/* Body canvas */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <canvas
            ref={canvasRef}
            width={200}
            height={400}
            className="w-[160px] h-[320px] sm:w-[200px] sm:h-[400px]"
          />
        </div>

        {/* Instructions panel */}
        <div className="flex-1 max-w-sm">
          {!hasStarted ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
              <p className="text-slate-600 mb-6">
                Sit comfortably. This guided body scan will help you release physical tension before your exam.
              </p>
              <div className="flex items-center gap-2 mb-4 px-3 py-1.5 bg-violet-50 rounded-full">
                <Volume2 className="w-3.5 h-3.5 text-violet-500" />
                <span className="text-xs text-violet-600 font-medium">Voice-guided — close your eyes and listen</span>
              </div>
              <button
                onClick={() => { setHasStarted(true); setSecondsLeft(BODY_PARTS[0].duration) }}
                className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl transition-colors flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" /> Begin Scan
              </button>
            </div>
          ) : isComplete ? (
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Check className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-emerald-800 mb-2">Body Scan Complete</h3>
              <p className="text-emerald-700 text-sm mb-4">All tension released. You are calm and grounded.</p>
              <button
                onClick={onComplete}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
              >
                <Check className="w-4 h-4" /> Complete (+25 XP)
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-violet-200 p-6" key={partIndex}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-violet-600 uppercase tracking-wider">
                  {partIndex + 1} / {BODY_PARTS.length}
                </span>
                <span className="text-xs text-slate-400">• {secondsLeft}s</span>
              </div>
              <h3 className="text-xl font-bold text-[#1E1B4B] mb-2">{currentPart.name}</h3>
              <p className="text-slate-600 leading-relaxed">{currentPart.instruction}</p>

              {/* Progress bar */}
              <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-rose-400 rounded-full transition-all duration-1000"
                  style={{ width: `${((partIndex + 1 - secondsLeft / currentPart.duration) / BODY_PARTS.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Voice toggle + scanned parts checklist */}
          {hasStarted && !isComplete && (
            <div className="mt-3 mb-2">
              <button
                onClick={() => { setVoiceEnabled(!voiceEnabled); if (voiceEnabled) speechSynthesis.cancel() }}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                {voiceEnabled ? 'Voice on' : 'Voice off'}
              </button>
            </div>
          )}
          {hasStarted && !isComplete && (
            <div className="flex flex-wrap gap-1.5">
              {BODY_PARTS.map((part, i) => (
                <span
                  key={i}
                  className={`text-xs px-2 py-1 rounded-full
                    ${scannedParts.has(i) ? 'bg-emerald-100 text-emerald-700' : i === partIndex ? 'bg-violet-100 text-violet-700 animate-pulse' : 'bg-slate-100 text-slate-400'}`}
                >
                  {scannedParts.has(i) && '✓ '}{part.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
