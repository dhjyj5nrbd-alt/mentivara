import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Layout from '../components/Layout'
import { TUTOR_REELS } from '../services/demo-data'
import {
  BookOpen, Search, CreditCard, GraduationCap, Brain, HelpCircle,
  Dumbbell, MessageSquare, Shield, Users, Trophy, Flame, Clapperboard,
  Play, ChevronRight, ChevronLeft,
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
      className={`rounded-xl p-4 hover:shadow-lg transition-all group border ${accent} dark:bg-slate-800 dark:border-slate-700`}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        {stat && (
          <div className="text-right">
            <p className="text-base font-bold text-slate-800 dark:text-white leading-none">{stat}</p>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-0.5">{statLabel}</p>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-0.5 group-hover:text-[#7C3AED] transition-colors">{title}</h3>
      <p className="text-slate-400 dark:text-slate-500 text-xs leading-relaxed">{desc}</p>
    </Link>
  )
}

function ReelsBanner() {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clapperboard className="w-4 h-4 text-[#7C3AED]" />
          <h2 className="text-sm font-bold text-[#1E1B4B] dark:text-white">Tutor Reels</h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => scroll('left')} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 transition-colors" aria-label="Previous reels">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll('right')} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 transition-colors" aria-label="Next reels">
            <ChevronRight className="w-4 h-4" />
          </button>
          <Link to="/reels" className="text-[#7C3AED] text-xs font-medium hover:underline ml-2">
            View all
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {TUTOR_REELS.map((reel) => (
          <button
            key={reel.id}
            onClick={() => navigate('/reels')}
            className="shrink-0 rounded-lg overflow-hidden relative group cursor-pointer h-24 w-44"
          >
            <img
              src={reel.tutorPhoto}
              alt={reel.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            {/* Play */}
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-3 h-3 text-white fill-white ml-px" />
            </div>
            {/* Subject pill */}
            <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium">
              {reel.subject}
            </div>
            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2">
              <p className="text-white font-semibold text-[11px] leading-tight line-clamp-1">{reel.title}</p>
              <p className="text-white/60 text-[9px] mt-0.5">{reel.tutorName} · {reel.duration}</p>
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
      <div className="px-4 sm:px-6 py-6 max-w-full overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1B4B] dark:text-white">{greeting}, {firstName}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's your learning overview</p>
        </div>

        {user?.role === 'tutor' && user?.status === 'pending' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300 px-6 py-4 rounded-xl mb-6 flex items-start gap-3">
            <Flame className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Your account is pending approval</p>
              <p className="text-sm mt-1">An admin will review your application shortly.</p>
            </div>
          </div>
        )}

        {user?.role === 'student' && <ReelsBanner />}

        {user?.role === 'student' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 [&>*]:min-w-0">
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
              accent="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700"
              iconBg="bg-amber-100 text-amber-600"
              stat="#14" statLabel="Your rank"
            />
          </div>
        )}

        {user?.role === 'tutor' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 [&>*]:min-w-0">
            <DashCard to="/lessons" icon={BookOpen} title="My Lessons" desc="View upcoming and past lessons"
              accent="bg-white border-slate-200 hover:border-[#7C3AED]/30" iconBg="bg-[#EDE9FE] text-[#7C3AED]" />
            <DashCard to="/payments" icon={CreditCard} title="Earnings" desc="View your earnings"
              accent="bg-white border-slate-200 hover:border-emerald-300" iconBg="bg-emerald-100 text-emerald-600" />
            <DashCard to="/messages/conversations" icon={MessageSquare} title="Messages" desc="Chat with students"
              accent="bg-white border-slate-200 hover:border-indigo-300" iconBg="bg-indigo-100 text-indigo-600" />
          </div>
        )}

        {user?.role === 'parent' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 [&>*]:min-w-0">
            <DashCard to="/lessons" icon={BookOpen} title="Lessons" desc="View your child's lessons"
              accent="bg-white border-slate-200 hover:border-[#7C3AED]/30" iconBg="bg-[#EDE9FE] text-[#7C3AED]" />
            <DashCard to="/payments" icon={CreditCard} title="Payments" desc="View payment history"
              accent="bg-white border-slate-200 hover:border-slate-300" iconBg="bg-slate-100 text-slate-600" />
          </div>
        )}

        {user?.role === 'admin' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 [&>*]:min-w-0">
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
