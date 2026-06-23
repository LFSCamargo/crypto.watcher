import { apiFetch, apiPost } from '../../../lib/api/client'
import type { AuthUserResponse, NonceResponse } from '../../../lib/api/types'

export interface AuthOtpChallengeResponse {
  ok: true
  email: string
}

export const authApi = {
  nonce: (address: string) => apiPost<NonceResponse>('/auth/nonce', { address }),
  verify: (input: { address: string; message: string; signature: string }) =>
    apiPost<AuthUserResponse>('/auth/verify', input),
  register: (input: { email: string; password: string; nickname?: string }) =>
    apiPost<AuthOtpChallengeResponse>('/auth/register', input),
  login: (input: { email: string; password: string }) =>
    apiPost<AuthOtpChallengeResponse>('/auth/login', input),
  verifyEmailOtp: (input: { email: string; code: string }) =>
    apiPost<AuthUserResponse>('/auth/verify-email-otp', input),
  resendEmailOtp: (email: string) =>
    apiPost<{ ok: true; code?: string }>('/auth/resend-email-otp', { email }),
  linkPublicKey: (publicKey: string) =>
    apiPost<AuthUserResponse>('/auth/link-public-key', { publicKey }),
  forgotPassword: (email: string) =>
    apiPost<{ ok: true; token?: string }>('/auth/forgot-password', { email }),
  resetPassword: (input: { token: string; password: string }) =>
    apiPost<{ ok: true }>('/auth/reset-password', input),
  me: () => apiFetch<AuthUserResponse>('/auth/me'),
  logout: () => apiPost<void>('/auth/logout'),
  walletLogin: (address: string, signMessage: (message: string) => Promise<string>) =>
    authApi
      .nonce(address)
      .then((nonce) =>
        signMessage(nonce.message).then((signature) =>
          authApi.verify({
            address,
            message: nonce.message,
            signature,
          }),
        ),
      )
      .then((result) => result.user),
}
