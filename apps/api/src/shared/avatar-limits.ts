/** Max encoded avatar payload (base64 data URI or URL string). Enforced in API + PostgreSQL. */
export const MAX_AVATAR_URL_LENGTH = 256_000

/** Express/nginx JSON body cap — avatar + profile fields headroom. */
export const MAX_PROFILE_REQUEST_BYTES = 320_000
