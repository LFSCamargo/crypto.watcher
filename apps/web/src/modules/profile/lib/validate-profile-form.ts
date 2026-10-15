export interface ProfileFormValues {
  nickname: string
  displayName: string
  xAccount: string
  bio: string
  publicKey: string
}

export type ProfileFormErrors = Partial<Record<keyof ProfileFormValues, string>>

export const PROFILE_FIELD_ORDER: (keyof ProfileFormValues)[] = [
  'nickname',
  'displayName',
  'xAccount',
  'bio',
  'publicKey',
]

const WALLET_ADDRESS = /^0x[0-9a-fA-F]{40}$/

/** Mirrors the `PATCH /users/me` schema limits so errors appear before submit. */
export function validateProfileForm(values: ProfileFormValues): ProfileFormErrors {
  const errors: ProfileFormErrors = {}
  const nickname = values.nickname.trim()
  if (nickname && (nickname.length < 2 || nickname.length > 32)) {
    errors.nickname = 'Nickname must be 2–32 characters.'
  }
  if (values.displayName.trim().length > 120) {
    errors.displayName = 'Display name must be 120 characters or fewer.'
  }
  if (values.xAccount.trim().length > 64) {
    errors.xAccount = 'X account must be 64 characters or fewer.'
  }
  if (values.bio.length > 1000) {
    errors.bio = 'Bio must be 1,000 characters or fewer.'
  }
  const publicKey = values.publicKey.trim()
  if (publicKey && !WALLET_ADDRESS.test(publicKey)) {
    errors.publicKey = 'Enter a wallet address: 0x followed by 40 letters or numbers.'
  }
  return errors
}
