export function parseProposalId(onchainId: string): bigint | undefined {
  if (!/^\d+$/.test(onchainId)) return undefined
  return BigInt(onchainId)
}
