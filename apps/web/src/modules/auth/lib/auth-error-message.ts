import { ApiError } from '../../../lib/api/client'

export const NETWORK_ERROR_MESSAGE =
  'We couldn’t reach Crypto Watcher. Check your connection and try again.'

const SERVER_ERROR_MESSAGE =
  'Something went wrong on our side. Please try again in a moment.'
const RATE_LIMIT_MESSAGE = 'Too many attempts. Wait a moment, then try again.'

/** Maps an auth request failure to a user-facing sentence. */
export function authErrorMessage(
  error: unknown,
  byStatus: Partial<Record<number, string>>,
  fallback: string,
): string {
  if (!(error instanceof ApiError)) return NETWORK_ERROR_MESSAGE
  const mapped = byStatus[error.status]
  if (mapped) return mapped
  if (error.status === 429) return RATE_LIMIT_MESSAGE
  if (error.status >= 500) return SERVER_ERROR_MESSAGE
  return fallback
}

export function isApiStatus(error: unknown, status: number) {
  return error instanceof ApiError && error.status === status
}
