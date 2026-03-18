import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { BookOpen, Brain, Video, Shield, Users, Dumbbell } from 'lucide-react'

const features = [
  { icon: Video, title: 'Live Classroom', desc: 'HD video, whiteboard, screen sharing, and real-time chat with your tutor' },
  { icon: Brain, title: 'AI Study Tools', desc: 'Auto-generated flashcards, practice questions, and personalised study missions' },
  { icon: BookOpen, title: 'Exam Simulator', desc: 'Timed mock exams with auto-marking, grade predictions, and weak topic analysis' },
  { icon: Users, title: 'Student Community', desc: 'Discussion forums, study groups, tutor reels, and competitions' },
  { icon: Dumbbell, title: 'Mental Dojo', desc: 'Exam calmness, focus training, breathing exercises, and confidence building' },
  { icon: Shield, title: 'Curated Tutors', desc: 'Every tutor is vetted and verified. Quality teaching, guaranteed.' },
]

export default function Home() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <span className="text-xl font-bold text-[#1E1B4B]">Mentivara</span>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg font-medium">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Sign In</Link>
                <Link to="/register" className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg font-medium">Get Started Free</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
        <div className="inline-block px-3 py-1 bg-[#EDE9FE] text-[#7C3AED] text-xs font-semibold rounded-full mb-6">
          AI-Powered Tutoring Platform
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1E1B4B] leading-tight max-w-3xl mx-auto">
          Where brilliance is built
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Expert tutors, AI study tools, exam preparation, and mental resilience training — all in one platform for ambitious students.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-violet-200">
            Start Learning Today
          </Link>
          <Link to="/tutors" className="px-8 py-3.5 bg-white hover:bg-slate-50 text-[#1E1B4B] border border-slate-300 rounded-xl font-semibold text-lg transition-colors">
            Browse Tutors
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-400">GCSE &middot; IGCSE &middot; AS Level &middot; A-Level</p>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-[#1E1B4B] text-center mb-4">Everything you need to succeed</h2>
          <p className="text-slate-600 text-center mb-12 max-w-xl mx-auto">One platform combining expert tutoring, AI learning tools, and mental wellbeing.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-[#EDE9FE] flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-[#1E1B4B] mb-4">Ready to level up your learning?</h2>
          <p className="text-slate-600 mb-8">Join students who are achieving their academic goals with Mentivara.</p>
          <Link to="/register" className="inline-block px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-violet-200">
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500">
          <span className="font-semibold text-[#1E1B4B]">Mentivara</span>
          <p className="mt-2 sm:mt-0">Your mind, amplified.</p>
        </div>
      </footer>
    </div>
  )
}
