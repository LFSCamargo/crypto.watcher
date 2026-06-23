import { z } from '../../../core/openapi/zod'
import { MAX_AVATAR_URL_LENGTH } from '../../../shared/avatar-limits'

export { MAX_AVATAR_URL_LENGTH }

const BASE64_DATA_URI = /^data:image\/(?:jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/]+=*$/

export const AvatarUrlSchema = z
  .string()
  .max(MAX_AVATAR_URL_LENGTH)
  .superRefine((value, ctx) => {
    const isDataUri = value.startsWith('data:')
    const isValidDataUri = BASE64_DATA_URI.test(value)
    if (isDataUri && isValidDataUri) return

    if (isDataUri) {
      ctx.addIssue({
        code: 'custom',
        message: 'avatarUrl must be a base64 image data URI (jpeg, png, webp, or gif)',
      })
      return
    }

    if (z.string().url().safeParse(value).success) {
      return
    }

    ctx.addIssue({
      code: 'custom',
      message: 'avatarUrl must be a valid http(s) URL or base64 image data URI',
    })
  })
