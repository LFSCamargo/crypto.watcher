import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { authApi } from '../api/auth.api'
import type { LoginBody, RegisterBody } from '../../../lib/api/types'
import { useSession } from '../../../store/session'

export function useSessionBootstrap() {
  const setUser = useSession((state) => state.setUser)

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await authApi.me()
      } catch {
        return null
      }
    },
    retry: false,
  })

  useEffect(() => {
    if (query.data?.user) setUser(query.data.user)
    else if (query.isFetched) setUser(undefined)
  }, [query.data, query.isFetched, setUser])

  return query
}

export function useRegister() {
  const setUser = useSession((state) => state.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: RegisterBody) => authApi.register(body).then((r) => r.user),
    onSuccess: (user) => {
      setUser(user)
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}

export function useLogin() {
  const setUser = useSession((state) => state.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: LoginBody) => authApi.login(body).then((r) => r.user),
    onSuccess: (user) => {
      setUser(user)
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
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

export function useLinkPublicKey() {
  const setUser = useSession((state) => state.setUser)

  return useMutation({
    mutationFn: (publicKey: string) => authApi.linkPublicKey(publicKey).then((r) => r.user),
    onSuccess: (user) => setUser(user),
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
