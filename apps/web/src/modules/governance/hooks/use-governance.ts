import { useQuery } from '@tanstack/react-query'
import { governanceApi } from '../api/governance.api'

export function useGovernanceProposals() {
  return useQuery({ queryKey: ['governance', 'proposals'], queryFn: governanceApi.list })
}

export function useGovernanceProposal(onchainId: string | undefined) {
  return useQuery({
    queryKey: ['governance', 'proposals', onchainId],
    queryFn: () => governanceApi.get(onchainId ?? ''),
    enabled: Boolean(onchainId),
  })
}
