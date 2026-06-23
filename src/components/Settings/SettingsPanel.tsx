import { useEffect, useRef, useState } from 'react'
import { Modal } from '../shared/Modal'
import { useSettingsStore } from '../../store/settingsStore'
import { useSongStore } from '../../store/songStore'
import { useMidi } from '../../hooks/useMidi'
import { FontSize, MidiBinding } from '../../types'
import { importSongsFromJSON } from '../../utils/exportImport'
import { shareAllSongs } from '../../utils/share'
import { sendProgramChange } from '../../utils/midiUtils'

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
  { value: 'xl', label: 'XL' },
]

function bindingLabel(b: MidiBinding | null): string {
  if (!b) return 'aus'
  return b.type === 'cc' ? `CC ${b.number}` : `Note ${b.number}`
}

const fieldClass = 'w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent min-h-[44px]'

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const {
    fontSize, setFontSize, midiOutputId, setMidiOutputId, midiInputId, setMidiInputId,
    navNext, setNavNext, navPrev, setNavPrev, midiClockEnabled, setMidiClockEnabled,
  } = useSettingsStore()
  const { songs, importSongs, clearAll } = useSongStore()
  const { supported: midiSupported, outputs, inputs } = useMidi()
  const [clearConfirm, setClearConfirm] = useState(false)
  const [learning, setLearning] = useState<'next' | 'prev' | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  // MIDI Learn: capture next incoming CC / Note while in learn mode
  useEffect(() => {
    if (!learning) return
    const input = inputs.find((i) => i.id === midiInputId)
    if (!input) return
    const onMsg = (ev: Event) => {
      const data = (ev as MIDIMessageEvent).data
      if (!data || data.length < 2) return
      const type = data[0] & 0xf0
      let binding: MidiBinding | null = null
      if (type === 0xb0 && (data[2] ?? 0) > 0) binding = { type: 'cc', number: data[1] }
      else if (type === 0x90 && (data[2] ?? 0) > 0) binding = { type: 'note', number: data[1] }
      if (binding) {
        if (learning === 'next') setNavNext(binding)
        else setNavPrev(binding)
        setLearning(null)
      }
    }
    input.addEventListener('midimessage', onMsg)
    return () => input.removeEventListener('midimessage', onMsg)
  }, [learning, inputs, midiInputId, setNavNext, setNavPrev])

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importSongsFromJSON(file)
      importSongs(imported)
      alert(`${imported.length} Song(s) importiert`)
    } catch {
      alert('Import fehlgeschlagen: ungültige JSON-Datei')
    }
    e.target.value = ''
  }

  const handleClear = () => {
    if (clearConfirm) { clearAll(); setClearConfirm(false); onClose() }
    else { setClearConfirm(true); setTimeout(() => setClearConfirm(false), 3000) }
  }

  const testMidi = () => {
    const out = outputs.find((o) => o.id === midiOutputId)
    if (out) sendProgramChange(out, 0, 0)
  }

  return (
    <Modal title="Einstellungen" onClose={onClose}>
      <div className="space-y-6">
        {/* Font size */}
        <section>
          <h3 className="text-text-secondary text-sm font-medium mb-2">Schriftgröße (Performance)</h3>
          <div className="glass rounded-2xl p-1 grid grid-cols-4 gap-1">
            {FONT_SIZES.map(({ value, label }) => (
              <button key={value} onClick={() => setFontSize(value)}
                className={`min-h-[40px] rounded-xl text-sm font-semibold transition-all ${fontSize === value ? 'glass-accent' : 'text-text-secondary hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* MIDI */}
        <section>
          <h3 className="text-text-secondary text-sm font-medium mb-2">MIDI</h3>
          {midiSupported ? (
            <div className="space-y-3">
              <div>
                <label className="text-text-secondary text-xs mb-1 block">Ausgang (Patch-Umschaltung)</label>
                <div className="flex gap-2">
                  <select value={midiOutputId ?? ''} onChange={(e) => setMidiOutputId(e.target.value || null)} className={fieldClass}>
                    <option value="">— kein Ausgang —</option>
                    {outputs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                  <button onClick={testMidi} disabled={!midiOutputId} className="glass-button text-white rounded-xl px-3 min-h-[44px] text-sm shrink-0 disabled:opacity-40">Test</button>
                </div>
              </div>

              <div>
                <label className="text-text-secondary text-xs mb-1 block">Eingang (Fußpedal / Controller)</label>
                <select value={midiInputId ?? ''} onChange={(e) => setMidiInputId(e.target.value || null)} className={fieldClass}>
                  <option value="">— kein Eingang —</option>
                  {inputs.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>

              {/* Hands-free bindings */}
              <div className="grid grid-cols-2 gap-2">
                {(['next', 'prev'] as const).map((which) => (
                  <div key={which}>
                    <label className="text-text-secondary text-xs mb-1 block">{which === 'next' ? 'Nächste Section' : 'Vorherige'}</label>
                    <button
                      onClick={() => setLearning(learning === which ? null : which)}
                      disabled={!midiInputId}
                      className={`w-full min-h-[44px] rounded-xl text-sm transition-all disabled:opacity-40 ${learning === which ? 'glass-accent animate-pulse' : 'glass-button text-white'}`}
                    >
                      {learning === which ? 'warte auf MIDI…' : bindingLabel(which === 'next' ? navNext : navPrev)}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-text-secondary text-[11px]">Tippe „Learn", dann betätige Pedal/Taste. Erneut tippen zum Abbrechen.</p>

              {/* MIDI Clock */}
              <label className="flex items-center justify-between glass rounded-xl px-3 py-2.5 cursor-pointer">
                <span className="text-white text-sm">MIDI Clock senden (Arp/Sequencer-Sync)</span>
                <input type="checkbox" checked={midiClockEnabled} onChange={(e) => setMidiClockEnabled(e.target.checked)} className="w-5 h-5 accent-[#00d4ff]" />
              </label>
            </div>
          ) : (
            <p className="text-text-secondary text-sm glass rounded-xl px-3 py-2">
              MIDI wird auf diesem Gerät nicht unterstützt. Nutze Chrome oder Edge am Desktop. Die App funktioniert ohne MIDI vollständig.
            </p>
          )}
        </section>

        {/* Data */}
        <section>
          <h3 className="text-text-secondary text-sm font-medium mb-2">Daten</h3>
          <div className="space-y-2">
            <button onClick={() => shareAllSongs(songs)} disabled={songs.length === 0}
              className="w-full min-h-[44px] glass-button text-white rounded-xl text-sm disabled:opacity-40">↗ Alle Songs teilen / exportieren</button>
            <button onClick={() => importRef.current?.click()} className="w-full min-h-[44px] glass-button text-white rounded-xl text-sm">Songs importieren (JSON)</button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <button onClick={handleClear}
              className={`w-full min-h-[44px] rounded-xl text-sm transition-colors ${clearConfirm ? 'bg-red-500/80 text-white animate-pulse' : 'glass-button text-red-300'}`}>
              {clearConfirm ? 'Nochmal tippen — ALLE DATEN GEHEN VERLOREN' : 'Alle Daten löschen'}
            </button>
          </div>
        </section>

        <div className="text-text-secondary text-xs space-y-1 pt-2 border-t border-white/10">
          <p>Synth Sheet Live v0.2.0</p>
          <p>Alle Daten werden lokal auf diesem Gerät gespeichert.</p>
        </div>
      </div>
    </Modal>
  )
}
