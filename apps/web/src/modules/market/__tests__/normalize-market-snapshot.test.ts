import { describe, expect, it } from 'vitest'
import { normalizeMarketSnapshot } from '../lib/normalize-market-snapshot'

describe('normalizeMarketSnapshot', () => {
  it('fills missing change fields with null', () => {
    const snapshot = normalizeMarketSnapshot({
      slug: 'bitcoin',
      coingeckoId: 'bitcoin',
      currency: 'usd',
      price: 100,
      change24h: 1.2,
      change7d: 3.4,
      history: [{ timestamp: Date.now(), price: 100 }],
      cachedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    })

    expect(snapshot?.change1m).toBeNull()
    expect(snapshot?.change1y).toBeNull()
  })

  it('rejects legacy payloads without required history', () => {
    expect(normalizeMarketSnapshot({ slug: 'bitcoin', price: 100 })).toBeNull()
  })
})
