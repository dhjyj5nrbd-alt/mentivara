import { useState, useRef, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'
import { DEMO_CONVERSATIONS, type DemoConversation, type DemoMessage } from '../services/demo-data'
import {
  Search, Send, Paperclip, Image as ImageIcon, ArrowLeft,
  Check, CheckCheck, FileText, Download, X,
} from 'lucide-react'

function formatLastMessagePreview(conv: DemoConversation): string {
  const last = conv.messages[conv.messages.length - 1]
  if (!last) return ''
  if (last.fileName) return `📎 ${last.fileName}`
  if (last.imageUrl) return '📷 Photo'
  return last.text ?? ''
}

function getLastTimestamp(conv: DemoConversation): string {
  const last = conv.messages[conv.messages.length - 1]
  if (!last) return ''
  const ts = last.timestamp
  // Extract just the time or "Yesterday"
  if (ts.startsWith('Today')) return ts.replace('Today, ', '')
  if (ts.startsWith('Yesterday')) return 'Yesterday'
  return ts
}

function StatusTicks({ status }: { status: DemoMessage['status'] }) {
  if (status === 'sent') return <Check className="w-3.5 h-3.5 text-slate-400" />
  if (status === 'delivered') return <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
  return <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
}

function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-2xl rounded-bl-md px-4 py-2.5">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{name} is typing</p>
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

function MessageBubble({
  msg,
  isStudent,
  onImageClick,
}: {
  msg: DemoMessage
  isStudent: boolean
  onImageClick: (url: string) => void
}) {
  // File attachment
  if (msg.fileName) {
    return (
      <div className={`flex ${isStudent ? 'justify-end' : 'justify-start'} mb-1`}>
        <div
          className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-3 ${
            isStudent
              ? 'bg-[#7C3AED] text-white rounded-br-md'
              : 'bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white rounded-bl-md'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              isStudent ? 'bg-white/20' : 'bg-[#EDE9FE] dark:bg-[#7C3AED]/20'
            }`}>
              <FileText className={`w-5 h-5 ${isStudent ? 'text-white' : 'text-[#7C3AED]'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isStudent ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                {msg.fileName}
              </p>
              <p className={`text-xs ${isStudent ? 'text-white/70' : 'text-slate-400'}`}>
                {msg.fileSize}
              </p>
            </div>
            <button className={`shrink-0 p-1.5 rounded-full transition-colors ${
              isStudent ? 'hover:bg-white/20' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            }`} aria-label="Download file">
              <Download className={`w-4 h-4 ${isStudent ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
            </button>
          </div>
          <div className={`flex items-center gap-1 mt-1.5 ${isStudent ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] ${isStudent ? 'text-white/60' : 'text-slate-400'}`}>
              {msg.timestamp.split(', ')[1] || msg.timestamp}
            </span>
            {isStudent && <StatusTicks status={msg.status} />}
          </div>
        </div>
      </div>
    )
  }

  // Image message
  if (msg.imageUrl) {
    return (
      <div className={`flex ${isStudent ? 'justify-end' : 'justify-start'} mb-1`}>
        <div
          className={`max-w-[75%] sm:max-w-[60%] rounded-2xl overflow-hidden ${
            isStudent
              ? 'bg-[#7C3AED] rounded-br-md'
              : 'bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-bl-md'
          }`}
        >
          <button
            onClick={() => onImageClick(msg.imageUrl!)}
            className="block w-full cursor-pointer"
            aria-label="View full image"
          >
            <img
              src={msg.imageUrl}
              alt="Shared image"
              className="w-full h-auto max-h-64 object-cover"
              loading="lazy"
            />
          </button>
          <div className={`flex items-center gap-1 px-3 py-1.5 ${isStudent ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] ${isStudent ? 'text-white/60' : 'text-slate-400'}`}>
              {msg.timestamp.split(', ')[1] || msg.timestamp}
            </span>
            {isStudent && <StatusTicks status={msg.status} />}
          </div>
        </div>
      </div>
    )
  }

  // Text message
  return (
    <div className={`flex ${isStudent ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2.5 ${
          isStudent
            ? 'bg-[#7C3AED] text-white rounded-br-md'
            : 'bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white rounded-bl-md'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
        <div className={`flex items-center gap-1 mt-1 ${isStudent ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[10px] ${isStudent ? 'text-white/60' : 'text-slate-400'}`}>
            {msg.timestamp.split(', ')[1] || msg.timestamp}
          </span>
          {isStudent && <StatusTicks status={msg.status} />}
        </div>
      </div>
    </div>
  )
}

export default function Messages() {
  const [conversations, setConversations] = useState<DemoConversation[]>(() =>
    [...DEMO_CONVERSATIONS].sort((a, b) => b.messages.length - a.messages.length)
  )
  const [activeId, setActiveId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [inputText, setInputText] = useState('')
  const [showTyping, setShowTyping] = useState(false)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [mobileShowChat, setMobileShowChat] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const activeConv = conversations.find((c) => c.id === activeId) ?? null

  const filteredConversations = conversations.filter((c) =>
    c.tutorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [activeId, activeConv?.messages.length, scrollToBottom])

  useEffect(() => {
    if (activeConv && mobileShowChat) {
      textareaRef.current?.focus()
    }
  }, [activeConv, mobileShowChat])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [inputText])

  const selectConversation = (id: number) => {
    setActiveId(id)
    setMobileShowChat(true)
    setInputText('')
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    )
  }

  const handleSend = () => {
    if (!inputText.trim() || !activeConv) return

    const newMsg: DemoMessage = {
      id: Date.now(),
      senderId: 1,
      text: inputText.trim(),
      timestamp: `Today, ${new Date().toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()}`,
      status: 'sent',
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? { ...c, messages: [...c.messages, newMsg] }
          : c
      )
    )
    setInputText('')

    // Simulate delivery
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === newMsg.id ? { ...m, status: 'delivered' as const } : m
                ),
              }
            : c
        )
      )
    }, 1000)

    // Simulate typing then seen
    setTimeout(() => {
      setShowTyping(true)
    }, 2000)

    setTimeout(() => {
      setShowTyping(false)
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === newMsg.id ? { ...m, status: 'seen' as const } : m
                ),
              }
            : c
        )
      )
    }, 4000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const goBackToList = () => {
    setMobileShowChat(false)
    setActiveId(null)
  }

  // Group messages by their date prefix (Today, Yesterday, etc.)
  const groupedMessages: { label: string; msgs: DemoMessage[] }[] = []
  if (activeConv) {
    let currentLabel = ''
    for (const msg of activeConv.messages) {
      const datePart = msg.timestamp.split(',')[0] || 'Today'
      if (datePart !== currentLabel) {
        currentLabel = datePart
        groupedMessages.push({ label: currentLabel, msgs: [] })
      }
      groupedMessages[groupedMessages.length - 1].msgs.push(msg)
    }
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-3.5rem)] md:h-screen flex overflow-hidden">
        {/* LEFT PANEL — Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-[#232536] flex flex-col bg-white dark:bg-[#161822] shrink-0 ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-[#232536]">
            <h1 className="text-lg font-bold text-[#1E1B4B] dark:text-white mb-3">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0f1117] border border-slate-200 dark:border-[#232536] rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 && (
              <div className="text-center py-12 px-4">
                <p className="text-slate-400 dark:text-slate-500 text-sm">No conversations found</p>
              </div>
            )}
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-[#1a1d2e] ${
                  activeId === conv.id
                    ? 'bg-slate-50 dark:bg-[#1a1d2e] border-l-[3px] border-l-[#7C3AED]'
                    : 'border-l-[3px] border-l-transparent'
                }`}
              >
                <img
                  src={conv.tutorAvatar}
                  alt={conv.tutorName}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {conv.tutorName}
                    </h3>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 ml-2">
                      {getLastTimestamp(conv)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate pr-2">
                      {formatLastMessagePreview(conv)}
                    </p>
                    {conv.unread > 0 && (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[10px] font-bold flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL — Chat View */}
        <div
          className={`flex-1 flex flex-col bg-slate-50 dark:bg-[#0f1117] min-w-0 ${
            !mobileShowChat && !activeConv ? 'hidden md:flex' : ''
          } ${mobileShowChat ? 'flex' : 'hidden md:flex'}`}
        >
          {!activeConv ? (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-4">
                <div className="w-16 h-16 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-7 h-7 text-[#7C3AED]" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  Select a conversation
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Choose a tutor from the list to start chatting
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#161822] border-b border-slate-200 dark:border-[#232536]">
                <button
                  onClick={goBackToList}
                  className="md:hidden text-slate-500 dark:text-slate-400 hover:text-[#7C3AED] transition-colors mr-1"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img
                  src={activeConv.tutorAvatar}
                  alt={activeConv.tutorName}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {activeConv.tutorName}
                  </h2>
                  <p className="text-xs text-emerald-500">{activeConv.lastSeen}</p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 text-[#7C3AED] shrink-0">
                  {activeConv.subject}
                </span>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {groupedMessages.map((group) => (
                  <div key={group.label}>
                    {/* Date separator */}
                    <div className="flex items-center justify-center my-4">
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-white dark:bg-[#1a1d2e] px-3 py-1 rounded-full border border-slate-200 dark:border-[#232536]">
                        {group.label}
                      </span>
                    </div>
                    {group.msgs.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        isStudent={msg.senderId === 1}
                        onImageClick={setExpandedImage}
                      />
                    ))}
                  </div>
                ))}
                {showTyping && activeConv && (
                  <TypingIndicator name={activeConv.tutorName} />
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="px-4 py-3 bg-white dark:bg-[#161822] border-t border-slate-200 dark:border-[#232536]">
                <div className="flex items-end gap-2">
                  <button
                    className="shrink-0 p-2 text-slate-400 hover:text-[#7C3AED] transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-[#1a1d2e]"
                    aria-label="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    className="shrink-0 p-2 text-slate-400 hover:text-[#7C3AED] transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-[#1a1d2e]"
                    aria-label="Attach image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 resize-none bg-slate-50 dark:bg-[#0f1117] border border-slate-200 dark:border-[#232536] rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] max-h-[120px]"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="shrink-0 w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center hover:bg-[#6D28D9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image lightbox */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close image"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={expandedImage}
            alt="Full size"
            className="max-w-full max-h-[85vh] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </Layout>
  )
}
