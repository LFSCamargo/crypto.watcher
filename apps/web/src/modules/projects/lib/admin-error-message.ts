import { ApiError } from '../../../lib/api/client'

export function adminErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError))
    return "We couldn't reach Crypto Watcher. Check your connection and try again."
  if (error.status === 401) return 'Your session expired. Sign in again to continue.'
  if (error.status === 403)
    return "Your account doesn't have permission for this action anymore."
  if (error.status === 400)
    return "Some details weren't accepted. Check the fields and try again."
  if (error.status === 404)
    return 'That project no longer exists. Refresh the list and try again.'
  return 'Something went wrong on our side. Nothing was changed — try again.'
}
