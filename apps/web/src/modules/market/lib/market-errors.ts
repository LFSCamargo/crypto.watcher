export class MarketUnavailableError extends Error {
  constructor(message = 'Price data is not available for this project') {
    super(message)
    this.name = 'MarketUnavailableError'
  }
}

export function isApiUnavailable(error: unknown): boolean {
  if (error instanceof TypeError) return true
  if (error instanceof Error) {
    return (
      error.message.includes('Failed to fetch') ||
      error.message.startsWith('API 502') ||
      error.message.startsWith('API 503')
    )
  }
  return false
}
