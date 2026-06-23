import { useState } from 'react'
import { Patch } from '../../types'

const PATCH_COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#d97706',
  '#dc2626', '#db2777', '#0891b2', '#65a30d',
  '#00d4ff', '#f59e0b', '#8b5cf6', '#10b981',
]

interface PatchLibraryProps {
  patches: Patch[]
  onAdd: (patch: Omit<Patch, 'id'>) => void
  onUpdate: (id: string, updates: Partial<Patch>) => void
  onDelete: (id: string) => void
}

export function PatchLibrary({ patches, onAdd, onUpdate, onDelete }: PatchLibraryProps) {
  const [expanded, setExpanded] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PATCH_COLORS[0])
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleAdd = () => {
    if (!newName.trim()) return
    onAdd({ name: newName.trim(), color: newColor })
    setNewName('')
    setNewColor(PATCH_COLORS[Math.floor(Math.random() * PATCH_COLORS.length)])
  }

  return (
    <div className="bg-surface border-t border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-border/30 transition-colors"
      >
        <span className="text-white font-medium text-sm">Patches ({patches.length})</span>
        <span className="text-text-secondary text-sm">{expanded ? '▼' : '▲'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Patch list */}
          <div className="flex flex-wrap gap-2">
            {patches.map((patch) => (
              <div
                key={patch.id}
                className="flex items-center gap-2 bg-bg border border-border rounded-lg px-2 py-1.5 group"
              >
                <div className="relative">
                  <div
                    className="w-4 h-4 rounded-sm shrink-0"
                    style={{ backgroundColor: patch.color }}
                  />
                  <select
                    value={patch.color}
                    onChange={(e) => onUpdate(patch.id, { color: e.target.value })}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  >
                    {PATCH_COLORS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {editId === patch.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => {
                      if (editName.trim()) onUpdate(patch.id, { name: editName.trim() })
                      setEditId(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editName.trim()) onUpdate(patch.id, { name: editName.trim() })
                        setEditId(null)
                      }
                    }}
                    className="bg-transparent text-white text-sm w-24 focus:outline-none border-b border-accent"
                  />
                ) : (
                  <span
                    className="text-white text-sm cursor-pointer"
                    onClick={() => { setEditId(patch.id); setEditName(patch.name) }}
                  >
                    {patch.name}
                  </span>
                )}

                <button
                  onClick={() => onDelete(patch.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-red-400 text-xs transition-opacity ml-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add new patch */}
          <div className="flex gap-2 items-center">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-lg border border-border cursor-pointer" style={{ backgroundColor: newColor }} />
              <select
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              >
                {PATCH_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="New patch name..."
              className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-white placeholder-text-secondary focus:outline-none focus:border-accent text-sm min-h-[36px]"
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="min-h-[36px] px-3 bg-accent text-bg font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 text-sm"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
