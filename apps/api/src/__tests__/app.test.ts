import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../app'

describe('api app', () => {
  it('serves health checks', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
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
