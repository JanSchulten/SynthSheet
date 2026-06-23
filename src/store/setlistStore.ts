import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Setlist } from '../types'

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

interface SetlistStore {
  setlists: Setlist[]
  addSetlist: (name: string) => string
  renameSetlist: (id: string, name: string) => void
  deleteSetlist: (id: string) => void
  addSongToSetlist: (id: string, songId: string) => void
  removeSongFromSetlist: (id: string, index: number) => void
  moveSongInSetlist: (id: string, index: number, dir: -1 | 1) => void
}

export const useSetlistStore = create<SetlistStore>()(
  persist(
    (set) => ({
      setlists: [],

      addSetlist: (name) => {
        const id = uid()
        set((s) => ({ setlists: [...s.setlists, { id, name, songIds: [] }] }))
        return id
      },

      renameSetlist: (id, name) =>
        set((s) => ({
          setlists: s.setlists.map((sl) => (sl.id === id ? { ...sl, name } : sl)),
        })),

      deleteSetlist: (id) =>
        set((s) => ({ setlists: s.setlists.filter((sl) => sl.id !== id) })),

      addSongToSetlist: (id, songId) =>
        set((s) => ({
          setlists: s.setlists.map((sl) =>
            sl.id === id ? { ...sl, songIds: [...sl.songIds, songId] } : sl
          ),
        })),

      removeSongFromSetlist: (id, index) =>
        set((s) => ({
          setlists: s.setlists.map((sl) =>
            sl.id === id ? { ...sl, songIds: sl.songIds.filter((_, i) => i !== index) } : sl
          ),
        })),

      moveSongInSetlist: (id, index, dir) =>
        set((s) => ({
          setlists: s.setlists.map((sl) => {
            if (sl.id !== id) return sl
            const target = index + dir
            if (target < 0 || target >= sl.songIds.length) return sl
            const ids = [...sl.songIds]
            ;[ids[index], ids[target]] = [ids[target], ids[index]]
            return { ...sl, songIds: ids }
          }),
        })),
    }),
    { name: 'synth-sheet-setlists' }
  )
)
