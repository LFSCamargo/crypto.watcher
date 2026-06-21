import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '../../../core/http/validation'
import { mockRequest, mockResponse } from '../../../test/http-mocks'
import { getGovernanceProposalHandler } from '../handlers/get-governance-proposal.handler'
import { listGovernanceProposalsHandler } from '../handlers/list-governance-proposals.handler'

vi.mock('../governance.service', () => ({
  governanceService: {
    list: vi.fn(),
    getByOnchainId: vi.fn(),
  },
}))

import { governanceService } from '../governance.service'

const proposal = {
  id: '11111111-1111-4111-8111-111111111111',
  onchainId: '42',
  proposerAddress: '0x1234567890123456789012345678901234567890',
  title: 'Update methodology',
  description: 'Proposal details',
  state: 'active' as const,
  startBlock: '100',
  endBlock: '200',
}

describe('governance handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listGovernanceProposalsHandler returns proposals', async () => {
    vi.mocked(governanceService.list).mockResolvedValue([proposal])

    const req = mockRequest({ query: { state: 'active' } })
    const res = mockResponse()

    await listGovernanceProposalsHandler(req, res)

    expect(governanceService.list).toHaveBeenCalledWith({ state: 'active' })
    expect(res.body).toEqual([proposal])
  })

  it('getGovernanceProposalHandler returns proposal by onchain id', async () => {
    vi.mocked(governanceService.getByOnchainId).mockResolvedValue(proposal)

    const req = mockRequest({ params: { onchainId: '42' } })
    const res = mockResponse()

    await getGovernanceProposalHandler(req, res)

    expect(governanceService.getByOnchainId).toHaveBeenCalledWith('42')
    expect(res.body).toEqual(proposal)
  })

  it('getGovernanceProposalHandler returns 404 when missing', async () => {
    vi.mocked(governanceService.getByOnchainId).mockResolvedValue(undefined)

    const req = mockRequest({ params: { onchainId: '999' } })
    const res = mockResponse()

    await expect(getGovernanceProposalHandler(req, res)).rejects.toEqual(
      new HttpError(404, 'Governance proposal not found'),
    )
  })
})
