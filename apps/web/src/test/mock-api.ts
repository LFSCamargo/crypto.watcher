import { vi } from 'vitest'

type Reply = [status: number, payload?: unknown]
type Handler = Reply | ((body: unknown) => Reply)

/** Status `0` simulates a network failure (fetch rejects with a TypeError). */
export function mockApi(handlers: Record<string, Handler>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), 'http://localhost')
    const key = `${init?.method ?? 'GET'} ${url.pathname.replace(/^\/api/, '')}`
    const handler = handlers[key]
    const body =
      typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined
    const [status, payload] = handler
      ? typeof handler === 'function'
        ? handler(body)
        : handler
      : [404, { message: 'Not found' }]
    if (status === 0) throw new TypeError('Failed to fetch')
    return new Response(status === 204 ? null : JSON.stringify(payload ?? {}), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
