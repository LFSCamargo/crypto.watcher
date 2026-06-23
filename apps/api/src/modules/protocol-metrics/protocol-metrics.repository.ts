import { db } from '../../core/db'
import type { ProtocolMetricsSnapshot } from './protocol-metrics.types'
import { PROTOCOL_METRICS_SNAPSHOT_VERSION } from './protocol-metrics.types'

function parseSnapshot(raw: unknown): ProtocolMetricsSnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const snapshot = raw as ProtocolMetricsSnapshot
  if (typeof snapshot.slug !== 'string' || typeof snapshot.tvl !== 'number') return null
  if (!Array.isArray(snapshot.tvlHistory)) return null
  if (snapshot.snapshotVersion !== PROTOCOL_METRICS_SNAPSHOT_VERSION) return null

  return {
    ...snapshot,
    entityType: snapshot.entityType ?? 'protocol',
    mcap: snapshot.mcap ?? null,
    chainBreakdown: snapshot.chainBreakdown ?? [],
    tokenComposition: snapshot.tokenComposition ?? [],
    feesHistory: snapshot.feesHistory ?? [],
    revenueHistory: snapshot.revenueHistory ?? [],
    dexVolumeHistory: snapshot.dexVolumeHistory ?? [],
  }
}

export const protocolMetricsRepository = {
  async getFresh(slug: string): Promise<ProtocolMetricsSnapshot | null> {
    const row = await db
      .selectFrom('protocol_metrics_cache')
      .select(['snapshot'])
      .where('slug', '=', slug)
      .where('expires_at', '>', new Date())
      .executeTakeFirst()

    return row ? parseSnapshot(row.snapshot) : null
  },

  async getAny(slug: string): Promise<ProtocolMetricsSnapshot | null> {
    const row = await db
      .selectFrom('protocol_metrics_cache')
      .select(['snapshot'])
      .where('slug', '=', slug)
      .executeTakeFirst()

    return row ? parseSnapshot(row.snapshot) : null
  },

  async upsert(
    slug: string,
    defillamaId: string,
    snapshot: ProtocolMetricsSnapshot,
  ): Promise<void> {
    const fetchedAt = new Date(snapshot.cachedAt)
    const expiresAt = new Date(snapshot.expiresAt)

    await db
      .insertInto('protocol_metrics_cache')
      .values({
        slug,
        defillama_id: defillamaId,
        snapshot: snapshot as unknown as Record<string, unknown>,
        fetched_at: fetchedAt,
        expires_at: expiresAt,
      })
      .onConflict((oc) =>
        oc.column('slug').doUpdateSet({
          defillama_id: defillamaId,
          snapshot: snapshot as unknown as Record<string, unknown>,
          fetched_at: fetchedAt,
          expires_at: expiresAt,
          updated_at: new Date(),
        }),
      )
      .execute()
  },
}

export type ProtocolMetricsRepository = typeof protocolMetricsRepository
