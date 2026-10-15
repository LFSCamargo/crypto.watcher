const DEFAULT_DESTINATION = '/app'

/**
 * Returns an in-app path that is safe to navigate to after authentication.
 * Rejects absolute and protocol-relative URLs, backslash tricks and auth pages.
 */
export function safeReturnTo(value: unknown, fallback = DEFAULT_DESTINATION): string {
  if (typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\'))
    return fallback
  if (value === '/auth' || value.startsWith('/auth/')) return fallback
  return value
}

/** Appends `?next=` to an auth path when there is a meaningful destination to keep. */
export function withReturnTo(authPath: string, next: string | undefined): string {
  if (!next) return authPath
  const safe = safeReturnTo(next, '')
  if (!safe || safe === '/') return authPath
  return `${authPath}?next=${encodeURIComponent(safe)}`
}
