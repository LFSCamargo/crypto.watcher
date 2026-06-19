import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { UserSchema } from '../users/users.schema'

extendZodWithOpenApi(z)

export const NonceBodySchema = z
  .object({
    address: z.string().min(1),
  })
  .openapi('NonceBody')

export const NonceResponseSchema = z
  .object({
    nonce: z.string(),
    message: z.string(),
  })
  .openapi('NonceResponse')

export const VerifyBodySchema = z
  .object({
    address: z.string().min(1),
    message: z.string().min(1),
    signature: z.string().min(1),
  })
  .openapi('VerifyBody')

export const AuthUserResponseSchema = z
  .object({
    user: UserSchema,
  })
  .openapi('AuthUserResponse')
