import { getToken, getActAs, clearToken } from './auth'

const BASE = import.meta.env.VITE_API_BASE ?? '/api'

function authHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra)
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const actAs = getActAs()
  if (actAs) headers.set('X-Act-As', actAs)
  return headers
}

// Fail-closed (INV-U8) : token absent/invalide/révoqué → purge + signal vers
// l'écran « lien d'invitation requis » (capté dans main.ts → /locked).
function onUnauthorized(): void {
  clearToken()
  window.dispatchEvent(new Event('auth:unauthorized'))
}

async function request<T>(path: string, init?: RequestInit, signal?: AbortSignal): Promise<T> {
  const headers = authHeaders(init?.headers)
  // JSON par défaut, sauf upload FormData (le navigateur pose le boundary multipart).
  if (!(init?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers, signal })
  if (res.status === 401) {
    onUnauthorized()
    throw new Error("API 401: lien d'invitation requis")
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text}`)
  }
  // 204 No Content (et 205) : pas de corps à parser.
  if (res.status === 204 || res.status === 205) {
    return undefined as T
  }
  return res.json() as Promise<T>
}

async function requestBlob(path: string): Promise<Blob> {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() })
  if (res.status === 401) {
    onUnauthorized()
    throw new Error("API 401: lien d'invitation requis")
  }
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.blob()
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, undefined, signal),
  download: (path: string) => requestBlob(path),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(
      path,
      { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined },
      signal,
    ),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, form: FormData) =>
    request<T>(path, { method: 'POST', body: form }),
}
