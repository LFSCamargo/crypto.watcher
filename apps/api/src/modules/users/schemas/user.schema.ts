import { z } from '../../../core/openapi/zod'
import { UserRoleSchema } from './user-role.schema'

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
