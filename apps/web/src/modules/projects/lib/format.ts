import type { ProjectState } from '../../../lib/api/types'

type ProjectStateTone = 'info' | 'warning' | 'success'

interface ProjectStateMeta {
  label: string
  tone: ProjectStateTone
  /** Index into `PROJECT_LIFECYCLE_STEPS` of the step currently in progress. */
  step: number
  description: string
}

export const PROJECT_LIFECYCLE_STEPS = [
  'Review requested',
  'In analysis',
  'Governor review',
  'Report published',
  'Score shown',
] as const

const META: Record<ProjectState, ProjectStateMeta> = {
  in_analysis: {
    label: 'In analysis',
    tone: 'info',
    step: 1,
    description: 'Investigators are gathering evidence. There is no official score yet.',
  },
  ready: {
    label: 'Awaiting governor review',
    tone: 'warning',
    step: 2,
    description:
      'Analysis is complete and the project is queued for the governor council.',
  },
  voting: {
    label: 'Governor review',
    tone: 'warning',
    step: 2,
    description: 'Governors are reviewing the findings before a score is published.',
  },
  closed: {
    label: 'Report pending',
    tone: 'warning',
    step: 3,
    description:
      'The council review has closed. The report and score are being finalized.',
  },
  analyzed: {
    label: 'Report published',
    tone: 'success',
    step: 4,
    description:
      'The governor council published its report. The score shown is official.',
  },
}

export const projectStateMeta = (state: ProjectState): ProjectStateMeta => META[state]

export const formatProjectState = (state: ProjectState): string => META[state].label
