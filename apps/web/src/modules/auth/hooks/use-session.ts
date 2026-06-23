import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { authApi } from '../api/auth.api'
import type { LoginBody, RegisterBody } from '../../../lib/api/types'
import { useSession } from '../../../store/session'

export function useAuthMeQuery() {
  return useQuery({
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
}

export function useSessionBootstrap() {
  const setUser = useSession((state) => state.setUser)
  const query = useAuthMeQuery()

  useEffect(() => {
    if (query.data?.user) setUser(query.data.user)
    else if (query.isFetched) setUser(undefined)
  }, [query.data, query.isFetched, setUser])

  return query
}

export function useAuthStatus() {
  const user = useSession((state) => state.user)
  const query = useAuthMeQuery()

  return {
    isAuthenticated: Boolean(user ?? query.data?.user),
    isReady: query.isFetched,
    isLoading: query.isLoading,
  }
}

export function useRegister() {
  return useMutation({
    mutationFn: (body: RegisterBody) => authApi.register(body),
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: (body: LoginBody) => authApi.login(body),
  })
}

export function useVerifyEmailOtp() {
  const setUser = useSession((state) => state.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { email: string; code: string }) =>
      authApi.verifyEmailOtp(body).then((response) => response.user),
    onSuccess: (user) => {
      setUser(user)
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}

export function useResendEmailOtp() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendEmailOtp(email),
  })
}

export function useWalletLogin() {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const setUser = useSession((state) => state.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => {
      if (!address) throw new Error('Connect a wallet first')
      return authApi.walletLogin(address, (message) => signMessageAsync({ message }))
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
