import { apiFetch, apiPost } from '../../../lib/api/client'
import type { AuthUserResponse, NonceResponse } from '../../../lib/api/types'

export const authApi = {
  nonce: (address: string) => apiPost<NonceResponse>('/auth/nonce', { address }),
  verify: (input: { address: string; message: string; signature: string }) =>
    apiPost<AuthUserResponse>('/auth/verify', input),
  register: (input: { email: string; password: string; nickname?: string }) =>
    apiPost<AuthUserResponse>('/auth/register', input),
  login: (input: { email: string; password: string }) =>
    apiPost<AuthUserResponse>('/auth/login', input),
  linkPublicKey: (publicKey: string) =>
    apiPost<AuthUserResponse>('/auth/link-public-key', { publicKey }),
  forgotPassword: (email: string) =>
    apiPost<{ ok: true; token?: string }>('/auth/forgot-password', { email }),
  resetPassword: (input: { token: string; password: string }) =>
    apiPost<{ ok: true }>('/auth/reset-password', input),
  me: () => apiFetch<AuthUserResponse>('/auth/me'),
  logout: () => apiPost<void>('/auth/logout'),
}
