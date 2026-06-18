import type { Generated } from 'kysely'

// DB types mirror docs/BACKEND.mdc "SQL Data Modeling". Keep in sync.

export type ProjectState =
  | 'in_analysis'
  | 'ready'
  | 'voting'
  | 'closed'
  | 'analyzed'

export interface UsersTable {
  id: Generated<string>
  wallet_address: string
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
  deleted_at: Date | null
  created_at: Generated<Date>
}

export interface Database {
  users: UsersTable
  projects: ProjectsTable
  comments: CommentsTable
}
