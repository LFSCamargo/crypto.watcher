import type { ProjectState } from '../../../lib/api/types'

/** Mirrors the API's allowed lifecycle transitions; the server still enforces them. */
export const NEXT_PROJECT_STATE: Record<ProjectState, ProjectState | undefined> = {
  in_analysis: 'ready',
  ready: 'voting',
  voting: 'closed',
  closed: 'analyzed',
  analyzed: undefined,
}
