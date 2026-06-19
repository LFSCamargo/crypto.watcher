import { chainEventsService } from './events.service'

export interface ChainLogInput {
  chainId: number
  contractAddress: string
  eventName: string
  txHash: string
  logIndex: number
  blockNumber: bigint
  payload: Record<string, unknown>
}

export const chainSyncService = {
  async recordLog(input: ChainLogInput) {
    return chainEventsService.recordOnce({
      ...input,
      blockNumber: input.blockNumber.toString(),
    })
  },
}
