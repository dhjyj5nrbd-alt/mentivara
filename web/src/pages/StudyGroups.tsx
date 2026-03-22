import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import type { StudyGroup, StudyGroupMessage, StudyGroupMember } from '../services/demo-data'
import {
  Plus, Send, Paperclip, Smile, ArrowLeft, Settings, Pin,
  ChevronDown, Lock, Globe, Users, X,
} from 'lucide-react'

// ── Emoji picker options ──────────────────────────────────────
const GROUP_EMOJIS = ['📚', '📐', '🧬', '⚗️', '⚡', '🏥', '💡', '🎯']
const SUBJECT_OPTIONS = ['Biology', 'Maths', 'Chemistry', 'Physics', 'General', 'Medicine']

// ── Avatar helper ─────────────────────────────────────────────
function Avatar({ name, size = 'md', online }: { name: string; size?: 'sm' | 'md' | 'lg'; online?: boolean }) {
  const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' }
  const colors = [
    'bg-violet-200 text-violet-700',
    'bg-sky-200 text-sky-700',
    'bg-emerald-200 text-emerald-700',
    'bg-amber-200 text-amber-700',
    'bg-rose-200 text-rose-700',
    'bg-teal-200 text-teal-700',
  ]
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length
  return (
    <div className="relative shrink-0">
      <div className={`${sizes[size]} ${colors[idx]} rounded-full flex items-center justify-center font-semibold`}>
        {name.charAt(0)}
      </div>
      {online !== undefined && (
        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#1a1d2e] ${online ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
      )}
    </div>
  )
}

// ── Avatar stack ──────────────────────────────────────────────
function AvatarStack({ members, max = 3 }: { members: { name: string }[]; max?: number }) {
  const shown = members.slice(0, max)
  const extra = members.length - max
  return (
    <div className="flex -space-x-2">
      {shown.map((m, i) => (
        <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1a1d2e] overflow-hidden">
          <Avatar name={m.name} size="sm" />
        </div>
      ))}
      {extra > 0 && (
        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1a1d2e] bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-medium text-slate-600 dark:text-slate-300">
          +{extra}
        </div>
      )}
    </div>
  )
}

// ── Create Group Modal ────────────────────────────────────────
function CreateGroupModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (g: StudyGroup) => void }) {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('General')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [emoji, setEmoji] = useState('📚')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await api.post('/study-groups', { name, subject, description, isPrivate, emoji })
      onCreated(res.data.data)
      setName('')
      setSubject('General')
      setDescription('')
      setIsPrivate(false)
      setEmoji('📚')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1a1d2e] rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#232536]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Study Group</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Group Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Biology Study Squad"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50"
            >
              {SUBJECT_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Group Emoji</label>
            <div className="flex gap-2 flex-wrap">
              {GROUP_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 transition-all ${
                    emoji === e
                      ? 'border-[#7C3AED] bg-[#EDE9FE] dark:bg-[#7C3AED]/20'
                      : 'border-slate-200 dark:border-[#232536] hover:border-slate-300'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Privacy</span>
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isPrivate
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              }`}
            >
              {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
              {isPrivate ? 'Private' : 'Public'}
            </button>
          </div>
        </div>
        <div className="px-5 pb-5">
          <button
            onClick={handleCreate}
            disabled={!name.trim() || loading}
            className="w-full py-2.5 rounded-lg bg-[#7C3AED] text-white font-semibold text-sm hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Group Card ────────────────────────────────────────────────
function GroupCard({ group, onClick }: { group: StudyGroup; onClick: () => void }) {
  const hasUnread = group.unread > 0
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-xl bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] hover:border-[#7C3AED]/30 dark:hover:border-[#7C3AED]/30 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-xl shrink-0">
          {group.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-[#7C3AED] transition-colors">
                {group.name}
              </h3>
              {group.isPrivate && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{group.lastMessage.time}</span>
          </div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium">
              {group.subject}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
              <Users className="w-3 h-3" />
              {group.memberCount}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              <span className="font-medium text-slate-600 dark:text-slate-300">{group.lastMessage.author}:</span>{' '}
              {group.lastMessage.text}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              {group.isMember && group.members.length > 0 && (
                <AvatarStack members={group.members} max={3} />
              )}
              {hasUnread && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {group.unread}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

// ── Group Chat View ───────────────────────────────────────────
function GroupChat({
  group,
  onBack,
}: {
  group: StudyGroup
  onBack: () => void
}) {
  const [messages, setMessages] = useState<StudyGroupMessage[]>(group.messages)
  const [input, setInput] = useState('')
  const [showMembers, setShowMembers] = useState(false)
  const [pinnedExpanded, setPinnedExpanded] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(group.messages)
  }, [group])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const text = input
    setInput('')
    setSending(true)
    try {
      const res = await api.post(`/study-groups/${group.id}/messages`, { text })
      setMessages((prev) => [...prev, res.data.data])
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-screen">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-[#232536] bg-white dark:bg-[#161822] shrink-0">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-600 dark:hover:text-white md:hidden">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={onBack} className="text-slate-400 hover:text-slate-600 dark:hover:text-white hidden md:block">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-lg bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-lg">
            {group.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{group.name}</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {group.memberCount} members · {group.members.filter((m) => m.online).length} online
            </p>
          </div>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className={`p-2 rounded-lg transition-colors ${
              showMembers
                ? 'bg-[#EDE9FE] text-[#7C3AED] dark:bg-[#7C3AED]/20'
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Pinned message */}
        {group.pinnedMessage && pinnedExpanded && (
          <div className="flex items-start gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 shrink-0">
            <Pin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-300 flex-1">{group.pinnedMessage}</p>
            <button onClick={() => setPinnedExpanded(false)} className="text-amber-400 hover:text-amber-600 shrink-0">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {group.pinnedMessage && !pinnedExpanded && (
          <button
            onClick={() => setPinnedExpanded(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30 hover:bg-amber-50 dark:hover:bg-amber-900/20 shrink-0"
          >
            <Pin className="w-3 h-3" />
            Pinned message
          </button>
        )}

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50 dark:bg-[#0f1117]">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-3">{group.emoji}</div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Welcome to {group.name}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start the conversation by sending a message!</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              {!msg.isMe && <Avatar name={msg.author} size="sm" />}
              <div className={`max-w-[75%] ${msg.isMe ? 'order-first' : ''}`}>
                {!msg.isMe && (
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5 px-1">{msg.author}</p>
                )}
                <div
                  className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.isMe
                      ? 'bg-[#7C3AED] text-white rounded-br-md'
                      : 'bg-white dark:bg-[#1a1d2e] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#232536] rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
                <p className={`text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 px-1 ${msg.isMe ? 'text-right' : ''}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-[#232536] bg-white dark:bg-[#161822] shrink-0">
          <div className="flex items-end gap-2">
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#232536] bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 resize-none max-h-24"
              />
            </div>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 shrink-0">
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="p-2 rounded-xl bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Member sidebar */}
      {showMembers && (
        <div className="w-64 border-l border-slate-200 dark:border-[#232536] bg-white dark:bg-[#161822] shrink-0 overflow-y-auto hidden md:block">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-[#232536]">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Members ({group.members.length})</h3>
          </div>
          <div className="p-2">
            {/* Online first, then offline */}
            {[...group.members].sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0)).map((member, i) => (
              <div key={i} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <Avatar name={member.name} size="md" online={member.online} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 dark:text-white truncate">{member.name}</p>
                  <p className={`text-[10px] ${member.online ? 'text-green-500' : 'text-slate-400 dark:text-slate-500'}`}>
                    {member.online ? 'Online' : 'Offline'}
                  </p>
                </div>
                {member.role === 'admin' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-medium dark:bg-[#7C3AED]/20 dark:text-[#A78BFA]">
                    Admin
                  </span>
                )}
              </div>
            ))}
          </div>
          {/* Group info */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-[#232536]">
            <h4 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">About</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{group.description}</p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
              {group.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
              {group.isPrivate ? 'Private group' : 'Public group'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function StudyGroups() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([])
  const [discover, setDiscover] = useState<StudyGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    if (groupId) {
      api.get(`/study-groups/${groupId}`).then((res) => {
        setSelectedGroup(res.data.data)
      })
    } else {
      setSelectedGroup(null)
    }
  }, [groupId])

  const fetchGroups = async () => {
    try {
      const res = await api.get('/study-groups')
      setMyGroups(res.data.data.myGroups)
      setDiscover(res.data.data.discover)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async (group: StudyGroup) => {
    await api.post(`/study-groups/${group.id}/join`)
    await fetchGroups()
    navigate(`/study-groups/${group.id}`)
  }

  const handleGroupCreated = (group: StudyGroup) => {
    fetchGroups()
    navigate(`/study-groups/${group.id}`)
  }

  // Chat view
  if (selectedGroup) {
    return (
      <Layout>
        <GroupChat
          group={selectedGroup}
          onBack={() => navigate('/study-groups')}
        />
      </Layout>
    )
  }

  // List view
  return (
    <Layout>
      <div className="px-4 sm:px-6 py-4 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E1B4B] dark:text-white">Study Groups</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Collaborate and learn together</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" />
          </div>
        ) : (
          <>
            {/* My Groups */}
            {myGroups.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">My Groups</h2>
                <div className="space-y-2">
                  {myGroups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onClick={() => navigate(`/study-groups/${group.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Discover */}
            {discover.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Discover Groups</h2>
                <div className="space-y-2">
                  {discover.map((group) => (
                    <div key={group.id} className="relative">
                      <GroupCard
                        group={group}
                        onClick={() => {
                          if (group.isPrivate) return
                          handleJoinGroup(group)
                        }}
                      />
                      {!group.isPrivate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleJoinGroup(group)
                          }}
                          className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#7C3AED] text-white text-[11px] font-semibold hover:bg-[#6D28D9] transition-colors"
                        >
                          Join
                        </button>
                      )}
                      {group.isPrivate && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                          Invite Only
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CreateGroupModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleGroupCreated}
      />
    </Layout>
  )
}
