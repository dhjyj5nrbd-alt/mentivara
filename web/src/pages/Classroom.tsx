import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { classroomService, type ClassroomData, type ChatMessage } from '../services/classroom'
import Whiteboard from '../components/Whiteboard'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send, MessageSquare, PenTool, Monitor } from 'lucide-react'

type Tab = 'chat' | 'whiteboard'

export default function Classroom() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()

  const [classroom, setClassroom] = useState<ClassroomData | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('chat')

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [msgInput, setMsgInput] = useState('')
  const [lastMsgId, setLastMsgId] = useState(0)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Whiteboard state
  const [strokes, setStrokes] = useState<any[]>([])
  const [lastStrokeId, setLastStrokeId] = useState(0)

  // Video state
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCamOn, setIsCamOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)

  const id = Number(lessonId)

  // Join classroom
  useEffect(() => {
    classroomService.join(id).then((data) => {
      setClassroom(data)
      setMessages(data.messages)
      setStrokes(data.strokes.map((s: any) => s.data))
      if (data.messages.length > 0) {
        setLastMsgId(data.messages[data.messages.length - 1].id)
      }
      if (data.strokes.length > 0) {
        setLastStrokeId(data.strokes[data.strokes.length - 1].id)
      }
    }).catch(() => setError('Failed to join classroom.'))
  }, [id])

  // Start local video
  useEffect(() => {
    if (!classroom) return
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
        setupWebRTC(stream)
      })
      .catch(() => {
        // Camera/mic not available — continue without video
      })

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      pcRef.current?.close()
    }
  }, [classroom])// eslint-disable-line

  // WebRTC setup
  const setupWebRTC = useCallback(async (stream: MediaStream) => {
    if (!classroom) return

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })
    pcRef.current = pc

    stream.getTracks().forEach((track) => pc.addTrack(track, stream))

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        classroomService.sendSignal(id, classroom.peer_id, 'ice-candidate', {
          candidate: event.candidate.toJSON(),
        })
      }
    }

    // Tutor initiates the offer
    if (classroom.role === 'tutor') {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      classroomService.sendSignal(id, classroom.peer_id, 'offer', {
        sdp: offer.sdp, type: offer.type,
      })
    }
  }, [classroom, id])

  // Poll for signals, messages, strokes
  useEffect(() => {
    if (!classroom) return

    const interval = setInterval(async () => {
      try {
        // Poll WebRTC signals
        const signals = await classroomService.pollSignals(id)
        const pc = pcRef.current
        if (pc) {
          for (const sig of signals) {
            if (sig.type === 'offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(sig.payload))
              const answer = await pc.createAnswer()
              await pc.setLocalDescription(answer)
              classroomService.sendSignal(id, classroom.peer_id, 'answer', {
                sdp: answer.sdp, type: answer.type,
              })
            } else if (sig.type === 'answer') {
              await pc.setRemoteDescription(new RTCSessionDescription(sig.payload))
            } else if (sig.type === 'ice-candidate' && sig.payload.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(sig.payload.candidate))
            }
          }
        }

        // Poll messages
        const newMessages = await classroomService.pollMessages(id, lastMsgId)
        if (newMessages.length > 0) {
          setMessages((prev) => [...prev, ...newMessages])
          setLastMsgId(newMessages[newMessages.length - 1].id)
        }

        // Poll whiteboard strokes
        const newStrokes = await classroomService.pollStrokes(id, lastStrokeId)
        if (newStrokes.length > 0) {
          setStrokes((prev) => [...prev, ...newStrokes.map((s: any) => s.data)])
          setLastStrokeId(newStrokes[newStrokes.length - 1].id)
        }
      } catch {
        // ignore poll errors
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [classroom, id, lastMsgId, lastStrokeId])

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!msgInput.trim()) return
    const body = msgInput.trim()
    setMsgInput('')
    await classroomService.sendMessage(id, body)
  }

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setIsMicOn(track.enabled)
    }
  }

  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setIsCamOn(track.enabled)
    }
  }

  const toggleScreenShare = async () => {
    const pc = pcRef.current
    if (!pc || !classroom) return

    if (!isScreenSharing) {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true })
        const screenTrack = screen.getVideoTracks()[0]
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
        if (sender) {
          await sender.replaceTrack(screenTrack)
          setIsScreenSharing(true)
          screenTrack.onended = () => {
            const camTrack = localStreamRef.current?.getVideoTracks()[0]
            if (camTrack && sender) sender.replaceTrack(camTrack)
            setIsScreenSharing(false)
          }
        }
      } catch { /* user cancelled */ }
    } else {
      const camTrack = localStreamRef.current?.getVideoTracks()[0]
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
      if (camTrack && sender) await sender.replaceTrack(camTrack)
      setIsScreenSharing(false)
    }
  }

  const endLesson = async () => {
    await classroomService.end(id)
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    pcRef.current?.close()
    navigate('/lessons')
  }

  const handleWhiteboardStroke = async (stroke: any) => {
    setStrokes((prev) => [...prev, stroke])
    await classroomService.addStroke(id, stroke)
  }

  const handleClearWhiteboard = async () => {
    setStrokes([])
    await classroomService.clearWhiteboard(id)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-lg mb-4">{error}</p>
          <button onClick={() => navigate('/lessons')} className="text-[#7C3AED]">Back to lessons</button>
        </div>
      </div>
    )
  }

  if (!classroom) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-12 bg-slate-800 text-white text-sm">
        <div className="flex items-center gap-3">
          <span className="font-semibold">Mentivara</span>
          <span className="text-slate-400">|</span>
          <span>{classroom.lesson.subject || 'Lesson'}</span>
          <span className="text-slate-400">
            with {classroom.role === 'tutor' ? classroom.lesson.student_name : classroom.lesson.tutor_name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs">Live</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 grid grid-cols-2 gap-2 p-2">
            {/* Remote video */}
            <div className="bg-slate-800 rounded-lg overflow-hidden relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {classroom.role === 'tutor' ? classroom.lesson.student_name : classroom.lesson.tutor_name}
              </div>
            </div>
            {/* Local video */}
            <div className="bg-slate-800 rounded-lg overflow-hidden relative">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                You {isScreenSharing && '(Screen)'}
              </div>
            </div>
          </div>

          {/* Controls bar */}
          <div className="flex items-center justify-center gap-3 py-3 bg-slate-800">
            <button
              onClick={toggleMic}
              className={`p-3 rounded-full ${isMicOn ? 'bg-slate-700 text-white' : 'bg-red-500 text-white'}`}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleCam}
              className={`p-3 rounded-full ${isCamOn ? 'bg-slate-700 text-white' : 'bg-red-500 text-white'}`}
            >
              {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-full ${isScreenSharing ? 'bg-blue-500 text-white' : 'bg-slate-700 text-white'}`}
            >
              <Monitor className="w-5 h-5" />
            </button>
            <button onClick={endLesson} className="p-3 rounded-full bg-red-600 text-white">
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar: Chat / Whiteboard */}
        <div className="w-80 flex flex-col bg-white border-l border-slate-200">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 ${activeTab === 'chat' ? 'text-[#7C3AED] border-b-2 border-[#7C3AED]' : 'text-slate-500'}`}
            >
              <MessageSquare className="w-4 h-4" /> Chat
            </button>
            <button
              onClick={() => setActiveTab('whiteboard')}
              className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 ${activeTab === 'whiteboard' ? 'text-[#7C3AED] border-b-2 border-[#7C3AED]' : 'text-slate-500'}`}
            >
              <PenTool className="w-4 h-4" /> Whiteboard
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.user_id === classroom.user_id ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-xs text-slate-400 mb-0.5">
                      {msg.user?.name || (msg.user_id === classroom.lesson.tutor_id ? classroom.lesson.tutor_name : classroom.lesson.student_name)}
                    </span>
                    <div
                      className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${
                        msg.user_id === classroom.user_id
                          ? 'bg-[#7C3AED] text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      {msg.body}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              {/* Input */}
              <div className="p-3 border-t border-slate-200">
                <div className="flex gap-2">
                  <input
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
                  />
                  <button
                    onClick={sendMessage}
                    className="p-2 bg-[#7C3AED] text-white rounded-lg"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <Whiteboard
                strokes={strokes}
                onStroke={handleWhiteboardStroke}
                onClear={handleClearWhiteboard}
                canClear={classroom.role === 'tutor'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
