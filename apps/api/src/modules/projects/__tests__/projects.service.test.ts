import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mapProject, projectsService } from '../projects.service'

vi.mock('../projects.repository', () => ({
  projectsRepository: {
    list: vi.fn(),
    getBySlug: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    transition: vi.fn(),
  },
}))

import { projectsRepository } from '../projects.repository'

const now = new Date('2024-01-01T00:00:00.000Z')

const row = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'uniswap-v3',
  name: 'Uniswap V3',
  description: 'DEX',
  chain_id: 1,
  token_address: null,
  state: 'in_analysis' as const,
  voting_contract_address: null,
  submitted_by: null,
  created_at: now,
  updated_at: null,
}

describe('projectsService repository integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mapProject maps database rows', () => {
    expect(mapProject(row)).toEqual({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      chainId: row.chain_id,
      tokenAddress: row.token_address,
      state: row.state,
      votingContractAddress: row.voting_contract_address,
      createdAt: now.toISOString(),
    })
  })

  it('list maps repository rows', async () => {
    vi.mocked(projectsRepository.list).mockResolvedValue([row])

    const result = await projectsService.list({ state: 'in_analysis', page: 1, limit: 20 })

    expect(result).toHaveLength(1)
    expect(result[0]?.slug).toBe('uniswap-v3')
  })

  it('getBySlug returns undefined when missing', async () => {
    vi.mocked(projectsRepository.getBySlug).mockResolvedValue(undefined)

    await expect(projectsService.getBySlug('missing')).resolves.toBeUndefined()
  })

  it('getById maps repository rows', async () => {
    vi.mocked(projectsRepository.getById).mockResolvedValue(row)

    const result = await projectsService.getById(row.id)

    expect(result?.id).toBe(row.id)
  })

  it('create slugifies project name', async () => {
    vi.mocked(projectsRepository.create).mockResolvedValue(row)

    await projectsService.create({ name: 'Uniswap V3', chainId: 1 })

    expect(projectsRepository.create).toHaveBeenCalledWith({
      name: 'Uniswap V3',
      chainId: 1,
      slug: 'uniswap-v3',
    })
  })

  it('update slugifies when name changes', async () => {
    vi.mocked(projectsRepository.update).mockResolvedValue(row)

    await projectsService.update(row.id, { name: 'New Name' })

    expect(projectsRepository.update).toHaveBeenCalledWith(row.id, {
      name: 'New Name',
      slug: 'new-name',
    })
  })

  it('update returns undefined when project is missing', async () => {
    vi.mocked(projectsRepository.update).mockResolvedValue(undefined)

    await expect(projectsService.update(row.id, { name: 'New Name' })).resolves.toBeUndefined()
  })

  it('transition rejects invalid state changes', async () => {
    vi.mocked(projectsRepository.getById).mockResolvedValue(row)

    await expect(
      projectsService.transition(row.id, { state: 'voting' }),
    ).rejects.toThrow('Invalid project transition: in_analysis -> voting')
  })

  it('transition returns undefined when project is missing', async () => {
    vi.mocked(projectsRepository.getById).mockResolvedValue(undefined)

    await expect(
      projectsService.transition(row.id, { state: 'ready' }),
    ).resolves.toBeUndefined()
  })

  it('transition updates project state', async () => {
    const ready = { ...row, state: 'ready' as const }
    vi.mocked(projectsRepository.getById).mockResolvedValue(row)
    vi.mocked(projectsRepository.transition).mockResolvedValue(ready)

    const result = await projectsService.transition(row.id, { state: 'ready' })

    expect(result?.state).toBe('ready')
  })
})
