import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FontSize } from '../types'

interface SettingsStore {
  fontSize: FontSize
  midiOutputId: string | null
  setFontSize: (size: FontSize) => void
  setMidiOutputId: (id: string | null) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      fontSize: 'medium',
      midiOutputId: null,
      setFontSize: (size) => set({ fontSize: size }),
      setMidiOutputId: (id) => set({ midiOutputId: id }),
    }),
    { name: 'synth-sheet-settings' }
  )
)
