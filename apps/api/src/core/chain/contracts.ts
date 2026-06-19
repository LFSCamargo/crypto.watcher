import { parseAbi } from 'viem'

export const projectVotingFactoryAbi = parseAbi([
  'event ProjectVotingDeployed(bytes32 indexed projectId, address indexed voting)',
])

export const projectVotingAbi = parseAbi([
  'event VotingOpened(bytes32 indexed projectId, uint64 openedAt, uint64 closesAt)',
  'event Voted(bytes32 indexed projectId, address indexed voter, uint8 choice, uint256 weight)',
  'event VotingClosed(bytes32 indexed projectId, uint64 closedAt, uint256 weightFor, uint256 weightAgainst)',
])

export const governorAbi = parseAbi([
  'event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)',
  'event ProposalExecuted(uint256 proposalId)',
])
