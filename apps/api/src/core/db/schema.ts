import type { Generated, JSONColumnType } from 'kysely'

// DB types mirror docs/BACKEND.mdc "SQL Data Modeling". Keep in sync.

export type ProjectState = 'in_analysis' | 'ready' | 'voting' | 'closed' | 'analyzed'
export type GovernanceProposalState =
  | 'pending'
  | 'active'
  | 'succeeded'
  | 'defeated'
  | 'executed'
export type RewardType = 'reward' | 'slash'
export type SessionType = 'wallet' | 'email' | 'reset'
export type AnalysisRequestStatus =
  | 'pending'
  | 'paid'
  | 'in_review'
  | 'approved'
  | 'rejected'

export interface UsersTable {
  id: Generated<string>
  wallet_address: string | null
  email: string | null
  password_hash: string | null
  public_key: string | null
  x_account: string | null
  nickname: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: Generated<'user' | 'team' | 'admin'>
  created_at: Generated<Date>
  updated_at: Date | null
}

export interface ProjectsTable {
  id: Generated<string>
  slug: string
  name: string
  description: string | null
  chain_id: number
  token_address: string | null
  state: Generated<ProjectState>
  voting_contract_address: string | null
  submitted_by: string | null
  created_at: Generated<Date>
  updated_at: Date | null
}

export interface CommentsTable {
  id: Generated<string>
  project_id: string
  author_id: string
  body: string
  comment_fee_paid: Generated<boolean>
  deleted_at: Date | null
  created_at: Generated<Date>
}

export interface SessionsTable {
  id: Generated<string>
  user_id: string
  session_type: Generated<SessionType>
  nonce: string | null
  expires_at: Date
  revoked_at: Date | null
  created_at: Generated<Date>
}

export interface AnalysisRequestsTable {
  id: Generated<string>
  user_id: string
  project_name: string
  project_url: string
  description: string
  status: Generated<AnalysisRequestStatus>
  payment_tx_hash: string | null
  fee_amount: string
  review_notes: string | null
  created_at: Generated<Date>
  updated_at: Date | null
}

export interface VotesTable {
  id: Generated<string>
  project_id: string
  round: Generated<number>
  voter_address: string
  choice: number
  weight: string
  tx_hash: string
  block_number: string
  created_at: Generated<Date>
}

export interface ScoresTable {
  id: Generated<string>
  project_id: string
  round: number
  value: string
  breakdown: JSONColumnType<
    {
      weightFor: string
      weightAgainst: string
      totalWeight: string
    },
    {
      weightFor: string
      weightAgainst: string
      totalWeight: string
    },
    {
      weightFor: string
      weightAgainst: string
      totalWeight: string
    }
  >
  created_at: Generated<Date>
}

export interface ReputationTable {
  wallet_address: string
  eligible: Generated<boolean>
  weight: Generated<string>
  factors: JSONColumnType<
    Record<string, unknown> | null,
    Record<string, unknown> | null,
    Record<string, unknown> | null
  >
  updated_at: Date | null
  created_at: Generated<Date>
}

export interface GovernanceProposalsTable {
  id: Generated<string>
  onchain_id: string
  proposer_address: string
  title: string
  description: string | null
  state: GovernanceProposalState
  start_block: string | null
  end_block: string | null
  created_at: Generated<Date>
  updated_at: Date | null
}

export interface ChainEventsTable {
  id: Generated<string>
  chain_id: number
  contract_address: string
  event_name: string
  tx_hash: string
  log_index: number
  block_number: string
  payload: JSONColumnType<
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>
  >
  created_at: Generated<Date>
}

export interface MarketCacheTable {
  slug: string
  coingecko_id: string
  snapshot: JSONColumnType<
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>
  >
  fetched_at: Date
  expires_at: Date
  updated_at: Generated<Date>
}

export interface Database {
  users: UsersTable
  sessions: SessionsTable
  projects: ProjectsTable
  comments: CommentsTable
  analysis_requests: AnalysisRequestsTable
  votes: VotesTable
  scores: ScoresTable
  reputation: ReputationTable
  governance_proposals: GovernanceProposalsTable
  chain_events: ChainEventsTable
  market_cache: MarketCacheTable
}
