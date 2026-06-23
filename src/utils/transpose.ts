const CHROMATIC = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const ENHARMONIC: Record<string, string> = {
  'Db': 'C#', 'D#': 'Eb', 'E#': 'F', 'Fb': 'E',
  'Gb': 'F#', 'G#': 'Ab', 'A#': 'Bb', 'B#': 'C', 'Cb': 'B',
}

function normalizeNote(note: string): string {
  return ENHARMONIC[note] ?? note
}

function noteIndex(note: string): number {
  return CHROMATIC.indexOf(normalizeNote(note))
}

function parseChord(chord: string): { root: string; suffix: string } | null {
  if (!chord || chord === '—' || chord === '-') return null

  const match = chord.match(/^([A-G][#b]?)(.*)$/)
  if (!match) return null

  const root = match[1]
  const suffix = match[2]

  if (noteIndex(root) === -1) return null
  return { root, suffix }
}

function transposeNote(note: string, semitones: number): string {
  const idx = noteIndex(note)
  if (idx === -1) return note
  const newIdx = ((idx + semitones) % 12 + 12) % 12
  return CHROMATIC[newIdx]
}

export function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) return chord

  const parsed = parseChord(chord)
  if (!parsed) return chord

  // Handle slash chords (e.g. C/G)
  const slashIdx = chord.lastIndexOf('/')
  if (slashIdx > 0) {
    const upper = chord.slice(0, slashIdx)
    const bass = chord.slice(slashIdx + 1)
    const transposedUpper = transposeChord(upper, semitones)
    const bassParsed = parseChord(bass)
    if (bassParsed) {
      const transposedBass = transposeNote(bassParsed.root, semitones) + bassParsed.suffix
      return `${transposedUpper}/${transposedBass}`
    }
    return `${transposedUpper}/${bass}`
  }

  const newRoot = transposeNote(parsed.root, semitones)
  return newRoot + parsed.suffix
}

export function getSemitones(fromKey: string, toKey: string): number {
  const from = noteIndex(fromKey.replace('m', '').trim())
  const to = noteIndex(toKey.replace('m', '').trim())
  if (from === -1 || to === -1) return 0
  return ((to - from) % 12 + 12) % 12
}
