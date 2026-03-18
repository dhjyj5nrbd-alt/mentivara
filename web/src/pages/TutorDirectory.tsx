import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { tutorService, type RefData, type TutorFilters } from '../services/tutors'
import { Search } from 'lucide-react'

export default function TutorDirectory() {
  const [filters, setFilters] = useState<TutorFilters>({})
  const [searchInput, setSearchInput] = useState('')

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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-[#1E1B4B]">Mentivara</Link>
          <div className="flex gap-3">
            <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900">Sign In</Link>
            <Link to="/register" className="text-sm px-4 py-1.5 bg-[#7C3AED] text-white rounded-lg">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#1E1B4B] mb-2">Find a Tutor</h1>
        <p className="text-slate-600 mb-8">Browse our curated tutors and find the perfect match.</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg">
              Search
            </button>
          </form>

          <select
            value={filters.subject || ''}
            onChange={(e) => setFilters((f) => ({ ...f, subject: e.target.value || undefined }))}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="">All Subjects</option>
            {subjects?.map((s: RefData) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>

          <select
            value={filters.level || ''}
            onChange={(e) => setFilters((f) => ({ ...f, level: e.target.value || undefined }))}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="">All Levels</option>
            {levels?.map((l: RefData) => (
              <option key={l.slug} value={l.slug}>{l.name}</option>
            ))}
          </select>

          {(filters.subject || filters.level || filters.search) && (
            <button
              onClick={() => { setFilters({}); setSearchInput('') }}
              className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Tutor grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" />
          </div>
        ) : tutorData?.data.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No tutors found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorData?.data.map((tutor) => (
              <Link
                key={tutor.id}
                to={`/tutors/${tutor.id}`}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED] font-semibold text-lg">
                    {tutor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{tutor.name}</h3>
                    {tutor.verified && (
                      <span className="text-xs text-emerald-600 font-medium">Verified</span>
                    )}
                  </div>
                </div>
                {tutor.bio && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{tutor.bio}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {tutor.subjects.map((s, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-[#EDE9FE] text-[#7C3AED] rounded-full">
                      {s.name}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
