import { chainEventsRepository } from './events.repository'

export const chainEventKey = (txHash: string, logIndex: number): string =>
  `${txHash.toLowerCase()}:${logIndex}`

export const chainEventsService = {
  async recordOnce(input: {
    chainId: number
    contractAddress: string
    eventName: string
    txHash: string
    logIndex: number
    blockNumber: string
    payload: Record<string, unknown>
  }) {
    const event = await chainEventsRepository.record(input)
    return { inserted: Boolean(event), event }
  },
}
