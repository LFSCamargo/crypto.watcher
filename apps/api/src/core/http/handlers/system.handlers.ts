import type { Request, Response } from 'express'
import { openApiDocument } from '../../openapi/document'

/**
 * Lightweight service health endpoint handler.
 */
export function getHealth(_req: Request, res: Response) {
  res.json({ status: 'ok' })
}

/**
 * OpenAPI document endpoint handler.
 */
export function getOpenApiDocument(_req: Request, res: Response) {
  res.json(openApiDocument)
}
