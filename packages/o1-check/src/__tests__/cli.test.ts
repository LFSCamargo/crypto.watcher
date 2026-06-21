import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseArgs, runCli } from '../cli.js'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')

describe('cli', () => {
  it('parses format and fail-below options', () => {
    expect(parseArgs(['src/', '--format', 'json', '--fail-below', '70'])).toEqual({
      paths: ['src/'],
      format: 'json',
      failBelow: 70,
      configPath: undefined,
    })
  })

  it('defaults to src when no paths are provided', () => {
    expect(parseArgs([]).paths).toEqual(['src'])
  })

  it('exits with code 1 when score is below threshold', async () => {
    const exitCode = await runCli([fixturesDir, '--fail-below', '100'])
    expect(exitCode).toBe(1)
  })
})
