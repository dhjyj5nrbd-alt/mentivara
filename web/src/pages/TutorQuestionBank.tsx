import { useState, useMemo } from 'react'
import {
  Plus, Edit3, Trash2, X, Upload, Search, ChevronDown, ChevronUp,
  HelpCircle, Star, Filter, FileText,
} from 'lucide-react'
import Layout from '../components/Layout'
import { QUESTION_BANK, type BankQuestion } from '../services/demo-data'

// ── Constants ─────────────────────────────────────────────────
const SUBJECTS = ['All', 'Biology', 'Mathematics', 'Physics', 'Chemistry', 'English']
const TOPICS: Record<string, string[]> = {
  Biology: ['Magnification calculations', 'Resolution and microscope types', 'Cell structure', 'Organelle functions', 'Cell measurements'],
  Mathematics: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Calculus'],
  Physics: ['Mechanics', 'Waves', 'Electricity', 'Nuclear', 'Thermodynamics'],
  Chemistry: ['Organic', 'Inorganic', 'Physical', 'Analytical', 'Biochemistry'],
  English: ['Poetry', 'Shakespeare', 'Essay writing', 'Grammar', 'Creative writing'],
}
const QUESTION_TYPES: ('mcq' | 'structured' | 'extended')[] = ['mcq', 'structured', 'extended']
const EXAM_BOARDS = ['CIE', 'Edexcel', 'AQA', 'OCR']

const TYPE_LABELS: Record<string, string> = {
  mcq: 'MCQ',
  structured: 'Structured',
  extended: 'Extended',
}

const TYPE_COLORS: Record<string, string> = {
  mcq: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  structured: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  extended: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

// ── Helper: derive subject from question data ─────────────────
function getSubject(q: BankQuestion): string {
  if (q.syllabus_id.includes('bio')) return 'Biology'
  if (q.syllabus_id.includes('math')) return 'Mathematics'
  if (q.syllabus_id.includes('phys')) return 'Physics'
  if (q.syllabus_id.includes('chem')) return 'Chemistry'
  if (q.syllabus_id.includes('eng')) return 'English'
  return 'Biology'
}

// ── Star Rating Component ─────────────────────────────────────
function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`w-3.5 h-3.5 ${star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
          />
        </button>
      ))}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function TutorQuestionBank() {
  // State
  const [questions, setQuestions] = useState<BankQuestion[]>(QUESTION_BANK)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSubject, setFilterSubject] = useState('Biology')
  const [filterTopic, setFilterTopic] = useState('All')
  const [filterType, setFilterType] = useState<string>('All')
  const [filterDifficulty, setFilterDifficulty] = useState(0)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showImportToast, setShowImportToast] = useState(false)
  const [visibleCount, setVisibleCount] = useState(10)

  // Form state
  const [formSubject, setFormSubject] = useState('Biology')
  const [formTopic, setFormTopic] = useState('')
  const [formType, setFormType] = useState<'mcq' | 'structured' | 'extended'>('mcq')
  const [formContent, setFormContent] = useState('')
  const [formOptions, setFormOptions] = useState(['', '', '', ''])
  const [formCorrectOption, setFormCorrectOption] = useState(0)
  const [formMarkScheme, setFormMarkScheme] = useState<string[]>([''])
  const [formMarks, setFormMarks] = useState(1)
  const [formDifficulty, setFormDifficulty] = useState(1)
  const [formCorrectAnswer, setFormCorrectAnswer] = useState('')
  const [formExplanation, setFormExplanation] = useState('')
  const [formExamBoard, setFormExamBoard] = useState('')
  const [formYear, setFormYear] = useState<number | ''>('')
  const [formPaper, setFormPaper] = useState('')

  // Filtered questions
  const filtered = useMemo(() => {
    return questions.filter((q) => {
      const subject = getSubject(q)
      if (filterSubject !== 'All' && subject !== filterSubject) return false
      if (filterTopic !== 'All' && q.subtopic !== filterTopic) return false
      if (filterType !== 'All' && q.type !== filterType) return false
      if (filterDifficulty > 0 && q.difficulty !== filterDifficulty) return false
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        if (!q.content.toLowerCase().includes(query)) return false
      }
      return true
    })
  }, [questions, filterSubject, filterTopic, filterType, filterDifficulty, searchQuery])

  const displayedQuestions = filtered.slice(0, visibleCount)

  // Stats
  const stats = useMemo(() => ({
    total: questions.length,
    mcq: questions.filter((q) => q.type === 'mcq').length,
    structured: questions.filter((q) => q.type === 'structured').length,
    extended: questions.filter((q) => q.type === 'extended').length,
  }), [questions])

  // Available topics for current filter subject
  const availableTopics = useMemo(() => {
    if (filterSubject === 'All') {
      return [...new Set(questions.map((q) => q.subtopic))]
    }
    return TOPICS[filterSubject] || []
  }, [filterSubject, questions])

  // Form topics for selected form subject
  const formTopics = TOPICS[formSubject] || []

  // Reset form
  const resetForm = () => {
    setFormSubject('Biology')
    setFormTopic('')
    setFormType('mcq')
    setFormContent('')
    setFormOptions(['', '', '', ''])
    setFormCorrectOption(0)
    setFormMarkScheme([''])
    setFormMarks(1)
    setFormDifficulty(1)
    setFormCorrectAnswer('')
    setFormExplanation('')
    setFormExamBoard('')
    setFormYear('')
    setFormPaper('')
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setShowForm(true)
  }

  const openEdit = (q: BankQuestion) => {
    setFormSubject(getSubject(q))
    setFormTopic(q.subtopic)
    setFormType(q.type)
    setFormContent(q.content)
    setFormOptions(q.options ? [...q.options] : ['', '', '', ''])
    setFormCorrectOption(q.options ? q.options.indexOf(q.correct_answer) : 0)
    setFormMarkScheme(q.mark_scheme.length > 0 ? [...q.mark_scheme] : [''])
    setFormMarks(q.marks)
    setFormDifficulty(q.difficulty)
    setFormCorrectAnswer(q.correct_answer)
    setFormExplanation(q.explanation)
    setFormExamBoard(q.exam_board)
    setFormYear(q.year)
    setFormPaper(q.paper)
    setEditingId(q.id)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const syllabusMap: Record<string, string> = {
      Biology: 'cie-alevel-bio-9700',
      Mathematics: 'cie-alevel-math-9709',
      Physics: 'cie-alevel-phys-9702',
      Chemistry: 'cie-alevel-chem-9701',
      English: 'cie-alevel-eng-9093',
    }

    const question: BankQuestion = {
      id: editingId ?? Date.now(),
      content: formContent,
      type: formType,
      marks: formMarks,
      difficulty: formDifficulty,
      topic_id: '1.1',
      subtopic: formTopic || formTopics[0] || 'General',
      syllabus_id: syllabusMap[formSubject] || 'cie-alevel-bio-9700',
      exam_board: formExamBoard || 'CIE',
      year: typeof formYear === 'number' ? formYear : 2024,
      paper: formPaper || 'Paper 1',
      options: formType === 'mcq' ? formOptions.filter(Boolean) : undefined,
      correct_answer: formType === 'mcq' ? formOptions[formCorrectOption] || formCorrectAnswer : formCorrectAnswer,
      mark_scheme: formMarkScheme.filter(Boolean),
      explanation: formExplanation,
    }

    if (editingId) {
      setQuestions((prev) => prev.map((q) => (q.id === editingId ? question : q)))
    } else {
      setQuestions((prev) => [question, ...prev])
    }

    resetForm()
    setShowForm(false)
  }

  const handleImportCSV = () => {
    setShowImportToast(true)
    setTimeout(() => setShowImportToast(false), 3000)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterSubject('All')
    setFilterTopic('All')
    setFilterType('All')
    setFilterDifficulty(0)
  }

  const hasActiveFilters = filterSubject !== 'All' || filterTopic !== 'All' || filterType !== 'All' || filterDifficulty > 0 || searchQuery.trim() !== ''

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Import toast */}
        {showImportToast && (
          <div className="fixed top-4 right-4 z-50 bg-[#7C3AED] text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in flex items-center gap-2">
            <FileText className="w-4 h-4" />
            CSV import feature coming soon
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#7C3AED]" />
              Question Bank
            </h1>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              <span>{stats.total} questions</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="text-blue-600 dark:text-blue-400">{stats.mcq} MCQ</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="text-amber-600 dark:text-amber-400">{stats.structured} Structured</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="text-purple-600 dark:text-purple-400">{stats.extended} Extended</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-[#232536] text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-[#1a1d2e] transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Question
            </button>
          </div>
        </div>

        {/* Filter / Search bar */}
        <div className="bg-white dark:bg-[#161822] border border-slate-200 dark:border-[#232536] rounded-xl p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search question text..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="w-full md:w-36">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Subject</label>
              <select
                value={filterSubject}
                onChange={(e) => { setFilterSubject(e.target.value); setFilterTopic('All') }}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
              >
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Topic */}
            <div className="w-full md:w-48">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Topic</label>
              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
              >
                <option value="All">All Topics</option>
                {availableTopics.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Type */}
            <div className="w-full md:w-36">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
              >
                <option value="All">All Types</option>
                {QUESTION_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>

            {/* Difficulty */}
            <div className="w-full md:w-32">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Difficulty</label>
              <div className="flex items-center gap-1 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFilterDifficulty(filterDifficulty === star ? 0 : star)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-4 h-4 ${star <= filterDifficulty ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {displayedQuestions.length} of {filtered.length} questions
            {hasActiveFilters && ' (filtered)'}
          </p>
          {hasActiveFilters && (
            <div className="flex items-center gap-1 text-xs text-[#7C3AED]">
              <Filter className="w-3 h-3" />
              Filters active
            </div>
          )}
        </div>

        {/* Questions list — desktop table / mobile cards */}
        <div className="space-y-2">
          {displayedQuestions.map((q) => {
            const isExpanded = expandedId === q.id
            return (
              <div
                key={q.id}
                className="bg-white dark:bg-[#161822] border border-slate-200 dark:border-[#232536] rounded-xl overflow-hidden"
              >
                {/* Row — clickable to expand */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="w-full text-left px-4 py-3 flex items-start md:items-center gap-3 hover:bg-slate-50 dark:hover:bg-[#1a1d2e] transition-colors"
                >
                  {/* Type badge */}
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${TYPE_COLORS[q.type]}`}>
                    {TYPE_LABELS[q.type]}
                  </span>

                  {/* Question text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white line-clamp-1">{q.content}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                      <span>{getSubject(q)}</span>
                      <span className="hidden sm:inline">&middot;</span>
                      <span className="hidden sm:inline">{q.subtopic}</span>
                      <span>&middot;</span>
                      <span>{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                      <span>&middot;</span>
                      <span>{q.exam_board}</span>
                      <span>&middot;</span>
                      <span>{q.year}</span>
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="hidden sm:block shrink-0">
                    <StarRating value={q.difficulty} readonly />
                  </div>

                  {/* Expand icon */}
                  <div className="shrink-0 text-slate-400 dark:text-slate-500">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-100 dark:border-[#232536]">
                    <div className="pt-3 space-y-3">
                      {/* Full question */}
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Question</p>
                        <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{q.content}</p>
                      </div>

                      {/* MCQ options */}
                      {q.type === 'mcq' && q.options && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Options</p>
                          <div className="space-y-1">
                            {q.options.map((opt, idx) => (
                              <div
                                key={idx}
                                className={`text-sm px-3 py-1.5 rounded-lg ${
                                  opt === q.correct_answer
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-slate-50 dark:bg-[#1a1d2e] text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-[#232536]'
                                }`}
                              >
                                <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mark scheme */}
                      {q.mark_scheme.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Mark Scheme</p>
                          <ul className="space-y-0.5">
                            {q.mark_scheme.map((point, idx) => (
                              <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                <span className="text-emerald-500 font-bold shrink-0 mt-0.5">&#10003;</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Correct answer (non-MCQ) */}
                      {q.type !== 'mcq' && q.correct_answer && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Model Answer</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{q.correct_answer}</p>
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Explanation</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{q.explanation}</p>
                        </div>
                      )}

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-400 dark:text-slate-500">
                        <span>Paper: {q.paper}</span>
                        <span>Exam Board: {q.exam_board}</span>
                        <span>Year: {q.year}</span>
                        <span>Marks: {q.marks}</span>
                        <span className="flex items-center gap-1">Difficulty: <StarRating value={q.difficulty} readonly /></span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(q) }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-[#1a1d2e] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#252839] transition-colors"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(q.id) }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Show more */}
        {visibleCount < filtered.length && (
          <div className="text-center mt-4">
            <button
              onClick={() => setVisibleCount((prev) => prev + 10)}
              className="px-6 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-[#232536] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1d2e] transition-colors"
            >
              Show More ({filtered.length - visibleCount} remaining)
            </button>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {questions.length === 0 ? 'No questions yet. Create your first one!' : 'No questions match your filters.'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-2 text-sm text-[#7C3AED] hover:underline">Clear filters</button>
            )}
          </div>
        )}

        {/* Create / Edit modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#232536]">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingId ? 'Edit Question' : 'Create New Question'}
                </h2>
                <button onClick={() => { setShowForm(false); resetForm() }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Subject & Topic */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                    <select
                      value={formSubject}
                      onChange={(e) => { setFormSubject(e.target.value); setFormTopic('') }}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                    >
                      {SUBJECTS.filter((s) => s !== 'All').map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Topic</label>
                    <select
                      value={formTopic}
                      onChange={(e) => setFormTopic(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                    >
                      <option value="">Select topic...</option>
                      {formTopics.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Question Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Question Type</label>
                  <div className="flex gap-3">
                    {QUESTION_TYPES.map((t) => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="questionType"
                          value={t}
                          checked={formType === t}
                          onChange={() => setFormType(t)}
                          className="accent-[#7C3AED]"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{TYPE_LABELS[t]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question text */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Question Text</label>
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    required
                    rows={3}
                    placeholder="Enter the question text..."
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] resize-none"
                  />
                </div>

                {/* MCQ Options */}
                {formType === 'mcq' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Options</label>
                    <div className="space-y-2">
                      {formOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 w-6">{String.fromCharCode(65 + idx)}.</span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...formOptions]
                              newOpts[idx] = e.target.value
                              setFormOptions(newOpts)
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            className="flex-1 px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                          />
                          <label className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 cursor-pointer whitespace-nowrap">
                            <input
                              type="radio"
                              name="correctOption"
                              checked={formCorrectOption === idx}
                              onChange={() => setFormCorrectOption(idx)}
                              className="accent-emerald-500"
                            />
                            Correct
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mark scheme (for structured/extended) */}
                {formType !== 'mcq' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mark Scheme Points</label>
                    <div className="space-y-2">
                      {formMarkScheme.map((point, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-emerald-500 w-4">{idx + 1}.</span>
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => {
                              const newScheme = [...formMarkScheme]
                              newScheme[idx] = e.target.value
                              setFormMarkScheme(newScheme)
                            }}
                            placeholder="Mark point..."
                            className="flex-1 px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                          />
                          {formMarkScheme.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setFormMarkScheme((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormMarkScheme((prev) => [...prev, ''])}
                      className="mt-2 text-xs text-[#7C3AED] hover:underline font-medium"
                    >
                      + Add mark point
                    </button>
                  </div>
                )}

                {/* Marks & Difficulty */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Marks</label>
                    <input
                      type="number"
                      min={1}
                      max={25}
                      value={formMarks}
                      onChange={(e) => setFormMarks(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
                    <div className="flex items-center gap-1 py-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormDifficulty(star)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${star <= formDifficulty ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Correct / Model answer */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {formType === 'mcq' ? 'Correct Answer (auto-set from options)' : 'Model Answer'}
                  </label>
                  <textarea
                    value={formType === 'mcq' ? formOptions[formCorrectOption] || '' : formCorrectAnswer}
                    onChange={(e) => setFormCorrectAnswer(e.target.value)}
                    readOnly={formType === 'mcq'}
                    rows={2}
                    placeholder={formType === 'mcq' ? 'Select correct option above' : 'Enter model answer...'}
                    className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] resize-none ${formType === 'mcq' ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Explanation</label>
                  <textarea
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    rows={3}
                    placeholder="Explain the reasoning behind the answer..."
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] resize-none"
                  />
                </div>

                {/* Optional: Exam Board, Year, Paper */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Exam Board</label>
                    <select
                      value={formExamBoard}
                      onChange={(e) => setFormExamBoard(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                    >
                      <option value="">Select...</option>
                      {EXAM_BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year</label>
                    <input
                      type="number"
                      min={2000}
                      max={2030}
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 2023"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Paper</label>
                    <input
                      type="text"
                      value={formPaper}
                      onChange={(e) => setFormPaper(e.target.value)}
                      placeholder="e.g. Paper 1"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

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
                    {editingId ? 'Save Changes' : 'Create Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
