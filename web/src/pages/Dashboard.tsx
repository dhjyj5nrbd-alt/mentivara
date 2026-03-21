import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Layout from '../components/Layout'
import { TUTOR_REELS } from '../services/demo-data'
import {
  BookOpen, Search, CreditCard, GraduationCap, Brain, HelpCircle,
  Dumbbell, MessageSquare, Shield, Users, Trophy, Flame, Clapperboard,
  Play, Heart, ChevronRight,
} from 'lucide-react'

interface CardProps {
  to: string
  icon: React.ElementType
  title: string
  desc: string
  accent: string
  iconBg: string
  stat?: string
  statLabel?: string
}

function DashCard({ to, icon: Icon, title, desc, accent, iconBg, stat, statLabel }: CardProps) {
  return (
    <Link
      to={to}
      className={`rounded-xl p-5 hover:shadow-lg transition-all group border ${accent}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        {stat && (
          <div className="text-right">
            <p className="text-lg font-bold text-slate-800">{stat}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">{statLabel}</p>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-slate-900 mb-0.5 group-hover:text-[#7C3AED] transition-colors">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </Link>
  )
}

function ReelsBanner() {
  const navigate = useNavigate()
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const formatCount = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    return n.toString()
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-[#1E1B4B]">Tutor Reels</h2>
          <p className="text-slate-400 text-xs">Quick lessons from top tutors</p>
        </div>
        <Link
          to="/reels"
          className="text-[#7C3AED] text-sm font-medium hover:underline flex items-center gap-1"
        >
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {TUTOR_REELS.map((reel) => (
          <button
            key={reel.id}
            onClick={() => navigate('/reels')}
            onMouseEnter={() => setHoveredId(reel.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="shrink-0 w-44 rounded-xl overflow-hidden relative group cursor-pointer"
            style={{ aspectRatio: '9/14' }}
          >
            {/* Background photo */}
            <img
              src={reel.tutorPhoto}
              alt={reel.title}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
                hoveredId === reel.id ? 'scale-110' : 'scale-100'
              }`}
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5" />

            {/* Play icon */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              hoveredId === reel.id ? 'opacity-100' : 'opacity-70'
            }`}>
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
            </div>

            {/* Duration badge */}
            <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
              {reel.duration}
            </div>

            {/* Subject tag */}
            <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
              {reel.subject}
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <img
                  src={reel.tutorAvatar}
                  alt={reel.tutorName}
                  className="w-5 h-5 rounded-full object-cover border border-white/40"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <span className="text-white/80 text-[10px] font-medium truncate">{reel.tutorName}</span>
              </div>
              <p className="text-white font-semibold text-xs leading-tight line-clamp-2">{reel.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1 text-white/60 text-[10px]">
                  <Heart className="w-3 h-3" />
                  {formatCount(reel.likes)}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const firstName = user?.name?.split(' ')[0]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1B4B]">{greeting}, {firstName}</h1>
          <p className="text-slate-500 mt-1">Here's your learning overview</p>
        </div>

        {user?.role === 'tutor' && user?.status === 'pending' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl mb-6 flex items-start gap-3">
            <Flame className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Your account is pending approval</p>
              <p className="text-sm mt-1">An admin will review your application shortly.</p>
            </div>
          </div>
        )}

        {user?.role === 'student' && <ReelsBanner />}

        {user?.role === 'student' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashCard
              to="/lessons" icon={BookOpen} title="My Lessons"
              desc="View upcoming and past lessons"
              accent="bg-white border-slate-200 hover:border-[#7C3AED]/30"
              iconBg="bg-[#EDE9FE] text-[#7C3AED]"
              stat="3" statLabel="Upcoming"
            />
            <DashCard
              to="/tutors" icon={Search} title="Find a Tutor"
              desc="Browse and book verified tutors"
              accent="bg-white border-slate-200 hover:border-blue-300"
              iconBg="bg-blue-100 text-blue-600"
              stat="12" statLabel="Available"
            />
            <DashCard
              to="/exam" icon={GraduationCap} title="Exam Simulator"
              desc="Practice with timed mock exams"
              accent="bg-white border-slate-200 hover:border-emerald-300"
              iconBg="bg-emerald-100 text-emerald-600"
              stat="B+" statLabel="Predicted"
            />
            <DashCard
              to="/knowledge-map" icon={Brain} title="Knowledge Map"
              desc="Track your topic mastery"
              accent="bg-white border-slate-200 hover:border-sky-300"
              iconBg="bg-sky-100 text-sky-600"
              stat="67%" statLabel="Mastery"
            />
            <DashCard
              to="/doubts" icon={HelpCircle} title="AI Doubt Solver"
              desc="Get instant help with any question"
              accent="bg-white border-slate-200 hover:border-amber-300"
              iconBg="bg-amber-100 text-amber-600"
            />
            <DashCard
              to="/mental-dojo" icon={Dumbbell} title="Mental Dojo"
              desc="Focus, calmness, and confidence"
              accent="bg-white border-slate-200 hover:border-rose-300"
              iconBg="bg-rose-100 text-rose-600"
              stat="3" statLabel="Day streak"
            />
            <DashCard
              to="/messages/conversations" icon={MessageSquare} title="Messages"
              desc="Chat with your tutors"
              accent="bg-white border-slate-200 hover:border-indigo-300"
              iconBg="bg-indigo-100 text-indigo-600"
              stat="2" statLabel="Unread"
            />
            <DashCard
              to="/payments" icon={CreditCard} title="Payments"
              desc="View payment history"
              accent="bg-white border-slate-200 hover:border-slate-300"
              iconBg="bg-slate-100 text-slate-600"
            />
            <DashCard
              to="/leaderboard" icon={Trophy} title="Leaderboard"
              desc="Compete with other students"
              accent="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300"
              iconBg="bg-amber-100 text-amber-600"
              stat="#14" statLabel="Your rank"
            />
          </div>
        )}

        {user?.role === 'tutor' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashCard to="/lessons" icon={BookOpen} title="My Lessons" desc="View upcoming and past lessons"
              accent="bg-white border-slate-200 hover:border-[#7C3AED]/30" iconBg="bg-[#EDE9FE] text-[#7C3AED]" />
            <DashCard to="/payments" icon={CreditCard} title="Earnings" desc="View your earnings"
              accent="bg-white border-slate-200 hover:border-emerald-300" iconBg="bg-emerald-100 text-emerald-600" />
            <DashCard to="/messages/conversations" icon={MessageSquare} title="Messages" desc="Chat with students"
              accent="bg-white border-slate-200 hover:border-indigo-300" iconBg="bg-indigo-100 text-indigo-600" />
          </div>
        )}

        {user?.role === 'parent' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashCard to="/lessons" icon={BookOpen} title="Lessons" desc="View your child's lessons"
              accent="bg-white border-slate-200 hover:border-[#7C3AED]/30" iconBg="bg-[#EDE9FE] text-[#7C3AED]" />
            <DashCard to="/payments" icon={CreditCard} title="Payments" desc="View payment history"
              accent="bg-white border-slate-200 hover:border-slate-300" iconBg="bg-slate-100 text-slate-600" />
          </div>
        )}

        {user?.role === 'admin' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashCard to="/admin" icon={Shield} title="Admin Dashboard" desc="Platform overview"
              accent="bg-white border-slate-200 hover:border-red-300" iconBg="bg-red-100 text-red-600" />
            <DashCard to="/admin/users" icon={Users} title="Users" desc="Manage platform users"
              accent="bg-white border-slate-200 hover:border-slate-300" iconBg="bg-slate-100 text-slate-600" />
            <DashCard to="/admin/tutors-pending" icon={GraduationCap} title="Pending Tutors" desc="Review applications"
              accent="bg-white border-slate-200 hover:border-amber-300" iconBg="bg-amber-100 text-amber-600" />
            <DashCard to="/admin/payments" icon={CreditCard} title="Payments" desc="All transactions"
              accent="bg-white border-slate-200 hover:border-emerald-300" iconBg="bg-emerald-100 text-emerald-600" />
          </div>
        )}
      </div>
    </Layout>
  )
}
