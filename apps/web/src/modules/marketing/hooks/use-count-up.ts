import { useEffect, useState } from 'react'

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Eases a number from 0 to `target`; jumps straight to it under reduced motion. */
export function useCountUp(target: number, durationMs = 800, delayMs = 160) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0))

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target)
      return
    }
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    let frame = 0
    let start: number | undefined
    const tick = (now: number) => {
      start ??= now + delayMs
      const progress = Math.min(Math.max((now - start) / durationMs, 0), 1)
      setValue(Math.round(target * (1 - (1 - progress) ** 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    const finish = () => {
      if (!preference?.matches) return
      cancelAnimationFrame(frame)
      setValue(target)
    }
    preference?.addEventListener?.('change', finish)
    return () => {
      cancelAnimationFrame(frame)
      preference?.removeEventListener?.('change', finish)
    }
  }, [target, durationMs, delayMs])

  return value
}
