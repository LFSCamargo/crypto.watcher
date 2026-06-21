type QueryChain = {
  where: (...args: unknown[]) => QueryChain
  select: (columns: string[]) => QueryChain
  selectAll: () => QueryChain
  limit: (count: number) => QueryChain
  execute: () => Promise<unknown[]>
  executeTakeFirst: () => Promise<unknown>
}

function createChain(): QueryChain {
  const chain: QueryChain = {
    where: () => chain,
    select: () => chain,
    selectAll: () => chain,
    limit: () => chain,
    execute: async () => [],
    executeTakeFirst: async () => null,
  }
  return chain
}

/** Minimal Kysely-like stub for analyzer fixture files. */
export const db = {
  selectFrom: (_table: string): QueryChain => createChain(),
}
