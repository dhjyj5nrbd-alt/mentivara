import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import {
  ChevronDown, ChevronRight, CheckCircle2, Clock, Circle,
  BookOpen, Target, HelpCircle, Search, Upload, Play,
  Beaker, ArrowLeft, Check, X, Send, Bot, User,
  FileText, RotateCcw, Sparkles, Video,
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

interface Syllabus {
  id: string
  name: string
  board: string
  code: string
  level: string
  chapters: Chapter[]
}

type ActivePanel = 'practice' | 'study-ai' | 'resources' | null

/* ────────────────────────────────────────────────────────────
   Practice Quiz Data (Topic 1.1 — AS Biology 9700)
   ──────────────────────────────────────────────────────────── */
interface QuizQuestion {
  id: number
  type: 'mcq' | 'short'
  question: string
  options?: string[]
  correctIndex?: number
  correctAnswer?: string
  explanation: string
}

const DEMO_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1, type: 'mcq',
    question: 'What is the formula for calculating magnification?',
    options: [
      'Magnification = Image size \u00d7 Actual size',
      'Magnification = Image size \u00f7 Actual size',
      'Magnification = Actual size \u00f7 Image size',
      'Magnification = Image size + Actual size',
    ],
    correctIndex: 1,
    explanation: 'Magnification is calculated by dividing the image size by the actual size of the specimen. This can be rearranged to find image size or actual size.',
  },
  {
    id: 2, type: 'mcq',
    question: 'Which type of microscope has the highest resolution?',
    options: [
      'Light microscope',
      'Scanning electron microscope',
      'Transmission electron microscope',
      'Fluorescence microscope',
    ],
    correctIndex: 2,
    explanation: 'The TEM has the highest resolution (about 1 nm) because it uses a beam of electrons transmitted through an ultra-thin specimen, allowing visualisation of internal ultrastructure.',
  },
  {
    id: 3, type: 'mcq',
    question: 'What is the maximum useful magnification of a light microscope?',
    options: ['\u00d7100', '\u00d7400', '\u00d71500', '\u00d7100,000'],
    correctIndex: 2,
    explanation: 'Light microscopes can magnify up to about \u00d71500. Beyond this, the image becomes blurry because the resolution limit (~200 nm) has been exceeded.',
  },
  {
    id: 4, type: 'mcq',
    question: 'An organelle has an actual size of 5 \u03bcm. Under a microscope, it appears 25 mm. What is the magnification?',
    options: ['\u00d7500', '\u00d75000', '\u00d750', '\u00d750,000'],
    correctIndex: 1,
    explanation: 'First convert to the same units: 25 mm = 25,000 \u03bcm. Magnification = 25,000 \u00f7 5 = \u00d75000.',
  },
  {
    id: 5, type: 'mcq',
    question: 'Which of the following can be seen with a light microscope?',
    options: [
      'Ribosomes',
      'Cell membrane structure',
      'Mitochondria',
      'Endoplasmic reticulum detail',
    ],
    correctIndex: 2,
    explanation: 'Mitochondria are typically 1\u201310 \u03bcm, large enough to be seen with a light microscope. Ribosomes (~25 nm) and membrane detail require electron microscopy.',
  },
  {
    id: 6, type: 'mcq',
    question: 'What is the purpose of staining cells before viewing under a microscope?',
    options: [
      'To kill the cells',
      'To increase magnification',
      'To increase contrast and make structures visible',
      'To preserve the cells permanently',
    ],
    correctIndex: 2,
    explanation: 'Most biological structures are transparent. Stains bind to specific structures (e.g. methylene blue to nuclei) increasing contrast so they can be distinguished.',
  },
  {
    id: 7, type: 'mcq',
    question: 'The resolution of a microscope is defined as:',
    options: [
      'How large it can make an image',
      'The minimum distance between two points that can be distinguished',
      'The maximum magnification possible',
      'The clarity of the image',
    ],
    correctIndex: 1,
    explanation: 'Resolution is the ability to distinguish between two separate points. A higher resolution means a smaller minimum distance, producing a clearer, more detailed image.',
  },
  {
    id: 8, type: 'short',
    question: 'Calculate the actual size of a cell that appears 30 mm wide under a magnification of \u00d7600. Show your working and give your answer in \u03bcm.',
    correctAnswer: '50',
    explanation: 'Actual size = Image size \u00f7 Magnification = 30 mm \u00f7 600 = 0.05 mm. Converting to \u03bcm: 0.05 \u00d7 1000 = 50 \u03bcm.',
  },
  {
    id: 9, type: 'mcq',
    question: 'Which stain is commonly used to view nuclei in animal cells?',
    options: ['Iodine solution', 'Methylene blue', 'Eosin', 'Crystal violet'],
    correctIndex: 1,
    explanation: 'Methylene blue stains nucleic acids (DNA) in the nucleus, making it appear blue. Iodine is used for starch in plant cells.',
  },
  {
    id: 10, type: 'short',
    question: 'Explain two advantages of using an electron microscope over a light microscope.',
    correctAnswer: 'higher resolution, higher magnification',
    explanation: '1) Higher resolution \u2014 can distinguish objects as small as 1 nm vs 200 nm for light microscopes. 2) Higher magnification \u2014 up to \u00d7500,000 vs \u00d71500 for light microscopes. This allows visualisation of cell ultrastructure such as ribosomes and internal membrane systems.',
  },
]

/* ────────────────────────────────────────────────────────────
   Study AI Chat Data (Topic 1.1 — AS Biology 9700)
   ──────────────────────────────────────────────────────────── */
interface ChatMessage {
  role: 'ai' | 'user'
  text: string
}

const DEMO_AI_RESPONSE = `**Magnification Formula**

The formula is:

**Magnification = Image Size \u00f7 Actual Size**

Or rearranged:
- **Image Size = Magnification \u00d7 Actual Size**
- **Actual Size = Image Size \u00f7 Magnification**

**Key tips for exam questions:**
1. Always convert units first \u2014 make sure both measurements are in the same unit (usually \u03bcm)
2. 1 mm = 1000 \u03bcm
3. Show your working clearly for full marks

**Example:**
A cell appears 40 mm wide under \u00d7500 magnification.
Actual size = 40 mm \u00f7 500 = 0.08 mm = 80 \u03bcm`

const AI_SUGGESTED_QUESTIONS = [
  'Explain magnification formula',
  'Difference between resolution and magnification',
  'How do electron microscopes work?',
  'What are the different types of stains?',
]

/* ────────────────────────────────────────────────────────────
   Resources Data (Topic 1.1 — AS Biology 9700)
   ──────────────────────────────────────────────────────────── */
interface VideoResource {
  title: string
  author: string
  duration: string
  color: string
}

interface DocResource {
  title: string
  pages: number
}

interface FlashcardData {
  front: string
  back: string
}

const DEMO_VIDEOS: VideoResource[] = [
  { title: 'Microscopy Techniques', author: 'Dr. Sarah Chen', duration: '3:45', color: 'from-purple-500 to-indigo-600' },
  { title: 'Magnification Calculations Made Easy', author: 'Prof. James Wilson', duration: '5:20', color: 'from-blue-500 to-cyan-600' },
  { title: 'Electron vs Light Microscopes', author: 'Dr. Emily Brooks', duration: '4:10', color: 'from-pink-500 to-rose-600' },
]

const DEMO_DOCS: DocResource[] = [
  { title: 'Topic 1.1 Revision Notes', pages: 2 },
  { title: 'Magnification Practice Worksheet', pages: 4 },
  { title: 'Microscopy Key Terms Glossary', pages: 1 },
]

const DEMO_FLASHCARDS: FlashcardData[] = [
  { front: 'What is magnification?', back: 'The number of times larger an image is compared to the actual object' },
  { front: 'What is resolution?', back: 'The minimum distance between two points that can still be distinguished as separate' },
  { front: 'Light microscope max magnification?', back: '\u00d71500' },
  { front: 'Electron microscope max magnification?', back: 'Up to \u00d7500,000' },
  { front: 'Name two types of electron microscope', back: 'Transmission Electron Microscope (TEM) and Scanning Electron Microscope (SEM)' },
  { front: 'What stain is used for nuclei?', back: 'Methylene blue' },
]

/* ────────────────────────────────────────────────────────────
   Helper — is this the demo topic (AS Bio 9700, topic 1.1)?
   ──────────────────────────────────────────────────────────── */
function isDemoTopic(syllabusId: string, topicId: string) {
  return syllabusId === 'al-bio-cie' && topicId === '1.1'
}

/* ────────────────────────────────────────────────────────────
   Helper
   ──────────────────────────────────────────────────────────── */
function t(
  id: string, name: string, status: Topic['status'], mastery: number,
  keyConcepts: string[], relatedLessons: { title: string; date: string }[] = [],
  hoursStudied = 0,
): Topic {
  return { id, name, status, mastery, keyConcepts, relatedLessons, hoursStudied }
}

/* ────────────────────────────────────────────────────────────
   Demo Data — IGCSE Biology CIE (0610)
   ──────────────────────────────────────────────────────────── */
const IGCSE_BIO_CHAPTERS: Chapter[] = [
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
   Demo Data — CIE AS & A-Level Biology (9700)
   ──────────────────────────────────────────────────────────── */
const CIE_ALEVEL_BIO_CHAPTERS: Chapter[] = [
  {
    id: 1, title: 'Cell structure', topics: [
      t('1.1', 'The microscope in cell studies', 'mastered', 92,
        ['Light vs electron microscopes', 'Magnification and resolution', 'Calculating actual size of specimens'],
        [{ title: 'Microscopy Techniques', date: '10 Sep 2025' }, { title: 'Cell Ultrastructure', date: '14 Sep 2025' }], 3.5),
      t('1.2', 'Cells as the basic units of living organisms', 'mastered', 88,
        ['Prokaryotic vs eukaryotic cells', 'Ultrastructure of animal and plant cells', 'Functions of organelles'],
        [{ title: 'Cell Organelles', date: '17 Sep 2025' }], 3),
    ],
  },
  {
    id: 2, title: 'Biological molecules', topics: [
      t('2.1', 'Testing for biological molecules', 'mastered', 90,
        ['Benedict\'s test for reducing sugars', 'Iodine test for starch', 'Biuret test for proteins', 'Emulsion test for lipids'],
        [{ title: 'Biochemistry Lab', date: '20 Sep 2025' }], 2.5),
      t('2.2', 'Carbohydrates and lipids', 'mastered', 86,
        ['Monosaccharides, disaccharides, polysaccharides', 'Glycosidic bonds and condensation', 'Triglycerides and phospholipids', 'Saturated vs unsaturated fatty acids'],
        [{ title: 'Carbohydrates & Lipids', date: '24 Sep 2025' }], 3),
      t('2.3', 'Proteins', 'mastered', 84,
        ['Amino acid structure and peptide bonds', 'Primary to quaternary structure', 'Globular vs fibrous proteins', 'Haemoglobin and collagen examples'],
        [{ title: 'Protein Structure', date: '28 Sep 2025' }], 3),
      t('2.4', 'Water', 'mastered', 91,
        ['Hydrogen bonding in water', 'Solvent properties', 'High specific heat capacity', 'Surface tension and cohesion'],
        [{ title: 'Water & Life', date: '1 Oct 2025' }], 1.5),
    ],
  },
  {
    id: 3, title: 'Enzymes', topics: [
      t('3.1', 'Mode of action of enzymes', 'mastered', 87,
        ['Lock and key hypothesis', 'Induced fit model', 'Activation energy', 'Enzyme-substrate complex'],
        [{ title: 'Enzyme Kinetics', date: '5 Oct 2025' }], 2.5),
      t('3.2', 'Factors that affect enzyme action', 'mastered', 83,
        ['Temperature coefficient (Q10)', 'pH and denaturation', 'Substrate concentration', 'Competitive and non-competitive inhibition'],
        [{ title: 'Enzyme Inhibition', date: '8 Oct 2025' }, { title: 'Enzyme Practical', date: '10 Oct 2025' }], 3.5),
    ],
  },
  {
    id: 4, title: 'Cell membranes and transport', topics: [
      t('4.1', 'Fluid mosaic membranes', 'mastered', 85,
        ['Phospholipid bilayer structure', 'Intrinsic and extrinsic proteins', 'Cholesterol role', 'Glycoproteins and glycolipids'],
        [{ title: 'Membrane Structure', date: '14 Oct 2025' }], 2.5),
      t('4.2', 'Movement of substances into and out of cells', 'mastered', 80,
        ['Simple and facilitated diffusion', 'Osmosis and water potential', 'Active transport and co-transport', 'Endocytosis and exocytosis'],
        [{ title: 'Membrane Transport', date: '17 Oct 2025' }, { title: 'Osmosis Investigation', date: '20 Oct 2025' }], 3.5),
    ],
  },
  {
    id: 5, title: 'The mitotic cell cycle', topics: [
      t('5.1', 'Replication and division of nuclei and cells', 'mastered', 82,
        ['Interphase: G1, S, G2 phases', 'Stages of mitosis', 'Cytokinesis in animal and plant cells', 'Role of mitosis in growth and repair'],
        [{ title: 'Cell Division', date: '24 Oct 2025' }], 2.5),
      t('5.2', 'Chromosome behaviour in mitosis', 'mastered', 79,
        ['Condensation of chromatin', 'Spindle fibre attachment', 'Centromere separation', 'Calculating mitotic index'],
        [{ title: 'Mitosis Practical', date: '27 Oct 2025' }], 2),
    ],
  },
  {
    id: 6, title: 'Nucleic acids and protein synthesis', topics: [
      t('6.1', 'Structure and replication of DNA', 'mastered', 81,
        ['Nucleotide structure', 'Double helix and base pairing', 'Semi-conservative replication', 'Meselson-Stahl experiment'],
        [{ title: 'DNA Structure', date: '1 Nov 2025' }], 3),
      t('6.2', 'Protein synthesis', 'mastered', 77,
        ['Transcription in the nucleus', 'mRNA processing and splicing', 'Translation at ribosomes', 'Codons and anticodons'],
        [{ title: 'Gene Expression', date: '5 Nov 2025' }], 3),
    ],
  },
  {
    id: 7, title: 'Transport in plants', topics: [
      t('7.1', 'Structure of transport tissues', 'in_progress', 62,
        ['Xylem vessel elements and tracheids', 'Phloem sieve tubes and companion cells', 'Lignification and adaptations'],
        [{ title: 'Plant Transport Tissues', date: '10 Nov 2025' }], 2),
      t('7.2', 'Transport mechanisms', 'in_progress', 55,
        ['Transpiration pull and cohesion-tension', 'Root pressure', 'Translocation and mass flow hypothesis', 'Evidence for phloem transport'],
        [{ title: 'Transpiration Investigation', date: '14 Nov 2025' }], 2),
    ],
  },
  {
    id: 8, title: 'Transport in mammals', topics: [
      t('8.1', 'The circulatory system', 'in_progress', 58,
        ['Double circulatory system', 'Arteries, arterioles, capillaries, venules, veins', 'Structure related to function', 'Blood composition'],
        [{ title: 'Circulatory System', date: '18 Nov 2025' }], 2),
      t('8.2', 'The heart', 'in_progress', 50,
        ['Heart structure and cardiac cycle', 'Myogenic stimulation and SAN', 'Electrocardiograms (ECGs)', 'Coronary heart disease'],
        [{ title: 'Heart Dissection', date: '22 Nov 2025' }], 1.5),
    ],
  },
  {
    id: 9, title: 'Gas exchange', topics: [
      t('9.1', 'The gas exchange system', 'in_progress', 52,
        ['Lung structure and alveoli', 'Gas exchange surface adaptations', 'Ventilation mechanism', 'Measuring lung volumes'],
        [{ title: 'Gas Exchange', date: '26 Nov 2025' }], 1.5),
      t('9.2', 'Smoking', 'in_progress', 45,
        ['Tar, nicotine, carbon monoxide effects', 'Chronic bronchitis and emphysema', 'Lung cancer risk factors', 'Epidemiological evidence'],
        [], 1),
    ],
  },
  {
    id: 10, title: 'Infectious diseases', topics: [
      t('10.1', 'Infectious diseases', 'in_progress', 48,
        ['Pathogen types: bacteria, viruses, fungi', 'Transmission methods', 'Cholera, malaria, TB, HIV/AIDS', 'Global impact of infectious disease'],
        [{ title: 'Infectious Disease', date: '1 Dec 2025' }], 1.5),
      t('10.2', 'Antibiotics', 'in_progress', 40,
        ['Mode of action of antibiotics', 'Antibiotic resistance and MRSA', 'Penicillin discovery and development', 'Responsible use of antibiotics'],
        [], 1),
    ],
  },
  {
    id: 11, title: 'Immunity', topics: [
      t('11.1', 'The immune system', 'in_progress', 42,
        ['Phagocytosis and macrophages', 'T lymphocytes and cell-mediated immunity', 'B lymphocytes and humoral immunity', 'Memory cells and secondary response'],
        [{ title: 'Immune Response', date: '5 Dec 2025' }], 1.5),
      t('11.2', 'Antibodies and vaccination', 'in_progress', 35,
        ['Antibody structure and function', 'Active and passive immunity', 'Vaccination programmes', 'Herd immunity and ethics'],
        [], 1),
    ],
  },
  {
    id: 12, title: 'Energy and respiration', topics: [
      t('12.1', 'Energy', 'not_started', 0,
        ['ATP structure and role', 'Energy currency of the cell', 'Phosphorylation reactions'],
        [], 0),
      t('12.2', 'Respiration', 'not_started', 0,
        ['Glycolysis in the cytoplasm', 'Link reaction and Krebs cycle', 'Oxidative phosphorylation', 'Anaerobic respiration pathways'],
        [], 0),
    ],
  },
  {
    id: 13, title: 'Photosynthesis', topics: [
      t('13.1', 'Photosynthesis as an energy transfer process', 'not_started', 0,
        ['Light-dependent reactions', 'Photophosphorylation', 'Calvin cycle (light-independent)', 'Chloroplast structure and function'],
        [], 0),
      t('13.2', 'Investigation of limiting factors', 'not_started', 0,
        ['Light intensity and wavelength', 'Carbon dioxide concentration', 'Temperature effects', 'Compensation point'],
        [], 0),
    ],
  },
  {
    id: 14, title: 'Homeostasis', topics: [
      t('14.1', 'Homeostasis in mammals', 'not_started', 0,
        ['Negative feedback mechanisms', 'Role of receptors and effectors', 'Communication by nervous and endocrine systems'],
        [], 0),
      t('14.2', 'The control of body temperature', 'not_started', 0,
        ['Thermoregulation centre in hypothalamus', 'Vasodilation and vasoconstriction', 'Sweating and shivering', 'Ectotherms vs endotherms'],
        [], 0),
      t('14.3', 'The control of blood glucose concentration', 'not_started', 0,
        ['Insulin and glucagon roles', 'Glycogenesis and glycogenolysis', 'Type 1 and Type 2 diabetes'],
        [], 0),
      t('14.4', 'The control of water potential of blood', 'not_started', 0,
        ['Nephron structure and function', 'Ultrafiltration and selective reabsorption', 'ADH and osmoregulation', 'Loop of Henle countercurrent'],
        [], 0),
    ],
  },
  {
    id: 15, title: 'Control and coordination', topics: [
      t('15.1', 'Control and coordination in mammals', 'not_started', 0,
        ['Neurone structure and types', 'Resting and action potentials', 'Synaptic transmission', 'Effects of drugs on synapses'],
        [], 0),
      t('15.2', 'Control and coordination in plants', 'not_started', 0,
        ['Auxin and phototropism', 'Gibberellins and stem elongation', 'Abscisic acid and stomatal closure', 'Commercial uses of plant hormones'],
        [], 0),
    ],
  },
  {
    id: 16, title: 'Inherited change', topics: [
      t('16.1', 'Passage of information from parent to offspring', 'not_started', 0,
        ['Meiosis and genetic variation', 'Independent assortment', 'Crossing over and chiasmata', 'Random fusion of gametes'],
        [], 0),
      t('16.2', 'The roles of genes in determining the phenotype', 'not_started', 0,
        ['Monohybrid and dihybrid crosses', 'Codominance and multiple alleles', 'Sex linkage', 'Chi-squared test'],
        [], 0),
      t('16.3', 'Gene control', 'not_started', 0,
        ['Lac operon in E. coli', 'Epigenetics', 'Gene expression regulation'],
        [], 0),
    ],
  },
  {
    id: 17, title: 'Selection and evolution', topics: [
      t('17.1', 'Variation', 'not_started', 0,
        ['Continuous and discontinuous variation', 'Genetic and environmental causes', 'Standard deviation and normal distribution'],
        [], 0),
      t('17.2', 'Natural and artificial selection', 'not_started', 0,
        ['Directional and stabilising selection', 'Selective breeding in agriculture', 'Antibiotic resistance as evolution in action'],
        [], 0),
      t('17.3', 'Evolution', 'not_started', 0,
        ['Speciation: allopatric and sympatric', 'Adaptive radiation', 'Evidence for evolution'],
        [], 0),
    ],
  },
  {
    id: 18, title: 'Biodiversity, classification and conservation', topics: [
      t('18.1', 'Biodiversity', 'not_started', 0,
        ['Species diversity and habitat diversity', 'Simpson\'s index of diversity', 'Measuring biodiversity'],
        [], 0),
      t('18.2', 'Classification', 'not_started', 0,
        ['Three-domain system', 'Phylogenetic classification', 'Molecular evidence: DNA and amino acid sequences'],
        [], 0),
      t('18.3', 'Conservation', 'not_started', 0,
        ['In situ and ex situ conservation', 'International conservation agreements', 'Sustainable resource management'],
        [], 0),
    ],
  },
  {
    id: 19, title: 'Genetic technology', topics: [
      t('19.1', 'Principles of genetic technology', 'not_started', 0,
        ['Restriction enzymes and ligase', 'Vectors: plasmids and bacteriophages', 'PCR and gel electrophoresis', 'DNA sequencing'],
        [], 0),
      t('19.2', 'Genetic technology applied to medicine', 'not_started', 0,
        ['Gene therapy: somatic and germ line', 'Genetic screening and counselling', 'Production of human insulin'],
        [], 0),
      t('19.3', 'Genetically modified organisms', 'not_started', 0,
        ['GM crops: benefits and risks', 'Golden rice and Bt crops', 'Ethical considerations', 'Regulation of GMOs'],
        [], 0),
    ],
  },
]

/* ────────────────────────────────────────────────────────────
   Demo Data — Edexcel International AS/A2 Chemistry
   ──────────────────────────────────────────────────────────── */
const EDEXCEL_CHEM_CHAPTERS: Chapter[] = [
  {
    id: 1, title: 'Formulae, Equations and Amount of Substance', topics: [
      t('1.1', 'Formulae and equations', 'mastered', 93,
        ['Empirical and molecular formulae', 'Balancing chemical equations', 'State symbols and ionic equations'],
        [{ title: 'Chemical Formulae', date: '8 Sep 2025' }, { title: 'Equation Balancing', date: '11 Sep 2025' }], 3),
      t('1.2', 'Amount of substance and the mole', 'mastered', 89,
        ['Avogadro constant', 'Molar mass calculations', 'Moles of gases at RTP', 'Concentration of solutions'],
        [{ title: 'The Mole Concept', date: '15 Sep 2025' }], 3.5),
      t('1.3', 'Titrations', 'mastered', 85,
        ['Acid-base titration technique', 'Concordant results', 'Titre calculations', 'Indicators and end points'],
        [{ title: 'Titration Practical', date: '18 Sep 2025' }], 2.5),
    ],
  },
  {
    id: 2, title: 'Atomic Structure and the Periodic Table', topics: [
      t('2.1', 'Atomic structure and isotopes', 'mastered', 91,
        ['Protons, neutrons, electrons', 'Isotopes and relative atomic mass', 'Mass spectrometry', 'Atomic number and mass number'],
        [{ title: 'Atomic Structure', date: '22 Sep 2025' }], 2.5),
      t('2.2', 'Electronic configuration', 'mastered', 87,
        ['s, p, d sub-shells and orbitals', 'Aufbau principle and Hund\'s rule', 'Electron configuration notation', 'Ionisation energies and trends'],
        [{ title: 'Electron Configuration', date: '25 Sep 2025' }], 3),
      t('2.3', 'The Periodic Table', 'mastered', 83,
        ['Periodicity of physical properties', 'First ionisation energy trends', 'Electron affinity', 'Metallic and non-metallic character'],
        [{ title: 'Periodic Trends', date: '29 Sep 2025' }], 2.5),
    ],
  },
  {
    id: 3, title: 'Bonding and Structure', topics: [
      t('3.1', 'Ionic bonding', 'mastered', 88,
        ['Electron transfer and ion formation', 'Lattice structure of NaCl', 'Properties of ionic compounds', 'Born-Haber representation'],
        [{ title: 'Ionic Bonding', date: '2 Oct 2025' }], 2.5),
      t('3.2', 'Covalent bonding', 'mastered', 85,
        ['Shared pairs and dative bonds', 'Dot-and-cross diagrams', 'VSEPR theory and molecular shapes', 'Bond polarity and electronegativity'],
        [{ title: 'Covalent Bonding', date: '6 Oct 2025' }], 3),
      t('3.3', 'Metallic bonding and structure', 'mastered', 82,
        ['Sea of delocalised electrons', 'Properties: conductivity, malleability', 'Giant metallic lattice', 'Alloys and their properties'],
        [{ title: 'Metallic Bonding', date: '9 Oct 2025' }], 2),
      t('3.4', 'Intermolecular forces', 'mastered', 80,
        ['London dispersion forces', 'Permanent dipole-dipole', 'Hydrogen bonding', 'Effects on boiling points and solubility'],
        [{ title: 'Intermolecular Forces', date: '13 Oct 2025' }], 2.5),
    ],
  },
  {
    id: 4, title: 'Introductory Organic Chemistry', topics: [
      t('4.1', 'Introduction to organic chemistry', 'mastered', 84,
        ['Homologous series', 'Functional groups and nomenclature', 'Structural and displayed formulae', 'Isomerism: structural and stereoisomerism'],
        [{ title: 'Organic Chemistry Intro', date: '16 Oct 2025' }], 3),
      t('4.2', 'Alkanes', 'mastered', 81,
        ['Combustion reactions', 'Free radical substitution mechanism', 'Initiation, propagation, termination', 'Crude oil and fractional distillation'],
        [{ title: 'Alkane Chemistry', date: '20 Oct 2025' }], 2.5),
      t('4.3', 'Alkenes', 'mastered', 78,
        ['Electrophilic addition reactions', 'Test for unsaturation with bromine', 'Markownikoff\'s rule', 'Addition polymerisation'],
        [{ title: 'Alkene Reactions', date: '23 Oct 2025' }], 2.5),
    ],
  },
  {
    id: 5, title: 'Redox Chemistry and Groups 1, 2 and 7', topics: [
      t('5.1', 'Redox', 'in_progress', 65,
        ['Oxidation states and rules', 'Redox equations using half-equations', 'Identifying oxidising and reducing agents'],
        [{ title: 'Redox Chemistry', date: '27 Oct 2025' }], 2),
      t('5.2', 'Group 1 and Group 2', 'in_progress', 58,
        ['Trends in reactivity down the groups', 'Reactions with water and oxygen', 'Flame tests and solubility trends', 'Thermal stability of carbonates and nitrates'],
        [{ title: 'Group 1 & 2', date: '1 Nov 2025' }], 2),
      t('5.3', 'Group 7 (Halogens)', 'in_progress', 52,
        ['Trend in electronegativity and reactivity', 'Displacement reactions', 'Halide ion tests with silver nitrate', 'Disproportionation of chlorine'],
        [{ title: 'Halogens', date: '5 Nov 2025' }], 1.5),
    ],
  },
  {
    id: 6, title: 'Kinetics and Equilibria', topics: [
      t('6.1', 'Rates of reaction', 'in_progress', 60,
        ['Collision theory', 'Maxwell-Boltzmann distribution', 'Effect of catalysts on activation energy', 'Measuring reaction rates'],
        [{ title: 'Reaction Kinetics', date: '10 Nov 2025' }], 2),
      t('6.2', 'Chemical equilibria', 'in_progress', 48,
        ['Dynamic equilibrium', 'Le Chatelier\'s principle', 'Effect of temperature, pressure, concentration', 'Equilibrium constant Kc introduction'],
        [{ title: 'Equilibria', date: '14 Nov 2025' }], 1.5),
    ],
  },
  {
    id: 7, title: 'Energetics', topics: [
      t('7.1', 'Enthalpy changes', 'in_progress', 55,
        ['Exothermic and endothermic reactions', 'Enthalpy profile diagrams', 'Standard enthalpy of formation and combustion', 'Calorimetry calculations'],
        [{ title: 'Enthalpy Changes', date: '18 Nov 2025' }], 2),
      t('7.2', 'Hess\'s law and bond enthalpies', 'in_progress', 42,
        ['Hess\'s law and enthalpy cycles', 'Mean bond enthalpy calculations', 'Limitations of bond enthalpy data'],
        [], 1),
    ],
  },
  {
    id: 8, title: 'Further Organic Chemistry', topics: [
      t('8.1', 'Halogenoalkanes', 'in_progress', 50,
        ['Nucleophilic substitution (SN1 and SN2)', 'Elimination vs substitution', 'Rate of hydrolysis of halogenoalkanes', 'CFCs and ozone depletion'],
        [{ title: 'Halogenoalkanes', date: '22 Nov 2025' }], 1.5),
      t('8.2', 'Alcohols', 'in_progress', 40,
        ['Classification: primary, secondary, tertiary', 'Oxidation reactions', 'Dehydration to alkenes', 'Esterification reaction'],
        [], 1),
      t('8.3', 'Analytical techniques', 'in_progress', 35,
        ['Mass spectrometry: molecular ion peak', 'Infrared spectroscopy: functional group identification', 'Interpreting simple IR spectra'],
        [], 0.5),
    ],
  },
  {
    id: 9, title: 'Rates, Equilibria and Further Energetics', topics: [
      t('9.1', 'Rate equations', 'not_started', 0,
        ['Rate equation and rate constant', 'Order of reaction from experimental data', 'Rate-determining step'],
        [], 0),
      t('9.2', 'Equilibrium constant Kc and Kp', 'not_started', 0,
        ['Expressions for Kc and Kp', 'Calculating equilibrium concentrations', 'Effect of temperature on K'],
        [], 0),
      t('9.3', 'Acids, bases and buffers', 'not_started', 0,
        ['Bronsted-Lowry theory', 'pH calculations and Ka', 'Buffer solutions and their action', 'pH curves and indicators'],
        [], 0),
      t('9.4', 'Born-Haber cycles and entropy', 'not_started', 0,
        ['Lattice enthalpy and Born-Haber cycles', 'Entropy and free energy', 'Feasibility of reactions'],
        [], 0),
    ],
  },
  {
    id: 10, title: 'Transition Metals and Organic Nitrogen Chemistry', topics: [
      t('10.1', 'Transition metal chemistry', 'not_started', 0,
        ['Electronic configuration of d-block elements', 'Variable oxidation states', 'Complex ions and ligands', 'Colour of transition metal compounds'],
        [], 0),
      t('10.2', 'Reactions of ions in aqueous solution', 'not_started', 0,
        ['Precipitation reactions', 'Ligand exchange reactions', 'Amphoteric hydroxides'],
        [], 0),
      t('10.3', 'Amines and amino acids', 'not_started', 0,
        ['Preparation and reactions of amines', 'Amino acid structure', 'Zwitterions and isoelectric point'],
        [], 0),
      t('10.4', 'Polymers', 'not_started', 0,
        ['Condensation polymers: polyesters, polyamides', 'Nylon and Terylene', 'Biodegradability and disposal'],
        [], 0),
    ],
  },
  {
    id: 11, title: 'Further Organic Chemistry', topics: [
      t('11.1', 'Carbonyl compounds', 'not_started', 0,
        ['Nucleophilic addition with HCN', 'Reduction of aldehydes and ketones', 'Testing with 2,4-DNP and Tollens\' reagent'],
        [], 0),
      t('11.2', 'Carboxylic acids and esters', 'not_started', 0,
        ['Reactions of carboxylic acids', 'Ester formation and hydrolysis', 'Uses of esters'],
        [], 0),
      t('11.3', 'Aromatic chemistry', 'not_started', 0,
        ['Benzene structure and stability', 'Electrophilic substitution reactions', 'Nitration, halogenation, Friedel-Crafts'],
        [], 0),
      t('11.4', 'Organic synthesis and analysis', 'not_started', 0,
        ['Multi-step synthesis planning', 'Reaction pathway maps', 'Combined analytical techniques'],
        [], 0),
    ],
  },
  {
    id: 12, title: 'Spectroscopy, Electrochemistry and Further Kinetics', topics: [
      t('12.1', 'NMR spectroscopy', 'not_started', 0,
        ['Proton and carbon-13 NMR', 'Chemical shift and environment', 'Integration traces and splitting patterns'],
        [], 0),
      t('12.2', 'Chromatography', 'not_started', 0,
        ['Thin-layer and column chromatography', 'Gas chromatography-mass spectrometry', 'Rf values and identification'],
        [], 0),
      t('12.3', 'Electrochemistry', 'not_started', 0,
        ['Standard electrode potentials', 'Electrochemical cells', 'Predicting feasibility of reactions'],
        [], 0),
      t('12.4', 'Further kinetics', 'not_started', 0,
        ['Arrhenius equation', 'Effect of temperature on rate constant', 'Catalysis: homogeneous and heterogeneous'],
        [], 0),
    ],
  },
]

/* ────────────────────────────────────────────────────────────
   Demo Data — Edexcel International AS/A2 Business Studies
   ──────────────────────────────────────────────────────────── */
const EDEXCEL_BUS_CHAPTERS: Chapter[] = [
  {
    id: 1, title: 'Business Enterprise', topics: [
      t('1.1', 'Enterprise and entrepreneurs', 'mastered', 90,
        ['Characteristics of successful entrepreneurs', 'Risk and reward in business', 'Role of enterprise in the economy'],
        [{ title: 'Entrepreneurship Basics', date: '5 Sep 2025' }, { title: 'Case Study: Start-ups', date: '8 Sep 2025' }], 3),
      t('1.2', 'Business plans', 'mastered', 86,
        ['Purpose and structure of business plans', 'Financial forecasts', 'Market analysis in planning', 'Pitching to investors'],
        [{ title: 'Writing Business Plans', date: '12 Sep 2025' }], 2.5),
      t('1.3', 'Stakeholders', 'mastered', 84,
        ['Internal and external stakeholders', 'Stakeholder conflict', 'Stakeholder mapping', 'Corporate social responsibility'],
        [{ title: 'Stakeholder Analysis', date: '15 Sep 2025' }], 2),
    ],
  },
  {
    id: 2, title: 'Business Organisation', topics: [
      t('2.1', 'Business ownership', 'mastered', 88,
        ['Sole traders and partnerships', 'Private and public limited companies', 'Franchises and social enterprises', 'Unlimited vs limited liability'],
        [{ title: 'Business Ownership', date: '19 Sep 2025' }], 2.5),
      t('2.2', 'Business objectives', 'mastered', 85,
        ['Profit maximisation vs satisficing', 'SMART objectives', 'Mission and vision statements', 'Short-term vs long-term objectives'],
        [{ title: 'Setting Objectives', date: '22 Sep 2025' }], 2),
      t('2.3', 'Business growth', 'mastered', 82,
        ['Organic vs inorganic growth', 'Mergers and acquisitions', 'Economies and diseconomies of scale', 'Ansoff\'s matrix'],
        [{ title: 'Growth Strategies', date: '26 Sep 2025' }], 2.5),
    ],
  },
  {
    id: 3, title: 'Marketing', topics: [
      t('3.1', 'Market research', 'mastered', 87,
        ['Primary and secondary research methods', 'Qualitative and quantitative data', 'Sampling techniques', 'Market segmentation'],
        [{ title: 'Market Research Methods', date: '29 Sep 2025' }], 2.5),
      t('3.2', 'Marketing mix — product', 'mastered', 83,
        ['Product life cycle stages', 'Extension strategies', 'Boston Matrix', 'Product portfolio management'],
        [{ title: 'Product Strategy', date: '3 Oct 2025' }], 2),
      t('3.3', 'Marketing mix — price, place, promotion', 'mastered', 80,
        ['Pricing strategies: penetration, skimming, competitive', 'Distribution channels', 'Promotional mix: advertising, sales promotion, PR', 'Digital marketing'],
        [{ title: 'Marketing Mix', date: '6 Oct 2025' }], 2.5),
      t('3.4', 'Marketing strategy', 'mastered', 78,
        ['Mass marketing vs niche marketing', 'Market positioning', 'Unique selling proposition', 'Branding and brand loyalty'],
        [{ title: 'Marketing Strategy', date: '10 Oct 2025' }], 2),
    ],
  },
  {
    id: 4, title: 'People in Organisations', topics: [
      t('4.1', 'Human resource management', 'in_progress', 62,
        ['Workforce planning', 'Recruitment and selection process', 'Training: on-the-job vs off-the-job', 'Appraisal methods'],
        [{ title: 'HR Management', date: '14 Oct 2025' }], 2),
      t('4.2', 'Motivation', 'in_progress', 55,
        ['Maslow\'s hierarchy of needs', 'Herzberg\'s two-factor theory', 'Taylor\'s scientific management', 'Financial and non-financial motivators'],
        [{ title: 'Motivation Theory', date: '17 Oct 2025' }], 1.5),
      t('4.3', 'Leadership and management styles', 'in_progress', 48,
        ['Autocratic, democratic, laissez-faire', 'Tannenbaum-Schmidt continuum', 'McGregor\'s Theory X and Theory Y', 'Situational leadership'],
        [{ title: 'Leadership Styles', date: '21 Oct 2025' }], 1.5),
    ],
  },
  {
    id: 5, title: 'Operations Management', topics: [
      t('5.1', 'Production methods', 'in_progress', 58,
        ['Job, batch, and flow production', 'Lean production and JIT', 'Cell production', 'Kaizen continuous improvement'],
        [{ title: 'Production Methods', date: '24 Oct 2025' }], 1.5),
      t('5.2', 'Quality management', 'in_progress', 50,
        ['Quality control vs quality assurance', 'Total quality management (TQM)', 'ISO standards', 'Cost of quality'],
        [{ title: 'Quality Management', date: '28 Oct 2025' }], 1.5),
      t('5.3', 'Supply chain management', 'in_progress', 42,
        ['Procurement and supplier relationships', 'Stock management and buffer stock', 'Logistics and distribution', 'Outsourcing decisions'],
        [], 1),
    ],
  },
  {
    id: 6, title: 'Finance', topics: [
      t('6.1', 'Sources of finance', 'in_progress', 55,
        ['Internal vs external sources', 'Short-term and long-term finance', 'Venture capital and crowdfunding', 'Retained profit'],
        [{ title: 'Sources of Finance', date: '1 Nov 2025' }], 1.5),
      t('6.2', 'Revenue, costs and profit', 'in_progress', 48,
        ['Fixed and variable costs', 'Total cost and average cost', 'Revenue calculations', 'Contribution and profit'],
        [{ title: 'Revenue & Costs', date: '5 Nov 2025' }], 1.5),
      t('6.3', 'Break-even analysis', 'in_progress', 40,
        ['Break-even point calculation', 'Break-even charts', 'Margin of safety', 'Limitations of break-even analysis'],
        [], 1),
      t('6.4', 'Cash flow management', 'in_progress', 35,
        ['Cash flow forecasting', 'Cash flow vs profit', 'Causes and solutions for cash flow problems', 'Working capital management'],
        [], 0.5),
    ],
  },
  {
    id: 7, title: 'Business Strategy', topics: [
      t('7.1', 'Corporate objectives and strategy', 'not_started', 0,
        ['Corporate vs functional strategy', 'Strategic planning process', 'Porter\'s generic strategies', 'Core competencies'],
        [], 0),
      t('7.2', 'SWOT and PESTLE analysis', 'not_started', 0,
        ['Internal strengths and weaknesses', 'External opportunities and threats', 'Political, Economic, Social, Technological factors', 'Legal and Environmental considerations'],
        [], 0),
      t('7.3', 'Decision-making tools', 'not_started', 0,
        ['Decision trees', 'Expected values and risk', 'Quantitative vs qualitative factors', 'Opportunity cost'],
        [], 0),
    ],
  },
  {
    id: 8, title: 'Global Business', topics: [
      t('8.1', 'Globalisation', 'not_started', 0,
        ['Causes and effects of globalisation', 'Multinational corporations', 'Impact on stakeholders', 'Protectionism vs free trade'],
        [], 0),
      t('8.2', 'Global markets and expansion', 'not_started', 0,
        ['Market entry strategies', 'Joint ventures and licensing', 'Foreign direct investment', 'Exchange rate effects on business'],
        [], 0),
      t('8.3', 'Global marketing', 'not_started', 0,
        ['Glocalisation', 'Cultural differences in marketing', 'Standardisation vs adaptation', 'Ethical marketing globally'],
        [], 0),
    ],
  },
  {
    id: 9, title: 'Advanced Finance', topics: [
      t('9.1', 'Investment appraisal', 'not_started', 0,
        ['Payback period', 'Average rate of return (ARR)', 'Net present value (NPV)', 'Internal rate of return (IRR)'],
        [], 0),
      t('9.2', 'Financial statements', 'not_started', 0,
        ['Income statement structure', 'Statement of financial position', 'Cash flow statement', 'Interpreting financial data'],
        [], 0),
      t('9.3', 'Ratio analysis', 'not_started', 0,
        ['Profitability ratios', 'Liquidity ratios', 'Efficiency ratios', 'Gearing and shareholder ratios'],
        [], 0),
      t('9.4', 'Human resource strategies', 'not_started', 0,
        ['Hard vs soft HRM', 'Flexible working', 'Employee engagement strategies', 'Employer-employee relations'],
        [], 0),
    ],
  },
  {
    id: 10, title: 'Change Management', topics: [
      t('10.1', 'Causes and effects of change', 'not_started', 0,
        ['Internal and external drivers of change', 'Resistance to change', 'Impact on stakeholders'],
        [], 0),
      t('10.2', 'Key influences on change', 'not_started', 0,
        ['Kotter\'s 8-step change model', 'Lewin\'s force field analysis', 'Role of leadership in change'],
        [], 0),
      t('10.3', 'Managing organisational culture', 'not_started', 0,
        ['Handy\'s cultural typology', 'Strong vs weak culture', 'Changing culture in mergers', 'National culture and business'],
        [], 0),
    ],
  },
]

/* ────────────────────────────────────────────────────────────
   Demo Data — CIE AS & A-Level Psychology (9990)
   ──────────────────────────────────────────────────────────── */
const CIE_PSYCH_CHAPTERS: Chapter[] = [
  {
    id: 1, title: 'Research Methods', topics: [
      t('1.1', 'Experiments', 'mastered', 91,
        ['Laboratory, field, and natural experiments', 'Independent and dependent variables', 'Controls and confounding variables', 'Experimental design: independent groups, repeated measures, matched pairs'],
        [{ title: 'Research Methods Intro', date: '6 Sep 2025' }, { title: 'Experimental Design', date: '9 Sep 2025' }], 3.5),
      t('1.2', 'Self-reports', 'mastered', 87,
        ['Questionnaires: open and closed questions', 'Interviews: structured, semi-structured, unstructured', 'Reliability and validity of self-reports', 'Social desirability bias'],
        [{ title: 'Self-report Techniques', date: '13 Sep 2025' }], 2.5),
      t('1.3', 'Observations', 'mastered', 85,
        ['Naturalistic and controlled observations', 'Participant and non-participant', 'Overt and covert observation', 'Inter-observer reliability'],
        [{ title: 'Observation Methods', date: '16 Sep 2025' }], 2),
      t('1.4', 'Correlations', 'mastered', 83,
        ['Positive, negative, and zero correlations', 'Scatter diagrams', 'Correlation coefficients', 'Correlation vs causation'],
        [{ title: 'Correlational Research', date: '20 Sep 2025' }], 2),
      t('1.5', 'Research methodology and ethics', 'mastered', 80,
        ['Sampling methods: random, opportunity, self-selected', 'Generalisability and ecological validity', 'BPS ethical guidelines', 'Informed consent and debriefing'],
        [{ title: 'Ethics in Research', date: '23 Sep 2025' }], 2.5),
    ],
  },
  {
    id: 2, title: 'The Biological Approach', topics: [
      t('2.1', 'Assumptions of the biological approach', 'mastered', 88,
        ['Behaviour is influenced by genetics and biology', 'CNS and neurotransmitter function', 'Brain localisation of function', 'Evolution and behaviour'],
        [{ title: 'Biological Approach', date: '27 Sep 2025' }], 2.5),
      t('2.2', 'Schachter and Singer (1962)', 'mastered', 84,
        ['Two-factor theory of emotion', 'Epinephrine injection conditions', 'Cognitive labelling of arousal', 'Evaluation of methodology'],
        [{ title: 'Emotion Studies', date: '30 Sep 2025' }], 2),
      t('2.3', 'Canli et al. (2000)', 'mastered', 82,
        ['fMRI brain scanning study', 'Emotional arousal and memory encoding', 'Amygdala activation patterns', 'Individual differences in emotional memory'],
        [{ title: 'Brain Imaging Studies', date: '4 Oct 2025' }], 2),
      t('2.4', 'Dement and Kleitman (1957)', 'mastered', 80,
        ['REM and NREM sleep stages', 'EEG and EOG recordings', 'Dream recall and REM sleep', 'Eye movement direction and dream content'],
        [{ title: 'Sleep Research', date: '7 Oct 2025' }], 2),
    ],
  },
  {
    id: 3, title: 'The Cognitive Approach', topics: [
      t('3.1', 'Assumptions of the cognitive approach', 'mastered', 86,
        ['Internal mental processes', 'Schema theory', 'Computer analogy of the mind', 'Information processing models'],
        [{ title: 'Cognitive Approach', date: '11 Oct 2025' }], 2.5),
      t('3.2', 'Andrade (2010)', 'mastered', 82,
        ['Doodling and concentration', 'Dual-task performance', 'Effect on monitoring task recall', 'Working memory implications'],
        [{ title: 'Attention Studies', date: '14 Oct 2025' }], 2),
      t('3.3', 'Baron-Cohen et al. (1997)', 'mastered', 80,
        ['Eyes task and Theory of Mind', 'Autism and empathising-systemising', 'Reading emotions from eyes', 'Comparison with Tourette\'s and typical controls'],
        [{ title: 'Theory of Mind', date: '18 Oct 2025' }], 2),
      t('3.4', 'Laney et al. (2008)', 'mastered', 78,
        ['False memory implantation', 'Food preferences and memory', 'Suggestion and belief change', 'Implications for eyewitness testimony'],
        [{ title: 'Memory & Suggestibility', date: '21 Oct 2025' }], 2),
    ],
  },
  {
    id: 4, title: 'The Learning Approach', topics: [
      t('4.1', 'Assumptions of the learning approach', 'in_progress', 62,
        ['Behaviour is learned from environment', 'Classical and operant conditioning', 'Social learning theory', 'Tabula rasa and nurture'],
        [{ title: 'Learning Approach', date: '25 Oct 2025' }], 2),
      t('4.2', 'Bandura et al. (1961)', 'in_progress', 55,
        ['Bobo doll experiment', 'Observational learning and imitation', 'Role model characteristics', 'Gender differences in aggression'],
        [{ title: 'Social Learning Theory', date: '28 Oct 2025' }], 1.5),
      t('4.3', 'Saavedra and Silverman (2002)', 'in_progress', 48,
        ['Classical conditioning and phobias', 'Disgust and fear conditioning', 'Button phobia case study', 'Treatment implications'],
        [], 1),
      t('4.4', 'Pepperberg (1987)', 'in_progress', 42,
        ['Alex the African Grey Parrot', 'Language acquisition in animals', 'Model/rival training technique', 'Object labelling and categorisation'],
        [], 1),
    ],
  },
  {
    id: 5, title: 'The Social Approach', topics: [
      t('5.1', 'Assumptions of the social approach', 'in_progress', 58,
        ['Behaviour influenced by others', 'Social norms and roles', 'Conformity and obedience', 'Group dynamics and identity'],
        [{ title: 'Social Approach', date: '4 Nov 2025' }], 1.5),
      t('5.2', 'Milgram (1963)', 'in_progress', 50,
        ['Obedience to authority experiment', 'Voltage levels and obedience rates', 'Agentic state theory', 'Ethical concerns and variations'],
        [{ title: 'Obedience Studies', date: '8 Nov 2025' }], 1.5),
      t('5.3', 'Bocchiaro et al. (2012)', 'in_progress', 42,
        ['Obedience and whistle-blowing', 'Predicted vs actual behaviour', 'Situational vs dispositional factors', 'Ethical research design'],
        [], 1),
      t('5.4', 'Yamamoto et al. (2012)', 'in_progress', 38,
        ['Chimpanzee prosocial behaviour', 'Targeted helping in apes', 'Understanding others\' goals', 'Empathy in non-human primates'],
        [], 1),
    ],
  },
  {
    id: 6, title: 'Issues and Debates', topics: [
      t('6.1', 'Nature vs nurture', 'not_started', 0,
        ['Genetic predisposition', 'Environmental influences', 'Gene-environment interaction', 'Twin and adoption studies'],
        [], 0),
      t('6.2', 'Freewill vs determinism', 'not_started', 0,
        ['Hard and soft determinism', 'Biological determinism', 'Environmental determinism', 'Free will in humanistic psychology'],
        [], 0),
      t('6.3', 'Reductionism vs holism', 'not_started', 0,
        ['Biological reductionism', 'Environmental reductionism', 'Holistic approaches', 'Levels of explanation'],
        [], 0),
      t('6.4', 'Individual vs situational explanations', 'not_started', 0,
        ['Dispositional attribution', 'Situational attribution', 'Fundamental attribution error', 'Interactionist approach'],
        [], 0),
      t('6.5', 'Use of children in psychological research', 'not_started', 0,
        ['Ethical considerations with minors', 'Informed consent from parents', 'Competence to consent', 'Protection from harm'],
        [], 0),
    ],
  },
  {
    id: 7, title: 'Psychology and Abnormality', topics: [
      t('7.1', 'Definitions of abnormality', 'not_started', 0,
        ['Statistical infrequency', 'Deviation from social norms', 'Failure to function adequately', 'Deviation from ideal mental health'],
        [], 0),
      t('7.2', 'Depression', 'not_started', 0,
        ['Symptoms and diagnosis', 'Cognitive explanation: Beck\'s negative triad', 'Biological explanation', 'CBT and drug treatments'],
        [], 0),
      t('7.3', 'Bipolar disorder', 'not_started', 0,
        ['Manic and depressive episodes', 'Genetic and neurochemical factors', 'Lithium treatment', 'Psychological interventions'],
        [], 0),
      t('7.4', 'Impulse control disorders', 'not_started', 0,
        ['Characteristics and types', 'Biological and psychological explanations', 'Treatment approaches', 'Gambling disorder as example'],
        [], 0),
    ],
  },
  {
    id: 8, title: 'Psychology and Consumer Behaviour', topics: [
      t('8.1', 'The physical environment', 'not_started', 0,
        ['Store layout and design', 'Music and lighting effects', 'Colour psychology in retail', 'Atmospherics and consumer behaviour'],
        [], 0),
      t('8.2', 'The psychological environment', 'not_started', 0,
        ['Menu design and priming', 'Crowding and personal space', 'Social influence in purchasing', 'Online vs in-store environments'],
        [], 0),
      t('8.3', 'Consumer decision-making', 'not_started', 0,
        ['Cognitive biases in purchasing', 'Heuristics and decision shortcuts', 'Brand loyalty and recognition', 'Impulse buying'],
        [], 0),
      t('8.4', 'The product', 'not_started', 0,
        ['Packaging and labelling effects', 'Product placement', 'Celebrity endorsement', 'Ethical consumption'],
        [], 0),
    ],
  },
  {
    id: 9, title: 'Psychology and Health', topics: [
      t('9.1', 'The patient-practitioner relationship', 'not_started', 0,
        ['Communication styles', 'Practitioner and patient factors', 'Non-verbal communication in healthcare', 'Cultural factors in health consultations'],
        [], 0),
      t('9.2', 'Adherence to medical advice', 'not_started', 0,
        ['Measuring adherence', 'Reasons for non-adherence', 'Improving adherence strategies', 'Health belief model'],
        [], 0),
      t('9.3', 'Pain', 'not_started', 0,
        ['Gate control theory', 'Biological and psychological factors', 'Measuring pain', 'Pain management strategies'],
        [], 0),
      t('9.4', 'Stress', 'not_started', 0,
        ['Sources of stress', 'Physiological response to stress', 'Stress management techniques', 'Stress and illness'],
        [], 0),
    ],
  },
  {
    id: 10, title: 'Psychology and Organisations', topics: [
      t('10.1', 'Motivation to work', 'not_started', 0,
        ['Need theories: Maslow, McClelland', 'Cognitive theories: equity theory', 'Job design and enrichment', 'Intrinsic and extrinsic motivation'],
        [], 0),
      t('10.2', 'Leadership and management', 'not_started', 0,
        ['Trait theories of leadership', 'Contingency models: Fiedler', 'Transformational vs transactional leadership', 'Leader effectiveness'],
        [], 0),
      t('10.3', 'Group behaviour in organisations', 'not_started', 0,
        ['Group formation and development', 'Group decision-making: groupthink', 'Social loafing', 'Team roles: Belbin'],
        [], 0),
      t('10.4', 'Organisational work conditions', 'not_started', 0,
        ['Workplace bullying and harassment', 'Temporal conditions: shift work', 'Physical work environment', 'Health and safety psychology'],
        [], 0),
    ],
  },
]

/* ────────────────────────────────────────────────────────────
   SYLLABI array
   ──────────────────────────────────────────────────────────── */
const SYLLABI: Syllabus[] = [
  {
    id: 'igcse-bio-cie',
    name: 'IGCSE Biology',
    board: 'CIE',
    code: '0610',
    level: 'IGCSE',
    chapters: IGCSE_BIO_CHAPTERS,
  },
  {
    id: 'al-bio-cie',
    name: 'AS & A-Level Biology',
    board: 'CIE',
    code: '9700',
    level: 'AS & A-Level',
    chapters: CIE_ALEVEL_BIO_CHAPTERS,
  },
  {
    id: 'al-chem-edexcel',
    name: 'AS/A2 Chemistry',
    board: 'Edexcel International',
    code: '',
    level: 'AS/A2',
    chapters: EDEXCEL_CHEM_CHAPTERS,
  },
  {
    id: 'al-bus-edexcel',
    name: 'AS/A2 Business Studies',
    board: 'Edexcel International',
    code: '',
    level: 'AS/A2',
    chapters: EDEXCEL_BUS_CHAPTERS,
  },
  {
    id: 'al-psych-cie',
    name: 'AS & A-Level Psychology',
    board: 'CIE',
    code: '9990',
    level: 'AS & A-Level',
    chapters: CIE_PSYCH_CHAPTERS,
  },
]

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */
type FilterType = 'all' | 'mastered' | 'in_progress' | 'not_started'

function getAllTopics(chapters: Chapter[]) {
  return chapters.flatMap((c) => c.topics)
}

function getOverallStats(chapters: Chapter[]) {
  const all = getAllTopics(chapters)
  const total = all.length
  const mastered = all.filter((t) => t.status === 'mastered').length
  const inProgress = all.filter((t) => t.status === 'in_progress').length
  const totalHours = Math.round(all.reduce((s, t) => s + t.hoursStudied, 0))
  const pct = total > 0 ? Math.round(((mastered + inProgress * 0.4) / total) * 100) : 0
  return { total, mastered, inProgress, totalHours, pct, chaptersCompleted: chapters.filter(c => c.topics.every(t => t.status === 'mastered')).length, totalChapters: chapters.length }
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
   Practice Panel — 10-question quiz
   ──────────────────────────────────────────────────────────── */
function PracticePanel({ onBack }: { onBack: () => void }) {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, { selected: number | string; correct: boolean }>>({})
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [shortAnswer, setShortAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)

  const q = DEMO_QUIZ_QUESTIONS[currentQ]
  const answered = answers[q.id] !== undefined
  const score = Object.values(answers).filter((a) => a.correct).length

  const checkAnswer = () => {
    if (q.type === 'mcq' && selectedOption !== null) {
      setAnswers((prev) => ({ ...prev, [q.id]: { selected: selectedOption, correct: selectedOption === q.correctIndex } }))
      setShowResult(true)
    } else if (q.type === 'short' && shortAnswer.trim()) {
      // For short answers, check if key terms are present
      const answer = shortAnswer.toLowerCase()
      const isCorrect = q.id === 8
        ? answer.includes('50') && (answer.includes('\u03bcm') || answer.includes('um') || answer.includes('micro'))
        : answer.includes('resolution') && answer.includes('magnification')
      setAnswers((prev) => ({ ...prev, [q.id]: { selected: shortAnswer, correct: isCorrect } }))
      setShowResult(true)
    }
  }

  const nextQuestion = () => {
    if (currentQ < DEMO_QUIZ_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1)
      setSelectedOption(null)
      setShortAnswer('')
      setShowResult(false)
    } else {
      setQuizComplete(true)
    }
  }

  const retryQuiz = () => {
    setCurrentQ(0)
    setAnswers({})
    setSelectedOption(null)
    setShortAnswer('')
    setShowResult(false)
    setQuizComplete(false)
  }

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A*', color: 'text-emerald-600' }
    if (pct >= 80) return { grade: 'A', color: 'text-emerald-500' }
    if (pct >= 70) return { grade: 'B', color: 'text-blue-500' }
    if (pct >= 60) return { grade: 'C', color: 'text-amber-500' }
    if (pct >= 50) return { grade: 'D', color: 'text-orange-500' }
    return { grade: 'U', color: 'text-red-500' }
  }

  if (quizComplete) {
    const pct = Math.round((score / DEMO_QUIZ_QUESTIONS.length) * 100)
    const { grade, color } = getGrade(pct)
    const wrongQuestions = DEMO_QUIZ_QUESTIONS.filter((q) => !answers[q.id]?.correct)

    return (
      <div className="p-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#7C3AED] mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to topic
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] mb-3">
            <span className="text-2xl font-bold text-white">{score}/{DEMO_QUIZ_QUESTIONS.length}</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{pct}%</p>
          <p className={`text-2xl font-black ${color}`}>Grade: {grade}</p>
        </div>

        {/* Question summary */}
        <div className="space-y-1.5 mb-4">
          {DEMO_QUIZ_QUESTIONS.map((qq, i) => {
            const a = answers[qq.id]
            return (
              <div key={qq.id} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs ${a?.correct ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                {a?.correct
                  ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  : <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                }
                <span className="text-slate-600 dark:text-slate-400 shrink-0">Q{i + 1}.</span>
                <span className="text-slate-700 dark:text-slate-300 truncate">{qq.question.slice(0, 60)}...</span>
              </div>
            )
          })}
        </div>

        {/* Weak areas */}
        {wrongQuestions.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5">Areas to review:</p>
            <ul className="space-y-1">
              {wrongQuestions.map((wq) => (
                <li key={wq.id} className="text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                  <span className="shrink-0 mt-0.5">&#x2022;</span>
                  {wq.question.slice(0, 80)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={retryQuiz} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Retry
          </button>
          <button onClick={onBack} className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-[#232536] text-slate-600 dark:text-slate-400 text-xs font-medium hover:border-[#7C3AED]/40 transition-colors">
            Back to Syllabus
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#7C3AED] mb-3 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to topic
      </button>

      {/* Header with progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Question {currentQ + 1}/{DEMO_QUIZ_QUESTIONS.length}</span>
        <span className="text-xs font-semibold text-[#7C3AED]">Score: {score}/{Object.keys(answers).length || 0}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-200 dark:bg-[#252839] rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-[#7C3AED] rounded-full transition-all duration-300" style={{ width: `${((currentQ + (answered ? 1 : 0)) / DEMO_QUIZ_QUESTIONS.length) * 100}%` }} />
      </div>

      {/* Question */}
      <p className="text-sm font-medium text-slate-900 dark:text-white mb-4 leading-relaxed">{q.question}</p>

      {/* Answer area */}
      {q.type === 'mcq' ? (
        <div className="space-y-2 mb-4">
          {q.options!.map((opt, i) => {
            let cls = 'border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#252839] hover:border-[#7C3AED]/40'
            if (answered) {
              if (i === q.correctIndex) cls = 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
              else if (i === answers[q.id]?.selected && !answers[q.id]?.correct) cls = 'border-2 border-red-500 bg-red-50 dark:bg-red-900/20'
              else cls = 'border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#252839] opacity-50'
            } else if (selectedOption === i) {
              cls = 'border-2 border-[#7C3AED] bg-[#EDE9FE] dark:bg-[#7C3AED]/20'
            }
            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => setSelectedOption(i)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 transition-all flex items-center gap-2.5 ${cls}`}
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {answered && i === q.correctIndex && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                {answered && i === answers[q.id]?.selected && !answers[q.id]?.correct && <X className="w-4 h-4 text-red-500 shrink-0" />}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="mb-4">
          <textarea
            value={shortAnswer}
            onChange={(e) => setShortAnswer(e.target.value)}
            disabled={answered}
            placeholder="Type your answer here..."
            className="w-full h-24 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#252839] text-slate-700 dark:text-slate-300 placeholder-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
          />
        </div>
      )}

      {/* Explanation after answering */}
      {answered && (
        <div className={`p-3 rounded-lg mb-4 text-xs leading-relaxed ${
          answers[q.id]?.correct
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400'
        }`}>
          <p className="font-semibold mb-1">{answers[q.id]?.correct ? 'Correct!' : 'Incorrect'}</p>
          <p>{q.explanation}</p>
        </div>
      )}

      {/* Action buttons */}
      {!answered ? (
        <button
          onClick={checkAnswer}
          disabled={q.type === 'mcq' ? selectedOption === null : !shortAnswer.trim()}
          className="w-full py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
        >
          Check Answer
        </button>
      ) : (
        <button onClick={nextQuestion} className="w-full py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium transition-colors">
          {currentQ < DEMO_QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'See Results'}
        </button>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Study with AI Panel — Chat interface
   ──────────────────────────────────────────────────────────── */
function StudyAIPanel({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasClickedSuggestion, setHasClickedSuggestion] = useState(false)

  const handleSuggestion = useCallback((suggestion: string) => {
    setHasClickedSuggestion(true)
    setMessages([{ role: 'user', text: suggestion }])
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [...prev, { role: 'ai', text: DEMO_AI_RESPONSE }])
    }, 1500)
  }, [])

  const handleSend = useCallback(() => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }])
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [...prev, { role: 'ai', text: 'In demo mode, AI responses are simulated. Connect to the API for real AI-powered study assistance.' }])
    }, 1200)
  }, [input])

  // Simple markdown bold rendering
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
        }
        return <span key={j}>{part}</span>
      })
      return <p key={i} className={line === '' ? 'h-2' : ''}>{parts}</p>
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2 shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#7C3AED] mb-3 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to topic
        </button>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Study Assistant</p>
            <p className="text-[10px] text-slate-400">The microscope in cell studies</p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3" style={{ scrollbarWidth: 'thin' }}>
        {/* System welcome */}
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center shrink-0 mt-0.5">
            <Bot className="w-3 h-3 text-white" />
          </div>
          <div className="flex-1 bg-slate-100 dark:bg-[#252839] rounded-xl rounded-tl-sm px-3 py-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            I'm your AI study assistant for <strong className="font-semibold">The microscope in cell studies</strong>. Ask me anything about this topic, or try one of the suggested questions below.
          </div>
        </div>

        {/* Suggestion chips */}
        {!hasClickedSuggestion && (
          <div className="flex flex-wrap gap-1.5 ml-8">
            {AI_SUGGESTED_QUESTIONS.map((sq) => (
              <button
                key={sq}
                onClick={() => handleSuggestion(sq)}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA] hover:bg-[#DDD6FE] dark:hover:bg-[#7C3AED]/30 transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3 h-3 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[#7C3AED] text-white rounded-tr-sm'
                : 'bg-slate-100 dark:bg-[#252839] text-slate-700 dark:text-slate-300 rounded-tl-sm'
            }`}>
              {msg.role === 'ai' ? renderText(msg.text) : msg.text}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="bg-slate-100 dark:bg-[#252839] rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-slate-200 dark:border-[#232536] shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about this topic..."
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#252839] text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 text-white transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Resources Panel — Videos, docs, flashcards
   ──────────────────────────────────────────────────────────── */
function ResourcesPanel({ onBack }: { onBack: () => void }) {
  const [showFlashcards, setShowFlashcards] = useState(false)
  const [currentCard, setCurrentCard] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (showFlashcards) {
    const card = DEMO_FLASHCARDS[currentCard]
    return (
      <div className="p-4">
        <button onClick={() => { setShowFlashcards(false); setCurrentCard(0); setFlipped(false) }} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#7C3AED] mb-3 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to resources
        </button>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Flashcard {currentCard + 1}/{DEMO_FLASHCARDS.length}</span>
          <span className="text-[10px] text-slate-400">Click card to flip</span>
        </div>

        {/* Flashcard */}
        <button
          onClick={() => setFlipped(!flipped)}
          className="w-full min-h-[160px] rounded-xl border-2 border-[#7C3AED]/30 bg-white dark:bg-[#252839] p-5 text-center transition-all hover:border-[#7C3AED]/60 hover:shadow-md cursor-pointer"
          style={{ perspective: '1000px' }}
        >
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full mb-3 inline-block ${
            flipped ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-[#EDE9FE] dark:bg-[#7C3AED]/20 text-[#7C3AED]'
          }`}>
            {flipped ? 'Answer' : 'Question'}
          </span>
          <p className="text-sm font-medium text-slate-900 dark:text-white mt-2 leading-relaxed">
            {flipped ? card.back : card.front}
          </p>
        </button>

        {/* Navigation */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => { setCurrentCard(Math.max(0, currentCard - 1)); setFlipped(false) }}
            disabled={currentCard === 0}
            className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-[#232536] text-slate-600 dark:text-slate-400 text-xs font-medium disabled:opacity-40 hover:border-[#7C3AED]/40 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => { setCurrentCard(Math.min(DEMO_FLASHCARDS.length - 1, currentCard + 1)); setFlipped(false) }}
            disabled={currentCard === DEMO_FLASHCARDS.length - 1}
            className="flex-1 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 text-white text-xs font-medium transition-colors"
          >
            Next
          </button>
        </div>

        {/* Card indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {DEMO_FLASHCARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentCard(i); setFlipped(false) }}
              className={`w-2 h-2 rounded-full transition-colors ${i === currentCard ? 'bg-[#7C3AED]' : 'bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#7C3AED] mb-3 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to topic
      </button>

      {/* Video Resources */}
      <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <Video className="w-3.5 h-3.5 text-[#7C3AED]" />
        Video Resources
      </h3>
      <div className="space-y-2 mb-5">
        {DEMO_VIDEOS.map((vid) => (
          <div key={vid.title} className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#252839] hover:border-[#7C3AED]/40 transition-colors cursor-pointer group">
            <div className={`w-16 h-10 rounded-md bg-gradient-to-br ${vid.color} flex items-center justify-center shrink-0`}>
              <Play className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-[#7C3AED] transition-colors">{vid.title}</p>
              <p className="text-[10px] text-slate-400">{vid.author}</p>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-[#1a1d2e] px-1.5 py-0.5 rounded shrink-0">{vid.duration}</span>
          </div>
        ))}
      </div>

      {/* Document Resources */}
      <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <FileText className="w-3.5 h-3.5 text-[#7C3AED]" />
        Documents
      </h3>
      <div className="space-y-1.5 mb-5">
        {DEMO_DOCS.map((doc) => (
          <div key={doc.title} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#252839] hover:border-[#7C3AED]/40 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-[#7C3AED] transition-colors">{doc.title}</p>
              <p className="text-[10px] text-slate-400">{doc.pages} page{doc.pages > 1 ? 's' : ''}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Flashcards */}
      <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <RotateCcw className="w-3.5 h-3.5 text-[#7C3AED]" />
        Flashcards
      </h3>
      <div className="p-3 rounded-lg border border-slate-200 dark:border-[#232536] bg-white dark:bg-[#252839]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{DEMO_FLASHCARDS.length} flashcards for this topic</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Click to flip, study key definitions</p>
          </div>
          <button
            onClick={() => setShowFlashcards(true)}
            className="px-3 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[11px] font-medium transition-colors"
          >
            Start Flashcards
          </button>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Demo unavailable message
   ──────────────────────────────────────────────────────────── */
function DemoUnavailablePanel({ panelName, onBack }: { panelName: string; onBack: () => void }) {
  return (
    <div className="p-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#7C3AED] mb-4 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to topic
      </button>
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-14 h-14 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6 text-[#7C3AED]" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{panelName} — Demo</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
          Demo content available for topic 1.1 — The microscope in cell studies. Select that topic in CIE AS Biology (9700) to try the full experience.
        </p>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Main Page
   ──────────────────────────────────────────────────────────── */
export default function Curriculum() {
  const [selectedSyllabus, setSelectedSyllabus] = useState('igcse-bio-cie')
  const currentSyllabus = useMemo(() => SYLLABI.find(s => s.id === selectedSyllabus)!, [selectedSyllabus])
  const chapters = currentSyllabus.chapters

  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(() => {
    const first = chapters.find(c => getChapterProgress(c).status === 'in_progress')
    return new Set(first ? [first.id] : [])
  })
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)

  const stats = useMemo(() => getOverallStats(chapters), [chapters])

  // Reset state when syllabus changes
  const handleSyllabusChange = (id: string) => {
    setSelectedSyllabus(id)
    setSelectedTopic(null)
    setSelectedChapterId(null)
    setSearchQuery('')
    setFilter('all')
    setActivePanel(null)
    const newSyllabus = SYLLABI.find(s => s.id === id)!
    const first = newSyllabus.chapters.find(c => getChapterProgress(c).status === 'in_progress')
    setExpandedChapters(new Set(first ? [first.id] : []))
  }

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
    setActivePanel(null)
  }

  // Filtering
  const filteredChapters = useMemo(() => {
    return chapters.map((chapter) => {
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
  }, [filter, searchQuery, chapters])

  const selectedChapter = selectedChapterId
    ? chapters.find((c) => c.id === selectedChapterId)
    : null

  // Group syllabi by board for the dropdown
  const boardGroups = useMemo(() => {
    const groups: Record<string, Syllabus[]> = {}
    for (const s of SYLLABI) {
      if (!groups[s.board]) groups[s.board] = []
      groups[s.board].push(s)
    }
    return groups
  }, [])

  return (
    <Layout>
      <div className="px-4 sm:px-5 py-3 h-[calc(100vh-56px)] md:h-screen flex flex-col overflow-hidden">
        {/* -- Header -- */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl font-bold text-[#1E1B4B] dark:text-white">My Curriculum</h1>
              <div className="relative">
                <select
                  value={selectedSyllabus}
                  onChange={(e) => handleSyllabusChange(e.target.value)}
                  className="appearance-none text-[11px] font-medium pl-2.5 pr-7 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] dark:bg-[#7C3AED]/20 dark:text-[#A78BFA] border border-[#DDD6FE] dark:border-[#7C3AED]/30 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#7C3AED] hover:bg-[#DDD6FE] dark:hover:bg-[#7C3AED]/30 transition-colors"
                >
                  {Object.entries(boardGroups).map(([board, syllabi]) => (
                    <optgroup key={board} label={board}>
                      {syllabi.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}{s.code ? ` (${s.code})` : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#7C3AED] dark:text-[#A78BFA] pointer-events-none" />
              </div>
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

        {/* -- Stats bar -- */}
        <div className="flex items-center gap-3 mb-3 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{stats.pct}% complete</span>
              <span className="text-[11px] text-slate-400">
                {stats.chaptersCompleted}/{stats.totalChapters} chapters completed
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

        {/* -- Search & Filters -- */}
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

        {/* -- Two-column layout -- */}
        <div className="flex gap-3 flex-1 min-h-0 overflow-hidden">
          {/* Left: Chapter list */}
          <div className="w-[60%] overflow-y-auto pr-1 space-y-1.5" style={{ scrollbarWidth: 'thin' }}>
            {filteredChapters.map((chapter) => {
              const prog = getChapterProgress(chapters.find(c => c.id === chapter.id)!)
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

          {/* Right: Topic detail / interactive panel */}
          <div className={`w-[40%] border border-slate-200 dark:border-[#232536] rounded-lg bg-white dark:bg-[#1a1d2e] flex flex-col ${activePanel === 'study-ai' ? '' : 'overflow-y-auto'}`} style={{ scrollbarWidth: 'thin' }}>
            {/* Active panel overlay */}
            {selectedTopic && activePanel ? (
              isDemoTopic(selectedSyllabus, selectedTopic.id) ? (
                activePanel === 'practice' ? (
                  <PracticePanel onBack={() => setActivePanel(null)} />
                ) : activePanel === 'study-ai' ? (
                  <StudyAIPanel onBack={() => setActivePanel(null)} />
                ) : (
                  <ResourcesPanel onBack={() => setActivePanel(null)} />
                )
              ) : (
                <DemoUnavailablePanel
                  panelName={activePanel === 'practice' ? 'Practice Questions' : activePanel === 'study-ai' ? 'Study with AI' : 'Resources'}
                  onBack={() => setActivePanel(null)}
                />
              )
            ) : selectedTopic ? (
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
                  <button
                    onClick={() => setActivePanel('practice')}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium transition-colors"
                  >
                    <Beaker className="w-3.5 h-3.5" />
                    Practice
                  </button>
                  <button
                    onClick={() => setActivePanel('study-ai')}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED]/10 text-xs font-medium transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Study with AI
                  </button>
                  <button
                    onClick={() => setActivePanel('resources')}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-slate-200 dark:border-[#232536] text-slate-600 dark:text-slate-400 hover:border-[#7C3AED]/40 hover:text-[#7C3AED] text-xs font-medium transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Resources
                  </button>
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
