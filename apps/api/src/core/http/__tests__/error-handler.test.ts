import { describe, expect, it, vi } from 'vitest'
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
})
