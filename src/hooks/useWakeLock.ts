import { useEffect, useRef } from 'react'

export function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!active) {
      lockRef.current?.release()
      lockRef.current = null
      return
    }

    if (!('wakeLock' in navigator)) return

    let released = false
    navigator.wakeLock.request('screen').then((lock) => {
      if (released) {
        lock.release()
        return
      }
      lockRef.current = lock
    }).catch(() => {})

    return () => {
      released = true
      lockRef.current?.release()
      lockRef.current = null
    }
  }, [active])
}
