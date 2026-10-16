import { useEffect, useRef, type RefObject } from 'react'
import { useLocation } from 'react-router-dom'

/** Moves focus to the main region after client-side navigation so screen readers announce the new page. */
export function useRouteFocus(targetRef: RefObject<HTMLElement>) {
  const { pathname } = useLocation()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname
    targetRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }, [pathname, targetRef])
}
