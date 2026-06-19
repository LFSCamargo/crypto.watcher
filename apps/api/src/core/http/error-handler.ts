import type { ErrorRequestHandler } from 'express'
import { HttpError } from './validation'
import { logger } from '../logger'

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    })
    return
  }

  logger.error({ error }, 'Unhandled API error')
  res.status(500).json({ message: 'Internal server error' })
}
