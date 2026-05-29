import { Result } from '../../shared/Result'

export class BaseHttpAdapter {
  protected getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('zehla_session_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  protected async request<T>(
    url: string,
    options: RequestInit
  ): Promise<Result<T, Error>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `HTTP Error: ${response.status}`
        return Result.fail(new Error(errorMsg))
      }

      return Result.ok(data as T)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Network Connection Error'))
    }
  }

  protected async post<T>(url: string, body: any): Promise<Result<T, Error>> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  protected async get<T>(url: string): Promise<Result<T, Error>> {
    return this.request<T>(url, {
      method: 'GET',
    })
  }
}
