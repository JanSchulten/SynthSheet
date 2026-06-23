import { Song, Slot } from '../../types'
import { BarGrid } from './BarGrid'

interface SheetEditorProps {
  song: Song
  onUpdateSlot: (sectionId: string, barId: string, slotIdx: number, updates: Partial<Slot>) => void
  onClearSlot: (sectionId: string, barId: string, slotIdx: number) => void
  onAddBar: (sectionId: string) => void
  onRemoveBar: (sectionId: string, barId: string) => void
  sectionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
}

export function SheetEditor({ song, onUpdateSlot, onClearSlot, onAddBar, onRemoveBar, sectionRefs }: SheetEditorProps) {
  // Compute bar offset per section
  let barOffset = 0
  const sectionOffsets: number[] = []
  for (const sec of song.sections) {
    sectionOffsets.push(barOffset)
    barOffset += sec.bars.length
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {song.sections.map((section, sIdx) => (
        <div
          key={section.id}
          ref={(el) => { sectionRefs.current[section.id] = el }}
        >
          {/* Section header */}
          <div
            className="flex items-center gap-3 mb-3 pb-2 border-b"
            style={{ borderColor: section.color ?? '#2a2a2a' }}
          >
            <div
              className="w-3 h-6 rounded-sm shrink-0"
              style={{ backgroundColor: section.color ?? '#2a2a2a' }}
            />
            <h3 className="text-white font-semibold text-base">{section.name}</h3>
            <span className="text-text-secondary text-sm ml-auto">
              {section.bars.length} bar{section.bars.length !== 1 ? 's' : ''}
            </span>
          </div>

          <BarGrid
            bars={section.bars}
            patches={song.patches}
            songId={song.id}
            sectionId={section.id}
            onUpdateSlot={(barId, slotIdx, updates) => onUpdateSlot(section.id, barId, slotIdx, updates)}
            onClearSlot={(barId, slotIdx) => onClearSlot(section.id, barId, slotIdx)}
            onAddBar={() => onAddBar(section.id)}
            onRemoveBar={(barId) => onRemoveBar(section.id, barId)}
            barOffset={sectionOffsets[sIdx]}
          />
        </div>
      ))}

      {song.sections.length === 0 && (
        <div className="text-center text-text-secondary py-16">
          <p>No sections yet. Add a section to get started.</p>
        </div>
      )}
    </div>
  )
}
