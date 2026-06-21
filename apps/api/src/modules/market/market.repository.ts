import { db } from '../../core/db'
import type { MarketSnapshot } from './market.types'

function parseSnapshot(raw: unknown): MarketSnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const snapshot = raw as MarketSnapshot
  if (typeof snapshot.slug !== 'string' || typeof snapshot.price !== 'number') return null
  if (!Array.isArray(snapshot.history)) return null
  return snapshot
}

export const marketRepository = {
  async getFresh(slug: string): Promise<MarketSnapshot | null> {
    const row = await db
      .selectFrom('market_cache')
      .select(['snapshot'])
      .where('slug', '=', slug)
      .where('expires_at', '>', new Date())
      .executeTakeFirst()

    return row ? parseSnapshot(row.snapshot) : null
  },

  async getAny(slug: string): Promise<MarketSnapshot | null> {
    const row = await db
      .selectFrom('market_cache')
      .select(['snapshot'])
      .where('slug', '=', slug)
      .executeTakeFirst()

    return row ? parseSnapshot(row.snapshot) : null
  },

  async upsert(slug: string, coingeckoId: string, snapshot: MarketSnapshot): Promise<void> {
    const fetchedAt = new Date(snapshot.cachedAt)
    const expiresAt = new Date(snapshot.expiresAt)

    await db
      .insertInto('market_cache')
      .values({
        slug,
        coingecko_id: coingeckoId,
        snapshot: snapshot as unknown as Record<string, unknown>,
        fetched_at: fetchedAt,
        expires_at: expiresAt,
      })
      .onConflict((oc) =>
        oc.column('slug').doUpdateSet({
          coingecko_id: coingeckoId,
          snapshot: snapshot as unknown as Record<string, unknown>,
          fetched_at: fetchedAt,
          expires_at: expiresAt,
          updated_at: new Date(),
        }),
      )
      .execute()
  },
}

export type MarketRepository = typeof marketRepository
