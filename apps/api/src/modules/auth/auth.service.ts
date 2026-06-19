import { randomBytes } from 'node:crypto'
import { verifyMessage } from 'viem'
import { normalizeAddress } from '../../shared/address'
import { mapUser, usersService } from '../users/users.service'
import { authRepository } from './auth.repository'

const SESSION_COOKIE = 'cw_session'

export const sessionCookieName = SESSION_COOKIE

export const buildSignInMessage = (address: string, nonce: string): string =>
  [
    'Crypto Watcher wants you to sign in with your wallet.',
    '',
    `Address: ${normalizeAddress(address)}`,
    `Nonce: ${nonce}`,
  ].join('\n')

export const extractNonce = (message: string): string | undefined =>
  message.match(/^Nonce: (?<nonce>[a-f0-9]+)$/m)?.groups?.nonce

export const authService = {
  async createNonce(address: string) {
    const user = await usersService.upsertByAddress(address)
    const nonce = randomBytes(16).toString('hex')
    await authRepository.createSession({
      userId: user.id,
      nonce,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    })

    return { nonce, message: buildSignInMessage(address, nonce) }
  },

  async verify(input: { address: string; message: string; signature: string }) {
    const nonce = extractNonce(input.message)
    if (!nonce) return undefined

    const session = await authRepository.getActiveSessionByNonce(nonce)
    if (!session) return undefined
    if (session.wallet_address !== normalizeAddress(input.address)) return undefined

    const valid = await verifyMessage({
      address: input.address as `0x${string}`,
      message: input.message,
      signature: input.signature as `0x${string}`,
    })
    if (!valid) return undefined

    return {
      sessionId: session.session_id,
      user: mapUser({
        id: session.user_id,
        wallet_address: session.wallet_address,
        display_name: session.display_name,
        avatar_url: session.avatar_url,
        bio: session.bio,
        role: session.role,
        created_at: session.created_at,
        updated_at: null,
      }),
    }
  },

  async getSession(sessionId: string) {
    const session = await authRepository.getActiveSessionById(sessionId)
    if (!session) return undefined
    return {
      sessionId: session.session_id,
      user: mapUser({
        id: session.user_id,
        wallet_address: session.wallet_address,
        display_name: session.display_name,
        avatar_url: session.avatar_url,
        bio: session.bio,
        role: session.role,
        created_at: session.created_at,
        updated_at: null,
      }),
    }
  },

  revokeSession: authRepository.revokeSession,
}
