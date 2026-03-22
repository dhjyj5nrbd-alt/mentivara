import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import {
  ChevronDown, ChevronRight, CheckCircle2, Clock, Circle,
  BookOpen, Target, HelpCircle, Search, Upload, Play,
  Beaker,
} from 'lucide-react'

/* ────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────── */
interface Topic {
  id: string
  name: string
  status: 'mastered' | 'in_progress' | 'not_started'
  mastery: number
  keyConcepts: string[]
  relatedLessons: { title: string; date: string }[]
  hoursStudied: number
}

interface Chapter {
  id: number
  title: string
  topics: Topic[]
}

/* ────────────────────────────────────────────────────────────
   Demo Data — IGCSE Biology CIE (0610)
   ──────────────────────────────────────────────────────────── */
function t(
  id: string, name: string, status: Topic['status'], mastery: number,
  keyConcepts: string[], relatedLessons: { title: string; date: string }[] = [],
  hoursStudied = 0,
): Topic {
  return { id, name, status, mastery, keyConcepts, relatedLessons, hoursStudied }
}

const SYLLABUS_CHAPTERS: Chapter[] = [
  {
    id: 1, title: 'Characteristics and classification of living organisms', topics: [
      t('1.1', 'Characteristics of living organisms', 'mastered', 94,
        ['MRS GREN mnemonic', 'Movement, respiration, sensitivity', 'Growth, reproduction, excretion, nutrition'],
        [{ title: 'Intro to Biology', date: '12 Jan 2026' }, { title: 'Living vs Non-living', date: '15 Jan 2026' }], 3.5),
      t('1.2', 'Concept and use of a classification system', 'mastered', 88,
        ['Five kingdoms', 'Binomial nomenclature', 'Dichotomous keys', 'Species definition'],
        [{ title: 'Classification Systems', date: '18 Jan 2026' }], 2.5),
      t('1.3', 'Features of organisms', 'mastered', 85,
        ['Vertebrate vs invertebrate', 'Plant vs animal cells', 'Fungi, bacteria, protoctists'],
        [{ title: 'Kingdoms of Life', date: '22 Jan 2026' }], 2),
    ],
  },
  {
    id: 2, title: 'Organisation of the organism', topics: [
      t('2.1', 'Cell structure and organisation', 'mastered', 96,
        ['Animal and plant cell structures', 'Nucleus, cytoplasm, cell membrane', 'Cell wall, chloroplasts, vacuole', 'Specialised cells'],
        [{ title: 'Cell Biology Foundations', date: '25 Jan 2026' }, { title: 'Microscopy Lab', date: '28 Jan 2026' }], 4),
      t('2.2', 'Levels of organisation', 'mastered', 91,
        ['Cell, tissue, organ, system', 'Organ systems in humans', 'Emergent properties'],
        [{ title: 'Organisation of Life', date: '1 Feb 2026' }], 2),
    ],
  },
  {
    id: 3, title: 'Movement into and out of cells', topics: [
      t('3.1', 'Diffusion', 'mastered', 89,
        ['Net movement down concentration gradient', 'Factors affecting rate', 'Importance in gas exchange'],
        [{ title: 'Diffusion & Osmosis', date: '5 Feb 2026' }], 2.5),
      t('3.2', 'Osmosis', 'mastered', 84,
        ['Water potential', 'Partially permeable membranes', 'Turgid, flaccid, plasmolysed cells'],
        [{ title: 'Diffusion & Osmosis', date: '5 Feb 2026' }, { title: 'Osmosis Practical', date: '8 Feb 2026' }], 3),
      t('3.3', 'Active transport', 'mastered', 80,
        ['Movement against concentration gradient', 'Requires energy from respiration', 'Root hair cells example'],
        [{ title: 'Active Transport', date: '10 Feb 2026' }], 2),
    ],
  },
  {
    id: 4, title: 'Biological molecules', topics: [
      t('4.1', 'Biological molecules', 'mastered', 82,
        ['Carbohydrates, proteins, lipids', 'Chemical tests (Benedict\'s, Biuret, iodine)', 'Structure and function of each group'],
        [{ title: 'Food Tests Practical', date: '14 Feb 2026' }], 3),
    ],
  },
  {
    id: 5, title: 'Enzymes', topics: [
      t('5.1', 'Enzyme action', 'mastered', 81,
        ['Lock and key model', 'Active site specificity', 'Biological catalysts'],
        [{ title: 'Enzyme Action', date: '18 Feb 2026' }], 2.5),
      t('5.2', 'Factors affecting enzyme action', 'mastered', 78,
        ['Temperature and pH effects', 'Denaturation', 'Optimum conditions'],
        [{ title: 'Enzyme Experiments', date: '20 Feb 2026' }], 2.5),
    ],
  },
  {
    id: 6, title: 'Plant nutrition', topics: [
      t('6.1', 'Photosynthesis', 'in_progress', 65,
        ['Light-dependent reactions', 'Word and balanced equations', 'Limiting factors', 'Importance of photosynthesis'],
        [{ title: 'Photosynthesis Intro', date: '25 Feb 2026' }], 2),
      t('6.2', 'Leaf structure', 'in_progress', 55,
        ['Palisade mesophyll', 'Spongy mesophyll', 'Stomata and guard cells', 'Adaptations for photosynthesis'],
        [], 1),
    ],
  },
  {
    id: 7, title: 'Human nutrition', topics: [
      t('7.1', 'Diet', 'in_progress', 60,
        ['Balanced diet components', 'Vitamins and minerals', 'Malnutrition and deficiency diseases'],
        [{ title: 'Human Nutrition', date: '1 Mar 2026' }], 1.5),
      t('7.2', 'Digestive system', 'in_progress', 48,
        ['Alimentary canal structure', 'Mechanical and chemical digestion', 'Enzyme roles in digestion'],
        [], 1),
      t('7.3', 'Absorption', 'in_progress', 35,
        ['Villi structure and function', 'Adaptations for absorption', 'Role of the liver'],
        [], 0.5),
    ],
  },
  {
    id: 8, title: 'Transport in plants', topics: [
      t('8.1', 'Xylem and phloem', 'in_progress', 45,
        ['Xylem structure and function', 'Phloem structure and function', 'Differences between the two'],
        [], 1),
      t('8.2', 'Water uptake', 'in_progress', 38,
        ['Root hair cell adaptations', 'Osmosis in roots', 'Water movement through plant'],
        [], 0.5),
      t('8.3', 'Transpiration', 'in_progress', 30,
        ['Transpiration stream', 'Factors affecting transpiration rate', 'Potometer experiments'],
        [], 0.5),
    ],
  },
  {
    id: 9, title: 'Transport in animals', topics: [
      t('9.1', 'Circulatory system', 'in_progress', 42,
        ['Double circulatory system', 'Pulmonary and systemic circulation', 'Open vs closed systems'],
        [], 1),
      t('9.2', 'Heart', 'in_progress', 35,
        ['Heart structure and chambers', 'Cardiac cycle', 'Coronary arteries'],
        [], 0.5),
      t('9.3', 'Blood vessels', 'in_progress', 32,
        ['Arteries, veins, capillaries', 'Structure related to function', 'Pressure changes'],
        [], 0.5),
      t('9.4', 'Blood', 'not_started', 0,
        ['Red blood cells', 'White blood cells and platelets', 'Plasma functions'],
        [], 0),
    ],
  },
  {
    id: 10, title: 'Diseases and immunity', topics: [
      t('10.1', 'Diseases and immunity', 'not_started', 0,
        ['Pathogens: bacteria, viruses', 'Body defence mechanisms', 'Immune response and antibodies', 'Vaccination'],
        [], 0),
    ],
  },
  {
    id: 11, title: 'Gas exchange in humans', topics: [
      t('11.1', 'Gas exchange', 'not_started', 0,
        ['Alveoli structure', 'Gas exchange surfaces', 'Adaptations for efficient exchange'],
        [], 0),
      t('11.2', 'Breathing', 'not_started', 0,
        ['Ventilation mechanism', 'Intercostal muscles and diaphragm', 'Inspiration and expiration'],
        [], 0),
    ],
  },
  {
    id: 12, title: 'Respiration', topics: [
      t('12.1', 'Aerobic respiration', 'not_started', 0,
        ['Word and symbol equations', 'Role of mitochondria', 'Energy release'],
        [], 0),
      t('12.2', 'Anaerobic respiration', 'not_started', 0,
        ['Fermentation in yeast', 'Oxygen debt in muscles', 'Comparison with aerobic'],
        [], 0),
    ],
  },
  {
    id: 13, title: 'Excretion in humans', topics: [
      t('13.1', 'Excretion', 'not_started', 0,
        ['Kidney structure', 'Ultrafiltration and reabsorption', 'Urea formation in liver'],
        [], 0),
    ],
  },
  {
    id: 14, title: 'Coordination and response', topics: [
      t('14.1', 'Nervous system', 'not_started', 0,
        ['Central and peripheral nervous system', 'Neurones and synapses', 'Reflex arcs'],
        [], 0),
      t('14.2', 'Sense organs', 'not_started', 0,
        ['Eye structure and function', 'Accommodation', 'Pupil reflex'],
        [], 0),
      t('14.3', 'Hormones', 'not_started', 0,
        ['Endocrine glands', 'Adrenaline and insulin', 'Hormonal vs nervous control'],
        [], 0),
      t('14.4', 'Homeostasis', 'not_started', 0,
        ['Thermoregulation', 'Blood glucose regulation', 'Negative feedback'],
        [], 0),
    ],
  },
  {
    id: 15, title: 'Drugs', topics: [
      t('15.1', 'Drugs', 'not_started', 0,
        ['Medicinal and recreational drugs', 'Antibiotics and resistance', 'Effects of alcohol and tobacco'],
        [], 0),
    ],
  },
  {
    id: 16, title: 'Reproduction', topics: [
      t('16.1', 'Asexual reproduction', 'not_started', 0,
        ['Binary fission', 'Cloning', 'Advantages and disadvantages'],
        [], 0),
      t('16.2', 'Sexual reproduction', 'not_started', 0,
        ['Gametes and fertilisation', 'Genetic variation', 'Advantages and disadvantages'],
        [], 0),
      t('16.3', 'Sexual reproduction in plants', 'not_started', 0,
        ['Flower structure', 'Pollination and fertilisation', 'Seed dispersal and germination'],
        [], 0),
      t('16.4', 'Sexual reproduction in humans', 'not_started', 0,
        ['Reproductive organs', 'Menstrual cycle', 'Fertilisation and development', 'Birth control'],
        [], 0),
    ],
  },
  {
    id: 17, title: 'Inheritance', topics: [
      t('17.1', 'Chromosomes, genes and proteins', 'not_started', 0,
        ['DNA structure', 'Genes and alleles', 'Protein synthesis basics'],
        [], 0),
      t('17.2', 'Mitosis', 'not_started', 0,
        ['Stages of mitosis', 'Role in growth and repair', 'Chromosome number maintained'],
        [], 0),
      t('17.3', 'Meiosis', 'not_started', 0,
        ['Reduction division', 'Genetic variation', 'Gamete formation'],
        [], 0),
      t('17.4', 'Monohybrid inheritance', 'not_started', 0,
        ['Dominant and recessive alleles', 'Punnett squares', 'Genotype and phenotype ratios'],
        [], 0),
    ],
  },
  {
    id: 18, title: 'Variation and selection', topics: [
      t('18.1', 'Variation', 'not_started', 0,
        ['Continuous and discontinuous', 'Genetic and environmental causes', 'Mutation'],
        [], 0),
      t('18.2', 'Adaptive features', 'not_started', 0,
        ['Structural adaptations', 'Behavioural adaptations', 'Examples from different habitats'],
        [], 0),
      t('18.3', 'Selection', 'not_started', 0,
        ['Natural selection', 'Selective breeding', 'Evolution'],
        [], 0),
    ],
  },
  {
    id: 19, title: 'Organisms and their environment', topics: [
      t('19.1', 'Energy flow', 'not_started', 0,
        ['Trophic levels', 'Energy transfer efficiency', 'Pyramids of energy'],
        [], 0),
      t('19.2', 'Food chains and food webs', 'not_started', 0,
        ['Producers, consumers, decomposers', 'Interdependence', 'Effects of population changes'],
        [], 0),
      t('19.3', 'Nutrient cycles', 'not_started', 0,
        ['Carbon cycle', 'Water cycle', 'Nitrogen cycle basics'],
        [], 0),
      t('19.4', 'Populations', 'not_started', 0,
        ['Population growth curves', 'Limiting factors', 'Predator-prey relationships'],
        [], 0),
    ],
  },
  {
    id: 20, title: 'Human influences on ecosystems', topics: [
      t('20.1', 'Food supply', 'not_started', 0,
        ['Intensive farming', 'Fertilisers and pesticides', 'Biological control'],
        [], 0),
      t('20.2', 'Habitat destruction', 'not_started', 0,
        ['Deforestation', 'Loss of biodiversity', 'Endangered species'],
        [], 0),
      t('20.3', 'Pollution', 'not_started', 0,
        ['Water and air pollution', 'Acid rain', 'Greenhouse effect and global warming'],
        [], 0),
      t('20.4', 'Conservation', 'not_started', 0,
        ['Sustainable development', 'Conservation programmes', 'Recycling'],
        [], 0),
    ],
  },
]

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */
type FilterType = 'all' | 'mastered' | 'in_progress' | 'not_started'

function getAllTopics() {
  return SYLLABUS_CHAPTERS.flatMap((c) => c.topics)
}

function getOverallStats() {
  const all = getAllTopics()
  const total = all.length
  const mastered = all.filter((t) => t.status === 'mastered').length
  const inProgress = all.filter((t) => t.status === 'in_progress').length
  const totalHours = Math.round(all.reduce((s, t) => s + t.hoursStudied, 0))
  const pct = total > 0 ? Math.round(((mastered + inProgress * 0.4) / total) * 100) : 0
  return { total, mastered, inProgress, totalHours, pct, chaptersCompleted: SYLLABUS_CHAPTERS.filter(c => c.topics.every(t => t.status === 'mastered')).length }
}

function getChapterProgress(chapter: Chapter) {
  const total = chapter.topics.length
  const done = chapter.topics.filter((t) => t.status === 'mastered').length
  const avgMastery = total > 0 ? Math.round(chapter.topics.reduce((s, t) => s + t.mastery, 0) / total) : 0
  const allMastered = chapter.topics.every((t) => t.status === 'mastered')
  const anyStarted = chapter.topics.some((t) => t.status !== 'not_started')
  const status: Topic['status'] = allMastered ? 'mastered' : anyStarted ? 'in_progress' : 'not_started'
  return { total, done, avgMastery, status }
}

function statusIcon(status: Topic['status'], size = 'w-4 h-4') {
  if (status === 'mastered') return <CheckCircle2 className={`${size} text-emerald-500 shrink-0`} />
  if (status === 'in_progress') return <Clock className={`${size} text-amber-500 shrink-0`} />
  return <Circle className={`${size} text-slate-300 dark:text-slate-600 shrink-0`} />
}

function statusLabel(status: Topic['status']) {
  if (status === 'mastered') return <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Mastered</span>
  if (status === 'in_progress') return <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">In Progress</span>
  return <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Not Started</span>
}

/* ────────────────────────────────────────────────────────────
   Circular Progress
   ──────────────────────────────────────────────────────────── */
function CircularProgress({ pct, size = 80 }: { pct: number; size?: number }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct >= 80 ? '#10b981' : pct >= 40 ? '#f59e0b' : pct > 0 ? '#ef4444' : '#94a3b8'
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth="5" fill="none"
          className="text-slate-200 dark:text-[#252839]" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="5" fill="none"
          strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color }}>
        {pct}%
      </span>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Main Page
   ──────────────────────────────────────────────────────────── */
export default function Curriculum() {
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(() => {
    // Auto-expand first in-progress chapter
    const first = SYLLABUS_CHAPTERS.find(c => getChapterProgress(c).status === 'in_progress')
    return new Set(first ? [first.id] : [])
  })
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  const stats = useMemo(() => getOverallStats(), [])

  const toggleChapter = (id: number) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectTopic = (topic: Topic, chapterId: number) => {
    setSelectedTopic(topic)
    setSelectedChapterId(chapterId)
  }

  // Filtering
  const filteredChapters = useMemo(() => {
    return SYLLABUS_CHAPTERS.map((chapter) => {
      let topics = chapter.topics
      if (filter !== 'all') topics = topics.filter((t) => t.status === filter)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        topics = topics.filter(
          (t) => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || chapter.title.toLowerCase().includes(q)
        )
      }
      return { ...chapter, topics }
    }).filter((c) => c.topics.length > 0)
  }, [filter, searchQuery])

  const selectedChapter = selectedChapterId
    ? SYLLABUS_CHAPTERS.find((c) => c.id === selectedChapterId)
    : null

  return (
    <Layout>
      <div className="px-4 sm:px-5 py-3 h-[calc(100vh-56px)] md:h-screen flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl font-bold text-[#1E1B4B] dark:text-white">My Curriculum</h1>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED] dark:bg-[#7C3AED]/20 dark:text-[#A78BFA] whitespace-nowrap">
                IGCSE Biology — CIE 0610
              </span>
            </div>
          </div>
          <button
            disabled
            title="Coming soon — tutors can upload custom syllabi"
            className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#232536] text-slate-400 dark:text-slate-500 cursor-not-allowed bg-white dark:bg-[#1a1d2e] shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Syllabus
          </button>
        </div>

        {/* ── Stats bar ── */}
        <div className="flex items-center gap-3 mb-3 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{stats.pct}% complete</span>
              <span className="text-[11px] text-slate-400">
                {stats.chaptersCompleted}/20 chapters completed
              </span>
              <span className="text-[11px] text-slate-300 dark:text-slate-600">|</span>
              <span className="text-[11px] text-slate-400">{stats.mastered} topics mastered</span>
              <span className="text-[11px] text-slate-300 dark:text-slate-600">|</span>
              <span className="text-[11px] text-slate-400">{stats.totalHours} hours studied</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-[#252839] rounded-full overflow-hidden">
              <div
                className="h-2 rounded-full bg-[#7C3AED] transition-all duration-500"
                style={{ width: `${stats.pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Search & Filters ── */}
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#1a1d2e] text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
            />
          </div>
          <div className="flex gap-1">
            {([['all', 'All'], ['mastered', 'Mastered'], ['in_progress', 'In Progress'], ['not_started', 'Not Started']] as [FilterType, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                  filter === key
                    ? 'bg-[#7C3AED] text-white'
                    : 'bg-white dark:bg-[#1a1d2e] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#232536] hover:border-[#7C3AED]/40'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex gap-3 flex-1 min-h-0 overflow-hidden">
          {/* Left: Chapter list */}
          <div className="w-[60%] overflow-y-auto pr-1 space-y-1.5" style={{ scrollbarWidth: 'thin' }}>
            {filteredChapters.map((chapter) => {
              const prog = getChapterProgress(SYLLABUS_CHAPTERS.find(c => c.id === chapter.id)!)
              const isExpanded = expandedChapters.has(chapter.id)

              return (
                <div key={chapter.id} className="border border-slate-200 dark:border-[#232536] rounded-lg overflow-hidden bg-white dark:bg-[#1a1d2e]">
                  {/* Chapter header */}
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-[#1e2132] transition-colors"
                  >
                    {isExpanded
                      ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    }
                    {statusIcon(prog.status, 'w-3.5 h-3.5')}
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 shrink-0">
                      {chapter.id}.
                    </span>
                    <span className="text-[13px] text-slate-700 dark:text-slate-300 truncate flex-1">{chapter.title}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">{prog.done}/{prog.total}</span>
                      <div className="w-14 h-1.5 bg-slate-200 dark:bg-[#252839] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            prog.avgMastery >= 80 ? 'bg-emerald-500' : prog.avgMastery >= 40 ? 'bg-amber-500' : prog.avgMastery > 0 ? 'bg-red-400' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                          style={{ width: `${prog.avgMastery}%` }}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Subtopics */}
                  {isExpanded && (
                    <div className="px-3 pb-2 space-y-0.5">
                      {chapter.topics.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => selectTopic(topic, chapter.id)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                            selectedTopic?.id === topic.id
                              ? 'bg-[#EDE9FE] dark:bg-[#7C3AED]/20'
                              : 'hover:bg-slate-50 dark:hover:bg-[#252839]'
                          }`}
                        >
                          {statusIcon(topic.status, 'w-3.5 h-3.5')}
                          <span className="text-[12px] text-slate-600 dark:text-slate-400 shrink-0 w-7">{topic.id}</span>
                          <span className="text-[12px] text-slate-700 dark:text-slate-300 flex-1 truncate">{topic.name}</span>
                          <span className={`text-[11px] font-semibold shrink-0 ${
                            topic.mastery >= 80 ? 'text-emerald-600' : topic.mastery >= 40 ? 'text-amber-600' : topic.mastery > 0 ? 'text-red-500' : 'text-slate-400'
                          }`}>
                            {topic.mastery}%
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {filteredChapters.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Search className="w-8 h-8 mb-2" />
                <p className="text-sm">No topics match your search or filter.</p>
              </div>
            )}
          </div>

          {/* Right: Topic detail panel */}
          <div className="w-[40%] overflow-y-auto border border-slate-200 dark:border-[#232536] rounded-lg bg-white dark:bg-[#1a1d2e]" style={{ scrollbarWidth: 'thin' }}>
            {selectedTopic ? (
              <div className="p-4">
                {/* Topic header */}
                <div className="flex items-start gap-3 mb-4">
                  <CircularProgress pct={selectedTopic.mastery} size={64} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-0.5">
                      Chapter {selectedChapterId}: {selectedChapter?.title}
                    </p>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                      {selectedTopic.id} — {selectedTopic.name}
                    </h2>
                    {statusLabel(selectedTopic.status)}
                  </div>
                </div>

                {/* Key concepts */}
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#7C3AED]" />
                    Key Concepts
                  </h3>
                  <ul className="space-y-1">
                    {selectedTopic.keyConcepts.map((concept, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-slate-600 dark:text-slate-400">
                        <span className="text-[#7C3AED] mt-0.5 shrink-0">&#x2022;</span>
                        {concept}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Related lessons */}
                {selectedTopic.relatedLessons.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#7C3AED]" />
                      Related Lessons
                    </h3>
                    <div className="space-y-1">
                      {selectedTopic.relatedLessons.map((lesson, i) => (
                        <Link
                          key={i}
                          to="/lessons"
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-[#252839] hover:bg-slate-100 dark:hover:bg-[#2a2d42] transition-colors group"
                        >
                          <span className="text-[12px] text-slate-700 dark:text-slate-300 group-hover:text-[#7C3AED] transition-colors">{lesson.title}</span>
                          <span className="text-[10px] text-slate-400">{lesson.date}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-1.5">
                  <Link
                    to="/exam"
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium transition-colors"
                  >
                    <Beaker className="w-3.5 h-3.5" />
                    Practice
                  </Link>
                  <Link
                    to="/doubts"
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED]/10 text-xs font-medium transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Study with AI
                  </Link>
                  <Link
                    to="/reels"
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-slate-200 dark:border-[#232536] text-slate-600 dark:text-slate-400 hover:border-[#7C3AED]/40 hover:text-[#7C3AED] text-xs font-medium transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Resources
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 p-6">
                <BookOpen className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm font-medium mb-1">Select a topic</p>
                <p className="text-xs text-center">Click on any subtopic in a chapter to view details, key concepts, and study options.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
