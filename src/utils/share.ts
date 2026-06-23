import { Song } from '../types'

function makeJsonFile(name: string, data: unknown): File {
  const json = JSON.stringify(data, null, 2)
  return new File([json], name, { type: 'application/json' })
}

function downloadFile(file: File): void {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  URL.revokeObjectURL(url)
}

export function canShareFiles(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    typeof navigator.share === 'function'
  )
}

/**
 * Shares a file via the native share sheet (WhatsApp, Mail, iCloud, AirDrop …).
 * Falls back to a normal download when the Web Share API can't share files.
 * Returns true if the native share sheet was used.
 */
async function shareOrDownload(file: File, title: string): Promise<boolean> {
  if (canShareFiles() && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title })
      return true
    } catch (err) {
      // User cancelled the share sheet — do nothing, don't fall back.
      if (err instanceof DOMException && err.name === 'AbortError') return true
    }
  }
  downloadFile(file)
  return false
}

function slug(s: string): string {
  return s.trim().replace(/\s+/g, '-').toLowerCase() || 'song'
}

export async function shareSong(song: Song): Promise<boolean> {
  const file = makeJsonFile(`${slug(song.title)}.synthsheet.json`, song)
  return shareOrDownload(file, song.title)
}

export async function shareAllSongs(songs: Song[]): Promise<boolean> {
  const file = makeJsonFile(
    `synth-sheet-backup-${new Date().toISOString().slice(0, 10)}.json`,
    { songs, exportedAt: new Date().toISOString(), version: 1 }
  )
  return shareOrDownload(file, 'Synth Sheet Backup')
}
