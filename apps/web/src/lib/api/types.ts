// Domain types mirror docs/BACKEND.mdc. Keep in sync with the API OpenAPI schema.

export type ProjectState =
  | 'in_analysis'
  | 'ready'
  | 'voting'
  | 'closed'
  | 'analyzed'

export interface Project {
  id: string
  slug: string
  name: string
  description?: string
  chainId: number
  tokenAddress?: string
  state: ProjectState
  votingContractAddress?: string
  score?: number
  createdAt: string
}
