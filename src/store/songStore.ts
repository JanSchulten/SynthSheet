import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Song, Section, Bar, Slot, Patch, SECTION_COLORS } from '../types'
import { transposeChord, getSemitones } from '../utils/transpose'

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

function makeBar(beats: number): Bar {
  return {
    id: uid(),
    slots: Array.from({ length: beats }, () => ({ chord: '' })),
  }
}

function makeSection(name: string, beats: number, colorIdx: number): Section {
  return {
    id: uid(),
    name,
    bars: [makeBar(beats)],
    color: SECTION_COLORS[colorIdx % SECTION_COLORS.length],
  }
}

function makeSong(): Song {
  return {
    id: uid(),
    title: 'New Song',
    bpm: 120,
    timeSignature: [4, 4],
    key: 'C',
    sections: [makeSection('Intro', 4, 0)],
    patches: [],
  }
}

interface SongStore {
  songs: Song[]
  currentSongId: string | null
  addSong: () => string
  duplicateSong: (id: string) => void
  deleteSong: (id: string) => void
  setCurrentSong: (id: string | null) => void
  updateSong: (id: string, updates: Partial<Song>) => void
  importSong: (song: Song) => void
  importSongs: (songs: Song[]) => void
  clearAll: () => void

  // Section operations
  addSection: (songId: string) => void
  updateSection: (songId: string, sectionId: string, updates: Partial<Section>) => void
  deleteSection: (songId: string, sectionId: string) => void
  moveSectionUp: (songId: string, sectionId: string) => void
  moveSectionDown: (songId: string, sectionId: string) => void

  // Bar operations
  addBar: (songId: string, sectionId: string) => void
  removeBar: (songId: string, sectionId: string, barId: string) => void

  // Slot operations
  updateSlot: (songId: string, sectionId: string, barId: string, slotIdx: number, updates: Partial<Slot>) => void
  clearSlot: (songId: string, sectionId: string, barId: string, slotIdx: number) => void

  // Patch operations
  addPatch: (songId: string, patch: Omit<Patch, 'id'>) => string
  updatePatch: (songId: string, patchId: string, updates: Partial<Patch>) => void
  deletePatch: (songId: string, patchId: string) => void

  // Transpose
  transposeSong: (songId: string, toKey: string) => void
}

export const useSongStore = create<SongStore>()(
  persist(
    (set, get) => ({
      songs: [],
      currentSongId: null,

      addSong: () => {
        const song = makeSong()
        set((s) => ({ songs: [...s.songs, song] }))
        return song.id
      },

      duplicateSong: (id) => {
        const song = get().songs.find((s) => s.id === id)
        if (!song) return
        const dup: Song = {
          ...JSON.parse(JSON.stringify(song)),
          id: uid(),
          title: song.title + ' (Copy)',
        }
        set((s) => ({ songs: [...s.songs, dup] }))
      },

      deleteSong: (id) => {
        set((s) => ({
          songs: s.songs.filter((song) => song.id !== id),
          currentSongId: s.currentSongId === id ? null : s.currentSongId,
        }))
      },

      setCurrentSong: (id) => set({ currentSongId: id }),

      updateSong: (id, updates) => {
        set((s) => ({
          songs: s.songs.map((song) => {
            if (song.id !== id) return song
            const updated = { ...song, ...updates }
            // If time signature changed, resize all bar slots
            if (updates.timeSignature) {
              const beats = updates.timeSignature[0]
              updated.sections = song.sections.map((sec) => ({
                ...sec,
                bars: sec.bars.map((bar) => {
                  const slots: Slot[] = Array.from({ length: beats }, (_, i) => bar.slots[i] ?? { chord: '' })
                  return { ...bar, slots }
                }),
              }))
            }
            return updated
          }),
        }))
      },

      importSong: (song) => {
        const existing = get().songs.find((s) => s.id === song.id)
        if (existing) {
          set((s) => ({ songs: s.songs.map((x) => (x.id === song.id ? song : x)) }))
        } else {
          set((s) => ({ songs: [...s.songs, song] }))
        }
      },

      importSongs: (songs) => {
        set((s) => {
          const merged = [...s.songs]
          songs.forEach((incoming) => {
            const idx = merged.findIndex((x) => x.id === incoming.id)
            if (idx >= 0) merged[idx] = incoming
            else merged.push(incoming)
          })
          return { songs: merged }
        })
      },

      clearAll: () => set({ songs: [], currentSongId: null }),

      addSection: (songId) => {
        set((s) => ({
          songs: s.songs.map((song) => {
            if (song.id !== songId) return song
            const colorIdx = song.sections.length
            const beats = song.timeSignature[0]
            return {
              ...song,
              sections: [...song.sections, makeSection(`Section ${song.sections.length + 1}`, beats, colorIdx)],
            }
          }),
        }))
      },

      updateSection: (songId, sectionId, updates) => {
        set((s) => ({
          songs: s.songs.map((song) => {
            if (song.id !== songId) return song
            return {
              ...song,
              sections: song.sections.map((sec) =>
                sec.id === sectionId ? { ...sec, ...updates } : sec
              ),
            }
          }),
        }))
      },

      deleteSection: (songId, sectionId) => {
        set((s) => ({
          songs: s.songs.map((song) => {
            if (song.id !== songId) return song
            return { ...song, sections: song.sections.filter((sec) => sec.id !== sectionId) }
          }),
        }))
      },

      moveSectionUp: (songId, sectionId) => {
        set((s) => ({
          songs: s.songs.map((song) => {
            if (song.id !== songId) return song
            const idx = song.sections.findIndex((sec) => sec.id === sectionId)
            if (idx <= 0) return song
            const secs = [...song.sections]
            ;[secs[idx - 1], secs[idx]] = [secs[idx], secs[idx - 1]]
            return { ...song, sections: secs }
          }),
        }))
      },

      moveSectionDown: (songId, sectionId) => {
        set((s) => ({
          songs: s.songs.map((song) => {
            if (song.id !== songId) return song
            const idx = song.sections.findIndex((sec) => sec.id === sectionId)
            if (idx >= song.sections.length - 1) return song
            const secs = [...song.sections]
            ;[secs[idx], secs[idx + 1]] = [secs[idx + 1], secs[idx]]
            return { ...song, sections: secs }
          }),
        }))
      },

      addBar: (songId, sectionId) => {
        set((s) => ({
          songs: s.songs.map((song) => {
            if (song.id !== songId) return song
            return {
              ...song,
              sections: song.sections.map((sec) => {
                if (sec.id !== sectionId) return sec
                return { ...sec, bars: [...sec.bars, makeBar(song.timeSignature[0])] }
              }),
            }
          }),
        }))
      },

      removeBar: (songId, sectionId, barId) => {
        set((s) => ({
          songs: s.songs.map((song) => {
            if (song.id !== songId) return song
            return {
              ...song,
              sections: song.sections.map((sec) => {
                if (sec.id !== sectionId) return sec
                if (sec.bars.length <= 1) return sec
                return { ...sec, bars: sec.bars.filter((b) => b.id !== barId) }
              }),
            }
          }),
        }))
      },

      updateSlot: (songId, sectionId, barId, slotIdx, updates) => {
        set((s) => ({
          songs: s.songs.map((song) => {
            if (song.id !== songId) return song
            return {
              ...song,
              sections: song.sections.map((sec) => {
                if (sec.id !== sectionId) return sec
                return {
                  ...sec,
                  bars: sec.bars.map((bar) => {
                    if (bar.id !== barId) return bar
                    const slots = [...bar.slots]
                    slots[slotIdx] = { ...slots[slotIdx], ...updates }
                    return { ...bar, slots }
                  }),
                }
              }),
            }
          }),
        }))
      },

      clearSlot: (songId, sectionId, barId, slotIdx) => {
        set((s) => ({
          songs: s.songs.map((song) => {
            if (song.id !== songId) return song
            return {
              ...song,
              sections: song.sections.map((sec) => {
                if (sec.id !== sectionId) return sec
                return {
                  ...sec,
                  bars: sec.bars.map((bar) => {
                    if (bar.id !== barId) return bar
                    const slots = [...bar.slots]
                    slots[slotIdx] = { chord: '' }
                    return { ...bar, slots }
                  }),
                }
              }),
            }
          }),
        }))
      },

      addPatch: (songId, patch) => {
        const id = uid()
        set((s) => ({
          songs: s.songs.map((song) => {
            if (song.id !== songId) return song
            return { ...song, patches: [...song.patches, { ...patch, id }] }
          }),
        }))
        return id
      },

      updatePatch: (songId, patchId, updates) => {
        set((s) => ({
          songs: s.songs.map((song) => {
            if (song.id !== songId) return song
            return {
              ...song,
              patches: song.patches.map((p) => (p.id === patchId ? { ...p, ...updates } : p)),
            }
          }),
        }))
      },

      deletePatch: (songId, patchId) => {
        set((s) => ({
          songs: s.songs.map((song) => {
            if (song.id !== songId) return song
            return {
              ...song,
              patches: song.patches.filter((p) => p.id !== patchId),
              sections: song.sections.map((sec) => ({
                ...sec,
                bars: sec.bars.map((bar) => ({
                  ...bar,
                  slots: bar.slots.map((slot) =>
                    slot.patchId === patchId ? { ...slot, patchId: undefined } : slot
                  ),
                })),
              })),
            }
          }),
        }))
      },

      transposeSong: (songId, toKey) => {
        set((s) => ({
          songs: s.songs.map((song) => {
            if (song.id !== songId) return song
            const semitones = getSemitones(song.key, toKey)
            if (semitones === 0) return { ...song, key: toKey }
            return {
              ...song,
              key: toKey,
              sections: song.sections.map((sec) => ({
                ...sec,
                bars: sec.bars.map((bar) => ({
                  ...bar,
                  slots: bar.slots.map((slot) => ({
                    ...slot,
                    chord: slot.chord ? transposeChord(slot.chord, semitones) : slot.chord,
                  })),
                })),
              })),
            }
          }),
        }))
      },
    }),
    { name: 'synth-sheet-songs' }
  )
)
