import { beforeEach, describe, expect, it, vi } from 'vitest'
import { governanceService } from '../governance.service'

vi.mock('../governance.repository', () => ({
  governanceRepository: {
    list: vi.fn(),
    getByOnchainId: vi.fn(),
  },
}))

import { governanceRepository } from '../governance.repository'

const now = new Date('2024-01-01T00:00:00.000Z')

const row = {
  id: '11111111-1111-4111-8111-111111111111',
  onchain_id: '42',
  proposer_address: '0x1234567890123456789012345678901234567890',
  title: 'Update methodology',
  description: 'Proposal details',
  state: 'active' as const,
  start_block: '100',
  end_block: '200',
  created_at: now,
  updated_at: null,
}

describe('governanceService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('list maps repository proposals', async () => {
    vi.mocked(governanceRepository.list).mockResolvedValue([row])

    const result = await governanceService.list({ state: 'active' })

    expect(governanceRepository.list).toHaveBeenCalledWith({ state: 'active' })
    expect(result).toEqual([
      {
        id: row.id,
        onchainId: row.onchain_id,
        proposerAddress: row.proposer_address,
        title: row.title,
        description: row.description,
        state: row.state,
        startBlock: row.start_block,
        endBlock: row.end_block,
      },
    ])
  })

  it('getByOnchainId maps repository proposal', async () => {
    vi.mocked(governanceRepository.getByOnchainId).mockResolvedValue(row)

    const result = await governanceService.getByOnchainId('42')

    expect(result?.onchainId).toBe('42')
  })

  it('getByOnchainId returns undefined when missing', async () => {
    vi.mocked(governanceRepository.getByOnchainId).mockResolvedValue(undefined)

    await expect(governanceService.getByOnchainId('999')).resolves.toBeUndefined()
  })
})
