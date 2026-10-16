export type MilestoneStatus = 'done' | 'next' | 'later'

export interface GovernanceMilestone {
  title: string
  description: string
  status: MilestoneStatus
  label: string
}

/** Honest launch status of protocol governance; update when a milestone ships. */
export const governanceMilestones: GovernanceMilestone[] = [
  {
    title: 'Governance contracts written and tested',
    description:
      'CWT (ERC20Votes), the Governor and the Timelock exist and are covered by Foundry unit and fuzz tests.',
    status: 'done',
    label: 'Built',
  },
  {
    title: 'Proposal pages and voting in the app',
    description:
      'This page indexes proposals and lets holders vote as soon as a Governor contract is configured.',
    status: 'done',
    label: 'Built',
  },
  {
    title: 'Deploy the governance contracts',
    description:
      'Public deployment of CWT, Governor and Timelock, with deployer admin rights renounced.',
    status: 'next',
    label: 'Not scheduled',
  },
  {
    title: 'CWT minted and distributed',
    description:
      'Supply moves to the treasury and council so no single key controls governance. No mint date is set.',
    status: 'later',
    label: 'Not scheduled',
  },
  {
    title: 'Proposals and voting open',
    description:
      'Holders propose and vote on the reviewer roster, methodology and accountability rules.',
    status: 'later',
    label: 'After mint',
  },
  {
    title: 'Delegation at scale',
    description: 'Delegated protocol governance and broader council policy votes.',
    status: 'later',
    label: 'Phase 2',
  },
]
