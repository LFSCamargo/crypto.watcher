import type { ErrorRequestHandler } from 'express'
import { HttpError } from './validation'
import { logger } from '../logger'

type ErrorWithStatus = {
  status?: number
  type?: string
  code?: string
  message?: string
  cause?: unknown
}

type ErrorResponse = {
  status: number
  body: {
    message: string
    details?: unknown
  }
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
const MAX_ERROR_CAUSE_DEPTH = 8

const asErrorWithStatus = (error: unknown): ErrorWithStatus | undefined =>
  typeof error === 'object' && error !== null ? (error as ErrorWithStatus) : undefined

const findPgCode = (error: unknown): string | undefined => {
  let current = asErrorWithStatus(error)
  for (let depth = 0; current && depth < MAX_ERROR_CAUSE_DEPTH; depth += 1) {
    if (typeof current.code === 'string') return current.code
    current = asErrorWithStatus(current.cause)
  }
  return undefined
}

const isPgCheckViolation = (error: unknown): boolean => findPgCode(error) === '23514'

const isPgUniqueViolation = (error: unknown): boolean => findPgCode(error) === '23505'

const isDatabaseUnavailable = (error: unknown): boolean => {
  const pgCode = findPgCode(error)
  if (pgCode) return PG_UNAVAILABLE_CODES.has(pgCode)

  const nodeCode = asErrorWithStatus(error)?.code
  if (!nodeCode) return false

  return NODE_UNAVAILABLE_CODES.has(nodeCode)
}

const ERROR_RESPONSE_MAPPERS: Array<{
  matches: (error: unknown) => boolean
  response: ErrorResponse
}> = [
  {
    matches: (error) => error instanceof SyntaxError && 'body' in error,
    response: { status: 400, body: { message: 'Invalid JSON body' } },
  },
  {
    matches: isEntityTooLarge,
    response: { status: 413, body: { message: 'Request body is too large' } },
  },
  {
    matches: isPgUniqueViolation,
    response: {
      status: 409,
      body: { message: 'A profile field must be unique (nickname or wallet already taken)' },
    },
  },
  {
    matches: isPgCheckViolation,
    response: { status: 400, body: { message: 'Profile image exceeds the maximum allowed size' } },
  },
  {
    matches: isDatabaseUnavailable,
    response: { status: 503, body: { message: 'Database temporarily unavailable' } },
  },
]

const getErrorResponse = (error: unknown): ErrorResponse | undefined => {
  if (error instanceof HttpError) {
    return {
      status: error.statusCode,
      body: { message: error.message, details: error.details },
    }
  }

  return ERROR_RESPONSE_MAPPERS.find(({ matches }) => matches(error))?.response
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const response = getErrorResponse(error)
  if (response) {
    res.status(response.status).json(response.body)
    return
  }

  logger.error({ error }, 'Unhandled API error')
  res.status(500).json({ message: 'Internal server error' })
}
