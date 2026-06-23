import { useState } from 'react'
import { SongList } from './components/SongList/SongList'
import { EditorView } from './components/Editor/EditorView'
import { PerformanceView } from './components/Performance/PerformanceView'
import { SettingsPanel } from './components/Settings/SettingsPanel'
import { useSongStore } from './store/songStore'
import { useSettingsStore } from './store/settingsStore'
import { useMidi } from './hooks/useMidi'

type Screen = 'list' | 'editor' | 'performance'

export default function App() {
  const [screen, setScreen] = useState<Screen>('list')
  const [activeSongId, setActiveSongId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const { songs } = useSongStore()
  const { midiOutputId } = useSettingsStore()
  const { outputs: midiOutputs } = useMidi()

  const activeSong = activeSongId ? songs.find((s) => s.id === activeSongId) ?? null : null

  const goToEditor = (id: string) => {
    setActiveSongId(id)
    setScreen('editor')
  }

  const goToPerformance = () => setScreen('performance')
  const goToList = () => setScreen('list')

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-bg">
      {screen === 'list' && (
        <SongList onEdit={goToEditor} onSettings={() => setShowSettings(true)} />
      )}

      {screen === 'editor' && activeSong && (
        <EditorView
          songId={activeSong.id}
          onBack={goToList}
          onPerformance={goToPerformance}
          onSettings={() => setShowSettings(true)}
        />
      )}

      {screen === 'performance' && activeSong && (
        <PerformanceView
          song={activeSong}
          onExit={() => setScreen('editor')}
          onSettings={() => setShowSettings(true)}
          midiOutputId={midiOutputId}
          midiOutputs={midiOutputs}
        />
      )}

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  )
}
