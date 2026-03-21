import { useState, useEffect, useRef } from 'react'
import { Play, Check, Volume2, VolumeX, Pause } from 'lucide-react'

interface Props {
  title: string
  onComplete: () => void
}

interface Step {
  instruction: string
  description: string
  duration: number
}

const VISUALIZATIONS: Record<string, Step[]> = {
  'Exam Success Visualization': [
    {
      instruction: 'Close your eyes',
      description: 'Gently close your eyes. Sit comfortably and place your hands in your lap. Let your shoulders drop. Take a slow, deep breath in through your nose, and release it through your mouth. Let the outside world fade away. Focus only on the sound of my voice and the rhythm of your breathing.',
      duration: 45,
    },
    {
      instruction: 'The morning of your exam',
      description: 'Picture yourself waking up on exam day. You feel rested. You have prepared well. You eat a calm breakfast. You pack your bag. You feel a quiet confidence growing inside you.',
      duration: 50,
    },
    {
      instruction: 'Arriving at the exam hall',
      description: 'You walk through the doors. The room is bright and quiet. Other students are settling in. You find your seat and sit down. You feel grounded. Your breathing is steady and calm.',
      duration: 45,
    },
    {
      instruction: 'Opening the paper',
      description: 'The exam begins. You turn over the paper. You read the first question slowly. You recognise the topic. A small smile forms. You know this. Your preparation has brought you here.',
      duration: 45,
    },
    {
      instruction: 'Writing with confidence',
      description: 'Your pen moves across the page. Words and ideas flow naturally. You are not rushing. You are not panicking. Each answer comes from the knowledge you have built over weeks and months.',
      duration: 45,
    },
    {
      instruction: 'Handling a tough question',
      description: 'You reach a question that feels harder. You pause. You breathe. You read it again. Ideas begin to form. You write what you know. You move on without fear. Not every question has to be perfect.',
      duration: 50,
    },
    {
      instruction: 'Time is on your side',
      description: 'You glance at the clock. There is still time. You are not behind. You continue at your pace, steady and focused. The room around you fades. It is just you and the paper.',
      duration: 40,
    },
    {
      instruction: 'Finishing strong',
      description: 'You reach the final question. You write your answer clearly. You put your pen down. You look over your work with satisfaction. You gave your best effort. That is all anyone can ask.',
      duration: 40,
    },
    {
      instruction: 'Feel the pride',
      description: 'The exam is over. You stand up and walk out. You feel light. You feel proud. Not because it was easy, but because you stayed calm, you stayed focused, and you gave everything you had.',
      duration: 40,
    },
    {
      instruction: 'Return to the present',
      description: 'Now bring your awareness back to this room. Feel the chair beneath you. Wiggle your fingers and toes. Take three slow, deep breaths. When you are ready, gently open your eyes.',
      duration: 45,
    },
    {
      instruction: 'Carry this with you',
      description: 'Remember this feeling of calm confidence. You can return to it anytime. Before your next exam, close your eyes, breathe deeply, and remember: you are prepared, you are capable, you are ready.',
      duration: 45,
    },
  ],
  'Growth Mindset Visualization': [
    {
      instruction: 'Close your eyes',
      description: 'Find a comfortable position and gently close your eyes. Take three slow breaths. Let each exhale carry away any tension you are holding. Let go of any self-doubt.',
      duration: 35,
    },
    {
      instruction: 'Think of something difficult',
      description: 'Bring to mind a subject or topic that feels hard. Something that makes you think: I am not good at this. Hold that thought gently. Do not judge it. Just notice it.',
      duration: 40,
    },
    {
      instruction: 'See your younger self',
      description: 'Think back to something you can do now that once felt impossible. Reading. Riding a bike. Solving equations. You were not born knowing these things. You learned them. Step by step.',
      duration: 45,
    },
    {
      instruction: 'Watch yourself studying',
      description: 'Now picture yourself sitting down with the difficult topic. You read a paragraph. You do not understand it fully. So you read it again. You make notes. You try a practice question. You get it wrong. And you try again.',
      duration: 50,
    },
    {
      instruction: 'Each attempt builds something',
      description: 'Every time you try, your brain builds new connections. Even when it feels like nothing is happening, your mind is working. Struggle is not failure. Struggle is growth happening in real time.',
      duration: 45,
    },
    {
      instruction: 'Feel the breakthrough',
      description: 'Imagine a moment where it clicks. The concept suddenly makes sense. The problem that confused you becomes clear. Feel that rush of understanding. That moment was built by every failed attempt before it.',
      duration: 45,
    },
    {
      instruction: 'You are growing',
      description: 'You did not get here by talent alone. You got here by showing up, by being patient, by refusing to give up. That persistence is your greatest strength. It will carry you through any challenge.',
      duration: 40,
    },
    {
      instruction: 'Replace the doubt',
      description: 'The thought I am not good at this is not true. The truth is: I have not mastered it yet. Yet. That one word changes everything. It means the story is not over. You are still writing it.',
      duration: 45,
    },
    {
      instruction: 'Open your eyes',
      description: 'Take a deep breath. Bring your attention back to this room. Wiggle your fingers. Open your eyes slowly. Carry this feeling of growth with you into your next study session.',
      duration: 50,
    },
  ],
  'Mountain Meditation': [
    {
      instruction: 'Close your eyes',
      description: 'Sit upright but relaxed. Place your feet flat on the ground. Gently close your eyes. Feel your body supported by the chair beneath you. Take a deep breath in, and slowly let it go.',
      duration: 35,
    },
    {
      instruction: 'Picture a mountain',
      description: 'In your mind, see a great mountain rising before you. It is enormous. Its base is wide and anchored deep in the earth. Its peak reaches into the clouds. It has stood for thousands of years.',
      duration: 45,
    },
    {
      instruction: 'Notice its stillness',
      description: 'The mountain does not move. It does not rush. It does not worry. It simply exists, solid and present. It does not need to prove itself. Its strength is quiet and certain.',
      duration: 40,
    },
    {
      instruction: 'Become the mountain',
      description: 'Now imagine that you are the mountain. Your body is the base, stable and grounded. Your spine is the core, strong and upright. Your head is the peak, calm and clear above the clouds.',
      duration: 45,
    },
    {
      instruction: 'The weather comes',
      description: 'Rain begins to fall on your slopes. Wind blows across your face. Dark clouds gather. These are your worries, your exams, your deadlines. They swirl around you. But you do not move.',
      duration: 45,
    },
    {
      instruction: 'You remain',
      description: 'The storm grows louder. Thunder. Lightning. But the mountain does not flinch. It has weathered a thousand storms before. This one will pass too. And you will still be standing.',
      duration: 45,
    },
    {
      instruction: 'The clouds clear',
      description: 'Slowly, the rain stops. The wind calms. The clouds begin to part. Warm golden sunlight breaks through and touches your peak. The storm has passed. You are still here. Unchanged. Unbroken.',
      duration: 45,
    },
    {
      instruction: 'Feel your strength',
      description: 'You have the same steadiness within you. Exams will come. Stress will come. Doubt will come. And they will pass. Because you are the mountain. Strong, patient, unshakable.',
      duration: 40,
    },
    {
      instruction: 'Return gently',
      description: 'Take a slow breath. Feel the ground beneath your feet. Feel the air on your skin. Bring your attention back to this room. When you are ready, open your eyes. You are calm, strong, and ready.',
      duration: 50,
    },
  ],
}

// ── Voice narration ─────────────────────────────────────────

function getCalcVoice(): SpeechSynthesisVoice | null {
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

function speak(text: string, rate = 0.85, pitch = 0.9): Promise<void> {
  return new Promise((resolve) => {
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voice = getCalcVoice()
    if (voice) utterance.voice = voice
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = 1
    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    speechSynthesis.speak(utterance)
  })
}

function playChime() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(528, ctx.currentTime)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 1.5)

    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(792, ctx.currentTime)
    gain2.gain.setValueAtTime(0.08, ctx.currentTime)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
    osc2.start(ctx.currentTime + 0.05)
    osc2.stop(ctx.currentTime + 1.2)
  } catch {
    // silent fallback
  }
}

// ── Component ───────────────────────────────────────────────

export default function VisualizationExercise({ title, onComplete }: Props) {
  const [hasStarted, setHasStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  // Use refs for values accessed inside setInterval to avoid stale closures
  const stepIndexRef = useRef(0)
  const voiceEnabledRef = useRef(true)

  const steps = VISUALIZATIONS[title] || VISUALIZATIONS['Exam Success Visualization']
  const currentStep = steps[stepIndex]
  const progress = hasStarted && !isPaused && currentStep ? 1 - secondsLeft / currentStep.duration : 0

  // Keep refs in sync
  useEffect(() => { stepIndexRef.current = stepIndex }, [stepIndex])
  useEffect(() => { voiceEnabledRef.current = voiceEnabled }, [voiceEnabled])

  // Load voices
  useEffect(() => {
    const load = () => speechSynthesis.getVoices()
    load()
    speechSynthesis.addEventListener('voiceschanged', load)
    return () => speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  // Track whether we're on the final step so we don't cancel its speech
  const isLastStepRef = useRef(false)
  const isSpeakingRef = useRef(false)

  // Speak current step when it changes
  useEffect(() => {
    if (!hasStarted || isComplete || isPaused || !voiceEnabled) return

    let cancelled = false
    isLastStepRef.current = stepIndex >= steps.length - 1

    playChime()

    const timeout = setTimeout(async () => {
      const step = steps[stepIndex]
      if (!step || cancelled) return
      setIsSpeaking(true)
      isSpeakingRef.current = true
      await speak(step.instruction, 0.78, 0.85)
      if (cancelled) return
      await new Promise((r) => setTimeout(r, 800))
      if (cancelled) return
      await speak(step.description, 0.8, 0.9)
      if (cancelled) return

      // On the last step, keep isSpeakingRef true through the completion flow
      // so the timer cannot race ahead and call setIsComplete before we finish
      if (isLastStepRef.current && stepIndexRef.current >= steps.length - 1) {
        // isSpeakingRef stays true — blocks timer from completing
        await new Promise((r) => setTimeout(r, 2000))
        if (cancelled) return
        playChime()
        await speak('This visualization is now complete. Take a moment to notice how you feel.', 0.78, 0.9)
        if (cancelled) return
        setIsSpeaking(false)
        isSpeakingRef.current = false
        setIsComplete(true)
      } else {
        setIsSpeaking(false)
        isSpeakingRef.current = false
      }
    }, 500)

    return () => {
      cancelled = true
      clearTimeout(timeout)
      // Only cancel speech if we're NOT on the last step (let it finish naturally)
      if (!isLastStepRef.current) {
        speechSynthesis.cancel()
        setIsSpeaking(false)
        isSpeakingRef.current = false
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, hasStarted, isComplete, isPaused, voiceEnabled])

  // Timer — uses refs to avoid stale closure issues
  useEffect(() => {
    if (!hasStarted || isComplete || isPaused) return

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const currentIdx = stepIndexRef.current
          if (currentIdx >= steps.length - 1) {
            // Last step: if voice is enabled, let the speak effect handle completion
            // so the narration finishes fully. If voice is off, complete from timer.
            if (voiceEnabledRef.current) {
              return 0
            }
            setIsComplete(true)
            return 0
          }
          // Move to next step
          const nextIdx = currentIdx + 1
          setStepIndex(nextIdx)
          stepIndexRef.current = nextIdx
          return steps[nextIdx].duration
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [hasStarted, isComplete, isPaused, steps])

  // Cleanup
  useEffect(() => {
    return () => { speechSynthesis.cancel() }
  }, [])

  // Animated starfield
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height

    const stars: Array<{ x: number; y: number; size: number; twinkle: number }> = []
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
      })
    }

    const draw = () => {
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, w, h)
      const time = Date.now() / 1000

      stars.forEach((s) => {
        const opacity = 0.3 + Math.sin(time + s.twinkle) * 0.3
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fill()
      })

      if (hasStarted) {
        const pulseSize = 120 + Math.sin(time * 0.5) * 30
        const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, pulseSize)
        gradient.addColorStop(0, `rgba(124, 58, 237, ${0.15 + Math.sin(time) * 0.05})`)
        gradient.addColorStop(0.5, `rgba(124, 58, 237, ${0.05 + Math.sin(time * 0.7) * 0.03})`)
        gradient.addColorStop(1, 'rgba(124, 58, 237, 0)')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(w / 2, h / 2, pulseSize, 0, Math.PI * 2)
        ctx.fill()

        if (isSpeaking) {
          const speakPulse = 30 + Math.sin(time * 4) * 8
          ctx.strokeStyle = `rgba(167, 139, 250, ${0.3 + Math.sin(time * 3) * 0.15})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(w / 2, h / 2, speakPulse, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // Progress dots
      const dotY = h - 30
      const spacing = Math.min(28, (w - 40) / steps.length)
      const totalWidth = (steps.length - 1) * spacing
      const startX = (w - totalWidth) / 2
      steps.forEach((_, i) => {
        const x = startX + i * spacing
        const isActive = i === stepIndexRef.current
        const isDone = i < stepIndexRef.current
        const radius = isActive ? 4 : 2.5
        ctx.fillStyle = isDone ? '#10B981' : isActive ? '#7C3AED' : '#334155'
        ctx.beginPath()
        ctx.arc(x, dotY, radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [hasStarted, steps, isSpeaking])

  const startExercise = () => {
    setHasStarted(true)
    setStepIndex(0)
    stepIndexRef.current = 0
    setSecondsLeft(steps[0].duration)
  }

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false)
    } else {
      setIsPaused(true)
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const toggleVoice = () => {
    if (voiceEnabled) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
    setVoiceEnabled(!voiceEnabled)
  }

  const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0)
  const totalMinutes = Math.round(totalDuration / 60)

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#1E1B4B] mb-1">{title}</h2>
      <p className="text-slate-500 text-sm mb-6">
        {isComplete ? 'Exercise complete.' : hasStarted ? 'Listen and follow the voice guidance.' : 'Guided audio meditation'}
      </p>

      <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-6">
        <canvas
          ref={canvasRef}
          width={500}
          height={400}
          className="w-[340px] h-[270px] sm:w-[500px] sm:h-[400px]"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          {!hasStarted ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                <Volume2 className="w-4 h-4 text-violet-300" />
                <span className="text-xs text-violet-200 font-medium">Voice-guided • {totalMinutes} min • {steps.length} stages</span>
              </div>
              <p className="text-slate-300 text-sm mb-2 max-w-xs">
                Find a quiet space and put on headphones for the best experience.
              </p>
              <p className="text-slate-400 text-xs mb-6">
                A calming voice will guide you through each step — you can close your eyes.
              </p>
              <button
                onClick={startExercise}
                className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 text-lg"
              >
                <Play className="w-5 h-5" /> Begin
              </button>
            </div>
          ) : isComplete ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <span className="text-xl font-bold text-white mb-1">Visualization Complete</span>
              <p className="text-slate-400 text-sm max-w-xs">Take a moment to notice how you feel. Carry this calm with you.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center" key={stepIndex}>
              {isSpeaking && (
                <div className="flex items-center gap-1.5 mb-4 px-3 py-1 bg-violet-500/20 rounded-full backdrop-blur-sm">
                  <div className="flex items-center gap-0.5">
                    <div className="w-1 h-3 bg-violet-400 rounded-full animate-pulse" />
                    <div className="w-1 h-4 bg-violet-300 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                    <div className="w-1 h-2 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <div className="w-1 h-5 bg-violet-300 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-3 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.25s' }} />
                  </div>
                  <span className="text-xs text-violet-300 ml-1">Speaking</span>
                </div>
              )}

              <p className="text-xs text-violet-400 mb-2 font-medium">
                Step {stepIndex + 1} of {steps.length}
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {currentStep.instruction}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base max-w-sm leading-relaxed">
                {currentStep.description}
              </p>
              <div className="mt-6 flex items-center gap-2">
                <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-400 rounded-full transition-all duration-1000"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">{secondsLeft}s</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {isComplete ? (
          <button
            onClick={onComplete}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Complete (+25 XP)
          </button>
        ) : hasStarted ? (
          <>
            <button
              onClick={togglePause}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2 backdrop-blur-sm border border-white/10"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={toggleVoice}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm border border-white/10"
              title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-white" />}
            </button>
          </>
        ) : null}
      </div>

      {/* Step progress bar */}
      {hasStarted && !isComplete && (
        <div className="mt-6 flex items-center gap-1 opacity-40">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500
                ${i < stepIndex ? 'bg-emerald-400 w-4' : i === stepIndex ? 'bg-violet-400 w-6' : 'bg-slate-400 w-3'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
