import { useState } from 'react'
import { Bar, Patch, Slot } from '../../types'
import { SlotEditor } from './SlotEditor'

interface BarGridProps {
  bars: Bar[]
  patches: Patch[]
  songId: string
  sectionId: string
  onUpdateSlot: (barId: string, slotIdx: number, updates: Partial<Slot>) => void
  onClearSlot: (barId: string, slotIdx: number) => void
  onAddBar: () => void
  onRemoveBar: (barId: string) => void
  barOffset: number
}

interface ActiveSlot {
  barId: string
  slotIdx: number
  position: { top: number; left: number }
}

export function BarGrid({
  bars,
  patches,
  onUpdateSlot,
  onClearSlot,
  onAddBar,
  onRemoveBar,
  barOffset,
}: BarGridProps) {
  const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>(null)

  const activeSlotData = activeSlot
    ? bars.find((b) => b.id === activeSlot.barId)?.slots[activeSlot.slotIdx]
    : null

  return (
    <div className="relative">
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {bars.map((bar, barIdx) => {
          const globalBarNum = barOffset + barIdx + 1
          const patch = bar.slots[0]?.patchId ? patches.find((p) => p.id === bar.slots[0].patchId) : null
          return (
            <div key={bar.id} className="bg-bg border border-border rounded-lg overflow-hidden relative group">
              <div className="flex items-center justify-between px-2 py-1 bg-surface">
                <span className="text-text-secondary text-xs">{globalBarNum}</span>
                <button
                  onClick={() => onRemoveBar(bar.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-red-400 text-xs transition-opacity min-h-[24px] min-w-[24px] flex items-center justify-center"
                  title="Remove bar"
                >
                  ✕
                </button>
              </div>
              <div
                className="flex"
                style={{ borderLeft: patch ? `3px solid ${patch.color}` : '3px solid transparent' }}
              >
                {bar.slots.map((slot, slotIdx) => {
                  const slotPatch = slot.patchId ? patches.find((p) => p.id === slot.patchId) : null
                  return (
                    <button
                      key={slotIdx}
                      onClick={(e) => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect()
                        setActiveSlot({
                          barId: bar.id,
                          slotIdx,
                          position: { top: rect.bottom + 4, left: rect.left + rect.width / 2 },
                        })
                      }}
                      className="flex-1 min-h-[52px] flex flex-col items-center justify-center px-1 py-1 hover:bg-border/50 transition-colors border-r border-border last:border-r-0 relative"
                    >
                      {slotPatch && (
                        <div
                          className="absolute top-1 right-1 w-2 h-2 rounded-full"
                          style={{ backgroundColor: slotPatch.color }}
                        />
                      )}
                      <span className={`text-sm font-semibold leading-tight text-center ${slot.chord ? 'text-white' : 'text-border'}`}>
                        {slot.chord || '·'}
                      </span>
                      {slot.annotation && (
                        <span className="text-text-secondary text-xs leading-none mt-0.5">{slot.annotation}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add bar button */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={onAddBar}
          className="min-h-[36px] px-3 bg-border text-text-secondary rounded-lg hover:bg-[#3a3a3a] hover:text-white transition-colors text-sm"
        >
          + Bar
        </button>
      </div>

      {/* Slot editor popover */}
      {activeSlot && activeSlotData && (
        <SlotEditor
          slot={activeSlotData}
          patches={patches}
          position={activeSlot.position}
          onUpdate={(updates) => onUpdateSlot(activeSlot.barId, activeSlot.slotIdx, updates)}
          onClear={() => onClearSlot(activeSlot.barId, activeSlot.slotIdx)}
          onClose={() => setActiveSlot(null)}
        />
      )}
    </div>
  )
}
