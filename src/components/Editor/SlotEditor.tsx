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

export function SlotEditor({ slot, patches, position, onUpdate, onClear, onClose }: SlotEditorProps) {
  const [chord, setChord] = useState(slot.chord)
  const [annotation, setAnnotation] = useState(slot.annotation ?? '')
  const [midiPC, setMidiPC] = useState(slot.midiPC !== undefined ? String(slot.midiPC) : '')
  const [patchQuery, setPatchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter') handleSave()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const handleSave = () => {
    const pc = midiPC !== '' ? parseInt(midiPC, 10) : undefined
    onUpdate({
      chord: chord.trim(),
      annotation: annotation.trim() || undefined,
      midiPC: pc !== undefined && !isNaN(pc) && pc >= 0 && pc <= 127 ? pc : undefined,
    })
    onClose()
  }

  const allSuggestions = [
    ...patches.map((p) => p.name),
    ...PATCH_SUGGESTIONS.filter((s) => !patches.find((p) => p.name === s)),
  ].filter((s) => s.toLowerCase().includes(patchQuery.toLowerCase()))

  const selectedPatch = patches.find((p) => p.id === slot.patchId)

  const style: React.CSSProperties = {
    position: 'fixed',
    top: Math.min(position.top, window.innerHeight - 360),
    left: Math.min(Math.max(position.left - 160, 8), window.innerWidth - 328),
    zIndex: 100,
  }

  return (
    <div
      ref={ref}
      style={style}
      className="bg-surface border border-border rounded-xl shadow-2xl w-80 p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-sm font-medium">Edit Slot</span>
        <button onClick={onClose} className="text-text-secondary hover:text-white min-h-[32px] min-w-[32px] flex items-center justify-center">✕</button>
      </div>

      {/* Chord input */}
      <div>
        <label className="text-text-secondary text-xs mb-1 block">Chord / Label</label>
        <input
          ref={chordRef}
          value={chord}
          onChange={(e) => setChord(e.target.value)}
          placeholder="e.g. Cm7, Lead, —"
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-white placeholder-text-secondary focus:outline-none focus:border-accent text-base"
        />
      </div>

      {/* Patch selector */}
      <div>
        <label className="text-text-secondary text-xs mb-1 block">Patch</label>
        {selectedPatch && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: selectedPatch.color }} />
            <span className="text-white text-sm">{selectedPatch.name}</span>
            <button
              onClick={() => onUpdate({ patchId: undefined })}
              className="ml-auto text-text-secondary hover:text-white text-xs"
            >
              clear
            </button>
          </div>
        )}
        <div className="relative">
          <input
            value={patchQuery}
            onChange={(e) => { setPatchQuery(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search patches..."
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-white placeholder-text-secondary focus:outline-none focus:border-accent text-sm"
          />
          {showSuggestions && allSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg overflow-auto max-h-36 z-10">
              {patches.filter((p) => p.name.toLowerCase().includes(patchQuery.toLowerCase())).map((p) => (
                <button
                  key={p.id}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onUpdate({ patchId: p.id })
                    setPatchQuery('')
                    setShowSuggestions(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-border text-left"
                >
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-white text-sm">{p.name}</span>
                </button>
              ))}
              {PATCH_SUGGESTIONS.filter((s) =>
                s.toLowerCase().includes(patchQuery.toLowerCase()) && !patches.find((p) => p.name === s)
              ).slice(0, 8).map((s) => (
                <button
                  key={s}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setPatchQuery(s)
                    setShowSuggestions(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-border text-left"
                >
                  <div className="w-3 h-3 rounded-sm shrink-0 bg-border" />
                  <span className="text-text-secondary text-sm">{s}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Annotation */}
      <div>
        <label className="text-text-secondary text-xs mb-1 block">Annotation</label>
        <input
          value={annotation}
          onChange={(e) => setAnnotation(e.target.value)}
          placeholder="Small note..."
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-white placeholder-text-secondary focus:outline-none focus:border-accent text-sm"
        />
      </div>

      {/* MIDI PC */}
      <div>
        <label className="text-text-secondary text-xs mb-1 block">MIDI Program Change (0–127)</label>
        <input
          type="number"
          min={0}
          max={127}
          value={midiPC}
          onChange={(e) => setMidiPC(e.target.value)}
          placeholder="optional"
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-white placeholder-text-secondary focus:outline-none focus:border-accent text-sm"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          className="flex-1 min-h-[44px] bg-accent text-bg font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Save
        </button>
        <button
          onClick={() => { onClear(); onClose() }}
          className="min-h-[44px] px-4 bg-border text-text-secondary rounded-lg hover:bg-red-900/30 hover:text-red-400 transition-colors text-sm"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
