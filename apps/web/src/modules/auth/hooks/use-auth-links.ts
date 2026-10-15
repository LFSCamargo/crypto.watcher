import { useLocation, useSearchParams } from 'react-router-dom'
import { safeReturnTo, withReturnTo } from '../lib/return-to'

/** Sign-in / sign-up hrefs that bring the user back to the current page. */
export function useAuthLinks() {
  const { pathname, search } = useLocation()
  const next = `${pathname}${search}`
  return {
    signInHref: withReturnTo('/auth/signin', next),
    signUpHref: withReturnTo('/auth/signup', next),
  }
}

/** The validated `?next=` destination on an auth page, if any. */
export function useReturnTo() {
  const [searchParams] = useSearchParams()
  const raw = searchParams.get('next')
  return raw ? safeReturnTo(raw, '') || undefined : undefined
}
