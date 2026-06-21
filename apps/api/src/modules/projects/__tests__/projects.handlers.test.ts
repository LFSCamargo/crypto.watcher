import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '../../../core/http/validation'
import { mockRequest, mockResponse } from '../../../test/http-mocks'
import { createProjectHandler } from '../handlers/create-project.handler'
import { getProjectBySlugHandler } from '../handlers/get-project-by-slug.handler'
import { listProjectsHandler } from '../handlers/list-projects.handler'
import { transitionProjectHandler } from '../handlers/transition-project.handler'
import { updateProjectHandler } from '../handlers/update-project.handler'

vi.mock('../projects.service', () => ({
  projectsService: {
    create: vi.fn(),
    list: vi.fn(),
    getBySlug: vi.fn(),
    update: vi.fn(),
    transition: vi.fn(),
  },
}))

import { projectsService } from '../projects.service'

const projectId = '11111111-1111-4111-8111-111111111111'
const now = '2024-01-01T00:00:00.000Z'

const project = {
  id: projectId,
  slug: 'uniswap-v3',
  name: 'Uniswap V3',
  description: 'DEX',
  chainId: 1,
  tokenAddress: null,
  state: 'in_analysis' as const,
  votingContractAddress: null,
  createdAt: now,
}

describe('projects handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createProjectHandler creates a project', async () => {
    vi.mocked(projectsService.create).mockResolvedValue(project)

    const req = mockRequest({ body: { name: 'Uniswap V3', chainId: 1, description: 'DEX' } })
    const res = mockResponse()

    await createProjectHandler(req, res)

    expect(projectsService.create).toHaveBeenCalledWith({
      name: 'Uniswap V3',
      chainId: 1,
      description: 'DEX',
    })
    expect(res.statusCode).toBe(201)
    expect(res.body).toEqual(project)
  })

  it('listProjectsHandler returns filtered projects', async () => {
    vi.mocked(projectsService.list).mockResolvedValue([project])

    const req = mockRequest({ query: { state: 'in_analysis' } })
    const res = mockResponse()

    await listProjectsHandler(req, res)

    expect(projectsService.list).toHaveBeenCalledWith({
      state: 'in_analysis',
      page: 1,
      limit: 20,
    })
    expect(res.body).toEqual([project])
  })

  it('getProjectBySlugHandler returns project by slug', async () => {
    vi.mocked(projectsService.getBySlug).mockResolvedValue(project)

    const req = mockRequest({ params: { slug: 'uniswap-v3' } })
    const res = mockResponse()

    await getProjectBySlugHandler(req, res)

    expect(res.body).toEqual(project)
  })

  it('getProjectBySlugHandler returns 404 when missing', async () => {
    vi.mocked(projectsService.getBySlug).mockResolvedValue(undefined)

    const req = mockRequest({ params: { slug: 'missing' } })
    const res = mockResponse()

    await getProjectBySlugHandler(req, res)

    expect(res.statusCode).toBe(404)
    expect(res.body).toEqual({ message: 'Project not found' })
  })

  it('updateProjectHandler updates a project', async () => {
    vi.mocked(projectsService.update).mockResolvedValue(project)

    const req = mockRequest({
      params: { id: projectId },
      body: { name: 'Uniswap V3' },
    })
    const res = mockResponse()

    await updateProjectHandler(req, res)

    expect(projectsService.update).toHaveBeenCalledWith(projectId, { name: 'Uniswap V3' })
    expect(res.body).toEqual(project)
  })

  it('updateProjectHandler returns 404 when project is missing', async () => {
    vi.mocked(projectsService.update).mockResolvedValue(undefined)

    const req = mockRequest({ params: { id: projectId }, body: { name: 'Uniswap V3' } })
    const res = mockResponse()

    await expect(updateProjectHandler(req, res)).rejects.toEqual(
      new HttpError(404, 'Project not found'),
    )
  })

  it('transitionProjectHandler transitions project state', async () => {
    const transitioned = { ...project, state: 'ready' as const }
    vi.mocked(projectsService.transition).mockResolvedValue(transitioned)

    const req = mockRequest({
      params: { id: projectId },
      body: { state: 'ready' },
    })
    const res = mockResponse()

    await transitionProjectHandler(req, res)

    expect(projectsService.transition).toHaveBeenCalledWith(projectId, { state: 'ready' })
    expect(res.body).toEqual(transitioned)
  })

  it('transitionProjectHandler returns 404 when project is missing', async () => {
    vi.mocked(projectsService.transition).mockResolvedValue(undefined)

    const req = mockRequest({ params: { id: projectId }, body: { state: 'ready' } })
    const res = mockResponse()

    await expect(transitionProjectHandler(req, res)).rejects.toEqual(
      new HttpError(404, 'Project not found'),
    )
  })
})
