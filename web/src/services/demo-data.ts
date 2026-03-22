/**
 * Demo mode mock data for all student-facing pages.
 * Activated via the "Demo as Student" button on the login page.
 */

export const DEMO_USER = {
  id: 1,
  name: 'Alex Johnson',
  email: 'alex@demo.mentivara.com',
  role: 'student' as const,
  status: 'active',
}

export const DEMO_TOKEN = 'demo-token-mentivara-student'

// ── Reference data ──────────────────────────────────────────

export const SUBJECTS = [
  { id: 1, name: 'Mathematics', slug: 'maths' },
  { id: 2, name: 'English', slug: 'english' },
  { id: 3, name: 'Biology', slug: 'biology' },
  { id: 4, name: 'Chemistry', slug: 'chemistry' },
  { id: 5, name: 'Physics', slug: 'physics' },
]

export const LEVELS = [
  { id: 1, name: 'GCSE', slug: 'gcse' },
  { id: 2, name: 'IGCSE', slug: 'igcse' },
  { id: 3, name: 'AS Level', slug: 'as' },
  { id: 4, name: 'A-Level', slug: 'a-level' },
]

// ── Tutors ──────────────────────────────────────────────────

export const TUTORS = [
  {
    id: 1,
    user_id: 10,
    bio: 'Cambridge Mathematics graduate with 8 years of tutoring experience. I specialise in making complex concepts intuitive through real-world examples and visual learning.',
    qualifications: 'BA Mathematics (Cambridge), PGCE, QTS',
    intro_video_url: null,
    verified: true,
    user: { id: 10, name: 'Dr Sarah Mitchell', email: 'sarah@mentivara.com', avatar: null },
    subjects: [
      { id: 1, subject: SUBJECTS[0], level: LEVELS[0], exam_board: null },
      { id: 2, subject: SUBJECTS[0], level: LEVELS[3], exam_board: null },
    ],
  },
  {
    id: 2,
    user_id: 11,
    bio: 'Passionate science educator with a PhD in Biochemistry. I help students build deep understanding rather than just memorising facts.',
    qualifications: 'PhD Biochemistry (Imperial), MSc Molecular Biology',
    intro_video_url: null,
    verified: true,
    user: { id: 11, name: 'James Chen', email: 'james@mentivara.com', avatar: null },
    subjects: [
      { id: 3, subject: SUBJECTS[2], level: LEVELS[0], exam_board: null },
      { id: 4, subject: SUBJECTS[2], level: LEVELS[3], exam_board: null },
      { id: 5, subject: SUBJECTS[3], level: LEVELS[0], exam_board: null },
    ],
  },
  {
    id: 3,
    user_id: 12,
    bio: 'English Literature enthusiast and published author. I help students develop critical analysis skills and confident essay writing.',
    qualifications: 'MA English Literature (Oxford), Published Author',
    intro_video_url: null,
    verified: true,
    user: { id: 12, name: 'Emma Richardson', email: 'emma@mentivara.com', avatar: null },
    subjects: [
      { id: 6, subject: SUBJECTS[1], level: LEVELS[0], exam_board: null },
      { id: 7, subject: SUBJECTS[1], level: LEVELS[3], exam_board: null },
    ],
  },
  {
    id: 4,
    user_id: 13,
    bio: 'Former physics researcher turned educator. I make abstract physics concepts concrete through experiments and problem-solving.',
    qualifications: 'MSc Physics (UCL), PGCE Secondary Science',
    intro_video_url: null,
    verified: true,
    user: { id: 13, name: 'Dr Raj Patel', email: 'raj@mentivara.com', avatar: null },
    subjects: [
      { id: 8, subject: SUBJECTS[4], level: LEVELS[0], exam_board: null },
      { id: 9, subject: SUBJECTS[4], level: LEVELS[3], exam_board: null },
    ],
  },
]

const TUTOR_LIST = TUTORS.map((t) => ({
  id: t.id,
  name: t.user.name,
  avatar: t.user.avatar,
  bio: t.bio,
  verified: t.verified,
  subjects: t.subjects.map((s) => ({
    name: s.subject?.name ?? '',
    levels: [s.level?.name ?? ''],
  })),
}))

// ── Lessons ─────────────────────────────────────────────────

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
tomorrow.setHours(10, 0, 0, 0)

const nextWeek = new Date()
nextWeek.setDate(nextWeek.getDate() + 7)
nextWeek.setHours(14, 0, 0, 0)

const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)
yesterday.setHours(15, 0, 0, 0)

const lastWeek = new Date()
lastWeek.setDate(lastWeek.getDate() - 7)
lastWeek.setHours(11, 0, 0, 0)

export const UPCOMING_LESSONS = [
  {
    id: 1,
    tutor: { id: 10, name: 'Dr Sarah Mitchell', avatar: null },
    student: { id: 1, name: 'Alex Johnson', avatar: null },
    subject: { id: 1, name: 'Mathematics' },
    scheduled_at: tomorrow.toISOString(),
    duration_minutes: 60,
    status: 'scheduled',
    is_recurring: true,
    notes: 'Continue with quadratic equations',
    recording_url: null,
  },
  {
    id: 2,
    tutor: { id: 11, name: 'James Chen', avatar: null },
    student: { id: 1, name: 'Alex Johnson', avatar: null },
    subject: { id: 3, name: 'Biology' },
    scheduled_at: nextWeek.toISOString(),
    duration_minutes: 45,
    status: 'scheduled',
    is_recurring: false,
    notes: 'Cell division recap before mock',
    recording_url: null,
  },
]

export const PAST_LESSONS = [
  {
    id: 3,
    tutor: { id: 10, name: 'Dr Sarah Mitchell', avatar: null },
    student: { id: 1, name: 'Alex Johnson', avatar: null },
    subject: { id: 1, name: 'Mathematics' },
    scheduled_at: yesterday.toISOString(),
    duration_minutes: 60,
    status: 'completed',
    is_recurring: true,
    notes: 'Linear equations and graphing',
    recording_url: null,
  },
  {
    id: 4,
    tutor: { id: 12, name: 'Emma Richardson', avatar: null },
    student: { id: 1, name: 'Alex Johnson', avatar: null },
    subject: { id: 2, name: 'English' },
    scheduled_at: lastWeek.toISOString(),
    duration_minutes: 60,
    status: 'completed',
    is_recurring: false,
    notes: 'Essay writing techniques',
    recording_url: null,
  },
]

// ── Knowledge Map ───────────────────────────────────────────

export const KNOWLEDGE_MAP: Record<string, Array<{
  topic_id: number
  topic_name: string
  subject: string
  level: string
  mastery_pct: number
  questions_attempted: number
  questions_correct: number
}>> = {
  Mathematics: [
    { topic_id: 1, topic_name: 'Algebra', subject: 'Mathematics', level: 'GCSE', mastery_pct: 82, questions_attempted: 45, questions_correct: 37 },
    { topic_id: 2, topic_name: 'Trigonometry', subject: 'Mathematics', level: 'GCSE', mastery_pct: 45, questions_attempted: 20, questions_correct: 9 },
    { topic_id: 3, topic_name: 'Geometry', subject: 'Mathematics', level: 'GCSE', mastery_pct: 70, questions_attempted: 30, questions_correct: 21 },
    { topic_id: 4, topic_name: 'Statistics', subject: 'Mathematics', level: 'GCSE', mastery_pct: 90, questions_attempted: 25, questions_correct: 23 },
    { topic_id: 5, topic_name: 'Number', subject: 'Mathematics', level: 'GCSE', mastery_pct: 95, questions_attempted: 50, questions_correct: 48 },
  ],
  Biology: [
    { topic_id: 6, topic_name: 'Cell Biology', subject: 'Biology', level: 'GCSE', mastery_pct: 60, questions_attempted: 15, questions_correct: 9 },
    { topic_id: 7, topic_name: 'Organisation', subject: 'Biology', level: 'GCSE', mastery_pct: 35, questions_attempted: 10, questions_correct: 4 },
    { topic_id: 8, topic_name: 'Infection & Response', subject: 'Biology', level: 'GCSE', mastery_pct: 50, questions_attempted: 12, questions_correct: 6 },
  ],
  English: [
    { topic_id: 9, topic_name: 'Creative Writing', subject: 'English', level: 'GCSE', mastery_pct: 75, questions_attempted: 8, questions_correct: 6 },
    { topic_id: 10, topic_name: 'Reading Comprehension', subject: 'English', level: 'GCSE', mastery_pct: 88, questions_attempted: 16, questions_correct: 14 },
  ],
}

// ── Exam questions (BankQuestion format) ────────────────────

export interface BankQuestion {
  id: number
  content: string
  type: 'mcq' | 'structured' | 'extended'
  marks: number
  difficulty: number
  topic_id: string
  subtopic: string
  syllabus_id: string
  exam_board: string
  year: number
  paper: string
  options?: string[]
  correct_answer: string
  mark_scheme: string[]
  explanation: string
}

export const EXAM_QUESTION_BANK: BankQuestion[] = [
  {
    id: 1, content: 'Which type of microscope has the highest resolution?', type: 'mcq', marks: 1, difficulty: 1,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2023, paper: 'Paper 1',
    options: ['Light microscope', 'Transmission electron microscope', 'Scanning electron microscope', 'Phase contrast microscope'],
    correct_answer: 'B', mark_scheme: ['Transmission electron microscope has resolution of 0.1 nm'], explanation: 'TEM fires electrons through a thin specimen, achieving the highest resolution of approximately 0.1 nm, far exceeding light microscopes (~200 nm) and SEM (~1 nm).',
  },
  {
    id: 2, content: 'What is the approximate resolution of an optical (light) microscope?', type: 'mcq', marks: 1, difficulty: 1,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2023, paper: 'Paper 1',
    options: ['0.1 nm', '2 nm', '200 nm', '200 \u00b5m'],
    correct_answer: 'C', mark_scheme: ['200 nm / 0.2 \u00b5m'], explanation: 'The resolution limit of a light microscope is approximately 200 nm (0.2 \u00b5m), determined by the wavelength of visible light.',
  },
  {
    id: 3, content: 'A cell has an actual diameter of 50 \u00b5m and is drawn with a diameter of 100 mm. What is the magnification?', type: 'mcq', marks: 1, difficulty: 2,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2022, paper: 'Paper 1',
    options: ['\u00d750', '\u00d7200', '\u00d72000', '\u00d720000'],
    correct_answer: 'C', mark_scheme: ['Magnification = image size / actual size = 100000 \u00b5m / 50 \u00b5m = \u00d72000'], explanation: 'Convert 100 mm to 100,000 \u00b5m, then divide by actual size: 100,000 / 50 = \u00d72000.',
  },
  {
    id: 4, content: 'Which organelle is visible under a light microscope?', type: 'mcq', marks: 1, difficulty: 1,
    topic_id: '1.2', subtopic: 'Cells as the basic units of living organisms', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2023, paper: 'Paper 1',
    options: ['Ribosomes', 'Endoplasmic reticulum', 'Nucleus', 'Lysosomes'],
    correct_answer: 'C', mark_scheme: ['Nucleus is large enough (~5\u00b5m) to be seen under light microscope'], explanation: 'The nucleus is typically 5-10 \u00b5m in diameter, well above the 200 nm resolution limit. Ribosomes (~20 nm) and ER require electron microscopy.',
  },
  {
    id: 5, content: 'An image of a mitochondrion is 40 mm long. The actual length is 2 \u00b5m. Calculate the magnification of the image.', type: 'mcq', marks: 1, difficulty: 2,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2022, paper: 'Paper 1',
    options: ['\u00d720', '\u00d7200', '\u00d72000', '\u00d720000'],
    correct_answer: 'D', mark_scheme: ['40 mm = 40000 \u00b5m; 40000 / 2 = \u00d720000'], explanation: 'Magnification = image size / actual size. Convert 40 mm to 40,000 \u00b5m, then 40,000 / 2 = \u00d720,000.',
  },
  {
    id: 6, content: 'Explain how a specimen is prepared for viewing under a transmission electron microscope.', type: 'structured', marks: 3, difficulty: 3,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2023, paper: 'Paper 2',
    correct_answer: 'fixed, dehydrated, embedded, ultrathin section, stained with heavy metals',
    mark_scheme: ['Specimen is fixed (killed and preserved) using chemicals such as glutaraldehyde', 'Specimen is dehydrated and embedded in resin, then cut into ultrathin sections', 'Sections are stained with heavy metal salts (e.g. lead citrate / uranyl acetate) to increase contrast'],
    explanation: 'TEM requires ultrathin sections (50-100 nm) so electrons can pass through. Heavy metal stains scatter electrons differently to create contrast in the image.',
  },
  {
    id: 7, content: 'State three differences between prokaryotic cells and eukaryotic cells.', type: 'structured', marks: 3, difficulty: 2,
    topic_id: '1.2', subtopic: 'Cells as the basic units of living organisms', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2022, paper: 'Paper 2',
    correct_answer: 'no nucleus, no membrane-bound organelles, smaller ribosomes, circular DNA, smaller size',
    mark_scheme: ['Prokaryotes have no true nucleus / no nuclear envelope; DNA is free in cytoplasm', 'Prokaryotes have no membrane-bound organelles (e.g. no mitochondria, no ER)', 'Prokaryotes have smaller (70S) ribosomes compared to eukaryotic (80S) ribosomes'],
    explanation: 'Prokaryotic cells are fundamentally simpler in structure. They lack the compartmentalisation seen in eukaryotic cells.',
  },
  {
    id: 8, content: 'Describe the role of staining in light microscopy.', type: 'structured', marks: 2, difficulty: 2,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2023, paper: 'Paper 2',
    correct_answer: 'adds contrast, different stains bind to different structures',
    mark_scheme: ['Staining adds contrast / colour to transparent or colourless structures', 'Different stains bind to specific cell components, e.g. iodine stains starch, methylene blue stains nuclei'],
    explanation: 'Most biological material is transparent, so staining is essential to increase contrast and allow structures to be distinguished under a light microscope.',
  },
  {
    id: 9, content: 'A micrograph shows a cell with an image diameter of 60 mm. The magnification is \u00d73000. Calculate the actual diameter of the cell. Show your working.', type: 'structured', marks: 2, difficulty: 3,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2022, paper: 'Paper 2',
    correct_answer: '20 \u00b5m',
    mark_scheme: ['Actual size = image size / magnification = 60 mm / 3000 = 0.02 mm', 'Convert to \u00b5m: 0.02 mm = 20 \u00b5m'],
    explanation: 'Using the formula: actual size = image size / magnification. 60 mm / 3000 = 0.02 mm = 20 \u00b5m.',
  },
  {
    id: 10, content: 'Distinguish between magnification and resolution in microscopy.', type: 'structured', marks: 2, difficulty: 2,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2023, paper: 'Paper 2',
    correct_answer: 'magnification is how much larger the image is; resolution is the ability to distinguish two close points',
    mark_scheme: ['Magnification is the number of times larger an image is compared to the actual object', 'Resolution is the ability to distinguish between two separate points / the minimum distance apart that two objects can be clearly seen as separate'],
    explanation: 'Resolution, not magnification, determines the useful detail. Beyond the resolution limit, you are simply enlarging the blur.',
  },
  {
    id: 11, content: 'Compare and contrast the use of light microscopes and electron microscopes in the study of cell structure. Discuss the advantages and limitations of each type.', type: 'extended', marks: 6, difficulty: 4,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2023, paper: 'Paper 4',
    correct_answer: 'comprehensive comparison of light vs electron microscopes',
    mark_scheme: ['Light microscopes use visible light; electron microscopes use beams of electrons', 'Light microscopes have lower resolution (~200 nm) compared to electron microscopes (TEM ~0.1 nm)', 'Light microscopes can view living specimens; electron microscopes require dead/fixed specimens', 'Light microscopes are cheaper, portable, and easier to use', 'TEM shows internal ultrastructure; SEM shows 3D surface detail', 'Electron microscopes require vacuum conditions; specimens must be dehydrated'],
    explanation: 'Each microscope type has distinct uses in biology. Light microscopes are essential for studying living processes, while electron microscopes reveal ultrastructure.',
  },
  {
    id: 12, content: 'Describe the structure of a typical eukaryotic animal cell as revealed by an electron microscope. Explain the functions of the organelles you describe.', type: 'extended', marks: 8, difficulty: 4,
    topic_id: '1.2', subtopic: 'Cells as the basic units of living organisms', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2022, paper: 'Paper 4',
    correct_answer: 'description of nucleus, mitochondria, RER, SER, Golgi, lysosomes with functions',
    mark_scheme: ['Nucleus contains chromatin/DNA, controls cell activity, has a double membrane (nuclear envelope) with pores', 'Mitochondria are the site of aerobic respiration, have double membrane with inner folds (cristae)', 'Rough ER has ribosomes on surface, involved in protein synthesis and transport', 'Smooth ER involved in lipid synthesis and detoxification', 'Golgi apparatus modifies, packages and transports proteins in vesicles', 'Lysosomes contain digestive enzymes for intracellular digestion', 'Ribosomes are the site of protein synthesis, made of RNA and protein', 'Cell surface membrane controls entry and exit of substances, made of phospholipid bilayer'],
    explanation: 'The electron microscope revealed the compartmentalised nature of eukaryotic cells, with each organelle providing a specialised microenvironment for specific metabolic processes.',
  },
  {
    id: 13, content: 'Which stain is used to identify the presence of starch in plant cells?', type: 'mcq', marks: 1, difficulty: 1,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2023, paper: 'Paper 1',
    options: ['Methylene blue', 'Iodine solution', 'Eosin', 'Aceto-orcein'],
    correct_answer: 'B', mark_scheme: ['Iodine solution turns blue-black in presence of starch'], explanation: 'Iodine solution is the standard test for starch, turning from brown/yellow to blue-black.',
  },
  {
    id: 14, content: 'What is the function of an eyepiece graticule?', type: 'mcq', marks: 1, difficulty: 2,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2022, paper: 'Paper 1',
    options: ['To magnify the image', 'To measure the size of specimens', 'To focus the image', 'To increase resolution'],
    correct_answer: 'B', mark_scheme: ['Eyepiece graticule is a scale used to measure specimen size when calibrated with a stage micrometer'], explanation: 'An eyepiece graticule is a small ruler placed in the eyepiece. When calibrated using a stage micrometer, it allows measurement of actual specimen size.',
  },
  {
    id: 15, content: 'A student calibrates an eyepiece graticule. 40 eyepiece divisions align with 0.1 mm on the stage micrometer at \u00d7400. What is the value of one eyepiece division?', type: 'mcq', marks: 1, difficulty: 3,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2022, paper: 'Paper 1',
    options: ['0.25 \u00b5m', '2.5 \u00b5m', '25 \u00b5m', '250 \u00b5m'],
    correct_answer: 'B', mark_scheme: ['0.1 mm = 100 \u00b5m; 100 / 40 = 2.5 \u00b5m per division'], explanation: '0.1 mm = 100 \u00b5m. Divided by 40 divisions = 2.5 \u00b5m per eyepiece division.',
  },
  {
    id: 16, content: 'Which of the following is NOT a feature of prokaryotic cells?', type: 'mcq', marks: 1, difficulty: 1,
    topic_id: '1.2', subtopic: 'Cells as the basic units of living organisms', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2023, paper: 'Paper 1',
    options: ['Cell wall', 'Nuclear envelope', 'Ribosomes', 'Circular DNA'],
    correct_answer: 'B', mark_scheme: ['Prokaryotes do not have a nuclear envelope'], explanation: 'Prokaryotic cells lack a nuclear envelope. Their DNA is in the nucleoid region, not enclosed in a membrane-bound nucleus.',
  },
  {
    id: 17, content: 'Describe how you would use an eyepiece graticule and stage micrometer to measure the diameter of a red blood cell.', type: 'structured', marks: 4, difficulty: 3,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2022, paper: 'Paper 2',
    correct_answer: 'calibrate graticule using stage micrometer, then measure cell',
    mark_scheme: ['Place the stage micrometer on the stage and focus at chosen magnification', 'Align the eyepiece graticule scale with the stage micrometer scale to determine the value of one eyepiece division', 'Replace the stage micrometer with the specimen (blood smear)', 'Count the number of eyepiece divisions across the diameter of the red blood cell and multiply by the calibrated value'],
    explanation: 'Calibration ensures accurate measurements. The stage micrometer provides a known scale to determine the real-world value of each eyepiece graticule division at a specific magnification.',
  },
  {
    id: 18, content: 'What type of image does a scanning electron microscope (SEM) produce?', type: 'mcq', marks: 1, difficulty: 1,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2023, paper: 'Paper 1',
    options: ['2D cross-section image', '3D surface image', 'Colour photograph', 'X-ray image'],
    correct_answer: 'B', mark_scheme: ['SEM produces 3D surface images'], explanation: 'SEM bounces electrons off the surface of specimens coated in gold, producing detailed three-dimensional surface images.',
  },
  {
    id: 19, content: 'Explain why increasing magnification beyond a certain point does not improve the detail seen in an image.', type: 'structured', marks: 3, difficulty: 3,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2023, paper: 'Paper 2',
    correct_answer: 'empty magnification beyond resolution limit',
    mark_scheme: ['Every microscope has a resolution limit determined by the wavelength of radiation used', 'Beyond the resolution limit, increasing magnification does not reveal new detail \u2014 this is called empty magnification', 'The image becomes larger but blurrier, as no additional structural detail can be resolved'],
    explanation: 'Resolution, not magnification, determines the useful detail. Beyond the resolution limit, you are simply enlarging the blur.',
  },
  {
    id: 20, content: 'Describe the structure and function of the rough endoplasmic reticulum.', type: 'structured', marks: 3, difficulty: 2,
    topic_id: '1.2', subtopic: 'Cells as the basic units of living organisms', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2022, paper: 'Paper 2',
    correct_answer: 'system of membranes with ribosomes, protein synthesis and transport',
    mark_scheme: ['A system of flattened membrane-bound sacs (cisternae) studded with ribosomes on the outer surface', 'Ribosomes on RER synthesise proteins that are threaded into the lumen for modification', 'Proteins are transported in vesicles that bud off from the RER to the Golgi apparatus'],
    explanation: 'The RER is a protein factory. Ribosomes on its surface produce proteins that enter the RER lumen, where they are folded, modified and transported to the Golgi for further processing.',
  },
  {
    id: 21, content: 'Which organelle is responsible for the synthesis of ATP in eukaryotic cells?', type: 'mcq', marks: 1, difficulty: 1,
    topic_id: '1.2', subtopic: 'Cells as the basic units of living organisms', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2023, paper: 'Paper 1',
    options: ['Nucleus', 'Ribosome', 'Mitochondrion', 'Golgi apparatus'],
    correct_answer: 'C', mark_scheme: ['Mitochondria are the site of aerobic respiration and ATP synthesis'], explanation: 'Mitochondria carry out aerobic respiration, producing most of the ATP needed by the cell through oxidative phosphorylation on the inner membrane (cristae).',
  },
  {
    id: 22, content: 'Calculate the actual length of a chloroplast that appears 30 mm long in an electron micrograph taken at \u00d75000 magnification.', type: 'structured', marks: 2, difficulty: 3,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2022, paper: 'Paper 2',
    correct_answer: '6 \u00b5m',
    mark_scheme: ['Actual size = image size / magnification = 30 mm / 5000 = 0.006 mm', 'Convert: 0.006 mm = 6 \u00b5m'],
    explanation: 'Using the magnification formula: actual size = image size / magnification. 30 mm / 5000 = 0.006 mm = 6 \u00b5m.',
  },
  {
    id: 23, content: 'What is the role of the Golgi apparatus in a cell?', type: 'mcq', marks: 1, difficulty: 2,
    topic_id: '1.2', subtopic: 'Cells as the basic units of living organisms', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2023, paper: 'Paper 1',
    options: ['DNA replication', 'Modifying and packaging proteins', 'Photosynthesis', 'Cell division'],
    correct_answer: 'B', mark_scheme: ['Golgi modifies, packages and sorts proteins and lipids for transport'], explanation: 'The Golgi apparatus receives proteins from the RER, modifies them (e.g. glycosylation), packages them into vesicles, and directs them to their final destination.',
  },
  {
    id: 24, content: 'Explain why specimens viewed under an electron microscope must be placed in a vacuum.', type: 'structured', marks: 2, difficulty: 3,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2023, paper: 'Paper 2',
    correct_answer: 'air molecules would scatter electrons, reducing image quality',
    mark_scheme: ['Electrons are scattered / absorbed by air molecules', 'A vacuum prevents this scattering, allowing the electron beam to reach the specimen and form a clear image'],
    explanation: 'Electrons have very little mass and are easily deflected by collisions with air molecules. A vacuum ensures the electron beam travels in a straight path to create a clear image.',
  },
  {
    id: 25, content: 'A plant cell is viewed under a microscope. The cell is 80 \u00b5m long and the image is 40 mm long. What magnification was used?', type: 'mcq', marks: 1, difficulty: 2,
    topic_id: '1.1', subtopic: 'The microscope in cell studies', syllabus_id: 'cie-alevel-bio-9700', exam_board: 'CIE', year: 2022, paper: 'Paper 1',
    options: ['\u00d7200', '\u00d7400', '\u00d7500', '\u00d7800'],
    correct_answer: 'C', mark_scheme: ['40 mm = 40000 \u00b5m; magnification = 40000/80 = \u00d7500'], explanation: 'Convert 40 mm to 40,000 \u00b5m. Magnification = image size / actual size = 40,000 / 80 = \u00d7500.',
  },
]

// Legacy aliases for backward compatibility
export const EXAM_QUESTIONS = EXAM_QUESTION_BANK
export const EXAM_ANSWERS: Record<number, { is_correct: boolean; marks_awarded: number; marks_available: number; mark_scheme: string[]; explanation: string }> = Object.fromEntries(
  EXAM_QUESTION_BANK.map((q) => [
    q.id,
    {
      is_correct: true,
      marks_awarded: q.marks,
      marks_available: q.marks,
      mark_scheme: q.mark_scheme,
      explanation: q.explanation,
    },
  ])
)

// ── Doubts ───────────────────────────────────────────────────

export const DOUBTS = [
  {
    id: 1,
    student_id: 1,
    tutor_id: null,
    question_text: 'How do I find the turning point of a quadratic graph?',
    image_url: null,
    ai_answer: 'To find the turning point of y = ax² + bx + c:\n\n1. The x-coordinate is x = -b/(2a)\n2. Substitute this x value back into the equation to find the y-coordinate\n3. The turning point is a minimum when a > 0, and a maximum when a < 0\n\nFor example, y = 2x² - 8x + 3: x = 8/4 = 2, y = 2(4) - 16 + 3 = -5. Turning point: (2, -5)',
    tutor_answer: null,
    status: 'ai_answered',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 2,
    student_id: 1,
    tutor_id: 10,
    question_text: 'What is the difference between mitosis and meiosis?',
    image_url: null,
    ai_answer: 'Mitosis produces 2 identical diploid cells for growth/repair. Meiosis produces 4 genetically unique haploid cells for reproduction.',
    tutor_answer: 'Great question! The AI summary is correct. Remember the key differences: mitosis = 1 division, meiosis = 2 divisions. Mitosis keeps 46 chromosomes, meiosis halves them to 23. This will definitely come up in your GCSE exam!',
    status: 'tutor_answered',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
]

// ── Payments ────────────────────────────────────────────────

export const PAYMENTS = [
  {
    id: 1, student_id: 1, tutor_id: 10, lesson_id: 3,
    amount: 4500, currency: 'GBP', status: 'completed' as const,
    description: 'Mathematics lesson with Dr Sarah Mitchell',
    student: { id: 1, name: 'Alex Johnson' },
    tutor: { id: 10, name: 'Dr Sarah Mitchell' },
    created_at: yesterday.toISOString(),
  },
  {
    id: 2, student_id: 1, tutor_id: 12, lesson_id: 4,
    amount: 4000, currency: 'GBP', status: 'completed' as const,
    description: 'English lesson with Emma Richardson',
    student: { id: 1, name: 'Alex Johnson' },
    tutor: { id: 12, name: 'Emma Richardson' },
    created_at: lastWeek.toISOString(),
  },
  {
    id: 3, student_id: 1, tutor_id: 10, lesson_id: 1,
    amount: 4500, currency: 'GBP', status: 'pending' as const,
    description: 'Upcoming Mathematics lesson',
    student: { id: 1, name: 'Alex Johnson' },
    tutor: { id: 10, name: 'Dr Sarah Mitchell' },
    created_at: new Date().toISOString(),
  },
]

// ── Lesson Package ──────────────────────────────────────────

export const LESSON_PACKAGE = {
  id: 1,
  lesson_id: 3,
  summary: 'We covered linear equations, plotting straight-line graphs, and finding the equation of a line given two points. Alex demonstrated strong understanding of gradient calculations but needs more practice with y-intercept identification from graph plots.',
  key_notes: [
    'y = mx + c where m is the gradient and c is the y-intercept',
    'Gradient = rise / run = (y₂ - y₁) / (x₂ - x₁)',
    'Parallel lines have the same gradient',
    'Perpendicular lines have gradients that multiply to -1',
  ],
  flashcards: [
    { front: 'What does m represent in y = mx + c?', back: 'The gradient (slope) of the line' },
    { front: 'How do you find the gradient between two points?', back: '(y₂ - y₁) / (x₂ - x₁)' },
    { front: 'What does the y-intercept tell us?', back: 'Where the line crosses the y-axis (when x = 0)' },
    { front: 'When are two lines parallel?', back: 'When they have the same gradient (m₁ = m₂)' },
  ],
  practice_questions: [
    { question: 'Find the equation of a line passing through (2, 5) and (4, 9)', hint: 'First find the gradient, then use y - y₁ = m(x - x₁)' },
    { question: 'Are the lines y = 3x + 1 and y = 3x - 4 parallel?', hint: 'Compare their gradients' },
    { question: 'Find the y-intercept of the line 2y - 6x = 10', hint: 'Rearrange to y = mx + c form' },
  ],
  homework: 'Complete exercises 4.3 and 4.4 from the textbook. Focus on finding equations of lines from two given points. Try at least 5 problems involving perpendicular lines.',
  status: 'completed',
}

// ── Tutor availability ──────────────────────────────────────

export const AVAILABILITY = [
  { id: 1, tutor_profile_id: 1, day_of_week: 1, start_time: '09:00', end_time: '12:00', is_recurring: true, specific_date: null },
  { id: 2, tutor_profile_id: 1, day_of_week: 1, start_time: '14:00', end_time: '17:00', is_recurring: true, specific_date: null },
  { id: 3, tutor_profile_id: 1, day_of_week: 3, start_time: '10:00', end_time: '16:00', is_recurring: true, specific_date: null },
  { id: 4, tutor_profile_id: 1, day_of_week: 5, start_time: '09:00', end_time: '13:00', is_recurring: true, specific_date: null },
]

// ── Messages / conversations ────────────────────────────────

export interface DemoMessage {
  id: number
  senderId: number // 1 = student (Alex), other = tutor
  text?: string
  imageUrl?: string
  fileName?: string
  fileSize?: string
  timestamp: string
  status: 'sent' | 'delivered' | 'seen'
}

export interface DemoConversation {
  id: number
  tutorName: string
  tutorAvatar: string
  subject: string
  lastSeen: string
  unread: number
  messages: DemoMessage[]
}

export const DEMO_CONVERSATIONS: DemoConversation[] = [
  {
    id: 1,
    tutorName: 'Dr. Sarah Chen',
    tutorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    subject: 'Maths',
    lastSeen: 'Online',
    unread: 2,
    messages: [
      { id: 1, senderId: 10, text: 'Hi Alex! How did you find today\'s lesson on quadratics?', timestamp: 'Today, 1:15 PM', status: 'seen' },
      { id: 2, senderId: 1, text: 'It was really helpful! I finally understand the discriminant method \ud83d\ude0a', timestamp: 'Today, 1:22 PM', status: 'seen' },
      { id: 3, senderId: 10, text: 'That\'s great to hear! I\'ve uploaded some extra practice questions for you', timestamp: 'Today, 1:30 PM', status: 'seen' },
      { id: 4, senderId: 10, fileName: 'Quadratic-Practice-Set.pdf', fileSize: '245 KB', timestamp: 'Today, 1:31 PM', status: 'seen' },
      { id: 5, senderId: 1, text: 'Thanks! I\'ll work through them tonight', timestamp: 'Today, 1:45 PM', status: 'seen' },
      { id: 6, senderId: 10, text: 'Perfect. Also, here\'s a diagram that might help visualise the parabola transformations', timestamp: 'Today, 2:00 PM', status: 'seen' },
      { id: 7, senderId: 10, imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop', timestamp: 'Today, 2:01 PM', status: 'seen' },
      { id: 8, senderId: 1, text: 'This is really clear, thank you!', timestamp: 'Today, 2:10 PM', status: 'seen' },
      { id: 9, senderId: 10, text: 'You\'re welcome! Don\'t hesitate to ask if you get stuck on any questions', timestamp: 'Today, 2:30 PM', status: 'delivered' },
      { id: 10, senderId: 10, text: 'Also remember our next lesson is Thursday at 4pm \ud83d\udc4b', timestamp: 'Today, 2:31 PM', status: 'delivered' },
    ],
  },
  {
    id: 2,
    tutorName: 'Prof. James Wilson',
    tutorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
    subject: 'English',
    lastSeen: 'Last seen 2h ago',
    unread: 0,
    messages: [
      { id: 11, senderId: 1, text: 'Hi Professor Wilson, I\'ve finished my essay draft on Macbeth', timestamp: 'Yesterday, 3:00 PM', status: 'seen' },
      { id: 12, senderId: 20, text: 'Excellent! Can you send it over? I\'ll review it before our next session', timestamp: 'Yesterday, 3:15 PM', status: 'seen' },
      { id: 13, senderId: 1, fileName: 'Macbeth-Essay-Draft.docx', fileSize: '52 KB', timestamp: 'Yesterday, 3:20 PM', status: 'seen' },
      { id: 14, senderId: 20, text: 'Got it! I\'ll have feedback ready by Wednesday', timestamp: 'Yesterday, 3:30 PM', status: 'seen' },
      { id: 15, senderId: 1, text: 'Thank you! I focused on the PEEL structure you taught us', timestamp: 'Yesterday, 3:35 PM', status: 'seen' },
      { id: 16, senderId: 20, text: 'Good approach. I\'ll pay special attention to your evidence analysis', timestamp: 'Yesterday, 3:45 PM', status: 'seen' },
    ],
  },
  {
    id: 3,
    tutorName: 'Dr. Emily Brooks',
    tutorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    subject: 'Biology',
    lastSeen: 'Online',
    unread: 1,
    messages: [
      { id: 17, senderId: 30, text: 'Hi Alex, just a reminder about the photosynthesis diagram homework', timestamp: 'Today, 10:00 AM', status: 'seen' },
      { id: 18, senderId: 1, text: 'Yes, I\'m working on it! Quick question - should I include the Calvin cycle?', timestamp: 'Today, 10:15 AM', status: 'seen' },
      { id: 19, senderId: 30, text: 'Yes, include both the light-dependent and light-independent reactions', timestamp: 'Today, 10:20 AM', status: 'seen' },
      { id: 20, senderId: 1, text: 'Got it \ud83d\udc4d', timestamp: 'Today, 10:25 AM', status: 'seen' },
      { id: 21, senderId: 30, text: 'Here\'s a helpful reference image', timestamp: 'Today, 11:00 AM', status: 'seen' },
      { id: 22, senderId: 30, imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=300&fit=crop', timestamp: 'Today, 11:01 AM', status: 'seen' },
      { id: 23, senderId: 30, text: 'Submit it by Friday if you can! \ud83d\udcdd', timestamp: 'Today, 11:05 AM', status: 'delivered' },
    ],
  },
]

// Legacy format kept for backward compatibility with demo-interceptor
export const CONVERSATIONS = DEMO_CONVERSATIONS.map((c) => ({
  user: { id: c.id * 10, name: c.tutorName, avatar: c.tutorAvatar, role: 'tutor' as const },
  last_message: c.messages[c.messages.length - 1]?.text ?? c.messages[c.messages.length - 1]?.fileName ?? '',
  last_message_at: new Date().toISOString(),
  unread_count: c.unread,
}))

export const MESSAGES = [
  { id: 1, sender_id: 1, receiver_id: 10, body: 'Hi Dr Mitchell, I had a question about the homework', read_at: new Date().toISOString(), created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 2, sender_id: 10, receiver_id: 1, body: 'Of course Alex, what are you stuck on?', read_at: new Date().toISOString(), created_at: new Date(Date.now() - 5400000).toISOString() },
  { id: 3, sender_id: 1, receiver_id: 10, body: 'I can\'t figure out question 3 about perpendicular lines', read_at: new Date().toISOString(), created_at: new Date(Date.now() - 4800000).toISOString() },
  { id: 4, sender_id: 10, receiver_id: 1, body: 'Remember: perpendicular gradients multiply to -1. So if one line has gradient 2, the perpendicular has gradient -1/2. We\'ll go through it tomorrow!', read_at: null, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 5, sender_id: 10, receiver_id: 1, body: 'See you tomorrow for our lesson!', read_at: null, created_at: new Date(Date.now() - 3600000).toISOString() },
]

// ── Leaderboard ─────────────────────────────────────────────

export const LEADERBOARD = [
  { rank: 1, user: { id: 5, name: 'Priya Sharma' }, xp: 2450, streak: 14 },
  { rank: 2, user: { id: 1, name: 'Alex Johnson' }, xp: 1820, streak: 7 },
  { rank: 3, user: { id: 6, name: 'Oliver Williams' }, xp: 1650, streak: 5 },
  { rank: 4, user: { id: 7, name: 'Sophie Brown' }, xp: 1400, streak: 3 },
  { rank: 5, user: { id: 8, name: 'Mohammed Ali' }, xp: 1280, streak: 9 },
]

// ── Mental Dojo ─────────────────────────────────────────────

export const MENTAL_DOJO_COURSES = [
  {
    id: 1, title: 'Exam Calmness', slug: 'exam-calmness', description: 'Techniques to stay calm and focused during exams',
    category: 'calmness', order: 1,
    modules: [
      { id: 1, title: 'Understanding Exam Anxiety', content: 'Learn what causes exam anxiety and how to recognise it.', type: 'lesson', order: 1, duration_minutes: 10 },
      { id: 2, title: 'Box Breathing', content: 'A simple 4-4-4-4 breathing technique to calm your nervous system before an exam.', type: 'exercise', order: 2, duration_minutes: 5 },
    ],
  },
  {
    id: 2, title: 'Focus Training', slug: 'focus-training', description: 'Build deep focus for productive study sessions',
    category: 'focus', order: 2,
    modules: [
      { id: 3, title: 'The Pomodoro Method', content: 'Learn to study in focused 25-minute blocks with short breaks.', type: 'lesson', order: 1, duration_minutes: 8 },
      { id: 4, title: 'Single-Task Challenge', content: 'Practice focusing on one subject without distractions for 15 minutes.', type: 'exercise', order: 2, duration_minutes: 15 },
    ],
  },
  {
    id: 3, title: 'Confidence Building', slug: 'confidence-building', description: 'Build academic self-belief and resilience',
    category: 'confidence', order: 3,
    modules: [
      { id: 5, title: 'Growth Mindset', content: 'Understand how effort, not talent, drives academic success.', type: 'lesson', order: 1, duration_minutes: 12 },
      { id: 6, title: 'Positive Self-Talk', content: 'Replace "I can\'t do this" with "I\'m learning how to do this".', type: 'exercise', order: 2, duration_minutes: 8 },
    ],
  },
]

// ── Question Bank (CIE AS Biology 9700 — Topic 1.1) ──────

export interface BankQuestion {
  id: number
  content: string
  type: 'mcq' | 'structured' | 'extended'
  marks: number
  difficulty: number // 1-5
  topic_id: string
  subtopic: string
  syllabus_id: string
  exam_board: string
  year: number
  paper: string
  options?: string[]
  correct_answer: string
  mark_scheme: string[]
  explanation: string
}

export const QUESTION_BANK: BankQuestion[] = [
  // ── Magnification calculations (8 questions) ──────────────
  {
    id: 1,
    content: 'Which formula correctly relates magnification, image size and actual size?',
    type: 'mcq',
    marks: 1,
    difficulty: 1,
    topic_id: '1.1',
    subtopic: 'Magnification calculations',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2022,
    paper: 'Paper 1',
    options: [
      'Magnification = Image size / Actual size',
      'Magnification = Actual size / Image size',
      'Magnification = Image size × Actual size',
      'Magnification = Actual size − Image size',
    ],
    correct_answer: 'Magnification = Image size / Actual size',
    mark_scheme: [
      'Magnification = Image size / Actual size ;',
    ],
    explanation: 'The magnification formula is M = I / A. This can be rearranged to find image size (I = M × A) or actual size (A = I / M). This is sometimes remembered using the magnification triangle.',
  },
  {
    id: 2,
    content: 'A cell has an actual size of 6 μm. It appears 30 mm long in a micrograph. What is the magnification?',
    type: 'mcq',
    marks: 1,
    difficulty: 2,
    topic_id: '1.1',
    subtopic: 'Magnification calculations',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2021,
    paper: 'Paper 1',
    options: [
      '×500',
      '×5000',
      '×50',
      '×50000',
    ],
    correct_answer: '×5000',
    mark_scheme: [
      'Convert image size to same units: 30 mm = 30 000 μm ;',
      'Magnification = 30 000 / 6 = ×5000 ;',
    ],
    explanation: 'First convert 30 mm to μm: 30 × 1000 = 30 000 μm. Then apply M = I / A = 30 000 / 6 = ×5000.',
  },
  {
    id: 3,
    content: 'An organelle appears 45 mm long in an electron micrograph taken at a magnification of ×9000. Calculate the actual size of the organelle in μm. Show your working.',
    type: 'structured',
    marks: 3,
    difficulty: 3,
    topic_id: '1.1',
    subtopic: 'Magnification calculations',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2023,
    paper: 'Paper 2',
    correct_answer: 'Actual size = 5 μm',
    mark_scheme: [
      'Use of formula: Actual size = Image size / Magnification ;',
      'Convert image size: 45 mm = 45 000 μm ;',
      'Actual size = 45 000 / 9000 = 5 μm ;',
    ],
    explanation: 'Using A = I / M: convert 45 mm to 45 000 μm, then divide by 9000 to get 5 μm. Always convert to the same units before calculating.',
  },
  {
    id: 4,
    content: 'What is 0.05 mm expressed in micrometres (μm)?',
    type: 'mcq',
    marks: 1,
    difficulty: 1,
    topic_id: '1.1',
    subtopic: 'Magnification calculations',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2020,
    paper: 'Paper 1',
    options: [
      '0.5 μm',
      '5 μm',
      '50 μm',
      '500 μm',
    ],
    correct_answer: '50 μm',
    mark_scheme: [
      '0.05 mm × 1000 = 50 μm ;',
    ],
    explanation: 'To convert mm to μm, multiply by 1000. So 0.05 × 1000 = 50 μm.',
  },
  {
    id: 5,
    content: 'A student measures a cell as 32 mm long on a micrograph. The scale bar on the micrograph represents 8 μm and measures 16 mm. Calculate the actual size of the cell.',
    type: 'structured',
    marks: 3,
    difficulty: 3,
    topic_id: '1.1',
    subtopic: 'Magnification calculations',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2022,
    paper: 'Paper 2',
    correct_answer: 'Actual size = 16 μm',
    mark_scheme: [
      'Calculate magnification from scale bar: 16 mm = 16 000 μm, magnification = 16 000 / 8 = ×2000 ;',
      'Convert cell image size: 32 mm = 32 000 μm ;',
      'Actual size = 32 000 / 2000 = 16 μm ;',
    ],
    explanation: 'First find the magnification using the scale bar: the bar is 16 mm (16 000 μm) and represents 8 μm, so magnification = 16 000 / 8 = ×2000. Then actual cell size = 32 000 / 2000 = 16 μm.',
  },
  {
    id: 6,
    content: 'If the actual size of an organelle is 2 μm and the magnification used is ×5000, what is the image size in mm?',
    type: 'mcq',
    marks: 1,
    difficulty: 2,
    topic_id: '1.1',
    subtopic: 'Magnification calculations',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2021,
    paper: 'Paper 1',
    options: [
      '1 mm',
      '10 mm',
      '100 mm',
      '0.1 mm',
    ],
    correct_answer: '10 mm',
    mark_scheme: [
      'Image size = Actual size × Magnification = 2 × 5000 = 10 000 μm = 10 mm ;',
    ],
    explanation: 'Image size = A × M = 2 μm × 5000 = 10 000 μm. Convert to mm: 10 000 / 1000 = 10 mm.',
  },
  {
    id: 7,
    content: 'Explain why increasing the magnification of a light microscope does not always produce a clearer image.',
    type: 'structured',
    marks: 2,
    difficulty: 3,
    topic_id: '1.1',
    subtopic: 'Magnification calculations',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2023,
    paper: 'Paper 2',
    correct_answer: 'Clarity depends on resolution, not magnification alone. Beyond the resolution limit, increasing magnification produces a larger but blurred image.',
    mark_scheme: [
      'Resolution / resolving power is the ability to distinguish between two separate points ;',
      'Beyond the limit of resolution, increasing magnification enlarges the image but does not reveal more detail / image becomes blurred ;',
    ],
    explanation: 'Magnification simply makes the image bigger. Resolution determines the amount of detail visible. The resolution of a light microscope is limited by the wavelength of visible light (about 200 nm). Beyond this limit, extra magnification just makes a blurry image bigger — this is called empty magnification.',
  },
  {
    id: 8,
    content: 'A micrograph shows a cell. The image width of the cell is 48 mm. The actual cell diameter is 12 μm.\n\n(a) Calculate the magnification of the micrograph.\n(b) The student then views the same cell at ×2000 magnification. Calculate the new image size in mm.',
    type: 'extended',
    marks: 4,
    difficulty: 4,
    topic_id: '1.1',
    subtopic: 'Magnification calculations',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2023,
    paper: 'Paper 2',
    correct_answer: '(a) ×4000 (b) 24 mm',
    mark_scheme: [
      '(a) Convert 48 mm to μm: 48 000 μm ;',
      '(a) Magnification = 48 000 / 12 = ×4000 ;',
      '(b) Image size = 12 × 2000 = 24 000 μm ;',
      '(b) Convert to mm: 24 000 / 1000 = 24 mm ;',
    ],
    explanation: '(a) Convert 48 mm to 48 000 μm. M = I/A = 48 000/12 = ×4000. (b) At ×2000: I = A × M = 12 × 2000 = 24 000 μm = 24 mm.',
  },

  // ── Resolution and microscope types (7 questions) ─────────
  {
    id: 9,
    content: 'Which statement best defines resolution?',
    type: 'mcq',
    marks: 1,
    difficulty: 1,
    topic_id: '1.1',
    subtopic: 'Resolution and microscope types',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2020,
    paper: 'Paper 1',
    options: [
      'The ability to distinguish between two objects that are close together',
      'The degree to which an image is enlarged',
      'The brightness of an image under a microscope',
      'The number of lenses in a microscope',
    ],
    correct_answer: 'The ability to distinguish between two objects that are close together',
    mark_scheme: [
      'Resolution is the ability to distinguish between two separate points / objects close together ;',
    ],
    explanation: 'Resolution (resolving power) is the minimum distance between two distinguishable points. Higher resolution means finer detail can be seen. It is distinct from magnification, which is how much larger the image is compared to the object.',
  },
  {
    id: 10,
    content: 'Which type of microscope has the highest resolving power?',
    type: 'mcq',
    marks: 1,
    difficulty: 1,
    topic_id: '1.1',
    subtopic: 'Resolution and microscope types',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2021,
    paper: 'Paper 1',
    options: [
      'Light microscope',
      'Scanning electron microscope (SEM)',
      'Transmission electron microscope (TEM)',
      'Magnifying glass',
    ],
    correct_answer: 'Transmission electron microscope (TEM)',
    mark_scheme: [
      'TEM has the highest resolving power (approximately 0.1 nm) ;',
    ],
    explanation: 'The TEM has a resolution of about 0.1 nm, far better than the SEM (about 5 nm) and light microscope (about 200 nm). This is because electrons have a much shorter wavelength than visible light.',
  },
  {
    id: 11,
    content: 'State two differences between a light microscope and a transmission electron microscope (TEM).',
    type: 'structured',
    marks: 2,
    difficulty: 2,
    topic_id: '1.1',
    subtopic: 'Resolution and microscope types',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2022,
    paper: 'Paper 2',
    correct_answer: 'Light microscope uses light and glass lenses; TEM uses electrons and electromagnets. TEM has higher resolution than a light microscope.',
    mark_scheme: [
      'Light microscope uses light / visible light as radiation source whereas TEM uses a beam of electrons ;',
      'Light microscope has lower resolution (200 nm) compared to TEM (0.1 nm) / TEM can show greater detail ;',
    ],
    explanation: 'Key differences include: the radiation source (light vs electrons), the type of lenses (glass vs electromagnetic), resolution (200 nm vs 0.1 nm), specimen preparation (can be living vs must be dead/fixed), and image type (colour vs black and white).',
  },
  {
    id: 12,
    content: 'Explain why electron microscopes have better resolution than light microscopes.',
    type: 'structured',
    marks: 3,
    difficulty: 3,
    topic_id: '1.1',
    subtopic: 'Resolution and microscope types',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2023,
    paper: 'Paper 2',
    correct_answer: 'Electrons have a shorter wavelength than light, allowing closer points to be distinguished.',
    mark_scheme: [
      'Resolution is limited by the wavelength of the radiation used ;',
      'Electrons have a much shorter wavelength than visible light ;',
      'Therefore electron microscopes can distinguish between points that are closer together / resolve finer detail ;',
    ],
    explanation: 'Resolution depends on the wavelength of the radiation used to form the image. Visible light has wavelengths of 400–700 nm, while the electron beam has an effective wavelength of less than 1 nm. Shorter wavelength means objects closer together can be distinguished as separate.',
  },
  {
    id: 13,
    content: 'What is the approximate maximum useful magnification of a light microscope?',
    type: 'mcq',
    marks: 1,
    difficulty: 2,
    topic_id: '1.1',
    subtopic: 'Resolution and microscope types',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2020,
    paper: 'Paper 1',
    options: [
      '×400',
      '×1500',
      '×10 000',
      '×500 000',
    ],
    correct_answer: '×1500',
    mark_scheme: [
      'Maximum useful magnification of a light microscope is approximately ×1500 ;',
    ],
    explanation: 'The maximum useful magnification is about ×1500. Beyond this, increasing magnification does not reveal more detail because the resolution limit of the light microscope (about 200 nm) has been reached. Higher magnification beyond this point is empty magnification.',
  },
  {
    id: 14,
    content: 'State two limitations of using an electron microscope to study cells.',
    type: 'structured',
    marks: 2,
    difficulty: 2,
    topic_id: '1.1',
    subtopic: 'Resolution and microscope types',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2021,
    paper: 'Paper 2',
    correct_answer: 'Cannot view living specimens; expensive and large equipment.',
    mark_scheme: [
      'Specimens must be dead / cannot observe living cells / must be in a vacuum ;',
      'Equipment is very expensive / large / requires trained operators / specimens require extensive preparation ;',
    ],
    explanation: 'Electron microscopes have several limitations: specimens must be placed in a vacuum (so they cannot be alive), preparation involves fixation, dehydration and staining with heavy metals, the equipment is bulky and costly, and images are in black and white (colour is added artificially).',
  },
  {
    id: 15,
    content: 'Compare and contrast the use of light microscopes and electron microscopes in studying cell structure. Include advantages and disadvantages of each type.',
    type: 'extended',
    marks: 6,
    difficulty: 5,
    topic_id: '1.1',
    subtopic: 'Resolution and microscope types',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2023,
    paper: 'Paper 2',
    correct_answer: 'Light microscopes are cheaper, portable, can view living specimens, and produce colour images but have lower resolution. Electron microscopes have much higher resolution and magnification but specimens must be dead, equipment is expensive and large, and images are black and white.',
    mark_scheme: [
      'Light microscope uses visible light; electron microscope uses beam of electrons ;',
      'Light microscope resolution ~200 nm; electron microscope resolution ~0.1 nm (TEM) ;',
      'Light microscope advantage: can view living specimens / cells in natural state ;',
      'Light microscope advantage: relatively cheap / portable / easy to use ;',
      'Electron microscope advantage: much higher resolution / can see ultrastructure of organelles ;',
      'Electron microscope disadvantage: specimens must be dead / placed in vacuum / extensive preparation required ;',
    ],
    explanation: 'Light microscopes use visible light and glass lenses, achieving resolution of ~200 nm and magnification up to ~×1500. They can view living specimens and produce colour images, making them suitable for observing cell division and movement. Electron microscopes use electron beams and electromagnetic lenses, achieving resolution of ~0.1 nm (TEM) with magnifications over ×500 000. However, specimens must be dead, fixed, dehydrated and placed in a vacuum. TEMs show internal ultrastructure; SEMs show 3D surface detail.',
  },

  // ── Staining and specimen preparation (5 questions) ────────
  {
    id: 16,
    content: 'What is the main purpose of staining cells before viewing them under a light microscope?',
    type: 'mcq',
    marks: 1,
    difficulty: 1,
    topic_id: '1.1',
    subtopic: 'Staining and specimen preparation',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2020,
    paper: 'Paper 1',
    options: [
      'To increase the magnification of the image',
      'To increase the contrast so that structures are visible',
      'To kill the cells so they do not move',
      'To make the cells larger',
    ],
    correct_answer: 'To increase the contrast so that structures are visible',
    mark_scheme: [
      'Staining increases contrast / makes transparent or colourless structures visible ;',
    ],
    explanation: 'Most biological structures are transparent and have little contrast under a light microscope. Stains bind to specific cell components, making them coloured and visible. For example, methylene blue stains nuclei dark blue.',
  },
  {
    id: 17,
    content: 'Which stain is commonly used to make cell nuclei visible under a light microscope?',
    type: 'mcq',
    marks: 1,
    difficulty: 1,
    topic_id: '1.1',
    subtopic: 'Staining and specimen preparation',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2021,
    paper: 'Paper 1',
    options: [
      'Iodine solution',
      'Methylene blue',
      'Sudan III',
      'Benedict\'s reagent',
    ],
    correct_answer: 'Methylene blue',
    mark_scheme: [
      'Methylene blue stains nuclei / DNA dark blue ;',
    ],
    explanation: 'Methylene blue is a basic dye that binds to negatively charged DNA in the nucleus, staining it dark blue. Iodine stains starch blue-black. Sudan III stains lipids red. Aceto-orcein and aceto-carmine are also used for chromosomes.',
  },
  {
    id: 18,
    content: 'Explain why specimens for light microscopy must be very thin.',
    type: 'structured',
    marks: 2,
    difficulty: 2,
    topic_id: '1.1',
    subtopic: 'Staining and specimen preparation',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2022,
    paper: 'Paper 2',
    correct_answer: 'Light must pass through the specimen. Thick specimens absorb or scatter too much light, making the image dark and unclear.',
    mark_scheme: [
      'Light must be able to pass through the specimen / transmitted light forms the image ;',
      'If too thick, light is absorbed / scattered and image is unclear / dark / cannot focus ;',
    ],
    explanation: 'Light microscopy relies on light passing through the specimen to form an image. If the specimen is too thick, light cannot pass through it effectively — it gets absorbed or scattered, resulting in a dark, unclear image where individual cells cannot be distinguished.',
  },
  {
    id: 19,
    content: 'Iodine solution is used as a biological stain. Which substance does it stain blue-black?',
    type: 'mcq',
    marks: 1,
    difficulty: 1,
    topic_id: '1.1',
    subtopic: 'Staining and specimen preparation',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2020,
    paper: 'Paper 1',
    options: [
      'Protein',
      'Lipid',
      'Starch',
      'Cellulose',
    ],
    correct_answer: 'Starch',
    mark_scheme: [
      'Iodine solution stains starch blue-black ;',
    ],
    explanation: 'Iodine solution (potassium iodide) turns blue-black in the presence of starch. This reaction occurs because iodine molecules fit inside the helical structure of amylose in starch. Without starch, iodine remains yellow-brown.',
  },
  {
    id: 20,
    content: 'Describe the steps to prepare a temporary mount of onion epidermis cells for viewing under a light microscope.',
    type: 'structured',
    marks: 4,
    difficulty: 3,
    topic_id: '1.1',
    subtopic: 'Staining and specimen preparation',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2023,
    paper: 'Paper 2',
    correct_answer: 'Peel a thin layer of epidermis from an onion scale. Place on a glass slide with a drop of water or stain. Lower a coverslip at an angle to avoid air bubbles. View under low power first.',
    mark_scheme: [
      'Peel a thin layer of epidermis from the inner surface of an onion scale using forceps ;',
      'Place the tissue on a clean glass slide in a drop of water or iodine stain ;',
      'Carefully lower a coverslip at an angle (using a needle) to avoid trapping air bubbles ;',
      'View under low power first, then increase magnification / focus using coarse then fine adjustment ;',
    ],
    explanation: 'The key steps are: (1) Cut the onion and peel off a thin, single layer of epidermis from the inner surface. (2) Place it flat on a glass slide with a drop of water or iodine solution. (3) Lower a coverslip at 45 degrees using a mounted needle to avoid trapping air bubbles. (4) Blot excess liquid with filter paper. (5) Place on the microscope stage and focus under low power first.',
  },

  // ── Eyepiece graticule and calibration (3 questions) ───────
  {
    id: 21,
    content: 'What is the purpose of an eyepiece graticule in a light microscope?',
    type: 'mcq',
    marks: 1,
    difficulty: 2,
    topic_id: '1.1',
    subtopic: 'Eyepiece graticule and calibration',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2022,
    paper: 'Paper 1',
    options: [
      'To increase the magnification of the image',
      'To measure the size of specimens viewed under the microscope',
      'To improve the resolution of the microscope',
      'To hold the specimen in place on the stage',
    ],
    correct_answer: 'To measure the size of specimens viewed under the microscope',
    mark_scheme: [
      'An eyepiece graticule is used to measure the size of specimens / objects viewed through the microscope ;',
    ],
    explanation: 'An eyepiece graticule is a small glass disc with a ruler scale etched on it, placed inside the eyepiece. It allows the size of objects to be measured while viewing them. It must be calibrated using a stage micrometer to convert graticule divisions into real units.',
  },
  {
    id: 22,
    content: 'Describe how to calibrate an eyepiece graticule using a stage micrometer.',
    type: 'structured',
    marks: 3,
    difficulty: 4,
    topic_id: '1.1',
    subtopic: 'Eyepiece graticule and calibration',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2023,
    paper: 'Paper 2',
    correct_answer: 'Place stage micrometer on stage and focus. Align graticule scale with stage micrometer scale. Count how many graticule divisions fit a known stage micrometer distance. Calculate the real length per graticule division.',
    mark_scheme: [
      'Place the stage micrometer on the stage and bring into focus at the required magnification ;',
      'Line up / superimpose the eyepiece graticule scale with the stage micrometer scale ;',
      'Count the number of eyepiece graticule divisions that correspond to a known number of stage micrometer divisions and calculate the length represented by each graticule division ;',
    ],
    explanation: 'A stage micrometer is a glass slide with a precise scale (usually 1 mm divided into 100 divisions of 10 μm each). By viewing both scales simultaneously and counting how many graticule divisions align with a known stage micrometer distance, you can calculate the real length per graticule division. This calibration must be repeated for each objective lens.',
  },
  {
    id: 23,
    content: 'Using a calibrated eyepiece graticule, a student counts 15 divisions across the width of a cell. Each eyepiece graticule division has been calibrated to represent 4.2 μm. Calculate the actual width of the cell.',
    type: 'structured',
    marks: 2,
    difficulty: 2,
    topic_id: '1.1',
    subtopic: 'Eyepiece graticule and calibration',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2022,
    paper: 'Paper 2',
    correct_answer: 'Actual width = 63 μm',
    mark_scheme: [
      'Actual width = number of divisions × calibrated value per division ;',
      '15 × 4.2 = 63 μm ;',
    ],
    explanation: 'Once the graticule is calibrated, measuring is straightforward: multiply the number of divisions by the calibrated value. Here: 15 × 4.2 = 63 μm.',
  },

  // ── Biological drawings (2 questions) ─────────────────────
  {
    id: 24,
    content: 'State three rules that should be followed when making a biological drawing from a microscope.',
    type: 'structured',
    marks: 3,
    difficulty: 2,
    topic_id: '1.1',
    subtopic: 'Biological drawings',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2021,
    paper: 'Paper 2',
    correct_answer: 'Use sharp pencil lines with no shading. Drawing should be large and take up at least half the page. All structures must be labelled with straight ruled lines that do not cross.',
    mark_scheme: [
      'Use a sharp pencil and draw clear, continuous lines / no shading, no colouring ;',
      'Drawing should be large enough to show detail / at least half the available space ;',
      'Label lines should be straight, ruled, and not cross each other / labels should be outside the drawing ;',
    ],
    explanation: 'Biological drawings must follow strict conventions: use a sharp pencil with single clear lines (no sketching, shading or colouring), make the drawing large enough to show all structures clearly, include a title and magnification, use straight ruled label lines that do not cross, and ensure proportions are accurate.',
  },
  {
    id: 25,
    content: 'A student is asked to draw a plant cell as seen under a light microscope at ×400 magnification. Describe the features they should include in their drawing and the rules they should follow for a high-quality biological drawing.',
    type: 'extended',
    marks: 5,
    difficulty: 3,
    topic_id: '1.1',
    subtopic: 'Biological drawings',
    syllabus_id: 'cie-alevel-bio',
    exam_board: 'CIE',
    year: 2022,
    paper: 'Paper 2',
    correct_answer: 'Draw cell wall, cell membrane, nucleus, cytoplasm, vacuole and chloroplasts (if present). Use clear single lines, no shading, include a title, state the magnification, and use ruled label lines.',
    mark_scheme: [
      'Include cell wall drawn as a double line / clearly distinct from cell membrane ;',
      'Include nucleus, cytoplasm, and large central vacuole ;',
      'Use clear, sharp, continuous pencil lines with no shading or colouring ;',
      'Include a title and state the magnification used ;',
      'Use straight, ruled label lines that do not cross each other / labels positioned clearly outside the drawing ;',
    ],
    explanation: 'At ×400, the visible plant cell features include: cell wall (drawn as a clear double line), cell membrane (pressed against the cell wall), nucleus (with nucleolus if visible), cytoplasm, large central vacuole, and chloroplasts if it is a leaf cell. The drawing should follow standard conventions: sharp pencil, single clear lines, no shading or colour, large size, title with magnification, and neat ruled label lines.',
  },
]

// ── Tutor Reels ───────────────────────────────────────────

export interface TutorReel {
  id: number
  tutorName: string
  tutorInitial: string
  tutorPhoto: string
  tutorAvatar: string
  subject: string
  level: string
  title: string
  description: string
  duration: string
  likes: number
  comments: number
  isLiked: boolean
  isSaved: boolean
  isCompetition: boolean
  competitionAnswer?: string
  xpReward?: number
  gradientFrom: string
  gradientTo: string
  gradientVia?: string
}

export const TUTOR_REELS: TutorReel[] = [
  {
    id: 1,
    tutorName: 'Dr. Sarah Chen',
    tutorInitial: 'S',
    tutorPhoto: 'https://images.unsplash.com/photo-1596496050827-8299e0220de1?w=600&h=800&fit=crop',
    tutorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    subject: 'Maths',
    level: 'GCSE',
    title: '3 Quick Tricks for Quadratic Equations',
    description: 'Learn how to factorise any quadratic in under 30 seconds using these simple tricks.',
    duration: '2:45',
    likes: 342,
    comments: 47,
    isLiked: false,
    isSaved: false,
    isCompetition: false,
    gradientFrom: '#3B82F6',
    gradientTo: '#1D4ED8',
    gradientVia: '#2563EB',
  },
  {
    id: 2,
    tutorName: 'Prof. James Wilson',
    tutorInitial: 'J',
    tutorPhoto: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=800&fit=crop',
    tutorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
    subject: 'English',
    level: 'A-Level',
    title: 'How to Structure a Perfect Essay',
    description: 'The PEEL method will transform your essay writing. Point, Evidence, Explain, Link.',
    duration: '3:10',
    likes: 518,
    comments: 63,
    isLiked: true,
    isSaved: false,
    isCompetition: false,
    gradientFrom: '#F59E0B',
    gradientTo: '#D97706',
    gradientVia: '#FBBF24',
  },
  {
    id: 3,
    tutorName: 'Dr. Emily Brooks',
    tutorInitial: 'E',
    tutorPhoto: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=800&fit=crop',
    tutorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    subject: 'Biology',
    level: 'GCSE',
    title: 'Photosynthesis in 60 Seconds',
    description: 'Carbon dioxide + water + light energy = glucose + oxygen. Here is how it all works.',
    duration: '1:00',
    likes: 891,
    comments: 112,
    isLiked: false,
    isSaved: true,
    isCompetition: false,
    gradientFrom: '#10B981',
    gradientTo: '#059669',
    gradientVia: '#34D399',
  },
  {
    id: 4,
    tutorName: 'Dr. Mark Thompson',
    tutorInitial: 'M',
    tutorPhoto: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=800&fit=crop',
    tutorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    subject: 'Physics',
    level: 'A-Level',
    title: "Newton's Laws Made Simple",
    description: 'Every action has an equal and opposite reaction. But what does that really mean?',
    duration: '2:30',
    likes: 267,
    comments: 34,
    isLiked: false,
    isSaved: false,
    isCompetition: false,
    gradientFrom: '#F97316',
    gradientTo: '#EA580C',
    gradientVia: '#FB923C',
  },
  {
    id: 5,
    tutorName: 'Dr. Sarah Chen',
    tutorInitial: 'S',
    tutorPhoto: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=800&fit=crop',
    tutorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    subject: 'Exam Tips',
    level: 'All Levels',
    title: 'Exam Day Checklist',
    description: 'The 5 things every student must do before walking into the exam hall.',
    duration: '3:45',
    likes: 1203,
    comments: 189,
    isLiked: false,
    isSaved: false,
    isCompetition: false,
    gradientFrom: '#8B5CF6',
    gradientTo: '#6D28D9',
    gradientVia: '#A78BFA',
  },
  {
    id: 6,
    tutorName: 'Dr. Sarah Chen',
    tutorInitial: 'S',
    tutorPhoto: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=800&fit=crop',
    tutorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    subject: 'Maths',
    level: 'GCSE',
    title: 'Can you solve this? x\u00B2 + 5x + 6 = 0',
    description: 'Drop your answer below! First correct answer wins 50 XP.',
    duration: '1:30',
    likes: 756,
    comments: 234,
    isLiked: false,
    isSaved: false,
    isCompetition: true,
    competitionAnswer: '(-2,-3)',
    xpReward: 50,
    gradientFrom: '#3B82F6',
    gradientTo: '#7C3AED',
    gradientVia: '#6366F1',
  },
  {
    id: 7,
    tutorName: 'Dr. Emily Brooks',
    tutorInitial: 'E',
    tutorPhoto: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&h=800&fit=crop',
    tutorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    subject: 'Chemistry',
    level: 'GCSE',
    title: 'Balancing Chemical Equations',
    description: 'The atom-counting method that makes balancing equations easy every time.',
    duration: '2:15',
    likes: 445,
    comments: 56,
    isLiked: false,
    isSaved: false,
    isCompetition: false,
    gradientFrom: '#A855F7',
    gradientTo: '#7C3AED',
    gradientVia: '#C084FC',
  },
  {
    id: 8,
    tutorName: 'Prof. James Wilson',
    tutorInitial: 'J',
    tutorPhoto: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&h=800&fit=crop',
    tutorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
    subject: 'English',
    level: 'GCSE',
    title: '5 Common Grammar Mistakes',
    description: "Their, there, they're — and 4 other mistakes that cost you marks every exam.",
    duration: '2:00',
    likes: 623,
    comments: 78,
    isLiked: false,
    isSaved: false,
    isCompetition: false,
    gradientFrom: '#F59E0B',
    gradientTo: '#B45309',
    gradientVia: '#D97706',
  },
]
