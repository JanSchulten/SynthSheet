import { useEffect, useRef, useState } from 'react'
import { Song, FontSize, MidiBinding } from '../../types'
import { useWakeLock } from '../../hooks/useWakeLock'
import { useSwipe } from '../../hooks/useSwipe'
import { useMidi } from '../../hooks/useMidi'
import { useMetronome } from '../../hooks/useMetronome'
import { useMidiClock } from '../../hooks/useMidiClock'
import { useSettingsStore } from '../../store/settingsStore'
import { sendPatchChange } from '../../utils/midiUtils'

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
  queuePosition: { index: number; total: number } | null
  hasNextSong: boolean
  hasPrevSong: boolean
  onNextSong: () => void
  onPrevSong: () => void
  onExit: () => void
  onSettings: () => void
}

function bindingMatches(b: MidiBinding | null, type: number, d1: number, d2: number): boolean {
  if (!b) return false
  if (b.type === 'cc') return type === 0xb0 && d1 === b.number && d2 > 0
  return b.type === 'note' && type === 0x90 && d1 === b.number && d2 > 0
}

export function PerformanceView({
  song,
  queuePosition,
  hasNextSong,
  hasPrevSong,
  onNextSong,
  onPrevSong,
  onExit,
  onSettings,
}: PerformanceViewProps) {
  const [sectionIdx, setSectionIdx] = useState(0)
  const {
    fontSize, setFontSize, midiOutputId, midiInputId, navNext, navPrev,
    metronomeEnabled, setMetronomeEnabled, midiClockEnabled,
  } = useSettingsStore()
  const { outputs, inputs } = useMidi()
  const containerRef = useRef<HTMLDivElement>(null)

  const output = outputs.find((o) => o.id === midiOutputId) ?? null
  const channel = song.midiChannel ?? 0

  useWakeLock(true)
  const { beat } = useMetronome(song.bpm, song.timeSignature[0], metronomeEnabled)
  useMidiClock(output, song.bpm, midiClockEnabled)

  // Reset to first section whenever the song changes (e.g. setlist advance)
  useEffect(() => { setSectionIdx(0) }, [song.id])

  const currentSection = song.sections[sectionIdx]
  const nextSection = song.sections[sectionIdx + 1]

  const barCount = currentSection?.bars.length ?? 0
  const gridCols = barCount <= 4 ? 1 : barCount <= 16 ? 2 : 3
  const effectiveFontSize: FontSize =
    barCount > 24 ? FONT_SIZES[Math.max(0, FONT_SIZES.indexOf(fontSize) - 2)]
    : barCount > 12 ? FONT_SIZES[Math.max(0, FONT_SIZES.indexOf(fontSize) - 1)]
    : fontSize

  const goNext = () => {
    if (sectionIdx < song.sections.length - 1) setSectionIdx(sectionIdx + 1)
    else if (hasNextSong) onNextSong()
  }
  const goPrev = () => {
    if (sectionIdx > 0) setSectionIdx(sectionIdx - 1)
    else if (hasPrevSong) onPrevSong()
  }

  // Keep latest nav handlers for stable event listeners
  const navRef = useRef({ goNext, goPrev })
  navRef.current = { goNext, goPrev }

  // Send Bank Select + Program Change on section change
  useEffect(() => {
    if (!output || !currentSection) return
    const s = currentSection.bars[0]?.slots[0]
    if (!s) return
    if (s.midiPC !== undefined || s.midiBankMSB !== undefined || s.midiBankLSB !== undefined) {
      sendPatchChange(output, channel, { program: s.midiPC, bankMSB: s.midiBankMSB, bankLSB: s.midiBankLSB })
    }
  }, [sectionIdx, song.id, output, channel, currentSection])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navRef.current.goNext()
      if (e.key === 'ArrowLeft') navRef.current.goPrev()
      if (e.key === 'Escape') onExit()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onExit])

  // Hands-free MIDI input navigation (foot pedal / controller)
  useEffect(() => {
    const input = inputs.find((i) => i.id === midiInputId)
    if (!input) return
    const onMsg = (ev: Event) => {
      const data = (ev as MIDIMessageEvent).data
      if (!data || data.length < 2) return
      const type = data[0] & 0xf0
      const d1 = data[1]
      const d2 = data[2] ?? 0
      if (bindingMatches(navNext, type, d1, d2)) navRef.current.goNext()
      else if (bindingMatches(navPrev, type, d1, d2)) navRef.current.goPrev()
    }
    input.addEventListener('midimessage', onMsg)
    return () => input.removeEventListener('midimessage', onMsg)
  }, [inputs, midiInputId, navNext, navPrev])

  useSwipe(containerRef, { onSwipeLeft: goNext, onSwipeRight: goPrev })

  const fontSizeIdx = FONT_SIZES.indexOf(fontSize)

  const handleTapZone = (e: React.MouseEvent) => {
    const x = e.clientX
    const w = window.innerWidth
    if (x < w * 0.2) goPrev()
    else if (x > w * 0.8) goNext()
  }

  // Manually fire a bar's patch (sound check / mid-section change)
  const fireBarPatch = (slot: { midiPC?: number; midiBankMSB?: number; midiBankLSB?: number }) => {
    if (!output) return
    if (slot.midiPC !== undefined || slot.midiBankMSB !== undefined || slot.midiBankLSB !== undefined) {
      sendPatchChange(output, channel, { program: slot.midiPC, bankMSB: slot.midiBankMSB, bankLSB: slot.midiBankLSB })
    }
  }

  if (!currentSection) {
    return (
      <div className="h-full flex items-center justify-center text-white">Keine Sections</div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col text-white select-none transition-all duration-200"
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
      <div className="glass m-2 rounded-2xl flex items-center justify-between px-4 py-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onExit} className="glass-button min-h-[44px] min-w-[44px] flex items-center justify-center text-white rounded-full">✕</button>
          <div className="min-w-0">
            <div className="text-text-secondary text-xs truncate">
              {queuePosition ? `Set ${queuePosition.index + 1}/${queuePosition.total} · ` : ''}{song.title}
            </div>
            <div className={`font-bold ${sectionFontClass[fontSize]} leading-tight truncate`} style={{ color: currentSection.color ?? '#ffffff' }}>
              {currentSection.name}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Metronome */}
          <button
            onClick={() => setMetronomeEnabled(!metronomeEnabled)}
            className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl transition-all ${metronomeEnabled ? 'glass-accent' : 'glass-button text-white'}`}
            style={metronomeEnabled && beat === 0 ? { filter: 'brightness(1.5)' } : undefined}
            title="Metronom"
          >
            ◇
          </button>
          <div className="text-right">
            <div className="text-text-secondary text-[10px] leading-none">BPM</div>
            <div className="text-white font-mono text-base font-bold leading-tight">{song.bpm}</div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setFontSize(FONT_SIZES[Math.max(0, fontSizeIdx - 1)])} disabled={fontSizeIdx === 0}
              className="glass-button min-h-[36px] min-w-[36px] flex items-center justify-center text-white rounded-lg disabled:opacity-30 text-sm">A−</button>
            <button onClick={() => setFontSize(FONT_SIZES[Math.min(FONT_SIZES.length - 1, fontSizeIdx + 1)])} disabled={fontSizeIdx === FONT_SIZES.length - 1}
              className="glass-button min-h-[36px] min-w-[36px] flex items-center justify-center text-white rounded-lg disabled:opacity-30 text-sm">A+</button>
          </div>
          <button onClick={onSettings} className="glass-button min-h-[40px] min-w-[40px] flex items-center justify-center text-white rounded-full">⚙</button>
        </div>
      </div>

      {/* Main grid: whole section fits the screen */}
      <div className="flex-1 overflow-y-auto px-2 min-h-0" onClick={(e) => e.stopPropagation()}>
        <div className="grid gap-2 h-full" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`, gridAutoRows: 'minmax(64px, 1fr)' }}>
          {currentSection.bars.map((bar, barIdx) => {
            const filled = bar.slots.filter((s) => s.chord.trim() !== '')
            const barPatch = bar.slots[0]?.patchId ? song.patches.find((p) => p.id === bar.slots[0].patchId) : null
            return (
              <div
                key={bar.id}
                onClick={() => fireBarPatch(bar.slots[0])}
                className="glass rounded-2xl overflow-hidden flex flex-col min-h-0"
                style={{ borderLeft: barPatch ? `4px solid ${barPatch.color}` : undefined }}
              >
                <div className="px-2 py-0.5 shrink-0">
                  <span className="text-text-secondary text-[10px]">{barIdx + 1}</span>
                </div>
                {filled.length <= 1 ? (
                  <div className="flex-1 flex flex-col items-center justify-center px-1 min-h-0">
                    <span className={`${chordFontClass[effectiveFontSize]} font-bold leading-none text-center truncate max-w-full ${filled.length ? 'text-white' : 'text-white/20'}`}>
                      {filled[0]?.chord || '·'}
                    </span>
                    {filled[0]?.annotation && <span className="text-text-secondary text-xs mt-1 text-center truncate max-w-full">{filled[0].annotation}</span>}
                  </div>
                ) : (
                  <div className="flex-1 flex min-h-0">
                    {bar.slots.map((slot, slotIdx) => (
                      <div key={slotIdx} className="flex-1 flex flex-col items-center justify-center px-0.5 border-r border-white/10 last:border-r-0 min-w-0">
                        <span className={`${chordFontClass[effectiveFontSize]} font-bold leading-none text-center truncate max-w-full ${slot.chord ? 'text-white' : 'text-white/15'}`}>
                          {slot.chord || '·'}
                        </span>
                        {slot.annotation && <span className="text-text-secondary text-[10px] mt-0.5 text-center truncate max-w-full">{slot.annotation}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="glass m-2 rounded-2xl flex items-center justify-between px-4 py-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button onClick={goPrev} disabled={sectionIdx === 0 && !hasPrevSong}
          className="glass-button min-h-[44px] min-w-[44px] flex items-center justify-center text-white rounded-xl disabled:opacity-30 text-xl">‹</button>

        <div className="flex flex-col items-center gap-1 min-w-0">
          <span className="text-text-secondary text-sm">{sectionIdx + 1} / {song.sections.length}</span>
          <div className="flex gap-1.5">
            {song.sections.map((sec, idx) => (
              <button key={sec.id} onClick={() => setSectionIdx(idx)} className="transition-all duration-200"
                style={{ width: idx === sectionIdx ? 20 : 8, height: 8, borderRadius: 4, backgroundColor: idx === sectionIdx ? (sec.color ?? '#00d4ff') : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
          {nextSection ? (
            <span className="text-text-secondary text-[11px] truncate max-w-[160px]">→ {nextSection.name}</span>
          ) : hasNextSong ? (
            <span className="text-accent text-[11px]">→ nächster Song</span>
          ) : null}
        </div>

        <button onClick={goNext} disabled={sectionIdx === song.sections.length - 1 && !hasNextSong}
          className="glass-button min-h-[44px] min-w-[44px] flex items-center justify-center text-white rounded-xl disabled:opacity-30 text-xl">›</button>
      </div>
    </div>
  )
}
