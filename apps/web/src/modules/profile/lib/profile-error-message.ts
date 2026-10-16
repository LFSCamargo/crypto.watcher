import { ApiError } from '../../../lib/api/client'

export function profileErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError))
    return "We couldn't reach Crypto Watcher. Your changes are still here — try again."
  if (error.status === 400)
    return "Some details weren't accepted. Check the fields and try again."
  if (error.status === 413) return 'That image is too large. Choose a smaller photo.'
  return 'Something went wrong on our side. Your changes are still here — try again.'
}

export const isProfileSessionExpired = (error: unknown) =>
  error instanceof ApiError && error.status === 401
