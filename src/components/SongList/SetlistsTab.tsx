import { useState } from 'react'
import { useSetlistStore } from '../../store/setlistStore'
import { useSongStore } from '../../store/songStore'

interface SetlistsTabProps {
  onPlayQueue: (songIds: string[]) => void
}

export function SetlistsTab({ onPlayQueue }: SetlistsTabProps) {
  const { setlists, addSetlist, renameSetlist, deleteSetlist, addSongToSetlist, removeSongFromSetlist, moveSongInSetlist } =
    useSetlistStore()
  const { songs } = useSongStore()
  const [openId, setOpenId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [addingSong, setAddingSong] = useState<string | null>(null)

  const songById = (id: string) => songs.find((s) => s.id === id)

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-3">
        {setlists.length === 0 && (
          <div className="text-center text-text-secondary py-16">
            <div className="text-5xl mb-4">≡</div>
            <p className="text-lg">Keine Setlists</p>
            <p className="text-sm mt-1">Erstelle ein Set für deinen Gig</p>
          </div>
        )}

        {setlists.map((sl) => {
          const open = openId === sl.id
          return (
            <div key={sl.id} className="glass rounded-3xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  value={sl.name}
                  onChange={(e) => renameSetlist(sl.id, e.target.value)}
                  className="flex-1 bg-transparent text-white font-semibold text-lg tracking-tight focus:outline-none min-w-0"
                />
                <button
                  onClick={() => onPlayQueue(sl.songIds)}
                  disabled={sl.songIds.length === 0}
                  className="glass-accent min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl text-lg disabled:opacity-40"
                  title="Set starten"
                >
                  ▶
                </button>
                <button
                  onClick={() => setOpenId(open ? null : sl.id)}
                  className="glass-button min-h-[44px] min-w-[44px] flex items-center justify-center text-white rounded-xl"
                >
                  {open ? '▾' : '▸'}
                </button>
              </div>

              <p className="text-text-secondary text-sm">
                {sl.songIds.length} {sl.songIds.length === 1 ? 'Song' : 'Songs'}
              </p>

              {open && (
                <div className="space-y-2">
                  {sl.songIds.map((sid, idx) => {
                    const song = songById(sid)
                    return (
                      <div key={`${sid}-${idx}`} className="flex items-center gap-2 bg-white/[0.04] rounded-xl px-3 py-2">
                        <span className="text-text-secondary text-sm w-5 shrink-0">{idx + 1}</span>
                        <span className="flex-1 text-white text-sm truncate">
                          {song ? song.title : '⚠ gelöschter Song'}
                        </span>
                        <button onClick={() => moveSongInSetlist(sl.id, idx, -1)} disabled={idx === 0}
                          className="text-text-secondary hover:text-white disabled:opacity-30 min-w-[28px] min-h-[28px]">↑</button>
                        <button onClick={() => moveSongInSetlist(sl.id, idx, 1)} disabled={idx === sl.songIds.length - 1}
                          className="text-text-secondary hover:text-white disabled:opacity-30 min-w-[28px] min-h-[28px]">↓</button>
                        <button onClick={() => removeSongFromSetlist(sl.id, idx)}
                          className="text-text-secondary hover:text-red-400 min-w-[28px] min-h-[28px]">✕</button>
                      </div>
                    )
                  })}

                  {addingSong === sl.id ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {songs.length === 0 && <p className="text-text-secondary text-sm">Keine Songs vorhanden.</p>}
                      {songs.map((song) => (
                        <button
                          key={song.id}
                          onClick={() => { addSongToSetlist(sl.id, song.id); setAddingSong(null) }}
                          className="w-full glass-button text-left text-white text-sm rounded-xl px-3 py-2 min-h-[40px]"
                        >
                          {song.title}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAddingSong(sl.id)}
                        className="flex-1 glass-button text-white rounded-xl min-h-[40px] text-sm"
                      >
                        + Song hinzufügen
                      </button>
                      <button
                        onClick={() => { deleteSetlist(sl.id); setOpenId(null) }}
                        className="glass-button text-red-300 rounded-xl px-4 min-h-[40px] text-sm"
                      >
                        Set löschen
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer: create setlist */}
      <div className="px-5 py-3 flex gap-2 shrink-0">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newName.trim()) {
              const id = addSetlist(newName.trim())
              setNewName('')
              setOpenId(id)
            }
          }}
          placeholder="Name der Setlist…"
          className="flex-1 glass rounded-2xl px-4 min-h-[48px] text-white placeholder-text-secondary focus:outline-none text-sm"
        />
        <button
          onClick={() => {
            if (!newName.trim()) return
            const id = addSetlist(newName.trim())
            setNewName('')
            setOpenId(id)
          }}
          disabled={!newName.trim()}
          className="min-h-[48px] px-5 glass-accent rounded-2xl font-semibold disabled:opacity-40"
        >
          + Set
        </button>
      </div>
    </>
  )
}
