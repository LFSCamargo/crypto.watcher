import type { Request, Response } from 'express'
import { checkDatabaseHealth } from '../../db/health'
import { openApiDocument } from '../../openapi/document'

/**
 * Lightweight service health endpoint handler (includes DB connectivity).
 */
export async function getHealth(_req: Request, res: Response) {
  try {
    await checkDatabaseHealth()
    res.json({ status: 'ok' })
  } catch {
    res.status(503).json({ status: 'degraded', message: 'Database unavailable' })
  }
}

/**
 * OpenAPI document endpoint handler.
 */
export function getOpenApiDocument(_req: Request, res: Response) {
  res.json(openApiDocument)
}
