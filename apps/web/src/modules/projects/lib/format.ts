import type { ProjectState } from '../../../lib/api/types'

const LABELS: Record<ProjectState, string> = {
  in_analysis: 'In analysis',
  ready: 'Ready for voting',
  voting: 'Voting',
  closed: 'Voting closed',
  analyzed: 'Analyzed',
}

export const formatProjectState = (state: ProjectState): string => LABELS[state]
