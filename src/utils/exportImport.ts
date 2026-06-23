import { Song } from '../types'

export function exportSongsAsJSON(songs: Song[]): void {
  const blob = new Blob([JSON.stringify({ songs, exportedAt: new Date().toISOString(), version: 1 }, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `synth-sheet-live-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importSongsFromJSON(file: File): Promise<Song[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parsed = JSON.parse(text)
        const songs: Song[] = parsed.songs ?? parsed
        if (!Array.isArray(songs)) throw new Error('Invalid format')
        resolve(songs)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export function exportSongAsJSON(song: Song): void {
  const blob = new Blob([JSON.stringify(song, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${song.title.replace(/\s+/g, '-').toLowerCase()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
