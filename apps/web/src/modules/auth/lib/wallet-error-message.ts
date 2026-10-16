import { authErrorMessage } from './auth-error-message'

const REJECTED_PATTERN = /user (rejected|denied)|rejected the request|request rejected/i

/** User-facing message for a failed wallet connect / sign-in-with-wallet attempt. */
export function walletErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as Error & { code?: unknown }).code
    if (
      error.name === 'UserRejectedRequestError' ||
      code === 4001 ||
      REJECTED_PATTERN.test(error.message)
    ) {
      return 'Signature request cancelled — nothing was linked.'
    }
    if (
      error.name === 'ConnectorNotConnectedError' ||
      /connect a wallet first/i.test(error.message)
    ) {
      return 'Connect a wallet first, then try again.'
    }
  }
  return authErrorMessage(
    error,
    {
      401: 'The signature couldn’t be verified. Please try again.',
      409: 'This wallet is already linked to another account.',
    },
    'We couldn’t link this wallet. Please try again.',
  )
}
