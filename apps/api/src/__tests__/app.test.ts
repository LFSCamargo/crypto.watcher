import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { app } from '../app'

vi.mock('../core/db/health', () => ({
  checkDatabaseHealth: vi.fn(),
}))

import { checkDatabaseHealth } from '../core/db/health'

describe('api app', () => {
  beforeEach(() => {
    vi.mocked(checkDatabaseHealth).mockResolvedValue(undefined)
  })

  it('serves health checks', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('reports degraded health when the database is unavailable', async () => {
    vi.mocked(checkDatabaseHealth).mockRejectedValueOnce(new Error('db unavailable'))

    const response = await request(app).get('/health')

    expect(response.status).toBe(503)
    expect(response.body).toEqual({
      status: 'degraded',
      message: 'Database unavailable',
    })
  })

  it('serves the OpenAPI document', async () => {
    const response = await request(app).get('/openapi.json')

    expect(response.status).toBe(200)
    expect(response.body.openapi).toBe('3.1.0')
    for (const path of [
      '/auth/nonce',
      '/auth/verify',
      '/auth/me',
      '/users/me',
      '/projects',
      '/projects/{slug}',
      '/projects/{id}/comments',
      '/projects/{id}/votes',
      '/projects/{id}/score',
      '/reputation/{address}',
      '/governance/proposals',
    ]) {
      expect(response.body.paths).toHaveProperty(path)
    }
  })
})
