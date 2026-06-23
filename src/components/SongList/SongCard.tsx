import { Song } from '../../types'

interface SongCardProps {
  song: Song
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export function SongCard({ song, onEdit, onDuplicate, onDelete }: SongCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-lg truncate">{song.title}</h3>
          <div className="flex gap-3 mt-1 text-text-secondary text-sm">
            <span>{song.key}</span>
            <span>{song.bpm} BPM</span>
            <span>{song.timeSignature.join('/')}</span>
            <span>{song.sections.length} sections</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="flex-1 min-h-[44px] bg-accent text-bg font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Edit
        </button>
        <button
          onClick={onDuplicate}
          className="min-h-[44px] px-4 bg-border text-white rounded-lg hover:bg-[#3a3a3a] transition-colors"
          title="Duplicate"
        >
          ⎘
        </button>
        <button
          onClick={onDelete}
          className="min-h-[44px] px-4 bg-border text-red-400 rounded-lg hover:bg-red-900/30 transition-colors"
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
