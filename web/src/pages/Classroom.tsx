import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Whiteboard from '../components/Whiteboard'
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PhoneOff, Send,
  GraduationCap, PenTool, X, MessageSquare,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Demo data                                                          */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  id: number
  sender: 'tutor' | 'student'
  name: string
  body: string
  time: string
}

const TUTOR_NAME = 'Dr Sarah Mitchell'
const STUDENT_NAME = 'Alex'
const SUBJECT = 'Maths'

const DEMO_MESSAGES: ChatMessage[] = [
  { id: 1, sender: 'tutor', name: TUTOR_NAME, body: "Welcome Alex! Let's work on quadratic equations today \u{1F4D0}", time: '10:00' },
  { id: 2, sender: 'student', name: STUDENT_NAME, body: "Hi Dr Mitchell! I've been practising the discriminant method", time: '10:01' },
  { id: 3, sender: 'tutor', name: TUTOR_NAME, body: 'Excellent! Let me share a worked example on the whiteboard', time: '10:02' },
  { id: 4, sender: 'tutor', name: TUTOR_NAME, body: 'Have a look at this equation: x\u00B2 - 5x + 6 = 0', time: '10:03' },
  { id: 5, sender: 'student', name: STUDENT_NAME, body: 'So I need to find two numbers that multiply to 6 and add to -5?', time: '10:04' },
  { id: 6, sender: 'tutor', name: TUTOR_NAME, body: 'Exactly right! What are those numbers?', time: '10:04' },
]

const TUTOR_REPLIES = [
  'Good thinking! Keep going with that approach.',
  "That's correct! You're making great progress.",
  'Interesting idea \u2014 can you explain your reasoning?',
  'Well done! Try the next one now.',
  "Almost there! Remember to check the sign of 'b'.",
  'Perfect! You really understand this concept now.',
]

const SCREEN_SHARE_IMAGE =
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop'

/* ------------------------------------------------------------------ */
/*  Toast                                                              */
/* ------------------------------------------------------------------ */

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-[100] animate-fade-in">
      {message}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Classroom page                                                     */
/* ------------------------------------------------------------------ */

export default function Classroom() {
  const navigate = useNavigate()

  /* ---- state ---- */
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES)
  const [msgInput, setMsgInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(DEMO_MESSAGES.length + 1)
  const replyIdx = useRef(0)

  const [isMicOn, setIsMicOn] = useState(true)
  const [isCamOn, setIsCamOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false)
  const [isChatVisible, setIsChatVisible] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  /* ---- PIP drag state ---- */
  const [pipPos, setPipPos] = useState<{ x: number; y: number } | null>(null)
  const pipDragging = useRef(false)
  const pipOffset = useRef({ x: 0, y: 0 })
  const videoAreaRef = useRef<HTMLDivElement>(null)

  /* ---- scroll chat ---- */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* ---- send message ---- */
  const sendMessage = useCallback(() => {
    if (!msgInput.trim()) return
    const msg: ChatMessage = {
      id: nextId.current++,
      sender: 'student',
      name: STUDENT_NAME,
      body: msgInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    }
    setMessages((prev) => [...prev, msg])
    setMsgInput('')

    // Tutor auto-reply
    setTimeout(() => {
      const reply = TUTOR_REPLIES[replyIdx.current % TUTOR_REPLIES.length]
      replyIdx.current++
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          sender: 'tutor',
          name: TUTOR_NAME,
          body: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        },
      ])
    }, 2000)
  }, [msgInput])

  /* ---- PIP drag handlers ---- */
  const onPipMouseDown = (e: React.MouseEvent) => {
    pipDragging.current = true
    const pip = e.currentTarget.getBoundingClientRect()
    pipOffset.current = { x: e.clientX - pip.left, y: e.clientY - pip.top }
    e.preventDefault()
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!pipDragging.current || !videoAreaRef.current) return
      const area = videoAreaRef.current.getBoundingClientRect()
      const x = e.clientX - area.left - pipOffset.current.x
      const y = e.clientY - area.top - pipOffset.current.y
      const clampedX = Math.max(0, Math.min(x, area.width - 160))
      const clampedY = Math.max(0, Math.min(y, area.height - 112))
      setPipPos({ x: clampedX, y: clampedY })
    }
    const onUp = () => {
      pipDragging.current = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  /* ---- control handlers ---- */
  const toggleScreenShare = () => {
    setIsScreenSharing((prev) => {
      const next = !prev
      setToast(next ? 'Screen sharing started' : 'Screen sharing stopped')
      return next
    })
  }

  const toggleWhiteboard = () => {
    setIsWhiteboardOpen((prev) => !prev)
  }

  const endLesson = () => {
    navigate('/lessons')
  }

  /* ---- pip default position (bottom-right or bottom-left) ---- */
  const pipDefaultClass = isScreenSharing
    ? 'bottom-3 left-3'
    : 'bottom-3 right-3'

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="h-screen flex flex-col bg-[#0f1117] select-none">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* ===== TOP BAR ===== */}
      <div className="flex items-center justify-between px-4 h-11 bg-[#161822] text-white text-sm shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-[#7C3AED]" />
            <span className="font-semibold text-sm">Mentivara</span>
          </div>
          <span className="text-white/20">|</span>
          <span className="text-white/60">{SUBJECT}</span>
          <span className="text-white/30">&middot;</span>
          <span className="text-white/80">{TUTOR_NAME}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">Live</span>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex overflow-hidden">

        {/* --- VIDEO AREA --- */}
        <div ref={videoAreaRef} className="flex-1 relative bg-[#0f1117] overflow-hidden">

          {/* Tutor video / screen share */}
          {isScreenSharing ? (
            <div className="absolute inset-0 flex flex-col">
              <div className="shrink-0 bg-black/60 px-4 py-2 text-white/80 text-sm text-center">
                <Monitor className="w-4 h-4 inline mr-2 -mt-0.5" />
                {TUTOR_NAME} is sharing their screen
              </div>
              <div className="flex-1 flex items-center justify-center bg-[#0a0c12]">
                <img
                  src={SCREEN_SHARE_IMAGE}
                  alt="Shared screen"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1040] via-[#1e1145] to-[#0f1117] flex items-center justify-center">
              <div className="text-center">
                <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center text-white text-4xl font-semibold mb-4 ring-4 ring-white/10">
                  SM
                </div>
                <p className="text-white text-lg font-medium">{TUTOR_NAME}</p>
                <p className="text-white/40 text-sm mt-1">{SUBJECT} Tutor</p>
              </div>
            </div>
          )}

          {/* PIP (student) */}
          <div
            onMouseDown={onPipMouseDown}
            className={`absolute w-40 h-28 rounded-lg border-2 border-white/20 overflow-hidden shadow-xl cursor-grab active:cursor-grabbing transition-shadow hover:border-white/40 z-10 ${
              pipPos ? '' : pipDefaultClass
            }`}
            style={pipPos ? { left: pipPos.x, top: pipPos.y } : undefined}
          >
            {isCamOn ? (
              <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-semibold">
                    A
                  </div>
                  <p className="text-white/70 text-[10px] mt-1">You</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <VideoOff className="w-5 h-5 text-white/30" />
              </div>
            )}
            <div className="absolute bottom-1 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
              You
            </div>
          </div>

          {/* WHITEBOARD OVERLAY */}
          {isWhiteboardOpen && (
            <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center p-4">
              <div className="relative w-[95%] h-[92%] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col">
                <button
                  onClick={() => setIsWhiteboardOpen(false)}
                  className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-800 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <Whiteboard isExpanded={false} />
              </div>
            </div>
          )}
        </div>

        {/* --- CHAT PANEL --- */}
        {isChatVisible && (
          <div className="w-[280px] shrink-0 flex flex-col bg-white dark:bg-[#161822] border-l border-slate-200 dark:border-white/5">
            {/* Chat header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 dark:border-white/5">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Chat</p>
              <button
                onClick={() => setIsChatVisible(false)}
                className="w-6 h-6 rounded hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors"
                title="Hide chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[10px] text-slate-400 dark:text-white/30">
                      {msg.sender === 'student' ? 'You' : msg.name.split(' ').pop()}
                    </span>
                    <span className="text-[10px] text-slate-300 dark:text-white/20">{msg.time}</span>
                  </div>
                  <div
                    className={`px-3 py-2 rounded-2xl text-xs max-w-[92%] leading-relaxed ${
                      msg.sender === 'student'
                        ? 'bg-[#7C3AED] text-white rounded-br-sm'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white/80 rounded-bl-sm'
                    }`}
                  >
                    {msg.body}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-2.5 border-t border-slate-200 dark:border-white/5">
              <div className="flex gap-2">
                <input
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendMessage()
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs bg-white dark:bg-white/5 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#7C3AED] placeholder:text-slate-400 dark:placeholder:text-white/20"
                />
                <button
                  onClick={sendMessage}
                  className="p-2 bg-[#7C3AED] text-white rounded-xl hover:bg-[#6D28D9] transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== BOTTOM CONTROL BAR ===== */}
      <div className="h-14 shrink-0 bg-[#161822] border-t border-white/5 flex items-center justify-center gap-2">
        {/* Mic */}
        <ControlButton
          icon={isMicOn ? <Mic className="w-[18px] h-[18px]" /> : <MicOff className="w-[18px] h-[18px]" />}
          label={isMicOn ? 'Mic' : 'Muted'}
          active={!isMicOn}
          activeColor="bg-red-500 hover:bg-red-600"
          onClick={() => setIsMicOn((p) => !p)}
        />

        {/* Camera */}
        <ControlButton
          icon={isCamOn ? <Video className="w-[18px] h-[18px]" /> : <VideoOff className="w-[18px] h-[18px]" />}
          label={isCamOn ? 'Camera' : 'Cam Off'}
          active={!isCamOn}
          activeColor="bg-red-500 hover:bg-red-600"
          onClick={() => setIsCamOn((p) => !p)}
        />

        {/* Screen Share */}
        <ControlButton
          icon={isScreenSharing ? <MonitorOff className="w-[18px] h-[18px]" /> : <Monitor className="w-[18px] h-[18px]" />}
          label="Share"
          active={isScreenSharing}
          activeColor="bg-blue-500 hover:bg-blue-600"
          onClick={toggleScreenShare}
        />

        {/* Whiteboard */}
        <ControlButton
          icon={<PenTool className="w-[18px] h-[18px]" />}
          label="Board"
          active={isWhiteboardOpen}
          activeColor="bg-[#7C3AED] hover:bg-[#6D28D9]"
          onClick={toggleWhiteboard}
        />

        {/* Chat toggle (only if hidden) */}
        {!isChatVisible && (
          <ControlButton
            icon={<MessageSquare className="w-[18px] h-[18px]" />}
            label="Chat"
            onClick={() => setIsChatVisible(true)}
          />
        )}

        {/* Divider */}
        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* End Lesson */}
        <button
          onClick={endLesson}
          className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
        >
          <PhoneOff className="w-[18px] h-[18px]" />
          <span className="text-[10px] leading-none">End</span>
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Control bar button                                                 */
/* ------------------------------------------------------------------ */

function ControlButton({
  icon,
  label,
  active = false,
  activeColor = '',
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  activeColor?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-colors ${
        active
          ? `${activeColor} text-white`
          : 'bg-[#252839] text-white hover:bg-[#2d3048]'
      }`}
    >
      {icon}
      <span className="text-[10px] leading-none">{label}</span>
    </button>
  )
}
