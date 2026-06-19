import { apiFetch, apiPost } from '../../../lib/api/client'
import type { AuthUserResponse, NonceResponse } from '../../../lib/api/types'

export const authApi = {
  nonce: (address: string) => apiPost<NonceResponse>('/auth/nonce', { address }),
  verify: (input: { address: string; message: string; signature: string }) =>
    apiPost<AuthUserResponse>('/auth/verify', input),
  me: () => apiFetch<AuthUserResponse>('/auth/me'),
  logout: () => apiPost<void>('/auth/logout'),
}
