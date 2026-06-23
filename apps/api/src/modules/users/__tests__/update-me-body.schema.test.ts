import { describe, expect, it } from 'vitest'
import { MAX_AVATAR_URL_LENGTH } from '../schemas/avatar-url.schema'
import { UpdateMeBodySchema } from '../schemas/update-me-body.schema'

const tinyPng =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

describe('UpdateMeBodySchema avatarUrl', () => {
  it('accepts https profile image URLs', () => {
    const body = UpdateMeBodySchema.parse({
      avatarUrl: 'https://cdn.example.com/avatar.png',
    })
    expect(body.avatarUrl).toBe('https://cdn.example.com/avatar.png')
  })

  it('accepts base64 data URI images', () => {
    const body = UpdateMeBodySchema.parse({ avatarUrl: tinyPng })
    expect(body.avatarUrl).toBe(tinyPng)
  })

  it('accepts null to clear the avatar', () => {
    const body = UpdateMeBodySchema.parse({ avatarUrl: null })
    expect(body.avatarUrl).toBeNull()
  })

  it('rejects invalid data URIs', () => {
    expect(() =>
      UpdateMeBodySchema.parse({ avatarUrl: 'data:text/plain;base64,abc' }),
    ).toThrow()
  })

  it('rejects oversized base64 payloads', () => {
    const oversized = `data:image/png;base64,${'A'.repeat(MAX_AVATAR_URL_LENGTH)}`
    expect(() => UpdateMeBodySchema.parse({ avatarUrl: oversized })).toThrow()
  })
})
