import type { ErrorRequestHandler } from 'express'
import { HttpError } from './validation'
import { logger } from '../logger'

type ErrorWithStatus = {
  status?: number
  type?: string
  code?: string
  message?: string
}

const isEntityTooLarge = (error: unknown): error is ErrorWithStatus =>
  typeof error === 'object' &&
  error !== null &&
  ((error as ErrorWithStatus).type === 'entity.too.large' ||
    (error as ErrorWithStatus).status === 413)

const PG_UNAVAILABLE_CODES = new Set([
  '57P03', // cannot_connect_now (recovery / starting)
  '53100', // disk_full
  '08006', // connection_failure
  '08001', // sqlclient_unable_to_establish_sqlconnection
  '08003', // connection_does_not_exist
  '53300', // too_many_connections
])

const NODE_UNAVAILABLE_CODES = new Set(['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET'])

const findPgCode = (error: unknown): string | undefined => {
  let current: unknown = error
  while (typeof current === 'object' && current !== null) {
    if ('code' in current && typeof (current as ErrorWithStatus).code === 'string') {
      return (current as ErrorWithStatus).code
    }
    current = (current as { cause?: unknown }).cause
  }
  return undefined
}

const isPgCheckViolation = (error: unknown): boolean => findPgCode(error) === '23514'

const isPgUniqueViolation = (error: unknown): boolean => findPgCode(error) === '23505'

const isDatabaseUnavailable = (error: unknown): boolean => {
  const pgCode = findPgCode(error)
  if (pgCode && PG_UNAVAILABLE_CODES.has(pgCode)) return true

  if (typeof error === 'object' && error !== null && 'code' in error) {
    const nodeCode = (error as ErrorWithStatus).code
    if (nodeCode && NODE_UNAVAILABLE_CODES.has(nodeCode)) return true
  }

  return false
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    })
    return
  }

  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ message: 'Invalid JSON body' })
    return
  }

  if (isEntityTooLarge(error)) {
    res.status(413).json({ message: 'Request body is too large' })
    return
  }

  if (isPgUniqueViolation(error)) {
    res.status(409).json({ message: 'A profile field must be unique (nickname or wallet already taken)' })
    return
  }

  if (isPgCheckViolation(error)) {
    res.status(400).json({ message: 'Profile image exceeds the maximum allowed size' })
    return
  }

  if (isDatabaseUnavailable(error)) {
    res.status(503).json({ message: 'Database temporarily unavailable' })
    return
  }

  logger.error({ error }, 'Unhandled API error')
  res.status(500).json({ message: 'Internal server error' })
}
