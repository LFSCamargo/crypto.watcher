import { z } from '../../../core/openapi/zod'

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
