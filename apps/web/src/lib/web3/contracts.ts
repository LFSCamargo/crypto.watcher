export const projectVotingAbi = [
  {
    type: 'function',
    name: 'castVote',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'choice', type: 'uint8' }],
    outputs: [],
  },
] as const
