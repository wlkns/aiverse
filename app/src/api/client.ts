import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

// The Worker that serves the app also answers /api/*, so the API is same-origin.
export const API_URL = '/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError'
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Something went wrong.'
}

// The API expects the base64-encoded token: Authorization: Bearer btoa(token)
function authHeader(token: string): string {
  try {
    return `Bearer ${btoa(token)}`
  } catch {
    throw new ApiError('The access token contains unsupported characters.', 400)
  }
}

interface ApiRequestInit extends RequestInit {
  /** Use this token instead of the stored one (e.g. when verifying a new token). */
  token?: string
}

export async function apiFetch(path: string, init: ApiRequestInit = {}): Promise<Response> {
  const auth = useAuthStore()
  const { token = auth.token, ...rest } = init
  const headers = new Headers(rest.headers)
  headers.set('Authorization', authHeader(token))
  if (rest.body) headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...rest, headers })
  } catch (err) {
    if (isAbortError(err)) throw err
    throw new ApiError('Could not reach the API. Check your connection and try again.', 0)
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message =
      typeof body?.error === 'string' ? body.error : `Request failed (${response.status}).`

    // A stored token that stops working (e.g. rotated) locks the app again.
    if (response.status === 401 && init.token === undefined) auth.lock()

    throw new ApiError(message, response.status)
  }

  return response
}

/** Merge the user's model settings into a tool request body. */
export function withModelOptions<T extends object>(body: T): T {
  return { ...body, ...useSettingsStore().modelOptions }
}

export async function postJson<T>(path: string, body: object, signal?: AbortSignal): Promise<T> {
  const response = await apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(withModelOptions(body)),
    signal,
  })
  return response.json() as Promise<T>
}

export async function verifyToken(token: string): Promise<void> {
  await apiFetch('/verify', { method: 'POST', token })
}
