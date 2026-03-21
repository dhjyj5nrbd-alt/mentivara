// ── Shared voice utility for Mental Dojo ────────────────────
// Selects the most natural-sounding soft female English voice
// available on the user's browser/OS. Falls back gracefully.

/** Preferred female voices ranked by naturalness & softness */
const PREFERRED_FEMALE_VOICES = [
  // Windows 11 natural neural voices (best quality)
  'Microsoft Jenny',          // US English, neural, very natural
  'Microsoft Aria',           // US English, neural
  'Microsoft Sara',           // US English, neural
  'Microsoft Libby',          // UK English, neural
  'Microsoft Sonia',          // UK English, neural
  'Microsoft Emily',          // neural
  // Windows legacy voices (still decent)
  'Microsoft Zira',           // US English
  'Microsoft Hazel',          // UK English
  'Microsoft Susan',          // UK English
  // macOS voices
  'Samantha',                 // macOS default, warm tone
  'Karen',                    // Australian English, soft
  'Moira',                    // Irish English, gentle
  'Tessa',                    // South African English
  'Fiona',                    // Scottish English
  'Victoria',                 // macOS English
  // Chrome/Edge online voices
  'Google UK English Female',
  'Google US English',
  // Linux espeak female
  'English (America)+Annie',
  'English+Storm',
]

let cachedVoice: SpeechSynthesisVoice | null = null
let cacheKey = ''

/**
 * Get the best available soft female English voice.
 * Caches the result until the voice list changes.
 */
export function getFemaleVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices()
  const key = voices.map((v) => v.name).join(',')
  if (key === cacheKey && cachedVoice) return cachedVoice

  cacheKey = key

  // Try each preferred voice in order
  for (const name of PREFERRED_FEMALE_VOICES) {
    const match = voices.find(
      (v) => v.name.includes(name) && v.lang.startsWith('en')
    )
    if (match) {
      cachedVoice = match
      return match
    }
  }

  // Fallback: any English female-sounding voice (heuristic: name contains
  // common female name patterns, excludes known male voices)
  const maleNames = ['David', 'Daniel', 'James', 'George', 'Mark', 'Fred', 'Alex', 'Tom', 'Richard']
  const fallback = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      !maleNames.some((m) => v.name.includes(m))
  )
  if (fallback) {
    cachedVoice = fallback
    return fallback
  }

  // Last resort: any English voice at all
  const anyEnglish = voices.find((v) => v.lang.startsWith('en'))
  cachedVoice = anyEnglish || null
  return cachedVoice
}

/** Default speech settings for a calm, soft-spoken female voice */
export const VOICE_DEFAULTS = {
  rate: 0.82,    // slightly slower than normal for calm delivery
  pitch: 1.05,   // slightly higher for a softer female tone
  volume: 1,
} as const

/**
 * Create a pre-configured utterance with the best female voice.
 * Override rate/pitch per-call for emphasis or pacing variation.
 */
export function createUtterance(
  text: string,
  opts?: { rate?: number; pitch?: number; volume?: number }
): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text)
  const voice = getFemaleVoice()
  if (voice) utterance.voice = voice
  utterance.rate = opts?.rate ?? VOICE_DEFAULTS.rate
  utterance.pitch = opts?.pitch ?? VOICE_DEFAULTS.pitch
  utterance.volume = opts?.volume ?? VOICE_DEFAULTS.volume
  return utterance
}

/**
 * Speak text and return a promise that resolves when done.
 * Cancels any current speech first.
 */
export function speakAsync(
  text: string,
  opts?: { rate?: number; pitch?: number; volume?: number; cancelFirst?: boolean }
): Promise<void> {
  return new Promise((resolve) => {
    if (opts?.cancelFirst !== false) speechSynthesis.cancel()
    const utterance = createUtterance(text, opts)
    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    speechSynthesis.speak(utterance)
  })
}

/**
 * Fire-and-forget speech (no await). Cancels current speech.
 */
export function speakFire(
  text: string,
  opts?: { rate?: number; pitch?: number; volume?: number; cancelFirst?: boolean }
): void {
  if (opts?.cancelFirst !== false) speechSynthesis.cancel()
  const utterance = createUtterance(text, opts)
  speechSynthesis.speak(utterance)
}

/**
 * Initialise voices (call in a useEffect). Returns cleanup function.
 */
export function initVoices(): () => void {
  const load = () => speechSynthesis.getVoices()
  load()
  speechSynthesis.addEventListener('voiceschanged', load)
  return () => speechSynthesis.removeEventListener('voiceschanged', load)
}
