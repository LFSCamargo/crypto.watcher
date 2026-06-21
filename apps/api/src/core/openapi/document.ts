import { OpenApiGeneratorV31, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
  AuthUserResponseSchema,
  NonceBodySchema,
  NonceResponseSchema,
  VerifyBodySchema,
} from '../../modules/auth/schemas'
import {
  CommentParamsSchema,
  CommentSchema,
  CreateCommentBodySchema,
  ProjectCommentsParamsSchema,
} from '../../modules/comments/schemas'
import {
  GovernanceProposalParamsSchema,
  GovernanceProposalSchema,
  ListGovernanceProposalsQuerySchema,
} from '../../modules/governance/schemas'
import {
  MarketProjectParamsSchema,
  MarketSnapshotSchema,
} from '../../modules/market/schemas'
import {
  CreateProjectBodySchema,
  ErrorResponseSchema,
  ProjectIdParamsSchema,
  ListProjectsQuerySchema,
  ProjectParamsSchema,
  ProjectSchema,
  TransitionProjectBodySchema,
  UpdateProjectBodySchema,
} from '../../modules/projects/schemas'
import {
  ReputationParamsSchema,
  ReputationSchema,
} from '../../modules/reputation/schemas'
import {
  ScoreProjectParamsSchema,
  ScoreSchema,
} from '../../modules/scoring/schemas'
import {
  AddressParamsSchema,
  UpdateMeBodySchema,
  UserSchema,
} from '../../modules/users/schemas'
import {
  VoteEligibilityQuerySchema,
  VoteEligibilitySchema,
  VoteTallySchema,
  VotingProjectParamsSchema,
} from '../../modules/voting/schemas'

const registry = new OpenAPIRegistry()

registry.register('Project', ProjectSchema)
registry.register('ErrorResponse', ErrorResponseSchema)
registry.register('User', UserSchema)
registry.register('Comment', CommentSchema)
registry.register('VoteTally', VoteTallySchema)
registry.register('VoteEligibility', VoteEligibilitySchema)
registry.register('Score', ScoreSchema)
registry.register('Reputation', ReputationSchema)
registry.register('GovernanceProposal', GovernanceProposalSchema)

const json = <TSchema>(schema: TSchema) => ({
  content: {
    'application/json': { schema },
  },
})

registry.registerPath({
  method: 'get',
  path: '/projects',
  tags: ['projects'],
  request: {
    query: ListProjectsQuerySchema,
  },
  responses: {
    200: {
      description: 'Project list',
      content: {
        'application/json': {
          schema: ProjectSchema.array(),
        },
      },
    },
  },
})

registry.registerPath({
  method: 'patch',
  path: '/projects/{id}',
  tags: ['projects'],
  request: {
    params: ProjectIdParamsSchema,
    body: json(UpdateProjectBodySchema),
  },
  responses: { 200: { description: 'Project updated', ...json(ProjectSchema) } },
})

registry.registerPath({
  method: 'post',
  path: '/projects/{id}/transition',
  tags: ['projects'],
  request: {
    params: ProjectIdParamsSchema,
    body: json(TransitionProjectBodySchema),
  },
  responses: { 200: { description: 'Project transitioned', ...json(ProjectSchema) } },
})

registry.registerPath({
  method: 'post',
  path: '/auth/nonce',
  tags: ['auth'],
  request: { body: json(NonceBodySchema) },
  responses: { 200: { description: 'Nonce created', ...json(NonceResponseSchema) } },
})

registry.registerPath({
  method: 'post',
  path: '/auth/verify',
  tags: ['auth'],
  request: { body: json(VerifyBodySchema) },
  responses: { 200: { description: 'Wallet verified', ...json(AuthUserResponseSchema) } },
})

registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  tags: ['auth'],
  responses: { 204: { description: 'Logged out' } },
})

registry.registerPath({
  method: 'get',
  path: '/auth/me',
  tags: ['auth'],
  responses: { 200: { description: 'Current user', ...json(AuthUserResponseSchema) } },
})

registry.registerPath({
  method: 'get',
  path: '/users/{identifier}',
  tags: ['users'],
  request: { params: AddressParamsSchema },
  responses: { 200: { description: 'User profile', ...json(UserSchema) } },
})

registry.registerPath({
  method: 'patch',
  path: '/users/me',
  tags: ['users'],
  request: { body: json(UpdateMeBodySchema) },
  responses: { 200: { description: 'Updated user profile', ...json(UserSchema) } },
})

registry.registerPath({
  method: 'get',
  path: '/projects/{id}/comments',
  tags: ['comments'],
  request: { params: ProjectCommentsParamsSchema },
  responses: { 200: { description: 'Project comments', ...json(CommentSchema.array()) } },
})

registry.registerPath({
  method: 'post',
  path: '/projects/{id}/comments',
  tags: ['comments'],
  request: {
    params: ProjectCommentsParamsSchema,
    body: json(CreateCommentBodySchema),
  },
  responses: { 201: { description: 'Comment created', ...json(CommentSchema) } },
})

registry.registerPath({
  method: 'delete',
  path: '/comments/{id}',
  tags: ['comments'],
  request: { params: CommentParamsSchema },
  responses: { 204: { description: 'Comment deleted' } },
})

registry.registerPath({
  method: 'get',
  path: '/projects/{id}/votes',
  tags: ['voting'],
  request: { params: VotingProjectParamsSchema },
  responses: { 200: { description: 'Project vote tally', ...json(VoteTallySchema) } },
})

registry.registerPath({
  method: 'get',
  path: '/projects/{id}/votes/eligibility',
  tags: ['voting'],
  request: { params: VotingProjectParamsSchema, query: VoteEligibilityQuerySchema },
  responses: { 200: { description: 'Vote eligibility', ...json(VoteEligibilitySchema) } },
})

registry.registerPath({
  method: 'get',
  path: '/projects/{id}/score',
  tags: ['scoring'],
  request: { params: ScoreProjectParamsSchema },
  responses: { 200: { description: 'Current project score', ...json(ScoreSchema) } },
})

registry.registerPath({
  method: 'get',
  path: '/projects/{id}/score/history',
  tags: ['scoring'],
  request: { params: ScoreProjectParamsSchema },
  responses: {
    200: { description: 'Project score history', ...json(ScoreSchema.array()) },
  },
})

registry.registerPath({
  method: 'get',
  path: '/reputation/{address}',
  tags: ['reputation'],
  request: { params: ReputationParamsSchema },
  responses: { 200: { description: 'Wallet reputation', ...json(ReputationSchema) } },
})

registry.registerPath({
  method: 'get',
  path: '/governance/proposals',
  tags: ['governance'],
  request: { query: ListGovernanceProposalsQuerySchema },
  responses: {
    200: {
      description: 'Governance proposals',
      ...json(GovernanceProposalSchema.array()),
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/governance/proposals/{onchainId}',
  tags: ['governance'],
  request: { params: GovernanceProposalParamsSchema },
  responses: {
    200: { description: 'Governance proposal detail', ...json(GovernanceProposalSchema) },
  },
})

registry.registerPath({
  method: 'get',
  path: '/projects/{slug}',
  tags: ['projects'],
  request: {
    params: ProjectParamsSchema,
  },
  responses: {
    200: {
      description: 'Project detail',
      content: {
        'application/json': {
          schema: ProjectSchema,
        },
      },
    },
    404: {
      description: 'Project not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/market/projects/{slug}',
  tags: ['market'],
  request: {
    params: MarketProjectParamsSchema,
  },
  responses: {
    200: {
      description: 'Cached USD price snapshot and 7-day history',
      content: {
        'application/json': {
          schema: MarketSnapshotSchema,
        },
      },
    },
    404: {
      description: 'Price data unavailable for this project',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/projects',
  tags: ['projects'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateProjectBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Project created',
      content: {
        'application/json': {
          schema: ProjectSchema,
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

const generator = new OpenApiGeneratorV31(registry.definitions)

export const openApiDocument = generator.generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'Crypto Watcher API',
    version: '0.0.0',
    description: 'Risk-analysis API for crypto projects.',
  },
  servers: [{ url: 'http://localhost:3000' }],
})
