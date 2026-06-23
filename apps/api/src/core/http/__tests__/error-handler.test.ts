import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '../validation'
import { errorHandler } from '../error-handler'

vi.mock('../../logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

import { logger } from '../../logger'

const runHandler = (error: unknown) => {
  const json = vi.fn()
  const status = vi.fn(() => ({ json }))
  errorHandler(error, {} as never, { status } as never, vi.fn())
  return { status, json }
}

describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns HttpError status and payload', () => {
    const { status, json } = runHandler(new HttpError(404, 'Not found', { field: 'id' }))

    expect(status).toHaveBeenCalledWith(404)
    expect(json).toHaveBeenCalledWith({
      message: 'Not found',
      details: { field: 'id' },
    })
  })

  it('returns 500 for unexpected errors', () => {
    const { status, json } = runHandler(new Error('boom'))

    expect(logger.error).toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ message: 'Internal server error' })
  })

  it('returns 413 for entity.too.large payload errors', () => {
    const { status, json } = runHandler({ type: 'entity.too.large', status: 413 })

    expect(status).toHaveBeenCalledWith(413)
    expect(json).toHaveBeenCalledWith({ message: 'Request body is too large' })
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('returns 409 for PostgreSQL unique violations', () => {
    const { status, json } = runHandler({ code: '23505', message: 'duplicate key' })

    expect(status).toHaveBeenCalledWith(409)
    expect(json).toHaveBeenCalledWith({
      message: 'A profile field must be unique (nickname or wallet already taken)',
    })
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('returns 503 when the database is unavailable', () => {
    const { status, json } = runHandler({ code: '57P03', message: 'the database system is in recovery mode' })

    expect(status).toHaveBeenCalledWith(503)
    expect(json).toHaveBeenCalledWith({ message: 'Database temporarily unavailable' })
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('returns 503 for disk-full PostgreSQL errors', () => {
    const { status, json } = runHandler({ code: '53100', message: 'could not extend file' })

    expect(status).toHaveBeenCalledWith(503)
    expect(json).toHaveBeenCalledWith({ message: 'Database temporarily unavailable' })
  })

  it('returns 400 for PostgreSQL check constraint violations', () => {
    const { status, json } = runHandler({ code: '23514', message: 'check constraint violated' })

    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ message: 'Profile image exceeds the maximum allowed size' })
  })

  it('returns 400 for invalid JSON body', () => {
    const syntaxError = new SyntaxError('Unexpected token')
    Object.assign(syntaxError, { body: '{}' })

    const { status, json } = runHandler(syntaxError)

    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ message: 'Invalid JSON body' })
  })
})
