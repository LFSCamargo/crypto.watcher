import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export const UserRoleSchema = z.enum(['user', 'team', 'admin'])

export const UserSchema = z
  .object({
    id: z.uuid(),
    walletAddress: z.string().nullable(),
    email: z.string().email().nullable(),
    publicKey: z.string().nullable(),
    xAccount: z.string().nullable(),
    nickname: z.string().nullable(),
    displayName: z.string().nullable(),
    avatarUrl: z.string().nullable(),
    bio: z.string().nullable(),
    role: UserRoleSchema,
    createdAt: z.iso.datetime(),
  })
  .openapi('User')

export const UserIdentifierParamsSchema = z.object({
  identifier: z.string().min(1),
})

/** @deprecated Use UserIdentifierParamsSchema */
export const AddressParamsSchema = UserIdentifierParamsSchema

export const UpdateMeBodySchema = z
  .object({
    displayName: z.string().min(1).max(120).optional(),
    avatarUrl: z.string().url().optional(),
    bio: z.string().max(1000).optional(),
    xAccount: z.string().min(1).max(64).optional(),
    nickname: z.string().min(2).max(32).optional(),
    publicKey: z.string().min(1).optional(),
  })
  .openapi('UpdateMeBody')
