import { apiFetch } from '../../../lib/api/client'
import type { GovernanceProposal } from '../../../lib/api/types'

export const governanceApi = {
  list: () => apiFetch<GovernanceProposal[]>('/governance/proposals'),
  get: (onchainId: string) =>
    apiFetch<GovernanceProposal>(`/governance/proposals/${onchainId}`),
}
