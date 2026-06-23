import { z } from '../../../core/openapi/zod'
import { MAX_AVATAR_URL_LENGTH } from '../../../shared/avatar-limits'

export { MAX_AVATAR_URL_LENGTH }

const BASE64_DATA_URI = /^data:image\/(?:jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/]+=*$/

export const AvatarUrlSchema = z
  .string()
  .max(MAX_AVATAR_URL_LENGTH)
  .superRefine((value, ctx) => {
    if (value.startsWith('data:')) {
      if (!BASE64_DATA_URI.test(value)) {
        ctx.addIssue({
          code: 'custom',
          message: 'avatarUrl must be a base64 image data URI (jpeg, png, webp, or gif)',
        })
      }
      return
    }
    if (!z.string().url().safeParse(value).success) {
      ctx.addIssue({
        code: 'custom',
        message: 'avatarUrl must be a valid http(s) URL or base64 image data URI',
      })
    }
  })
