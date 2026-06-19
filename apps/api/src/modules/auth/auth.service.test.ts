import { describe, expect, it } from 'vitest'
import { buildSignInMessage, extractNonce } from './auth.service'

describe('auth message helpers', () => {
  it('embeds and extracts nonce from sign-in message', () => {
    const message = buildSignInMessage('0xABCDEF', 'abc123')

    expect(message).toContain('Address: 0xabcdef')
    expect(extractNonce(message)).toBe('abc123')
  })

  it('returns undefined when nonce is missing', () => {
    expect(extractNonce('invalid message')).toBeUndefined()
  })
})
