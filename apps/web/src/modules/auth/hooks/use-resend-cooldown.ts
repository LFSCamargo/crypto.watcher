import { useCallback, useEffect, useState } from 'react'

/** Client-side countdown that discourages rapid resend requests. */
export function useResendCooldown(seconds = 30) {
  const [endsAt, setEndsAt] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000))

  useEffect(() => {
    if (remaining <= 0) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [remaining])

  const start = useCallback(() => {
    const started = Date.now()
    setNow(started)
    setEndsAt(started + seconds * 1000)
  }, [seconds])

  return { remaining, isCoolingDown: remaining > 0, start }
}
