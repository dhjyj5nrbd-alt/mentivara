import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { tutorService } from '../services/tutors'
import { useCurrencyStore, formatPrice } from '../store/currencyStore'
import Layout from '../components/Layout'
import { CheckCircle, Star, Clock, GraduationCap, BookOpen, ArrowLeft } from 'lucide-react'

const TUTOR_PHOTOS: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face',
  2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
  3: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
  4: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face',
}

const TUTOR_STATS: Record<number, { rating: number; reviews: number; rate: number; experience: string; students: number; lessons: number }> = {
  1: { rating: 4.9, reviews: 127, rate: 45, experience: '8 years', students: 42, lessons: 1240 },
  2: { rating: 4.8, reviews: 89, rate: 50, experience: '6 years', students: 31, lessons: 856 },
  3: { rating: 4.7, reviews: 156, rate: 40, experience: '10 years', students: 58, lessons: 2100 },
  4: { rating: 4.9, reviews: 73, rate: 55, experience: '5 years', students: 24, lessons: 620 },
}

export default function TutorView() {
  const { id } = useParams<{ id: string }>()
  const currency = useCurrencyStore((s) => s.currency)

  const { data: tutor, isLoading, error } = useQuery({
    queryKey: ['tutor', id],
    queryFn: () => tutorService.get(Number(id)),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" />
        </div>
      </Layout>
    )
  }

  if (error || !tutor) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Tutor not found</h2>
            <Link to="/tutors" className="text-[#7C3AED] hover:underline">Back to directory</Link>
          </div>
        </div>
      </Layout>
    )
  }

  const photo = TUTOR_PHOTOS[Number(id)] || null
  const stats = TUTOR_STATS[Number(id)] || { rating: 4.5, reviews: 0, rate: 40, experience: '3 years', students: 10, lessons: 100 }

  // Deduplicate subjects and levels
  const subjectNames = [...new Set(tutor.subjects.map((s) => s.subject?.name).filter(Boolean))]
  const levelNames = [...new Set(tutor.subjects.map((s) => s.level?.name).filter(Boolean))]

  return (
    <Layout>
      <div className="px-4 sm:px-6 py-3">
        <Link to="/tutors" className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-[#7C3AED] mb-3">
          <ArrowLeft className="w-3 h-3" /> Back to directory
        </Link>

        <div className="flex gap-5">
          {/* Left — Profile */}
          <div className="flex-1">
            <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl p-5">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                {photo ? (
                  <img src={photo} alt={tutor.user.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] font-bold text-2xl shrink-0">
                    {tutor.user.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">{tutor.user.name}</h1>
                    {tutor.verified && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 text-sm mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-slate-800 dark:text-white">{stats.rating}</span>
                      <span className="text-slate-400">({stats.reviews} reviews)</span>
                    </div>
                    <span className="font-bold text-[#7C3AED]">{formatPrice(stats.rate, currency)}/hr</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {subjectNames.map((name, i) => (
                      <span key={i} className="text-xs px-2.5 py-0.5 bg-[#EDE9FE] dark:bg-[#7C3AED]/20 text-[#7C3AED] rounded-full font-medium">{name}</span>
                    ))}
                    {levelNames.map((name, i) => (
                      <span key={`l-${i}`} className="text-xs px-2.5 py-0.5 bg-slate-100 dark:bg-[#252839] text-slate-500 dark:text-slate-400 rounded-full">{name}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {tutor.bio && (
                <div className="mb-3">
                  <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">About</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{tutor.bio}</p>
                </div>
              )}

              {/* Qualifications */}
              {tutor.qualifications && (
                <div>
                  <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Qualifications</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{tutor.qualifications}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right — Stats + Book */}
          <div className="w-64 shrink-0 space-y-3">
            {/* Stats grid */}
            <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Clock className="w-3.5 h-3.5 text-[#7C3AED]" />
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.experience}</p>
                  <p className="text-[10px] text-slate-400">Experience</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#7C3AED]" />
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.students}</p>
                  <p className="text-[10px] text-slate-400">Students</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#7C3AED]" />
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.lessons.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">Lessons</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.rating}</p>
                  <p className="text-[10px] text-slate-400">Rating</p>
                </div>
              </div>
            </div>

            {/* Book button */}
            <Link
              to={`/tutors/${id}/book`}
              className="block w-full text-center py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Book a Lesson
            </Link>

            {/* Price info */}
            <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Pricing</h3>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">30 min</span>
                  <span className="font-medium text-slate-800 dark:text-white">{formatPrice(Math.round(stats.rate * 0.5), currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">45 min</span>
                  <span className="font-medium text-slate-800 dark:text-white">{formatPrice(Math.round(stats.rate * 0.75), currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">60 min</span>
                  <span className="font-semibold text-[#7C3AED]">{formatPrice(stats.rate, currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">90 min</span>
                  <span className="font-medium text-slate-800 dark:text-white">{formatPrice(Math.round(stats.rate * 1.5), currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
