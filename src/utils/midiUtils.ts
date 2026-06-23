export function isMidiSupported(): boolean {
  return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator
}

export async function getMidiOutputs(): Promise<MIDIOutput[]> {
  if (!isMidiSupported()) return []
  try {
    const access = await navigator.requestMIDIAccess()
    return Array.from(access.outputs.values())
  } catch {
    return []
  }
}

export function sendProgramChange(output: MIDIOutput, channel: number, program: number): void {
  // Program Change: 0xC0 | channel (0-15), program (0-127)
  output.send([0xc0 | (channel & 0x0f), program & 0x7f])
}

export function sendControlChange(output: MIDIOutput, channel: number, cc: number, value: number): void {
  // Control Change: 0xB0 | channel, cc, value
  output.send([0xb0 | (channel & 0x0f), cc & 0x7f, value & 0x7f])
}

interface PatchChange {
  program?: number
  bankMSB?: number
  bankLSB?: number
}

/**
 * Sends an optional Bank Select (MSB CC#0, LSB CC#32) followed by a
 * Program Change. Bank Select must precede the PC for most synths.
 */
export function sendPatchChange(output: MIDIOutput, channel: number, patch: PatchChange): void {
  if (patch.bankMSB !== undefined) sendControlChange(output, channel, 0, patch.bankMSB)
  if (patch.bankLSB !== undefined) sendControlChange(output, channel, 32, patch.bankLSB)
  if (patch.program !== undefined) sendProgramChange(output, channel, patch.program)
}

// MIDI Clock real-time messages (channel-less)
export const MIDI_CLOCK = 0xf8
export const MIDI_START = 0xfa
export const MIDI_STOP = 0xfc

export function sendClockTick(output: MIDIOutput): void {
  output.send([MIDI_CLOCK])
}
