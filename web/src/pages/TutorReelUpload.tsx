import { useState } from 'react'
import {
  Plus, Edit3, Trash2, X, Upload, Play, Calendar,
  Clapperboard, Trophy,
} from 'lucide-react'
import Layout from '../components/Layout'

// ── Types ────────────────────────────────────────────────────
interface Reel {
  id: number
  title: string
  description: string
  subject: string
  topic: string
  videoUrl: string
  thumbnailUrl: string
  isCompetition: boolean
  challengeQuestion?: string
  correctAnswer?: string
  deadline?: string
  views: number
  likes: number
  createdAt: string
}

// ── Demo data ────────────────────────────────────────────────
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English']
const TOPICS: Record<string, string[]> = {
  Mathematics: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Calculus'],
  Physics: ['Mechanics', 'Waves', 'Electricity', 'Nuclear', 'Thermodynamics'],
  Chemistry: ['Organic', 'Inorganic', 'Physical', 'Analytical', 'Biochemistry'],
  Biology: ['Cells', 'Genetics', 'Ecology', 'Human biology', 'Evolution'],
  English: ['Poetry', 'Shakespeare', 'Essay writing', 'Grammar', 'Creative writing'],
}

const INITIAL_REELS: Reel[] = [
  {
    id: 1, title: 'Quadratic Formula in 60 Seconds',
    description: 'A quick visual breakdown of the quadratic formula with real examples.',
    subject: 'Mathematics', topic: 'Algebra',
    videoUrl: 'https://example.com/reel1.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
    isCompetition: false, views: 1240, likes: 89, createdAt: '15 Mar 2026',
  },
  {
    id: 2, title: 'Newton\'s Third Law Challenge',
    description: 'Can you identify all the action-reaction pairs? Competition reel with prizes!',
    subject: 'Physics', topic: 'Mechanics',
    videoUrl: 'https://example.com/reel2.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=300&fit=crop',
    isCompetition: true,
    challengeQuestion: 'A book rests on a table. What is the reaction force to the book\'s weight?',
    correctAnswer: 'The Earth being pulled upward by the book',
    deadline: '2026-04-01',
    views: 2100, likes: 156, createdAt: '10 Mar 2026',
  },
  {
    id: 3, title: 'Covalent Bonding Explained',
    description: 'Visual guide to covalent bonds using dot-and-cross diagrams.',
    subject: 'Chemistry', topic: 'Inorganic',
    videoUrl: 'https://example.com/reel3.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop',
    isCompetition: false, views: 870, likes: 62, createdAt: '5 Mar 2026',
  },
  {
    id: 4, title: 'Poetry Analysis Speed Run',
    description: 'How to annotate an unseen poem in under 2 minutes with the SMILE technique.',
    subject: 'English', topic: 'Poetry',
    videoUrl: 'https://example.com/reel4.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=400&h=300&fit=crop',
    isCompetition: true,
    challengeQuestion: 'What does the acronym SMILE stand for in poetry analysis?',
    correctAnswer: 'Structure, Meaning, Imagery, Language, Effect',
    deadline: '2026-03-30',
    views: 1580, likes: 134, createdAt: '1 Mar 2026',
  },
]

// ── Component ────────────────────────────────────────────────
export default function TutorReelUpload() {
  const [reels, setReels] = useState<Reel[]>(INITIAL_REELS)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [topic, setTopic] = useState(TOPICS[SUBJECTS[0]][0])
  const [videoUrl, setVideoUrl] = useState('')
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [isCompetition, setIsCompetition] = useState(false)
  const [challengeQuestion, setChallengeQuestion] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [deadline, setDeadline] = useState('')

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setSubject(SUBJECTS[0])
    setTopic(TOPICS[SUBJECTS[0]][0])
    setVideoUrl('')
    setThumbnailPreview(null)
    setIsCompetition(false)
    setChallengeQuestion('')
    setCorrectAnswer('')
    setDeadline('')
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setShowForm(true)
  }

  const openEdit = (reel: Reel) => {
    setTitle(reel.title)
    setDescription(reel.description)
    setSubject(reel.subject)
    setTopic(reel.topic)
    setVideoUrl(reel.videoUrl)
    setThumbnailPreview(reel.thumbnailUrl)
    setIsCompetition(reel.isCompetition)
    setChallengeQuestion(reel.challengeQuestion ?? '')
    setCorrectAnswer(reel.correctAnswer ?? '')
    setDeadline(reel.deadline ?? '')
    setEditingId(reel.id)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    setReels((prev) => prev.filter((r) => r.id !== id))
  }

  const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setThumbnailPreview(url)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const reel: Reel = {
      id: editingId ?? Date.now(),
      title,
      description,
      subject,
      topic,
      videoUrl,
      thumbnailUrl: thumbnailPreview || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
      isCompetition,
      challengeQuestion: isCompetition ? challengeQuestion : undefined,
      correctAnswer: isCompetition ? correctAnswer : undefined,
      deadline: isCompetition ? deadline : undefined,
      views: editingId ? (reels.find((r) => r.id === editingId)?.views ?? 0) : 0,
      likes: editingId ? (reels.find((r) => r.id === editingId)?.likes ?? 0) : 0,
      createdAt: editingId ? (reels.find((r) => r.id === editingId)?.createdAt ?? 'Today') : 'Today',
    }

    if (editingId) {
      setReels((prev) => prev.map((r) => (r.id === editingId ? reel : r)))
    } else {
      setReels((prev) => [reel, ...prev])
    }

    resetForm()
    setShowForm(false)
  }

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Reels</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {reels.length} reels &middot; {reels.reduce((a, r) => a + r.views, 0).toLocaleString()} total views
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Reel
          </button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#232536]">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingId ? 'Edit Reel' : 'Create New Reel'}
                </h2>
                <button onClick={() => { setShowForm(false); resetForm() }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Quadratic Formula in 60 Seconds"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    placeholder="Brief description of your reel..."
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] resize-none"
                  />
                </div>

                {/* Subject & Topic */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => {
                        setSubject(e.target.value)
                        setTopic(TOPICS[e.target.value][0])
                      }}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Topic</label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                    >
                      {(TOPICS[subject] ?? []).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Video URL</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    required
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                  />
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Thumbnail</label>
                  <div className="flex items-start gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-dashed border-slate-300 dark:border-[#232536] text-slate-500 dark:text-slate-400 hover:border-[#7C3AED] cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      Choose file
                      <input type="file" accept="image/*" onChange={handleThumbnail} className="hidden" />
                    </label>
                    {thumbnailPreview && (
                      <img src={thumbnailPreview} alt="Thumbnail preview" className="w-20 h-14 rounded-lg object-cover border border-slate-200 dark:border-[#232536]" />
                    )}
                  </div>
                </div>

                {/* Competition toggle */}
                <div className="border-t border-slate-200 dark:border-[#232536] pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isCompetition}
                        onChange={(e) => setIsCompetition(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-checked:bg-[#7C3AED] rounded-full transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Competition Reel</span>
                    </div>
                  </label>
                </div>

                {/* Competition fields */}
                {isCompetition && (
                  <div className="space-y-3 pl-4 border-l-2 border-[#7C3AED]">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Challenge Question</label>
                      <input
                        type="text"
                        value={challengeQuestion}
                        onChange={(e) => setChallengeQuestion(e.target.value)}
                        required
                        placeholder="What is the question for students?"
                        className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correct Answer</label>
                      <input
                        type="text"
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        required
                        placeholder="The correct answer"
                        className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                      />
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); resetForm() }}
                    className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-[#232536] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1d2e] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm rounded-lg bg-[#7C3AED] text-white font-medium hover:bg-[#6D28D9] transition-colors"
                  >
                    {editingId ? 'Save Changes' : 'Create Reel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reels grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reels.map((reel) => (
            <div
              key={reel.id}
              className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] overflow-hidden group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                <img src={reel.thumbnailUrl} alt={reel.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-10 h-10 text-white" />
                </div>
                {reel.isCompetition && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-medium">
                    <Trophy className="w-3 h-3" />
                    Competition
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{reel.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{reel.description}</p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                  <span>{reel.subject}</span>
                  <span>&middot;</span>
                  <span>{reel.views.toLocaleString()} views</span>
                  <span>&middot;</span>
                  <span>{reel.likes} likes</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{reel.createdAt}</p>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEdit(reel)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-[#1a1d2e] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#252839] transition-colors"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(reel.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {reels.length === 0 && (
          <div className="text-center py-16">
            <Clapperboard className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">No reels yet. Create your first one!</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
