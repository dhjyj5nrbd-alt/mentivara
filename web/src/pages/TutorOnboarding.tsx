import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import {
  ChevronRight, ChevronLeft, Upload, Plus, Trash2, Check,
  Video, MessageSquare, Monitor, PenTool, Camera, Mic, MonitorUp,
  Sun, Moon, GraduationCap, Clock, Globe,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Qualification {
  id: string
  degree: string
  institution: string
  year: string
}

interface ProfileData {
  photoFile: File | null
  photoPreview: string
  fullName: string
  bio: string
  headline: string
  qualifications: Qualification[]
  introVideoUrl: string
}

interface TeachingData {
  subjects: string[]
  levels: string[]
  examBoards: string[]
  hourlyRate: string
  currency: string
  lessonDurations: number[]
}

interface AvailabilitySlot {
  day: string
  period: string
}

interface AvailabilityData {
  slots: AvailabilitySlot[]
  timezone: string
}

interface DemoChecks {
  camera: boolean
  microphone: boolean
  screenShare: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  'Welcome',
  'Profile Setup',
  'Teaching Preferences',
  'Availability',
  'Demo Classroom',
  'Complete',
]

const SUBJECTS = ['Maths', 'English', 'Biology', 'Chemistry', 'Physics', 'Business', 'Psychology']
const LEVELS = ['GCSE', 'IGCSE', 'AS', 'A-Level']
const EXAM_BOARDS = ['CIE', 'Edexcel', 'AQA', 'OCR']
const CURRENCIES = ['GBP', 'USD', 'EUR', 'AED']
const DURATIONS = [30, 45, 60]
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PERIODS = ['Morning', 'Afternoon', 'Evening']

const TIMEZONES = [
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Australia/Sydney',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createId() {
  return Math.random().toString(36).slice(2, 9)
}

const inputClass =
  'w-full px-4 py-2.5 border border-slate-300 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] dark:text-white dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent text-sm'

const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'

// ─── Component ────────────────────────────────────────────────────────────────

export default function TutorOnboarding() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [animating, setAnimating] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Step 2 — Profile
  const [profile, setProfile] = useState<ProfileData>({
    photoFile: null,
    photoPreview: '',
    fullName: user?.name || '',
    bio: '',
    headline: '',
    qualifications: [{ id: createId(), degree: '', institution: '', year: '' }],
    introVideoUrl: '',
  })

  // Step 3 — Teaching
  const [teaching, setTeaching] = useState<TeachingData>({
    subjects: [],
    levels: [],
    examBoards: [],
    hourlyRate: '',
    currency: 'GBP',
    lessonDurations: [],
  })

  // Step 4 — Availability
  const [availability, setAvailability] = useState<AvailabilityData>({
    slots: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London',
  })

  // Step 5 — Demo checks
  const [demoChecks, setDemoChecks] = useState<DemoChecks>({
    camera: false,
    microphone: false,
    screenShare: false,
  })

  // Whiteboard
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)

  // ─── Whiteboard drawing ───────────────────────────────────────────────────

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const touch = e.touches[0]
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    lastPoint.current = getCanvasPoint(e)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const point = getCanvasPoint(e)
    if (!ctx || !point || !lastPoint.current) return
    ctx.strokeStyle = '#7C3AED'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    lastPoint.current = point
  }

  const endDraw = () => {
    setIsDrawing(false)
    lastPoint.current = null
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  // ─── Photo upload ─────────────────────────────────────────────────────────

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setProfile((p) => ({ ...p, photoFile: file, photoPreview: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  // ─── Qualifications ──────────────────────────────────────────────────────

  const addQualification = () => {
    setProfile((p) => ({
      ...p,
      qualifications: [...p.qualifications, { id: createId(), degree: '', institution: '', year: '' }],
    }))
  }

  const removeQualification = (id: string) => {
    setProfile((p) => ({
      ...p,
      qualifications: p.qualifications.filter((q) => q.id !== id),
    }))
  }

  const updateQualification = (id: string, field: keyof Omit<Qualification, 'id'>, value: string) => {
    setProfile((p) => ({
      ...p,
      qualifications: p.qualifications.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    }))
  }

  // ─── Toggle helpers ───────────────────────────────────────────────────────

  const toggleItem = <T extends string | number>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item]

  const toggleSlot = (day: string, period: string) => {
    setAvailability((a) => {
      const exists = a.slots.some((s) => s.day === day && s.period === period)
      return {
        ...a,
        slots: exists
          ? a.slots.filter((s) => !(s.day === day && s.period === period))
          : [...a.slots, { day, period }],
      }
    })
  }

  const isSlotActive = (day: string, period: string) =>
    availability.slots.some((s) => s.day === day && s.period === period)

  // ─── Validation ───────────────────────────────────────────────────────────

  const validate = useCallback((): string[] => {
    const errs: string[] = []
    if (currentStep === 1) {
      if (!profile.fullName.trim()) errs.push('Full name is required.')
      if (profile.bio.length < 200) errs.push(`Bio must be at least 200 characters (currently ${profile.bio.length}).`)
      if (!profile.headline.trim()) errs.push('Headline is required.')
      const hasValidQual = profile.qualifications.some((q) => q.degree.trim() && q.institution.trim() && q.year.trim())
      if (!hasValidQual) errs.push('At least one complete qualification is required.')
    }
    if (currentStep === 2) {
      if (teaching.subjects.length === 0) errs.push('Select at least one subject.')
      if (teaching.levels.length === 0) errs.push('Select at least one level.')
      if (teaching.examBoards.length === 0) errs.push('Select at least one exam board.')
      if (!teaching.hourlyRate || Number(teaching.hourlyRate) <= 0) errs.push('Set a valid hourly rate.')
      if (teaching.lessonDurations.length === 0) errs.push('Select at least one lesson duration.')
    }
    if (currentStep === 3) {
      if (availability.slots.length === 0) errs.push('Select at least one availability slot.')
    }
    return errs
  }, [currentStep, profile, teaching, availability])

  // ─── Navigation ───────────────────────────────────────────────────────────

  const goNext = () => {
    const errs = validate()
    if (errs.length > 0) {
      setErrors(errs)
      return
    }
    setErrors([])
    setDirection('forward')
    setAnimating(true)
    setTimeout(() => {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
      setAnimating(false)
    }, 200)
  }

  const goBack = () => {
    setErrors([])
    setDirection('back')
    setAnimating(true)
    setTimeout(() => {
      setCurrentStep((s) => Math.max(s - 1, 0))
      setAnimating(false)
    }, 200)
  }

  // ─── Render Steps ─────────────────────────────────────────────────────────

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepWelcome userName={user?.name || 'Tutor'} />
      case 1:
        return (
          <StepProfile
            profile={profile}
            setProfile={setProfile}
            onPhotoChange={handlePhotoChange}
            addQualification={addQualification}
            removeQualification={removeQualification}
            updateQualification={updateQualification}
          />
        )
      case 2:
        return (
          <StepTeaching
            teaching={teaching}
            setTeaching={setTeaching}
            toggleItem={toggleItem}
          />
        )
      case 3:
        return (
          <StepAvailability
            availability={availability}
            setAvailability={setAvailability}
            toggleSlot={toggleSlot}
            isSlotActive={isSlotActive}
          />
        )
      case 4:
        return (
          <StepDemo
            demoChecks={demoChecks}
            setDemoChecks={setDemoChecks}
            canvasRef={canvasRef}
            startDraw={startDraw}
            draw={draw}
            endDraw={endDraw}
            clearCanvas={clearCanvas}
          />
        )
      case 5:
        return (
          <StepComplete
            profile={profile}
            teaching={teaching}
            availability={availability}
            onDashboard={() => navigate('/dashboard')}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] transition-colors">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white dark:bg-[#161822] border-b border-slate-200 dark:border-[#232536]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-[#1E1B4B] dark:text-white">Mentivara</span>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-[#252839] text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2d3048] border border-slate-200 dark:border-[#232536] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="fixed top-14 left-0 right-0 z-10 bg-white dark:bg-[#161822] border-b border-slate-200 dark:border-[#232536] py-4">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {STEPS.map((label, idx) => (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300 ${
                      idx < currentStep
                        ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
                        : idx === currentStep
                          ? 'border-[#7C3AED] text-[#7C3AED] bg-[#EDE9FE] dark:bg-[#7C3AED]/20'
                          : 'border-slate-300 dark:border-[#2d3048] text-slate-400 dark:text-slate-500 bg-white dark:bg-[#1a1d2e]'
                    }`}
                  >
                    {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`hidden sm:block mt-1 text-[10px] font-medium whitespace-nowrap ${
                      idx <= currentStep ? 'text-[#7C3AED]' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded transition-colors duration-300 ${
                      idx < currentStep ? 'bg-[#7C3AED]' : 'bg-slate-200 dark:bg-[#2d3048]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-32 sm:pt-36 pb-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((err, i) => (
                  <li key={i} className="text-sm text-red-700 dark:text-red-400">{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Step content with fade animation */}
          <div
            className={`transition-all duration-200 ${
              animating
                ? direction === 'forward'
                  ? 'opacity-0 translate-x-8'
                  : 'opacity-0 -translate-x-8'
                : 'opacity-100 translate-x-0'
            }`}
          >
            {renderStepContent()}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      {currentStep < STEPS.length - 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#161822] border-t border-slate-200 dark:border-[#232536] py-4 z-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 flex justify-between">
            <button
              onClick={goBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252839] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors"
            >
              {currentStep === STEPS.length - 2 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step 1: Welcome ──────────────────────────────────────────────────────────

function StepWelcome({ userName }: { userName: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center">
        <GraduationCap className="w-10 h-10 text-[#7C3AED]" />
      </div>
      <h1 className="text-3xl font-bold text-[#1E1B4B] dark:text-white mb-3">
        Welcome to Mentivara, {userName}!
      </h1>
      <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
        We are excited to have you on board. This onboarding will help you set up your tutor profile,
        configure your teaching preferences and availability, and get familiar with our virtual classroom.
        It only takes a few minutes.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto text-left">
        {[
          { icon: '1', title: 'Build Your Profile', desc: 'Add your qualifications and bio' },
          { icon: '2', title: 'Set Preferences', desc: 'Subjects, rates, and availability' },
          { icon: '3', title: 'Explore Classroom', desc: 'Try our interactive tools' },
        ].map((item) => (
          <div key={item.title} className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl p-4">
            <div className="w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-sm font-bold mb-2">
              {item.icon}
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Step 2: Profile Setup ────────────────────────────────────────────────────

function StepProfile({
  profile,
  setProfile,
  onPhotoChange,
  addQualification,
  removeQualification,
  updateQualification,
}: {
  profile: ProfileData
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  addQualification: () => void
  removeQualification: (id: string) => void
  updateQualification: (id: string, field: keyof Omit<Qualification, 'id'>, value: string) => void
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1E1B4B] dark:text-white">Profile Setup</h2>

      {/* Photo upload */}
      <div className="flex items-center gap-5">
        <label className="cursor-pointer group" htmlFor="photo-upload">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-[#2d3048] group-hover:border-[#7C3AED] transition-colors flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#252839]">
            {profile.photoPreview ? (
              <img src={profile.photoPreview} alt="Profile preview" className="w-full h-full object-cover" />
            ) : (
              <Upload className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <input id="photo-upload" type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
        </label>
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Photo</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Click to upload (JPG, PNG)</p>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label className={labelClass}>Full Name</label>
        <input
          type="text"
          value={profile.fullName}
          onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
          className={inputClass}
          placeholder="Your full name"
        />
      </div>

      {/* Bio */}
      <div>
        <label className={labelClass}>Bio / About Me</label>
        <textarea
          value={profile.bio}
          onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
          className={`${inputClass} min-h-[120px] resize-y`}
          placeholder="Tell students about yourself, your teaching style, and experience..."
        />
        <p className={`text-xs mt-1 ${profile.bio.length >= 200 ? 'text-green-600' : 'text-slate-400'}`}>
          {profile.bio.length}/200 characters minimum
        </p>
      </div>

      {/* Headline */}
      <div>
        <label className={labelClass}>Headline</label>
        <input
          type="text"
          value={profile.headline}
          onChange={(e) => setProfile((p) => ({ ...p, headline: e.target.value }))}
          className={inputClass}
          placeholder='e.g. "Experienced Biology Tutor | GCSE & A-Level"'
        />
      </div>

      {/* Qualifications */}
      <div>
        <label className={labelClass}>Qualifications</label>
        <div className="space-y-3">
          {profile.qualifications.map((q) => (
            <div key={q.id} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={q.degree}
                  onChange={(e) => updateQualification(q.id, 'degree', e.target.value)}
                  className={inputClass}
                  placeholder="Degree / Certificate"
                />
                <input
                  type="text"
                  value={q.institution}
                  onChange={(e) => updateQualification(q.id, 'institution', e.target.value)}
                  className={inputClass}
                  placeholder="Institution"
                />
                <input
                  type="text"
                  value={q.year}
                  onChange={(e) => updateQualification(q.id, 'year', e.target.value)}
                  className={inputClass}
                  placeholder="Year"
                />
              </div>
              {profile.qualifications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQualification(q.id)}
                  className="mt-2 text-slate-400 hover:text-red-500 transition-colors"
                  aria-label="Remove qualification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addQualification}
          className="mt-2 flex items-center gap-1.5 text-sm text-[#7C3AED] hover:text-[#6D28D9] font-medium"
        >
          <Plus className="w-4 h-4" /> Add Qualification
        </button>
      </div>

      {/* Intro Video URL */}
      <div>
        <label className={labelClass}>Intro Video URL (optional)</label>
        <input
          type="url"
          value={profile.introVideoUrl}
          onChange={(e) => setProfile((p) => ({ ...p, introVideoUrl: e.target.value }))}
          className={inputClass}
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>
    </div>
  )
}

// ─── Step 3: Teaching Preferences ─────────────────────────────────────────────

function StepTeaching({
  teaching,
  setTeaching,
  toggleItem,
}: {
  teaching: TeachingData
  setTeaching: React.Dispatch<React.SetStateAction<TeachingData>>
  toggleItem: <T extends string | number>(list: T[], item: T) => T[]
}) {
  const CheckboxGroup = ({
    label,
    items,
    selected,
    field,
  }: {
    label: string
    items: (string | number)[]
    selected: (string | number)[]
    field: keyof TeachingData
  }) => (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isActive = selected.includes(item)
          return (
            <button
              key={item}
              type="button"
              onClick={() =>
                setTeaching((t) => ({ ...t, [field]: toggleItem(selected as any, item) }))
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                isActive
                  ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                  : 'bg-white dark:bg-[#252839] text-slate-600 dark:text-slate-400 border-slate-300 dark:border-[#2d3048] hover:border-[#7C3AED]'
              }`}
            >
              {typeof item === 'number' ? `${item} min` : item}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1E1B4B] dark:text-white">Teaching Preferences</h2>

      <CheckboxGroup label="Subjects You Teach" items={SUBJECTS} selected={teaching.subjects} field="subjects" />
      <CheckboxGroup label="Levels" items={LEVELS} selected={teaching.levels} field="levels" />
      <CheckboxGroup label="Exam Boards" items={EXAM_BOARDS} selected={teaching.examBoards} field="examBoards" />

      {/* Hourly Rate */}
      <div>
        <label className={labelClass}>Hourly Rate</label>
        <div className="flex gap-2">
          <select
            value={teaching.currency}
            onChange={(e) => setTeaching((t) => ({ ...t, currency: e.target.value }))}
            className={`${inputClass} w-24 shrink-0`}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={teaching.hourlyRate}
            onChange={(e) => setTeaching((t) => ({ ...t, hourlyRate: e.target.value }))}
            className={inputClass}
            placeholder="e.g. 45"
          />
        </div>
      </div>

      <CheckboxGroup label="Lesson Duration" items={DURATIONS} selected={teaching.lessonDurations} field="lessonDurations" />
    </div>
  )
}

// ─── Step 4: Availability ─────────────────────────────────────────────────────

function StepAvailability({
  availability,
  setAvailability,
  toggleSlot,
  isSlotActive,
}: {
  availability: AvailabilityData
  setAvailability: React.Dispatch<React.SetStateAction<AvailabilityData>>
  toggleSlot: (day: string, period: string) => void
  isSlotActive: (day: string, period: string) => boolean
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1E1B4B] dark:text-white">Availability</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Click on the time slots when you are available to teach.
      </p>

      {/* Weekly grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-xs font-medium text-slate-500 dark:text-slate-400 text-left w-24">
                <Clock className="w-4 h-4 inline mr-1" />
              </th>
              {DAYS.map((d) => (
                <th key={d} className="p-2 text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period) => (
              <tr key={period}>
                <td className="p-2 text-xs font-medium text-slate-500 dark:text-slate-400">{period}</td>
                {DAYS.map((day) => (
                  <td key={`${day}-${period}`} className="p-1 text-center">
                    <button
                      type="button"
                      onClick={() => toggleSlot(day, period)}
                      className={`w-full py-3 rounded-lg text-xs font-medium transition-all ${
                        isSlotActive(day, period)
                          ? 'bg-[#7C3AED] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-[#252839] text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-[#2d3048]'
                      }`}
                      aria-label={`${day} ${period} ${isSlotActive(day, period) ? 'available' : 'unavailable'}`}
                    >
                      {isSlotActive(day, period) ? <Check className="w-3 h-3 mx-auto" /> : ''}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Timezone */}
      <div>
        <label className={labelClass}>
          <Globe className="w-4 h-4 inline mr-1" />
          Timezone
        </label>
        <select
          value={availability.timezone}
          onChange={(e) => setAvailability((a) => ({ ...a, timezone: e.target.value }))}
          className={inputClass}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

// ─── Step 5: Demo Classroom ───────────────────────────────────────────────────

function StepDemo({
  demoChecks,
  setDemoChecks,
  canvasRef,
  startDraw,
  draw,
  endDraw,
  clearCanvas,
}: {
  demoChecks: DemoChecks
  setDemoChecks: React.Dispatch<React.SetStateAction<DemoChecks>>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  startDraw: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void
  draw: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void
  endDraw: () => void
  clearCanvas: () => void
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1E1B4B] dark:text-white">Demo Classroom</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Get familiar with the tools you will use during your lessons.
      </p>

      {/* Feature overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Video, label: 'Video Call', desc: 'HD video with students' },
          { icon: PenTool, label: 'Whiteboard', desc: 'Interactive drawing board' },
          { icon: MessageSquare, label: 'Live Chat', desc: 'Text chat alongside video' },
          { icon: Monitor, label: 'Screen Share', desc: 'Share your screen easily' },
        ].map((f) => (
          <div key={f.label} className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl p-4 text-center">
            <f.icon className="w-6 h-6 text-[#7C3AED] mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{f.label}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Mini whiteboard */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass}>Try the Whiteboard</label>
          <button
            type="button"
            onClick={clearCanvas}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        </div>
        <div className="border-2 border-dashed border-slate-300 dark:border-[#2d3048] rounded-xl overflow-hidden bg-white dark:bg-[#1a1d2e]">
          <canvas
            ref={canvasRef}
            width={700}
            height={250}
            className="w-full cursor-crosshair touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">Draw something to test the whiteboard.</p>
      </div>

      {/* System checks */}
      <div>
        <label className={labelClass}>System Checklist</label>
        <div className="space-y-2">
          {([
            { key: 'camera' as const, icon: Camera, label: 'Camera is working' },
            { key: 'microphone' as const, icon: Mic, label: 'Microphone is working' },
            { key: 'screenShare' as const, icon: MonitorUp, label: 'Screen share is available' },
          ]).map((check) => (
            <button
              key={check.key}
              type="button"
              onClick={() => setDemoChecks((d) => ({ ...d, [check.key]: !d[check.key] }))}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${
                demoChecks[check.key]
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800'
                  : 'bg-white dark:bg-[#252839] border-slate-200 dark:border-[#2d3048] hover:border-[#7C3AED]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  demoChecks[check.key]
                    ? 'bg-green-500 border-green-500'
                    : 'border-slate-300 dark:border-[#2d3048]'
                }`}
              >
                {demoChecks[check.key] && <Check className="w-3 h-3 text-white" />}
              </div>
              <check.icon className={`w-4 h-4 ${demoChecks[check.key] ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`} />
              <span className={`text-sm ${demoChecks[check.key] ? 'text-green-700 dark:text-green-400 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                {check.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 6: Complete ─────────────────────────────────────────────────────────

function StepComplete({
  profile,
  teaching,
  availability,
  onDashboard,
}: {
  profile: ProfileData
  teaching: TeachingData
  availability: AvailabilityData
  onDashboard: () => void
}) {
  return (
    <div className="space-y-8">
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-[#1E1B4B] dark:text-white mb-2">You are all set!</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Your profile is pending admin approval. You will be notified when approved.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] rounded-xl divide-y divide-slate-100 dark:divide-[#232536]">
        <SummaryRow label="Name" value={profile.fullName} />
        <SummaryRow label="Headline" value={profile.headline} />
        <SummaryRow label="Bio" value={profile.bio.length > 100 ? profile.bio.slice(0, 100) + '...' : profile.bio} />
        <SummaryRow
          label="Qualifications"
          value={profile.qualifications
            .filter((q) => q.degree)
            .map((q) => `${q.degree} — ${q.institution} (${q.year})`)
            .join(', ')}
        />
        <SummaryRow label="Subjects" value={teaching.subjects.join(', ')} />
        <SummaryRow label="Levels" value={teaching.levels.join(', ')} />
        <SummaryRow label="Exam Boards" value={teaching.examBoards.join(', ')} />
        <SummaryRow label="Rate" value={`${teaching.currency} ${teaching.hourlyRate}/hr`} />
        <SummaryRow label="Durations" value={teaching.lessonDurations.map((d) => `${d} min`).join(', ')} />
        <SummaryRow label="Availability" value={`${availability.slots.length} slots across the week`} />
        <SummaryRow label="Timezone" value={availability.timezone.replace(/_/g, ' ')} />
      </div>

      <div className="text-center">
        <button
          onClick={onDashboard}
          className="px-8 py-3 rounded-lg text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex px-5 py-3 gap-4">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-28 shrink-0">{label}</span>
      <span className="text-sm text-slate-800 dark:text-white">{value || '—'}</span>
    </div>
  )
}
