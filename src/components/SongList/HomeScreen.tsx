import { useRef, useState } from 'react'
import { useSongStore } from '../../store/songStore'
import { SongCard } from './SongCard'
import { SetlistsTab } from './SetlistsTab'
import { importSongsFromJSON } from '../../utils/exportImport'
import { shareAllSongs, shareSong } from '../../utils/share'

interface HomeScreenProps {
  onEditSong: (id: string) => void
  onPlaySong: (id: string) => void
  onPlayQueue: (songIds: string[]) => void
  onSettings: () => void
}

type Tab = 'songs' | 'setlists'

export function HomeScreen({ onEditSong, onPlaySong, onPlayQueue, onSettings }: HomeScreenProps) {
  const { songs, addSong, duplicateSong, deleteSong, importSongs } = useSongStore()
  const [tab, setTab] = useState<Tab>('songs')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  const handleNew = () => onEditSong(addSong())

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
      importSongs(await importSongsFromJSON(file))
    } catch {
      alert('Import fehlgeschlagen: ungültige JSON-Datei')
    }
    e.target.value = ''
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Synth Sheet</h1>
          <p className="text-text-secondary text-sm">Live</p>
        </div>
        <button
          onClick={onSettings}
          className="glass-button min-h-[44px] min-w-[44px] flex items-center justify-center text-white rounded-full text-xl"
          title="Einstellungen"
        >
          ⚙
        </button>
      </div>

      {/* Segmented tabs */}
      <div className="px-5 pb-3 shrink-0">
        <div className="glass rounded-2xl p-1 flex">
          {(['songs', 'setlists'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 min-h-[40px] rounded-xl text-sm font-semibold transition-all ${
                tab === t ? 'glass-accent' : 'text-text-secondary hover:text-white'
              }`}
            >
              {t === 'songs' ? 'Songs' : 'Setlists'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === 'songs' ? (
        <>
          <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-3">
            {songs.length === 0 && (
              <div className="text-center text-text-secondary py-16">
                <div className="text-5xl mb-4">♩</div>
                <p className="text-lg">Noch keine Songs</p>
                <p className="text-sm mt-1">Tippe „Neuer Song" zum Loslegen</p>
              </div>
            )}
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                confirmingDelete={deleteConfirm === song.id}
                onPlay={() => onPlaySong(song.id)}
                onEdit={() => onEditSong(song.id)}
                onDuplicate={() => duplicateSong(song.id)}
                onDelete={() => handleDelete(song.id)}
                onShare={() => shareSong(song)}
              />
            ))}
          </div>

          {/* Footer actions */}
          <div className="px-5 py-3 flex gap-2 shrink-0">
            <button onClick={handleNew} className="flex-1 min-h-[48px] glass-accent rounded-2xl font-semibold">
              + Neuer Song
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="min-h-[48px] px-4 glass-button text-white rounded-2xl text-sm"
            >
              Import
            </button>
            <button
              onClick={() => shareAllSongs(songs)}
              disabled={songs.length === 0}
              className="min-h-[48px] px-4 glass-button text-white rounded-2xl text-sm disabled:opacity-40"
              title="Alle Songs teilen / exportieren"
            >
              ↗ Teilen
            </button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </>
      ) : (
        <SetlistsTab onPlayQueue={onPlayQueue} />
      )}
    </div>
  )
}
