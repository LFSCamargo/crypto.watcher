const REJECTED_PATTERN = /user (rejected|denied)|rejected the request|request rejected/i

/** True when the wallet owner declined the request (EIP-1193 code 4001). */
export function isUserRejection(error: unknown): boolean {
  let current: unknown = error
  for (let depth = 0; current instanceof Error && depth < 5; depth += 1) {
    const code = (current as Error & { code?: unknown }).code
    if (
      current.name === 'UserRejectedRequestError' ||
      code === 4001 ||
      REJECTED_PATTERN.test(current.message)
    ) {
      return true
    }
    current = (current as Error & { cause?: unknown }).cause
  }
  return false
}

export function voteFailureMessage(error: unknown): string {
  const short =
    error instanceof Error
      ? (error as Error & { shortMessage?: string }).shortMessage
      : undefined
  return short ?? 'The network rejected the vote. Nothing was recorded.'
}
