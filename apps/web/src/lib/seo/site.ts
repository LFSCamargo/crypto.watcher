/** Site-wide SEO constants and URL helpers. */

export const SITE_NAME = 'Crypto Watcher'

export const SITE_TAGLINE = 'Expert-governed crypto risk review'

export const DEFAULT_DESCRIPTION =
  'Blockchain risk review platform. Expert governor scores and structured reports help you decide whether a crypto project is safe to invest in.'

export const DEFAULT_OG_IMAGE = '/logo.png'

export const TWITTER_HANDLE = '@cryptowatcher'

/** Resolve the public site origin (no trailing slash). */
export function getSiteUrl(): string {
  const fromVite =
    typeof import.meta !== 'undefined'
      ? import.meta.env?.VITE_SITE_URL?.trim()
      : undefined
  const fromProcess =
    typeof process !== 'undefined' ? process.env.VITE_SITE_URL?.trim() : undefined
  const fromEnv = fromVite || fromProcess
  if (fromEnv) return fromEnv.replace(/\/+$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return 'https://cryptowatcher.io'
}

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${getSiteUrl()}${normalized}`
}

/** Format a page title with the site suffix. */
export function formatPageTitle(title: string): string {
  if (title === SITE_NAME || title.startsWith(`${SITE_NAME} —`)) return title
  return `${title} — ${SITE_NAME}`
}
