import { apiFetch } from '../../../lib/api/client'
import type { Reputation } from '../../../lib/api/types'

export const reputationApi = {
  getByAddress: (address: string) => apiFetch<Reputation>(`/reputation/${address}`),
}
