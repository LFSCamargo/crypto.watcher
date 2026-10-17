import { useEffect, useRef } from 'react'

const PIXELS_PER_FRAME = 1.2

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function wrapScroll(element: HTMLElement) {
  const loopAt = element.scrollWidth / 2
  if (loopAt <= 0) return
  if (element.scrollLeft >= loopAt) element.scrollLeft -= loopAt
  if (element.scrollLeft < 0) element.scrollLeft += loopAt
}

/** Tokens keep passing; while hovered the wheel scrubs the row. O(1) per frame. */
export function useAutoScrollTape(paused: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const hovering = useRef(false)
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let frame = 0
    let leftover = 0
    const tick = () => {
      const canMove =
        !hovering.current &&
        !pausedRef.current &&
        !prefersReducedMotion() &&
        element.scrollWidth > element.clientWidth
      if (canMove) {
        leftover += PIXELS_PER_FRAME
        const step = leftover < 0 ? Math.ceil(leftover) : Math.floor(leftover)
        if (step !== 0) {
          leftover -= step
          element.scrollLeft += step
          wrapScroll(element)
        }
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)

    const onWheel = (event: WheelEvent) => {
      if (!hovering.current) return
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
      if (delta === 0) return
      event.preventDefault()
      element.scrollLeft += delta
      wrapScroll(element)
    }

    const onEnter = () => {
      hovering.current = true
    }
    const onLeave = () => {
      hovering.current = false
    }

    element.addEventListener('pointerenter', onEnter)
    element.addEventListener('pointerleave', onLeave)
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.cancelAnimationFrame(frame)
      element.removeEventListener('pointerenter', onEnter)
      element.removeEventListener('pointerleave', onLeave)
      element.removeEventListener('wheel', onWheel)
    }
  }, [])

  return { ref }
}
