import { useEffect, useRef, useState } from 'react'
import { isMidiSupported } from '../utils/midiUtils'

export function useMidi() {
  const [supported] = useState(() => isMidiSupported())
  const [outputs, setOutputs] = useState<MIDIOutput[]>([])
  const accessRef = useRef<MIDIAccess | null>(null)

  useEffect(() => {
    if (!supported) return

    navigator.requestMIDIAccess().then((midiAccess) => {
      accessRef.current = midiAccess
      setOutputs(Array.from(midiAccess.outputs.values()))

      midiAccess.onstatechange = () => {
        setOutputs(Array.from(midiAccess.outputs.values()))
      }
    }).catch(() => {})

    return () => {
      if (accessRef.current) {
        accessRef.current.onstatechange = null
      }
    }
  }, [supported])

  return { supported, outputs }
}
