import { ApiError } from '../../../lib/api/client'

export function requestErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError))
    return "We couldn't reach Crypto Watcher. Check your connection and try again."
  if (error.status === 400)
    return "Some details weren't accepted. Check the fields and try again."
  if (error.status === 429)
    return 'Too many requests right now. Wait a minute and try again.'
  return 'Something went wrong on our side. Your details are still here — try again.'
}

export const isSessionExpired = (error: unknown) =>
  error instanceof ApiError && error.status === 401
