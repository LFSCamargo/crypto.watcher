import type { Selectable } from 'kysely'
import type {
  GovernanceProposalsTable,
  GovernanceProposalState,
} from '../../core/db/schema'
import { governanceRepository } from './governance.repository'

type ProposalRow = Selectable<GovernanceProposalsTable>

const mapProposal = (proposal: ProposalRow) => ({
  id: proposal.id,
  onchainId: proposal.onchain_id,
  proposerAddress: proposal.proposer_address,
  title: proposal.title,
  description: proposal.description,
  state: proposal.state,
  startBlock: proposal.start_block,
  endBlock: proposal.end_block,
})

export const governanceService = {
  async list(filters: { state?: GovernanceProposalState }) {
    return (await governanceRepository.list(filters)).map(mapProposal)
  },

  async getByOnchainId(onchainId: string) {
    const proposal = await governanceRepository.getByOnchainId(onchainId)
    return proposal ? mapProposal(proposal) : undefined
  },
}
