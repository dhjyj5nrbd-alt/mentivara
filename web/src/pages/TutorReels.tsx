import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import {
  Heart, Bookmark, Share2, MessageCircle, Play, Pause,
  Trophy, Send, Sparkles, ChevronRight, ChevronLeft,
} from 'lucide-react'
import type { TutorReel } from '../services/demo-data'
import { TUTOR_REELS } from '../services/demo-data'

const CATEGORIES = ['All', 'Maths', 'English', 'Biology', 'Chemistry', 'Physics', 'Exam Tips']

export default function TutorReels() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [reels, setReels] = useState<TutorReel[]>(() =>
    TUTOR_REELS.map((r) => ({ ...r }))
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredReels = activeCategory === 'All'
    ? reels
    : reels.filter((r) => r.subject === activeCategory)

  // Reset scroll when category changes
  useEffect(() => {
    setActiveIndex(0)
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }, [activeCategory])

  // Track which reel is in view
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const scrollLeft = container.scrollLeft
    const cardWidth = container.clientWidth
    const newIndex = Math.round(scrollLeft / cardWidth)
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < filteredReels.length) {
      setActiveIndex(newIndex)
    }
  }, [activeIndex, filteredReels.length])

  const scrollToReel = (index: number) => {
    if (!containerRef.current || index < 0 || index >= filteredReels.length) return
    const container = containerRef.current
    container.scrollTo({ left: index * container.clientWidth, behavior: 'smooth' })
    setActiveIndex(index)
  }

  const toggleLike = (id: number) => {
    setReels((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 }
          : r
      )
    )
  }

  const toggleSave = (id: number) => {
    setReels((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isSaved: !r.isSaved } : r
      )
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
        {/* Category filter bar */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#0f1117]/95 backdrop-blur-sm border-b border-slate-100 dark:border-[#232536] px-3 py-2.5">
          <div className="flex items-center justify-between mb-2">
            <div />
            <Link
              to="/competitions"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              Competitions
            </Link>
          </div>
          <div
            className="flex gap-2 overflow-x-auto pb-0.5"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Reels container — horizontal scroll */}
        {filteredReels.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Play className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No reels in this category yet</p>
              <p className="text-sm mt-1">Check back soon!</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 relative">
            <div
              ref={containerRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory h-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredReels.map((reel, index) => (
                <ReelCard
                  key={reel.id}
                  reel={reel}
                  isActive={index === activeIndex}
                  onLike={() => toggleLike(reel.id)}
                  onSave={() => toggleSave(reel.id)}
                />
              ))}
            </div>

            {/* Left/Right navigation arrows */}
            {activeIndex > 0 && (
              <button
                onClick={() => scrollToReel(activeIndex - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                aria-label="Previous reel"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {activeIndex < filteredReels.length - 1 && (
              <button
                onClick={() => scrollToReel(activeIndex + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                aria-label="Next reel"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {filteredReels.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToReel(i)}
                  className={`rounded-full transition-all ${
                    i === activeIndex ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'
                  }`}
                  aria-label={`Go to reel ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

// ── AI-generated content slides for each reel ─────────────

interface ContentSlide {
  type: 'title' | 'content' | 'formula' | 'tip' | 'diagram' | 'summary'
  heading?: string
  body: string
  highlight?: string
  emoji?: string
}

function getReelContent(reelId: number): ContentSlide[] {
  const contentMap: Record<number, ContentSlide[]> = {
    1: [ // Quadratic Equations
      { type: 'title', body: '3 Quick Tricks for Quadratic Equations', emoji: '🧮' },
      { type: 'content', heading: 'Trick 1: The Product-Sum Method', body: 'Find two numbers that multiply to give c and add to give b in ax² + bx + c', highlight: 'multiply → c,  add → b' },
      { type: 'formula', heading: 'Example', body: 'x² + 7x + 12 = 0', highlight: '3 × 4 = 12  and  3 + 4 = 7\nSo x = -3  or  x = -4' },
      { type: 'tip', heading: 'Trick 2: The Discriminant Shortcut', body: 'Calculate b² - 4ac first. If it\'s a perfect square, the quadratic factorises neatly!', highlight: 'b² - 4ac = 49 - 48 = 1  ✓ Perfect square' },
      { type: 'content', heading: 'Trick 3: Sketch the Parabola', body: 'The vertex is always at x = -b/2a. Plot it, find the roots, and visualise the answer.', highlight: 'Vertex: x = -b/(2a)' },
      { type: 'summary', body: '✓ Product-Sum for quick factorising\n✓ Discriminant to check if it factorises\n✓ Vertex formula for graphing', emoji: '🎯' },
    ],
    2: [ // Essay Structure
      { type: 'title', body: 'How to Structure a Perfect Essay', emoji: '✍️' },
      { type: 'content', heading: 'The PEEL Method', body: 'Every paragraph follows four steps that guarantee a clear, analytical structure.', highlight: 'P · E · E · L' },
      { type: 'content', heading: 'P — Point', body: 'Start with a clear topic sentence that directly answers the question. This is your argument.', highlight: '"Shakespeare presents Macbeth as increasingly paranoid..."' },
      { type: 'content', heading: 'E — Evidence', body: 'Support your point with a short, precise quotation or specific reference from the text.', highlight: '"Is this a dagger which I see before me?"' },
      { type: 'content', heading: 'E — Explain', body: 'Analyse the evidence. What technique is used? What effect does it create? Why does this matter?', highlight: 'The hallucination imagery reveals his guilt-driven descent into madness.' },
      { type: 'tip', heading: 'L — Link', body: 'Connect back to the question and transition to your next point. This shows the examiner your argument flows.', highlight: 'This links to the broader theme of unchecked ambition...' },
      { type: 'summary', body: '✓ Point — state your argument\n✓ Evidence — quote the text\n✓ Explain — analyse the technique\n✓ Link — connect to the question', emoji: '🏆' },
    ],
    3: [ // Photosynthesis
      { type: 'title', body: 'Photosynthesis in 60 Seconds', emoji: '🌿' },
      { type: 'formula', heading: 'The Equation', body: 'Word equation:', highlight: 'Carbon dioxide + Water  →  Glucose + Oxygen\n                              (light energy)' },
      { type: 'formula', heading: 'Chemical Formula', body: 'Balanced symbol equation:', highlight: '6CO₂ + 6H₂O  →  C₆H₁₂O₆ + 6O₂' },
      { type: 'diagram', heading: 'Where It Happens', body: 'Inside the chloroplasts in the palisade mesophyll cells of the leaf.', highlight: '☀️ Light hits leaf → absorbed by chlorophyll\n💧 Water travels up from roots via xylem\n💨 CO₂ enters through stomata' },
      { type: 'content', heading: 'Two Stages', body: 'Light-dependent reactions happen in the thylakoid membranes.\nLight-independent reactions (Calvin cycle) happen in the stroma.', highlight: 'Thylakoids → split water, make ATP\nStroma → fix CO₂, make glucose' },
      { type: 'tip', heading: 'Exam Tip', body: 'Limiting factors question? Always discuss light intensity, CO₂ concentration, and temperature. Draw the plateau graph!', highlight: 'Rate increases then plateaus — another factor is now limiting' },
      { type: 'summary', body: '✓ 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂\n✓ Chloroplasts, chlorophyll\n✓ Light-dependent + Calvin cycle\n✓ 3 limiting factors', emoji: '🧬' },
    ],
    4: [ // Newton's Laws
      { type: 'title', body: "Newton's Laws Made Simple", emoji: '🚀' },
      { type: 'content', heading: 'First Law — Inertia', body: 'An object stays at rest or in constant motion unless acted on by a resultant force.', highlight: 'No force = no change in motion\nA book on a desk stays there forever!' },
      { type: 'formula', heading: 'Second Law — F = ma', body: 'The acceleration of an object is proportional to the resultant force and inversely proportional to its mass.', highlight: 'Force (N) = mass (kg) × acceleration (m/s²)\n10N on 2kg → a = 5 m/s²' },
      { type: 'content', heading: 'Third Law — Action-Reaction', body: 'Every action has an equal and opposite reaction. The forces act on DIFFERENT objects.', highlight: 'You push wall → wall pushes you\nRocket pushes gas down → gas pushes rocket up' },
      { type: 'tip', heading: 'Common Exam Mistake', body: 'Students say "the forces cancel out" for Newton\'s 3rd Law. They DON\'T — they act on different objects!', highlight: '❌ "Forces cancel" — WRONG\n✅ "Forces act on different objects" — RIGHT' },
      { type: 'summary', body: '✓ 1st: No resultant force = no acceleration\n✓ 2nd: F = ma\n✓ 3rd: Equal & opposite on DIFFERENT objects', emoji: '⚡' },
    ],
    5: [ // Exam Day Checklist
      { type: 'title', body: 'Exam Day Checklist', emoji: '📋' },
      { type: 'content', heading: '1. Night Before', body: 'Pack your bag the night before. Pens (plural!), calculator, ruler, ID, water bottle.', highlight: 'Set TWO alarms. Lay out your clothes.' },
      { type: 'content', heading: '2. Morning Routine', body: 'Eat breakfast — your brain needs fuel. Avoid cramming — skim your summary sheet only.', highlight: 'Banana + water = perfect brain fuel 🍌' },
      { type: 'tip', heading: '3. At the Exam Hall', body: 'Arrive 15 minutes early. Use the reading time wisely — read ALL questions before writing.', highlight: 'Circle command words: Analyse, Evaluate, Compare, Explain' },
      { type: 'content', heading: '4. During the Exam', body: 'Time per mark = total time ÷ total marks. A 4-mark question gets 4 minutes. Stick to it!', highlight: '90 min exam, 90 marks = 1 min per mark' },
      { type: 'content', heading: '5. Final 10 Minutes', body: 'Stop writing. Re-read every answer. Check units, significant figures, and spelling of key terms.', highlight: 'This step alone can gain you 5-10 extra marks!' },
      { type: 'summary', body: '✓ Pack bag night before\n✓ Eat breakfast, don\'t cram\n✓ Arrive early, read all questions\n✓ Time per mark rule\n✓ Review in final 10 mins', emoji: '🎓' },
    ],
    6: [ // Competition — Quadratic
      { type: 'title', body: 'Challenge: Solve x² + 5x + 6 = 0', emoji: '🏆' },
      { type: 'content', heading: 'Step 1: Identify a, b, c', body: 'In the equation x² + 5x + 6 = 0:', highlight: 'a = 1,  b = 5,  c = 6' },
      { type: 'formula', heading: 'Step 2: Find Factor Pairs', body: 'We need two numbers that:', highlight: 'Multiply to give 6: (1,6) (2,3)\nAdd to give 5: 2 + 3 = 5  ✓' },
      { type: 'formula', heading: 'Step 3: Factorise', body: 'Using our factor pair (2, 3):', highlight: '(x + 2)(x + 3) = 0\nx = -2  or  x = -3' },
      { type: 'tip', heading: 'Check Your Answer!', body: 'Substitute back in: (-2)² + 5(-2) + 6 = 4 - 10 + 6 = 0 ✓', highlight: 'Always verify by substituting!' },
      { type: 'summary', body: 'Drop your answer below for 50 XP! 🎯', emoji: '💎' },
    ],
    7: [ // Balancing Chemical Equations
      { type: 'title', body: 'Balancing Chemical Equations', emoji: '⚗️' },
      { type: 'content', heading: 'The Golden Rule', body: 'Atoms in = Atoms out. You can only change the BIG numbers in front, never the small subscript numbers.', highlight: 'Change coefficients ✓\nChange subscripts ✗' },
      { type: 'formula', heading: 'Example: Combustion of Methane', body: 'Unbalanced:', highlight: 'CH₄ + O₂ → CO₂ + H₂O' },
      { type: 'formula', heading: 'Step-by-Step', body: 'Count atoms on each side:', highlight: 'C: 1=1 ✓   H: 4≠2 ✗   O: 2≠3 ✗\nFix H: CH₄ + O₂ → CO₂ + 2H₂O\nFix O: CH₄ + 2O₂ → CO₂ + 2H₂O ✓' },
      { type: 'tip', heading: 'Pro Tip: CHOP Order', body: 'Balance in this order for most equations: Carbon → Hydrogen → Oxygen → everything else (Phosphorus, etc.)', highlight: 'C → H → O → P\n"CHOP" your way through!' },
      { type: 'summary', body: '✓ Atoms in = Atoms out\n✓ Only change coefficients\n✓ Use CHOP order\n✓ Always double-check counts', emoji: '🔬' },
    ],
    8: [ // Grammar Mistakes
      { type: 'title', body: '5 Common Grammar Mistakes', emoji: '📝' },
      { type: 'content', heading: '1. Their / There / They\'re', body: 'Their = belonging to them. There = a place. They\'re = they are.', highlight: '"They\'re putting their bags over there."' },
      { type: 'content', heading: '2. Its / It\'s', body: 'Its = belonging to it (no apostrophe!). It\'s = it is / it has.', highlight: '"It\'s lost its charm." — both correct!' },
      { type: 'content', heading: '3. Effect / Affect', body: 'Effect = noun (the result). Affect = verb (to influence).', highlight: '"The effect of rain affects the harvest."' },
      { type: 'tip', heading: '4. Could Of → Could Have', body: '"Could of" is ALWAYS wrong. You mean "could have" or "could\'ve".', highlight: '❌ "I could of done better"\n✅ "I could have done better"' },
      { type: 'content', heading: '5. Less / Fewer', body: 'Fewer = countable things. Less = uncountable things.', highlight: '"Fewer mistakes, less confusion"' },
      { type: 'summary', body: '✓ Their/there/they\'re\n✓ Its vs it\'s\n✓ Effect vs affect\n✓ Could HAVE not could OF\n✓ Fewer vs less', emoji: '💯' },
    ],
  }
  return contentMap[reelId] || [{ type: 'title', body: 'Content coming soon!', emoji: '📚' }]
}

// ── Reel Card ──────────────────────────────────────────────

interface ReelCardProps {
  reel: TutorReel
  isActive: boolean
  onLike: () => void
  onSave: () => void
}

function ReelCard({ reel, isActive, onLike, onSave }: ReelCardProps) {
  const [likeAnim, setLikeAnim] = useState(false)
  const [saveAnim, setSaveAnim] = useState(false)
  const [competitionInput, setCompetitionInput] = useState('')
  const [competitionSubmitted, setCompetitionSubmitted] = useState(false)
  const [competitionCorrect, setCompetitionCorrect] = useState<boolean | null>(null)
  const [currentSlide, setCurrentSlide] = useState(-1) // -1 = thumbnail view
  const [isPlaying, setIsPlaying] = useState(false)
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const slides = getReelContent(reel.id)
  const isThumbnail = currentSlide === -1

  // Auto-advance slides when playing
  useEffect(() => {
    if (isPlaying && isActive && !isThumbnail) {
      playTimerRef.current = setInterval(() => {
        setCurrentSlide((prev) => {
          if (prev >= slides.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 4000)
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current)
    }
  }, [isPlaying, isActive, isThumbnail, slides.length])

  // Reset when not active
  useEffect(() => {
    if (!isActive) {
      setIsPlaying(false)
      setCurrentSlide(-1)
    }
  }, [isActive])

  const startPlaying = () => {
    setCurrentSlide(0)
    setIsPlaying(true)
  }

  const togglePlay = () => {
    if (isThumbnail) {
      startPlaying()
      return
    }
    if (isPlaying) {
      setIsPlaying(false)
    } else {
      if (currentSlide >= slides.length - 1) setCurrentSlide(0)
      setIsPlaying(true)
    }
  }

  const handleLike = () => {
    onLike()
    setLikeAnim(true)
    setTimeout(() => setLikeAnim(false), 300)
  }

  const handleSave = () => {
    onSave()
    setSaveAnim(true)
    setTimeout(() => setSaveAnim(false), 400)
  }

  const handleCompetitionSubmit = () => {
    if (!competitionInput.trim()) return
    setCompetitionSubmitted(true)
    const normalizedInput = competitionInput.replace(/\s/g, '').toLowerCase()
    const isCorrect =
      normalizedInput.includes('-2') && normalizedInput.includes('-3')
    setCompetitionCorrect(isCorrect)
  }

  const formatCount = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    return n.toString()
  }

  const slide = !isThumbnail ? (slides[currentSlide] || slides[0]) : null

  return (
    <div className="snap-start shrink-0 w-full h-full relative flex">
      {/* Background — teacher photo for thumbnail, gradient for content */}
      {isThumbnail ? (
        <>
          {/* Teacher photo background */}
          <div className="absolute inset-0">
            <img
              src={reel.tutorPhoto}
              alt={reel.tutorName}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            {/* Fallback gradient if image fails */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${reel.gradientFrom} 0%, ${reel.gradientTo} 100%)`,
                zIndex: -1,
              }}
            />
          </div>
          {/* Dark gradient overlay for text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: reel.gradientVia
                ? `linear-gradient(135deg, ${reel.gradientFrom} 0%, ${reel.gradientVia} 50%, ${reel.gradientTo} 100%)`
                : `linear-gradient(135deg, ${reel.gradientFrom} 0%, ${reel.gradientTo} 100%)`,
            }}
          />
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          <div className="absolute inset-0 bg-black/30" />
        </>
      )}

      {/* ── THUMBNAIL VIEW ── */}
      {isThumbnail ? (
        <>
          {/* Competition badge */}
          {reel.isCompetition && (
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              <Trophy className="w-3.5 h-3.5" />
              Challenge
              {reel.xpReward && (
                <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">+{reel.xpReward} XP</span>
              )}
            </div>
          )}

          {/* Duration badge */}
          <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium">
            {reel.duration}
          </div>

          {/* Center play button */}
          <button
            onClick={startPlaying}
            className="absolute inset-0 z-10 flex items-center justify-center group"
            aria-label={`Play ${reel.title}`}
          >
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 shadow-2xl">
              <Play className="w-10 h-10 text-white fill-white ml-1" />
            </div>
          </button>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
            {/* Tutor info */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={reel.tutorAvatar}
                alt={reel.tutorName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/50 shadow-lg"
                onError={(e) => {
                  const el = e.target as HTMLImageElement
                  el.style.display = 'none'
                }}
              />
              <div>
                <p className="text-white font-bold text-base">{reel.tutorName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-white/90 text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">{reel.subject}</span>
                  <span className="text-white/70 text-xs">{reel.level}</span>
                </div>
              </div>
            </div>

            {/* Title & description */}
            <h3 className="text-white font-bold text-xl leading-tight mb-1.5">{reel.title}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{reel.description}</p>

            {/* Stats row */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-white/60 text-xs">
                <Heart className="w-3.5 h-3.5" />
                {formatCount(reel.likes)}
              </div>
              <div className="flex items-center gap-1.5 text-white/60 text-xs">
                <MessageCircle className="w-3.5 h-3.5" />
                {formatCount(reel.comments)}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ── CONTENT SLIDE VIEW ── */
        <>
          {/* Slide progress bar at top */}
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-3 pt-3">
            {slides.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/20">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-white"
                  style={{ width: i <= currentSlide ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>

          {/* Tutor photo + name in top-left */}
          <div className="absolute top-8 left-3 z-20 flex items-center gap-2">
            <img
              src={reel.tutorAvatar}
              alt={reel.tutorName}
              className="w-8 h-8 rounded-full object-cover border border-white/40"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span className="text-white text-sm font-medium">{reel.tutorName}</span>
          </div>

          {/* Main content area — the AI-generated slide */}
          <div className="absolute inset-0 flex items-center justify-center z-10 px-6 pt-16 pb-32">
            <div className="w-full max-w-md" key={currentSlide}>
              {slide?.type === 'title' ? (
                <div className="text-center">
                  {slide.emoji && <div className="text-5xl mb-4">{slide.emoji}</div>}
                  <h2 className="text-white text-2xl font-bold leading-tight">{slide.body}</h2>
                </div>
              ) : slide?.type === 'formula' || slide?.type === 'diagram' ? (
                <div>
                  {slide.heading && <h3 className="text-white/80 text-sm font-medium uppercase tracking-wider mb-3">{slide.heading}</h3>}
                  <p className="text-white text-lg mb-4">{slide.body}</p>
                  {slide.highlight && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <pre className="text-white font-mono text-base leading-relaxed whitespace-pre-wrap">{slide.highlight}</pre>
                    </div>
                  )}
                </div>
              ) : slide?.type === 'tip' ? (
                <div>
                  {slide.heading && (
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <h3 className="text-amber-300 text-sm font-bold uppercase tracking-wider">{slide.heading}</h3>
                    </div>
                  )}
                  <p className="text-white text-lg mb-4">{slide.body}</p>
                  {slide.highlight && (
                    <div className="bg-amber-500/15 backdrop-blur-sm rounded-xl p-4 border border-amber-400/30">
                      <pre className="text-amber-100 font-mono text-base leading-relaxed whitespace-pre-wrap">{slide.highlight}</pre>
                    </div>
                  )}
                </div>
              ) : slide?.type === 'summary' ? (
                <div className="text-center">
                  {slide.emoji && <div className="text-4xl mb-4">{slide.emoji}</div>}
                  <h3 className="text-white font-bold text-lg mb-4">Key Takeaways</h3>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 text-left">
                    <pre className="text-white text-base leading-relaxed whitespace-pre-wrap">{slide.body}</pre>
                  </div>
                </div>
              ) : (
                <div>
                  {slide?.heading && <h3 className="text-white/80 text-sm font-medium uppercase tracking-wider mb-3">{slide.heading}</h3>}
                  <p className="text-white text-lg leading-relaxed mb-4">{slide?.body}</p>
                  {slide?.highlight && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <p className="text-white font-medium text-base italic">{slide.highlight}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Slide navigation — tap left/right */}
          <button
            className="absolute left-0 top-14 bottom-32 w-1/3 z-15"
            onClick={() => { setIsPlaying(false); setCurrentSlide(Math.max(0, currentSlide - 1)) }}
            aria-label="Previous slide"
          />
          <button
            className="absolute right-16 top-14 bottom-32 w-1/3 z-15"
            onClick={() => { setIsPlaying(false); setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1)) }}
            aria-label="Next slide"
          />

          {/* Play/Pause + Back buttons */}
          <div className="absolute top-8 right-3 z-20 flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              onClick={() => { setIsPlaying(false); setCurrentSlide(-1) }}
              className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-colors text-xs font-bold"
              aria-label="Back to thumbnail"
            >
              ✕
            </button>
          </div>

          {/* Competition badge */}
          {reel.isCompetition && (
            <div className="absolute top-16 left-3 z-20 flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              <Trophy className="w-3.5 h-3.5" />
              Challenge
              {reel.xpReward && (
                <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">+{reel.xpReward} XP</span>
              )}
            </div>
          )}

          {/* Right side action bar */}
          <div className="absolute right-3 bottom-36 z-20 flex flex-col items-center gap-5">
            <button onClick={handleLike} className="flex flex-col items-center gap-1" aria-label={reel.isLiked ? 'Unlike' : 'Like'}>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                reel.isLiked ? 'bg-red-500/20' : 'bg-white/10 backdrop-blur-sm'
              } ${likeAnim ? 'scale-125' : 'scale-100'}`}
              style={{ transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                <Heart className={`w-6 h-6 transition-colors ${reel.isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
              </div>
              <span className="text-white text-xs font-medium">{formatCount(reel.likes)}</span>
            </button>

            <div className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs font-medium">{formatCount(reel.comments)}</span>
            </div>

            <button onClick={handleSave} className="flex flex-col items-center gap-1" aria-label={reel.isSaved ? 'Unsave' : 'Save'}>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                reel.isSaved ? 'bg-[#7C3AED]/30' : 'bg-white/10 backdrop-blur-sm'
              } ${saveAnim ? 'scale-110 -translate-y-1' : 'scale-100 translate-y-0'}`}
              style={{ transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                <Bookmark className={`w-6 h-6 transition-colors ${reel.isSaved ? 'text-[#7C3AED] fill-[#7C3AED]' : 'text-white'}`} />
              </div>
              <span className="text-white text-xs font-medium">Save</span>
            </button>

            <button className="flex flex-col items-center gap-1" aria-label="Share reel">
              <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs font-medium">Share</span>
            </button>
          </div>

          {/* Bottom — title + competition */}
          <div className="absolute bottom-0 left-0 right-16 p-4 z-20">
            <h3 className="text-white font-bold text-base leading-tight mb-1">{reel.title}</h3>
            <p className="text-white/60 text-xs">{reel.description}</p>

            {reel.isCompetition && (
              <div className="mt-3">
                {!competitionSubmitted ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={competitionInput}
                      onChange={(e) => setCompetitionInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCompetitionSubmit()}
                      placeholder="Type your answer..."
                      className="flex-1 bg-white/15 backdrop-blur-sm text-white placeholder-white/50 px-4 py-2.5 rounded-full text-sm border border-white/20 focus:outline-none focus:border-white/50"
                    />
                    <button
                      onClick={handleCompetitionSubmit}
                      className="w-10 h-10 rounded-full bg-[#7C3AED] text-white flex items-center justify-center hover:bg-[#6D28D9] transition-colors shrink-0"
                      aria-label="Submit answer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium ${
                    competitionCorrect
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                      : 'bg-red-500/20 text-red-200 border border-red-400/30'
                  }`}>
                    <Sparkles className="w-4 h-4 shrink-0" />
                    {competitionCorrect
                      ? `Correct! +${reel.xpReward} XP earned!`
                      : 'Not quite. Watch the reel for hints!'
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
