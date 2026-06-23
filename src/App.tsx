import { useState } from 'react'
import { HomeScreen } from './components/SongList/HomeScreen'
import { EditorView } from './components/Editor/EditorView'
import { PerformanceView } from './components/Performance/PerformanceView'
import { SettingsPanel } from './components/Settings/SettingsPanel'
import { useSongStore } from './store/songStore'

type Screen = 'home' | 'editor' | 'performance'

interface PerfQueue {
  songIds: string[]
  index: number
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [activeSongId, setActiveSongId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [queue, setQueue] = useState<PerfQueue | null>(null)
  const { songs } = useSongStore()

  const goToEditor = (id: string) => {
    setActiveSongId(id)
    setScreen('editor')
  }

  const playSong = (id: string) => {
    setQueue({ songIds: [id], index: 0 })
    setScreen('performance')
  }

  const playQueue = (songIds: string[]) => {
    if (songIds.length === 0) return
    setQueue({ songIds, index: 0 })
    setScreen('performance')
  }

  const currentSong = queue ? songs.find((s) => s.id === queue.songIds[queue.index]) ?? null : null

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {screen === 'home' && (
        <HomeScreen
          onEditSong={goToEditor}
          onPlaySong={playSong}
          onPlayQueue={playQueue}
          onSettings={() => setShowSettings(true)}
        />
      )}

      {screen === 'editor' && activeSongId && (
        <EditorView
          songId={activeSongId}
          onBack={() => setScreen('home')}
          onPerformance={() => playSong(activeSongId)}
          onSettings={() => setShowSettings(true)}
        />
      )}

      {screen === 'performance' && currentSong && queue && (
        <PerformanceView
          song={currentSong}
          queuePosition={queue.songIds.length > 1 ? { index: queue.index, total: queue.songIds.length } : null}
          hasNextSong={queue.index < queue.songIds.length - 1}
          hasPrevSong={queue.index > 0}
          onNextSong={() => setQueue((q) => (q ? { ...q, index: Math.min(q.index + 1, q.songIds.length - 1) } : q))}
          onPrevSong={() => setQueue((q) => (q ? { ...q, index: Math.max(q.index - 1, 0) } : q))}
          onExit={() => setScreen(activeSongId ? 'editor' : 'home')}
          onSettings={() => setShowSettings(true)}
        />
      )}

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  )
}
