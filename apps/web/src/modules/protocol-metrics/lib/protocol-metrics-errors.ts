export class ProtocolMetricsUnavailableError extends Error {
  constructor(message = 'Protocol metrics are not available for this project.') {
    super(message)
    this.name = 'ProtocolMetricsUnavailableError'
  }
}

export function isApiUnavailable(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return (
    error.message.startsWith('API 500') ||
    error.message.startsWith('API 502') ||
    error.message.startsWith('API 503') ||
    error.message.startsWith('Failed to fetch') ||
    error.message.includes('NetworkError')
  )
}
