import { useEffect, useRef } from 'react'

interface SwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  minDistance?: number
}

export function useSwipe(ref: React.RefObject<HTMLElement | null>, options: SwipeOptions) {
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const { onSwipeLeft, onSwipeRight, minDistance = 50 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current
      const dy = e.changedTouches[0].clientY - touchStartY.current

      if (Math.abs(dx) < minDistance) return
      if (Math.abs(dy) > Math.abs(dx)) return // vertical swipe

      if (dx < 0) onSwipeLeft?.()
      else onSwipeRight?.()
    }

    const handleTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - touchStartX.current
      const dy = e.touches[0].clientY - touchStartY.current
      // Only prevent default for horizontal swipes to preserve vertical scroll
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        e.preventDefault()
      }
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [ref, onSwipeLeft, onSwipeRight, minDistance])
}
