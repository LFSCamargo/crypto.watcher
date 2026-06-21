import { z } from '../../../core/openapi/zod'
import { UserSchema } from '../../users/schemas'

export const AuthUserResponseSchema = z
  .object({
    user: UserSchema,
  })
  .openapi('AuthUserResponse')
