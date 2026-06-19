import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { authApi } from '../api/auth.api'
import { useSession } from '../../../store/session'

export function useSessionBootstrap() {
  const setUser = useSession((state) => state.setUser)

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
  })

  useEffect(() => {
    if (query.data?.user) setUser(query.data.user)
    if (query.isError) setUser(undefined)
  }, [query.data, query.isError, setUser])

  return query
}

export function useWalletLogin() {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const setUser = useSession((state) => state.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!address) throw new Error('Connect a wallet first')
      const nonce = await authApi.nonce(address)
      const signature = await signMessageAsync({ message: nonce.message })
      const result = await authApi.verify({
        address,
        message: nonce.message,
        signature,
      })
      return result.user
    },
    onSuccess: (user) => {
      setUser(user)
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}

export function useLogout() {
  const setUser = useSession((state) => state.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setUser(undefined)
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}
