import { useEffect, useRef, useState } from 'react'
import { Song } from '../../types'
import { useWakeLock } from '../../hooks/useWakeLock'
import { useSwipe } from '../../hooks/useSwipe'
import { useSettingsStore } from '../../store/settingsStore'
import { sendProgramChange } from '../../utils/midiUtils'
import { FontSize } from '../../types'

const FONT_SIZES: FontSize[] = ['small', 'medium', 'large', 'xl']

const chordFontClass: Record<FontSize, string> = {
  small: 'text-2xl',
  medium: 'text-3xl',
  large: 'text-4xl',
  xl: 'text-5xl',
}

const sectionFontClass: Record<FontSize, string> = {
  small: 'text-2xl',
  medium: 'text-3xl',
  large: 'text-4xl',
  xl: 'text-5xl',
}

interface PerformanceViewProps {
  song: Song
  onExit: () => void
  onSettings: () => void
  midiOutputId: string | null
  midiOutputs: MIDIOutput[]
}

export function PerformanceView({ song, onExit, onSettings, midiOutputId, midiOutputs }: PerformanceViewProps) {
  const [sectionIdx, setSectionIdx] = useState(0)
  const { fontSize, setFontSize } = useSettingsStore()
  const containerRef = useRef<HTMLDivElement>(null)

  useWakeLock(true)

  const currentSection = song.sections[sectionIdx]

  const goNext = () => {
    setSectionIdx((i) => Math.min(i + 1, song.sections.length - 1))
  }

  const goPrev = () => {
    setSectionIdx((i) => Math.max(i - 1, 0))
  }

  // Send MIDI PC on section change
  useEffect(() => {
    if (!midiOutputId || !currentSection) return
    const output = midiOutputs.find((o) => o.id === midiOutputId)
    if (!output) return
    const firstSlot = currentSection.bars[0]?.slots[0]
    if (firstSlot?.midiPC !== undefined) {
      sendProgramChange(output, 0, firstSlot.midiPC)
    }
  }, [sectionIdx, midiOutputId, midiOutputs, currentSection])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') onExit()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useSwipe(containerRef, { onSwipeLeft: goNext, onSwipeRight: goPrev })

  const fontSizeIdx = FONT_SIZES.indexOf(fontSize)

  const handleTapZone = (e: React.MouseEvent) => {
    const x = e.clientX
    const w = window.innerWidth
    if (x < w * 0.2) goPrev()
    else if (x > w * 0.8) goNext()
  }

  if (!currentSection) {
    return (
      <div className="h-full flex items-center justify-center bg-bg text-white">
        No sections
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-bg text-white select-none"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        touchAction: 'pan-y',
      }}
      onClick={handleTapZone}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-secondary hover:text-white rounded-lg hover:bg-border transition-colors"
          >
            ✕
          </button>
          <div>
            <div className="text-text-secondary text-xs">{song.title}</div>
            <div
              className={`font-bold ${sectionFontClass[fontSize]} leading-tight`}
              style={{ color: currentSection.color ?? '#ffffff' }}
            >
              {currentSection.name}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-text-secondary text-xs">BPM</div>
            <div className="text-white font-mono text-lg font-bold">{song.bpm}</div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setFontSize(FONT_SIZES[Math.max(0, fontSizeIdx - 1)])}
              disabled={fontSizeIdx === 0}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center bg-border text-white rounded hover:bg-[#3a3a3a] disabled:opacity-30 transition-colors text-sm"
            >
              A−
            </button>
            <button
              onClick={() => setFontSize(FONT_SIZES[Math.min(FONT_SIZES.length - 1, fontSizeIdx + 1)])}
              disabled={fontSizeIdx === FONT_SIZES.length - 1}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center bg-border text-white rounded hover:bg-[#3a3a3a] disabled:opacity-30 transition-colors text-sm"
            >
              A+
            </button>
          </div>
          <button
            onClick={onSettings}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-secondary hover:text-white rounded-lg hover:bg-border transition-colors"
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Main grid area - fills available space */}
      <div className="flex-1 overflow-y-auto px-4 py-2" onClick={(e) => e.stopPropagation()}>
        <div
          className="grid gap-3 h-full"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
        >
          {currentSection.bars.map((bar, barIdx) => (
            <div
              key={bar.id}
              className="bg-surface rounded-xl overflow-hidden border border-border"
            >
              <div className="px-2 py-1 bg-bg/50">
                <span className="text-text-secondary text-xs">{barIdx + 1}</span>
              </div>
              <div className="flex h-full min-h-[80px]">
                {bar.slots.map((slot, slotIdx) => {
                  const patch = slot.patchId ? song.patches.find((p) => p.id === slot.patchId) : null
                  return (
                    <div
                      key={slotIdx}
                      className="flex-1 flex flex-col items-center justify-center px-1 py-2 border-r border-border/50 last:border-r-0"
                      style={{
                        borderLeft: slotIdx === 0 && patch ? `4px solid ${patch.color}` : undefined,
                      }}
                    >
                      <span className={`${chordFontClass[fontSize]} font-bold leading-tight text-center ${slot.chord ? 'text-white' : 'text-border'}`}>
                        {slot.chord || '·'}
                      </span>
                      {slot.annotation && (
                        <span className="text-text-secondary text-xs mt-1 text-center">{slot.annotation}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={goPrev}
          disabled={sectionIdx === 0}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-border text-white rounded-xl disabled:opacity-30 hover:bg-[#3a3a3a] transition-colors text-xl"
        >
          ‹
        </button>

        {/* Section dots */}
        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-sm">
            {sectionIdx + 1} / {song.sections.length}
          </span>
          <div className="flex gap-1.5">
            {song.sections.map((sec, idx) => (
              <button
                key={sec.id}
                onClick={() => setSectionIdx(idx)}
                className="transition-all duration-200"
                style={{
                  width: idx === sectionIdx ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: idx === sectionIdx ? (sec.color ?? '#00d4ff') : '#2a2a2a',
                }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={goNext}
          disabled={sectionIdx === song.sections.length - 1}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-border text-white rounded-xl disabled:opacity-30 hover:bg-[#3a3a3a] transition-colors text-xl"
        >
          ›
        </button>
      </div>
    </div>
  )
}
