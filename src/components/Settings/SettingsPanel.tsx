import { useRef, useState } from 'react'
import { Modal } from '../shared/Modal'
import { useSettingsStore } from '../../store/settingsStore'
import { useSongStore } from '../../store/songStore'
import { useMidi } from '../../hooks/useMidi'
import { FontSize } from '../../types'
import { exportSongsAsJSON, importSongsFromJSON } from '../../utils/exportImport'

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'xl', label: 'XL' },
]

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { fontSize, setFontSize, midiOutputId, setMidiOutputId } = useSettingsStore()
  const { songs, importSongs, clearAll } = useSongStore()
  const { supported: midiSupported, outputs: midiOutputs } = useMidi()
  const [clearConfirm, setClearConfirm] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importSongsFromJSON(file)
      importSongs(imported)
      alert(`Imported ${imported.length} song(s)`)
    } catch {
      alert('Failed to import: invalid JSON file')
    }
    e.target.value = ''
  }

  const handleClear = () => {
    if (clearConfirm) {
      clearAll()
      setClearConfirm(false)
      onClose()
    } else {
      setClearConfirm(true)
      setTimeout(() => setClearConfirm(false), 3000)
    }
  }

  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="space-y-6">
        {/* Font size */}
        <div>
          <h3 className="text-text-secondary text-sm font-medium mb-2">Performance Font Size</h3>
          <div className="grid grid-cols-4 gap-1.5">
            {FONT_SIZES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFontSize(value)}
                className={`min-h-[40px] rounded-lg text-sm font-medium transition-colors ${
                  fontSize === value
                    ? 'bg-accent text-bg'
                    : 'bg-border text-white hover:bg-[#3a3a3a]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* MIDI */}
        <div>
          <h3 className="text-text-secondary text-sm font-medium mb-2">MIDI Output</h3>
          {midiSupported ? (
            <select
              value={midiOutputId ?? ''}
              onChange={(e) => setMidiOutputId(e.target.value || null)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent min-h-[44px]"
            >
              <option value="">— No MIDI output —</option>
              {midiOutputs.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          ) : (
            <p className="text-text-secondary text-sm bg-bg rounded-lg px-3 py-2 border border-border">
              MIDI not supported on this device. Use Chrome or Edge on desktop for MIDI.
            </p>
          )}
        </div>

        {/* Data management */}
        <div>
          <h3 className="text-text-secondary text-sm font-medium mb-2">Data</h3>
          <div className="space-y-2">
            <button
              onClick={() => exportSongsAsJSON(songs)}
              disabled={songs.length === 0}
              className="w-full min-h-[44px] bg-border text-white rounded-lg hover:bg-[#3a3a3a] transition-colors text-sm disabled:opacity-40"
            >
              Export All Songs as JSON
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="w-full min-h-[44px] bg-border text-white rounded-lg hover:bg-[#3a3a3a] transition-colors text-sm"
            >
              Import Songs from JSON
            </button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <button
              onClick={handleClear}
              className={`w-full min-h-[44px] rounded-lg transition-colors text-sm ${
                clearConfirm
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-border text-red-400 hover:bg-red-900/30'
              }`}
            >
              {clearConfirm ? 'Tap again to confirm — ALL DATA WILL BE LOST' : 'Clear All Data'}
            </button>
          </div>
        </div>

        {/* App info */}
        <div className="text-text-secondary text-xs space-y-1 pt-2 border-t border-border">
          <p>Synth Sheet Live v0.1.0</p>
          <p>All data stored locally on this device.</p>
        </div>
      </div>
    </Modal>
  )
}
