import { z } from '../../../core/openapi/zod'

export const UserRoleSchema = z.enum(['user', 'team', 'admin'])
