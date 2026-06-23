import { z } from '../../../core/openapi/zod'

export const TvlPointSchema = z
  .object({
    timestamp: z.number(),
    tvl: z.number(),
  })
  .openapi('TvlPoint')

export const TimeSeriesPointSchema = z
  .object({
    timestamp: z.number(),
    value: z.number(),
  })
  .openapi('TimeSeriesPoint')

export const ChainTvlBreakdownSchema = z
  .object({
    chain: z.string(),
    tvl: z.number(),
    share: z.number(),
  })
  .openapi('ChainTvlBreakdown')

export const TokenCompositionSchema = z
  .object({
    symbol: z.string(),
    usd: z.number(),
    share: z.number(),
  })
  .openapi('TokenComposition')

export const ExploitRecordSchema = z
  .object({
    date: z.string().datetime(),
    name: z.string(),
    classification: z.string().nullable(),
    amountUsd: z.number().nullable(),
    chain: z.array(z.string()),
    returnedFunds: z.number().nullable(),
  })
  .openapi('ExploitRecord')

export const ProtocolMetricsSnapshotSchema = z
  .object({
    slug: z.string(),
    entityType: z.enum(['protocol', 'chain']),
    defillamaId: z.string(),
    name: z.string(),
    category: z.string().nullable(),
    website: z.string().nullable(),
    chains: z.array(z.string()),
    mcap: z.number().nullable(),
    tvl: z.number(),
    tvlChange24h: z.number().nullable(),
    tvlChange7d: z.number().nullable(),
    tvlChange30d: z.number().nullable(),
    tvlHistory: z.array(TvlPointSchema),
    chainBreakdown: z.array(ChainTvlBreakdownSchema),
    tokenComposition: z.array(TokenCompositionSchema),
    fees24h: z.number().nullable(),
    fees7d: z.number().nullable(),
    fees30d: z.number().nullable(),
    feesChange1d: z.number().nullable(),
    feesHistory: z.array(TimeSeriesPointSchema),
    revenue24h: z.number().nullable(),
    revenue7d: z.number().nullable(),
    revenue30d: z.number().nullable(),
    revenueHistory: z.array(TimeSeriesPointSchema),
    dexVolume24h: z.number().nullable(),
    dexVolume7d: z.number().nullable(),
    dexVolume30d: z.number().nullable(),
    dexVolumeChange1d: z.number().nullable(),
    dexVolumeHistory: z.array(TimeSeriesPointSchema),
    exploits: z.array(ExploitRecordSchema),
    exploitCount: z.number().int(),
    totalExploitLossUsd: z.number().nullable(),
    snapshotVersion: z.number().int(),
    cachedAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
    stale: z.boolean().optional(),
  })
  .openapi('ProtocolMetricsSnapshot')
