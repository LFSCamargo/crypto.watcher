import { parseAbi } from 'viem'

export const projectWatcherFactoryAbi = parseAbi([
  'event ProjectSubmitted(bytes32 indexed projectId, address indexed review, address indexed submitter)',
  'event BackendUpdated(address indexed previousBackend, address indexed newBackend)',
])

export const projectReviewAbi = parseAbi([
  'event AnalysisStarted(bytes32 indexed projectId, uint64 startedAt)',
  'event ReportPublished(bytes32 indexed projectId, address indexed governor, uint256 indexed round, uint8 riskScore, bytes32 reportHash, uint32 methodologyVersion)',
])

export const governorAbi = parseAbi([
  'event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)',
  'event ProposalExecuted(uint256 proposalId)',
])
