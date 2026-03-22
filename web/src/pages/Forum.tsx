import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import {
  ArrowLeft, MessageSquare, Heart, Pin, CheckCircle, Plus,
  Search, Clock, TrendingUp, HelpCircle, X, Send, Flag, ChevronRight,
} from 'lucide-react'
import type { ForumCategory, ForumThread, ForumReply } from '../services/demo-data'

const TAG_COLORS: Record<string, string> = {
  Help: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Discussion: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Resource: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Solved: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Exam Tips': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Study Tips': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'A-Level': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  GCSE: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  Pinned: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
}

const AVAILABLE_TAGS = ['Help', 'Discussion', 'Resource', 'Solved', 'Exam Tips']

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500']
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length
  const sz = size === 'md' ? 'w-9 h-9 text-sm' : 'w-7 h-7 text-xs'
  return (
    <div className={`${sz} rounded-full ${colors[idx]} flex items-center justify-center text-white font-semibold shrink-0`}>
      {getInitials(name)}
    </div>
  )
}

// ── Category List View ────────────────────────────────────────

function CategoryList() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/forum/categories').then((r) => {
      setCategories(r.data.data ?? r.data)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(
    () => categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())),
    [categories, search],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#1E1B4B] dark:text-white">Student Forum</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ask questions, share tips, and learn together</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#1a1d2e] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/forum/category/${cat.id}`)}
            className="text-left rounded-xl border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#1a1d2e] p-4 hover:shadow-md hover:border-[#7C3AED]/30 dark:hover:border-[#7C3AED]/40 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${cat.color}`}>
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-[#7C3AED] transition-colors">{cat.name}</h3>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[#7C3AED] transition-colors shrink-0" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cat.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">{cat.threadCount} threads</span>
                  {cat.latestPost && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate ml-2 max-w-[60%] text-right">
                      {cat.latestPost.author} &middot; {cat.latestPost.time}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Thread List View ──────────────────────────────────────────

function ThreadList({ categoryId }: { categoryId: number }) {
  const navigate = useNavigate()
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [category, setCategory] = useState<ForumCategory | null>(null)
  const [sort, setSort] = useState<'latest' | 'popular' | 'unanswered'>('latest')
  const [loading, setLoading] = useState(true)
  const [showNewThread, setShowNewThread] = useState(false)

  useEffect(() => {
    api.get('/forum/categories').then((r) => {
      const cats: ForumCategory[] = r.data.data ?? r.data
      setCategory(cats.find((c) => c.id === categoryId) ?? null)
    })
  }, [categoryId])

  useEffect(() => {
    setLoading(true)
    api.get(`/forum/categories/${categoryId}/threads?sort=${sort}`).then((r) => {
      setThreads(r.data.data ?? r.data)
      setLoading(false)
    })
  }, [categoryId, sort])

  const handleNewThread = async (title: string, content: string, tags: string[]) => {
    const r = await api.post('/forum/threads', { categoryId, title, content, tags })
    const newThread = r.data.data ?? r.data
    setThreads((prev) => [newThread, ...prev])
    setShowNewThread(false)
  }

  return (
    <div>
      <button
        onClick={() => navigate('/forum')}
        className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-[#7C3AED] transition-colors mb-3"
      >
        <ArrowLeft className="w-4 h-4" />
        All Categories
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {category && (
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${category.color}`}>
              {category.icon}
            </span>
          )}
          <h1 className="text-lg font-bold text-[#1E1B4B] dark:text-white">{category?.name ?? 'Category'}</h1>
        </div>
        <button
          onClick={() => setShowNewThread(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9] transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Thread
        </button>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-1 mb-3 border-b border-slate-200 dark:border-[#232536]">
        {([
          { key: 'latest' as const, icon: Clock, label: 'Latest' },
          { key: 'popular' as const, icon: TrendingUp, label: 'Most Popular' },
          { key: 'unanswered' as const, icon: HelpCircle, label: 'Unanswered' },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSort(tab.key)}
            className={`flex items-center gap-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              sort === tab.key
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#7C3AED]" />
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No threads yet. Be the first to post!</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => navigate(`/forum/thread/${thread.id}`)}
              className="w-full text-left rounded-lg border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#1a1d2e] p-3 hover:shadow-sm hover:border-[#7C3AED]/20 dark:hover:border-[#7C3AED]/30 transition-all group"
            >
              <div className="flex items-start gap-3">
                <Avatar name={thread.author.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {thread.pinned && <Pin className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white group-hover:text-[#7C3AED] transition-colors line-clamp-1">{thread.title}</h3>
                    {thread.solved && (
                      <span className="flex items-center gap-0.5 text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full shrink-0">
                        <CheckCircle className="w-3 h-3" />
                        Solved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    <span>{thread.author.name}</span>
                    <span>&middot;</span>
                    <span>{thread.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {thread.tags.map((tag) => (
                        <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{thread.likes}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{thread.replyCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showNewThread && (
        <NewThreadModal
          categoryId={categoryId}
          categoryName={category?.name}
          onClose={() => setShowNewThread(false)}
          onSubmit={handleNewThread}
        />
      )}
    </div>
  )
}

// ── New Thread Modal ──────────────────────────────────────────

function NewThreadModal({
  categoryId: _categoryId,
  categoryName,
  onClose,
  onSubmit,
}: {
  categoryId: number
  categoryName?: string
  onClose: () => void
  onSubmit: (title: string, content: string, tags: string[]) => void
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const maxContent = 2000

  const toggleTag = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    await onSubmit(title, content, tags)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1a1d2e] rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#232536]">
          <h2 className="font-semibold text-slate-900 dark:text-white">New Thread</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          {categoryName && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Posting in <span className="font-medium text-[#7C3AED]">{categoryName}</span>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question or topic?"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#161822] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, maxContent))}
              placeholder="Describe your question or topic in detail..."
              rows={5}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#161822] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 resize-none"
            />
            <div className="text-right text-[11px] text-slate-400 mt-0.5">{content.length}/{maxContent}</div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                    tags.includes(tag)
                      ? 'bg-[#7C3AED] text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-slate-200 dark:border-[#232536]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || submitting}
            className="px-4 py-1.5 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : 'Post Thread'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Thread Detail View ────────────────────────────────────────

function ThreadDetail({ threadId }: { threadId: number }) {
  const navigate = useNavigate()
  const [thread, setThread] = useState<ForumThread | null>(null)
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)
  const maxReply = 1000

  useEffect(() => {
    api.get(`/forum/threads/${threadId}`).then((r) => {
      const data = r.data.data ?? r.data
      setThread(data.thread)
      setReplies(data.replies ?? [])
      setLoading(false)
    })
  }, [threadId])

  const handleLike = async () => {
    if (liked) return
    setLiked(true)
    await api.post(`/forum/threads/${threadId}/like`)
    setThread((prev) => prev ? { ...prev, likes: prev.likes + 1 } : prev)
  }

  const handleReply = async () => {
    if (!replyContent.trim() || submitting) return
    setSubmitting(true)
    const r = await api.post(`/forum/threads/${threadId}/reply`, {
      content: replyContent,
      parentReplyId: replyingTo,
    })
    const newReply = r.data.data ?? r.data
    setReplies((prev) => [...prev, newReply])
    setReplyContent('')
    setReplyingTo(null)
    setSubmitting(false)
    setThread((prev) => prev ? { ...prev, replyCount: prev.replyCount + 1 } : prev)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" />
      </div>
    )
  }

  if (!thread) {
    return <div className="text-center py-16 text-slate-400">Thread not found</div>
  }

  // Separate top-level replies and nested replies
  const topReplies = replies.filter((r) => !r.parentReplyId)
  const nestedMap = replies.reduce<Record<number, ForumReply[]>>((acc, r) => {
    if (r.parentReplyId) {
      if (!acc[r.parentReplyId]) acc[r.parentReplyId] = []
      acc[r.parentReplyId].push(r)
    }
    return acc
  }, {})

  return (
    <div>
      <button
        onClick={() => navigate(`/forum/category/${thread.categoryId}`)}
        className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-[#7C3AED] transition-colors mb-3"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to threads
      </button>

      {/* Thread header */}
      <div className="rounded-xl border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#1a1d2e] p-4 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {thread.pinned && <Pin className="w-4 h-4 text-orange-500" />}
          {thread.tags.map((tag) => (
            <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
              {tag}
            </span>
          ))}
          {thread.solved && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">
              <CheckCircle className="w-3 h-3" />
              Solved
            </span>
          )}
        </div>
        <h1 className="text-base font-bold text-slate-900 dark:text-white mb-2">{thread.title}</h1>
        <div className="flex items-center gap-2 mb-3">
          <Avatar name={thread.author.name} />
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{thread.author.name}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{thread.createdAt}</p>
          </div>
        </div>
        <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-3">
          {thread.content}
        </div>
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-[#232536]">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs transition-colors ${
              liked ? 'text-red-500' : 'text-slate-400 dark:text-slate-500 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            {thread.likes}
          </button>
          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <MessageSquare className="w-4 h-4" />
            {thread.replyCount} replies
          </span>
          <button className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 hover:text-amber-500 transition-colors ml-auto">
            <Flag className="w-3.5 h-3.5" />
            Report
          </button>
        </div>
      </div>

      {/* Replies */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        <div className="space-y-2">
          {topReplies.map((reply) => (
            <div key={reply.id}>
              <ReplyCard
                reply={reply}
                onReply={() => setReplyingTo(reply.id)}
              />
              {/* Nested replies */}
              {nestedMap[reply.id]?.map((nested) => (
                <div key={nested.id} className="ml-6 mt-1.5">
                  <ReplyCard reply={nested} onReply={() => setReplyingTo(reply.id)} nested />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Reply input */}
      <div className="rounded-xl border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#1a1d2e] p-3">
        {replyingTo && (
          <div className="flex items-center gap-1 mb-2 text-xs text-[#7C3AED]">
            <span>Replying to {replies.find((r) => r.id === replyingTo)?.author.name ?? 'a reply'}</span>
            <button onClick={() => setReplyingTo(null)} className="ml-1 hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value.slice(0, maxReply))}
          placeholder="Write your reply..."
          rows={3}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-[#232536] bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-slate-400">{replyContent.length}/{maxReply}</span>
          <button
            onClick={handleReply}
            disabled={!replyContent.trim() || submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Posting...' : 'Post Reply'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reply Card ────────────────────────────────────────────────

function ReplyCard({ reply, onReply, nested }: { reply: ForumReply; onReply: () => void; nested?: boolean }) {
  const [replyLiked, setReplyLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(reply.likes)

  const handleLike = () => {
    if (replyLiked) return
    setReplyLiked(true)
    setLocalLikes((l) => l + 1)
  }

  return (
    <div className={`rounded-lg border bg-white dark:bg-[#1a1d2e] p-3 ${
      reply.isBestAnswer
        ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
        : 'border-slate-200 dark:border-[#232536]'
    }`}>
      {reply.isBestAnswer && (
        <div className="flex items-center gap-1 mb-2 text-xs font-semibold text-green-600 dark:text-green-400">
          <CheckCircle className="w-4 h-4" />
          Best Answer
        </div>
      )}
      <div className="flex items-start gap-2.5">
        <Avatar name={reply.author.name} size={nested ? 'sm' : 'sm'} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-900 dark:text-white">{reply.author.name}</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{reply.createdAt}</span>
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed whitespace-pre-line">
            {reply.content}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs transition-colors ${
                replyLiked ? 'text-red-500' : 'text-slate-400 dark:text-slate-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${replyLiked ? 'fill-current' : ''}`} />
              {localLikes}
            </button>
            {!nested && (
              <button
                onClick={onReply}
                className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 hover:text-[#7C3AED] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Reply
              </button>
            )}
            <button className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 hover:text-amber-500 transition-colors ml-auto">
              <Flag className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Forum Page ───────────────────────────────────────────

export default function Forum() {
  const { categoryId, threadId } = useParams()

  let view: React.ReactNode
  if (threadId) {
    view = <ThreadDetail threadId={Number(threadId)} />
  } else if (categoryId) {
    view = <ThreadList categoryId={Number(categoryId)} />
  } else {
    view = <CategoryList />
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 py-4 max-w-3xl mx-auto">
        {view}
      </div>
    </Layout>
  )
}
