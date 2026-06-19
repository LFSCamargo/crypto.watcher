import { apiFetch } from '../../../lib/api/client'
import type { VoteEligibility, VoteTally } from '../../../lib/api/types'

export const votingApi = {
  tally: (projectId: string) => apiFetch<VoteTally>(`/projects/${projectId}/votes`),
  eligibility: (projectId: string, address: string) =>
    apiFetch<VoteEligibility>(
      `/projects/${projectId}/votes/eligibility?address=${encodeURIComponent(address)}`,
    ),
}
