import { describe, expect, it } from 'vitest'
import { curatedProjectIconUrl } from '../lib/project-icon-url'

describe('curatedProjectIconUrl', () => {
  it('returns a local public path keyed by project slug', () => {
    expect(curatedProjectIconUrl('stellar')).toBe('/icons/stellar.png')
    expect(curatedProjectIconUrl('bitcoin')).toBe('/icons/bitcoin.png')
  })
})
