import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'

const COMPACT_AFTER_PX = 24
const PINNED_SCROLL_PX = 48

function currentScrollY() {
  return typeof window === 'undefined' ? 0 : window.scrollY
}

/**
 * Header pill state: expanded at the top of the page, compact once scrolled down.
 * Hovering re-expands it; a click pins it open until the reader scrolls on.
 */
export function useCompactHeader() {
  const [scrolled, setScrolled] = useState(() => currentScrollY() > COMPACT_AFTER_PX)
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned] = useState(false)
  const pinnedAt = useRef<number | null>(null)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > COMPACT_AFTER_PX)
      if (pinnedAt.current !== null && y > pinnedAt.current + PINNED_SCROLL_PX) {
        pinnedAt.current = null
        setPinned(false)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const expand = useCallback(() => {
    pinnedAt.current = window.scrollY
    setPinned(true)
  }, [])

  const onPointerEnter = useCallback((event: PointerEvent) => {
    if (event.pointerType !== 'touch') setHovered(true)
  }, [])

  const onPointerLeave = useCallback(() => setHovered(false), [])

  return {
    compact: scrolled && !hovered && !pinned,
    expand,
    onPointerEnter,
    onPointerLeave,
  }
}
