import { useEffect } from 'react'
import { MIDI_START, MIDI_STOP, sendClockTick } from '../utils/midiUtils'

/**
 * Sends MIDI Clock at 24 PPQN to the given output while enabled, so the
 * synth's arpeggiator / sequencer locks to the sheet tempo. Emits Start
 * when it begins and Stop when it ends.
 */
export function useMidiClock(output: MIDIOutput | null, bpm: number, enabled: boolean) {
  useEffect(() => {
    if (!output || !enabled) return

    output.send([MIDI_START])
    const intervalMs = (60 / bpm / 24) * 1000
    const id = setInterval(() => sendClockTick(output), intervalMs)

    return () => {
      clearInterval(id)
      try {
        output.send([MIDI_STOP])
      } catch {
        /* output may be gone */
      }
    }
  }, [output, bpm, enabled])
}
