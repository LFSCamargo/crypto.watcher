import { useQuery } from '@tanstack/react-query'
import { reputationApi } from '../api/reputation.api'

export function useReputation(address: string | undefined) {
  return useQuery({
    queryKey: ['reputation', address],
    queryFn: () => reputationApi.getByAddress(address ?? ''),
    enabled: Boolean(address),
  })
}
