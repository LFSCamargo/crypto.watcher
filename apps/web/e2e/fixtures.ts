import { test as base, expect, type Page, type Route } from '@playwright/test'

/**
 * Deterministic HTTP API mock for browser journeys against the production build,
 * which calls the API under `/api`. Every API request is answered from in-memory
 * state; every cross-origin request (market data, RPCs, wallet relays) is aborted
 * so tests never touch the network.
 */

export type Role = 'user' | 'team' | 'admin'

export interface MockUser {
  id: string
  walletAddress: string | null
  email: string | null
  publicKey: string | null
  displayName: string | null
  nickname: string | null
  avatarUrl: string | null
  bio: string | null
  xAccount: string | null
  role: Role
  createdAt: string
}

export interface MockProject {
  id: string
  slug: string
  name: string
  description: string | null
  chainId: number
  tokenAddress: string | null
  state: 'in_analysis' | 'ready' | 'voting' | 'closed' | 'analyzed'
  votingContractAddress: string | null
  createdAt: string
}

export interface MockAnalysisRequest {
  id: string
  userId: string
  projectName: string
  projectUrl: string
  description: string
  status: 'pending' | 'paid' | 'in_review' | 'approved' | 'rejected'
  paymentTxHash: string | null
  feeAmount: string
  reviewNotes: string | null
  createdAt: string
  updatedAt: string | null
}

export interface MockProposal {
  id: string
  onchainId: string
  proposerAddress: string
  title: string
  description: string | null
  state: 'pending' | 'active' | 'succeeded' | 'defeated' | 'executed'
  startBlock: string | null
  endBlock: string | null
}

export interface MockComment {
  id: string
  projectId: string
  authorId: string
  body: string
  createdAt: string
}

export const FIXED_DATE = '2026-09-01T12:00:00.000Z'
export const VALID_OTP = '123456'
export const VALID_PASSWORD = 'Correct-Horse-42!'
export const VALID_RESET_TOKEN = 'valid-reset-token'

export function makeUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: 'user-1',
    walletAddress: null,
    email: 'ada@example.com',
    publicKey: null,
    displayName: 'Ada',
    nickname: 'ada',
    avatarUrl: null,
    bio: null,
    xAccount: null,
    role: 'user',
    createdAt: FIXED_DATE,
    ...overrides,
  }
}

const defaultProjects: MockProject[] = [
  {
    id: 'project-aave',
    slug: 'aave',
    name: 'Aave',
    description: 'Decentralized lending protocol.',
    chainId: 1,
    tokenAddress: null,
    state: 'analyzed',
    votingContractAddress: '0x00000000000000000000000000000000000000a1',
    createdAt: FIXED_DATE,
  },
  {
    id: 'project-newdex',
    slug: 'newdex',
    name: 'NewDex',
    description: 'An emerging decentralized exchange awaiting review.',
    chainId: 1,
    tokenAddress: null,
    state: 'in_analysis',
    votingContractAddress: null,
    createdAt: FIXED_DATE,
  },
]

const defaultProposals: MockProposal[] = [
  {
    id: 'proposal-1',
    onchainId: '1',
    proposerAddress: '0x00000000000000000000000000000000000000b1',
    title: 'Add a tokenomics specialist to the governor council',
    description: 'Expands reviewer coverage for token emission analysis.',
    state: 'active',
    startBlock: '100',
    endBlock: '200',
  },
  {
    id: 'proposal-2',
    onchainId: '2',
    proposerAddress: '0x00000000000000000000000000000000000000b2',
    title: 'Publish methodology v2',
    description: null,
    state: 'executed',
    startBlock: '10',
    endBlock: '50',
  },
]

const defaultRequests: MockAnalysisRequest[] = [
  {
    id: 'request-1',
    userId: 'user-2',
    projectName: 'Orbit Bridge',
    projectUrl: 'https://orbit.example',
    description: 'Cross-chain bridge requesting a security review.',
    status: 'in_review',
    paymentTxHash: null,
    feeAmount: '0',
    reviewNotes: null,
    createdAt: FIXED_DATE,
    updatedAt: null,
  },
]

function marketSnapshot(slug: string) {
  const start = Date.parse('2025-09-01T00:00:00.000Z')
  const day = 24 * 60 * 60 * 1000
  const history = Array.from({ length: 366 }, (_, index) => ({
    timestamp: start + index * day,
    price: 100 + Math.round(Math.sin(index / 20) * 1000) / 100 + index / 10,
  }))
  return {
    slug,
    coingeckoId: slug,
    currency: 'usd',
    price: history[history.length - 1]!.price,
    change24h: 1.2,
    change7d: -0.8,
    change1m: 3.4,
    change1y: 12.5,
    history,
    cachedAt: FIXED_DATE,
    expiresAt: '2099-01-01T00:00:00.000Z',
  }
}

const API_BASE = '/api'

type Json = object | null

export class MockApi {
  user: MockUser | null = null
  projects: MockProject[] = structuredClone(defaultProjects)
  proposals: MockProposal[] = structuredClone(defaultProposals)
  analysisRequests: MockAnalysisRequest[] = structuredClone(defaultRequests)
  comments: MockComment[] = []
  scores: Record<string, { value: string; round: number }> = {
    'project-aave': { value: '8650', round: 1 },
  }
  /** Endpoints (`METHOD /path`) that should fail with HTTP 500. */
  failures = new Set<string>()
  /** Every API request received, for assertions. */
  calls: { method: string; path: string; body: unknown }[] = []
  private requestCounter = 0

  signIn(overrides: Partial<MockUser> = {}) {
    this.user = makeUser(overrides)
    return this.user
  }

  async install(page: Page, origin: string) {
    await page.route(
      (url) => url.origin !== origin,
      (route) => route.abort('blockedbyclient'),
    )
    await page.route(
      (url) => url.origin === origin && url.pathname.startsWith(`${API_BASE}/`),
      (route) => this.handle(route),
    )
  }

  private async handle(route: Route) {
    const request = route.request()
    const method = request.method()
    const path = new URL(request.url()).pathname.slice(API_BASE.length)
    const body = parseBody(request.postData())
    this.calls.push({ method, path, body })

    if (this.failures.has(`${method} ${path}`)) {
      await reply(route, 500, { message: 'Internal server error' })
      return
    }

    const [status, payload] = this.resolve(method, path, body)
    await reply(route, status, payload)
  }

  private resolve(
    method: string,
    path: string,
    body: Record<string, unknown>,
  ): [number, Json] {
    const segments = path.split('/').filter(Boolean)
    const [root, second, third] = segments

    switch (root) {
      case 'auth':
        return this.resolveAuth(method, second ?? '', body)
      case 'users':
        return this.resolveUsers(method, second, body)
      case 'projects':
        return this.resolveProjects(method, second, third, segments[3], body)
      case 'comments':
        return [204, null]
      case 'market':
        return [200, marketSnapshot(third ?? 'unknown')]
      case 'protocol-metrics':
        return [404, { message: 'Not found' }]
      case 'analysis-requests':
        return this.resolveAnalysisRequests(method, second, body)
      case 'governance': {
        if (!third) return [200, this.proposals]
        const proposal = this.proposals.find((item) => item.onchainId === third)
        return proposal ? [200, proposal] : [404, { message: 'Proposal not found' }]
      }
      case 'reputation':
        return [
          200,
          {
            walletAddress: second,
            eligible: true,
            weight: '1000',
            factors: { expertise: 'security' },
          },
        ]
      default:
        return [404, { message: 'Not found' }]
    }
  }

  private resolveAuth(
    method: string,
    action: string,
    body: Record<string, unknown>,
  ): [number, Json] {
    const email = typeof body.email === 'string' ? body.email : ''
    switch (action) {
      case 'me':
        return this.user ? [200, { user: this.user }] : [401, { message: 'Unauthorized' }]
      case 'register':
        if (email === 'taken@example.com')
          return [409, { message: 'Email already registered' }]
        return [201, { ok: true, email }]
      case 'login':
        if (body.password !== VALID_PASSWORD)
          return [401, { message: 'Invalid credentials' }]
        return [200, { ok: true, email }]
      case 'verify-email-otp':
        if (body.code !== VALID_OTP) return [400, { message: 'Invalid or expired code' }]
        this.user = this.user ?? makeUser({ email })
        return [200, { user: this.user }]
      case 'resend-email-otp':
      case 'forgot-password':
        return [200, { ok: true }]
      case 'reset-password':
        if (body.token !== VALID_RESET_TOKEN)
          return [400, { message: 'Invalid or expired token' }]
        return [200, { ok: true }]
      case 'logout':
        this.user = null
        return [204, null]
      default:
        return [404, { message: 'Not found' }]
    }
  }

  private resolveUsers(
    method: string,
    id: string | undefined,
    body: Record<string, unknown>,
  ): [number, Json] {
    if (id === 'me') {
      if (!this.user) return [401, { message: 'Unauthorized' }]
      if (method === 'PATCH') this.user = { ...this.user, ...body }
      return [200, this.user]
    }
    return [404, { message: 'User not found' }]
  }

  private resolveProjects(
    method: string,
    idOrSlug: string | undefined,
    resource: string | undefined,
    subResource: string | undefined,
    body: Record<string, unknown>,
  ): [number, Json] {
    if (!idOrSlug) return [200, this.projects]

    if (resource === 'score') {
      const score = this.scores[idOrSlug]
      if (subResource === 'history') return [200, score ? [this.toScore(idOrSlug)] : []]
      return score ? [200, this.toScore(idOrSlug)] : [404, { message: 'Score not found' }]
    }

    if (resource === 'comments') {
      if (method === 'POST') {
        if (!this.user) return [401, { message: 'Unauthorized' }]
        const comment: MockComment = {
          id: `comment-${++this.requestCounter}`,
          projectId: idOrSlug,
          authorId: this.user.id,
          body: String(body.body ?? ''),
          createdAt: FIXED_DATE,
        }
        this.comments.push(comment)
        return [201, comment]
      }
      return [200, this.comments.filter((comment) => comment.projectId === idOrSlug)]
    }

    if (resource === 'votes') {
      return [200, { projectId: idOrSlug, round: 1, weightFor: '0', weightAgainst: '0' }]
    }

    const project = this.projects.find(
      (item) => item.slug === idOrSlug || item.id === idOrSlug,
    )
    return project ? [200, project] : [404, { message: 'Project not found' }]
  }

  private toScore(projectId: string) {
    const score = this.scores[projectId]!
    return {
      projectId,
      round: score.round,
      value: score.value,
      breakdown: { weightFor: '865', weightAgainst: '135', totalWeight: '1000' },
      creditRating: { sp: 'AA', moodys: 'Aa', group: 'investment_grade' },
    }
  }

  private resolveAnalysisRequests(
    method: string,
    id: string | undefined,
    body: Record<string, unknown>,
  ): [number, Json] {
    if (id === 'me') {
      if (!this.user) return [401, { message: 'Unauthorized' }]
      const userId = this.user.id
      return [
        200,
        { items: this.analysisRequests.filter((item) => item.userId === userId) },
      ]
    }

    if (method === 'POST') {
      if (!this.user) return [401, { message: 'Unauthorized' }]
      const created: MockAnalysisRequest = {
        id: `request-${++this.requestCounter + 100}`,
        userId: this.user.id,
        projectName: String(body.projectName ?? ''),
        projectUrl: String(body.projectUrl ?? ''),
        description: String(body.description ?? ''),
        status: 'pending',
        paymentTxHash: null,
        feeAmount: '0',
        reviewNotes: null,
        createdAt: FIXED_DATE,
        updatedAt: null,
      }
      this.analysisRequests.push(created)
      return [201, created]
    }

    if (method === 'PATCH') {
      if (!this.user || this.user.role === 'user') return [403, { message: 'Forbidden' }]
      const index = this.analysisRequests.findIndex((item) => item.id === id)
      if (index < 0) return [404, { message: 'Not found' }]
      this.analysisRequests[index] = { ...this.analysisRequests[index]!, ...body }
      return [200, this.analysisRequests[index]!]
    }

    return [200, { items: this.analysisRequests }]
  }
}

function parseBody(raw: string | null): Record<string, unknown> {
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

async function reply(route: Route, status: number, payload: Json) {
  if (status === 204) {
    await route.fulfill({ status })
    return
  }
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  })
}

export const test = base.extend<{ api: MockApi; theme: 'light' | 'dark' }>({
  theme: ['light', { option: true }],
  api: [
    async ({ page, baseURL, theme }, use) => {
      const api = new MockApi()
      await page.addInitScript((value) => {
        window.localStorage.setItem('cw-theme', value)
      }, theme)
      await api.install(page, new URL(baseURL ?? 'http://localhost').origin)
      await use(api)
    },
    { auto: true },
  ],
})

export { expect }

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 1024
