import { useEffect, useRef, useState } from 'react'

/**
 * Drives a metronome at the given BPM. Returns the current beat index
 * (0-based, resets every bar) for visual flashing, and plays a short
 * Web Audio click on every beat (accented on beat 1).
 */
export function useMetronome(bpm: number, beatsPerBar: number, enabled: boolean) {
  const [beat, setBeat] = useState(-1)
  const ctxRef = useRef<AudioContext | null>(null)
  const beatRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      setBeat(-1)
      beatRef.current = 0
      return
    }

    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!ctxRef.current) ctxRef.current = new Ctx()
    const ctx = ctxRef.current
    ctx.resume().catch(() => {})

    const click = (accent: boolean) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = accent ? 1500 : 1000
      gain.gain.setValueAtTime(accent ? 0.5 : 0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.06)
    }

    const tick = () => {
      const current = beatRef.current % beatsPerBar
      setBeat(current)
      click(current === 0)
      beatRef.current = (beatRef.current + 1) % beatsPerBar
    }

    tick()
    const interval = setInterval(tick, (60 / bpm) * 1000)
    return () => clearInterval(interval)
  }, [bpm, beatsPerBar, enabled])

  return { beat }
}
