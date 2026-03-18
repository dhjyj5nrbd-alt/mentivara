import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { tutorService } from '../services/tutors'

export default function TutorView() {
  const { id } = useParams<{ id: string }>()

  const { data: tutor, isLoading, error } = useQuery({
    queryKey: ['tutor', id],
    queryFn: () => tutorService.get(Number(id)),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" />
      </div>
    )
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Tutor not found</h2>
          <Link to="/tutors" className="text-[#7C3AED] hover:underline">Back to directory</Link>
        </div>
      </div>
    )
  }

  // Group subjects by subject name
  const subjectMap = new Map<string, { levels: string[]; boards: string[] }>()
  tutor.subjects.forEach((s) => {
    const name = s.subject?.name || 'Unknown'
    if (!subjectMap.has(name)) subjectMap.set(name, { levels: [], boards: [] })
    const entry = subjectMap.get(name)!
    if (s.level && !entry.levels.includes(s.level.name)) entry.levels.push(s.level.name)
    if (s.exam_board && !entry.boards.includes(s.exam_board.name)) entry.boards.push(s.exam_board.name)
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-[#1E1B4B]">Mentivara</Link>
          <Link to="/tutors" className="text-sm text-slate-600 hover:text-slate-900">Back to directory</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile header */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED] font-bold text-2xl">
              {tutor.user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1E1B4B]">{tutor.user.name}</h1>
              {tutor.verified && (
                <span className="text-sm text-emerald-600 font-medium">Verified Tutor</span>
              )}
            </div>
          </div>

          {tutor.bio && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">About</h2>
              <p className="text-slate-700">{tutor.bio}</p>
            </div>
          )}

          {tutor.qualifications && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Qualifications</h2>
              <p className="text-slate-700">{tutor.qualifications}</p>
            </div>
          )}

          {tutor.intro_video_url && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Intro Video</h2>
              <a href={tutor.intro_video_url} target="_blank" rel="noopener noreferrer" className="text-[#7C3AED] hover:underline text-sm">
                Watch introduction video
              </a>
            </div>
          )}
        </div>

        {/* Subjects */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Subjects & Levels</h2>
          {subjectMap.size === 0 ? (
            <p className="text-slate-500 text-sm">No subjects listed yet.</p>
          ) : (
            <div className="space-y-4">
              {Array.from(subjectMap).map(([subject, { levels, boards }]) => (
                <div key={subject} className="flex items-start gap-3">
                  <span className="px-3 py-1 bg-[#EDE9FE] text-[#7C3AED] rounded-full text-sm font-medium">
                    {subject}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {levels.map((l) => (
                      <span key={l} className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full">{l}</span>
                    ))}
                    {boards.map((b) => (
                      <span key={b} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">{b}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Book button */}
        <div className="text-center">
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-lg transition-colors"
          >
            Book a Lesson
          </Link>
        </div>
      </main>
    </div>
  )
}
