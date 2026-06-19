import { db } from '../db'

export const chainEventsRepository = {
  async record(input: {
    chainId: number
    contractAddress: string
    eventName: string
    txHash: string
    logIndex: number
    blockNumber: string
    payload: Record<string, unknown>
  }) {
    return db
      .insertInto('chain_events')
      .values({
        chain_id: input.chainId,
        contract_address: input.contractAddress.toLowerCase(),
        event_name: input.eventName,
        tx_hash: input.txHash,
        log_index: input.logIndex,
        block_number: input.blockNumber,
        payload: input.payload,
      })
      .onConflict((oc) => oc.columns(['tx_hash', 'log_index']).doNothing())
      .returningAll()
      .executeTakeFirst()
  },
}
