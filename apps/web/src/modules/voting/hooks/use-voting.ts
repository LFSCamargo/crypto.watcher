import { useQuery } from '@tanstack/react-query'
import { votingApi } from '../api/voting.api'

export function useVoteTally(projectId: string | undefined) {
  return useQuery({
    queryKey: ['vote-tally', projectId],
    queryFn: () => votingApi.tally(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useVoteEligibility(projectId: string | undefined, address: string | undefined) {
  return useQuery({
    queryKey: ['vote-eligibility', projectId, address],
    queryFn: () => votingApi.eligibility(projectId ?? '', address ?? ''),
    enabled: Boolean(projectId && address),
  })
}
