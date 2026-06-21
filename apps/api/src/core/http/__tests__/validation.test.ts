import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { HttpError, asyncHandler, validate } from '../validation'

describe('HttpError', () => {
  it('stores status code and optional details', () => {
    const error = new HttpError(422, 'Validation failed', [{ path: 'email' }])

    expect(error.statusCode).toBe(422)
    expect(error.message).toBe('Validation failed')
    expect(error.details).toEqual([{ path: 'email' }])
  })
})

describe('validate middleware', () => {
  it('calls next when schemas pass', () => {
    const schema = z.object({ name: z.string() })
    const req = { body: { name: 'Crypto Watcher' }, query: {}, params: {} }
    const next = vi.fn()

    validate({ body: schema })(req as never, {} as never, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('forwards HttpError when schema validation fails', () => {
    const schema = z.object({ name: z.string().min(1) })
    const req = { body: { name: '' }, query: {}, params: {} }
    const next = vi.fn()

    validate({ body: schema })(req as never, {} as never, next)

    expect(next).toHaveBeenCalledWith(expect.any(HttpError))
    const error = next.mock.calls[0]?.[0] as HttpError
    expect(error.statusCode).toBe(400)
    expect(error.message).toBe('Invalid request')
    expect(error.details).toEqual(expect.arrayContaining([expect.objectContaining({ path: 'name' })]))
  })
})

describe('asyncHandler', () => {
  it('resolves successful handlers', async () => {
    const handler = asyncHandler(async (_req, res) => {
      res.json({ ok: true })
    })
    const json = vi.fn()
    const next = vi.fn()

    await handler({} as never, { json } as never, next)

    expect(json).toHaveBeenCalledWith({ ok: true })
    expect(next).not.toHaveBeenCalled()
  })

  it('forwards rejected handlers to next', async () => {
    const failure = new HttpError(403, 'Forbidden')
    const handler = asyncHandler(async () => {
      throw failure
    })
    const next = vi.fn()

    await handler({} as never, {} as never, next)

    expect(next).toHaveBeenCalledWith(failure)
  })
})
