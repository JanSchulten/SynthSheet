import { useState } from 'react'
import { KEYS } from '../../types'
import { Modal } from '../shared/Modal'

interface TransposeModalProps {
  currentKey: string
  onTranspose: (toKey: string) => void
  onClose: () => void
}

export function TransposeModal({ currentKey, onTranspose, onClose }: TransposeModalProps) {
  const [targetKey, setTargetKey] = useState(currentKey)
  const [minor, setMinor] = useState(currentKey.endsWith('m'))

  const baseKey = currentKey.replace('m', '')
  const fullTargetKey = minor ? targetKey.replace('m', '') + 'm' : targetKey.replace('m', '')

  return (
    <Modal title="Transpose Song" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <p className="text-text-secondary text-sm mb-2">
            Current key: <span className="text-white font-semibold">{currentKey}</span>
          </p>
          <p className="text-text-secondary text-xs">
            All chord names will be transposed across all sections and bars.
          </p>
        </div>

        <div>
          <label className="text-text-secondary text-xs mb-2 block">Target Key</label>
          <div className="grid grid-cols-6 gap-1.5">
            {KEYS.map((k) => (
              <button
                key={k}
                onClick={() => setTargetKey(k)}
                className={`min-h-[40px] rounded-lg text-sm font-medium transition-colors ${
                  targetKey.replace('m', '') === k
                    ? 'bg-accent text-bg'
                    : 'bg-border text-white hover:bg-[#3a3a3a]'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMinor(!minor)}
            className={`min-h-[36px] px-4 rounded-lg text-sm font-medium transition-colors ${
              minor ? 'bg-accent text-bg' : 'bg-border text-white hover:bg-[#3a3a3a]'
            }`}
          >
            Minor
          </button>
          <span className="text-text-secondary text-sm">
            → <span className="text-white font-semibold">{fullTargetKey}</span>
          </span>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => { onTranspose(fullTargetKey); onClose() }}
            className="flex-1 min-h-[44px] bg-accent text-bg font-semibold rounded-lg hover:opacity-90 transition-opacity"
            disabled={fullTargetKey === baseKey + (minor ? 'm' : '')}
          >
            Transpose
          </button>
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 bg-border text-white rounded-lg hover:bg-[#3a3a3a] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}
