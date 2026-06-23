import { useEffect, useRef, useState } from 'react'
import { isMidiSupported } from '../utils/midiUtils'

export function useMidi() {
  const [supported] = useState(() => isMidiSupported())
  const [outputs, setOutputs] = useState<MIDIOutput[]>([])
  const [inputs, setInputs] = useState<MIDIInput[]>([])
  const accessRef = useRef<MIDIAccess | null>(null)

  useEffect(() => {
    if (!supported) return

    navigator.requestMIDIAccess().then((midiAccess) => {
      accessRef.current = midiAccess
      const refresh = () => {
        setOutputs(Array.from(midiAccess.outputs.values()))
        setInputs(Array.from(midiAccess.inputs.values()))
      }
      refresh()
      midiAccess.onstatechange = refresh
    }).catch(() => {})

    return () => {
      if (accessRef.current) {
        accessRef.current.onstatechange = null
      }
    }
  }, [supported])

  return { supported, outputs, inputs }
}
