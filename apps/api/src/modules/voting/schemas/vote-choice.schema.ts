import { z } from '../../../core/openapi/zod'

export const VoteChoiceSchema = z.union([z.literal(0), z.literal(1)])
