import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FontSize, MidiBinding } from '../types'

interface SettingsStore {
  fontSize: FontSize
  midiOutputId: string | null
  midiInputId: string | null
  navNext: MidiBinding | null
  navPrev: MidiBinding | null
  metronomeEnabled: boolean
  midiClockEnabled: boolean
  setFontSize: (size: FontSize) => void
  setMidiOutputId: (id: string | null) => void
  setMidiInputId: (id: string | null) => void
  setNavNext: (b: MidiBinding | null) => void
  setNavPrev: (b: MidiBinding | null) => void
  setMetronomeEnabled: (v: boolean) => void
  setMidiClockEnabled: (v: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      fontSize: 'medium',
      midiOutputId: null,
      midiInputId: null,
      navNext: { type: 'cc', number: 64 }, // sustain pedal by default
      navPrev: null,
      metronomeEnabled: false,
      midiClockEnabled: false,
      setFontSize: (size) => set({ fontSize: size }),
      setMidiOutputId: (id) => set({ midiOutputId: id }),
      setMidiInputId: (id) => set({ midiInputId: id }),
      setNavNext: (b) => set({ navNext: b }),
      setNavPrev: (b) => set({ navPrev: b }),
      setMetronomeEnabled: (v) => set({ metronomeEnabled: v }),
      setMidiClockEnabled: (v) => set({ midiClockEnabled: v }),
    }),
    { name: 'synth-sheet-settings' }
  )
)
