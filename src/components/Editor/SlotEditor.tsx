import { useState, useEffect, useRef } from 'react'
import { Slot, Patch } from '../../types'
import { PATCH_SUGGESTIONS } from '../../data/patchSuggestions'

interface SlotEditorProps {
  slot: Slot
  patches: Patch[]
  position: { top: number; left: number }
  onUpdate: (updates: Partial<Slot>) => void
  onClear: () => void
  onClose: () => void
}

const inputClass =
  'w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-text-secondary focus:outline-none focus:border-accent text-base'

function parseMidi(v: string): number | undefined {
  if (v === '') return undefined
  const n = parseInt(v, 10)
  return !isNaN(n) && n >= 0 && n <= 127 ? n : undefined
}

export function SlotEditor({ slot, patches, position, onUpdate, onClear, onClose }: SlotEditorProps) {
  const [chord, setChord] = useState(slot.chord)
  const [annotation, setAnnotation] = useState(slot.annotation ?? '')
  const [midiPC, setMidiPC] = useState(slot.midiPC !== undefined ? String(slot.midiPC) : '')
  const [bankMSB, setBankMSB] = useState(slot.midiBankMSB !== undefined ? String(slot.midiBankMSB) : '')
  const [bankLSB, setBankLSB] = useState(slot.midiBankLSB !== undefined ? String(slot.midiBankLSB) : '')
  const [patchQuery, setPatchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showMidi, setShowMidi] = useState(
    slot.midiPC !== undefined || slot.midiBankMSB !== undefined || slot.midiBankLSB !== undefined
  )
  const ref = useRef<HTMLDivElement>(null)
  const chordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    chordRef.current?.focus()
    chordRef.current?.select()
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleSave = () => {
    onUpdate({
      chord: chord.trim(),
      annotation: annotation.trim() || undefined,
      midiPC: parseMidi(midiPC),
      midiBankMSB: parseMidi(bankMSB),
      midiBankLSB: parseMidi(bankLSB),
    })
    onClose()
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'BUTTON') handleSave()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const selectedPatch = patches.find((p) => p.id === slot.patchId)

  const style: React.CSSProperties = {
    position: 'fixed',
    top: Math.min(position.top, window.innerHeight - 420),
    left: Math.min(Math.max(position.left - 160, 8), window.innerWidth - 328),
    zIndex: 100,
  }

  return (
    <div ref={ref} style={style} className="glass-strong rounded-3xl w-80 p-4 space-y-3 animate-glass-in">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-sm font-medium">Slot bearbeiten</span>
        <button onClick={onClose} className="glass-button text-text-secondary hover:text-white min-h-[32px] min-w-[32px] flex items-center justify-center rounded-full">✕</button>
      </div>

      <div>
        <label className="text-text-secondary text-xs mb-1 block">Akkord / Label</label>
        <input ref={chordRef} value={chord} onChange={(e) => setChord(e.target.value)} placeholder="z.B. Cm7, Lead, —" className={inputClass} />
      </div>

      {/* Patch selector */}
      <div>
        <label className="text-text-secondary text-xs mb-1 block">Patch</label>
        {selectedPatch && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-md shrink-0" style={{ backgroundColor: selectedPatch.color }} />
            <span className="text-white text-sm">{selectedPatch.name}</span>
            <button onClick={() => onUpdate({ patchId: undefined })} className="ml-auto text-text-secondary hover:text-white text-xs">entfernen</button>
          </div>
        )}
        <div className="relative">
          <input
            value={patchQuery}
            onChange={(e) => { setPatchQuery(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Patches suchen…"
            className={inputClass.replace('text-base', 'text-sm')}
          />
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 glass-strong rounded-xl overflow-auto max-h-36 z-10">
              {patches.filter((p) => p.name.toLowerCase().includes(patchQuery.toLowerCase())).map((p) => (
                <button key={p.id}
                  onMouseDown={(e) => { e.preventDefault(); onUpdate({ patchId: p.id }); setPatchQuery(''); setShowSuggestions(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-left">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-white text-sm">{p.name}</span>
                </button>
              ))}
              {PATCH_SUGGESTIONS.filter((s) => s.toLowerCase().includes(patchQuery.toLowerCase()) && !patches.find((p) => p.name === s)).slice(0, 8).map((s) => (
                <button key={s}
                  onMouseDown={(e) => { e.preventDefault(); setPatchQuery(s); setShowSuggestions(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-left">
                  <div className="w-3 h-3 rounded-sm shrink-0 bg-white/20" />
                  <span className="text-text-secondary text-sm">{s}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="text-text-secondary text-xs mb-1 block">Annotation</label>
        <input value={annotation} onChange={(e) => setAnnotation(e.target.value)} placeholder="Kleine Notiz…" className={inputClass.replace('text-base', 'text-sm')} />
      </div>

      {/* MIDI section (collapsible) */}
      <div>
        <button onClick={() => setShowMidi(!showMidi)} className="text-text-secondary hover:text-white text-xs flex items-center gap-1">
          {showMidi ? '▾' : '▸'} MIDI Patch-Umschaltung
        </button>
        {showMidi && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div>
              <label className="text-text-secondary text-[10px] mb-1 block">Program</label>
              <input type="number" min={0} max={127} value={midiPC} onChange={(e) => setMidiPC(e.target.value)} placeholder="0–127" className={inputClass.replace('text-base', 'text-sm')} />
            </div>
            <div>
              <label className="text-text-secondary text-[10px] mb-1 block">Bank MSB</label>
              <input type="number" min={0} max={127} value={bankMSB} onChange={(e) => setBankMSB(e.target.value)} placeholder="CC0" className={inputClass.replace('text-base', 'text-sm')} />
            </div>
            <div>
              <label className="text-text-secondary text-[10px] mb-1 block">Bank LSB</label>
              <input type="number" min={0} max={127} value={bankLSB} onChange={(e) => setBankLSB(e.target.value)} placeholder="CC32" className={inputClass.replace('text-base', 'text-sm')} />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} className="flex-1 min-h-[44px] glass-accent rounded-xl font-semibold">Speichern</button>
        <button onClick={() => { onClear(); onClose() }} className="min-h-[44px] px-4 glass-button text-red-300 rounded-xl text-sm">Leeren</button>
      </div>
    </div>
  )
}
