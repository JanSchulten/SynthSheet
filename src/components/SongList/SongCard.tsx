import { Song } from '../../types'

interface SongCardProps {
  song: Song
  onPlay: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onShare: () => void
  confirmingDelete: boolean
}

export function SongCard({ song, onPlay, onEdit, onDuplicate, onDelete, onShare, confirmingDelete }: SongCardProps) {
  return (
    <div className="glass rounded-3xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <button onClick={onEdit} className="min-w-0 text-left flex-1">
          <h3 className="text-white font-semibold text-lg truncate tracking-tight">{song.title}</h3>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-text-secondary text-sm">
            <span className="text-accent">{song.key}</span>
            <span>{song.bpm} BPM</span>
            <span>{song.timeSignature.join('/')}</span>
            <span>{song.sections.length} {song.sections.length === 1 ? 'Section' : 'Sections'}</span>
          </div>
        </button>
        <button
          onClick={onPlay}
          className="glass-accent shrink-0 min-h-[52px] min-w-[52px] flex items-center justify-center rounded-2xl text-xl font-bold"
          title="Performance Mode"
        >
          ▶
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="flex-1 min-h-[44px] glass-button text-white font-medium rounded-xl"
        >
          Bearbeiten
        </button>
        <button
          onClick={onShare}
          className="min-h-[44px] px-4 glass-button text-white rounded-xl"
          title="Teilen / Export"
        >
          ↗
        </button>
        <button
          onClick={onDuplicate}
          className="min-h-[44px] px-4 glass-button text-white rounded-xl"
          title="Duplizieren"
        >
          ⎘
        </button>
        <button
          onClick={onDelete}
          className={`min-h-[44px] px-4 rounded-xl transition-colors ${
            confirmingDelete ? 'bg-red-500/80 text-white' : 'glass-button text-red-300'
          }`}
          title="Löschen"
        >
          {confirmingDelete ? 'Sicher?' : '✕'}
        </button>
      </div>
    </div>
  )
}
