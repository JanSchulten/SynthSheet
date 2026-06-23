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
