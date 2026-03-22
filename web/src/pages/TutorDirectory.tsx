import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { tutorService, type RefData, type TutorFilters, type TutorListItem } from '../services/tutors'
import { Search, X, CheckCircle, Star } from 'lucide-react'
import Layout from '../components/Layout'
import ReviewsModal from '../components/ReviewsModal'
import { useCurrencyStore, formatPrice, CURRENCIES, type CurrencyCode } from '../store/currencyStore'

const TUTOR_PHOTOS: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  3: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
  4: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
}

const TUTOR_STATS: Record<number, { rating: number; reviews: number; rate: number; experience: string }> = {
  1: { rating: 4.9, reviews: 127, rate: 45, experience: '8 years' },
  2: { rating: 4.8, reviews: 89, rate: 50, experience: '6 years' },
  3: { rating: 4.7, reviews: 156, rate: 40, experience: '10 years' },
  4: { rating: 4.9, reviews: 73, rate: 55, experience: '5 years' },
}

function TutorCard({ tutor }: { tutor: TutorListItem }) {
  const photo = TUTOR_PHOTOS[tutor.id]
  const stats = TUTOR_STATS[tutor.id] || { rating: 4.5, reviews: 0, rate: 40, experience: '3 years' }
  const currency = useCurrencyStore((s) => s.currency)
  const [showReviews, setShowReviews] = useState(false)

  // Deduplicate subject names and level names
  const subjectNames = [...new Set(tutor.subjects.map((s) => s.name))]
  const levelNames = [...new Set(tutor.subjects.flatMap((s) => s.levels))]

  return (
    <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl p-4 flex gap-4 hover:shadow-md transition-shadow group">
      {/* Photo */}
      <div className="shrink-0">
        {photo ? (
          <img src={photo} alt={tutor.name} className="w-16 h-16 rounded-xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] font-semibold text-xl">
            {tutor.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Name + verified */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{tutor.name}</h3>
          {tutor.verified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
        </div>

        {/* Rating + rate + experience */}
        <div className="flex items-center gap-2 text-xs mb-1.5">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowReviews(true) }}
            className="flex items-center gap-0.5 hover:underline decoration-dotted underline-offset-2"
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-medium text-slate-700 dark:text-slate-300">{stats.rating}</span>
            <span className="text-[#7C3AED]">({stats.reviews})</span>
          </button>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="font-bold text-[#7C3AED]">{formatPrice(stats.rate, currency)}/hr</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-slate-500 dark:text-slate-400">{stats.experience}</span>
        </div>

        {/* Bio */}
        {tutor.bio && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">{tutor.bio}</p>
        )}

        {/* Tags + Book button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 min-w-0">
            {subjectNames.map((name, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-[#EDE9FE] dark:bg-[#7C3AED]/20 text-[#7C3AED] rounded-full font-medium">
                {name}
              </span>
            ))}
            {levelNames.map((level, i) => (
              <span key={`l-${i}`} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-[#252839] text-slate-500 dark:text-slate-400 rounded-full">
                {level}
              </span>
            ))}
          </div>
          <Link
            to={`/tutors/${tutor.id}`}
            className="shrink-0 text-[11px] font-medium px-3 py-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg transition-colors opacity-80 group-hover:opacity-100"
          >
            Book
          </Link>
        </div>
      </div>

      {showReviews && (
        <ReviewsModal
          tutorId={tutor.id}
          rating={stats.rating}
          totalReviews={stats.reviews}
          onClose={() => setShowReviews(false)}
        />
      )}
    </div>
  )
}

export default function TutorDirectory() {
  const [filters, setFilters] = useState<TutorFilters>({})
  const [searchInput, setSearchInput] = useState('')
  const { currency, setCurrency } = useCurrencyStore()

  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: tutorService.getSubjects })
  const { data: levels } = useQuery({ queryKey: ['levels'], queryFn: tutorService.getLevels })

  const { data: tutorData, isLoading } = useQuery({
    queryKey: ['tutors', filters],
    queryFn: () => tutorService.list(filters),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters((f) => ({ ...f, search: searchInput || undefined }))
  }

  const hasFilters = filters.subject || filters.level || filters.search

  return (
    <Layout>
      <div className="px-4 sm:px-6 py-3 max-w-7xl mx-auto">
        {/* Header row */}
        <div className="flex items-baseline gap-3 mb-3">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Find a Tutor</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Browse our curated tutors and find the perfect match</p>
        </div>

        {/* Filter row */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                if (!e.target.value) setFilters((f) => ({ ...f, search: undefined }))
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e) }}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
            />
          </div>

          <select
            value={filters.subject || ''}
            onChange={(e) => setFilters((f) => ({ ...f, subject: e.target.value || undefined }))}
            className="px-3 py-1.5 text-sm border border-slate-300 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
          >
            <option value="">All Subjects</option>
            {subjects?.map((s: RefData) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>

          <select
            value={filters.level || ''}
            onChange={(e) => setFilters((f) => ({ ...f, level: e.target.value || undefined }))}
            className="px-3 py-1.5 text-sm border border-slate-300 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
          >
            <option value="">All Levels</option>
            {levels?.map((l: RefData) => (
              <option key={l.slug} value={l.slug}>{l.name}</option>
            ))}
          </select>

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="px-2 py-1.5 text-sm border border-slate-300 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            aria-label="Currency"
          >
            {Object.values(CURRENCIES).map((c) => (
              <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
            ))}
          </select>

          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg transition-colors"
          >
            Search
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={() => { setFilters({}); setSearchInput('') }}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </form>

        {/* Tutor grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" />
          </div>
        ) : tutorData?.data.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            No tutors found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {tutorData?.data.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
