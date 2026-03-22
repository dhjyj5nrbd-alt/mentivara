import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Whiteboard from '../components/Whiteboard'
import {
  Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, Send, GraduationCap,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Demo data                                                          */
/* ------------------------------------------------------------------ */

interface DemoChatMessage {
  id: number
  sender: 'tutor' | 'student'
  name: string
  body: string
  time: string
}

const TUTOR_NAME = 'Dr Sarah Mitchell'
const STUDENT_NAME = 'Alex'
const SUBJECT = 'Mathematics'

const DEMO_MESSAGES: DemoChatMessage[] = [
  { id: 1, sender: 'tutor', name: TUTOR_NAME, body: 'Welcome Alex! Ready to work on quadratic equations today?', time: '10:00' },
  { id: 2, sender: 'student', name: STUDENT_NAME, body: "Yes! I've been practising the discriminant method", time: '10:01' },
  { id: 3, sender: 'tutor', name: TUTOR_NAME, body: 'Great, let me draw out an example on the whiteboard...', time: '10:01' },
  { id: 4, sender: 'tutor', name: TUTOR_NAME, body: 'Consider x² - 5x + 6 = 0. Can you identify a, b, and c?', time: '10:02' },
  { id: 5, sender: 'student', name: STUDENT_NAME, body: 'a=1, b=-5, c=6!', time: '10:03' },
  { id: 6, sender: 'tutor', name: TUTOR_NAME, body: 'Perfect! Now calculate the discriminant b² - 4ac.', time: '10:03' },
]

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

  // Chat
  const [messages, setMessages] = useState<DemoChatMessage[]>(DEMO_MESSAGES)
  const [msgInput, setMsgInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(DEMO_MESSAGES.length + 1)

  // Controls
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCamOn, setIsCamOn] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  // Whiteboard fullscreen
  const [wbExpanded, setWbExpanded] = useState(false)

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!msgInput.trim()) return
    const msg: DemoChatMessage = {
      id: nextId.current++,
      sender: 'student',
      name: STUDENT_NAME,
      body: msgInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    }
    setMessages((prev) => [...prev, msg])
    setMsgInput('')

    // Simulate tutor reply after a moment
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: nextId.current++,
        sender: 'tutor',
        name: TUTOR_NAME,
        body: 'Good thinking! Keep going with that approach.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      }])
    }, 1800)
  }

  const handleScreenShare = () => {
    setToast('Screen sharing started')
  }

  const endLesson = () => {
    navigate('/lessons')
  }

  /* ---- fullscreen whiteboard overlay ----------------------------- */

  if (wbExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="w-[95vw] h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col">
          <Whiteboard
            isExpanded
            onCollapse={() => setWbExpanded(false)}
          />
        </div>
      </div>
    )
  }

  /* ---- main layout ----------------------------------------------- */

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* ===== Top bar ===== */}
      <div className="flex items-center justify-between px-4 h-10 bg-slate-800 text-white text-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-[#7C3AED]" />
            <span className="font-semibold text-sm">Mentivara</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">{SUBJECT}</span>
          <span className="text-slate-500">with</span>
          <span className="text-white">{TUTOR_NAME}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">Live</span>
          </div>
          <button
            onClick={endLesson}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors flex items-center gap-1"
          >
            <PhoneOff className="w-3 h-3" />
            End Lesson
          </button>
        </div>
      </div>

      {/* ===== Main content ===== */}
      <div className="flex-1 flex overflow-hidden">

        {/* --- Left: Video feeds --- */}
        <div className="w-[200px] shrink-0 flex flex-col bg-slate-800 border-r border-slate-700">
          {/* Remote video (tutor) */}
          <div className="h-[150px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-semibold mb-1">
                  SM
                </div>
                <p className="text-white text-xs opacity-90">{TUTOR_NAME}</p>
              </div>
            </div>
            <div className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
              {TUTOR_NAME}
            </div>
          </div>

          {/* Local video (student) */}
          <div className="h-[150px] relative overflow-hidden border-t border-slate-700">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-semibold mb-1">
                  A
                </div>
                <p className="text-white text-xs opacity-90">You</p>
              </div>
            </div>
            <div className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
              You
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 py-2 border-t border-slate-700">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-2 rounded-full transition-colors ${isMicOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-500 text-white'}`}
              title={isMicOn ? 'Mute mic' : 'Unmute mic'}
            >
              {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsCamOn(!isCamOn)}
              className={`p-2 rounded-full transition-colors ${isCamOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-500 text-white'}`}
              title={isCamOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isCamOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
            <button
              onClick={handleScreenShare}
              className="p-2 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors"
              title="Share screen"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- Centre: Whiteboard --- */}
        <div className="flex-1 flex flex-col min-w-0">
          <Whiteboard
            onExpand={() => setWbExpanded(true)}
          />
        </div>

        {/* --- Right: Chat panel --- */}
        <div className="w-[250px] shrink-0 flex flex-col bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-800 dark:text-white">Lesson Chat</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[10px] text-slate-400">{msg.name}</span>
                  <span className="text-[10px] text-slate-300">{msg.time}</span>
                </div>
                <div
                  className={`px-2.5 py-1.5 rounded-lg text-xs max-w-[90%] leading-relaxed ${
                    msg.sender === 'student'
                      ? 'bg-[#7C3AED] text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-1.5">
              <input
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
                placeholder="Type a message..."
                className="flex-1 px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#7C3AED] placeholder:text-slate-400"
              />
              <button
                onClick={sendMessage}
                className="p-1.5 bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
