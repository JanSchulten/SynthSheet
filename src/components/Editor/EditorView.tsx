import { useRef, useState } from 'react'
import { useSongStore } from '../../store/songStore'
import { KEYS, TIME_SIGNATURES, TimeSignature } from '../../types'
import { SheetEditor } from './SheetEditor'
import { SectionPanel } from './SectionPanel'
import { PatchLibrary } from './PatchLibrary'
import { TransposeModal } from './TransposeModal'

interface EditorViewProps {
  songId: string
  onBack: () => void
  onPerformance: () => void
  onSettings: () => void
}

export function EditorView({ songId, onBack, onPerformance, onSettings }: EditorViewProps) {
  const {
    songs,
    updateSong,
    addSection,
    updateSection,
    deleteSection,
    moveSectionUp,
    moveSectionDown,
    addBar,
    removeBar,
    updateSlot,
    clearSlot,
    addPatch,
    updatePatch,
    deletePatch,
    transposeSong,
  } = useSongStore()

  const song = songs.find((s) => s.id === songId)
  const [showTranspose, setShowTranspose] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  if (!song) return null

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-surface border-b border-border shrink-0">
        <button
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-secondary hover:text-white rounded-lg hover:bg-border transition-colors"
        >
          ←
        </button>

        {/* Title */}
        <input
          value={song.title}
          onChange={(e) => updateSong(songId, { title: e.target.value })}
          className="bg-transparent text-white font-semibold text-base focus:outline-none focus:border-b focus:border-accent flex-1 min-w-[120px]"
        />

        {/* BPM */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={song.bpm}
            onChange={(e) => updateSong(songId, { bpm: Number(e.target.value) })}
            className="bg-bg border border-border rounded-lg px-2 py-1 text-white w-16 text-sm focus:outline-none focus:border-accent text-center"
            min={20}
            max={300}
          />
          <span className="text-text-secondary text-xs">BPM</span>
        </div>

        {/* Time signature */}
        <select
          value={song.timeSignature.join('/')}
          onChange={(e) => {
            const parts = e.target.value.split('/').map(Number)
            updateSong(songId, { timeSignature: parts as TimeSignature })
          }}
          className="bg-bg border border-border rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-accent min-h-[36px]"
        >
          {TIME_SIGNATURES.map((ts) => (
            <option key={ts.join('/')} value={ts.join('/')}>{ts.join('/')}</option>
          ))}
        </select>

        {/* Key */}
        <select
          value={song.key.replace('m', '')}
          onChange={(e) => updateSong(songId, { key: e.target.value + (song.key.endsWith('m') ? 'm' : '') })}
          className="bg-bg border border-border rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-accent min-h-[36px]"
        >
          {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <button
          onClick={() => updateSong(songId, { key: song.key.endsWith('m') ? song.key.slice(0, -1) : song.key + 'm' })}
          className={`min-h-[36px] px-2 rounded-lg text-xs transition-colors border ${
            song.key.endsWith('m') ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-secondary hover:border-white hover:text-white'
          }`}
        >
          m
        </button>

        {/* Actions */}
        <button
          onClick={() => setShowTranspose(true)}
          className="min-h-[36px] px-3 bg-border text-white rounded-lg hover:bg-[#3a3a3a] transition-colors text-sm"
        >
          Transpose
        </button>

        <button
          onClick={onSettings}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-secondary hover:text-white rounded-lg hover:bg-border transition-colors"
        >
          ⚙
        </button>

        <button
          onClick={onPerformance}
          className="min-h-[44px] px-4 bg-accent text-bg font-bold rounded-lg hover:opacity-90 transition-opacity text-sm"
        >
          ▶ Perform
        </button>
      </div>

      {/* Section panel */}
      <SectionPanel
        sections={song.sections}
        onAdd={() => addSection(songId)}
        onUpdate={(id, updates) => updateSection(songId, id, updates)}
        onDelete={(id) => deleteSection(songId, id)}
        onMoveUp={(id) => moveSectionUp(songId, id)}
        onMoveDown={(id) => moveSectionDown(songId, id)}
        onScrollTo={scrollToSection}
      />

      {/* Sheet editor */}
      <SheetEditor
        song={song}
        onUpdateSlot={(sId, bId, sIdx, u) => updateSlot(songId, sId, bId, sIdx, u)}
        onClearSlot={(sId, bId, sIdx) => clearSlot(songId, sId, bId, sIdx)}
        onAddBar={(sId) => addBar(songId, sId)}
        onRemoveBar={(sId, bId) => removeBar(songId, sId, bId)}
        sectionRefs={sectionRefs}
      />

      {/* Patch library */}
      <PatchLibrary
        patches={song.patches}
        onAdd={(p) => addPatch(songId, p)}
        onUpdate={(id, u) => updatePatch(songId, id, u)}
        onDelete={(id) => deletePatch(songId, id)}
      />

      {showTranspose && (
        <TransposeModal
          currentKey={song.key}
          onTranspose={(toKey) => transposeSong(songId, toKey)}
          onClose={() => setShowTranspose(false)}
        />
      )}
    </div>
  )
}
