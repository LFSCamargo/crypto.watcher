import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('vite manualChunks', () => {
  it('bundles the react package into vendor-react', () => {
    const configSource = readFileSync(resolve(__dirname, '../../vite.config.ts'), 'utf8')

    expect(configSource).toContain("return 'vendor-react'")
    expect(configSource).toMatch(/node_modules\\\/react\\\//)
    expect(configSource).toContain("dedupe: ['react', 'react-dom']")
  })
})
