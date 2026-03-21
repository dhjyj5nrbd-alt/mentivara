import { useState } from 'react'
import Layout from '../components/Layout'
import {
  Wind, Target, Eye, Flame, BookHeart, Brain,
  ChevronRight, ArrowLeft, Check, Lock, Trophy, Star,
  Sparkles, Timer, Heart,
} from 'lucide-react'
import BreathingExercise from '../components/mental-dojo/BreathingExercise'
import FocusTimer from '../components/mental-dojo/FocusTimer'
import VisualizationExercise from '../components/mental-dojo/VisualizationExercise'
import ReflectionJournal from '../components/mental-dojo/ReflectionJournal'
import BodyScan from '../components/mental-dojo/BodyScan'
import ConfidenceBuilder from '../components/mental-dojo/ConfidenceBuilder'

// ── Types ──────────────────────────────────────────────────

interface Module {
  id: string
  title: string
  description: string
  duration: string
  type: 'breathing' | 'focus' | 'visualization' | 'reflection' | 'body-scan' | 'confidence'
  completed: boolean
  icon: React.ElementType
}

interface Course {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  modules: Module[]
  progress: number
}

// ── Course Data ────────────────────────────────────────────

const COURSES: Course[] = [
  {
    id: 'exam-calmness',
    title: 'Exam Calmness',
    description: 'Master techniques to stay calm, focused, and confident before and during exams.',
    icon: Wind,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    progress: 33,
    modules: [
      {
        id: 'box-breathing',
        title: 'Box Breathing',
        description: 'A powerful 4-4-4-4 breathing technique used by Navy SEALs to calm the nervous system instantly.',
        duration: '5 min',
        type: 'breathing',
        completed: true,
        icon: Wind,
      },
      {
        id: 'exam-visualization',
        title: 'Exam Success Visualization',
        description: 'Guided visualization to mentally rehearse walking into an exam feeling calm and prepared.',
        duration: '8 min',
        type: 'visualization',
        completed: false,
        icon: Eye,
      },
      {
        id: 'pre-exam-body-scan',
        title: 'Pre-Exam Body Scan',
        description: 'Release physical tension before an exam with this guided body scan relaxation.',
        duration: '6 min',
        type: 'body-scan',
        completed: false,
        icon: Heart,
      },
    ],
  },
  {
    id: 'focus-training',
    title: 'Focus Training',
    description: 'Build deep concentration skills for productive study sessions and sustained attention.',
    icon: Target,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    progress: 0,
    modules: [
      {
        id: 'focus-timer',
        title: 'Deep Focus Timer',
        description: 'Train your focus muscle with timed concentration sessions and ambient soundscapes.',
        duration: '10–25 min',
        type: 'focus',
        completed: false,
        icon: Timer,
      },
      {
        id: 'breath-focus',
        title: 'Breath Awareness Focus',
        description: 'Use breath counting as an anchor to build concentration stamina.',
        duration: '5 min',
        type: 'breathing',
        completed: false,
        icon: Wind,
      },
      {
        id: 'focus-reflection',
        title: 'Focus Journal',
        description: 'Reflect on your focus sessions — what helped, what distracted, what to improve.',
        duration: '3 min',
        type: 'reflection',
        completed: false,
        icon: BookHeart,
      },
    ],
  },
  {
    id: 'confidence-building',
    title: 'Confidence Building',
    description: 'Develop academic self-belief, resilience, and a growth mindset for challenging subjects.',
    icon: Flame,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    progress: 0,
    modules: [
      {
        id: 'confidence-affirmations',
        title: 'Confidence Builder',
        description: 'Interactive affirmation exercise to replace self-doubt with academic confidence.',
        duration: '5 min',
        type: 'confidence',
        completed: false,
        icon: Sparkles,
      },
      {
        id: 'growth-visualization',
        title: 'Growth Mindset Visualization',
        description: 'Visualize yourself overcoming a difficult topic and celebrating the breakthrough.',
        duration: '6 min',
        type: 'visualization',
        completed: false,
        icon: Eye,
      },
      {
        id: 'gratitude-reflection',
        title: 'Learning Gratitude Journal',
        description: 'Reflect on what you\'ve learned and how far you\'ve come on your academic journey.',
        duration: '4 min',
        type: 'reflection',
        completed: false,
        icon: BookHeart,
      },
    ],
  },
  {
    id: 'study-resilience',
    title: 'Study Resilience',
    description: 'Build mental toughness to push through difficult material and recover from setbacks.',
    icon: Brain,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    progress: 0,
    modules: [
      {
        id: 'resilience-breathing',
        title: 'Reset Breath',
        description: 'A quick breathing reset for when you feel stuck or frustrated during study.',
        duration: '3 min',
        type: 'breathing',
        completed: false,
        icon: Wind,
      },
      {
        id: 'resilience-visualization',
        title: 'Mountain Meditation',
        description: 'Visualize yourself as a mountain — steady and unshakable through any challenge.',
        duration: '6 min',
        type: 'visualization',
        completed: false,
        icon: Eye,
      },
      {
        id: 'resilience-reflection',
        title: 'Setback Recovery Journal',
        description: 'Process a recent academic setback and plan your comeback with clarity.',
        duration: '5 min',
        type: 'reflection',
        completed: false,
        icon: BookHeart,
      },
    ],
  },
]

// ── Main Component ─────────────────────────────────────────

type View = 'courses' | 'course-detail' | 'exercise'

export default function MentalDojo() {
  const [view, setView] = useState<View>('courses')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set(['box-breathing']))

  const totalModules = COURSES.reduce((sum, c) => sum + c.modules.length, 0)
  const totalCompleted = completedModules.size
  const xpEarned = totalCompleted * 25

  const openCourse = (course: Course) => {
    setSelectedCourse(course)
    setView('course-detail')
  }

  const openExercise = (mod: Module) => {
    setSelectedModule(mod)
    setView('exercise')
  }

  const completeExercise = () => {
    if (selectedModule) {
      setCompletedModules((prev) => new Set([...prev, selectedModule.id]))
    }
    setView('course-detail')
  }

  const goBack = () => {
    if (view === 'exercise') setView('course-detail')
    else if (view === 'course-detail') { setView('courses'); setSelectedCourse(null) }
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        {view === 'courses' && (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1B4B]">Mental Dojo</h1>
              </div>
              <p className="text-slate-500 mt-1">Train your mind for peak academic performance.</p>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-2xl font-bold text-[#1E1B4B]">{xpEarned}</span>
                </div>
                <p className="text-xs text-slate-500">Dojo XP</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-2xl font-bold text-[#1E1B4B]">{totalCompleted}/{totalModules}</span>
                </div>
                <p className="text-xs text-slate-500">Exercises Done</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-2xl font-bold text-[#1E1B4B]">3</span>
                </div>
                <p className="text-xs text-slate-500">Day Streak</p>
              </div>
            </div>

            {/* Course grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {COURSES.map((course) => {
                const courseCompleted = course.modules.filter((m) => completedModules.has(m.id)).length
                const courseProgress = Math.round((courseCompleted / course.modules.length) * 100)
                return (
                  <button
                    key={course.id}
                    onClick={() => openCourse(course)}
                    className={`${course.bgColor} border ${course.borderColor} rounded-2xl p-6 text-left hover:shadow-lg transition-all group`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center ${course.color}`}>
                        <course.icon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star className={`w-4 h-4 ${courseProgress > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                        <span className="text-sm font-medium text-slate-600">{courseProgress}%</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-[#7C3AED] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{course.modules.length} exercises</span>
                      <div className="w-24 h-1.5 bg-white/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${courseProgress}%` }}
                        />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Course Detail View */}
        {view === 'course-detail' && selectedCourse && (
          <>
            <button onClick={goBack} className="flex items-center gap-1.5 text-slate-500 hover:text-[#7C3AED] mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to courses
            </button>

            <div className={`${selectedCourse.bgColor} border ${selectedCourse.borderColor} rounded-2xl p-6 sm:p-8 mb-8`}>
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-14 h-14 rounded-xl bg-white/80 flex items-center justify-center ${selectedCourse.color}`}>
                  <selectedCourse.icon className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{selectedCourse.title}</h1>
                  <p className="text-sm text-slate-600">{selectedCourse.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {selectedCourse.modules.map((mod, i) => {
                const isCompleted = completedModules.has(mod.id)
                const isLocked = false
                return (
                  <button
                    key={mod.id}
                    onClick={() => !isLocked && openExercise(mod)}
                    disabled={isLocked}
                    className={`w-full flex items-center gap-4 p-5 rounded-xl border transition-all text-left
                      ${isCompleted
                        ? 'bg-emerald-50 border-emerald-200'
                        : isLocked
                          ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                          : 'bg-white border-slate-200 hover:border-[#7C3AED] hover:shadow-md cursor-pointer'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                      ${isCompleted ? 'bg-emerald-100 text-emerald-600' : isLocked ? 'bg-slate-100 text-slate-400' : `${selectedCourse.bgColor} ${selectedCourse.color}`}`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : isLocked ? <Lock className="w-4 h-4" /> : <mod.icon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${isCompleted ? 'text-emerald-800' : 'text-slate-900'}`}>
                          {mod.title}
                        </h3>
                        {isCompleted && (
                          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                            +25 XP
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{mod.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400">{mod.duration}</span>
                      {!isLocked && !isCompleted && <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Exercise View */}
        {view === 'exercise' && selectedModule && (
          <>
            <button onClick={goBack} className="flex items-center gap-1.5 text-slate-500 hover:text-[#7C3AED] mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to {selectedCourse?.title}
            </button>

            {selectedModule.type === 'breathing' && (
              <BreathingExercise
                title={selectedModule.title}
                onComplete={completeExercise}
              />
            )}
            {selectedModule.type === 'focus' && (
              <FocusTimer onComplete={completeExercise} />
            )}
            {selectedModule.type === 'visualization' && (
              <VisualizationExercise
                title={selectedModule.title}
                onComplete={completeExercise}
              />
            )}
            {selectedModule.type === 'reflection' && (
              <ReflectionJournal
                title={selectedModule.title}
                onComplete={completeExercise}
              />
            )}
            {selectedModule.type === 'body-scan' && (
              <BodyScan onComplete={completeExercise} />
            )}
            {selectedModule.type === 'confidence' && (
              <ConfidenceBuilder onComplete={completeExercise} />
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
