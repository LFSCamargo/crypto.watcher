/** Default logo URL for local preview (`pnpm run email:dev`). */
export const DEFAULT_EMAIL_LOGO_URL = 'http://localhost:5173/logo.png'

export type EmailBrandProps = {
  /** Absolute URL to `/logo.png` (served by the web app). */
  logoUrl?: string
}

export function resolveLogoUrl(logoUrl?: string) {
  return logoUrl ?? DEFAULT_EMAIL_LOGO_URL
}
