import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../../../lib/api/client'
import { governanceApi } from '../api/governance.api'

export function useGovernanceProposals() {
  return useQuery({ queryKey: ['governance', 'proposals'], queryFn: governanceApi.list })
}

export function useGovernanceProposal(onchainId: string | undefined) {
  return useQuery({
    queryKey: ['governance', 'proposals', onchainId],
    queryFn: () => governanceApi.get(onchainId ?? ''),
    enabled: Boolean(onchainId),
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status < 500) && failureCount < 2,
  })
}
