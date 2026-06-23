import { Section, SECTION_COLORS } from '../../types'

interface SectionPanelProps {
  sections: Section[]
  onAdd: () => void
  onUpdate: (id: string, updates: Partial<Section>) => void
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onScrollTo: (id: string) => void
}

export function SectionPanel({
  sections,
  onAdd,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onScrollTo,
}: SectionPanelProps) {
  return (
    <div className="glass mx-2 rounded-2xl px-3 py-2.5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-text-secondary text-sm font-medium">Sections</span>
        <button
          onClick={onAdd}
          className="glass-button min-h-[32px] px-3 text-white rounded-lg text-xs ml-auto"
        >
          + Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            className="flex items-center gap-1 bg-black/30 border border-white/10 rounded-xl px-2 py-1.5 group"
          >
            {/* Color picker */}
            <div className="relative">
              <div
                className="w-4 h-4 rounded-sm cursor-pointer shrink-0"
                style={{ backgroundColor: sec.color ?? SECTION_COLORS[0] }}
                title="Pick color"
              />
              <select
                value={sec.color ?? SECTION_COLORS[0]}
                onChange={(e) => onUpdate(sec.id, { color: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              >
                {SECTION_COLORS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Name */}
            <input
              value={sec.name}
              onChange={(e) => onUpdate(sec.id, { name: e.target.value })}
              onClick={() => onScrollTo(sec.id)}
              className="bg-transparent text-white text-sm w-24 focus:outline-none focus:border-b focus:border-accent cursor-pointer"
            />

            {/* Controls */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onMoveUp(sec.id)}
                disabled={idx === 0}
                className="text-text-secondary hover:text-white disabled:opacity-30 text-xs min-w-[20px] min-h-[20px] flex items-center justify-center"
              >
                ↑
              </button>
              <button
                onClick={() => onMoveDown(sec.id)}
                disabled={idx === sections.length - 1}
                className="text-text-secondary hover:text-white disabled:opacity-30 text-xs min-w-[20px] min-h-[20px] flex items-center justify-center"
              >
                ↓
              </button>
              <button
                onClick={() => onDelete(sec.id)}
                className="text-text-secondary hover:text-red-400 text-xs min-w-[20px] min-h-[20px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
