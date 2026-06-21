/** Empty string uses same-origin requests (Vite dev proxy → API). */
const BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '' : 'http://localhost:3000')

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
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
