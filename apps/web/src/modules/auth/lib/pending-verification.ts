export type VerificationPurpose = 'verify_email' | 'sign_in'

export interface PendingVerification {
  email: string
  purpose: VerificationPurpose
  next?: string
}

const STORAGE_KEY = 'cw-pending-verification'

/** Kept in sessionStorage (tab-scoped) so a reload of the code page keeps working. */
export function savePendingVerification(value: PendingVerification) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export function loadPendingVerification(): PendingVerification | undefined {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as unknown
    if (!parsed || typeof parsed !== 'object') return undefined
    const { email, purpose, next } = parsed as Record<string, unknown>
    if (typeof email !== 'string' || !email) return undefined
    return {
      email,
      purpose: purpose === 'verify_email' ? 'verify_email' : 'sign_in',
      next: typeof next === 'string' ? next : undefined,
    }
  } catch {
    return undefined
  }
}

export function clearPendingVerification() {
  sessionStorage.removeItem(STORAGE_KEY)
}

/** Mirrors the headings in `packages/email-templates/src/otp-copy.ts`. */
export const verificationHeadings: Record<VerificationPurpose, string> = {
  verify_email: 'Verify your email',
  sign_in: 'Sign in to Crypto Watcher',
}

export const OTP_EXPIRY_MINUTES = 10
export const RESET_LINK_EXPIRY_MINUTES = 30
