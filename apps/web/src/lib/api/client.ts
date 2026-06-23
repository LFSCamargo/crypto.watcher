/** Dev: same-origin + Vite proxy. Prod (Docker/Coolify): /api via nginx. */
const resolveApiBaseUrl = (): string => {
  const fromEnv = import.meta.env.VITE_API_URL?.trim()
  if (fromEnv) return fromEnv
  return import.meta.env.DEV ? '' : '/api'
}

const BASE_URL = resolveApiBaseUrl()

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    let message = `API ${res.status}: ${res.statusText}`
    let details: unknown
    try {
      const body = (await res.json()) as { message?: string; details?: unknown }
      if (body.message) message = body.message
      details = body.details
    } catch {
      // Non-JSON error body (e.g. nginx HTML)
    }
    throw new ApiError(res.status, message, details)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const apiPost = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  })

export const apiPatch = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

export const apiDelete = <T>(path: string) =>
  apiFetch<T>(path, {
    method: 'DELETE',
  })
