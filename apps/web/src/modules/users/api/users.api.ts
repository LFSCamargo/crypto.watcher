import { apiFetch, apiPatch } from '../../../lib/api/client'
import type { User } from '../../../lib/api/types'

export const usersApi = {
  getByAddress: (address: string) => apiFetch<User>(`/users/${address}`),
  updateMe: (input: {
    displayName?: string
    avatarUrl?: string
    bio?: string
    xAccount?: string
    nickname?: string
    publicKey?: string
  }) => apiPatch<User>('/users/me', input),
}
