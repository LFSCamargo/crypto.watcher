import type { Request, Response } from 'express'
import { vi } from 'vitest'

type MockResponse = Response & {
  statusCode: number
  body: unknown
  cookie: ReturnType<typeof vi.fn>
  clearCookie: ReturnType<typeof vi.fn>
}

export function mockRequest(overrides: Partial<Request> = {}): Request {
  return {
    params: {},
    query: {},
    body: {},
    headers: {},
    ...overrides,
  } as Request
}

export function mockResponse(): MockResponse {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    locals: {} as Record<string, unknown>,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload
      return this
    },
    send() {
      return this
    },
    set() {
      return this
    },
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  }
  return res as unknown as MockResponse
}
