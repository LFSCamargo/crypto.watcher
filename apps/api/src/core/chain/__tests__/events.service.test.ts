import { describe, expect, it } from 'vitest'
import { chainEventKey } from '../events.service'

describe('chainEventKey', () => {
  it('normalizes transaction hash and log index into an idempotency key', () => {
    expect(chainEventKey('0xABC', 7)).toBe('0xabc:7')
  })
})
