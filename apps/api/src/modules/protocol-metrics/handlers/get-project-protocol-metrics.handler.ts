import type { Request, Response } from 'express'
import { PROTOCOL_METRICS_CACHE_TTL_MS } from '../protocol-metrics.cache'
import { protocolMetricsService } from '../protocol-metrics.service'
import { ProtocolMetricsProjectParamsSchema } from '../schemas'

export async function getProjectProtocolMetricsHandler(req: Request, res: Response) {
  const params = ProtocolMetricsProjectParamsSchema.parse(req.params)
  const snapshot = await protocolMetricsService.getProjectProtocolMetrics(params.slug)

  res.set(
    'Cache-Control',
    `public, max-age=${Math.floor(PROTOCOL_METRICS_CACHE_TTL_MS / 1000)}`,
  )
  res.json(snapshot)
}
