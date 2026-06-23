import { useRef, useState } from 'react'
import { useSongStore } from '../../store/songStore'
import { SongCard } from './SongCard'
import { exportSongsAsJSON, importSongsFromJSON } from '../../utils/exportImport'

interface SongListProps {
  onEdit: (id: string) => void
  onSettings: () => void
}

export function SongList({ onEdit, onSettings }: SongListProps) {
  const { songs, addSong, duplicateSong, deleteSong, importSongs } = useSongStore()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  const handleNew = () => {
    const id = addSong()
    onEdit(id)
  }

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteSong(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importSongsFromJSON(file)
      importSongs(imported)
    } catch {
      alert('Failed to import: invalid JSON file')
    }
    e.target.value = ''
  }

  return (
    <div
      className="flex flex-col h-full bg-bg"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-surface border-b border-border shrink-0">
        <div>
          <h1 className="text-white text-xl font-bold">Synth Sheet Live</h1>
          <p className="text-text-secondary text-sm">{songs.length} song{songs.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onSettings}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-secondary hover:text-white rounded-lg hover:bg-border transition-colors text-xl"
          title="Settings"
        >
          ⚙
        </button>
      </div>

      {/* Song list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {songs.length === 0 && (
          <div className="text-center text-text-secondary py-16">
            <div className="text-5xl mb-4">♩</div>
            <p className="text-lg">No songs yet</p>
            <p className="text-sm mt-1">Tap "New Song" to get started</p>
          </div>
        )}
        {songs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            onEdit={() => onEdit(song.id)}
            onDuplicate={() => duplicateSong(song.id)}
            onDelete={() => handleDelete(song.id)}
          />
        ))}
        {deleteConfirm && (
          <p className="text-center text-red-400 text-sm animate-pulse">Tap delete again to confirm</p>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-4 py-3 bg-surface border-t border-border flex gap-2 shrink-0">
        <button
          onClick={handleNew}
          className="flex-1 min-h-[44px] bg-accent text-bg font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          + New Song
        </button>
        <button
          onClick={() => importRef.current?.click()}
          className="min-h-[44px] px-4 bg-border text-white rounded-lg hover:bg-[#3a3a3a] transition-colors text-sm"
          title="Import JSON"
        >
          Import
        </button>
        <button
          onClick={() => exportSongsAsJSON(songs)}
          className="min-h-[44px] px-4 bg-border text-white rounded-lg hover:bg-[#3a3a3a] transition-colors text-sm"
          title="Export all songs as JSON"
          disabled={songs.length === 0}
        >
          Export
        </button>
        <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>
    </div>
  )
}
