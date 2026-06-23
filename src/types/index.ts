export interface Song {
  id: string
  title: string
  bpm: number
  timeSignature: [number, number]
  key: string
  sections: Section[]
  patches: Patch[]
  midiChannel?: number // 0–15, default 0
}

export interface Setlist {
  id: string
  name: string
  songIds: string[]
}

export interface MidiBinding {
  type: 'cc' | 'note'
  number: number
}

export interface Section {
  id: string
  name: string
  bars: Bar[]
  color?: string
}

export interface Bar {
  id: string
  slots: Slot[]
}

export interface Slot {
  chord: string
  patchId?: string
  annotation?: string
  midiPC?: number // 0–127
  midiBankMSB?: number // CC#0, 0–127
  midiBankLSB?: number // CC#32, 0–127
}

export interface Patch {
  id: string
  name: string
  color: string
}

export type FontSize = 'small' | 'medium' | 'large' | 'xl'

export type TimeSignature = [number, number]

export const TIME_SIGNATURES: TimeSignature[] = [
  [4, 4],
  [3, 4],
  [6, 8],
  [5, 4],
  [7, 8],
]

export const KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

export const SECTION_COLORS = [
  '#7c3aed',
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#db2777',
  '#0891b2',
  '#65a30d',
]
