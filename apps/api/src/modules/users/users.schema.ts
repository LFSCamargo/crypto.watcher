import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export const UserRoleSchema = z.enum(['user', 'team', 'admin'])

export const UserSchema = z
  .object({
    id: z.uuid(),
    walletAddress: z.string(),
    displayName: z.string().nullable(),
    avatarUrl: z.string().nullable(),
    bio: z.string().nullable(),
    role: UserRoleSchema,
    createdAt: z.iso.datetime(),
  })
  .openapi('User')

export const AddressParamsSchema = z.object({
  address: z.string().min(1),
})

export const UpdateMeBodySchema = z
  .object({
    displayName: z.string().min(1).max(120).optional(),
    avatarUrl: z.string().url().optional(),
    bio: z.string().max(1000).optional(),
  })
  .openapi('UpdateMeBody')
