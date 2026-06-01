import { Result } from '../shared/Result'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiClientConfig {
  baseUrl?: string
  getToken?: () => string | null
}

let config: ApiClientConfig = {
  baseUrl: '',
  getToken: () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('zehla_session_token')
  },
}

export function configureApiClient(cfg: ApiClientConfig): void {
  config = { ...config, ...cfg }
}

export async function apiRequest<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
): Promise<Result<T, Error>> {
  try {
    const token = config.getToken?.() ?? null
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const url = `${config.baseUrl ?? ''}${path}`
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : {}

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('zehla_session_token')
          localStorage.removeItem('zehla_pousada_id')
        }
      }
      const errorMsg = data?.error || `HTTP ${response.status}`
      return Result.fail(new Error(errorMsg))
    }

    return Result.ok(data as T)
  } catch (err) {
    return Result.fail(new Error('Erro de conexão. Verifique sua internet.'))
  }
}

export function apiGet<T>(path: string): Promise<Result<T, Error>> {
  return apiRequest<T>('GET', path)
}

export function apiPost<T>(path: string, body?: unknown): Promise<Result<T, Error>> {
  return apiRequest<T>('POST', path, body)
}
