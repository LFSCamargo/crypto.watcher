import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const MAX_FRAMES = 60

/**
 * Scrolls to `location.hash` once the target exists. Lazy routes render after the
 * browser's own anchor jump, and the shell scrolls to top on page changes, so the
 * attempt is deferred to the next frames.
 */
export function useHashScroll() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1))
    if (!id) return

    let frame = 0
    let handle = 0
    const attempt = () => {
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView({ block: 'start' })
        return
      }
      frame += 1
      if (frame < MAX_FRAMES) handle = window.requestAnimationFrame(attempt)
    }
    handle = window.requestAnimationFrame(attempt)
    return () => window.cancelAnimationFrame(handle)
  }, [pathname, hash])
}
