import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Layout from '../components/Layout'
import {
  BookOpen, Search, CreditCard, GraduationCap, Brain, HelpCircle,
  Dumbbell, MessageSquare, Shield, Users, Trophy, Flame,
} from 'lucide-react'

interface CardProps {
  to: string
  icon: React.ElementType
  title: string
  desc: string
  accent?: string
}

function DashCard({ to, icon: Icon, title, desc, accent }: CardProps) {
  return (
    <Link to={to} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all group">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${accent || 'bg-[#EDE9FE] text-[#7C3AED]'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-[#7C3AED] transition-colors">{title}</h3>
      <p className="text-slate-500 text-sm">{desc}</p>
    </Link>
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

        {user?.role === 'student' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashCard to="/lessons" icon={BookOpen} title="My Lessons" desc="View upcoming and past lessons" />
            <DashCard to="/tutors" icon={Search} title="Find a Tutor" desc="Browse and book verified tutors" accent="bg-blue-50 text-blue-600" />
            <DashCard to="/exam" icon={GraduationCap} title="Exam Simulator" desc="Practice with timed mock exams" accent="bg-emerald-50 text-emerald-600" />
            <DashCard to="/knowledge-map" icon={Brain} title="Knowledge Map" desc="Track your topic mastery" accent="bg-sky-50 text-sky-600" />
            <DashCard to="/doubts" icon={HelpCircle} title="AI Doubt Solver" desc="Get instant answers" accent="bg-amber-50 text-amber-600" />
            <DashCard to="/mental-dojo" icon={Dumbbell} title="Mental Dojo" desc="Focus, calmness, confidence" accent="bg-rose-50 text-rose-600" />
            <DashCard to="/payments" icon={CreditCard} title="Payments" desc="View payment history" />
            <DashCard to="/messages/conversations" icon={MessageSquare} title="Messages" desc="Chat with your tutors" />
            <DashCard to="/leaderboard" icon={Trophy} title="Leaderboard" desc="Top students by XP" accent="bg-amber-50 text-amber-600" />
          </div>
        )}

        {user?.role === 'tutor' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashCard to="/lessons" icon={BookOpen} title="My Lessons" desc="View upcoming and past lessons" />
            <DashCard to="/payments" icon={CreditCard} title="Earnings" desc="View your earnings" accent="bg-emerald-50 text-emerald-600" />
            <DashCard to="/messages/conversations" icon={MessageSquare} title="Messages" desc="Chat with students" />
          </div>
        )}

        {user?.role === 'parent' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashCard to="/lessons" icon={BookOpen} title="Lessons" desc="View your child's lessons" />
            <DashCard to="/payments" icon={CreditCard} title="Payments" desc="View payment history" />
          </div>
        )}

        {user?.role === 'admin' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashCard to="/admin" icon={Shield} title="Admin Dashboard" desc="Platform overview" accent="bg-red-50 text-red-600" />
            <DashCard to="/admin/users" icon={Users} title="Users" desc="Manage platform users" />
            <DashCard to="/admin/tutors-pending" icon={GraduationCap} title="Pending Tutors" desc="Review applications" accent="bg-amber-50 text-amber-600" />
            <DashCard to="/admin/payments" icon={CreditCard} title="Payments" desc="All transactions" accent="bg-emerald-50 text-emerald-600" />
          </div>
        )}
      </div>
    </Layout>
  )
}
