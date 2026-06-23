// Domain types mirror docs/BACKEND.mdc. Keep in sync with the API OpenAPI schema.

export type ProjectState = 'in_analysis' | 'ready' | 'voting' | 'closed' | 'analyzed'

export type AnalysisRequestStatus =
  | 'pending'
  | 'paid'
  | 'in_review'
  | 'approved'
  | 'rejected'

export interface Project {
  id: string
  slug: string
  name: string
  description?: string | null
  chainId: number
  tokenAddress?: string | null
  state: ProjectState
  votingContractAddress?: string | null
  score?: number
  createdAt: string
}

export interface User {
  id: string
  walletAddress: string | null
  email: string | null
  publicKey: string | null
  displayName: string | null
  nickname: string | null
  avatarUrl: string | null
  bio: string | null
  xAccount: string | null
  role: 'user' | 'team' | 'admin'
  createdAt: string
}

export interface AuthUserResponse {
  user: User
}

export interface NonceResponse {
  nonce: string
  message: string
}

export interface RegisterBody {
  email: string
  password: string
  nickname?: string
}

export interface LoginBody {
  email: string
  password: string
}

export interface AnalysisRequest {
  id: string
  userId: string
  projectName: string
  projectUrl: string
  description: string | null
  status: AnalysisRequestStatus
  paymentTxHash: string | null
  feeAmount: string
  reviewNotes: string | null
  createdAt: string
}

export interface Comment {
  id: string
  projectId: string
  authorId: string
  body: string
  createdAt: string
}

export interface VoteTally {
  projectId: string
  round: number
  weightFor: string
  weightAgainst: string
}

export interface VoteEligibility {
  address: string
  eligible: boolean
  weight: string
}

export interface Score {
  projectId: string
  round: number
  value: string
  breakdown: {
    weightFor: string
    weightAgainst: string
    totalWeight: string
  }
  creditRating: {
    sp: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C' | 'D'
    moodys: 'Aaa' | 'Aa' | 'A' | 'Baa' | 'Ba' | 'B' | 'Caa' | 'Ca' | 'C' | 'D'
    group: 'investment_grade' | 'speculative_grade'
  }
}

export interface Reputation {
  walletAddress: string
  eligible: boolean
  weight: string
  factors: Record<string, unknown> | null
}

export interface GovernanceProposal {
  id: string
  onchainId: string
  proposerAddress: string
  title: string
  description: string | null
  state: 'pending' | 'active' | 'succeeded' | 'defeated' | 'executed'
  startBlock: string | null
  endBlock: string | null
}
